import mongoose from "mongoose";
import Trip from "../models/Trip";
import Unit from "../models/Unit";

const ACTIVE_TRIP_STATES = ["en progreso", "en parada"] as const;

/** IDs de unidades usadas en un viaje (principal + tramos). */
export const collectTripUnitIds = (trip: any): string[] => {
  const ids = new Set<string>();
  const main = String(trip?.unidadId || "").trim();
  if (main) ids.add(main);
  const extras = Array.isArray(trip?.destinoExtra) ? trip.destinoExtra : [];
  for (const leg of extras) {
    const uid = String(leg?.unidadId || "").trim();
    if (uid) ids.add(uid);
  }
  return [...ids].filter((id) => mongoose.Types.ObjectId.isValid(id) && id.length === 24);
};

/**
 * Al iniciar/parar → "En ruta". Al completar/pendiente → "Disponible"
 * (si no sigue en otro viaje activo). No pisa Mantenimiento / No disponible.
 */
export const syncUnitsEstadoForTrip = async (trip: any, estado: string) => {
  const unitIds = collectTripUnitIds(trip);
  if (!unitIds.length) return;

  const key = String(estado || "").toLowerCase().trim();
  const objectIds = unitIds.map((id) => new mongoose.Types.ObjectId(id));

  if (key === "en progreso" || key === "en parada") {
    await Unit.updateMany(
      { _id: { $in: objectIds } },
      { $set: { estado: "En ruta" } }
    );
    return;
  }

  if (key === "completado" || key === "pendiente") {
    const tripId = trip?._id || trip?.id;
    for (const uid of unitIds) {
      const stillActive = await Trip.exists({
        ...(tripId ? { _id: { $ne: tripId } } : {}),
        estado: { $in: [...ACTIVE_TRIP_STATES] },
        $or: [{ unidadId: uid }, { "destinoExtra.unidadId": uid }],
      });
      if (stillActive) continue;
      await Unit.updateOne(
        { _id: uid, estado: { $in: ["En ruta", "Ocupado"] } },
        { $set: { estado: "Disponible" } }
      );
    }
  }
};

/**
 * Reconcilia TODAS las unidades:
 * - Con viaje activo → En ruta
 * - En ruta/Ocupado sin viaje activo → Disponible
 * - No toca Mantenimiento / No disponible (salvo que tengan viaje activo → En ruta)
 */
export const reconcileAllUnitEstados = async () => {
  const activeTrips = await Trip.find(
    { estado: { $in: [...ACTIVE_TRIP_STATES] } },
    { unidadId: 1, destinoExtra: 1 }
  ).lean();

  const activeIds = new Set<string>();
  for (const trip of activeTrips) {
    for (const id of collectTripUnitIds(trip)) activeIds.add(id);
  }

  const activeObjectIds = [...activeIds].map((id) => new mongoose.Types.ObjectId(id));

  // Libera las que están "En ruta" sin viaje activo
  const freeFilter: Record<string, unknown> = {
    estado: { $in: ["En ruta", "Ocupado"] },
  };
  if (activeObjectIds.length) {
    freeFilter._id = { $nin: activeObjectIds };
  }
  await Unit.updateMany(freeFilter, { $set: { estado: "Disponible" } });

  // Marca en ruta las que sí tienen viaje activo
  if (activeObjectIds.length) {
    await Unit.updateMany(
      { _id: { $in: activeObjectIds } },
      { $set: { estado: "En ruta" } }
    );
  }
};
