import { NextFunction, Request, Response } from "express";
export const authorize =(roles:string[])=>{
    return (req:Request, res:Response , next:NextFunction)=>{
        const user = req.user;
        if (!user) return  res.status(401).json({message:"No autorizado "});
        if (!roles.includes(user.rol)){
            return res.status(403).json({message:"Acesso denegado "});
        }
        next();
    }
}