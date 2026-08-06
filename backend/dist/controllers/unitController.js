"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitCount = exports.deleteUnit = exports.updateUnit = exports.getUnitById = exports.getUnits = exports.createUnit = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Unit_1 = __importDefault(require("../models/Unit"));
const unitEstadoSync_1 = require("../services/unitEstadoSync");
const createUnit = async (req, res) => {
    try {
        const data = req.body;
        if (!data.tipoRemolque) {
            data.tipoRemolque = "";
            data.placaRemolque = "";
        }
        const unit = await Unit_1.default.create(data);
        const newUnit = await Unit_1.default.findById(unit._id)
            .populate("inventarios.operadorId", "nombre apellido");
        return res.status(201).json(newUnit || unit);
    }
    catch (error) {
        console.error("Error creando unidad", error);
        res.status(500).json({ message: "Error creando unidad", error });
    }
};
exports.createUnit = createUnit;
const getUnits = async (req, res) => {
    try {
        // Actualiza solos: En ruta ↔ Disponible según viajes activos (todas las unidades).
        try {
            await (0, unitEstadoSync_1.reconcileAllUnitEstados)();
        }
        catch (syncErr) {
            console.error("Error reconciliando estados de unidades:", syncErr);
        }
        const units = await Unit_1.default.find().populate("inventarios.operadorId", "nombre apellido").collation({ locale: "es", numericOrdering: true }).sort({ nombre: 1 });
        res.json(units);
    }
    catch (error) {
        console.error("Error obteniendo unidades", error),
            res.status(500).json({ message: "Error obteniendo unidades", error });
    }
};
exports.getUnits = getUnits;
const getUnitById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Id invalido" });
        }
        const unit = await Unit_1.default.findById(id);
        if (!unit) {
            return res.status(404).json({ message: "Unidad no encontrada" });
        }
        res.json(unit);
    }
    catch (error) {
        console.error("Error al obtener unidad ", error);
        res.status(500).json({ message: "Error al obtener unidad ", error });
    }
};
exports.getUnitById = getUnitById;
const updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID Invalido" });
        }
        const data = req.body;
        if (!data.tipoRemolque) {
            data.tipoRemolque = "";
            data.placaRemolque = "";
        }
        const unit = await Unit_1.default.findByIdAndUpdate(id, data, { new: true });
        if (!unit) {
            return res.status(404).json({ message: "Unidad no econtrada" });
        }
        res.json({ message: "Unidad actualizada correctamente", unit });
    }
    catch (error) {
        console.error("Error al actualizar unidad", error);
        res.status(500).json({ message: "Error al actuzalizar unidad", error });
    }
};
exports.updateUnit = updateUnit;
const deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ID recibido para eliminar:", id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }
        const unit = await Unit_1.default.findByIdAndDelete(id);
        if (!unit) {
            return res.status(404).json({ message: "Unidad no encontrada" });
        }
        console.log("Unidad eliminada:", unit.nombre);
        return res.status(200).json({ message: "Unidad eliminada correctamente", id });
    }
    catch (error) {
        console.error("Error eliminando unidad:", error);
        return res.status(500).json({ message: "Error eliminando unidad", error });
    }
};
exports.deleteUnit = deleteUnit;
const getUnitCount = async (req, res) => {
    try {
        const count = await Unit_1.default.countDocuments();
        res.status(200).json({ count });
    }
    catch (error) {
        res.status(500).json({ message: "Error al contar unidades", error });
    }
};
exports.getUnitCount = getUnitCount;
