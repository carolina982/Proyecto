import { Request, Response } from "express";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { hasPermission, PERMISSIONS } from "../auth/permissions";
import Factura from "../models/Factura";
import Trip from "../models/Trip";
import { uploadedFileUrl } from "../utils/uploadHelpers";

const MAX_FACTURA_BYTES = 10 * 1024 * 1024; // 10 MB
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

const detectFileKind = (file: Express.Multer.File): "pdf" | "xml" | null => {
  const name = String(file.originalname || "").toLowerCase();
  const mime = String(file.mimetype || "").toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (
    mime.includes("xml") ||
    mime === "text/xml" ||
    mime === "application/xml" ||
    name.endsWith(".xml")
  ) {
    return "xml";
  }
  return null;
};

/** Resuelve ruta local segura bajo uploads/ a partir de un fileUrl guardado. */
const resolveUploadPath = (fileUrl?: string | null): string | null => {
  const raw = String(fileUrl || "").trim();
  if (!raw || raw.startsWith("http")) return null;
  const filename = path.basename(raw.includes("/uploads/") ? raw.split("/uploads/")[1] : raw);
  if (!filename || filename === "." || filename === "..") return null;
  const full = path.resolve(UPLOADS_DIR, filename);
  const root = path.resolve(UPLOADS_DIR);
  if (!full.startsWith(root + path.sep) && full !== root) {
    return null;
  }
  return full;
};

const guessMime = (filePath: string, fallback?: string) => {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".xml")) return "application/xml";
  return fallback || "application/octet-stream";
};

const serializeFactura = (doc: any) => {
  const id = String(doc._id || doc.id || "");
  const tripId = String(doc.tripId?._id || doc.tripId || "");
  const uploadedBy = doc.uploadedBy;
  const uploadedByUser =
    uploadedBy && typeof uploadedBy === "object"
      ? {
          _id: String(uploadedBy._id || uploadedBy.id || ""),
          nombre: uploadedBy.nombre || "",
          apellido: uploadedBy.apellido || "",
        }
      : null;

  // URLs de descarga autenticadas (no exponer /uploads directo)
  const fileUrl = tripId && id ? `/api/trips/${tripId}/facturas/${id}/file` : "";
  const hasXml = Boolean(String(doc.xmlUrl || "").trim());
  const xmlUrl =
    hasXml && tripId && id ? `/api/trips/${tripId}/facturas/${id}/file?kind=xml` : "";

  return {
    id,
    _id: id,
    tripId,
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileUrl,
    xmlUrl,
    mimeType: doc.mimeType || "",
    sizeBytes: doc.sizeBytes || 0,
    uploadedAt: doc.uploadedAt || doc.createdAt,
    uploadedBy: uploadedByUser
      ? uploadedByUser._id
      : String(uploadedBy || ""),
    uploadedByUser,
    uploadedByName: uploadedByUser
      ? [uploadedByUser.nombre, uploadedByUser.apellido].filter(Boolean).join(" ").trim()
      : "—",
    estado: doc.estado,
  };
};

/** GET /api/trips/:tripId/facturas */
export const listTripFacturas = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!hasPermission(user, PERMISSIONS.FACTURAS_VIEW)) {
      return res.status(403).json({ message: "No tienes permiso para ver facturas" });
    }

    const tripId = String(req.params.tripId || "").trim();
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    const tripExists = await Trip.exists({ _id: tripId });
    if (!tripExists) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const includeDeleted = String(req.query.includeDeleted || "") === "1";
    const filter: Record<string, unknown> = { tripId };
    if (!includeDeleted) filter.estado = "activo";

    const rows = await Factura.find(filter)
      .populate("uploadedBy", "nombre apellido")
      .sort({ uploadedAt: -1 })
      .lean();

    return res.json(rows.map(serializeFactura));
  } catch (error) {
    console.error("Error listando facturas:", error);
    return res.status(500).json({ message: "Error al listar facturas" });
  }
};

/**
 * GET /api/trips/:tripId/facturas/:facturaId/file?kind=pdf|xml
 * Descarga autenticada (requiere facturas.view).
 */
