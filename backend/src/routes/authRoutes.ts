import * as bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import User from "../models/User";

const router =Router ();
console.log("aurhRoutes cargando correctamente");
router.post("/login" ,async (req, res)=>{
    try {
        const {email ,password}=req.body;
        if (!email || !password){
            return res.status(400).json({message:"Faltan datos"});
        }
        const user =await User.findOne({email:email.trim().toLowerCase()});
        if (!user){
            return res.status(401).json({message:"Usuarios o contraseña incorrectos"});
        }
        const passwordValid =await bcrypt.compare(password,user.password);
        if (!passwordValid){
            return res.status(401).json({message:"Usuario co contrase incorrectos"});
        }
         const token=jwt.sign({id:user._id},JWT_SECRET,{expiresIn:"7d"});
         const {password:_pass , ...userData}=user.toObject ();
         return res.json({message:"Iniciode sesión exitoso",token,user:userData,});
    }catch (error){
        console.error("Error al iniciar sesion",error);
        return res.status(500).json({message:"Error del servidor"});
    }
});

export default router;