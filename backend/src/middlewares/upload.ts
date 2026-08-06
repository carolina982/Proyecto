import fs from "fs";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../config/config";
import cloudinary from "../config/cloudinary";

const useCloudinary = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
);

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function createStorage(folder: string) {
  if (useCloudinary) {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `volta/${folder}`,
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      } as any,
    });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      cb(null, name);
    },
  });
}

/** Fotos de perfil / registro de usuarios */
export const upload = multer({
  storage: createStorage("profiles"),
  limits: { fileSize: 8 * 1024 * 1024 },
});

/** Imágenes de avisos */
export const uploadAnnouncements = multer({
  storage: createStorage("announcements"),
  limits: { fileSize: 8 * 1024 * 1024 },
});

/** Hojas de entrega / fotos de checklist (disco local; sin tope de tamaño). */
export const uploadTripDocs = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      cb(null, name);
    },
  }),
  // Sin delimitación de tamaño (checklist de inicio + hoja de entrega).
  fileFilter: (_req, file, cb) => {
    const ok =
      /^(image\/(jpeg|jpg|png|webp|heic|heif|gif)|application\/pdf)$/i.test(
        file.mimetype
      ) ||
      /\.(jpe?g|png|webp|heic|heif|gif|pdf)$/i.test(file.originalname || "");
    cb(null, ok);
  },
});

/** Facturas de viaje: solo PDF / XML, máx. 10 MB. */
export const uploadFacturaDocs = multer({
  storage: multer.diskStorage({
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
    const ok =
      mime.includes("pdf") ||
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
} else {
  console.log("Uploads: disco local (backend/uploads) — Cloudinary no configurado");
}
