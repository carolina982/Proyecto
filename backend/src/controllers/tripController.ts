import { Request, Response } from "express";
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
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error: any) {
    console.error("Error creando viaje:", error.message);
    res.status(500).json({ message: "Error creando viaje", error: error.message });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
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