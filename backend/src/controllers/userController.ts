import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User, { IUser } from "../models/User";

// Secreto para JWT
const JWT_SECRET = process.env.JWT_SECRET || "mi_super_secreto";

// GET todos los usuarios
export const getUser = async (req: Request, res: Response) => {
  try {
    const users: IUser[] = await User.find();
    return res.json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// GET usuario por ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || id.length !== 24) {
    return res.status(400).json({ message: "ID de usuario inválido" });
  }

  try {
    const user: IUser | null = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// CREATE usuario directo
export const createUser = async (req: Request, res: Response) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ nombre, email, password: hashedPassword, rol });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Error creando usuario:", error);
    return res.status(500).json({ message: "Error creando usuario", error });
  }
};
// LOGIN usuario
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const userData = {
      id: user._id,nombre: user.nombre,
      apellido: user.apellido, email: user.email,
      rol: user.rol, photoUrl: user.photoUrl || null,
    };
    res.json(userData);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};


export const registerUser = async (req: Request, res: Response) => {
  const { nombre, apellido, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Usuario ya existe" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rol,
    });

    const userData = {
      id: newUser._id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      email: newUser.email,
      rol: newUser.rol,
      photoUrl: newUser.photoUrl || null,
    };

    res.status(201).json(userData);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error en el servidor" });
}
};

// UPDATE usuario
export const updateUser=  async (req:Request, res:Response)=>{
    console.log("====UPDATE USER DEBUG====");
    console.log("Recibida peticion PATCH para actualizar usuario");
    console.log("req.params.id", req.params.id);
    console.log("req.body",req.body);
    console.log("req.file",req.file);
    console.log("====================");
  try {
    const {nombre,apellido,email,rol}=req.body;
    const updateData: any ={nombre, apellido,email, rol};
    if (req.file){
      updateData.photoUrl =`/uploads/${req.file.filename}`;
    }
    const user =await User.findByIdAndUpdate(req.params.id,updateData,{new:true});
    if (!user){
      return res.status(404).json({message:"Usuario no econtrado"});
    }
    res.json(user);
  }catch (error){
    console.error("Error al actualizar usuario", error);
    res.status(500).json({message:"Error al actualizar usuario"});
  }
};

//Delete 
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("Id recibiendo en backend", id);

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario", error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};