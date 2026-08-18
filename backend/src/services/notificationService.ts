import mongoose from "mongoose";
import { isAdminLevel } from "../auth/roles";
import Notification, { NotificationType } from "../models/Notification";
import User from "../models/User";
import {
  sendTripAssignedEmail,
  sendTripStatusEmail,
} from "./emailService";
import { sendPushToToken } from "./pushService";
import { shouldSendTripEmailToUser } from "./tripEmailSettings";

type NotifyPayload = {
  title: string;
  body: string;
  type: NotificationType;
  tripId?: string | mongoose.Types.ObjectId | null;
};

function fullName(user: { nombre?: string; apellido?: string } | null | undefined) {
  if (!user) return "";
  return [user.nombre, user.apellido].filter(Boolean).join(" ").trim();
}

/** Extrae un id usable aunque venga ObjectId, string o documento populate. */
function resolveUserId(value: unknown, depth = 0): string {
  if (depth > 4) return "";
  if (value === undefined || value === null || value === "" || value === "none") {
    return "";
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return String(value);
  }
  if (typeof value === "string" || typeof value === "number") {
    const raw = String(value).trim();
    if (!raw || raw === "[object Object]") return "";
    return raw;
  }
  if (typeof value === "object") {
    const obj = value as {
      _id?: unknown;
      id?: unknown;
      toHexString?: () => string;
    };
    // BSON ObjectId-like (evita recursión por .id Buffer / getters)
    if (typeof obj.toHexString === "function") {
      try {
        const hex = String(obj.toHexString()).trim();
        if (hex) return hex;
      } catch {
        /* ignore */
      }
    }
    if (obj._id !== undefined && obj._id !== null && obj._id !== value) {
      return resolveUserId(obj._id, depth + 1);
    }
    if (typeof obj.id === "string" || typeof obj.id === "number") {
      return String(obj.id).trim();
    }
  }
  const raw = String(value).trim();
  if (!raw || raw === "[object Object]") return "";
  return raw;
}

async function resolveUserName(userId?: string | mongoose.Types.ObjectId | null) {
  const id = resolveUserId(userId);
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return "Administración";
  }
  const user = await User.findById(id).select("nombre apellido");
  return fullName(user) || "Administración";
}

async function findAdminRecipients() {
  const users = await User.find({ activo: { $ne: false } }).select("_id rol");
  return users.filter((u) => isAdminLevel(u.rol));
}

export async function notifyUser(userId: string, payload: NotifyPayload) {
  const id = resolveUserId(userId);
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.warn("[notifyUser] userId inválido, se omite:", userId);
    return;
  }

  await Notification.create({
    userId: new mongoose.Types.ObjectId(id),
    title: payload.title,
    body: payload.body,
    type: payload.type,
    tripId: payload.tripId ? new mongoose.Types.ObjectId(String(payload.tripId)) : null,
    read: false,
  });

  console.log(`[notifyUser] ${payload.type} → ${id}`);

  const user = await User.findById(id).select("expoPushToken");
  if (user?.expoPushToken) {
    await sendPushToToken(user.expoPushToken, payload.title, payload.body, {
      type: payload.type,
      tripId: payload.tripId ? String(payload.tripId) : "",
    });
  }
}

type TripAssignLike = {
  _id: mongoose.Types.ObjectId | string;
  rutaAcubrir: string;
  destino: string;
  conductorId?: mongoose.Types.ObjectId | string | null;
  acompanante?: mongoose.Types.ObjectId | string | null;
  asignadoPor?: mongoose.Types.ObjectId | string | null;
};

export async function notifyTripAssigned(trip: TripAssignLike) {
  const conductorId = resolveUserId(trip.conductorId);
  if (!conductorId) return;

  const tripId = String(trip._id);
  const routeLabel = `${trip.rutaAcubrir} → ${trip.destino}`;
  const assignedBy = await resolveUserName(trip.asignadoPor);
  const body = `Te asignaron un viaje: ${routeLabel}. Asignado por: ${assignedBy}`;

  await notifyUser(conductorId, {
    title: "Viaje asignado",
    body,
    type: "trip_assigned",
    tripId,
  });

  // Correo opcional: NUNCA hacer return aquí (bloquearía aviso al acompañante).
  try {
    if (await shouldSendTripEmailToUser(conductorId, "tripAssigned")) {
      const conductor = await User.findById(conductorId).select(
        "email nombre apellido"
      );
      if (!conductor?.email) {
        console.warn(
          `Viaje ${tripId}: operador sin email; no se envió correo de asignación`
        );
      } else {
        const result = await sendTripAssignedEmail({
          to: conductor.email,
          userName: fullName(conductor) || "Hola",
          role: "operador",
          routeLabel,
          assignedBy,
        });
        if (result.ok) {
          console.log(
            `Correo viaje asignado (operador) → ${conductor.email} via ${result.provider}`
          );
        } else {
          console.warn(
            "Correo de viaje asignado (operador) no enviado:",
            result.message,
            result.detail || ""
          );
        }
      }
    }
  } catch (emailError) {
    console.error("Error enviando correo de viaje asignado:", emailError);
  }

  const acompananteId = resolveUserId(trip.acompanante);
  if (acompananteId) {
    await notifyCompanionAssigned(trip);
  }
}

