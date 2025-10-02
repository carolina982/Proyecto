import { Request, Response } from "express";
import Viatic, { IViatic } from "../models/Viatic";

// Obtener todos los viáticos
export const getViatic = async (req: Request, res: Response) => {
  try {
    const viatics: IViatic[] = await Viatic.find(); 
    if (!viatics || viatics.length === 0) {
      return res.status(404).json({ message: "No hay viáticos registrados" });
    }
    console.log("Viatics encontrados:", viatics);
    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo viáticos", error });
  }
};

// Obtener viáticos por tripId
export const getViaticByTrip = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const viatics: IViatic[] = await Viatic.find({ tripId });
    if (!viatics || viatics.length === 0) {
      return res.status(404).json({ message: "No hay viáticos para este viaje" });
    }
    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

// Obtener viático por ID
export const getViaticById = async (req: Request, res: Response) => {
  try {
    const viatic = await Viatic.findById(req.params.id);
    if (!viatic) {
      return res.status(404).json({ message: "Viático no encontrado" });
    }
    res.json(viatic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener viático", error });
  }
};

// Crear viático
export const createViatic = async (req: Request, res: Response) => {
  console.log("POST recibido en /viatics:", req.body);
  try {
    const viatic = await Viatic.create(req.body);
    res.status(201).json(viatic);
  } catch (error: any) {
    console.error("Error creando viático:", error.message);
    res.status(500).json({ message: "Error creando viático", error: error.message });
  }
};

// Actualizar viático
export const updateViatic = async (req: Request, res: Response) => {
  try {
    const viatic = await Viatic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!viatic) {
      return res.status(404).json({ message: "Viático no encontrado" });
    }
    res.json(viatic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar viático", error });
  }
};

// Eliminar viático
export const deleteViatic = async (req: Request, res: Response) => {
  try {
    const viatic = await Viatic.findByIdAndDelete(req.params.id);
    if (!viatic) {
      return res.status(404).json({ message: "Viático no encontrado" });
    }
    res.json({ message: "Viático eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar viático", error });
  }
};
