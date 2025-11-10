import { Request, Response } from "express";
import Trip from "../models/Trip";
import Viatico from "../models/Viatic";

export const getViatic = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let viatics;
    if (user?.rol === "Chofer") {
      const trips = await Trip.find({ conductorId: user.id.toString() });
      const tripsIds = trips.map(t => t.id);
      viatics = await Viatico.find({ tripId: { $in: tripsIds } });
    } else {
      viatics = await Viatico.find();
    }
    res.json(viatics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener viáticos" });
  }
};

export const getViaticById = async (req: Request, res: Response) => {
  try {
    const viatic = await Viatico.findById(req.params.id);
    if (!viatic) return res.status(404).json({ message: "Viático no encontrado" });

    const user = (req as any).user;
    if (user?.rol === "Chofer") {
      const trip = await Trip.findById(viatic.tripId);
      if (!trip || trip.conductorId.toString() !== user.id.toString()) {
        return res.status(403).json({ message: "No tienes permisos para ver este viático" });
      }
    }
    res.json(viatic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener viático" });
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

export const createViatic = async (req: Request, res: Response) => {
  try {
    const { tripId, conceptos, dieselCantidad, dieselCosto, tag, total } = req.body;
    const factura = req.file ? `/uploads/${req.file.filename}` : undefined;

    const user = (req as any).user;
    if (user?.rol === "Chofer") {
      const trip = await Trip.findById(tripId);
      if (!trip || trip.conductorId.toString() !== user.id.toString()) {
        return res.status(403).json({ message: "No puedes agregar viáticos a este viaje" });
      }
    }
    const newViatic = await Viatico.create({
      tripId,
      conceptos: JSON.parse(conceptos),
      dieselCantidad: Number(dieselCantidad),
      dieselCosto: Number(dieselCosto),
      tag: Number(tag),
      total: Number(total),
      factura,
    });

    res.json({ message: "Viático registrado exitosamente", viatic: newViatic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear viático" });
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
    const { conceptos, dieselCantidad, dieselCosto, tag, total } = req.body;
    if (conceptos) viatic.conceptos = JSON.parse(conceptos);
    if (dieselCantidad !== undefined) viatic.dieselCantidad = Number(dieselCantidad);
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