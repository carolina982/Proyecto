"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViaticCount = exports.deleteViatic = exports.updateViatic = exports.createViatic = exports.getViaticByTrip = exports.getViaticById = exports.getViatic = void 0;
const Trip_1 = __importDefault(require("../models/Trip"));
const Viatic_1 = __importDefault(require("../models/Viatic"));
const getViatic = async (req, res) => {
    try {
        const user = req.user;
        let viatics;
        if (user?.rol === "Chofer") {
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
        if (user?.rol === "Chofer") {
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
        if (user?.rol === "Chofer" && (!trip || trip.conductorId.toString() !== user.id.toString())) {
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
        const { tripId, conceptos, dieselHistorial, dieselCosto, dieselCargas, tag, total, costosExtras } = req.body;
        let conceptosFinal = {};
        if (conceptos) {
            const conceptosObj = typeof conceptos === "string" ? JSON.parse(conceptos) : conceptos;
            Object.entries(conceptosObj).forEach(([nombre, data]) => {
                conceptosFinal[nombre] = {
                    cantidad: Number(data.cantidad || 0),
                    costo: Number(data.costo || 0),
                };
            });
        }
        let factura = "";
        if (req.file) {
            factura = `/upload/${req.file.filename}`;
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
        const costosExtrasParsed = req.body.costosExtras
            ? typeof req.body.costosExtras === "string"
                ? JSON.parse(req.body.costosExtras)
                : req.body.costosExtras
            : undefined;
        const update = {
            conceptos: req.body.conceptos
                ? JSON.parse(req.body.conceptos)
                : undefined,
            dieselHistorial: req.body.dieselHistorial
                ? JSON.parse(req.body.dieselHistorial)
                : undefined,
            dieselCargas: Number(req.body.dieselCargas || 0),
            diselCosto: Number(req.body.dieselCosto || 0),
            tag: Number(req.body.tag || 0),
            total: Number(req.body.total || 0),
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
        if (user?.rol === "Chofer") {
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
