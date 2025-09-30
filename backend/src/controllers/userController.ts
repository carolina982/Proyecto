import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// Listar todos los usuarios (simple)
export const getUser = async (req: Request, res: Response) => {
  try {
    const users: IUser[] = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
};

// Obtener usuario por ID (simple)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user: IUser | null = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo usuario" });
  }
};

// Crear usuario rápido (sin hash ni validación)
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error creando usuario:", error.message);
    res.status(500).json({ message: "Error creando usuario", error: error.message });
  }
};


// Registro de usuario con validación y hash
export const registerUser = async (req: Request, res: Response) => {
  const { nombre, apellido, email, password, rol, photoUrl } = req.body;
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "Usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombre,
      apellido,
      email: email.toLowerCase(),
      password: hashedPassword,
      rol,
      photoUrl: photoUrl || null,
    });

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    console.error("Error registrando usuario:", error.message);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Login de usuario
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};


// Actualizar usuario
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
};

// Eliminar usuario
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};