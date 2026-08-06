"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnnouncement = exports.updateAnnouncement = exports.createAnnouncements = exports.getAnnouncements = void 0;
const Announcement_1 = __importDefault(require("../models/Announcement"));
const notificationService_1 = require("../services/notificationService");
const uploadHelpers_1 = require("../utils/uploadHelpers");
const parseFijado = (value) => {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string")
        return value.toLowerCase() === "true" || value === "1";
    return false;
};
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement_1.default.find().sort({ fijado: -1, fecha: -1 });
        res.json(announcements);
    }
    catch (error) {
        console.error("Error cargando anuncios:", error);
        res.status(500).json({ error: "Error cargando anuncios" });
    }
};
exports.getAnnouncements = getAnnouncements;
const createAnnouncements = async (req, res) => {
    try {
        const { titulo, contenido, autor, autorPhotoUrl } = req.body;
        if (!titulo || !contenido) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }
        const imagePath = (0, uploadHelpers_1.uploadedFileUrl)(req.file);
        const newAnnouncement = new Announcement_1.default({
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
            const publisherId = req.user?._id || req.user?.id || null;
            await (0, notificationService_1.notifyAnnouncementPublished)(newAnnouncement, publisherId);
        }
        catch (notifyError) {
            console.error("Error notificando anuncio nuevo:", notifyError);
        }
        res.status(201).json(newAnnouncement);
    }
    catch (error) {
        console.error("Error creando anuncio:", error);
        res.status(500).json({ message: "Error al crear el anuncio" });
    }
};
exports.createAnnouncements = createAnnouncements;
const updateAnnouncement = async (req, res) => {
    try {
        const { titulo, contenido, autor, autorPhotoUrl } = req.body;
        const { id } = req.params;
        const existing = await Announcement_1.default.findById(id);
        if (!existing) {
            return res.status(404).json({ message: "Anuncio no encontrado" });
        }
        if (req.file) {
            const nextUrl = (0, uploadHelpers_1.uploadedFileUrl)(req.file);
            if (nextUrl) {
                await (0, uploadHelpers_1.removeStoredPhoto)(existing.image);
                existing.image = nextUrl;
            }
        }
        existing.titulo = titulo || existing.titulo;
        existing.contenido = contenido || existing.contenido;
        if (autor !== undefined)
            existing.autor = String(autor).trim() || existing.autor;
        if (autorPhotoUrl !== undefined)
            existing.autorPhotoUrl = autorPhotoUrl || null;
        if (req.body.fijado !== undefined)
            existing.fijado = parseFijado(req.body.fijado);
        await existing.save();
        res.json(existing);
    }
    catch (error) {
        console.error("Error actualizando anuncio:", error);
        res.status(500).json({ error: "Error actualizando anuncio" });
    }
};
exports.updateAnnouncement = updateAnnouncement;
const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await Announcement_1.default.findById(id);
        if (!existing) {
            return res.status(404).json({ message: "Anuncio no encontrado" });
        }
        await (0, uploadHelpers_1.removeStoredPhoto)(existing.image);
        await Announcement_1.default.findByIdAndDelete(id);
        res.json({ message: "Anuncio eliminado correctamente" });
    }
    catch (error) {
        console.error("Error eliminando anuncio:", error);
        res.status(500).json({ error: "Error eliminando anuncio" });
    }
};
exports.deleteAnnouncement = deleteAnnouncement;
