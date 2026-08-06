"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const roles_1 = require("../auth/roles");
const auth_1 = require("../middlewares/auth");
const rateLimit_1 = require("../middlewares/rateLimit");
const Trip_1 = __importDefault(require("../models/Trip"));
const User_1 = __importStar(require("../models/User"));
const emailService_1 = require("../services/emailService");
const router = (0, express_1.Router)();
const generateResetCode = () => {
    return crypto_1.default.randomInt(100000, 999999).toString();
};
/** Por defecto NO devolver el código en la API. Solo si RESET_CODE_IN_RESPONSE=true. */
const allowResetCodeInResponse = () => String(process.env.RESET_CODE_IN_RESPONSE || "").toLowerCase() === "true";
const GENERIC_FORGOT_MSG = "Si el correo está registrado, enviamos un código de recuperación. Revisa tu bandeja y spam.";
console.log("authRoutes cargando correctamente");
console.log("Mailer activo (recuperación):", (0, emailService_1.getActiveMailer)());
console.log("Código en respuesta API (solo si falla el correo):", allowResetCodeInResponse() ? "sí" : "no");
// REGISTER
router.put("/trips/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Usuario no autorizado" });
        }
        const trip = await Trip_1.default.findById(id);
        if (!trip) {
            return res.status(404).json({ message: "Viaje no encontrado" });
        }
        if ((0, roles_1.isAdminLevel)(user.rol)) {
            Object.assign(trip, req.body);
        }
        else {
            if (trip.conductorId.toString() !== user._id.toString()) {
                return res.status(403).json({ message: "No autorizado" });
            }
            if (req.body.fechaLlegada) {
                trip.fechaLlegada = req.body.fechaLlegada;
                trip.estado = "completado";
            }
        }
        await trip.save();
        res.json({ message: "Viaje actualizado", trip });
    }
    catch (error) {
        console.error("Error actualizando viaje:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});
// LOGIN
router.post("/login", async (req, res) => {
    try {
        // "email" puede ser un correo o un nombre de usuario (se acepta cualquiera).
        const { email, identifier, password } = req.body;
        const rawIdentifier = String(identifier ?? email ?? "").trim();
        if (!rawIdentifier || !password) {
            return res.status(400).json({ message: "Faltan datos" });
        }
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Busca por correo (exacto, en minúsculas) o por nombre (sin distinguir mayúsculas).
        const user = await User_1.default.findOne({
            $or: [
                { email: rawIdentifier.toLowerCase() },
                { nombre: new RegExp(`^${escapeRegex(rawIdentifier)}$`, "i") },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ["$nombre", " ", { $ifNull: ["$apellido", ""] }] },
                            regex: `^${escapeRegex(rawIdentifier)}$`,
                            options: "i",
                        },
                    },
                },
            ],
        }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }
        if (!user.password) {
            return res.status(401).json({
                message: "Este usuario no tiene acceso al inicio de sesión",
            });
        }
        const passwordValid = await user.comparePassword(password);
        if (!passwordValid) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }
        if (!(0, User_1.isBcryptHash)(user.password)) {
            user.password = await (0, User_1.hashPassword)(password);
            user.markModified("password");
            await user.save();
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, config_1.JWT_SECRET, { expiresIn: "7d" });
        const userData = user.toObject({ virtuals: true });
        delete userData.password;
        delete userData.resetToken;
        delete userData.resetTokenExp;
        delete userData.__v;
        userData.id = String(userData._id || "");
        userData.genero = user.genero || "";
        return res.json({
            message: "Inicio de sesión exitoso",
            token,
            user: userData,
        });
    }
    catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
});
// FORGOT PASSWORD — código de 6 dígitos por correo (Gmail SMTP)
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email requerido" });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const ip = (0, rateLimit_1.clientIp)(req);
        // Protección anti-abuso: límite por IP y por correo
        const ipLimit = (0, rateLimit_1.checkRateLimit)({
            key: `forgot:ip:${ip}`,
            max: 8,
            windowMs: 60 * 60 * 1000, // 8 / hora por IP
            minIntervalMs: 15000,
            message: "Demasiadas solicitudes desde esta red. Espera un momento.",
        });
        if (!ipLimit.ok) {
            res.setHeader("Retry-After", String(ipLimit.retryAfterSec));
            return res.status(429).json({ message: ipLimit.message });
        }
        const emailLimit = (0, rateLimit_1.checkRateLimit)({
            key: `forgot:email:${cleanEmail}`,
            max: 3,
            windowMs: 60 * 60 * 1000, // 3 / hora por correo
            minIntervalMs: 90000, // mínimo 90s entre envíos al mismo correo
            message: "Ya se solicitó un código para este correo. Espera un minuto antes de pedir otro.",
        });
        if (!emailLimit.ok) {
            res.setHeader("Retry-After", String(emailLimit.retryAfterSec));
            // Misma respuesta genérica para no revelar si el correo existe
            return res.status(429).json({ message: emailLimit.message });
        }
        const user = await User_1.default.findOne({ email: cleanEmail }).select("+password +resetToken +resetTokenExp");
        // No revelar si el usuario existe. Solo enviamos si tiene acceso (correo + contraseña).
        if (!user || !user.password) {
            console.log(`forgot-password: sin envío (${!user ? "no existe" : "sin contraseña"}): ${cleanEmail} ip=${ip}`);
            return res.json({ message: GENERIC_FORGOT_MSG });
        }
        const resetToken = generateResetCode();
        user.resetToken = resetToken;
        user.resetTokenExp = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        const nombreUsuario = [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || "Hola";
        const sent = await (0, emailService_1.sendPasswordResetCode)({
            to: user.email,
            code: resetToken,
            userName: nombreUsuario,
        });
        if (!sent.ok) {
            const showCode = allowResetCodeInResponse();
            console.error("Fallo envío recuperación:", sent.message, sent.detail || "", showCode ? `| código temporal: ${resetToken}` : `| ip=${ip}`);
            // Solo en desarrollo / si se activa explícitamente (no en producción por defecto)
            if (showCode) {
                return res.json({
                    message: sent.message ||
                        "No se pudo enviar el correo. Usa este código para continuar (válido 10 min).",
                    emailFailed: true,
                    resetCode: resetToken,
                });
            }
            return res.status(502).json({
                message: "No se pudo enviar el correo ahora. Intenta más tarde o contacta al administrador.",
            });
        }
        console.log(`Correo de recuperación enviado a ${user.email} via ${sent.provider}`, sent.id || "", `ip=${ip}`);
        return res.json({ message: GENERIC_FORGOT_MSG });
    }
    catch (error) {
        console.error("Error en forgot-password:", error);
        return res.status(500).json({
            message: "No se pudo procesar la solicitud",
        });
    }
});
// VERIFY RESET CODE (sin cambiar contraseña aún)
router.post("/verify-reset-code", async (req, res) => {
    try {
        const { token, email } = req.body;
        if (!token || !email) {
            return res.status(400).json({ message: "Faltan datos" });
        }
        const ip = (0, rateLimit_1.clientIp)(req);
        const verifyLimit = (0, rateLimit_1.checkRateLimit)({
            key: `verify-reset:ip:${ip}`,
            max: 30,
            windowMs: 60 * 60 * 1000,
            minIntervalMs: 1000,
            message: "Demasiados intentos. Espera un momento.",
        });
        if (!verifyLimit.ok) {
            res.setHeader("Retry-After", String(verifyLimit.retryAfterSec));
            return res.status(429).json({ message: verifyLimit.message });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanToken = String(token).replace(/\D/g, "").trim();
        if (cleanToken.length !== 6) {
            return res.status(400).json({ message: "El código debe ser de 6 dígitos" });
        }
        const user = await User_1.default.findOne({
            email: cleanEmail,
            resetToken: cleanToken,
            resetTokenExp: { $gt: new Date() },
        }).select("+resetToken +resetTokenExp");
        if (!user) {
            return res.status(400).json({
                message: "Código inválido o expirado. Solicita uno nuevo.",
            });
        }
        return res.json({
            ok: true,
            message: "Código verificado. Ahora define tu nueva contraseña.",
        });
    }
    catch (error) {
        console.error("Error en verify-reset-code", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
});
// RESET PASSWORD
// También limitar intentos de reset por IP (fuerza bruta de códigos)
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword, email } = req.body;
        if (!token || !newPassword || !email) {
            return res.status(400).json({ message: "Faltan datos" });
        }
        const ip = (0, rateLimit_1.clientIp)(req);
        const resetIpLimit = (0, rateLimit_1.checkRateLimit)({
            key: `reset:ip:${ip}`,
            max: 20,
            windowMs: 60 * 60 * 1000,
            minIntervalMs: 2000,
            message: "Demasiados intentos. Espera un momento.",
        });
        if (!resetIpLimit.ok) {
            res.setHeader("Retry-After", String(resetIpLimit.retryAfterSec));
            return res.status(429).json({ message: resetIpLimit.message });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanToken = String(token).replace(/\D/g, "").trim();
        const plainPassword = String(newPassword).trim();
        if (cleanToken.length !== 6) {
            return res.status(400).json({ message: "El código debe ser de 6 dígitos" });
        }
        if (plainPassword.length < 6) {
            return res
                .status(400)
                .json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }
        const user = await User_1.default.findOne({
            email: cleanEmail,
            resetToken: cleanToken,
            resetTokenExp: { $gt: new Date() },
        }).select("+password +resetToken +resetTokenExp");
        if (!user) {
            return res.status(400).json({
                message: "Código inválido o expirado. Solicita uno nuevo.",
            });
        }
        user.password = await (0, User_1.hashPassword)(plainPassword);
        user.markModified("password");
        user.resetToken = undefined;
        user.resetTokenExp = undefined;
        await user.save();
        return res.json({
            message: "Contraseña actualizada correctamente",
        });
    }
    catch (error) {
        console.error("Error en reset-password", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
});
/** Cambio de contraseña estando autenticado (perfil). */
router.post("/change-password", auth_1.verifyToken, async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser || authUser.isServiceAccount) {
            return res.status(403).json({ message: "No autorizado" });
        }
        const currentPassword = String(req.body?.currentPassword || "").trimEnd();
        const newPassword = String(req.body?.newPassword || "").trim();
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Ingresa la contraseña actual y la nueva",
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "La nueva contraseña debe tener al menos 6 caracteres",
            });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "La nueva contraseña debe ser distinta a la actual",
            });
        }
        const user = await User_1.default.findById(authUser._id || authUser.id).select("+password");
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        if (!user.password) {
            return res.status(400).json({
                message: "Tu cuenta aún no tiene contraseña configurada",
            });
        }
        const valid = await user.comparePassword(currentPassword);
        if (!valid) {
            return res.status(401).json({ message: "La contraseña actual no es correcta" });
        }
        user.password = await (0, User_1.hashPassword)(newPassword);
        user.markModified("password");
        user.resetToken = undefined;
        user.resetTokenExp = undefined;
        await user.save();
        return res.json({ message: "Contraseña actualizada correctamente" });
    }
    catch (error) {
        console.error("Error en change-password", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
});
exports.default = router;
