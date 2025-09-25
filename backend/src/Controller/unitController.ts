import { Request, Response } from "express";
import Unit, { IUnit } from "../models/Unit";

export const createUnit =async (req:Request , res:Response)=>{
    const unitData :IUnit =req.body as IUnit;
    try{
        const unit:IUnit =await Unit.create(unitData);
        res.status(201).json(unit);
    }catch (error){
        res.status(500).json({message:"Error Creando unidad"});
    }
};

export const getUnits =async (req:Request , res:Response) =>{
    try{
        const units:IUnit[] =await Unit.find();
        res.json(units);
    }catch (error){
        res.status(500).json({message:"Error Obteniendo unidades"});
    }
};
