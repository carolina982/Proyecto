"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFacturaDocs = exports.uploadTripDocs = exports.uploadAnnouncements = exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config/config");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const useCloudinary = Boolean(config_1.CLOUDINARY_CLOUD_NAME && config_1.CLOUDINARY_API_KEY && config_1.CLOUDINARY_API_SECRET);
const uploadDir = path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
function createStorage(folder) {
    if (useCloudinary) {
        return new multer_storage_cloudinary_1.CloudinaryStorage({
            cloudinary: cloudinary_1.default,
            params: {
                folder: `volta/${folder}`,
                allowed_formats: ["jpg", "png", "jpeg", "webp"],
            },
        });
    }
    return multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
            cb(null, name);
        },
    });
}
/** Fotos de perfil / registro de usuarios */
exports.upload = (0, multer_1.default)({
    storage: createStorage("profiles"),
    limits: { fileSize: 8 * 1024 * 1024 },
});
/** Imágenes de avisos */
exports.uploadAnnouncements = (0, multer_1.default)({
    storage: createStorage("announcements"),
    limits: { fileSize: 8 * 1024 * 1024 },
});
/** Hojas de entrega / fotos de checklist (disco local; sin tope de tamaño). */
exports.uploadTripDocs = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
            cb(null, name);
        },
    }),
    // Sin delimitación de tamaño (checklist de inicio + hoja de entrega).
    fileFilter: (_req, file, cb) => {
        const ok = /^(image\/(jpeg|jpg|png|webp|heic|heif|gif)|application\/pdf)$/i.test(file.mimetype) ||
            /\.(jpe?g|png|webp|heic|heif|gif|pdf)$/i.test(file.originalname || "");
        cb(null, ok);
    },
});
/** Facturas de viaje: solo PDF / XML, máx. 10 MB. */
exports.uploadFacturaDocs = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
            cb(null, name);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const mime = String(file.mimetype || "").toLowerCase();
        const name = String(file.originalname || "").toLowerCase();
        const ok = mime.includes("pdf") ||
            mime.includes("xml") ||
            mime === "text/xml" ||
            mime === "application/xml" ||
            /\.(pdf|xml)$/i.test(name);
        if (!ok) {
            return cb(new Error("Solo se permiten archivos PDF o XML"));
        }
        cb(null, true);
    },
});
if (useCloudinary) {
    console.log("Uploads: Cloudinary (volta/profiles, volta/announcements); trip docs → disco local");
}
else {
    console.log("Uploads: disco local (backend/uploads) — Cloudinary no configurado");
}
