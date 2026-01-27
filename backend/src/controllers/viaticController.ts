import { Request, Response } from "express";
import Trip from "../models/Trip";
import Viatico from "../models/Viatic";

export const getViatic= async (req:Request, res:Response)=>{
  try {
    const user=(req as any).user;
    let viatics;
    if (user?.rol === "Chofer"){
      const trips=await Trip.find({conductorId:user.id});
      const tripsIds=trips.map(t=>t._id);

      viatics=await Viatico.find({tripId:{$in:tripsIds}})
      .populate({ path:"tripId",populate:{path:"conductorId",select:"name email"},
      });
    }else{
      viatics=await Viatico.find().populate({
        path:"tripId",
        populate:{path:"conductorId",select:"name email"
        }
      });
    }
    res.json(viatics);
  }catch (error){
    console.error(error);
    res.status(500).json({message:"Error al obtener viaticos"});
  }
};

export const getViaticById = async (req:Request , res:Response)=>{
  try {
    const viatic=await Viatico.findById(req.params.id)
    .populate({
      path:"tripId",
      populate:{
        path:"conductorId",
        select:"namw email"
      }
    });
    if (!viatic){
      return res.status(404).json({message:"Viatico no econtrado"});
    }
    const user =(req as any).user;
    if (user?.rol === "Chofer"){
      const trip: any =viatic.tripId;
      if(trip.conductorId._id.toString() !== user.id.toString()){
        return res.status(403).json({message:"No tienes permisos"});
      }
    }
    res.json(viatic);
  }catch(error){
    console.error(error);
    res.status(500).json
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
    const {tripId, conceptos,dieselHistorial,dieselCargas,dieselCosto,tag,total}=req.body;
    let conceptosFinal:any={};
    if(conceptos){
      const conceptosObj= 
      typeof conceptos === "string"
      ? JSON.parse(conceptos)
      :conceptos;
      Object.entries(conceptosObj).forEach(([nombre,data]:any)=>{
        conceptosFinal[nombre]={
          cantidad:Number(data.cantidad || 0),
          costo:Number(data.costo ||0),
        };
      });
    }
     let factura="";
     if (req.file){
      factura=`/uploads/${req.file.filename}`;
     }
     const viaje =await Trip.findById(tripId).populate("conductorId","Nombre");
     if(!viaje){
      return res.status(400).json({message:"Viaje no econtrado"});
     }
     const newViatic=await Viatico.create({
      tripId,
      tripNombre:viaje.nombre,
      conductorNombre:(viaje as any).conductorId.nombre || "Sin asignar",
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


export const updateViatic = async (req:Request, res:Response)=>{
  try {
    const update:any ={
      conceptos:req.body.conceptos
      ? JSON.parse(req.body.conceptos)
      :undefined,
      dieselHistorial:req.body.dieselHistorial
      ?JSON.parse(req.body.dieselHistorial)
      :undefined,
      dieselCragas:Number(req.body.dieselCargas || 0),
      dieselCosto:Number(req.body.dieselCosto || 0),
      tag:Number(req.body.tag || 0),
      total:Number(req.body.total || 0),
    };
    if (req.file) update.factura=`/uploads/${req.file.filename}`;

    const viatico =await Viatico.findByIdAndUpdate(
      req.params.id,
      update,
      {new:true}
    );
    res.json(viatico);
  }catch(e){
    console.error(e);
    res.status(500).json({message:"Error actualizado viatico"});
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