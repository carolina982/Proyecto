import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary";

/** URL pública del archivo subido (Cloudinary o disco local). */
export function uploadedFileUrl(file?: Express.Multer.File | null): string | null {
  if (!file) return null;
  const anyFile = file as Express.Multer.File & {
    path?: string;
    secure_url?: string;
    url?: string;
  };
  if (anyFile.path && String(anyFile.path).startsWith("http")) {
    return String(anyFile.path);
  }
  if (anyFile.secure_url) return String(anyFile.secure_url);
  if (anyFile.url && String(anyFile.url).startsWith("http")) {
    return String(anyFile.url);
  }
  if (file.filename) return `/uploads/${file.filename}`;
  return null;
}

/** Borra foto anterior (Cloudinary o archivo en /uploads). */
export async function removeStoredPhoto(photoUrl?: string | null): Promise<void> {
  const prev = String(photoUrl || "").split("?")[0].trim();
  if (!prev) return;

  if (prev.includes("res.cloudinary.com")) {
    try {
      const match = prev.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
      if (match?.[1]) {
        await cloudinary.uploader.destroy(match[1]);
      }
    } catch (e) {
      console.warn("No se pudo borrar foto en Cloudinary", e);
    }
    return;
  }

  if (prev.includes("/uploads/")) {
    const filename = path.basename(prev);
    const filePath = path.join(__dirname, "../../uploads", filename);
    if (filename && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn("No se pudo borrar archivo de foto", e);
      }
    }
  }
}
