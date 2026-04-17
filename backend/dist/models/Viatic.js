"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DieselSchema = new mongoose_1.default.Schema({
    cargas: { type: Number, default: 0 },
    costo: { type: Number, default: 0 },
}, { _id: false });
const ConceptosSchema = new mongoose_1.default.Schema({
    cantidad: { type: Number, default: 0 },
    costo: { type: Number, default: 0 },
}, { _id: false });
const ViaticoSchema = new mongoose_1.default.Schema({
    tripId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Trip", required: true, },
    conceptos: { type: Map, of: ConceptosSchema, default: {}, },
    dieselHistorial: { ype: [DieselSchema], default: [], },
    dieselCargas: { type: Number, default: 0 },
    diselCosto: { type: Number, default: 0 },
    tag: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    factura: String,
    createAT: { type: Date, default: Date.now },
    tripNombre: { type: String, default: "Sin asignar" },
    conductorNombre: { type: String, default: "Sin asignar" },
});
exports.default = mongoose_1.default.model("Viatico", ViaticoSchema);
