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
exports.getViaticCount = exports.deleteViatic = exports.updateViatic = exports.createViatic = exports.getViaticByTrip = exports.getViaticById = exports.getViatic = void 0;
const Trip_1 = __importDefault(require("../models/Trip"));
const Viatic_1 = __importDefault(require("../models/Viatic"));
const Settings_1 = __importStar(require("../models/Settings"));
const isOperatorRole = (rol) => {
    const value = (rol || "").toLowerCase();
    return value === "operador" || value === "chofer";
};
const readConcepto = (conceptos, key) => {
    if (!conceptos)
        return null;
    if (typeof conceptos.get === "function")
        return conceptos.get(key) || null;
    return conceptos[key] || null;
};
/** Precio DEF fijado en un registro (snapshot). No usa precio vigente. */
const resolveHistoricalDefPrice = (existingDef) => {
    if (!existingDef)
        return null;
    const stored = Number(existingDef.precioUnitario);
    if (Number.isFinite(stored) && stored > 0)
        return stored;
    const costo = Number(existingDef.costo || 0);
    const cantidad = Number(existingDef.cantidad || 0);
    if (costo > 0 && cantidad > 0)
        return costo / cantidad;
    // Había DEF histórico sin costo: conservar 0 (no reescribir con precio vigente)
    if (cantidad > 0)
        return 0;
    return null;
};
const applyDefSnapshotOnCreate = async (conceptosFinal) => {
    const def = conceptosFinal?.DEF;
    if (!def)
        return;
    const cantidad = Number(def.cantidad || 0);
    const costoManual = Number(def.costo || 0);
    let precio = Number(def.precioUnitario);
    if (!Number.isFinite(precio) || precio < 0) {
        const settings = await Settings_1.default.findOne({ key: Settings_1.SETTINGS_KEY });
        precio = Number(settings?.defUnitPrice ?? Settings_1.DEFAULT_DEF_UNIT_PRICE);
    }
    if (!Number.isFinite(precio) || precio < 0)
        precio = Settings_1.DEFAULT_DEF_UNIT_PRICE;
    def.precioUnitario = precio;
    // Cantidad y costo son manuales; si solo hay cantidad, deriva el costo
    if (costoManual > 0) {
        def.costo = costoManual;
    }
    else if (cantidad > 0) {
        def.costo = cantidad * precio;
    }
};
/**
 * En actualización: si el gasto ya tenía DEF, conserva SU precio unitario.
 * Cambiar el precio vigente NO debe alterar cortes históricos.
 */
