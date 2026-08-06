import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER } from "./config";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS?.trim(),
  },
});

/** true si hay credenciales de Gmail configuradas. */
export const isMailerConfigured = () =>
  Boolean(String(EMAIL_USER || "").trim() && String(EMAIL_PASS || "").trim());

/** Comprueba login SMTP al arrancar (no bloquea el server si falla). */
export async function verifyGmailConnection(): Promise<boolean> {
  if (!isMailerConfigured()) {
    console.warn("Gmail no configurado: faltan EMAIL_USER / EMAIL_PASS");
    return false;
  }
  try {
    await transporter.verify();
    console.log(`Gmail SMTP OK (${EMAIL_USER})`);
    return true;
  } catch (error: any) {
    console.error("Gmail SMTP falló al verificar:", error?.message || error);
    return false;
  }
}
