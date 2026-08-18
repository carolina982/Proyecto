import crypto from "crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import { verifyToken } from "../middlewares/auth";
import { checkRateLimit, clientIp } from "../middlewares/rateLimit";
import User, { hashPassword, isBcryptHash } from "../models/User";
import {
  getActiveMailer,
  sendPasswordResetCode,
  sendTwoFactorCode,
} from "../services/emailService";
import { validatePasswordStrength } from "../utils/passwordPolicy";

const router = Router();

const generateResetCode = () => crypto.randomInt(100000, 999999).toString();

const hashOtp = (code: string) =>
  crypto.createHash("sha256").update(String(code)).digest("hex");

/** Por defecto NO devolver el código en la API. Solo si RESET_CODE_IN_RESPONSE=true. */
const allowResetCodeInResponse = () =>
  String(process.env.RESET_CODE_IN_RESPONSE || "").toLowerCase() === "true";

const GENERIC_FORGOT_MSG =
  "Si el correo está registrado, enviamos un código de recuperación. Revisa tu bandeja y spam.";

console.log("authRoutes cargando correctamente");
console.log("Mailer activo (recuperación):", getActiveMailer());
console.log(
  "Código en respuesta API (solo si falla el correo):",
  allowResetCodeInResponse() ? "sí" : "no"
);

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const ip = clientIp(req as any);
    const ipLimit = checkRateLimit({
      key: `login:ip:${ip}`,
      max: 12,
      windowMs: 15 * 60 * 1000,
      minIntervalMs: 800,
      message: "Demasiados intentos de inicio de sesión. Espera un momento.",
    });
    if (!ipLimit.ok) {
      res.setHeader("Retry-After", String(ipLimit.retryAfterSec));
      return res.status(429).json({ message: ipLimit.message });
    }

    // "email" puede ser un correo o un nombre de usuario (se acepta cualquiera).
    const { email, identifier, password } = req.body;
    const rawIdentifier = String(identifier ?? email ?? "").trim();

    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const looksLikeEmail = rawIdentifier.includes("@");

    // Evitar $expr/$regexMatch en cada login (escaneo lento). Primero email indexado.
    let user: any = null;
    if (looksLikeEmail) {
      user = await User.findOne({ email: rawIdentifier.toLowerCase() }).select("+password");
    }
    if (!user) {
      user = await User.findOne({
        nombre: new RegExp(`^${escapeRegex(rawIdentifier)}$`, "i"),
      }).select("+password");
    }
    if (!user && !looksLikeEmail) {
      // Nombre completo "Nombre Apellido" sin $expr: buscar candidatos por primer token.
      const parts = rawIdentifier.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const first = parts[0];
        const rest = parts.slice(1).join(" ");
        user = await User.findOne({
          nombre: new RegExp(`^${escapeRegex(first)}$`, "i"),
          apellido: new RegExp(`^${escapeRegex(rest)}$`, "i"),
        }).select("+password");
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Este usuario no tiene acceso al inicio de sesión",
      });
    }

    if (user.activo === false) {
      return res.status(403).json({
        message: "Esta cuenta está pendiente de activación. Contacta al administrador.",
      });
    }

    const passwordValid = await user.comparePassword(password);

    if (!passwordValid) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    if (!isBcryptHash(user.password)) {
      user.password = await hashPassword(password);
      user.markModified("password");
      await user.save();
    }

    if (user.twoFactorEmail) {
      if (!user.email) {
        return res.status(400).json({
          message: "Esta cuenta no tiene correo para el código de acceso",
        });
      }
      const code = generateResetCode();
      user.twoFactorCode = hashOtp(code);
      user.twoFactorCodeExp = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      const sent = await sendTwoFactorCode({
        to: user.email,
        code,
        userName: user.nombre,
      });
      if (!sent.ok) {
        return res.status(503).json({
          message: sent.message || "No se pudo enviar el código. Intenta de nuevo.",
        });
      }
      const preAuthToken = jwt.sign(
        { id: user._id, purpose: "2fa" },
        JWT_SECRET,
        { expiresIn: "10m" }
      );
      return res.json({
        requiresTwoFactor: true,
        preAuthToken,
        message: "Enviamos un código a tu correo",
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const userData: any = user.toObject({ virtuals: true });
    delete userData.password;
    delete userData.resetToken;
    delete userData.resetTokenExp;
    delete userData.twoFactorCode;
    delete userData.twoFactorCodeExp;
    delete userData.__v;
    userData.id = String(userData._id || "");
    userData.genero = user.genero || "";

    userData.profileSetupCompleted = user.profileSetupCompleted !== false;

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: userData,
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// FORGOT PASSWORD — código de 6 dígitos por correo (Gmail SMTP)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const ip = clientIp(req as any);

    // Protección anti-abuso: límite por IP y por correo
    const ipLimit = checkRateLimit({
      key: `forgot:ip:${ip}`,
      max: 8,
      windowMs: 60 * 60 * 1000, // 8 / hora por IP
      minIntervalMs: 15_000,
      message: "Demasiadas solicitudes desde esta red. Espera un momento.",
    });
    if (!ipLimit.ok) {
      res.setHeader("Retry-After", String(ipLimit.retryAfterSec));
      return res.status(429).json({ message: ipLimit.message });
    }

    const emailLimit = checkRateLimit({
      key: `forgot:email:${cleanEmail}`,
      max: 3,
      windowMs: 60 * 60 * 1000, // 3 / hora por correo
      minIntervalMs: 90_000, // mínimo 90s entre envíos al mismo correo
      message:
        "Ya se solicitó un código para este correo. Espera un minuto antes de pedir otro.",
    });
    if (!emailLimit.ok) {
      res.setHeader("Retry-After", String(emailLimit.retryAfterSec));
      // Misma respuesta genérica para no revelar si el correo existe
      return res.status(429).json({ message: emailLimit.message });
    }

    const user = await User.findOne({ email: cleanEmail }).select(
      "+password +resetToken +resetTokenExp"
    );

    // No revelar si el usuario existe. Solo enviamos si tiene acceso (correo + contraseña).
    if (!user || !user.password) {
      console.log(
        `forgot-password: sin envío (${!user ? "no existe" : "sin contraseña"}): ${cleanEmail} ip=${ip}`
      );
      return res.json({ message: GENERIC_FORGOT_MSG });
    }

    const resetToken = generateResetCode();
    user.resetToken = resetToken;
    user.resetTokenExp = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const nombreUsuario =
      [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || "Hola";

    const sent = await sendPasswordResetCode({
      to: user.email,
      code: resetToken,
      userName: nombreUsuario,
    });

    if (!sent.ok) {
      const showCode = allowResetCodeInResponse();

      console.error(
        "Fallo envío recuperación:",
        sent.message,
        sent.detail || "",
        showCode ? `| código temporal: ${resetToken}` : `| ip=${ip}`
      );

      // Solo en desarrollo / si se activa explícitamente (no en producción por defecto)
      if (showCode) {
        return res.json({
          message:
            sent.message ||
            "No se pudo enviar el correo. Usa este código para continuar (válido 10 min).",
          emailFailed: true,
          resetCode: resetToken,
        });
      }

      return res.status(502).json({
        message:
          "No se pudo enviar el correo ahora. Intenta más tarde o contacta al administrador.",
      });
    }

    console.log(
      `Correo de recuperación enviado a ${user.email} via ${sent.provider}`,
      sent.id || "",
      `ip=${ip}`
    );
    return res.json({ message: GENERIC_FORGOT_MSG });
  } catch (error: any) {
    console.error("Error en forgot-password:", error);
    return res.status(500).json({
      message: "No se pudo procesar la solicitud",
    });
  }
});


// VERIFY RESET CODE (sin cambiar contraseña aún)
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const ip = clientIp(req as any);
    const verifyLimit = checkRateLimit({
      key: `verify-reset:ip:${ip}`,
      max: 30,
      windowMs: 60 * 60 * 1000,
      minIntervalMs: 1_000,
      message: "Demasiados intentos. Espera un momento.",
    });
    if (!verifyLimit.ok) {
      res.setHeader("Retry-After", String(verifyLimit.retryAfterSec));
      return res.status(429).json({ message: verifyLimit.message });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanToken = String(token).replace(/\D/g, "").trim();

    if (cleanToken.length !== 6) {
      return res.status(400).json({ message: "El código debe ser de 6 dígitos" });
    }

    const user = await User.findOne({
      email: cleanEmail,
      resetToken: cleanToken,
      resetTokenExp: { $gt: new Date() },
    }).select("+resetToken +resetTokenExp");

    if (!user) {
      return res.status(400).json({
        message: "Código inválido o expirado. Solicita uno nuevo.",
      });
    }

    return res.json({
      ok: true,
      message: "Código verificado. Ahora define tu nueva contraseña.",
    });
  } catch (error) {
    console.error("Error en verify-reset-code", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// RESET PASSWORD
// También limitar intentos de reset por IP (fuerza bruta de códigos)
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword, email } = req.body;

    if (!token || !newPassword || !email) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const ip = clientIp(req as any);
    const resetIpLimit = checkRateLimit({
      key: `reset:ip:${ip}`,
      max: 20,
      windowMs: 60 * 60 * 1000,
      minIntervalMs: 2_000,
      message: "Demasiados intentos. Espera un momento.",
    });
    if (!resetIpLimit.ok) {
      res.setHeader("Retry-After", String(resetIpLimit.retryAfterSec));
      return res.status(429).json({ message: resetIpLimit.message });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanToken = String(token).replace(/\D/g, "").trim();
    const plainPassword = String(newPassword).trim();

    if (cleanToken.length !== 6) {
      return res.status(400).json({ message: "El código debe ser de 6 dígitos" });
    }
    const pwdErr = validatePasswordStrength(plainPassword);
    if (pwdErr) {
      return res.status(400).json({ message: pwdErr });
    }

    const user = await User.findOne({
      email: cleanEmail,
      resetToken: cleanToken,
      resetTokenExp: { $gt: new Date() },
    }).select("+password +resetToken +resetTokenExp");

    if (!user) {
      return res.status(400).json({
        message: "Código inválido o expirado. Solicita uno nuevo.",
      });
    }

    user.password = await hashPassword(plainPassword);
    user.markModified("password");
    user.resetToken = undefined;
    user.resetTokenExp = undefined;

    await user.save();

    return res.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error en reset-password", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});


/** Cambio de contraseña estando autenticado (perfil). */
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || authUser.isServiceAccount) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const currentPassword = String(req.body?.currentPassword || "").trimEnd();
    const newPassword = String(req.body?.newPassword || "").trim();

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Ingresa la contraseña actual y la nueva",
      });
    }
    const pwdErr = validatePasswordStrength(newPassword);
    if (pwdErr) {
      return res.status(400).json({
        message: pwdErr,
      });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "La nueva contraseña debe ser distinta a la actual",
      });
    }

    const user = await User.findById(authUser._id || authUser.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (!user.password) {
      return res.status(400).json({
        message: "Tu cuenta aún no tiene contraseña configurada",
      });
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ message: "La contraseña actual no es correcta" });
    }

    user.password = await hashPassword(newPassword);
    user.markModified("password");
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error en change-password", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