const applyDefSnapshotOnUpdate = (conceptosFinal, existingConceptos) => {
    const incoming = conceptosFinal?.DEF;
    if (!incoming)
        return;
    const existingDef = readConcepto(existingConceptos, "DEF");
    const historical = resolveHistoricalDefPrice(existingDef);
    const cantidad = Number(incoming.cantidad || 0);
    const costoManual = Number(incoming.costo || 0);
    if (historical === null) {
        const precio = Number(incoming.precioUnitario);
        if (Number.isFinite(precio) && precio >= 0) {
            incoming.precioUnitario = precio;
            if (costoManual > 0)
                incoming.costo = costoManual;
            else if (cantidad > 0)
                incoming.costo = cantidad * precio;
        }
        return;
    }
    incoming.precioUnitario = historical;
    if (costoManual > 0) {
        incoming.costo = costoManual;
    }
    else {
        incoming.costo = cantidad * historical;
    }
};
const getViatic = async (req, res) => {
    try {
        const user = req.user;
        let viatics;
        if (isOperatorRole(user?.rol)) {
            const trips = await Trip_1.default.find({ conductorId: user.id });
            const tripsIds = trips.map(t => t._id);
            viatics = await Viatic_1.default.find({ tripId: { $in: tripsIds } })
                .populate({ path: "tripId", populate: { path: "conductorId", select: "name email" },
            });
        }
        else {
            viatics = await Viatic_1.default.find().populate({
                path: "tripId",
                populate: { path: "conductorId", select: "name email"
                }
            });
        }
        res.json(viatics);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener viaticos" });
    }
};
exports.getViatic = getViatic;
const getViaticById = async (req, res) => {
    try {
        const viatic = await Viatic_1.default.findById(req.params.id)
            .populate({
            path: "tripId",
            populate: {
                path: "conductorId",
                select: "name email"
            }
        });
        if (!viatic) {
            return res.status(404).json({ message: "Viatico no econtrado" });
        }
        const user = req.user;
        if (isOperatorRole(user?.rol)) {
            const trip = viatic.tripId;
            if (trip.conductorId._id.toString() !== user.id.toString()) {
                return res.status(403).json({ message: "No tienes permisos" });
            }
        }
        res.json(viatic);
    }
    catch (error) {
        console.error(error);
        res.status(500).json;
    }
};
exports.getViaticById = getViaticById;
const getViaticByTrip = async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const user = req.user;
        const trip = await Trip_1.default.findById(tripId);
        if (isOperatorRole(user?.rol) && (!trip || trip.conductorId.toString() !== user.id.toString())) {
            return res.status(403).json({ message: "No tienes permisos para ver estos viáticos" });
        }
        const viatics = await Viatic_1.default.find({ tripId });
        res.json(viatics);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener viáticos por viaje" });
    }
};
exports.getViaticByTrip = getViaticByTrip;
const createViatic = async (req, res) => {
    try {
        const { tripId, conceptos, dieselHistorial, dieselCosto, dieselCargas, tag, total, costosExtras, kilometrajeInicial, kilometrajeFinal, kilometrosRecorridos, totalDefGastado, tipoUnidadDef, } = req.body;
        let conceptosFinal = {};
        if (conceptos) {
            const conceptosObj = typeof conceptos === "string" ? JSON.parse(conceptos) : conceptos;
            Object.entries(conceptosObj).forEach(([nombre, data]) => {
                const entry = {
                    cantidad: Number(data.cantidad || 0),
                    costo: Number(data.costo || 0),
                };
                if (data.precioUnitario !== undefined && data.precioUnitario !== null && data.precioUnitario !== "") {
                    entry.precioUnitario = Number(data.precioUnitario);
                }
                conceptosFinal[nombre] = entry;
            });
            await applyDefSnapshotOnCreate(conceptosFinal);
        }
        let factura = "";
        if (req.file) {
            factura = `/uploads/${req.file.filename}`;
        }
        const viaje = await Trip_1.default.findById(tripId).populate("conductorId", "nombre");
        if (!viaje) {
            return res.status(400).json({ message: "Viaje no econtrado" });
        }
        const costosExtrasFinal = typeof costosExtras === "string"
            ? JSON.parse(costosExtras || "[]")
            : Array.isArray(costosExtras)
                ? costosExtras
                : [];
        const newViatic = await Viatic_1.default.create({
            tripId,
            tripNombre: viaje.rutaAcubrir ||
                viaje.destino ||
                "Sin viaje",
            conductorNombre: viaje.conductorId?.nombre || "Sin asignar",
            conceptos: conceptosFinal,
            dieselHistorial: typeof dieselHistorial === "string" ? JSON.parse(dieselHistorial) : [],
            diselCosto: Number(dieselCosto) || 0,
            dieselCargas: Number(dieselCargas) || 0,
            tag: Number(tag) || 0,
            total: Number(total) || 0,
            kilometrajeInicial: Number(kilometrajeInicial) || 0,
            kilometrajeFinal: Number(kilometrajeFinal) || 0,
            kilometrosRecorridos: Number(kilometrosRecorridos) || 0,
            totalDefGastado: Number(totalDefGastado) || 0,
            tipoUnidadDef: String(tipoUnidadDef || "").trim(),
            costosExtras: costosExtrasFinal.map((item) => ({
                description: String(item.description || ""),
                costo: Number(item.costo || 0),
            })),
            factura,
        });
        return res.status(201).json(newViatic);
    }
    catch (error) {
        console.error("Error al crear viatico", error);
        return res.status(500).json({ message: "Error al crear viatico " });
    }
};
exports.createViatic = createViatic;
const updateViatic = async (req, res) => {
    try {
        const existing = await Viatic_1.default.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Viático no encontrado" });
        }
        const costosExtrasParsed = req.body.costosExtras
            ? typeof req.body.costosExtras === "string"
                ? JSON.parse(req.body.costosExtras)
                : req.body.costosExtras
            : undefined;
        let conceptosNormalized = undefined;
        if (req.body.conceptos) {
            const parsed = typeof req.body.conceptos === "string"
                ? JSON.parse(req.body.conceptos)
                : req.body.conceptos;
            conceptosNormalized = {};
            Object.entries(parsed || {}).forEach(([nombre, data]) => {
                const entry = {
                    cantidad: Number(data?.cantidad || 0),
                    costo: Number(data?.costo || 0),
                };
                if (data?.precioUnitario !== undefined &&
                    data?.precioUnitario !== null &&
                    data?.precioUnitario !== "") {
                    entry.precioUnitario = Number(data.precioUnitario);
                }
                conceptosNormalized[nombre] = entry;
            });
            applyDefSnapshotOnUpdate(conceptosNormalized, existing.conceptos);
        }
        const update = {
            conceptos: conceptosNormalized,
            dieselHistorial: req.body.dieselHistorial
                ? JSON.parse(req.body.dieselHistorial)
                : undefined,
            dieselCargas: Number(req.body.dieselCargas || 0),
            diselCosto: Number(req.body.dieselCosto || 0),
            tag: Number(req.body.tag || 0),
            total: Number(req.body.total || 0),
            kilometrajeInicial: Number(req.body.kilometrajeInicial || 0),
            kilometrajeFinal: Number(req.body.kilometrajeFinal || 0),
            kilometrosRecorridos: Number(req.body.kilometrosRecorridos || 0),
            totalDefGastado: Number(req.body.totalDefGastado || 0),
            tipoUnidadDef: String(req.body.tipoUnidadDef || "").trim(),
            ...(costosExtrasParsed !== undefined
                ? {
                    costosExtras: (Array.isArray(costosExtrasParsed) ? costosExtrasParsed : []).map((item) => ({
                        description: String(item.description || ""),
                        costo: Number(item.costo || 0),
                    })),
                }
                : {}),
        };
        if (req.file)
            update.factura = `/uploads/${req.file.filename}`;
        const viatico = await Viatic_1.default.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json(viatico);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error actualizado viatico" });
    }
};
exports.updateViatic = updateViatic;
const deleteViatic = async (req, res) => {
    try {
        const viatic = await Viatic_1.default.findById(req.params.id);
        if (!viatic)
            return res.status(404).json({ message: "Viático no encontrado" });
        const user = req.user;
        if (isOperatorRole(user?.rol)) {
            const trip = await Trip_1.default.findById(viatic.tripId);
            if (!trip || trip.conductorId.toString() !== user.id.toString()) {
                return res.status(403).json({ message: "No tienes permisos para eliminar este viático" });
            }
        }
        await viatic.deleteOne();
        res.json({ message: "Viático eliminado" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar viático" });
    }
};
exports.deleteViatic = deleteViatic;
const getViaticCount = async (req, res) => {
    try {
        const count = await Viatic_1.default.countDocuments();
        res.status(200).json({ count });
    }
    catch (error) {
        res.status(500).json({ message: "Error al contar viaticos", error });
    }
};
exports.getViaticCount = getViaticCount;
