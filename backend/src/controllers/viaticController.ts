import { Request, Response } from "express";
import Trip from "../models/Trip";
import Viatico from "../models/Viatic";

const toNumber=(value:any,defaultValue=0)=>{
  const n=Number(value);
  return isNaN(n) ? defaultValue:n;
};

export const getViatic =async(req:Request,res:Response)=>{
  try {
    const user=(req as any).user;
    let viatics;

    if(user?.rol === "Chofer"){
      const trips =await Trip.find({conductorId :user.id.toString ()});
      const tripsIds=trips.map(t => t._id);
      viatics=await Viatico.find({
        tripId:{$in:tripsIds},
      }).populate({
        path:"tripId",
        populate:{
          path:"conductorId",
          select:"name email",
        },
      });
    }else{
      viatics =await Viatico.find().populate({
        path:"tripId",
        populate:{
          path:"conductorId",
          select:"name emal",
        },
      });
    }
    res.json(viatics);
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al obtener viaticos"});
  }
};

export const getViaticById = async (req:Request, res:Response)=>{
  try {
    const viatico:any =await Viatico.findById(req.params.id);
    if (!viatico){
      return res.status(404).json({message:"Viatico no econtrado"});
    }
    const user =(req as any).user ;
    if (user?.rol === "chofer"){
      const trip =await Trip.findById(viatico.tripId);
        if (!trip || trip.conductorId.toString() !==user.id.toString()){
          return res.status(403).json({message:"No tiene permisos para ver este viatico"});
      } 
    }
    const conceptosPlano:any={};
    const conceptosBase=[
      "Comidas" , "Hospedaje" ,
      "Pension" , "Vulcanizadora",
      "Taxi" , "Casetas efectivo",
      "Limpieza Unidad" , "Multa",
      "Comisiones" , "Fumigacion",
      "DEF" , "Regaderas",
    ];
    conceptosBase.forEach(base =>{
      conceptosPlano[`${base} Cantidad`]=viatico.conceptos?.[base]?.cantidad ?? 0;
      conceptosPlano[`${base} Costo`]=viatico.conceptos?.[base]?.costo ?? 0;
    });
    res.json({
      ...viatico.toObject(),
      conceptos:conceptosPlano,
      dieselCargas:viatico.dieselCargas ?? 0,
      dieselCosto:viatico.dieselCosto ?? 0,
      dieselHistorial:viatico.dieselHistorial ?? [],
      tag:viatico.tag ?? 0,
      total:viatico.total ?? 0,
    });
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al obtener viatico"});
  }
};

export const getViaticByTrip = async (req: Request, res: Response) => {
  try {
    const tripId = req.params.tripId;
    const user = (req as any).user;
    const trip = await Trip.findById(tripId);

    if (user?.rol === "Chofer" && (!trip || trip.conductorId.toString() !== user.id.toString())) {
      return res.status(403).json({ message: "No tienes permisos para ver estos viáticos" });
    }

    const viatics = await Viatico.find({ tripId });
    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener viáticos por viaje" });
  }
};

export const createViatic = async (req:Request, res:Response)=>{
  try {
    const {
      tripId, conceptos,dieselHistorial,dieselCargas,dieselCosto,tag,total
    }=req.body;

    let conceptosFinal:any ={};
    if (conceptos && typeof conceptos === "object"){
      Object.entries(conceptos).forEach(([Key , value])=>{
        const [nombre,tipo]=Key.split(" ");
        if (!conceptosFinal [nombre]){
          conceptosFinal[nombre]={cantidad:0 , costo:0};
        }
        if (tipo === "Cantidad"){
          conceptosFinal[nombre].cantidad=Number(value) || 0 ;
        }
        if (tipo === "Costo"){
          conceptosFinal[nombre].costo=Number(value) || 0;
        }
      });
    }
     let factura="";
     if (req.file){
      factura=`/uploads/${req.file.filename}`;
     }
     const newViatic=await Viatico.create({
      tripId,
      conceptos:conceptosFinal,
      dieselHistorial:Array.isArray(dieselHistorial) ?  dieselHistorial:[],
      dieselCargas:Number(dieselCargas) || 0,
      dieselCosto:Number(dieselCosto) || 0,
      tag:Number(tag) || 0 ,
      total:Number(total) || 0 ,
      factura,
     });
     return res.status(201).json(newViatic);
  }catch (error){
    console.error("Error al crear viatico",error);
    return res.status(500).json({message:"Error al crear viatico"});
  }
};


export const updateViatic = async (req: Request, res: Response) => {
  try {
    const viatic = await Viatico.findById(req.params.id);
    if (!viatic) return res.status(404).json({ message: "Viático no encontrado" });

    const user = (req as any).user;
    if (user?.rol === "Chofer") {
      const trip = await Trip.findById(viatic.tripId);
      if (!trip || trip.conductorId.toString() !== user.id.toString()) {
        return res.status(403).json({ message: "No tienes permisos para actualizar este viático" });
      }
    }
    if (req.file) viatic.factura = `/uploads/${req.file.filename}`;
    const { conceptos, dieselCargas, dieselCosto, tag, total } = req.body;
    if (conceptos) viatic.conceptos = JSON.parse(conceptos);
    if (dieselCargas!== undefined) viatic.dieselCargas = Number(dieselCargas);
    if (dieselCosto !== undefined) viatic.dieselCosto = Number(dieselCosto);
    if (tag !== undefined) viatic.tag = Number(tag);
    if (total !== undefined) viatic.total = Number(total);
    await viatic.save();
    res.json({ message: "Viático actualizado", viatic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar viático" });
  }
};
 export const deleteViatic = async (req: Request, res: Response) => {
   try {
     const viatic = await Viatico.findById(req.params.id);
     if (!viatic) return res.status(404).json({ message: "Viático no encontrado" });

     const user = (req as any).user;
        if (user?.rol === "Chofer") {
        const trip = await Trip.findById(viatic.tripId);
        if (!trip || trip.conductorId.toString() !== user.id.toString()) {
        return res.status(403).json({ message: "No tienes permisos para eliminar este viático" });
      }
    }
     await viatic.deleteOne();
     res.json({ message: "Viático eliminado" });
   } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar viático" });
  }
};