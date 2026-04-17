"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrip = exports.updateTrip = exports.createTrip = exports.getTripById = exports.getTrip = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Trip_1 = __importDefault(require("../models/Trip"));
const getTrip = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }
        let trips;
        if (user.rol?.toLowerCase() === "chofer") {
            trips = await Trip_1.default.find({
                conductorId: String(user.id)
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
        if (user?.rol?.toLowerCase() === "chofer" &&
            String(trip.conductorId) == String(user.id)) {
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
        const { nombre, unidadId, conductorId, fechaSalida, fechaLlegada, destino, estado, kilometraje, acompanante, def } = req.body;
        if (!nombre || !unidadId || !conductorId || !fechaSalida || !destino || !estado) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }
        const newTrip = new Trip_1.default({
            nombre,
            unidadId,
            conductorId: new mongoose_1.default.Types.ObjectId(conductorId),
            fechaSalida: new Date(fechaSalida),
            fechaLlegada: fechaLlegada ? new Date(fechaLlegada) : null,
            destino,
            estado,
            kilometraje: Number(kilometraje) || 0,
            acompanante: acompanante || null,
            def: def || "",
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
        if (user?.rol?.toLowerCase() === "chofer" && String(trip.conductorId) !== String(user.id)) {
            return res.status(403).json({ message: "No tienes permiso" });
        }
        Object.assign(trip, req.body);
        await trip.save();
        res.json({ message: "Viaje actualizado", trip });
    }
    catch (error) {
        console.error(error);
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
        if (user?.rol?.toLowerCase() === "chofer" &&
            String(trip.conductorId) !== String(user.id)) {
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
