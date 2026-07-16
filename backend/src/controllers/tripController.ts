import { Request, Response } from "express";
import mongoose from "mongoose";
import Trip from "../models/Trip";
import {
  notifyAdminsTripCompleted,
  notifyCompanionAssigned,
  notifyTripAssigned,
} from "../services/notificationService";

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
  return raw ? new mongoose.Types.ObjectId(String(raw)) : null;
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
      trips = await Trip.find(tripAssignedToUserQuery(uid, user.rol)).populate(
        "asignadoPor",
        "nombre apellido"
      );
    } else {
      trips = await Trip.find().populate("asignadoPor", "nombre apellido");
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
      estado, 
      kilometrajeSalida, 
      kilometrajeLlegada, 
      acompanante, 
      def,
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
  estado,
  kilometrajeSalida: mapKm(kilometrajeSalida),
  kilometrajeLlegada: mapKm(kilometrajeLlegada),
  acompanante:
    acompanante === "none" || acompanante === "" || !acompanante
      ? null
      : new mongoose.Types.ObjectId(String(acompanante)),
  def: def || "",
  multidestino: Boolean(multidestino),
  destinoExtra: Boolean(multidestino) ? normalizeDestinosExtras(destinoExtra) : [],
  destinoActualIndex: 0,
  asignadoPor: asignadoPorId ? new mongoose.Types.ObjectId(asignadoPorId) : null,
});

    await newTrip.save();

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
    const isAdminUser = String(user?.rol || "").toLowerCase() === "admin";
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

    const {
      rutaAcubrir, 
      destino, 
      fechaLlegada, 
      fechaSalida, 
      kilometrajeSalida, 
      kilometrajeLlegada, 
      estado, 
      unidadId, 
      conductorId, 
      acompanante, 
      def,
      multidestino,
      destinoExtra,
      destinoActualIndex,
    } = req.body;

    
    if (rutaAcubrir !== undefined) trip.rutaAcubrir = rutaAcubrir;
    if (destino !== undefined) trip.destino = destino;
    if (unidadId !== undefined) trip.unidadId = unidadId;
    if (estado !== undefined) trip.estado = estado;
    if (def !== undefined) trip.def = def;
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

    await trip.save();

    const acompananteNuevo = trip.acompanante ? String(trip.acompanante) : null;
    if (acompananteNuevo && acompananteNuevo !== acompananteAnterior) {
      try {
        await notifyCompanionAssigned({
          _id: trip._id,
          rutaAcubrir: trip.rutaAcubrir,
          destino: trip.destino,
          acompanante: acompananteNuevo,
        });
      } catch (notifyError) {
        console.error("Error notificando acompañante:", notifyError);
      }
    }

    const estadoNuevo = trip.estado;
    const seCompleto =
      String(estadoAnterior).toLowerCase() !== "completado" &&
      String(estadoNuevo).toLowerCase() === "completado";

    if (seCompleto) {
      try {
        const operatorName = isOperatorRole(user?.rol)
          ? [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || "Operador"
          : "Un operador";
        await notifyAdminsTripCompleted(trip, operatorName);
      } catch (notifyError) {
        console.error("Error enviando notificación de viaje finalizado:", notifyError);
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

    const isAdminUser = String(user?.rol || "").toLowerCase() === "admin";
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
    const { estado, destinoActualIndex, fechaSalida, fechaLlegada, multidestino, destinoExtra } =
      req.body || {};

    const $set: Record<string, unknown> = {};

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

    if (Object.keys($set).length === 0) {
      return res.status(400).json({ message: "No hay cambios para aplicar" });
    }

    const updated = await Trip.findByIdAndUpdate(
      tripId,
      { $set },
      { new: true, runValidators: false }
    );

    if (!updated) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const estadoNuevo = updated.estado;
    const seCompleto =
      String(estadoAnterior).toLowerCase() !== "completado" &&
      String(estadoNuevo).toLowerCase() === "completado";

    if (seCompleto) {
      try {
        const operatorName = isOperatorRole(user?.rol)
          ? [user.nombre, user.apellido].filter(Boolean).join(" ").trim() || "Operador"
          : "Un operador";
        await notifyAdminsTripCompleted(updated, operatorName);
      } catch (notifyError) {
        console.error("Error enviando notificación de viaje finalizado:", notifyError);
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

    await trip.deleteOne();
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