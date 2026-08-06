import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  defaultPermissionsForRole,
  hasPermission,
  PERMISSIONS,
  sanitizePermissions,
} from "../auth/permissions";
import {
  canDeleteUser,
  isAdminLevel,
  normalizeStoredRole,
  roleRank as rbacRoleRank,
} from "../auth/roles";
import { JWT_SECRET } from "../config/config";
import User, { hashPassword, isBcryptHash, joinApellidos } from "../models/User";
import { removeStoredPhoto, uploadedFileUrl } from "../utils/uploadHelpers";

const PUBLIC_USER_FIELDS = "-password -resetToken -resetTokenExp";
/** Campos visibles para operadores (sin correo ni contacto). */
const DIRECTORY_USER_FIELDS =
  "nombre apellido apellidoPaterno apellidoMaterno genero rol activo photoUrl permissions updatedAt";

const normalizeRole = (rol: string) => normalizeStoredRole(rol);

/** Normaliza género a valores del enum del modelo. */
const normalizeGenero = (value: unknown): "" | "femenino" | "masculino" => {
  const raw = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  if (
    raw === "f" ||
    raw === "femenino" ||
    raw === "femenina" ||
    raw === "mujer" ||
    raw === "female"
  ) {
    return "femenino";
  }
  if (
    raw === "m" ||
    raw === "masculino" ||
    raw === "hombre" ||
    raw === "male" ||
    raw === "varon"
  ) {
    return "masculino";
  }
  return "";
};