/** Primer ingreso: dejar o cambiar la contraseña asignada y marcar el setup como listo. */
router.post("/complete-profile-setup", verifyToken, async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || authUser.isServiceAccount) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const user = await User.findById(authUser._id || authUser.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.profileSetupCompleted !== false) {
      return res.json({
        message: "Listo",
        profileSetupCompleted: true,
        photoUrl: user.photoUrl || null,
      });
    }

    const keepPassword = Boolean(req.body?.keepPassword);
    const newPassword = String(req.body?.newPassword || "").trim();

    if (!keepPassword) {
      if (!newPassword) {
        return res.status(400).json({
          message: "Escribe una contraseña nueva o elige dejar la asignada",
        });
      }
      const pwdErr = validatePasswordStrength(newPassword);
      if (pwdErr) {
        return res.status(400).json({ message: pwdErr });
      }
      user.password = await hashPassword(newPassword);
      user.markModified("password");
    }

    user.profileSetupCompleted = true;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    return res.json({
      message: keepPassword
        ? "Listo. Conservaste la contraseña asignada"
        : "Contraseña actualizada",
      profileSetupCompleted: true,
      photoUrl: user.photoUrl || null,
    });
  } catch (error) {
    console.error("Error en complete-profile-setup", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

router.post("/two-factor", verifyToken, async (req, res) => {
  try {
    const authUser = (req as any).user;
    if (!authUser || authUser.isServiceAccount) {
      return res.status(403).json({ message: "No autorizado" });
    }
    const enabled = Boolean(req.body?.enabled);
    const user = await User.findById(authUser._id || authUser.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (enabled && !user.email) {
      return res.status(400).json({
        message: "Necesitas un correo para activar el código de acceso",
      });
    }
    user.twoFactorEmail = enabled;
    if (!enabled) {
      user.twoFactorCode = undefined;
      user.twoFactorCodeExp = undefined;
    }
    await user.save();
    return res.json({
      message: enabled ? "Código de acceso activado" : "Código de acceso desactivado",
      twoFactorEmail: enabled,
    });
  } catch (error) {
    console.error("Error en two-factor", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

router.post("/verify-2fa", async (req, res) => {
  try {
    const preAuthToken = String(req.body?.preAuthToken || "").trim();
    const code = String(req.body?.code || "").trim();
    if (!preAuthToken || !code) {
      return res.status(400).json({ message: "Falta el código" });
    }
    let decoded: { id?: string; purpose?: string };
    try {
      decoded = jwt.verify(preAuthToken, JWT_SECRET) as { id?: string; purpose?: string };
    } catch {
      return res.status(401).json({ message: "El código expiró. Vuelve a iniciar sesión." });
    }
    if (decoded.purpose !== "2fa" || !decoded.id) {
      return res.status(401).json({ message: "Sesión inválida" });
    }
    const user = await User.findById(decoded.id).select(
      "+password +twoFactorCode +twoFactorCodeExp"
    );
    if (!user || !user.twoFactorEmail) {
      return res.status(401).json({ message: "No autorizado" });
    }
    if (!user.twoFactorCode || !user.twoFactorCodeExp || user.twoFactorCodeExp < new Date()) {
      return res.status(400).json({ message: "El código expiró. Vuelve a iniciar sesión." });
    }
    if (hashOtp(code) !== user.twoFactorCode) {
      return res.status(401).json({ message: "Código incorrecto" });
    }
    user.twoFactorCode = undefined;
    user.twoFactorCodeExp = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    const userData: any = user.toObject({ virtuals: true });
    delete userData.password;
    delete userData.resetToken;
    delete userData.resetTokenExp;
    delete userData.twoFactorCode;
    delete userData.twoFactorCodeExp;
    delete userData.__v;
    userData.id = String(userData._id || "");
    userData.profileSetupCompleted = user.profileSetupCompleted !== false;
    userData.twoFactorEmail = true;

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Error en verify-2fa", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;
