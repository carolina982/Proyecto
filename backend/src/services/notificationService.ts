import mongoose from "mongoose";
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

async function resolveUserName(userId?: string | mongoose.Types.ObjectId | null) {
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return "Administración";
  }
  const user = await User.findById(userId).select("nombre apellido");
  return fullName(user) || "Administración";
}

export async function notifyUser(userId: string, payload: NotifyPayload) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return;

  await Notification.create({
    userId: new mongoose.Types.ObjectId(userId),
    title: payload.title,
    body: payload.body,
    type: payload.type,
    tripId: payload.tripId ? new mongoose.Types.ObjectId(String(payload.tripId)) : null,
    read: false,
  });

  const user = await User.findById(userId).select("expoPushToken");
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
  if (!trip.conductorId) return;

  const tripId = String(trip._id);
  const routeLabel = `${trip.rutaAcubrir} → ${trip.destino}`;
  const assignedBy = await resolveUserName(trip.asignadoPor);
  const body = `Te asignaron un viaje: ${routeLabel}. Asignado por: ${assignedBy}`;

  await notifyUser(String(trip.conductorId), {
    title: "Viaje asignado",
    body,
    type: "trip_assigned",
    tripId,
  });

  try {
    if (!(await shouldSendTripEmailToUser(trip.conductorId, "tripAssigned"))) return;
    const conductor = await User.findById(trip.conductorId).select(
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
  } catch (emailError) {
    console.error("Error enviando correo de viaje asignado:", emailError);
  }

  if (trip.acompanante && String(trip.acompanante) !== "none") {
    await notifyCompanionAssigned(trip);
  }
}

export async function notifyCompanionAssigned(trip: TripAssignLike) {
  if (!trip.acompanante || String(trip.acompanante) === "none") return;

  const tripId = String(trip._id);
  const routeLabel = `${trip.rutaAcubrir} → ${trip.destino}`;
  const assignedBy = await resolveUserName(trip.asignadoPor);
  const body = `Te asignaron como acompañante en el viaje: ${routeLabel}. Asignado por: ${assignedBy}`;

  await notifyUser(String(trip.acompanante), {
    title: "Vas como acompañante",
    body,
    type: "companion_assigned",
    tripId,
  });

  try {
    if (!(await shouldSendTripEmailToUser(trip.acompanante, "tripAssigned"))) return;
    const companion = await User.findById(trip.acompanante).select(
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
  const admins = await User.find({
    rol: { $in: ["Admin", "Administrador", "Superadministrador"] },
  }).select("_id email nombre apellido");
  const routeLabel = `${trip.rutaAcubrir} → ${trip.destino}`;
  const tripId = String(trip._id);

  await Promise.all(
    admins.map(async (admin) => {
      if (!(await shouldSendTripEmailToUser(admin._id, kind))) return;
      if (!admin.email) {
        console.warn(
          `Viaje ${tripId}: admin ${admin._id} sin email; omitiendo correo de estado`
        );
        return;
      }
      try {
        const result = await sendTripStatusEmail({
          to: admin.email,
          userName: fullName(admin) || "Hola",
          status,
          routeLabel,
          operatorName,
        });
        if (result.ok) {
          console.log(
            `Correo viaje ${status} → ${admin.email} via ${result.provider}`
          );
        } else {
          console.warn(
            `Correo viaje ${status} no enviado a ${admin.email}:`,
            result.message,
            result.detail || ""
          );
        }
      } catch (emailError) {
        console.error(`Error correo viaje ${status} a ${admin.email}:`, emailError);
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
  const admins = await User.find({
    rol: { $in: ["Admin", "Administrador", "Superadministrador"] },
  }).select("_id");
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
  const admins = await User.find({
    rol: { $in: ["Admin", "Administrador", "Superadministrador"] },
  }).select("_id");
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
  const users = await User.find().select("_id");
  const title = "Nuevo anuncio";
  const preview = String(announcement.contenido || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const body = preview
    ? `${announcement.titulo}: ${preview}${preview.length >= 120 ? "…" : ""}`
    : String(announcement.titulo || "Se publicó un aviso nuevo");

  const publisher = publisherUserId ? String(publisherUserId) : "";

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
