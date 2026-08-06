import { Request, Response } from "express";
import Announcement from "../models/Announcement";
import { notifyAnnouncementPublished } from "../services/notificationService";
import { removeStoredPhoto, uploadedFileUrl } from "../utils/uploadHelpers";

const parseFijado = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
  return false;
};

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find().sort({ fijado: -1, fecha: -1 });
    res.json(announcements);
  } catch (error) {
    console.error("Error cargando anuncios:", error);
    res.status(500).json({ error: "Error cargando anuncios" });
  }
};

export const createAnnouncements = async (req: Request, res: Response) => {
  try {
    const { titulo, contenido, autor, autorPhotoUrl } = req.body;
    if (!titulo || !contenido) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const imagePath = uploadedFileUrl(req.file);
    const newAnnouncement = new Announcement({
      titulo,
      contenido,
      fecha: new Date(),
      image: imagePath,
      autor: (autor || "Administración").trim(),
      autorPhotoUrl: autorPhotoUrl || null,
      fijado: parseFijado(req.body.fijado),
    });
    await newAnnouncement.save();

    try {
      const publisherId = (req as any).user?._id || (req as any).user?.id || null;
      await notifyAnnouncementPublished(newAnnouncement, publisherId);
    } catch (notifyError) {
      console.error("Error notificando anuncio nuevo:", notifyError);
    }

    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error("Error creando anuncio:", error);
    res.status(500).json({ message: "Error al crear el anuncio" });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { titulo, contenido, autor, autorPhotoUrl } = req.body;
    const { id } = req.params;
    const existing = await Announcement.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Anuncio no encontrado" });
    }
    if (req.file) {
      const nextUrl = uploadedFileUrl(req.file);
      if (nextUrl) {
        await removeStoredPhoto(existing.image);
        existing.image = nextUrl;
      }
    }
    existing.titulo = titulo || existing.titulo;
    existing.contenido = contenido || existing.contenido;
    if (autor !== undefined) existing.autor = String(autor).trim() || existing.autor;
    if (autorPhotoUrl !== undefined) existing.autorPhotoUrl = autorPhotoUrl || null;
    if (req.body.fijado !== undefined) existing.fijado = parseFijado(req.body.fijado);
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
    await removeStoredPhoto(existing.image);
    await Announcement.findByIdAndDelete(id);
    res.json({ message: "Anuncio eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando anuncio:", error);
    res.status(500).json({ error: "Error eliminando anuncio" });
  }
};