/** Resuelve apellidos desde el body (soporta campos nuevos o el apellido legado). */
const resolveApellidos = (body: {
  apellido?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
}) => {
  const hasSplit =
    body.apellidoPaterno !== undefined || body.apellidoMaterno !== undefined;
  if (hasSplit) {
    const apellidoPaterno = String(body.apellidoPaterno ?? "").trim();
    const apellidoMaterno = String(body.apellidoMaterno ?? "").trim();
    return {
      apellidoPaterno,
      apellidoMaterno,
      apellido: joinApellidos(apellidoPaterno, apellidoMaterno),
    };
  }
  const apellido = String(body.apellido ?? "").trim();
  return {
    apellidoPaterno: apellido,
    apellidoMaterno: "",
    apellido,
  };
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const admin = isAdminLevel(authUser?.rol);

    const filter: Record<string, unknown> = {};
    const activoQ = String(req.query.activo ?? "").toLowerCase();
    if (activoQ === "true" || activoQ === "1") {
      // Incluye documentos antiguos sin el campo (se tratan como activos).
      filter.$or = [{ activo: true }, { activo: { $exists: false } }];
    } else if (activoQ === "false" || activoQ === "0") {
      filter.activo = false;
    }

    const users = await User.find(filter)
      .select(admin ? PUBLIC_USER_FIELDS : DIRECTORY_USER_FIELDS)
      .lean();

    const byName = (a: any, b: any) => {
      const an = `${a.nombre || ""} ${a.apellido || ""}`.trim().toLocaleLowerCase("es");
      const bn = `${b.nombre || ""} ${b.apellido || ""}`.trim().toLocaleLowerCase("es");
      return an.localeCompare(bn, "es");
    };
    users.sort((a, b) => {
      const d = rbacRoleRank(a.rol) - rbacRoleRank(b.rol);
      return d !== 0 ? d : byName(a, b);
    });

    return res.json(
      users.map((u: any) => ({
        ...u,
        id: String(u._id || ""),
        _id: String(u._id || ""),
        genero: u.genero || "",
        permissions: Array.isArray(u.permissions) ? u.permissions : [],
        effectivePermissions: Array.from(
          new Set([
            ...defaultPermissionsForRole(u.rol),
            ...(Array.isArray(u.permissions) ? u.permissions : []),
          ])
        ),
      }))
    );
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || id.length !== 24) {
    return res.status(400).json({ message: "ID de usuario inválido" });
  }
  try {
    const authUser = (req as any).user;
    const authId = String(authUser?._id || authUser?.id || "");
    const admin = isAdminLevel(authUser?.rol);
    const isSelf = Boolean(authId && authId === String(id));

    if (!admin && !isSelf) {
      return res.status(403).json({
        message: "No puedes ver el perfil de otro usuario",
      });
    }

    const user = await User.findById(id).select(PUBLIC_USER_FIELDS);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol, contacto, activo, origen, permissions } = req.body;
    const apellidos = resolveApellidos(req.body);
    const authUser = (req as any).user;

    if (!nombre || !apellidos.apellidoPaterno || !rol) {
      return res.status(400).json({
        message: "Nombre, apellido paterno y rol son obligatorios",
      });
    }

    const role = normalizeRole(rol);
    if (!role) {
      return res.status(400).json({
        message:
          "Rol no válido. Usa Administrador, Usuario, Operador o Ayudante General",
      });
    }

    let nextPermissions = sanitizePermissions(permissions);
    if (nextPermissions.length > 0 && !isAdminLevel(authUser?.rol)) {
      return res.status(403).json({
        message: "No tienes permiso para asignar permisos",
      });
    }

    const emailTrim = email ? String(email).trim().toLowerCase() : "";
    const passwordTrim = password ? String(password).trim() : "";
    const origenTrim = origen ? String(origen).trim().toLowerCase() : "";
    const fromCorporativoHm = origenTrim === "corporativo-hm";

    // Nombre/apellidos bastan al crear. Correo/contraseña/contacto son opcionales
    // (si se envían, se guardan; el acceso se puede completar al editar).
    // Importante: no guardar email vacío; el índice unique+sparse solo aplica si hay correo.
    if (emailTrim) {
      const existingUser = await User.findOne({ email: emailTrim });
      if (existingUser) {
        return res.status(400).json({
          message: "Ese correo ya está registrado en otro usuario",
        });
      }
    }

    if (passwordTrim && passwordTrim.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Sync desde Corporativo HM: email sin password (perfil aparece en app; login se completa después).
    if (!fromCorporativoHm && ((emailTrim && !passwordTrim) || (!emailTrim && passwordTrim))) {
      return res.status(400).json({
        message: "Si das acceso, envía correo y contraseña juntos",
      });
    }

    const hashedPassword = passwordTrim ? await hashPassword(passwordTrim) : undefined;
    const isActivo = activo === undefined || activo === null ? true : Boolean(activo);

    const user = await User.create({
      nombre: String(nombre).trim(),
      apellido: apellidos.apellido,
      apellidoPaterno: apellidos.apellidoPaterno,
      apellidoMaterno: apellidos.apellidoMaterno,
      genero: normalizeGenero(req.body.genero),
      rol: role,
      activo: isActivo,
      permissions: nextPermissions,
      ...(emailTrim ? { email: emailTrim } : {}),
      ...(hashedPassword ? { password: hashedPassword } : {}),
      ...(contacto != null && String(contacto).trim()
        ? { contacto: String(contacto).trim() }
        : {}),
      ...(fromCorporativoHm ? { origen: "corporativo-hm" } : {}),
    });

    const userObj = user.toObject();
    delete (userObj as { password?: string }).password;
    return res.status(201).json(userObj);
  } catch (error: any) {
    console.error("Error creando usuario ", error);
    if (error?.code === 11000) {
      return res.status(400).json({
        message: "Ese correo ya está registrado en otro usuario",
      });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors || {})
          .map((e: any) => e.message)
          .join(". ") || "Datos inválidos",
      });
    }
    return res.status(500).json({
      message: "Error creando usuario",
    });
  }
};

