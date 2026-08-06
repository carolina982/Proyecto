import { NextFunction, Request, Response } from "express";
import path from "path";
import Factura from "../models/Factura";

/**
 * Impide servir por /uploads archivos que pertenecen a facturas.
 * La descarga debe hacerse vía GET /api/trips/:tripId/facturas/:id/file (con token).
 */
export async function blockFacturaStatic(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filename = path.basename(String(req.path || "").split("?")[0]);
    if (!filename || filename === "." || filename === "..") {
      return next();
    }

    const storedPath = `/uploads/${filename}`;
    const hit = await Factura.exists({
      $or: [{ fileUrl: storedPath }, { xmlUrl: storedPath }],
    });

    if (hit) {
      return res.status(401).json({
        message:
          "Este archivo requiere autenticación. Usa el endpoint de descarga de facturas.",
      });
    }

    return next();
  } catch (err) {
    console.warn("blockFacturaStatic:", err);
    return next();
  }
}
