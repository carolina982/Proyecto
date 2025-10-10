import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET ||"Clave temporal";
interface JwtPayload {
    id :string;
}

export const verifyToken=async(req:Request , res:Response , next:NextFunction)=>{
    try {
        const token =req.header("Authorization")?.replace ("Bearer" , "").trim();
        if(!token) return res.status(401).json({message:"Token no proporcionado"});
        const decoded =jwt.verify(token,JWT_SECRET) as JwtPayload;
        const user=await User.findById(decoded.id);
        if (!user) return res.status(401).json({message:"Usuario no econtrado "});
        req.user =user;
        next();
    }catch (error){
        res.status(401).json({message:"Token invalido o expirado "});
    }
};