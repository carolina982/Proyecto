import { Request, Response } from "express";
import mongoose from "mongoose";
import Trip, { ITrip } from "../models/Trip";

export const getTrip = async (req: Request, res: Response) => {
  try {
    const trips: ITrip[] = await Trip.find();
    if (!trips.length) return res.status(404).json({ message: "No hay viajes registrados" });
    res.json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo viajes", error });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });
    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo viaje", error });
  }
};

export const createTrip = async (req: Request, res: Response) => {
  console.log("POST recibido en /trips:", req.body);
  try {
    const { nombre, unidadId, conductorId, fechaSalida, fechaLlegada, destino, estado } = req.body;

    const trip = await Trip.create({
      nombre,
      unidadId: new mongoose.Types.ObjectId(unidadId),
      conductorId: new mongoose.Types.ObjectId(conductorId),
      fechaSalida: new Date(fechaSalida),
      fechaLlegada: new Date(fechaLlegada),
      destino,
      estado,
    });

    res.status(201).json(trip);
  } catch (error: any) {
    console.error("Error creando viaje:", error.message);
    res.status(500).json({ message: "Error creando viaje", error: error.message });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const { nombre, unidadId, conductorId, fechaSalida, fechaLlegada, destino, estado } = req.body;

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        unidadId: unidadId ? new mongoose.Types.ObjectId(unidadId) : undefined,
        conductorId: conductorId ? new mongoose.Types.ObjectId(conductorId) : undefined,
        fechaSalida: fechaSalida ? new Date(fechaSalida) : undefined,
        fechaLlegada: fechaLlegada ? new Date(fechaLlegada) : undefined,
        destino,
        estado,
      },
      { new: true }
    );

    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });
    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando viaje", error });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });
    res.json({ message: "Viaje eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando viaje", error });
  }
};