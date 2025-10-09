import { Request, Response } from "express";
import fs from "fs";
import Viatic, { IViatic } from "../models/Viatic";

export const getViatic=async(req:Request, res:Response)=>{
  try{
  const viatics:IViatic[]=await Viatic.find();
  res.json(viatics);
}catch (error){
  console.error(error);
  res.status(500).json({message:"Error obteniendo viaticos"});
}
};

export const getViaticByTrip =async(req:Request, res:Response)=>{
  try{
    const viatics:IViatic[]=await Viatic.find({tripId:req.params.tripId});
    res.json(viatics);
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error obteniendo viaticos por viaje "});
  }
};

export const getViaticById=async(req:Request, res:Response)=>{
  try{
    const viatic:IViatic |null =await Viatic.findById(req.params.id);
    if(!viatic) return
    res.status(404).json({message:"Viatico no econtrado"});
    res.json(viatic);
  } catch(error){
    console.error(error);
    res.status(500).json({message:"Error obteniendo viatico"});
  }
};

export const createViatic=async(req:Request, res:Response)=>{
  console.log("POST recibiendo en /viactics:",req.body);
  try{
    const {tripId, concepto,descripcion, monto}=req.body;
    if(!tripId || !concepto || !descripcion ||!monto){
      return res.status(400).json({message:"Faltan campos requerdios"});
    }
    const viatic=await Viatic.create({
      tripId,
      concepto,
      descripcion,
      monto:Number(monto),
      ticket:req.file? req.file.path:undefined });
      console.log("Viatico creando:", Viatic);
      res.status(201).json({message:"Viatico creado correctamente", data:viatic,});
  }catch (error:any){
    console.error("Error creando viatico:" , error.message);
    res.status(500).json({message:"Error viatico", error:error.message,
    });
  }
};

export const updateViatic=async (req:Request, res:Response)=>{
  try{
    const{tripId, concepto , descripcion, monto}= req.body;
    const updateData:Partial<IViatic>&{ticket?:string}={
      tripId,
      concepto,
      descripcion,
      monto:monto?Number(monto):undefined,
    };
    if (req.file)updateData.ticket=req.file.path;
    const viaticDoc = await Viatic.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if(!viaticDoc) return
    res.status(404).json({message:"Viatico no econtrado"});
    res.json({message:"Viatico actualizado correctamente",
      data:viaticDoc,
    });
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al actualizar viatico "});
  }
};

export const deleteViatic=async(req:Request, res:Response)=>{
  try{
    const viaticDoc=await Viatic.findByIdAndDelete(req.params.id);
    if(!viaticDoc) return
    res.status(404).json({message:"Viatico no econtrado"});
    if (viaticDoc.ticket && fs.existsSync(viaticDoc.ticket)){
      fs.unlinkSync(viaticDoc.ticket);
    }
    res.json({message:"Viatico eliminado correctamente"});
  }catch (error){
    console.error("Error al eliminar viatico:",error);
    res.status(500).json({message:"Error al eliminar viatico", error});
  }
};
