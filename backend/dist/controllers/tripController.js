"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripCount = exports.deleteTrip = exports.updateTrip = exports.createTrip = exports.getTripById = exports.getTrip = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Trip_1 = __importDefault(require("../models/Trip"));
const isOperatorRole = (rol) => {
    const value = (rol || "").toLowerCase();
    return value === "chofer" || value === "operador";
};
const getTrip = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }
        let trips;
        if (isOperatorRole(user.rol)) {
            trips = await Trip_1.default.find({
                conductorId: user.id || user._id,
            });
        }
        else {
            trips = await Trip_1.default.find();
        }
        return res.status(200).json(trips);
    }
    catch (error) {
        console.error("Error al obtener los viajes:", error);
        return res.status(500).json({ message: "Error al obtener los viajes" });
    }
};
exports.getTrip = getTrip;
const getTripById = async (req, res) => {
    try {
        const trip = await Trip_1.default.findById(req.params.id);
        if (!trip)
            return res.status(404).json({ message: "Viaje no encontrado" });
        const user = req.user;
        if (isOperatorRole(user?.rol) &&
            String(trip.conductorId) !== String(user.id)) {
            return res.status(403).json({ message: "No tienes permiso" });
        }
        res.json(trip);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el viaje" });
    }
};
exports.getTripById = getTripById;
const createTrip = async (req, res) => {
    try {
        const { rutaAcubrir, unidadId, conductorId, fechaSalida, fechaLlegada, destino, estado, kilometrajeSalida, kilometrajeLlegada, acompanante, def, multidestino, destinoExtra, } = req.body;
        if (!rutaAcubrir || !unidadId || !conductorId || !fechaSalida || !destino || !estado) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }
        const mapKm = (list) => Array.isArray(list)
            ? list.map((item) => ({
                numero: Number(item.numero),
                descripcion: item.descripcion || "",
            }))
            : [];
        const normalizeDestinosExtras = (extra) => {
            const list = Array.isArray(extra) ? extra : extra ? [extra] : [];
            return list.map((item) => ({
                destino: String(item.destino || ""),
                fechaSalida: item.fechaSalida ? new Date(item.fechaSalida) : null,
                fechaLlegada: item.fechaLlegada ? new Date(item.fechaLlegada) : null,
                conductorId: item.conductorId
                    ? new mongoose_1.default.Types.ObjectId(item.conductorId)
                    : null,
                unidadId: String(item.unidadId || ""),
                acompanante: !item.acompanante || item.acompanante === "none"
                    ? null
                    : new mongoose_1.default.Types.ObjectId(item.acompanante),
                kilometrajeSalida: mapKm(item.kilometrajeSalida),
                kilometrajeLlegada: mapKm(item.kilometrajeLlegada),
            }));
        };
        const newTrip = new Trip_1.default({
            rutaAcubrir,
            unidadId,
            conductorId: new mongoose_1.default.Types.ObjectId(conductorId),
            fechaSalida: new Date(fechaSalida),
            fechaLlegada: fechaLlegada ? new Date(fechaLlegada) : null,
            destino,
            estado,
            kilometrajeSalida: mapKm(kilometrajeSalida),
            kilometrajeLlegada: mapKm(kilometrajeLlegada),
            acompanante: (acompanante === "none" || acompanante === "") ? null : acompanante,
            def: def || "",
            multidestino: Boolean(multidestino),
            destinoExtra: Boolean(multidestino) ? normalizeDestinosExtras(destinoExtra) : [],
            destinoActualIndex: 0,
        });
        await newTrip.save();
        res.status(201).json(newTrip);
    }
    catch (error) {
        console.error("Error creando viaje:", error);
        res.status(500).json({ message: "Error creando viaje", error });
    }
};
exports.createTrip = createTrip;
const updateTrip = async (req, res) => {
    try {
        const trip = await Trip_1.default.findById(req.params.id);
        if (!trip)
            return res.status(404).json({ message: "Viaje no encontrado" });
        const user = req.user;
        if (isOperatorRole(user?.rol) &&
            String(trip.conductorId) !== String(user.id || user._id)) {
            return res.status(403).json({ message: "No tienes permiso" });
        }
        const { rutaAcubrir, destino, fechaLlegada, fechaSalida, kilometrajeSalida, kilometrajeLlegada, estado, unidadId, conductorId, acompanante, def, multidestino, destinoExtra, destinoActualIndex, } = req.body;
        if (rutaAcubrir !== undefined)
            trip.rutaAcubrir = rutaAcubrir;
        if (destino !== undefined)
            trip.destino = destino;
        if (unidadId !== undefined)
            trip.unidadId = unidadId;
        if (estado !== undefined)
            trip.estado = estado;
        if (def !== undefined)
            trip.def = def;
        if (destinoActualIndex !== undefined) {
            trip.destinoActualIndex = Number(destinoActualIndex) || 0;
        }
        if (conductorId)
            trip.conductorId = new mongoose_1.default.Types.ObjectId(conductorId);
        if (fechaSalida)
            trip.fechaSalida = new Date(fechaSalida);
        if (fechaLlegada !== undefined) {
            trip.fechaLlegada = fechaLlegada ? new Date(fechaLlegada) : null;
        }
        if (acompanante !== undefined)
            trip.acompanante = acompanante || null;
        if (Array.isArray(kilometrajeSalida)) {
            trip.kilometrajeSalida = kilometrajeSalida;
            trip.markModified('kilometrajeSalida');
        }
        if (Array.isArray(kilometrajeLlegada)) {
            trip.kilometrajeLlegada = kilometrajeLlegada;
            trip.markModified('kilometrajeLlegada');
        }
        if (multidestino !== undefined) {
            trip.multidestino = Boolean(multidestino);
            if (!trip.multidestino) {
                trip.destinoExtra = [];
            }
            else if (destinoExtra !== undefined) {
                const list = Array.isArray(destinoExtra) ? destinoExtra : destinoExtra ? [destinoExtra] : [];
                trip.destinoExtra = list.map((item) => ({
                    destino: String(item.destino || ""),
                    fechaSalida: item.fechaSalida ? new Date(item.fechaSalida) : null,
                    fechaLlegada: item.fechaLlegada ? new Date(item.fechaLlegada) : null,
                    conductorId: item.conductorId
                        ? new mongoose_1.default.Types.ObjectId(item.conductorId)
                        : null,
                    unidadId: String(item.unidadId || ""),
                    acompanante: !item.acompanante || item.acompanante === "none"
                        ? null
                        : new mongoose_1.default.Types.ObjectId(item.acompanante),
                    kilometrajeSalida: Array.isArray(item.kilometrajeSalida)
                        ? item.kilometrajeSalida.map((km) => ({
                            numero: Number(km.numero),
                            descripcion: km.descripcion || "",
                        }))
                        : [],
                    kilometrajeLlegada: Array.isArray(item.kilometrajeLlegada)
                        ? item.kilometrajeLlegada.map((km) => ({
                            numero: Number(km.numero),
                            descripcion: km.descripcion || "",
                        }))
                        : [],
                }));
                trip.markModified("destinoExtra");
            }
        }
        await trip.save();
        res.json({ message: "Viaje actualizado", trip });
    }
    catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ message: "Error al actualizar viaje" });
    }
};
exports.updateTrip = updateTrip;
const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip_1.default.findById(req.params.id);
        if (!trip)
            return res.status(404).json({ message: "Viaje no encontrado" });
        const user = req.user;
        if (isOperatorRole(user?.rol) &&
            String(trip.conductorId) !== String(user.id || user._id)) {
            return res.status(403).json({ message: "No tienes permiso" });
        }
        await trip.deleteOne();
        res.json({ message: "Viaje eliminado correctamente" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar viaje" });
    }
};
exports.deleteTrip = deleteTrip;
const getTripCount = async (req, res) => {
    try {
        const count = await Trip_1.default.countDocuments();
        res.status(200).json({ count });
    }
    catch (error) {
        res.status(500).json({ message: "Error al contar los vaijes", error });
    }
};
exports.getTripCount = getTripCount;
