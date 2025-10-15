import { error } from "console";
import { Request, Response } from "express";
import mongoose from "mongoose";
import Unit, { IUnit } from "../models/Unit";

export const createUnit =async (req:Request , res:Response)=>{
    try {
        const unitData :IUnit= req.body as IUnit;
        const unit: IUnit= await Unit.create(unitData);
        res.status(201).json(unit);
    }catch (error){
        console.error("Error creando unidad:" ,error);
        res.status(500).json({message:"Error creando unidad" , error});
    }
};

export const getUnits =async (req:Request , res:Response)=>{
    try {
        const units :IUnit[]=await Unit.find();
        res.json(units);
    }catch (error){
        console.error("Error obteniendo unidades" , error),
        res.status(500).json({message:"Error obteniendo unidades" , error});
    }
};

export const getUnitById= async (req:Request , res:Response)=>{
    try {
        const {id}=req.params;
        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"ID invalido"});
        }
        res.json(Unit);
    }catch (erro){
        console.error("Error al obtener unidad:", error);
        res.status(500).json({message:"Error al obtener unidad", error});
    }
};

export const updateUnit = async(req:Request , res:Response)=>{
    try{
        const {id}=req.params;
        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"ID invalido"});
        }
        const unit = await Unit.findByIdAndUpdate(id, req.body , {new:true});
        if (!unit){
            return  res.status(404).json({message:"Unidad no econtrada"});
        }
        res.json({message:"Unidad actualizado correctamente", unit});
    }catch (error) {
        console.error("Error al actualizar unidad:" , error);
        res.status(500).json({messga:"Error al actualizar unidad" , error});
    }
};

export const deleteUnit = async(req:Request , res:Response)=>{
    try {
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"ID invalido"});
        }
        const unit = await Unit.findByIdAndDelete(id);
        if(!unit){
            return res.status(404).json({message:"Unidad no econtrada "});
        }
        res.json({message:"Unidad eliminada correctamente"});
    }catch (error){
        console.error("Error al eliminar unidad" ,error);
    }
};

