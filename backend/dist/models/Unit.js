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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const InventarioItemSchema = new mongoose_1.Schema({
    cantidad: { type: Number, default: 0 },
    descripcion: { type: String, default: "" },
}, { _id: false });
const InventarioSchema = new mongoose_1.Schema({
    contenido: { type: String, default: "" },
    items: { type: [InventarioItemSchema], default: [] },
    hojaUrl: { type: String, default: "" },
    firmaUrl: { type: String, default: "" },
    operadorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    operadorNombre: { type: String, default: "" },
    creadoPorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
    creadoPorNombre: { type: String, default: "" },
    fecha: { type: Date, default: Date.now },
}, { _id: true });
const UNIT_ESTADOS = [
    "Disponible",
    "Mantenimiento",
    "En ruta",
    "No disponible",
    "Ocupado", // legacy → se muestra/normaliza como "En ruta"
];
const uniSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true },
    placas: { type: String, required: true },
    modelo: { type: String, required: true },
    capacidad: { type: String, required: true },
    estado: { type: String, enum: UNIT_ESTADOS, default: "Disponible" },
    tipoRemolque: { type: String, enum: ["Lowboy", "Caja Seca", ""], default: "" },
    placaRemolque: { type: String, default: "" },
    imagenUrl: { type: String, default: "" },
    inventarios: { type: [InventarioSchema], default: [] },
}, { timestamps: true });
uniSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        // Compat: "Ocupado" legacy → "En ruta"
        if (ret.estado === "Ocupado")
            ret.estado = "En ruta";
    },
});
exports.default = mongoose_1.default.model("Unit", uniSchema);
