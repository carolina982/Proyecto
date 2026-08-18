import dotenv from "dotenv";
// override: true — PM2 a veces deja MONGO_URI viejo en el proceso; el .env manda.
dotenv.config({ override: true });

export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voltaDB";

const jwtRaw = String(process.env.JWT_SECRET || "").trim();
const WEAK_JWT = new Set([
  "",
  "mi_super_secreto",
  "cambia_este_secreto",
  "cambia_este_secreto_por_uno_largo",
  "secret",
  "jwtsecret",
]);
if (WEAK_JWT.has(jwtRaw) || jwtRaw.length < 16) {
  console.error(
    "JWT_SECRET ausente o débil. Define uno de al menos 16 caracteres en backend/.env"
  );
  process.exit(1);
}
export const JWT_SECRET = jwtRaw;


// Gmail SMTP (único proveedor de correo).
// EMAIL_USER = correo Gmail ; EMAIL_PASS = contraseña de aplicación (16 caracteres).
export const EMAIL_USER = process.env.EMAIL_USER || "";
export const EMAIL_PASS = process.env.EMAIL_PASS || "";

//para aguardar imagenes

export const CLOUDINARY_API_KEY=process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET=process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_CLOUD_NAME=process.env.CLOUDINARY_CLOUD_NAME;