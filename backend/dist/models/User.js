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
exports.isBcryptHash = void 0;
exports.joinApellidos = joinApellidos;
exports.hashPassword = hashPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importStar(require("mongoose"));
/** Une apellido paterno + materno en un solo string. */
function joinApellidos(paterno, materno) {
    return [paterno, materno]
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .join(" ");
}
const isBcryptHash = (value) => typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);
exports.isBcryptHash = isBcryptHash;
/** Hashea contraseña en texto plano. Si ya es bcrypt, la deja igual. */
async function hashPassword(plainOrHash) {
    const value = String(plainOrHash || "");
    if (!value)
        return value;
    if ((0, exports.isBcryptHash)(value))
        return value;
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(value, salt);
}
const userSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String },
    apellidoPaterno: { type: String, default: "" },
    apellidoMaterno: { type: String, default: "" },
    genero: {
        type: String,
        enum: ["", "femenino", "masculino"],
        default: "",
    },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    // Operadores creados solo como catálogo pueden no tener acceso al login
    password: { type: String, required: false, select: false },
    rol: {
        type: String,
        enum: [
            "Administrador",
            "Usuario",
            "Admin",
            "Operador",
            "Ayudante General",
            // Legacy: se normaliza a Administrador al guardar
            "Superadministrador",
        ],
        required: true,
    },
    contacto: { type: String },
    activo: { type: Boolean, default: true },
    photoUrl: { type: String, default: null },
    origen: { type: String, default: null },
    expoPushToken: { type: String, default: null },
    permissions: { type: [String], default: [] },
    emailNotifications: {
        enabled: { type: Boolean, default: false },
        tripAssigned: { type: Boolean, default: false },
        tripStarted: { type: Boolean, default: false },
        tripCompleted: { type: Boolean, default: false },
    },
    resetToken: { type: String, select: false },
    resetTokenExp: { type: Date, select: false },
}, { timestamps: true });
userSchema.set("toJSON", {
    virtuals: true,
    transform(_doc, ret) {
        ret.id = String(ret._id || ret.id || "");
        delete ret.password;
        delete ret.resetToken;
        delete ret.resetTokenExp;
        delete ret.__v;
        return ret;
    },
});
userSchema.set("toObject", { virtuals: true });
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password)
        return;
    // Evita doble-hash si ya viene hasheada
    if ((0, exports.isBcryptHash)(this.password))
        return;
    this.password = await hashPassword(this.password);
});
userSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();
    if (!update)
        return;
    const plainUpdate = update;
    const password = plainUpdate.$set?.password ?? plainUpdate.password;
    if (!password)
        return;
    const hash = await hashPassword(password);
    if (!plainUpdate.$set) {
        plainUpdate.$set = {};
    }
    plainUpdate.$set.password = hash;
    if (plainUpdate.password !== undefined) {
        delete plainUpdate.password;
    }
});
userSchema.methods.comparePassword = async function (password) {
    // Asegura tener el campo aunque password tenga select:false
    const stored = this.password ||
        (await mongoose_1.default.model("User").findById(this._id).select("+password").then((u) => u?.password));
    if (!stored)
        return false;
    // Contraseña guardada en texto plano (datos viejos)
    if (!(0, exports.isBcryptHash)(stored)) {
        return stored === password;
    }
    return bcryptjs_1.default.compare(password, stored);
};
exports.default = mongoose_1.default.model("User", userSchema);
