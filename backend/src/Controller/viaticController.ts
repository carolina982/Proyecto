import { Request, Response } from "express";
import Viatic, { IViatic } from "../models/Viatic";

export const createViatic =async (req:Request , res:Response)=>{ 
    const viaticData :IViatic =req.body as IViatic;
    try{
        const viatic:IViatic=await Viatic.create(viaticData);
        res.status(201).json(viatic);
    }catch (error){
        res.status(500).json({message:"Error creando Viatico "});
    }
};

export const getViatics =async (req:Request , res:Response) =>{
    try{
        const viatics :IViatic []= await Viatic.find().populate("trip");
        res.json(viatics);
    }catch(error) {
        res.status(500).json({message:"Error obteniendo viaticos "});
    }
};