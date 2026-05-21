"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config/config");
const User_1 = __importDefault(require("../models/User"));
async function fixPasswords() {
    try {
        console.log("Conectando a MongoDB ..");
        await mongoose_1.default.connect(config_1.MONGO_URI);
        const users = await User_1.default.find();
        let updateCount = 0;
        for (const user of users) {
            const password = user.password;
            if (typeof password === "string" && !password.startsWith("$2b$")) {
                console.log(`Re-hasheando contraseña de :${user.email}`);
                const newHash = await bcryptjs_1.default.hash(password, 10);
                user.password = newHash;
                await user.save();
                updateCount++;
            }
        }
        console.log(`Proceso completado.${updateCount} usuario(s) actualizados`);
    }
    catch (error) {
        console.error("Error reparando contraseñas", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("Desconectando de mongodb");
    }
}
fixPasswords();
