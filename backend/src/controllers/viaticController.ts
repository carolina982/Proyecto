import { Request, Response } from "express";
import Trip from "../models/Trip";
import Viatico from "../models/Viatic";

const isOperatorRole = (rol?: string) => {
  const value = (rol || "").toLowerCase();
  return value === "operador" || value === "chofer";
};

export const getViatic= async (req:Request, res:Response)=>{
  try {
    const user=(req as any).user;
    let viatics;
    if (isOperatorRole(user?.rol)){
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
        select:"name email"
      }
    });
    if (!viatic){
      return res.status(404).json({message:"Viatico no econtrado"});
    }
    const user =(req as any).user;
    if (isOperatorRole(user?.rol)){
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

    if (isOperatorRole(user?.rol) && (!trip || trip.conductorId.toString() !== user.id.toString())) {
      return res.status(403).json({ message: "No tienes permisos para ver estos viáticos" });
    }

    const viatics = await Viatico.find({ tripId });
    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener viáticos por viaje" });
  }
};


export const createViatic =async (req:Request, res :Response)=>{
  try {
    const {tripId,conceptos,dieselHistorial,dieselCosto,dieselCargas,tag,total,costosExtras}=req.body;
    let conceptosFinal :any ={};
    if (conceptos){
      const conceptosObj= typeof conceptos === "string" ?JSON.parse(conceptos):conceptos;
      Object.entries(conceptosObj).forEach(([nombre,data]:any)=>{
        conceptosFinal[nombre]={
          cantidad:Number(data.cantidad || 0),
          costo:Number (data.costo || 0),
        };
      });
    }
    let factura ="";
    if (req.file){
      factura= `/upload/${req.file.filename}`;
    }
    const viaje=await Trip.findById(tripId).populate("conductorId","nombre");
    if (!viaje){
      return res.status(400).json({message:"Viaje no econtrado"});
    }
    const costosExtrasFinal =
      typeof costosExtras === "string"
        ? JSON.parse(costosExtras || "[]")
        : Array.isArray(costosExtras)
          ? costosExtras
          : [];
    const newViatic=await Viatico.create({
      tripId,
      tripNombre: 
      viaje.rutaAcubrir || 
      viaje.destino || 
      "Sin viaje",
      conductorNombre:
      (viaje as any).conductorId?.nombre || "Sin asignar",
      conceptos:conceptosFinal,
      dieselHistorial: typeof dieselHistorial === "string" ?JSON.parse(dieselHistorial):[],
      diselCosto:Number(dieselCosto) || 0,
      dieselCargas:Number(dieselCargas) || 0,
      tag:Number (tag) || 0,
      total:Number (total)  || 0,
      costosExtras: costosExtrasFinal.map((item: any) => ({
        description: String(item.description || ""),
        costo: Number(item.costo || 0),
      })),
      factura,
    });
    return res.status (201).json(newViatic);
    }catch (error){
      console.error("Error al crear viatico",error);
      return res.status(500).json({message:"Error al crear viatico "})
    }
  };


export const updateViatic = async (req:Request, res:Response)=>{
  try {
    const costosExtrasParsed = req.body.costosExtras
      ? typeof req.body.costosExtras === "string"
        ? JSON.parse(req.body.costosExtras)
        : req.body.costosExtras
      : undefined;
    const update:any ={
      conceptos:req.body.conceptos
      ? JSON.parse(req.body.conceptos)
      :undefined,
      dieselHistorial:req.body.dieselHistorial
      ?JSON.parse(req.body.dieselHistorial)
      :undefined,
      dieselCargas:Number(req.body.dieselCargas || 0),
      diselCosto:Number(req.body.dieselCosto || 0),
      tag:Number(req.body.tag || 0),
      total:Number(req.body.total || 0),
      ...(costosExtrasParsed !== undefined
        ? {
            costosExtras: (Array.isArray(costosExtrasParsed) ? costosExtrasParsed : []).map(
              (item: any) => ({
                description: String(item.description || ""),
                costo: Number(item.costo || 0),
              })
            ),
          }
        : {}),
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
        if (isOperatorRole(user?.rol)) {
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

export const getViaticCount=async (req:Request,res:Response)=>{
  try {
    const count =await Viatico.countDocuments();
    res.status(200).json({count});
  }catch(error){
    res.status(500).json({message:"Error al contar viaticos",error});
  }
};