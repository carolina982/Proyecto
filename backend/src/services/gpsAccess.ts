import mongoose from "mongoose";
import { hasPermission, PERMISSIONS } from "../auth/permissions";
import { isAdminLevel } from "../auth/roles";
import Trip from "../models/Trip";
import { normalizeUnitGpsId } from "./gpsLiveStore";

export function canSeeAllGps(user: { rol?: string | null; permissions?: string[] | null } | null) {
  if (!user) return false;
  return isAdminLevel(user.rol) || hasPermission(user, PERMISSIONS.UNITS_MANAGE);
}

function userObjectId(user: any) {
  const raw = user?._id || user?.id;
  if (!raw) return null;
  const s = String(raw).trim();
  if (!mongoose.Types.ObjectId.isValid(s) || s.length !== 24) return null;
  try {
    return new mongoose.Types.ObjectId(s);
  } catch {
    return null;
  }
}

function assignedTripQuery(userId: mongoose.Types.ObjectId, rol?: string) {
  const value = String(rol || "").toLowerCase().trim();
  const asConductor = [{ conductorId: userId }, { "destinoExtra.conductorId": userId }];
  if (value === "operador" || value === "chofer") {
    return { $or: asConductor };
  }
  return {
    $or: [
      ...asConductor,
      { acompanante: userId },
      { "destinoExtra.acompanante": userId },
    ],
  };
}

/** null = todas las unidades. Set vacío = ninguna. */
export async function assignedGpsUnitIds(user: any): Promise<Set<string> | null> {
  if (canSeeAllGps(user)) return null;
  const uid = userObjectId(user);
  if (!uid) return new Set();
  const trips = await Trip.find(assignedTripQuery(uid, user?.rol))
    .select("unidadId destinoExtra.unidadId")
    .lean();
  const ids = new Set<string>();
  for (const trip of trips) {
    const main = normalizeUnitGpsId((trip as any).unidadId);
    if (main) ids.add(main);
    const extras = Array.isArray((trip as any).destinoExtra) ? (trip as any).destinoExtra : [];
    for (const extra of extras) {
      const id = normalizeUnitGpsId(extra?.unidadId);
      if (id) ids.add(id);
    }
  }
  return ids;
}

export async function canPostGpsForUnit(user: any, unitId: string): Promise<boolean> {
  const allowed = await assignedGpsUnitIds(user);
  if (allowed === null) return true;
  const id = normalizeUnitGpsId(unitId);
  return Boolean(id && allowed.has(id));
}

export function filterLiveGps(
  all: Record<string, unknown>,
  allowed: Set<string> | null
): Record<string, unknown> {
  if (allowed === null) return all;
  const out: Record<string, unknown> = {};
  for (const [id, row] of Object.entries(all)) {
    if (allowed.has(id)) out[id] = row;
  }
  return out;
}
