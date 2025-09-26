import { Request, Response } from "express";
import Viatic, { IViatic } from "../models/Viatic";


export const getViatic = async (req: Request, res: Response) => {
  try {
    // Trae todos los viáticos y poblamos el tripId para ver info del viaje
    const viatics: IViatic[] = await Viatic.find().populate("tripId");

    if (!viatics || viatics.length === 0) {
      return res.status(404).json({ message: "No hay viáticos registrados" });
    }

    console.log("Viatics encontrados:", viatics); // Para debug
    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo viáticos", error });
  }
};


export const getViaticByTrip = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const viatics: IViatic[] = await Viatic.find({ tripId }).populate("tripId");

    if (!viatics || viatics.length === 0) {
      return res.status(404).json({ message: "No hay viáticos para este viaje" });
    }

    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor", error });
  }
};


export const getViaticById = async (req: Request, res: Response) => {
  try {
    const viatic = await Viatic.findById(req.params.id).populate("tripId");

    if (!viatic) {
      return res.status(404).json({ message: "Viático no encontrado" });
    }

    res.json(viatic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener viático", error });
  }
};


export const createViatic = async (req: Request, res: Response) => {
  console.log("POST recibido en /viatics:", req.body); // <- ver qué llega
  try {
    const viatic = await Viatic.create(req.body);
    res.status(201).json(viatic);
  } catch (error: any) {
    console.error("Error creando viático:", error.message);
    res.status(500).json({ message: "Error creando viático", error: error.message });
}
};

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


export const deleteViatic = async (req: Request, res: Response) => {
  try {
    const viatic = await Viatic.findByIdAndDelete(req.params._id);

    if (!viatic) {
      return res.status(404).json({ message: "Viático no encontrado" });
    }

    res.json({ message: "Viático eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar viático", error });
  }
};