// Registrar usuario (público): siempre Operador — nunca Admin
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, contacto } = req.body;
    const apellidos = resolveApellidos(req.body);

    if (!nombre || !apellidos.apellidoPaterno || !email || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Seguridad: el cliente no puede elegirse Administrador vía /register
    const requested = normalizeRole(String(req.body.rol || "Operador"));
    if (requested && isAdminLevel(requested)) {
      return res.status(403).json({
        message: "No es posible auto-registrarse como administrador. Pide alta a un admin.",
      });
    }
    const role = "Operador";

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Ese correo ya está registrado en otro usuario",
      });
    }

    const hashedPassword = await hashPassword(String(password).trim());

    const newUser = await User.create({
      nombre,
      apellido: apellidos.apellido,
      apellidoPaterno: apellidos.apellidoPaterno,
      apellidoMaterno: apellidos.apellidoMaterno,
      genero: normalizeGenero(req.body.genero),
      email: email.toLowerCase(),
      password: hashedPassword,
      rol: role,
      contacto,
      photoUrl: uploadedFileUrl(req.file),
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, rol: newUser.rol },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      _id: newUser._id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      apellidoPaterno: newUser.apellidoPaterno || "",
      apellidoMaterno: newUser.apellidoMaterno || "",
      genero: newUser.genero || "",
      email: newUser.email,
      rol: newUser.rol,
      contacto: newUser.contacto,
      photoUrl: newUser.photoUrl || null,
      token,
    });
  } catch (error: any) {
    console.error("Error registrando usuario", error);
    if (error?.code === 11000) {
      return res.status(400).json({
        message: "Ese correo ya está registrado en otro usuario",
      });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors || {})
          .map((e: any) => e.message)
          .join(". ") || "Datos inválidos",
      });
    }
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


// Login usuario
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    if (user.activo === false) {
      return res.status(403).json({
        message: "Este usuario está desactivado. Contacta al administrador.",
      });
    }

    if (!user.password){
      return res.status(401).json({
        message:"Este usuario no tiene acceso al inicio se sion "
      })
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    // Migra contraseñas viejas en texto plano la primera vez que hacen login
    if (!isBcryptHash(user.password)) {
      user.password = await hashPassword(password);
      user.markModified("password");
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      _id: user._id,
      nombre: user.nombre,
      apellido: user.apellido,
      apellidoPaterno: user.apellidoPaterno || "",
      apellidoMaterno: user.apellidoMaterno || "",
      genero: user.genero || "",
      email: user.email,
      rol: user.rol,
      activo: true,
      photoUrl: user.photoUrl || null,
      contacto: user.contacto,
      permissions: [
        ...new Set([
          ...defaultPermissionsForRole(user.rol),
          ...(Array.isArray(user.permissions) ? user.permissions : []),
        ]),
      ],
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
  
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol, contacto, activo, permissions } = req.body;

    const authUser = (req as any).user;
    const targetId = String(req.params.id || "");
    const authId = String(authUser?._id || authUser?.id || "");
    const isAdmin = isAdminLevel(authUser?.rol);
    const isSelf = Boolean(authId && targetId && authId === targetId);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        message: "No puedes editar el perfil de otro usuario",
      });
    }

    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (nombre !== undefined) user.nombre = String(nombre).trim();

    if (
      req.body.apellidoPaterno !== undefined ||
      req.body.apellidoMaterno !== undefined
    ) {
      const paterno =
        req.body.apellidoPaterno !== undefined
          ? String(req.body.apellidoPaterno).trim()
          : String(user.apellidoPaterno || "").trim();
      const materno =
        req.body.apellidoMaterno !== undefined
          ? String(req.body.apellidoMaterno).trim()
          : String(user.apellidoMaterno || "").trim();
      user.apellidoPaterno = paterno;
      user.apellidoMaterno = materno;
      user.apellido = joinApellidos(paterno, materno);
    } else if (req.body.apellido !== undefined) {
      const apellidos = resolveApellidos({ apellido: req.body.apellido });
      user.apellidoPaterno = apellidos.apellidoPaterno;
      user.apellidoMaterno = apellidos.apellidoMaterno;
      user.apellido = apellidos.apellido;
    }

    if (contacto !== undefined) user.contacto = String(contacto).trim();

    if (req.body.genero !== undefined) {
      user.genero = normalizeGenero(req.body.genero);
    }

    if (req.body.origen !== undefined) {
      const nextOrigen = String(req.body.origen || "").trim().toLowerCase();
      user.origen = nextOrigen || null;
    }

    // Email, rol, activo y contraseña solo admin
    if (isAdmin) {
      if (email !== undefined) {
        const nextEmail = String(email).trim().toLowerCase();
        if (nextEmail) {
          user.email = nextEmail;
        } else {
          user.set("email", undefined);
        }
      }

      if (activo !== undefined && activo !== null && activo !== "") {
        // multipart manda strings; Boolean("false") === true → parseo explícito
        const raw = activo;
        if (typeof raw === "boolean") {
          user.activo = raw;
        } else if (typeof raw === "number") {
          user.activo = raw !== 0;
        } else {
          const s = String(raw).trim().toLowerCase();
          user.activo = s === "true" || s === "1" || s === "yes" || s === "si" || s === "sí";
        }
      }

      if (rol !== undefined) {
        const nextRole = normalizeRole(String(rol));
        if (!nextRole) {
          return res.status(400).json({
            message:
              "Rol no válido. Usa Administrador, Usuario, Operador o Ayudante General",
          });
        }
        user.rol = nextRole;
      }

      if (permissions !== undefined) {
        user.permissions = sanitizePermissions(permissions);
        user.markModified("permissions");
      }

      if (password !== undefined && password !== null && String(password).trim() !== "") {
        const plain = String(password).trim();
        if (plain.length < 6) {
          return res.status(400).json({
            message: "La contraseña debe tener al menos 6 caracteres",
          });
        }
        if (!user.email) {
          return res.status(400).json({
            message:
              "El usuario necesita un correo para poder iniciar sesión con contraseña",
          });
        }
        user.password = await hashPassword(plain);
        user.markModified("password");
      }
    }

    if (req.file) {
      const nextUrl = uploadedFileUrl(req.file);
      if (nextUrl) {
        await removeStoredPhoto(user.photoUrl);
        user.photoUrl = nextUrl;
      }
    }

    await user.save();

    const userObj = user.toObject({ virtuals: true }) as any;
    userObj.id = String(userObj._id || "");
    delete userObj.password;
    delete userObj.resetToken;
    delete userObj.resetTokenExp;
    delete userObj.__v;
    return res.json(userObj);
  } catch (error: any) {
    console.error("Error al actualizar usuario", error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: "El correo ya está en uso" });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message:
          Object.values(error.errors || {})
            .map((e: any) => e.message)
            .join(". ") || "Datos inválidos",
      });
    }
    return res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

