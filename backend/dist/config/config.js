"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUDINARY_CLOUD_NAME = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.EMAIL_FROM = exports.RESEND_API_KEY = exports.EMAIL_PASS = exports.EMAIL_USER = exports.JWT_SECRET = exports.MONGO_URI = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/volta";
exports.JWT_SECRET = process.env.JWT_SECRET || "mi_super_secreto";
// Gmail SMTP (único proveedor de correo).
// EMAIL_USER = correo Gmail ; EMAIL_PASS = contraseña de aplicación (16 caracteres).
exports.EMAIL_USER = process.env.EMAIL_USER || "";
exports.EMAIL_PASS = process.env.EMAIL_PASS || "";
// Legacy / no usados en envío (se mantiene por compatibilidad de .env antiguos).
exports.RESEND_API_KEY = process.env.RESEND_API_KEY || "";
exports.EMAIL_FROM = process.env.EMAIL_FROM || "";
//para aguardar imagenes
exports.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
exports.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
exports.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
