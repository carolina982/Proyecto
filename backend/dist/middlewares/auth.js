"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const User_1 = __importDefault(require("../models/User"));
function bridgeKeyFromEnv() {
    return String(process.env.HM_BRIDGE_API_KEY || process.env.VOLTA_BRIDGE_API_KEY || "").trim();
}
function isBridgeServiceRequest(req) {
    const expected = bridgeKeyFromEnv();
    if (!expected)
        return false;
    const headerKey = String(req.header("X-HM-Bridge-Key") || "").trim();
    if (headerKey && headerKey === expected)
        return true;
    const authHeader = String(req.header("Authorization") || "");
    if (!authHeader.startsWith("Bearer "))
        return false;
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
const verifyToken = async (req, res, next) => {
    try {
        if (isBridgeServiceRequest(req)) {
            req.user = bridgeServiceUser();
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
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Error verificando token", error);
        res.status(401).json({ message: "Token invalido o expirado" });
    }
};
exports.verifyToken = verifyToken;
