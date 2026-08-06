"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripCount = exports.deleteTrip = exports.updateTripOperador = exports.updateTrip = exports.createTrip = exports.getTripById = exports.getTrip = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const roles_1 = require("../auth/roles");
const Trip_1 = __importDefault(require("../models/Trip"));
const notificationService_1 = require("../services/notificationService");
const unitEstadoSync_1 = require("../services/unitEstadoSync");
/** Operador / Chofer / Ayudante: solo ven viajes donde participan */
const isFieldStaffRole = (rol) => {
    const value = (rol || "").toLowerCase().trim();
    return (value === "chofer" ||
        value === "operador" ||
        value === "ayudante general" ||
        value === "ayudante");
};
const isOperadorRole = (rol) => {
    const value = (rol || "").toLowerCase().trim();
    return value === "operador" || value === "chofer";
};
const isAyudanteRole = (rol) => {
    const value = (rol || "").toLowerCase().trim();
    return value === "ayudante general" || value === "ayudante";
};
const isOperatorRole = isFieldStaffRole;
const userObjectId = (user) => {
    const raw = user?._id || user?.id;
    if (!raw)
        return null;
    const s = String(raw).trim();
    // Puente HM usa id sintético (no ObjectId); no debe tumbar el listado.
    if (!mongoose_1.default.Types.ObjectId.isValid(s) || s.length !== 24)
        return null;
    try {
        return new mongoose_1.default.Types.ObjectId(s);
    }
    catch {
        return null;
    }
};
/** Operador: solo como conductor. Ayudante: como acompañante (o conductor). */
const tripAssignedToUserQuery = (userId, rol) => {
    if (isOperadorRole(rol)) {
        return {
            $or: [{ conductorId: userId }, { "destinoExtra.conductorId": userId }],
        };
    }
    if (isAyudanteRole(rol)) {
        return {
            $or: [
                { acompanante: userId },
                { "destinoExtra.acompanante": userId },
                { conductorId: userId },
                { "destinoExtra.conductorId": userId },
            ],
        };
    }
    return {
        $or: [
            { conductorId: userId },
            { acompanante: userId },
            { "destinoExtra.conductorId": userId },
            { "destinoExtra.acompanante": userId },
        ],
    };
};
const isTripAssignedToUser = (trip, userId, rol) => {
    const asConductor = String(trip.conductorId) === userId ||
        (Array.isArray(trip.destinoExtra) &&
            trip.destinoExtra.some((extra) => extra?.conductorId && String(extra.conductorId) === userId));
    const asCompanion = (trip.acompanante && String(trip.acompanante) === userId) ||
        (Array.isArray(trip.destinoExtra) &&
            trip.destinoExtra.some((extra) => extra?.acompanante && String(extra.acompanante) === userId));
    if (isOperadorRole(rol))
        return asConductor;
    if (isAyudanteRole(rol))
        return asCompanion || asConductor;
    return asConductor || asCompanion;
};
const getTrip = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }
        let trips;
        const uid = userObjectId(user);
        if (isFieldStaffRole(user.rol) && uid) {
            trips = await Trip_1.default.find(tripAssignedToUserQuery(uid, user.rol))
                .sort({ createdAt: -1 })
                .populate("asignadoPor", "nombre apellido");
        }
        else {
            trips = await Trip_1.default.find()
                .sort({ createdAt: -1 })
                .populate("asignadoPor", "nombre apellido");
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
        const trip = await Trip_1.default.findById(req.params.id).populate("asignadoPor", "nombre apellido");
        if (!trip)
            return res.status(404).json({ message: "Viaje no encontrado" });
        const user = req.user;
        const userId = String(user?.id || user?._id || "");
        if (isFieldStaffRole(user?.rol) && !isTripAssignedToUser(trip, userId, user?.rol)) {
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
        const { rutaAcubrir, unidadId, conductorId, fechaSalida, fechaLlegada, destino, cliente, estado, kilometrajeSalida, kilometrajeLlegada, acompanante, def, playo, tarjeta, multidestino, destinoExtra, } = req.body;
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
        const user = req.user;
        const asignadoPorId = user?._id || user?.id || null;
        const newTrip = new Trip_1.default({
            rutaAcubrir,
            unidadId,
            conductorId: new mongoose_1.default.Types.ObjectId(conductorId),
            fechaSalida: new Date(fechaSalida),
            fechaLlegada: fechaLlegada ? new Date(fechaLlegada) : null,
            destino,
            cliente: String(cliente || "").trim(),
            estado,
            kilometrajeSalida: mapKm(kilometrajeSalida),
            kilometrajeLlegada: mapKm(kilometrajeLlegada),
            acompanante: acompanante === "none" || acompanante === "" || !acompanante
                ? null
                : new mongoose_1.default.Types.ObjectId(String(acompanante)),
            def: def || "",
            playo: String(playo || "").trim(),
            tarjeta: String(tarjeta || "").trim(),
            multidestino: Boolean(multidestino),
            destinoExtra: Boolean(multidestino) ? normalizeDestinosExtras(destinoExtra) : [],
            destinoActualIndex: 0,
            asignadoPor: asignadoPorId ? new mongoose_1.default.Types.ObjectId(asignadoPorId) : null,
        });
        await newTrip.save();
        try {
            await (0, unitEstadoSync_1.syncUnitsEstadoForTrip)(newTrip, String(newTrip.estado || ""));
        }
        catch (syncErr) {
            console.error("Error sincronizando estado de unidad:", syncErr);
        }
        try {
            await (0, notificationService_1.notifyTripAssigned)(newTrip);
            // Notificar acompañantes de destinos extras
            const extras = Array.isArray(newTrip.destinoExtra) ? newTrip.destinoExtra : [];
            for (const extra of extras) {
                if (extra?.acompanante) {
                    await (0, notificationService_1.notifyCompanionAssigned)({
                        _id: newTrip._id,
                        rutaAcubrir: newTrip.rutaAcubrir,
                        destino: String(extra.destino || newTrip.destino),
                        acompanante: extra.acompanante,
                        asignadoPor: newTrip.asignadoPor,
                    });
                }
            }
        }
        catch (notifyError) {
            console.error("Error enviando notificaciones de asignación:", notifyError);
        }
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
        const userId = String(user?._id || user?.id || "").trim();
        const conductorIdStr = String(trip.conductorId?._id || trip.conductorId || "").trim();
        const isAdminUser = (0, roles_1.isAdminLevel)(user?.rol);
        const isMainConductor = Boolean(userId && conductorIdStr && userId === conductorIdStr);
        const isExtraConductor = Array.isArray(trip.destinoExtra)
            ? trip.destinoExtra.some((extra) => {
                const extraId = String(extra?.conductorId?._id || extra?.conductorId || "").trim();
                return Boolean(userId && extraId && userId === extraId);
            })
            : false;
        const canOperateTrip = isAdminUser || isMainConductor || isExtraConductor;
        // Solo el conductor asignado (o admin) puede editar / avanzar el viaje
        if (isFieldStaffRole(user?.rol) && !canOperateTrip) {
            return res.status(403).json({
                message: "No tienes permiso para iniciar o actualizar este viaje. Verifica que el viaje esté asignado a tu usuario.",
            });
        }
        const estadoAnterior = trip.estado;
        const acompananteAnterior = trip.acompanante ? String(trip.acompanante) : null;
        const conductorAnterior = trip.conductorId ? String(trip.conductorId) : null;
        const { rutaAcubrir, destino, cliente, fechaLlegada, fechaSalida, kilometrajeSalida, kilometrajeLlegada, estado, unidadId, conductorId, acompanante, def, playo, tarjeta, multidestino, destinoExtra, destinoActualIndex, } = req.body;
        if (rutaAcubrir !== undefined)
            trip.rutaAcubrir = rutaAcubrir;
        if (destino !== undefined)
            trip.destino = destino;
        if (cliente !== undefined)
            trip.cliente = String(cliente || "").trim();
        if (unidadId !== undefined)
            trip.unidadId = unidadId;
        if (estado !== undefined)
            trip.estado = estado;
        if (def !== undefined)
            trip.def = def;
        if (playo !== undefined)
            trip.playo = String(playo || "").trim();
        if (tarjeta !== undefined)
            trip.tarjeta = String(tarjeta || "").trim();
        if (req.body.cartaPorte !== undefined)
            trip.cartaPorte = String(req.body.cartaPorte || "").trim();
        if (req.body.bitacoraHoras !== undefined) {
            trip.bitacoraHoras = String(req.body.bitacoraHoras || "").trim();
        }
        // facturaViaje solo por multipart autorizado (updateTripOperador)
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
        if (acompanante !== undefined) {
            trip.acompanante =
                !acompanante || acompanante === "none"
                    ? null
                    : new mongoose_1.default.Types.ObjectId(String(acompanante));
        }
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
        // Marca/limpia la hora real de finalización según el cambio de estado.
        // Guarda la hora de inicio real la primera vez que pasa a "en progreso".
        if (estado !== undefined) {
            const nuevoEstado = String(estado).toLowerCase();
            const anterior = String(estadoAnterior).toLowerCase();
            if (nuevoEstado === "completado" && anterior !== "completado") {
                trip.finalizadoEn = new Date();
            }
            else if (nuevoEstado !== "completado" && anterior === "completado") {
                trip.finalizadoEn = null;
            }
            if (nuevoEstado === "en progreso" &&
                anterior !== "en progreso" &&
                !trip.iniciadoEn) {
                trip.iniciadoEn = new Date();
            }
        }
        await trip.save();
        try {
            await (0, unitEstadoSync_1.syncUnitsEstadoForTrip)(trip, String(trip.estado || ""));
        }
        catch (syncErr) {
            console.error("Error sincronizando estado de unidad:", syncErr);
        }
        const conductorNuevo = trip.conductorId ? String(trip.conductorId) : null;
        if (conductorNuevo && conductorNuevo !== conductorAnterior) {
            try {
                await (0, notificationService_1.notifyTripAssigned)(trip);
            }
            catch (notifyError) {
                console.error("Error notificando nuevo operador:", notifyError);
            }
        }
        else {
            const acompananteNuevo = trip.acompanante ? String(trip.acompanante) : null;
            if (acompananteNuevo && acompananteNuevo !== acompananteAnterior) {
                try {
                    await (0, notificationService_1.notifyCompanionAssigned)({
                        _id: trip._id,
                        rutaAcubrir: trip.rutaAcubrir,
                        destino: trip.destino,
                        acompanante: acompananteNuevo,
                        asignadoPor: trip.asignadoPor,
                    });
                }
                catch (notifyError) {
                    console.error("Error notificando acompañante:", notifyError);
                }
            }
        }
        const estadoNuevo = trip.estado;
        const seInicio = String(estadoAnterior).toLowerCase() !== "en progreso" &&
            String(estadoNuevo).toLowerCase() === "en progreso";
        const seCompleto = String(estadoAnterior).toLowerCase() !== "completado" &&
            String(estadoNuevo).toLowerCase() === "completado";
        if (seInicio || seCompleto) {
            try {
                const operatorName = isOperatorRole(user?.rol)
                    ? [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || "Operador"
                    : "Un operador";
                if (seInicio) {
                    await (0, notificationService_1.notifyAdminsTripStarted)(trip, operatorName);
                }
                if (seCompleto) {
                    await (0, notificationService_1.notifyAdminsTripCompleted)(trip, operatorName);
                }
            }
            catch (notifyError) {
                console.error("Error enviando notificación de estado de viaje:", notifyError);
            }
        }
        res.json({ message: "Viaje actualizado", trip });
    }
    catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ message: "Error al actualizar viaje" });
    }
};
exports.updateTrip = updateTrip;
/** Acciones del operador: iniciar / parada / finalizar (sin validaciones pesadas del form admin). */
const updateTripOperador = async (req, res) => {
    try {
        const tripId = String(req.params.id || "").trim();
        if (!tripId || !mongoose_1.default.Types.ObjectId.isValid(tripId)) {
            return res.status(400).json({ message: "ID de viaje inválido" });
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }
        const isAdminUser = (0, roles_1.isAdminLevel)(user?.rol);
        const uid = userObjectId(user);
        // Misma regla que el listado: si el viaje aparece en "Mis viajes", puede iniciarlo.
        let trip;
        if (isAdminUser) {
            trip = await Trip_1.default.findById(tripId);
        }
        else if (isFieldStaffRole(user.rol) && uid) {
            trip = await Trip_1.default.findOne({
                _id: tripId,
                ...tripAssignedToUserQuery(uid, user.rol),
            });
            if (!trip) {
                // Puede existir pero no estar asignado a este usuario
                const exists = await Trip_1.default.exists({ _id: tripId });
                if (!exists)
                    return res.status(404).json({ message: "Viaje no encontrado" });
                return res.status(403).json({
                    message: "No tienes permiso para iniciar este viaje. Debe estar asignado a tu usuario como operador.",
                });
            }
        }
        else {
            return res.status(403).json({ message: "No tienes permiso" });
        }
        if (!trip)
            return res.status(404).json({ message: "Viaje no encontrado" });
        const estadoAnterior = trip.estado;
        const parseMaybeJson = (value) => {
            if (typeof value !== "string")
                return value;
            const trimmed = value.trim();
            if (!trimmed)
                return value;
            if (!(trimmed.startsWith("{") || trimmed.startsWith("[")))
                return value;
            try {
                return JSON.parse(trimmed);
            }
            catch {
                return value;
            }
        };
        const body = req.body || {};
        const estado = body.estado;
        const destinoActualIndex = body.destinoActualIndex;
        const fechaSalida = body.fechaSalida;
        const fechaLlegada = body.fechaLlegada;
        const multidestino = body.multidestino;
        const destinoExtra = parseMaybeJson(body.destinoExtra);
        const checklistInicio = parseMaybeJson(body.checklistInicio);
        const checklistRecepcion = parseMaybeJson(body.checklistRecepcion);
        const checklistFin = parseMaybeJson(body.checklistFin);
        const checklistParada = parseMaybeJson(body.checklistParada);
        const $set = {};
        const normalizeChecklist = (raw) => {
            if (!raw || typeof raw !== "object")
                return undefined;
            const notes = raw.observaciones != null
                ? String(raw.observaciones)
                : raw.extras != null
                    ? String(raw.extras)
                    : "";
            const items = Array.isArray(raw.items)
                ? raw.items.map((it) => ({
                    id: String(it?.id || ""),
                    label: String(it?.label || ""),
                    checked: Boolean(it?.checked),
                    foto: String(it?.foto || ""),
                }))
                : [];
            return {
                items,
                extras: notes,
                observaciones: notes,
                completadoEn: raw.completadoEn ? new Date(raw.completadoEn) : new Date(),
            };
        };
        const files = Array.isArray(req.files)
            ? req.files
            : [];
        const hojaFile = files.find((f) => f.fieldname === "hojaEntrega") ||
            req.file;
        if (hojaFile?.filename) {
            $set.hojaEntrega = `/uploads/${hojaFile.filename}`;
        }
        else if (body.hojaEntrega !== undefined) {
            $set.hojaEntrega = String(body.hojaEntrega || "");
        }
        const cartaFile = files.find((f) => f.fieldname === "cartaPorte");
        if (cartaFile?.filename) {
            $set.cartaPorte = `/uploads/${cartaFile.filename}`;
        }
        else if (body.cartaPorte !== undefined) {
            $set.cartaPorte = String(body.cartaPorte || "");
        }
        const bitacoraFile = files.find((f) => f.fieldname === "bitacoraHoras");
        if (bitacoraFile?.filename) {
            $set.bitacoraHoras = `/uploads/${bitacoraFile.filename}`;
        }
        else if (body.bitacoraHoras !== undefined) {
            $set.bitacoraHoras = String(body.bitacoraHoras || "");
        }
        const facturaFile = files.find((f) => f.fieldname === "facturaViaje");
        const wantsFacturaClear = body.facturaViaje !== undefined && !facturaFile;
        if (facturaFile?.filename || wantsFacturaClear) {
            return res.status(403).json({
                message: "La carga de factura de viaje no está habilitada.",
            });
        }
        if (estado !== undefined) {
            const allowed = ["pendiente", "en progreso", "en parada", "completado"];
            if (!allowed.includes(String(estado))) {
                return res.status(400).json({ message: "Estado no válido" });
            }
            $set.estado = String(estado);
        }
        if (destinoActualIndex !== undefined && destinoActualIndex !== null && destinoActualIndex !== "") {
            const idx = Number(destinoActualIndex);
            if (!Number.isInteger(idx) || idx < 0) {
                return res.status(400).json({ message: "Índice de destino inválido" });
            }
            $set.destinoActualIndex = idx;
        }
        if (fechaSalida) {
            const d = new Date(fechaSalida);
            if (Number.isNaN(d.getTime())) {
                return res.status(400).json({ message: "Fecha de salida inválida" });
            }
            $set.fechaSalida = d;
        }
        if (fechaLlegada !== undefined) {
            if (!fechaLlegada) {
                $set.fechaLlegada = null;
            }
            else {
                const d = new Date(fechaLlegada);
                if (Number.isNaN(d.getTime())) {
                    return res.status(400).json({ message: "Fecha de llegada inválida" });
                }
                $set.fechaLlegada = d;
            }
        }
        if (multidestino !== undefined) {
            $set.multidestino = Boolean(multidestino);
        }
        if (destinoExtra !== undefined) {
            const list = Array.isArray(destinoExtra) ? destinoExtra : destinoExtra ? [destinoExtra] : [];
            $set.destinoExtra = list.map((item) => ({
                destino: String(item.destino || ""),
                fechaSalida: item.fechaSalida ? new Date(item.fechaSalida) : null,
                fechaLlegada: item.fechaLlegada ? new Date(item.fechaLlegada) : null,
                conductorId: item.conductorId && mongoose_1.default.Types.ObjectId.isValid(String(item.conductorId))
                    ? new mongoose_1.default.Types.ObjectId(String(item.conductorId))
                    : null,
                unidadId: String(item.unidadId || ""),
                acompanante: item.acompanante &&
                    item.acompanante !== "none" &&
                    mongoose_1.default.Types.ObjectId.isValid(String(item.acompanante))
                    ? new mongoose_1.default.Types.ObjectId(String(item.acompanante))
                    : null,
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
        }
        if (checklistInicio !== undefined) {
            const normalized = normalizeChecklist(checklistInicio);
            if (normalized) {
                const fotoFiles = files.filter((f) => String(f.fieldname || "").startsWith("checklistInicioFoto_"));
                for (const f of fotoFiles) {
                    if (!f.filename)
                        continue;
                    const itemId = String(f.fieldname).replace(/^checklistInicioFoto_/, "");
                    if (!itemId)
                        continue;
                    const url = `/uploads/${f.filename}`;
                    const existing = normalized.items.find((it) => it.id === itemId);
                    if (existing) {
                        existing.foto = url;
                    }
                    else {
                        normalized.items.push({
                            id: itemId,
                            label: "",
                            checked: false,
                            foto: url,
                        });
                    }
                }
                $set.checklistInicio = normalized;
            }
        }
        if (checklistRecepcion !== undefined) {
            const normalized = normalizeChecklist(checklistRecepcion);
            if (normalized) {
                const destIdx = Number(body.destinoRecepcionIndex != null ? body.destinoRecepcionIndex : 0);
                if (!Number.isFinite(destIdx) || destIdx <= 0) {
                    // Destino 1 / viaje simple
                    $set.checklistRecepcion = normalized;
                }
                else {
                    // Destino 2+: upsert recepción en checklistParadas[index]
                    const tripDoc = await Trip_1.default.findById(tripId);
                    if (!tripDoc) {
                        return res.status(404).json({ message: "Viaje no encontrado" });
                    }
                    const list = Array.isArray(tripDoc.checklistParadas)
                        ? [...tripDoc.checklistParadas]
                        : [];
                    const pos = list.findIndex((p) => Number(p?.index) === destIdx);
                    if (pos >= 0) {
                        list[pos] = {
                            ...list[pos],
                            index: destIdx,
                            recepcion: normalized,
                        };
                    }
                    else {
                        list.push({
                            index: destIdx,
                            destino: String((Array.isArray(tripDoc.destinoExtra)
                                ? tripDoc.destinoExtra[destIdx - 1]?.destino
                                : "") ||
                                tripDoc.destino ||
                                ""),
                            items: [],
                            extras: "",
                            completadoEn: null,
                            recepcion: normalized,
                        });
                    }
                    $set.checklistParadas = list;
                }
            }
        }
        if (checklistFin !== undefined) {
            const normalized = normalizeChecklist(checklistFin);
            if (normalized)
                $set.checklistFin = normalized;
        }
        // Checklist de una parada (multidestino): se agrega al historial de paradas.
        const $push = {};
        if (checklistParada !== undefined) {
            const normalized = normalizeChecklist(checklistParada);
            if (normalized) {
                const recepcionParada = normalizeChecklist(checklistParada?.recepcion);
                const closedIndex = Number(checklistParada?.index) || 0;
                $push.checklistParadas = {
                    ...normalized,
                    index: closedIndex,
                    destino: String(checklistParada?.destino || ""),
                    recepcion: recepcionParada || null,
                };
                // Asegura avance del índice aunque el cliente no mande destinoActualIndex (bug móvil).
                const nextIdx = closedIndex + 1;
                const currentIdx = Number(trip.destinoActualIndex ?? 0) || 0;
                if ($set.destinoActualIndex === undefined || Number($set.destinoActualIndex) < nextIdx) {
                    if (nextIdx > currentIdx) {
                        $set.destinoActualIndex = nextIdx;
                    }
                }
            }
        }
        // Marca la hora real de finalización al pasar a "completado" (y la limpia si se reabre).
        // Guarda la hora de inicio real la primera vez que pasa a "en progreso".
        if ($set.estado !== undefined) {
            const nuevoEstado = String($set.estado).toLowerCase();
            const anterior = String(estadoAnterior).toLowerCase();
            if (nuevoEstado === "completado" && anterior !== "completado") {
                $set.finalizadoEn = new Date();
            }
            else if (nuevoEstado !== "completado" && anterior === "completado") {
                $set.finalizadoEn = null;
            }
            if (nuevoEstado === "en progreso" &&
                anterior !== "en progreso" &&
                !trip.iniciadoEn) {
                $set.iniciadoEn = new Date();
            }
        }
        if (Object.keys($set).length === 0 && Object.keys($push).length === 0) {
            return res.status(400).json({ message: "No hay cambios para aplicar" });
        }
        const updateOps = {};
        if (Object.keys($set).length > 0)
            updateOps.$set = $set;
        if (Object.keys($push).length > 0)
            updateOps.$push = $push;
        const updated = await Trip_1.default.findByIdAndUpdate(tripId, updateOps, {
            new: true,
            runValidators: false,
        });
        if (!updated) {
            return res.status(404).json({ message: "Viaje no encontrado" });
        }
        const estadoNuevo = updated.estado;
        const seInicio = String(estadoAnterior).toLowerCase() !== "en progreso" &&
            String(estadoNuevo).toLowerCase() === "en progreso";
        const seCompleto = String(estadoAnterior).toLowerCase() !== "completado" &&
            String(estadoNuevo).toLowerCase() === "completado";
        try {
            await (0, unitEstadoSync_1.syncUnitsEstadoForTrip)(updated, String(estadoNuevo || ""));
        }
        catch (syncErr) {
            console.error("Error sincronizando estado de unidad:", syncErr);
        }
        if (seInicio || seCompleto) {
            try {
                const operatorName = isOperatorRole(user?.rol)
                    ? [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || "Operador"
                    : "Un operador";
                if (seInicio) {
                    await (0, notificationService_1.notifyAdminsTripStarted)(updated, operatorName);
                }
                if (seCompleto) {
                    await (0, notificationService_1.notifyAdminsTripCompleted)(updated, operatorName);
                }
            }
            catch (notifyError) {
                console.error("Error enviando notificación de estado de viaje:", notifyError);
            }
        }
        return res.json({ message: "Viaje actualizado", trip: updated });
    }
    catch (error) {
        console.error("Error actualizando viaje (operador):", error);
        return res.status(500).json({
            message: error?.message || "Error al actualizar viaje",
        });
    }
};
exports.updateTripOperador = updateTripOperador;
const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip_1.default.findById(req.params.id);
        if (!trip)
            return res.status(404).json({ message: "Viaje no encontrado" });
        const user = req.user;
        if (isFieldStaffRole(user?.rol) &&
            String(trip.conductorId) !== String(user.id || user._id)) {
            return res.status(403).json({ message: "No tienes permiso" });
        }
        const snapshot = trip.toObject ? trip.toObject() : trip;
        await trip.deleteOne();
        try {
            // Si el viaje estaba activo, libera unidades (o reconcilia).
            await (0, unitEstadoSync_1.syncUnitsEstadoForTrip)(snapshot, "completado");
        }
        catch (syncErr) {
            console.error("Error sincronizando unidad al eliminar viaje:", syncErr);
        }
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
