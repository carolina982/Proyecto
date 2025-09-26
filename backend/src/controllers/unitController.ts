import { error } from "console";
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

export const getUnitById =async (req:Request , res:Response) =>{
    try {
        const unit =await Unit.findById (req.params.id);
        if (!unit ) return
        res.status(404).json ({message:"Unidad no econtrada "});
        res.json(unit);
    } catch{
        res.status(500).json({message:"Error al obtener  unidad" , error});
    }
};

export const updateUnit = async (req:Request , res:Response) =>{
    try{
        const unit =await Unit.findByIdAndUpdate(req.params.id , req.body , { new:true});
        if (!unit) return
        res.status(404).json({message:"Unidad no econtrada"});
        res.json(unit);
    }catch(error ){
        res.status(500).json({message:"Error al actualizar unidad" , error });
    }
};


export const  deleteUnit = async (req:Request , res:Response) =>{
    try{
        const unit =await Unit.findByIdAndDelete (req.params.id);
        if (!unit) return 
        res.status(404).json ({message: "Unidad no econtrada "});
        res.json({message:"Unidad eliminada"});
    }catch (error) {
        res.status(500).json({message:"Error al eliminar unidad ", error});
    }
};