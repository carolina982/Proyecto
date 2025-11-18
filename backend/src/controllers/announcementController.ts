import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Announcement from "../models/Announcement";


export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find().sort({ fecha: -1 });
    res.json(announcements);
  } catch (error) {
    console.error("Error cargando anuncios:", error);
    res.status(500).json({ error: "Error cargando anuncios" });
  }
};
export const createAnnouncements = async (req: Request, res: Response) => {
  try {
    console.log("Body recibido:", req.body);
    console.log("Archivo recibido:", req.file);
    const { titulo, contenido } = req.body;
    if (!titulo || !contenido) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const imagePath = req.file ?`/uploads/${req.file.filename}`: null;
    const newAnnouncement = new Announcement({
      titulo,
      contenido,
      fecha: new Date(),
      image: imagePath,
    });
    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error("Error creando anuncio:", error);
    res.status(500).json({ message: "Error al crear el anuncio" });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { titulo, contenido } = req.body;
    const { id } = req.params;
    const existing = await Announcement.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Anuncio no encontrado" });
    }
    if (req.file) {
      if (existing.image) {
        const oldPath = path.join(__dirname, "../../uploads", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      existing.image =`/uploads/${req.file.filename}`;
    }
    existing.titulo = titulo || existing.titulo;
    existing.contenido = contenido || existing.contenido;
    await existing.save();
    res.json(existing);
  } catch (error) {
    console.error("Error actualizando anuncio:", error);
    res.status(500).json({ error: "Error actualizando anuncio" });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await Announcement.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Anuncio no encontrado" });
    }
    if (existing.image) {
      const oldPath = path.join(__dirname, "../../uploads", existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await Announcement.findByIdAndDelete(id);
    res.json({ message: "Anuncio eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando anuncio:", error);
    res.status(500).json({ error: "Error eliminando anuncio" });
  }
};