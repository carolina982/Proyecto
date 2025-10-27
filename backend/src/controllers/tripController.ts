import { Request, Response } from "express";
import Trip from "../models/Trip";


export const getTrip = async (req: Request, res: Response) => {
try {
  const user =(req as any).user;
  if (!user){
    return res.status(401).json({message:"Usuario no autenticado"});
  }
  let trips;
  if (user.rol === "chofer"){
    trips=await Trip.find({conductorId:user.id}).populate("conductorID","Nombre apellido email")
    .populate("unidades") .populate("viaticos");
  }else {
    trips=await Trip.find().populate("conductorID","Nombre apellido email")
    .populate("unidades") .populate("viaticos");
  }
  return res.status(200).json(trips);
}catch (error){
  console.error("Error al obtener los viajes",error);
  return res.status(500).json({message:"Error al obtener los viajes"});
}
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const user = (req as any).user;
    if (user?.rol === "Chofer" && trip.conductorId !== user.id) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para ver este viaje" });
    }
    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el viaje" });
  }
};

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { nombre,unidadId,conductorId,fechaSalida,fechaLlegada,destino,estado,kilometraje,} = req.body;

    if (!nombre ||!unidadId ||!conductorId ||!fechaSalida ||!fechaLlegada ||!destino ||!estado ||!kilometraje ) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    const newTrip = new Trip({
      nombre,unidadId,conductorId,fechaSalida: new Date(fechaSalida),fechaLlegada: new Date(fechaLlegada),destino,estado,kilometraje: Number(kilometraje),
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
    if (user?.rol === "Chofer" && trip.conductorId !== user.id) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para actualizar este viaje" });
    }

    Object.assign(trip, req.body);
    await trip.save();
    res.json({ message: "Viaje actualizado", trip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar viaje" });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const user = (req as any).user;
    if (user?.rol === "Chofer" && trip.conductorId !== user.id) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar este viaje" });
    }

    await trip.deleteOne();
    res.json({ message: "Viaje eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar viaje" });
  }
};