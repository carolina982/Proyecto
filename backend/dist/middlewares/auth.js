"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const User_1 = __importDefault(require("../models/User"));
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({ message: "Token no proporcionado o fromato incorrecto" });
        }
        const token = authHeader.split(" ")[1].trim();
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Usuario no econtrado" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Error verificando token", error);
        res.status(401).json({ mesage: "Token invalido o expirado" });
    }
};
exports.verifyToken = verifyToken;
