import { Request, Response } from "express";
import fs from "fs";
import Viatic, { IViatic } from "../models/Viatic";

// Obtener todos los viáticos
export const getViatic = async (req: Request, res: Response) => {
  try {
    const viatics: IViatic[] = await Viatic.find();
    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo viáticos" });
  }
};

// Obtener viáticos por viaje
export const getViaticByTrip = async (req: Request, res: Response) => {
  try {
    const viatics: IViatic[] = await Viatic.find({ tripId: req.params.tripId });
    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo viáticos por viaje" });
  }
};

// Obtener viático por ID
export const getViaticById = async (req: Request, res: Response) => {
  try {
    const viatic: IViatic | null = await Viatic.findById(req.params.id);
    if (!viatic) return res.status(404).json({ message: "Viático no encontrado" });
    res.json(viatic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo viático" });
  }
};

// Crear viático
export const createViatic = async (req: Request, res: Response) => {
  console.log("POST recibido en /viatics:", req.body);
  try {
    const { tripId, concepto, descripcion, monto } = req.body;

    if (!tripId || !concepto || !descripcion || !monto) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const viatic = await Viatic.create({
      tripId,
      concepto,
      descripcion,
      monto: Number(monto),
      ticket: req.file ? req.file.path : undefined,
    });

    res.status(201).json(viatic);
  } catch (error: any) {
    console.error("Error creando viático:", error.message);
    res.status(500).json({ message: "Error creando viático", error: error.message });
  }
};

// Actualizar viático
export const updateViatic = async (req: Request, res: Response) => {
  try {
    const { tripId, concepto, descripcion, monto } = req.body;

    const updateData: Partial<IViatic> & { ticket?: string } = {
      tripId,
      concepto,
      descripcion,
      monto: Number(monto),
    };

    if (req.file) {
      updateData.ticket = req.file.path;
    }

    const viaticDoc = await Viatic.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!viaticDoc) return res.status(404).json({ message: "Viático no encontrado" });

    const viatic = viaticDoc.toObject() as IViatic & { ticket?: string };
    res.json(viatic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar viático" });
  }
};

// Eliminar viático
export const deleteViatic = async (req: Request, res: Response) => {
  try {
    const viaticDoc = await Viatic.findByIdAndDelete(req.params.id);
    if (!viaticDoc) return res.status(404).json({ message: "Viático no encontrado" });

    const viatic = viaticDoc.toObject() as IViatic & { ticket?: string };
    if (viatic.ticket && fs.existsSync(viatic.ticket)) {
      fs.unlinkSync(viatic.ticket);
    }

    res.json({ message: "Viático eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar viático:", error);
    res.status(500).json({ message: "Error al eliminar viático", error });
  }
};