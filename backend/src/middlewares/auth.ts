import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import User from "../models/User";

interface JwtPayload {
  id: string;
}

function bridgeKeyFromEnv() {
  return String(process.env.HM_BRIDGE_API_KEY || process.env.VOLTA_BRIDGE_API_KEY || "").trim();
}

function isBridgeServiceRequest(req: Request) {
  const expected = bridgeKeyFromEnv();
  if (!expected) return false;
  const headerKey = String(req.header("X-HM-Bridge-Key") || "").trim();
  if (headerKey && headerKey === expected) return true;
  const authHeader = String(req.header("Authorization") || "");
  if (!authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7).trim();
  return token === expected || token === `bridge:${expected}`;
}

/** Usuario sintético Admin para el puente HM ↔ Volta (no vive en BD de usuarios). */
function bridgeServiceUser() {
  return {
    _id: "hm-bridge-service",
    id: "hm-bridge-service",
    email: "bridge-service@grupohm.local",
    rol: "Admin",
    nombre: "Puente",
    apellido: "HM Servicio",
    activo: true,
    isServiceAccount: true,
  };
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (isBridgeServiceRequest(req)) {
      (req as any).user = bridgeServiceUser();
      return next();
    }

    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado o formato incorrecto" });
    }
    const token = authHeader.split(" ")[1]?.trim();
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado o formato incorrecto" });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Error verificando token", error);
    res.status(401).json({ message: "Token invalido o expirado" });
  }
};
