"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnnouncement = exports.updateAnnouncement = exports.createAnnouncements = exports.getAnnouncements = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Announcement_1 = __importDefault(require("../models/Announcement"));
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement_1.default.find().sort({ fecha: -1 });
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
        console.log("Body recibido:", req.body);
        console.log("Archivo recibido:", req.file);
        const { titulo, contenido } = req.body;
        if (!titulo || !contenido) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
        const newAnnouncement = new Announcement_1.default({
            titulo,
            contenido,
            fecha: new Date(),
            image: imagePath,
        });
        await newAnnouncement.save();
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
        const { titulo, contenido } = req.body;
        const { id } = req.params;
        const existing = await Announcement_1.default.findById(id);
        if (!existing) {
            return res.status(404).json({ message: "Anuncio no encontrado" });
        }
        if (req.file) {
            if (existing.image) {
                const oldPath = path_1.default.join(__dirname, "../../uploads", existing.image);
                if (fs_1.default.existsSync(oldPath))
                    fs_1.default.unlinkSync(oldPath);
            }
            existing.image = `/uploads/${req.file.filename}`;
        }
        existing.titulo = titulo || existing.titulo;
        existing.contenido = contenido || existing.contenido;
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
        if (existing.image) {
            const oldPath = path_1.default.join(__dirname, "../../uploads", existing.image);
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
        }
        await Announcement_1.default.findByIdAndDelete(id);
        res.json({ message: "Anuncio eliminado correctamente" });
    }
    catch (error) {
        console.error("Error eliminando anuncio:", error);
        res.status(500).json({ error: "Error eliminando anuncio" });
    }
};
exports.deleteAnnouncement = deleteAnnouncement;