export async function notifyCompanionAssigned(trip: TripAssignLike) {
  const acompananteId = resolveUserId(trip.acompanante);
  if (!acompananteId) return;

  const tripId = String(trip._id);
  const routeLabel = `${trip.rutaAcubrir} → ${trip.destino}`;
  const assignedBy = await resolveUserName(trip.asignadoPor);
  const body = `Te asignaron como acompañante en el viaje: ${routeLabel}. Asignado por: ${assignedBy}`;

  await notifyUser(acompananteId, {
    title: "Vas como acompañante",
    body,
    type: "companion_assigned",
    tripId,
  });

  try {
    if (!(await shouldSendTripEmailToUser(acompananteId, "tripAssigned"))) return;
    const companion = await User.findById(acompananteId).select(
      "email nombre apellido"
    );
    if (!companion?.email) {
      console.warn(
        `Viaje ${tripId}: acompañante sin email; no se envió correo de asignación`
      );
    } else {
      const result = await sendTripAssignedEmail({
        to: companion.email,
        userName: fullName(companion) || "Hola",
        role: "acompanante",
        routeLabel,
        assignedBy,
      });
      if (result.ok) {
        console.log(
          `Correo viaje asignado (acompañante) → ${companion.email} via ${result.provider}`
        );
      } else {
        console.warn(
          "Correo de viaje asignado (acompañante) no enviado:",
          result.message,
          result.detail || ""
        );
      }
    }
  } catch (emailError) {
    console.error("Error enviando correo de acompañante:", emailError);
  }
}

async function emailAdminsTripStatus(
  trip: {
    _id: mongoose.Types.ObjectId | string;
    rutaAcubrir: string;
    destino: string;
  },
  operatorName: string,
  status: "started" | "completed"
) {
  const kind = status === "started" ? "tripStarted" : "tripCompleted";
  const admins = await findAdminRecipients();
  const routeLabel = `${trip.rutaAcubrir} → ${trip.destino}`;
  const tripId = String(trip._id);

  await Promise.all(
    admins.map(async (admin) => {
      if (!(await shouldSendTripEmailToUser(admin._id, kind))) return;
      const full = await User.findById(admin._id).select("email nombre apellido");
      if (!full?.email) {
        console.warn(
          `Viaje ${tripId}: admin ${admin._id} sin email; omitiendo correo de estado`
        );
        return;
      }
      try {
        const result = await sendTripStatusEmail({
          to: full.email,
          userName: fullName(full) || "Hola",
          status,
          routeLabel,
          operatorName,
        });
        if (result.ok) {
          console.log(
            `Correo viaje ${status} → ${full.email} via ${result.provider}`
          );
        } else {
          console.warn(
            `Correo viaje ${status} no enviado a ${full.email}:`,
            result.message,
            result.detail || ""
          );
        }
      } catch (emailError) {
        console.error(`Error correo viaje ${status} a ${full.email}:`, emailError);
      }
    })
  );
}

export async function notifyAdminsTripCompleted(
  trip: {
    _id: mongoose.Types.ObjectId | string;
    rutaAcubrir: string;
    destino: string;
  },
  operatorName: string
) {
  const admins = await findAdminRecipients();
  const tripId = String(trip._id);
  const body = `${operatorName} finalizó el viaje ${trip.rutaAcubrir} → ${trip.destino}`;

  await Promise.all(
    admins.map((admin) =>
      notifyUser(String(admin._id), {
        title: "Viaje finalizado",
        body,
        type: "trip_completed",
        tripId,
      })
    )
  );

  await emailAdminsTripStatus(trip, operatorName, "completed");
}

/** Avisa a admins cuando un operador inicia el viaje. */
export async function notifyAdminsTripStarted(
  trip: {
    _id: mongoose.Types.ObjectId | string;
    rutaAcubrir: string;
    destino: string;
  },
  operatorName: string
) {
  const admins = await findAdminRecipients();
  const tripId = String(trip._id);
  const body = `${operatorName} inició el viaje ${trip.rutaAcubrir} → ${trip.destino}`;

  await Promise.all(
    admins.map((admin) =>
      notifyUser(String(admin._id), {
        title: "Viaje iniciado",
        body,
        type: "trip_started",
        tripId,
      })
    )
  );

  await emailAdminsTripStatus(trip, operatorName, "started");
}

/** Avisa a todos los usuarios (excepto quien publicó) que hay un anuncio nuevo. */
export async function notifyAnnouncementPublished(
  announcement: {
    _id: mongoose.Types.ObjectId | string;
    titulo: string;
    contenido: string;
  },
  publisherUserId?: string | null
) {
  const users = await User.find({ activo: { $ne: false } }).select("_id");
  const title = "Nuevo anuncio";
  const preview = String(announcement.contenido || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const body = preview
    ? `${announcement.titulo}: ${preview}${preview.length >= 120 ? "…" : ""}`
    : String(announcement.titulo || "Se publicó un aviso nuevo");

  const publisher = resolveUserId(publisherUserId);

  await Promise.all(
    users
      .filter((u) => String(u._id) !== publisher)
      .map((u) =>
        notifyUser(String(u._id), {
          title,
          body,
          type: "announcement_published",
        })
      )
  );
}
