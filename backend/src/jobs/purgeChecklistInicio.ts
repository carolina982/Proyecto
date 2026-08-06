import fs from "fs";
import path from "path";
import Trip from "../models/Trip";

/** 1 mes y medio ≈ 45 días. */
const CHECKLIST_INICIO_TTL_MS = 45 * 24 * 60 * 60 * 1000;

const uploadsDir = path.join(__dirname, "../../uploads");

function unlinkLocalUpload(fotoUrl?: string | null) {
  const raw = String(fotoUrl || "").trim();
  if (!raw || !raw.startsWith("/uploads/")) return;
  const filename = path.basename(raw);
  if (!filename || filename.includes("..")) return;
  const full = path.join(uploadsDir, filename);
  fs.unlink(full, (err) => {
    if (err && (err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("No se pudo borrar foto de checklist:", full, err.message);
    }
  });
}

/**
 * Borra solo checklistInicio (y sus fotos locales) tras 1.5 meses.
 * No toca recepción, entrega ni paradas.
 */
export async function purgeExpiredChecklistInicio() {
  const cutoff = new Date(Date.now() - CHECKLIST_INICIO_TTL_MS);

  const trips = await Trip.find({
    checklistInicio: { $ne: null },
    $or: [
      { "checklistInicio.completadoEn": { $lte: cutoff, $ne: null } },
      {
        "checklistInicio.completadoEn": null,
        updatedAt: { $lte: cutoff },
      },
    ],
  }).select("_id checklistInicio");

  if (!trips.length) return { purged: 0 };

  let purged = 0;
  for (const trip of trips) {
    const items = Array.isArray(trip.checklistInicio?.items)
      ? trip.checklistInicio!.items
      : [];
    for (const item of items) {
      unlinkLocalUpload((item as any)?.foto);
    }
    trip.checklistInicio = null;
    await trip.save();
    purged += 1;
  }

  if (purged > 0) {
    console.log(
      `[purgeChecklistInicio] Eliminados ${purged} checklist(s) de inicio (>45 días)`
    );
  }
  return { purged };
}

/** Ejecuta al arrancar y luego cada 12 horas. */
export function startChecklistInicioPurgeJob() {
  const run = () => {
    purgeExpiredChecklistInicio().catch((err) =>
      console.error("[purgeChecklistInicio] Error:", err)
    );
  };
  // Espera un poco tras el boot para no competir con connectDB.
  setTimeout(run, 15_000);
  setInterval(run, 12 * 60 * 60 * 1000).unref?.();
}
