import { Request, Response } from "express";
import mongoose from "mongoose";
import { isAdminLevel } from "../auth/roles";
import Trip from "../models/Trip";
import {
  notifyAdminsTripCompleted,
  notifyAdminsTripStarted,
  notifyCompanionAssigned,
  notifyTripAssigned,
} from "../services/notificationService";
import { syncUnitsEstadoForTrip } from "../services/unitEstadoSync";

/** Operador / Chofer / Ayudante: solo ven viajes donde participan */
const isFieldStaffRole = (rol?: string) => {
  const value = (rol || "").toLowerCase().trim();
  return (
    value === "chofer" ||
    value === "operador" ||
    value === "ayudante general" ||
    value === "ayudante"
  );
};

const isOperadorRole = (rol?: string) => {
  const value = (rol || "").toLowerCase().trim();
  return value === "operador" || value === "chofer";
};

const isAyudanteRole = (rol?: string) => {
  const value = (rol || "").toLowerCase().trim();
  return value === "ayudante general" || value === "ayudante";
};

const isOperatorRole = isFieldStaffRole;

const userObjectId = (user: any) => {
  const raw = user?._id || user?.id;
  if (!raw) return null;
  const s = String(raw).trim();
  // Puente HM usa id sintético (no ObjectId); no debe tumbar el listado.
  if (!mongoose.Types.ObjectId.isValid(s) || s.length !== 24) return null;
  try {
    return new mongoose.Types.ObjectId(s);
  } catch {
    return null;
  }
};

/** Operador: solo como conductor. Ayudante: como acompañante (o conductor). */
const tripAssignedToUserQuery = (userId: mongoose.Types.ObjectId, rol?: string) => {
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

const isTripAssignedToUser = (trip: any, userId: string, rol?: string) => {
  const asConductor =
    String(trip.conductorId) === userId ||
    (Array.isArray(trip.destinoExtra) &&
      trip.destinoExtra.some(
        (extra: any) => extra?.conductorId && String(extra.conductorId) === userId
      ));
  const asCompanion =
    (trip.acompanante && String(trip.acompanante) === userId) ||
    (Array.isArray(trip.destinoExtra) &&
      trip.destinoExtra.some(
        (extra: any) => extra?.acompanante && String(extra.acompanante) === userId
      ));

  if (isOperadorRole(rol)) return asConductor;
  if (isAyudanteRole(rol)) return asCompanion || asConductor;
  return asConductor || asCompanion;
};

export const getTrip = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    let trips;
    const uid = userObjectId(user);

    if (isFieldStaffRole(user.rol) && uid) {
      trips = await Trip.find(tripAssignedToUserQuery(uid, user.rol))
        .sort({ createdAt: -1 })
        .populate("asignadoPor", "nombre apellido");
    } else {
      trips = await Trip.find()
        .sort({ createdAt: -1 })
        .populate("asignadoPor", "nombre apellido");
    }
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Error al obtener los viajes:", error);
    return res.status(500).json({ message: "Error al obtener los viajes" });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("asignadoPor", "nombre apellido");
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const user = (req as any).user;
    const userId = String(user?.id || user?._id || "");

    if (isFieldStaffRole(user?.rol) && !isTripAssignedToUser(trip, userId, user?.rol)) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el viaje" });
  }
};

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { 
      rutaAcubrir, 
      unidadId, 
      conductorId, 
      fechaSalida, 
      fechaLlegada, 
      destino,
      cliente,
      estado, 
      kilometrajeSalida, 
      kilometrajeLlegada, 
      acompanante, 
      def,
      playo,
      tarjeta,
      multidestino,
      destinoExtra,
    } = req.body;

    if (!rutaAcubrir || !unidadId || !conductorId || !fechaSalida || !destino || !estado) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const mapKm = (list: any) =>
      Array.isArray(list)
        ? list.map((item: any) => ({
            numero: Number(item.numero),
            descripcion: item.descripcion || "",
          }))
        : [];

    const normalizeDestinosExtras = (extra: any) => {
      const list = Array.isArray(extra) ? extra : extra ? [extra] : [];
      return list.map((item: any) => ({
        destino: String(item.destino || ""),
        fechaSalida: item.fechaSalida ? new Date(item.fechaSalida) : null,
        fechaLlegada: item.fechaLlegada ? new Date(item.fechaLlegada) : null,
        conductorId: item.conductorId
          ? new mongoose.Types.ObjectId(item.conductorId)
          : null,
        unidadId: String(item.unidadId || ""),
        acompanante:
          !item.acompanante || item.acompanante === "none"
            ? null
            : new mongoose.Types.ObjectId(item.acompanante),
        kilometrajeSalida: mapKm(item.kilometrajeSalida),
        kilometrajeLlegada: mapKm(item.kilometrajeLlegada),
      }));
    };

   
