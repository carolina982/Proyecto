import { Request, Response } from "express";
import User, { IUser } from "../models/User";

// Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;
  try {
    const user: IUser | null = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Registro
export const registerUser = async (req: Request, res: Response) => {
  const { nombre, email, password, rol }: IUser = req.body;
  try {
    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Usuario ya existe" });

    const user: IUser = await User.create({ nombre, email, password, rol });
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};