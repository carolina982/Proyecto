import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import { transporter } from "../config/mailer";
import User, { IUser } from "../models/User";

export const getUser = async (req: Request, res: Response) => {
  try {
    const users: IUser[] = await User.find();
    return res.json(users);
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

// Registrar usuario
export const registesrUser =async (req:Request , res:Response)=>{
  try {
    const {nombre,apellido,email,password,rol,contacto}=req.body;
    if (!nombre||!apellido||!email||!password||!rol||!contacto){
      return res.status(400).json({message:"Faltan datos obligatorios"});
    }
    const existingUser =await User.findOne({email:email.toLowerCase()});
    if (existingUser){
      return res.status(400).json({message:"Usiario ya existe"});
    }
    const newUser = new User ({nombre,apellido,email:email.toLowerCase(),password,rol,contacto, photoUrl:req.file ?`/uploads/${req.file.filename}`:null,});
    await newUser.save ();
    const token =jwt.sign(
      {id:newUser._id , email:newUser.email , rol:newUser.rol},
      JWT_SECRET,
      {expiresIn:"1d"}
    );
    res.status(201).json({id:newUser._id , 
      nombre:newUser.nombre, 
      apellido:newUser.apellido,
      email:newUser.apellido,
      rol:newUser.rol,
      photoUrl:newUser.photoUrl || null ,
      token,
    });
  }catch (error){
    console.error("Error  resgistrando usuario", error);
    res.status(500).json({message:"Error interno del servidor"});
  }
};

// Login usuario
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Datos recibidos en login",{email,password});
  if (!email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("Usuario no econtrado");
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    console.log("usuario econtrado", user.email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("contraseña incorrecta");
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    console .log ("Token generado", token ? "ok":"Error");
    res.json({
      id: user._id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      photoUrl: user.photoUrl || null,
      contacto:user.contacto,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error en el servidor" });
}
};
  
export const updateUser=  async (req:Request, res:Response)=>{
  try {
    const {nombre,apellido,email,rol,contacto}=req.body;
    const updateData: any ={nombre, apellido,email, rol,contacto};
    if (req.file){
      updateData.photoUrl =`/uploads/${req.file.filename}`;}
    const user =await User.findByIdAndUpdate(req.params.id,updateData,{new:true});
    if (!user){
      return res.status(404).json({message:"Usuario no econtrado"});}
    res.json(user);
  }catch (error){
    console.error("Error al actualizar usuario", error);
    res.status(500).json({message:"Error al actualizar usuario"});
  }
};

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

export const forgotPassword = async (req: Request, res: Response) => {
  console.log("📩 Petición recibida en forgotPassword:", req.body); 
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email es requerido" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }); 
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExp = new Date(Date.now() + 3600000);
    await user.save();

    const resetUrl = `https://volta-backend-px1a.onrender.com/api/users/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      from: "correo@volta.com",
      subject: "Restablece tu contraseña",
      html: `<p>Solicitaste restablecer tu contraseña</p>
             <p>Haz clic aqui para crear una nueva contraseña:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>Este enlace expira en 1 hora</p>`,
    });
    res.json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar correo" });
  }
};

export const resetPassword =async (req:Request, res:Response) =>{
  const {token}=req.params;
  const {password}=req.body;
  try {
    const user =await User.findOne ({resetToken:token,
      resetTokenExp:{$gt:new Date ()},
    });
    if (!user){
      return res.status(400).json({message:"Token invalido o expirado"});
    }
    const hashed=await bcrypt.hash(password,10);
    user.password=hashed;
    user.resetToken=undefined;
    user.resetTokenExp=undefined;
    await user.save();

    res.json({message:"Contraseña restablecidad correctamente"});
  }catch (error){
    console.error("Error en resetPassword", error);
    res.status(500).json({message:"Error al restablecer contraseña"});
  }
};