const user = (req as any).user;
const asignadoPorId = user?._id || user?.id || null;

const newTrip = new Trip({
  rutaAcubrir,
  unidadId,
  conductorId: new mongoose.Types.ObjectId(conductorId),
  fechaSalida: new Date(fechaSalida),
  fechaLlegada: fechaLlegada ? new Date(fechaLlegada) : null,
  destino,
  cliente: String(cliente || "").trim(),
  estado,
  kilometrajeSalida: mapKm(kilometrajeSalida),
  kilometrajeLlegada: mapKm(kilometrajeLlegada),
  acompanante:
    acompanante === "none" || acompanante === "" || !acompanante
      ? null
      : new mongoose.Types.ObjectId(String(acompanante)),
  def: def || "",
  playo: String(playo || "").trim(),
  tarjeta: String(tarjeta || "").trim(),
  multidestino: Boolean(multidestino),
  destinoExtra: Boolean(multidestino) ? normalizeDestinosExtras(destinoExtra) : [],
  destinoActualIndex: 0,
  asignadoPor: asignadoPorId ? new mongoose.Types.ObjectId(asignadoPorId) : null,
});

    await newTrip.save();

    try {
      await syncUnitsEstadoForTrip(newTrip, String(newTrip.estado || ""));
    } catch (syncErr) {
      console.error("Error sincronizando estado de unidad:", syncErr);
    }

    try {
      await notifyTripAssigned(newTrip);
      // Notificar acompañantes de destinos extras
      const extras = Array.isArray(newTrip.destinoExtra) ? newTrip.destinoExtra : [];
      for (const extra of extras) {
        if (extra?.acompanante) {
          await notifyCompanionAssigned({
            _id: newTrip._id,
            rutaAcubrir: newTrip.rutaAcubrir,
            destino: String(extra.destino || newTrip.destino),
            acompanante: extra.acompanante,
            asignadoPor: newTrip.asignadoPor,
          });
        }
      }
    } catch (notifyError) {
      console.error("Error enviando notificaciones de asignación:", notifyError);
    }

    res.status(201).json(newTrip);
  } catch (error) {
    console.error("Error creando viaje:", error);
    res.status(500).json({ message: "Error creando viaje", error });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const user = (req as any).user;
    const userId = String(user?._id || user?.id || "").trim();
    const conductorIdStr = String(
      (trip.conductorId as any)?._id || trip.conductorId || ""
    ).trim();
    const isAdminUser = isAdminLevel(user?.rol);
    const isMainConductor = Boolean(userId && conductorIdStr && userId === conductorIdStr);
    const isExtraConductor = Array.isArray(trip.destinoExtra)
      ? trip.destinoExtra.some((extra: any) => {
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

    const {
      rutaAcubrir, 
      destino,
      cliente,
      fechaLlegada, 
      fechaSalida, 
      kilometrajeSalida, 
      kilometrajeLlegada, 
      estado, 
      unidadId, 
      conductorId, 
      acompanante, 
      def,
      playo,
      tarjeta,
      multidestino,
      destinoExtra,
      destinoActualIndex,
    } = req.body;

    
    if (rutaAcubrir !== undefined) trip.rutaAcubrir = rutaAcubrir;
    if (destino !== undefined) trip.destino = destino;
    if (cliente !== undefined) trip.cliente = String(cliente || "").trim();
    if (unidadId !== undefined) trip.unidadId = unidadId;
    if (estado !== undefined) trip.estado = estado;
    if (def !== undefined) trip.def = def;
    if (playo !== undefined) trip.playo = String(playo || "").trim();
    if (tarjeta !== undefined) trip.tarjeta = String(tarjeta || "").trim();
    if (req.body.cartaPorte !== undefined) trip.cartaPorte = String(req.body.cartaPorte || "").trim();
    if (req.body.bitacoraHoras !== undefined) {
      trip.bitacoraHoras = String(req.body.bitacoraHoras || "").trim();
    }
    // facturaViaje solo por multipart autorizado (updateTripOperador)
    if (destinoActualIndex !== undefined) {
      trip.destinoActualIndex = Number(destinoActualIndex) || 0;
    }
    
    if (conductorId) trip.conductorId = new mongoose.Types.ObjectId(conductorId);
    if (fechaSalida) trip.fechaSalida = new Date(fechaSalida);
    if (fechaLlegada !== undefined) {
      trip.fechaLlegada = fechaLlegada ? new Date(fechaLlegada) : null;
    }
    if (acompanante !== undefined) {
      trip.acompanante =
        !acompanante || acompanante === "none"
          ? null
          : new mongoose.Types.ObjectId(String(acompanante));
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
      } else if (destinoExtra !== undefined) {
        const list = Array.isArray(destinoExtra) ? destinoExtra : destinoExtra ? [destinoExtra] : [];
        trip.destinoExtra = list.map((item: any) => ({
          destino: String(item.destino || ""),
          fechaSalida: item.fechaSalida ? new Date(item.fechaSalida) : null,
          fechaLlegada: item.fechaLlegada ? new Date(item.fechaLlegada) : null,
          conductorId: item.conductorId
            ? new mongoose.Types.ObjectId(item.conductorId)
            : null,
          unidadId: String(item.unidadId || ""),
          acompanante:
            !item.acompanante || item.acompanante === "none"
              ? null
              : new mongoose.Types.ObjectId(item.acompanante),
          kilometrajeSalida: Array.isArray(item.kilometrajeSalida)
            ? item.kilometrajeSalida.map((km: any) => ({
                numero: Number(km.numero),
                descripcion: km.descripcion || "",
              }))
            : [],
          kilometrajeLlegada: Array.isArray(item.kilometrajeLlegada)
            ? item.kilometrajeLlegada.map((km: any) => ({
                numero: Number(km.numero),
                descripcion: km.descripcion || "",
              }))
            : [],
        })) as any;
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
      } else if (nuevoEstado !== "completado" && anterior === "completado") {
        trip.finalizadoEn = null;
      }
      if (
        nuevoEstado === "en progreso" &&
        anterior !== "en progreso" &&
        !trip.iniciadoEn
      ) {
        trip.iniciadoEn = new Date();
      }
    }

    await trip.save();

    try {
      await syncUnitsEstadoForTrip(trip, String(trip.estado || ""));
    } catch (syncErr) {
      console.error("Error sincronizando estado de unidad:", syncErr);
    }

    const conductorNuevo = trip.conductorId ? String(trip.conductorId) : null;
    if (conductorNuevo && conductorNuevo !== conductorAnterior) {
      try {
        await notifyTripAssigned(trip);
      } catch (notifyError) {
        console.error("Error notificando nuevo operador:", notifyError);
      }
    } else {
      const acompananteNuevo = trip.acompanante ? String(trip.acompanante) : null;
      if (acompananteNuevo && acompananteNuevo !== acompananteAnterior) {
        try {
          await notifyCompanionAssigned({
            _id: trip._id,
            rutaAcubrir: trip.rutaAcubrir,
            destino: trip.destino,
            acompanante: acompananteNuevo,
            asignadoPor: trip.asignadoPor,
          });
        } catch (notifyError) {
          console.error("Error notificando acompañante:", notifyError);
        }
      }
    }

    const estadoNuevo = trip.estado;
    const seInicio =
      String(estadoAnterior).toLowerCase() !== "en progreso" &&
      String(estadoNuevo).toLowerCase() === "en progreso";
    const seCompleto =
      String(estadoAnterior).toLowerCase() !== "completado" &&
      String(estadoNuevo).toLowerCase() === "completado";

    if (seInicio || seCompleto) {
      try {
        const operatorName = isOperatorRole(user?.rol)
          ? [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || "Operador"
          : "Un operador";
        if (seInicio) {
          await notifyAdminsTripStarted(trip, operatorName);
        }
        if (seCompleto) {
          await notifyAdminsTripCompleted(trip, operatorName);
        }
      } catch (notifyError) {
        console.error("Error enviando notificación de estado de viaje:", notifyError);
      }
    }

    res.json({ message: "Viaje actualizado", trip });
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({ message: "Error al actualizar viaje" });
  }
};

/** Acciones del operador: iniciar / parada / finalizar (sin validaciones pesadas del form admin). */
export const updateTripOperador = async (req: Request, res: Response) => {
  try {
    const tripId = String(req.params.id || "").trim();
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "ID de viaje inválido" });
    }

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const isAdminUser = isAdminLevel(user?.rol);
    const uid = userObjectId(user);

    // Misma regla que el listado: si el viaje aparece en "Mis viajes", puede iniciarlo.
    let trip;
    if (isAdminUser) {
      trip = await Trip.findById(tripId);
    } else if (isFieldStaffRole(user.rol) && uid) {
      trip = await Trip.findOne({
        _id: tripId,
        ...tripAssignedToUserQuery(uid, user.rol),
      });
      if (!trip) {
        // Puede existir pero no estar asignado a este usuario
        const exists = await Trip.exists({ _id: tripId });
        if (!exists) return res.status(404).json({ message: "Viaje no encontrado" });
        return res.status(403).json({
          message:
            "No tienes permiso para iniciar este viaje. Debe estar asignado a tu usuario como operador.",
        });
      }
    } else {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const estadoAnterior = trip.estado;
    const parseMaybeJson = (value: any) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      if (!trimmed) return value;
      if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return value;
      try {
        return JSON.parse(trimmed);
      } catch {
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

    const $set: Record<string, unknown> = {};

    const normalizeChecklist = (raw: any) => {
      if (!raw || typeof raw !== "object") return undefined;
      const notes =
        raw.observaciones != null
          ? String(raw.observaciones)
          : raw.extras != null
            ? String(raw.extras)
            : "";
      const items = Array.isArray(raw.items)
        ? raw.items.map((it: any) => ({
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

    const files = Array.isArray((req as any).files)
      ? ((req as any).files as Express.Multer.File[])
      : [];
    const hojaFiles = files.filter((f) => f.fieldname === "hojaEntrega" && f?.filename);
    const singleHojaFallback = (req as any).file as Express.Multer.File | undefined;
    const allHojaFiles =
      hojaFiles.length > 0
        ? hojaFiles
        : singleHojaFallback?.filename
          ? [singleHojaFallback]
          : [];

    if (allHojaFiles.length > 0) {
      const paths = allHojaFiles.map((f) => `/uploads/${f.filename}`);
      $set.hojasEntrega = paths;
      $set.hojaEntrega = paths[0] || "";
    } else if (body.hojasEntrega !== undefined) {
      const parsed = parseMaybeJson(body.hojasEntrega);
      const paths = Array.isArray(parsed)
        ? parsed.map((u: any) => String(u || "").trim()).filter(Boolean)
        : [];
      $set.hojasEntrega = paths;
      $set.hojaEntrega = paths[0] || "";
    } else if (body.hojaEntrega !== undefined) {
      const single = String(body.hojaEntrega || "").trim();
      $set.hojaEntrega = single;
      $set.hojasEntrega = single ? [single] : [];
    }

    const cartaFile = files.find((f) => f.fieldname === "cartaPorte");
    if (cartaFile?.filename) {
      $set.cartaPorte = `/uploads/${cartaFile.filename}`;
    } else if (body.cartaPorte !== undefined) {
      $set.cartaPorte = String(body.cartaPorte || "");
    }

    const bitacoraFile = files.find((f) => f.fieldname === "bitacoraHoras");
    if (bitacoraFile?.filename) {
      $set.bitacoraHoras = `/uploads/${bitacoraFile.filename}`;
    } else if (body.bitacoraHoras !== undefined) {
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
      } else {
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
      $set.destinoExtra = list.map((item: any) => ({
        destino: String(item.destino || ""),
        fechaSalida: item.fechaSalida ? new Date(item.fechaSalida) : null,
        fechaLlegada: item.fechaLlegada ? new Date(item.fechaLlegada) : null,
        conductorId:
          item.conductorId && mongoose.Types.ObjectId.isValid(String(item.conductorId))
            ? new mongoose.Types.ObjectId(String(item.conductorId))
            : null,
        unidadId: String(item.unidadId || ""),
        acompanante:
          item.acompanante &&
          item.acompanante !== "none" &&
          mongoose.Types.ObjectId.isValid(String(item.acompanante))
            ? new mongoose.Types.ObjectId(String(item.acompanante))
            : null,
        kilometrajeSalida: Array.isArray(item.kilometrajeSalida)
          ? item.kilometrajeSalida.map((km: any) => ({
              numero: Number(km.numero),
              descripcion: km.descripcion || "",
            }))
          : [],
        kilometrajeLlegada: Array.isArray(item.kilometrajeLlegada)
          ? item.kilometrajeLlegada.map((km: any) => ({
              numero: Number(km.numero),
              descripcion: km.descripcion || "",
            }))
          : [],
      }));
    }

    if (checklistInicio !== undefined) {
      const normalized = normalizeChecklist(checklistInicio);
      if (normalized) {
        const fotoFiles = files.filter((f) =>
          String(f.fieldname || "").startsWith("checklistInicioFoto_")
        );
        for (const f of fotoFiles) {
          if (!f.filename) continue;
          const itemId = String(f.fieldname).replace(/^checklistInicioFoto_/, "");
          if (!itemId) continue;
          const url = `/uploads/${f.filename}`;
          const existing = normalized.items.find(
            (it: { id: string; label: string; checked: boolean; foto?: string }) =>
              it.id === itemId
          );
          if (existing) {
            existing.foto = url;
          } else {
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
        const destIdx = Number(
          body.destinoRecepcionIndex != null ? body.destinoRecepcionIndex : 0
        );
        if (!Number.isFinite(destIdx) || destIdx <= 0) {
          // Destino 1 / viaje simple
          $set.checklistRecepcion = normalized;
        } else {
          // Destino 2+: upsert recepción en checklistParadas[index]
          const tripDoc = await Trip.findById(tripId);
          if (!tripDoc) {
            return res.status(404).json({ message: "Viaje no encontrado" });
          }
          const list = Array.isArray(tripDoc.checklistParadas)
            ? [...(tripDoc.checklistParadas as any[])]
            : [];
          const pos = list.findIndex((p) => Number(p?.index) === destIdx);
          if (pos >= 0) {
            list[pos] = {
              ...(list[pos] as any),
              index: destIdx,
              recepcion: normalized,
            };
          } else {
            list.push({
              index: destIdx,
              destino: String(
                (Array.isArray(tripDoc.destinoExtra)
                  ? tripDoc.destinoExtra[destIdx - 1]?.destino
                  : "") ||
                  tripDoc.destino ||
                  ""
              ),
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
      if (normalized) $set.checklistFin = normalized;
    }

    // Checklist de una parada (multidestino): se agrega al historial de paradas.
    const $push: Record<string, unknown> = {};
    if (checklistParada !== undefined) {
      const normalized = normalizeChecklist(checklistParada);
      if (normalized) {
        const recepcionParada = normalizeChecklist(
          (checklistParada as any)?.recepcion
        );
        const closedIndex = Number((checklistParada as any)?.index) || 0;
        $push.checklistParadas = {
          ...normalized,
          index: closedIndex,
          destino: String((checklistParada as any)?.destino || ""),
          recepcion: recepcionParada || null,
        };
        // Asegura avance del índice aunque el cliente no mande destinoActualIndex (bug móvil).
        const nextIdx = closedIndex + 1;
        const currentIdx = Number((trip as any).destinoActualIndex ?? 0) || 0;
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
      } else if (nuevoEstado !== "completado" && anterior === "completado") {
        $set.finalizadoEn = null;
      }
      if (
        nuevoEstado === "en progreso" &&
        anterior !== "en progreso" &&
        !(trip as any).iniciadoEn
      ) {
        $set.iniciadoEn = new Date();
      }
    }

    if (Object.keys($set).length === 0 && Object.keys($push).length === 0) {
      return res.status(400).json({ message: "No hay cambios para aplicar" });
    }

    const updateOps: Record<string, unknown> = {};
    if (Object.keys($set).length > 0) updateOps.$set = $set;
    if (Object.keys($push).length > 0) updateOps.$push = $push;

    const updated = await Trip.findByIdAndUpdate(tripId, updateOps, {
      new: true,
      runValidators: false,
    });

    if (!updated) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const estadoNuevo = updated.estado;
    const seInicio =
      String(estadoAnterior).toLowerCase() !== "en progreso" &&
      String(estadoNuevo).toLowerCase() === "en progreso";
    const seCompleto =
      String(estadoAnterior).toLowerCase() !== "completado" &&
      String(estadoNuevo).toLowerCase() === "completado";

    try {
      await syncUnitsEstadoForTrip(updated, String(estadoNuevo || ""));
    } catch (syncErr) {
      console.error("Error sincronizando estado de unidad:", syncErr);
    }

    if (seInicio || seCompleto) {
      try {
        const operatorName = isOperatorRole(user?.rol)
          ? [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || "Operador"
          : "Un operador";
        if (seInicio) {
          await notifyAdminsTripStarted(updated, operatorName);
        }
        if (seCompleto) {
          await notifyAdminsTripCompleted(updated, operatorName);
        }
      } catch (notifyError) {
        console.error("Error enviando notificación de estado de viaje:", notifyError);
      }
    }

    return res.json({ message: "Viaje actualizado", trip: updated });
  } catch (error: any) {
    console.error("Error actualizando viaje (operador):", error);
    return res.status(500).json({
      message: error?.message || "Error al actualizar viaje",
    });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Viaje no encontrado" });

    const user = (req as any).user;
    if (
      isFieldStaffRole(user?.rol) &&
      String(trip.conductorId) !== String(user.id || user._id)
    ) {
      return res.status(403).json({ message: "No tienes permiso" });
    }

    const snapshot = trip.toObject ? trip.toObject() : trip;
    await trip.deleteOne();

    try {
      // Si el viaje estaba activo, libera unidades (o reconcilia).
      await syncUnitsEstadoForTrip(snapshot, "completado");
    } catch (syncErr) {
      console.error("Error sincronizando unidad al eliminar viaje:", syncErr);
    }

    res.json({ message: "Viaje eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar viaje" });
  }
};

export const getTripCount = async (req:Request,res:Response)=>{
  try{
    const count=await Trip.countDocuments();
    res.status(200).json({count});
  }catch (error){
    res.status(500).json({message:"Error al contar los vaijes",error})
  }
}

/** Contadores ligeros para badges del menú (sin bajar la lista completa). */
export const getTripStatusCounts = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const uid = userObjectId(user);
    const baseFilter =
      isFieldStaffRole(user.rol) && uid
        ? tripAssignedToUserQuery(uid, user.rol)
        : {};

    const pendiente = await Trip.countDocuments({
      ...baseFilter,
      estado: { $regex: /^pendiente$/i },
    });

    return res.status(200).json({ pendiente });
  } catch (error) {
    console.error("Error al contar viajes por estado:", error);
    return res.status(500).json({ message: "Error al contar viajes" });
  }
};