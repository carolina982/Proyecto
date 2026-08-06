"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMailerConfigured = exports.transporter = void 0;
exports.verifyGmailConnection = verifyGmailConnection;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("./config");
exports.transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: config_1.EMAIL_USER,
        pass: config_1.EMAIL_PASS?.trim(),
    },
});
/** true si hay credenciales de Gmail configuradas. */
const isMailerConfigured = () => Boolean(String(config_1.EMAIL_USER || "").trim() && String(config_1.EMAIL_PASS || "").trim());
exports.isMailerConfigured = isMailerConfigured;
/** Comprueba login SMTP al arrancar (no bloquea el server si falla). */
async function verifyGmailConnection() {
    if (!(0, exports.isMailerConfigured)()) {
        console.warn("Gmail no configurado: faltan EMAIL_USER / EMAIL_PASS");
        return false;
    }
    try {
        await exports.transporter.verify();
        console.log(`Gmail SMTP OK (${config_1.EMAIL_USER})`);
        return true;
    }
    catch (error) {
        console.error("Gmail SMTP falló al verificar:", error?.message || error);
        return false;
    }
}