/** Solo actualiza la foto de perfil (Operador / Ayudante desde Mi Perfil). */
export const updateUserPhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Debes seleccionar una imagen" });
    }

    const authUser = (req as any).user;
    const targetId = String(req.params.id || "");
    const authId = String(authUser?._id || authUser?.id || "");
    const isAdmin = isAdminLevel(authUser?.rol);

    if (!isAdmin && authId && targetId && authId !== targetId) {
      return res.status(403).json({
        message: "No puedes cambiar la foto de otro usuario",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const nextUrl = uploadedFileUrl(req.file);
    if (!nextUrl) {
      return res.status(400).json({ message: "No se pudo procesar la imagen" });
    }

    await removeStoredPhoto(user.photoUrl);
    user.photoUrl = nextUrl;
    await user.save();

    const userObj = user.toObject({ virtuals: true }) as any;
    userObj.id = String(userObj._id || "");
    delete userObj.password;
    return res.json(userObj);
  } catch (error) {
    console.error("Error al actualizar foto", error);
    return res.status(500).json({ message: "Error al actualizar la foto" });
  }
};

/** Elimina la foto de perfil y deja el avatar por defecto (iniciales). */
export const deleteUserPhoto = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const targetId = String(req.params.id || "");
    const authId = String(authUser?._id || authUser?.id || "");
    const isAdmin = isAdminLevel(authUser?.rol);

    if (!isAdmin && authId && targetId && authId !== targetId) {
      return res.status(403).json({
        message: "No puedes eliminar la foto de otro usuario",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await removeStoredPhoto(user.photoUrl);
    user.photoUrl = null;
    await user.save();

    const userObj = user.toObject({ virtuals: true }) as any;
    userObj.id = String(userObj._id || "");
    delete userObj.password;
    return res.json(userObj);
  } catch (error) {
    console.error("Error al eliminar foto", error);
    return res.status(500).json({ message: "Error al eliminar la foto" });
  }
};

/** Elimina el usuario de forma permanente. */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const authUser = (req as any).user;
    const target = await User.findById(id).select("rol");
    if (!target) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (!canDeleteUser(authUser?.rol, target.rol)) {
      return res.status(403).json({
        message: "No tienes permiso para eliminar este usuario",
      });
    }
    const authId = String(authUser?._id || authUser?.id || "");
    if (authId && authId === String(id)) {
      return res.status(400).json({ message: "No puedes eliminarte a ti mismo" });
    }

    const user = await User.findByIdAndDelete(id).select(PUBLIC_USER_FIELDS);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json({
      message: "Usuario eliminado correctamente",
      user,
    });
  } catch (error) {
    console.error("Error eliminando usuario", error);
    return res.status(500).json({ message: "Error eliminando usuario" });
  }
};

