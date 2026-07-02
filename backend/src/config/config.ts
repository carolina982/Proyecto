import dotenv from "dotenv";
dotenv.config();

export const MONGO_URI ="mongodb://127.0.0.1:27017/volta";

export const JWT_SECRET =process.env.JWT_SECRET || "mi_super_secreto";


//restablecer la contraseña 

export const RESEND_API_KEY=process.env.RESEND_API_KEY ||"";
export const EMAIL_FROM=process.env.EMAIL_FROM ||"onboarding@resend.dev";

//para aguardar imagenes

export const CLOUDINARY_API_KEY=process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET=process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_CLOUD_NAME=process.env.CLOUDINARY_CLOUD_NAME;