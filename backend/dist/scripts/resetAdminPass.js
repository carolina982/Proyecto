"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
const User_1 = __importDefault(require("../models/User"));
(async () => {
    try {
        console.log("Conectando a MongoDB...");
        await mongoose_1.default.connect(config_1.MONGO_URI);
        const newPassword = "admin123";
        const newHash = await bcryptjs_1.default.hash(newPassword, 10);
        const result = await User_1.default.updateOne({ email: "admin1@gmail.com" }, { $set: { password: newHash } });
        console.log("Resultados de actualizacin", result);
        console.log(`Contraseña del admin actualizada a :${newPassword}`);
    }
    catch (error) {
        console.error("Error al rsetear contraseña", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Desconectado de MongoDB");
    }
})();