/** Legacy. La app usa POST /api/auth/forgot-password (código + Gmail SMTP). */
export const forgotPassword = async (req: Request, res: Response) => {
  return res.status(410).json({
    message:
      "Esta ruta ya no se usa. Usa POST /api/auth/forgot-password con el correo del usuario.",
  });
};

/** Legacy. La app usa POST /api/auth/reset-password { email, token, newPassword }. */
export const resetPassword = async (_req: Request, res: Response) => {
  return res.status(410).json({
    message:
      "Esta ruta ya no se usa. Usa POST /api/auth/reset-password con email, token y newPassword.",
  });
};


export const updateUserEmailNotifications = async (req: Request, res: Response) => {
  try {
    const targetId = String(req.params.id || "");
    if (!targetId || targetId.length !== 24) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { tripAssigned, tripStarted, tripCompleted, enabled } = req.body || {};
    if (
      tripAssigned === undefined &&
      tripStarted === undefined &&
      tripCompleted === undefined &&
      enabled === undefined
    ) {
      return res.status(400).json({ message: "Nada que actualizar" });
    }

    if (!user.emailNotifications) {
      user.emailNotifications = {
        enabled: false,
        tripAssigned: false,
        tripStarted: false,
        tripCompleted: false,
      };
    }

    if (enabled !== undefined) {
      user.emailNotifications.enabled = Boolean(enabled);
      // Si activa el master y no tiene EMAIL_RECEIVE, se lo agregamos como permiso explícito
      if (user.emailNotifications.enabled) {
        const perms = Array.isArray(user.permissions) ? [...user.permissions] : [];
        if (!perms.includes(PERMISSIONS.EMAIL_RECEIVE)) {
          perms.push(PERMISSIONS.EMAIL_RECEIVE);
          user.permissions = perms;
          user.markModified("permissions");
        }
      } else {
        // Quitar permiso explícito al desactivar master (los superadmin siguen teniendo el default del rol)
        const perms = Array.isArray(user.permissions) ? [...user.permissions] : [];
        user.permissions = perms.filter((p) => p !== PERMISSIONS.EMAIL_RECEIVE);
        user.markModified("permissions");
      }
    }
    if (tripAssigned !== undefined) {
      user.emailNotifications.tripAssigned = Boolean(tripAssigned);
    }
    if (tripStarted !== undefined) {
      user.emailNotifications.tripStarted = Boolean(tripStarted);
    }
    if (tripCompleted !== undefined) {
      user.emailNotifications.tripCompleted = Boolean(tripCompleted);
    }

    // Si activa algún aviso concreto, habilitar master + permiso email.receive
    const anyTripPrefOn =
      user.emailNotifications.tripAssigned === true ||
      user.emailNotifications.tripStarted === true ||
      user.emailNotifications.tripCompleted === true;
    if (anyTripPrefOn) {
      user.emailNotifications.enabled = true;
      const perms = Array.isArray(user.permissions) ? [...user.permissions] : [];
      if (!perms.includes(PERMISSIONS.EMAIL_RECEIVE)) {
        perms.push(PERMISSIONS.EMAIL_RECEIVE);
        user.permissions = perms;
        user.markModified("permissions");
      }
    }

    await user.save();

    return res.json({
      _id: user._id,
      emailNotifications: user.emailNotifications,
      permissions: user.permissions || [],
      message: "Preferencias de correo actualizadas",
    });
  } catch (error) {
    console.error("Error actualizando correos de usuario:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