export const downloadTripFacturaFile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!hasPermission(user, PERMISSIONS.FACTURAS_VIEW)) {
      return res.status(403).json({ message: "No tienes permiso para ver facturas" });
    }

    const tripId = String(req.params.tripId || "").trim();
    const facturaId = String(req.params.facturaId || "").trim();
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }
    if (!facturaId || !mongoose.Types.ObjectId.isValid(facturaId)) {
      return res.status(400).json({ message: "ID de factura inválido" });
    }

    const factura = await Factura.findOne({ _id: facturaId, tripId }).lean();
    if (!factura || factura.estado === "eliminado") {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    const kind = String(req.query.kind || "pdf").toLowerCase();
    const storedUrl =
      kind === "xml"
        ? String(factura.xmlUrl || "").trim() || null
        : String(factura.fileUrl || "").trim() || null;

    if (!storedUrl) {
      return res.status(404).json({ message: "Archivo no disponible" });
    }

    // Cloudinary u otra URL remota: redirigir solo a usuarios autenticados
    if (storedUrl.startsWith("http")) {
      return res.redirect(storedUrl);
    }

    const fullPath = resolveUploadPath(storedUrl);
    if (!fullPath || !fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Archivo no encontrado en el servidor" });
    }

    const downloadName =
      kind === "xml"
        ? path.basename(storedUrl) || "factura.xml"
        : String(factura.fileName || path.basename(storedUrl) || "factura.pdf").split(" + ")[0];

    res.setHeader("Content-Type", guessMime(fullPath, factura.mimeType || undefined));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${downloadName.replace(/"/g, "")}"`
    );
    res.setHeader("Cache-Control", "private, no-store");
    return res.sendFile(fullPath);
  } catch (error) {
    console.error("Error descargando factura:", error);
    return res.status(500).json({ message: "Error al descargar la factura" });
  }
};

/** POST /api/trips/:tripId/facturas  (multipart: file y/o filePdf + fileXml) */
export const uploadTripFactura = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!hasPermission(user, PERMISSIONS.FACTURAS_UPLOAD)) {
      return res.status(403).json({ message: "No tienes permiso para cargar facturas" });
    }

    const tripId = String(req.params.tripId || "").trim();
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    const tripExists = await Trip.exists({ _id: tripId });
    if (!tripExists) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const filesMap = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[]
      | undefined;

    let files: Express.Multer.File[] = [];
    if (Array.isArray(filesMap)) {
      files = filesMap;
    } else if (filesMap && typeof filesMap === "object") {
      files = Object.values(filesMap).flat();
    }
    if (req.file) files = [...files, req.file];

    if (!files.length) {
      return res.status(400).json({ message: "Adjunta un archivo PDF o XML" });
    }

    for (const f of files) {
      if ((f.size || 0) > MAX_FACTURA_BYTES) {
        return res.status(400).json({
          message: "El archivo supera el tamaño máximo de 10 MB",
        });
      }
      if (!detectFileKind(f)) {
        return res.status(400).json({
          message: "Solo se permiten archivos PDF o XML",
        });
      }
    }

    let pdfFile: Express.Multer.File | undefined;
    let xmlFile: Express.Multer.File | undefined;
    for (const f of files) {
      const kind = detectFileKind(f);
      if (kind === "pdf") pdfFile = f;
      if (kind === "xml") xmlFile = f;
    }

    if (!pdfFile && !xmlFile) {
      return res.status(400).json({ message: "Solo se permiten archivos PDF o XML" });
    }

    const uploaderId = user._id || user.id;
    if (!uploaderId || !mongoose.Types.ObjectId.isValid(String(uploaderId))) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    let fileType: "pdf" | "xml" | "ambos";
    let fileUrl = "";
    let xmlUrl = "";
    let fileName = "";
    let mimeType = "";
    let sizeBytes = 0;

    if (pdfFile && xmlFile) {
      fileType = "ambos";
      fileUrl = uploadedFileUrl(pdfFile) || "";
      xmlUrl = uploadedFileUrl(xmlFile) || "";
      fileName = `${pdfFile.originalname} + ${xmlFile.originalname}`;
      mimeType = "application/pdf+xml";
      sizeBytes = (pdfFile.size || 0) + (xmlFile.size || 0);
    } else if (pdfFile) {
      fileType = "pdf";
      fileUrl = uploadedFileUrl(pdfFile) || "";
      fileName = pdfFile.originalname || "factura.pdf";
      mimeType = pdfFile.mimetype || "application/pdf";
      sizeBytes = pdfFile.size || 0;
    } else {
      fileType = "xml";
      fileUrl = uploadedFileUrl(xmlFile!) || "";
      fileName = xmlFile!.originalname || "factura.xml";
      mimeType = xmlFile!.mimetype || "application/xml";
      sizeBytes = xmlFile!.size || 0;
    }

    if (!fileUrl) {
      return res.status(500).json({ message: "No se pudo guardar el archivo" });
    }

    const created = await Factura.create({
      tripId,
      fileName,
      fileType,
      fileUrl,
      xmlUrl,
      mimeType,
      sizeBytes,
      uploadedBy: uploaderId,
      uploadedAt: new Date(),
      estado: "activo",
    });

    const populated = await Factura.findById(created._id)
      .populate("uploadedBy", "nombre apellido")
      .lean();

    return res.status(201).json({
      ...serializeFactura(populated || created),
      message: "Factura cargada correctamente",
    });
  } catch (error) {
    console.error("Error subiendo factura:", error);
    return res.status(500).json({ message: "Error al cargar la factura" });
  }
};

/** DELETE /api/trips/:tripId/facturas/:facturaId  (soft delete) */
export const deleteTripFactura = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!hasPermission(user, PERMISSIONS.FACTURAS_DELETE)) {
      return res.status(403).json({ message: "No tienes permiso para eliminar facturas" });
    }

    const tripId = String(req.params.tripId || "").trim();
    const facturaId = String(req.params.facturaId || "").trim();
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }
    if (!facturaId || !mongoose.Types.ObjectId.isValid(facturaId)) {
      return res.status(400).json({ message: "ID de factura inválido" });
    }

    const tripExists = await Trip.exists({ _id: tripId });
    if (!tripExists) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const factura = await Factura.findOne({ _id: facturaId, tripId });
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    if (factura.estado === "eliminado") {
      return res.json({ message: "La factura ya estaba eliminada", id: String(factura._id) });
    }

    factura.estado = "eliminado";
    factura.deletedAt = new Date();
    factura.deletedBy = user._id || user.id;
    await factura.save();

    return res.json({
      message: "Factura eliminada",
      id: String(factura._id),
      estado: factura.estado,
    });
  } catch (error) {
    console.error("Error eliminando factura:", error);
    return res.status(500).json({ message: "Error al eliminar la factura" });
  }
};
