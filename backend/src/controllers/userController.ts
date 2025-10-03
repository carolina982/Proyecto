import bcrypt from "bcrypt";
import { Request, Response } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";

// Listar todos los usuarios
export const getUser = async (req: Request, res: Response) => {
  try {
    const users: IUser[] = await User.find().select("-password"); // No enviar contraseña
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Obtener usuario por ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "ID inválido" });

    const user: IUser | null = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Crear usuario (administrador)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol }: IUser = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ nombre, email, password: hashedPassword, rol });
    res.status(201).json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      photoUrl: user.photoUrl || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando usuario" });
  }
};

// Registro de usuario
export const registerUser = createUser; // Mismo flujo que createUser

// Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    res.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      photoUrl: user.photoUrl || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Actualizar usuario
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "ID de usuario inválido" });

    const updateData: Partial<IUser> = {
      nombre: req.body.nombre,
      email: req.body.email,
      rol: req.body.rol,
    };

    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    }

    // Actualiza y devuelve el usuario
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({
      id: updatedUser.id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      rol: updatedUser.rol,
      photoUrl: updatedUser.photoUrl || null,
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
};

// Eliminar usuario
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "ID inválido" });

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};