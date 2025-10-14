import { Request, Response } from "express";
import Trip from "../models/Trip";
import Viatic from "../models/Viatic";

export const getViatic = async(req:Request , res:Response)=>{
  try{
    const user =(req as any).user;
    let viatics ;
    if (user?.rol === "Chofer"){
      const trips =await Trip.find({conductorId: user.id.toString()});
      const tripsIds =trips.map(t=> t.id);
      viatics =await Viatic.find({tripId:{$in:tripsIds}})
    }else{
      viatics=await Viatic.find();
    }
    res.json(viatics);
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al obtener viaticos"});
  }
};

export const getViaticById =async(req:Request , res:Response)=>{
  try{
    const viatic =await Viatic.findById(req.params.id);
    if (!viatic) return res.status(404).json({message:"Viatico no econtrado"});
    const user =(req as any).user;
    if (user?.rol ==="Chofer"){
      const trip = await Trip.findById(viatic.tripId);
      if(!trip ||  trip.conductorId.toString()!== user.id.toString()){
        return res.status(403).json({message:"No tienes permisos para ver este viatico"});
      }
    }
    res.json(viatic);
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al obtener viatico"});
  }
};

export const getViaticByTrip = async (req:Request , res:Response)=>{
  try{
    const tripId =req.params.tripId;
    const user =(req as any ).user;
    const trip =await Trip.findById(tripId);
    if (user?.rol ==="Chofer" && (!trip || trip.conductorId.toString() !== user.id.toString())){
      return res.status(403).json({message:"No tienes permisos para ver estos viaticos"});
    }
    const viatics=await Viatic.find({tripId});
    res.json(viatics);
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al obtener viaticos por viaje"})
  }
};

export const createViatic = async (req:Request , res:Response)=>{
  try{
    const {tripId, concepto,descripcion,monto,nombre} =req.body;
    const ticket=req.file?.filename;
    const user =(req as any).user;
    if(user?.rol ==="Chofer"){
      const trip =await Trip.findById(tripId);
      if (!trip || trip.conductorId.toString() !== user.id.toString()){
        return res.status(403).json({message:"No puedes agregar viaticos a este viaje "});
      }
    }
    const newViatic = await Viatic.create({tripId,concepto,descripcion,monto,nombre,ticket});
    res.json({messaage:"Viatico registrado exitosamente",viatic:newViatic});
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al crear viatico"});
  }
};

export const updateViatic= async (req:Request , res:Response)=>{
  try {
    const viatic =await Viatic.findById(req.params.id);
    if (!viatic) return  res.status(404).json({message:"Viatico no econtrado"});
    const user =(req as any ).user ;
    if (user?.rol ==="Chofer"){
      const trip=await Trip.findById(viatic.tripId);
      if (!trip ||  trip.conductorId.toString () !== user.id.toString()){
        return res.status(403).json({message:"No tienes permisos para actualizar este viatico"});
      }
    }
    if (req.file) viatic.ticket=req.file.fieldname;
    Object.assign(viatic , req.body);
    await viatic.save();
    res.json({message:"Viatico actualizado" , viatic});
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al actualizar viatico"});
  }
};

export const deleteViatic = async (req:Request , res:Response)=>{
  try{
    const viatic=await Viatic.findById(req.params.id);
    if (!viatic) return res.status(404).json({message:"Viatico no econtrado"});
    const user =(req as any ).user;
    if(user?.rol === "Chofer"){
      const trip =await Trip.findById(viatic.tripId);
      if (!trip || trip.conductorId.toString () ! == user.id.toString()){
        return res.status(403).json({message:"No tienes permisos para eliminar este viatico"});
      }
    }
    await viatic.deleteOne();
    res.json({message:"Viatico eliminado"});
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al eliminar"});
  }
}