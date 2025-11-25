import { Request, Response } from "express";
import mongoose from "mongoose";
import Unit, { IUnit } from "../models/Unit";

export const createUnit =async (req:Request, res:Response)=>{
    try{
        const data=req.body as IUnit;
        if (!data.tipoRemolque){
            data.placaRemolque="";
        }
        const unit:IUnit =await Unit.create(data);
        res.status(201).json(unit);
    }catch (error){
        console.error("Error creando unidad",error);
        res.status(500).json({message:"Error creando unidad", error});
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
        return res.status(400).json({message:"Id invalido"});
       }
       const unit =await Unit.findById(id);
       if (!unit){
        return  res.status(404).json({message:"Unidad no econtrada"});
       }
       res.json(unit);
    }catch (error){
        console.error("Error al obtener unidad ", error);
        res.status(500).json({message:"Error al obtener unidad ", error})
    }
};
export const updateUnit=async (req:Request, res:Response)=>{
    try {
        const {id}=req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"ID Invalido"});
        }
        const data=req.body;
        if(!data.tipoRemolque){
            data.placaRemolque="";
        }
        const unit =await Unit.findByIdAndUpdate(id,data,{new:true});
        if(!unit){
            return res.status(404).json({message:"Unidad no econtrada"});
        }
        res.json({message:"Unidad actualizada correctamente",unit});
    }catch (error){
        console.error("Error al actualizar unidad",error);
        res.status(500).json({message:"Error al actuzalizar unidad",error});
    }
};
export const deleteUnit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("ID recibido para eliminar:", id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });}
    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) {
      return res.status(404).json({ message: "Unidad no encontrada" });}
    console.log("Unidad eliminada:", unit.nombre);
    return res.status(200).json({ message: "Unidad eliminada correctamente", id });
    } catch (error) {
    console.error("Error eliminando unidad:", error);
    return res.status(500).json({ message: "Error eliminando unidad", error });
  }
};