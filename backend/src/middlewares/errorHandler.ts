import { NextFunction, Request, Response } from "express";

export const errorHandeler =(err:any, req:Request, res:Response, next:NextFunction)=>{
    console.error("Error global:" , err);
    res.status(err.status || 500).json({message:err.message ||"Error interno del servidor"});
};
