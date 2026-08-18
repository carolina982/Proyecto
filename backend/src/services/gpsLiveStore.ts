import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import GpsTrack from "../models/GpsTrack";

const LIVE_TTL_MS = 3 * 60 * 1000;
const MIN_POINT_M = 25;
const MIN_POINT_MS = 12_000;
const MAX_POINTS = 2500;
const LEGACY_JSON = path.join(__dirname, "../../data/gps-tracks.json");

export type GpsPoint = {
  lat: number;
  lng: number;
  at: number;
  ubicacion: string;
};

const lastByUnit = new Map<string, GpsPoint>();
const trackByUnit = new Map<string, GpsPoint[]>();
const dirtyIds = new Set<string>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let mongoReady = false;

function haversineM(a: GpsPoint, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function dayStart(ts = Date.now()) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function pruneTracks(now = Date.now()) {
  const from = dayStart(now);
  for (const [id, pts] of trackByUnit) {
    const keep = pts.filter((p) => p.at >= from).slice(-MAX_POINTS);
    if (keep.length === 0) trackByUnit.delete(id);
    else trackByUnit.set(id, keep);
  }
}

function applyRow(unitId: string, last?: GpsPoint | null, points?: GpsPoint[]) {
  if (last && Number.isFinite(last.lat) && Number.isFinite(last.lng)) {
    lastByUnit.set(unitId, last);
  }
  if (Array.isArray(points) && points.length) {
    const from = dayStart();
    const keep = points.filter((p) => p && p.at >= from).slice(-MAX_POINTS);
    if (keep.length) trackByUnit.set(unitId, keep);
  }
}

function readLegacyJson(): { last: Record<string, GpsPoint>; tracks: Record<string, GpsPoint[]> } | null {
  try {
    if (!fs.existsSync(LEGACY_JSON)) return null;
    const raw = JSON.parse(fs.readFileSync(LEGACY_JSON, "utf8"));
    return {
      last: raw?.last && typeof raw.last === "object" ? raw.last : {},
      tracks: raw?.tracks && typeof raw.tracks === "object" ? raw.tracks : {},
    };
  } catch {
    return null;
  }
}

async function loadFromMongo() {
  try {
    const rows = await GpsTrack.find().lean();
    if (rows.length > 0) {
      for (const row of rows) {
        applyRow(row.unitId, row.last, row.points as GpsPoint[]);
      }
      mongoReady = true;
      return;
    }

    const legacy = readLegacyJson();
    if (legacy) {
      for (const [id, row] of Object.entries(legacy.last)) applyRow(id, row, legacy.tracks[id]);
      for (const id of lastByUnit.keys()) dirtyIds.add(id);
      schedulePersist();
    }
    mongoReady = true;
  } catch (err) {
    console.error("GPS: no se pudo cargar desde Mongo", err);
    const legacy = readLegacyJson();
    if (legacy) {
      for (const [id, row] of Object.entries(legacy.last)) applyRow(id, row, legacy.tracks[id]);
    }
  }
}

function hookMongo() {
  if (mongoose.connection.readyState === 1) {
    void loadFromMongo();
    return;
  }
  mongoose.connection.once("open", () => {
    void loadFromMongo();
  });
}

function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void flushToMongo();
  }, 4000);
}

async function flushToMongo() {
  if (mongoose.connection.readyState !== 1) return;
  const ids = [...dirtyIds];
  dirtyIds.clear();
  pruneTracks();
  for (const unitId of ids) {
    const last = lastByUnit.get(unitId);
    if (!last) continue;
    const points = trackByUnit.get(unitId) || [];
    try {
      await GpsTrack.updateOne(
        { unitId },
        { $set: { last, points } },
        { upsert: true }
      );
    } catch (err) {
      dirtyIds.add(unitId);
      console.error("GPS: no se pudo guardar", unitId, err);
    }
  }
}

hookMongo();

export function normalizeUnitGpsId(raw: unknown) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const m = s.match(/(\d{1,3})\s*$/);
  if (m) return String(m[1]).padStart(3, "0");
  return s;
}

export function upsertLiveGps(
  unitId: string,
  lat: number,
  lng: number,
  ubicacion: string
) {
  const now = Date.now();
  const point: GpsPoint = {
    lat,
    lng,
    at: now,
    ubicacion: String(ubicacion || "GPS").slice(0, 80),
  };
  lastByUnit.set(unitId, point);

  const track = trackByUnit.get(unitId) || [];
  const prev = track[track.length - 1];
  const far = !prev || haversineM(prev, point) >= MIN_POINT_M;
  const aged = !prev || now - prev.at >= MIN_POINT_MS;
  if (!prev || far || aged) {
    track.push(point);
    if (track.length > MAX_POINTS) track.splice(0, track.length - MAX_POINTS);
    trackByUnit.set(unitId, track);
  }
  dirtyIds.add(unitId);
  schedulePersist();
  return point;
}

export function listLiveGps(now = Date.now()) {
  pruneTracks(now);
  const out: Record<
    string,
    {
      lat: number;
      lng: number;
      gpsTime: string;
      ubicacion: string;
      live: boolean;
      at: number;
    }
  > = {};
  for (const [id, row] of lastByUnit) {
    out[id] = {
      lat: row.lat,
      lng: row.lng,
      gpsTime: new Date(row.at).toLocaleString("es-MX"),
      ubicacion: row.ubicacion,
      live: now - row.at <= LIVE_TTL_MS,
      at: row.at,
    };
  }
  return out;
}

export function getTrack(unitId: string, now = Date.now()) {
  pruneTracks(now);
  const from = dayStart(now);
  const points = (trackByUnit.get(unitId) || []).filter((p) => p.at >= from);
  const last = lastByUnit.get(unitId) || null;
  return {
    unitId,
    points,
    last,
    live: last ? now - last.at <= LIVE_TTL_MS : false,
    ready: mongoReady,
  };
}
