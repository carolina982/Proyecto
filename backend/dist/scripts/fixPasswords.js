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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
const User_1 = __importStar(require("../models/User"));
/**
 * Re-hashea contraseñas que quedaron en texto plano en MongoDB.
 * Uso: npx ts-node src/scripts/fixPasswords.ts
 */
async function fixPasswords() {
    try {
        console.log("Conectando a MongoDB...");
        await mongoose_1.default.connect(config_1.MONGO_URI);
        const users = await User_1.default.find().select("+password");
        let updateCount = 0;
        for (const user of users) {
            const password = user.password;
            if (typeof password !== "string" || !password.trim())
                continue;
            if ((0, User_1.isBcryptHash)(password))
                continue;
            console.log(`Re-hasheando contraseña de: ${user.email || user._id}`);
            const newHash = await (0, User_1.hashPassword)(password);
            // updateOne evita que el pre('save') intente procesar de nuevo
            await User_1.default.updateOne({ _id: user._id }, { $set: { password: newHash } });
            updateCount++;
        }
        console.log(`Proceso completado. ${updateCount} usuario(s) actualizados`);
    }
    catch (error) {
        console.error("Error reparando contraseñas", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Desconectado de MongoDB");
    }
}
fixPasswords();
