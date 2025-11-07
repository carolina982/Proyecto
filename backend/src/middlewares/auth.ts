import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import User from "../models/User";

interface JwtPayload {
    id:string;
}
export const verifyToken =async (req:Request, res:Response,next:NextFunction)=>{
    try {
        const authHeader =req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({message:"Token no proporcionado o fromato incorrecto"});
        }
        const token =authHeader.split(" ") [1].trim();
       const decoded =jwt.verify(token,JWT_SECRET) as JwtPayload;
       const user =await User.findById(decoded.id);
       if (!user){
        return res.status(401).json({message:"Usuario no econtrado"});
       }
       (req as any).user =user;
       next();
    }catch (error){
        console.error("Error verificando token",error);
        res.status(401).json({mesage:"Token invalido o expirado"});
    }
};