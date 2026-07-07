import { Request, Response } from "express";
import mongoose from "mongoose";
import Trip from "../models/Trip";

export const getTrip = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    let trips;

    if (user.rol?.toLowerCase() === "chofer") {
      trips = await Trip.find({
        conductorId: String(user.id)
      });
    } else {
      trips = await Trip.find();
    }
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Error al obtener los viajes:", error);
    return res.status(500).json({ message: "Error al obtener los viajes" });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const user = (req as any).user;

    if (
      user?.rol?.toLowerCase() === "chofer" && 
      String(trip.conductorId) !== String(user.id)
    ) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el viaje" });
  }
};

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { 
      rutaAcubrir, 
      unidadId, 
      conductorId, 
      fechaSalida, 
      fechaLlegada, 
      destino, 
      estado, 
      kilometrajeSalida, 
      kilometrajeLlegada, 
      acompanante, 
      def 
    } = req.body;

    if (!rutaAcubrir || !unidadId || !conductorId || !fechaSalida || !destino || !estado) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

   
const newTrip = new Trip({
  rutaAcubrir,
  unidadId,
  conductorId: new mongoose.Types.ObjectId(conductorId),
  fechaSalida: new Date(fechaSalida),
  fechaLlegada: fechaLlegada ? new Date(fechaLlegada) : null,
  destino,
  estado,
  // Limpiamos los arrays para asegurarnos que solo tengan lo que el esquema espera
  kilometrajeSalida: Array.isArray(kilometrajeSalida) 
    ? kilometrajeSalida.map(item => ({ numero: Number(item.numero), descripcion: item.descripcion || "" })) 
    : [],
  kilometrajeLlegada: Array.isArray(kilometrajeLlegada) 
    ? kilometrajeLlegada.map(item => ({ numero: Number(item.numero), descripcion: item.descripcion || "" })) 
    : [],
  acompanante: (acompanante === "none" || acompanante === "") ? null : acompanante,
  def: def || "",
});

    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (error) {
    console.error("Error creando viaje:", error);
    res.status(500).json({ message: "Error creando viaje", error });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const user = (req as any).user;
    if (
      user?.rol?.toLowerCase() === "chofer" &&  
      String(trip.conductorId) !== String(user.id)
    ) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    const {
      rutaAcubrir, 
      destino, 
      fechaLlegada, 
      fechaSalida, 
      kilometrajeSalida, 
      kilometrajeLlegada, 
      estado, 
      unidadId, 
      conductorId, 
      acompanante, 
      def
    } = req.body;

    
    if (rutaAcubrir !== undefined) trip.rutaAcubrir = rutaAcubrir;
    if (destino !== undefined) trip.destino = destino;
    if (unidadId !== undefined) trip.unidadId = unidadId;
    if (estado !== undefined) trip.estado = estado;
    if (def !== undefined) trip.def = def;
    
    if (conductorId) trip.conductorId = new mongoose.Types.ObjectId(conductorId);
    if (fechaSalida) trip.fechaSalida = new Date(fechaSalida);
    if (fechaLlegada) trip.fechaLlegada = new Date(fechaLlegada);
    if (acompanante !== undefined) trip.acompanante = acompanante || null;
    
    
    if (Array.isArray(kilometrajeSalida)) {
      trip.kilometrajeSalida = kilometrajeSalida;
      trip.markModified('kilometrajeSalida');
    }
    
    if (Array.isArray(kilometrajeLlegada)) {
      trip.kilometrajeLlegada = kilometrajeLlegada;
      trip.markModified('kilometrajeLlegada'); 
    }

    await trip.save();
    res.json({ message: "Viaje actualizado", trip });
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({ message: "Error al actualizar viaje" });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const user = (req as any).user;
    if (
      user?.rol?.toLowerCase() === "chofer" &&
      String(trip.conductorId) !== String(user.id)
    ) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    await trip.deleteOne();
    res.json({ message: "Viaje eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar viaje" });
  }
};

export const getTripCount = async (req:Request,res:Response)=>{
  try{
    const count=await Trip.countDocuments();
    res.status(200).json({count});
  }catch (error){
    res.status(500).json({message:"Error al contar los vaijes",error})
  }
}