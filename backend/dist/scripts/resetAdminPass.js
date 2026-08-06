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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
const User_1 = __importStar(require("../models/User"));
/**
 * Rota contraseñas de cuentas de admin/prueba a valores seguros.
 * Uso: npx ts-node src/scripts/resetAdminPass.ts
 * Opcional: RESET_PASS_EMAILS=a@x.com,b@y.com RESET_PASS_VALUE='MiPassSegura!'
 */
const DEFAULT_EMAILS = [
    "al222010146@gmail.com",
    "tics@grupohm.com",
];
function generateSecurePassword(length = 16) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    const bytes = crypto_1.default.randomBytes(length);
    let out = "";
    for (let i = 0; i < length; i++) {
        out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
}
(async () => {
    try {
        console.log("Conectando a MongoDB...");
        await mongoose_1.default.connect(config_1.MONGO_URI);
        const emails = (process.env.RESET_PASS_EMAILS || DEFAULT_EMAILS.join(","))
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
        const sharedPlain = process.env.RESET_PASS_VALUE?.trim() || "";
        const results = [];
        for (const email of emails) {
            const plain = sharedPlain || generateSecurePassword(16);
            const user = await User_1.default.findOne({ email }).select("+password");
            if (!user) {
                console.warn(`No existe usuario: ${email}`);
                results.push({ email, password: "", ok: false });
                continue;
            }
            user.password = await (0, User_1.hashPassword)(plain);
            user.markModified("password");
            await user.save();
            results.push({ email, password: plain, ok: true });
            console.log(`OK actualizada: ${email}`);
        }
        console.log("\n--- Nuevas contraseñas (guarda y bórralas de logs) ---");
        for (const r of results) {
            if (r.ok)
                console.log(`${r.email} => ${r.password}`);
        }
    }
    catch (error) {
        console.error("Error al resetear contraseña", error);
        process.exitCode = 1;
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Desconectado de MongoDB");
    }
})();
