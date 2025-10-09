import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

export const protect= async (req:Request,res:Response,next:NextFunction)=>{
    let token;
    if (req.headers.authorization?.startsWith("Bearer")){
        token= req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res.status(401).json({message:"No token"});
    }
    try {
        const decoded :any=jwt.verify(token ,process.env.JWT_SECRET ||"secret");
        req.user=await User.findById(decoded.id).select("-password") as IUser;
        next();
    }catch (error){
        return res.status(401).json({message:"Token invalido"});
    }
};