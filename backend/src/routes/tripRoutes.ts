import { Router } from "express";
import {
  createTrip,
  deleteTrip,
  getTrip,
  getTripById,
  getTripCount,
  getTripStatusCounts,
  updateTrip,
  updateTripOperador,
} from "../controllers/tripController";
import { verifyToken } from "../middlewares/auth";
import { uploadTripDocs } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createTripValidator, updateTripValidator } from "../validators/tripValidator";
import facturaRoutes from "./facturaRoutes";

/** Si el body solo trae campos de operador, evita el validator del form admin. */
const operadorBodyKeys = new Set([
  "estado",
  "destinoActualIndex",
  "fechaSalida",
  "fechaLlegada",
  "multidestino",
  "destinoExtra",
  "checklistInicio",
  "checklistRecepcion",
  "destinoRecepcionIndex",
  "checklistFin",
  "checklistParada",
  "hojaEntrega",
  "hojasEntrega",
]);

const routeOperadorOrAdminUpdate = (req: any, res: any, next: any) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const keys = Object.keys(body);
  const onlyOperadorFields =
    keys.length > 0 && keys.every((key) => operadorBodyKeys.has(key));

  if (onlyOperadorFields) {
    return updateTripOperador(req, res);
  }
  return next();
};

const router = Router();
router.get("/count", verifyToken, getTripCount);
router.get("/status-counts", verifyToken, getTripStatusCounts);
router.post("/", verifyToken, createTripValidator, validate, createTrip);
router.get("/", verifyToken, getTrip);
/** Facturas por viaje (colección independiente; un viaje puede tener N facturas). */
router.use("/:tripId/facturas", facturaRoutes);
router.get("/:id", verifyToken, getTripById);
/** Acciones de operador: hoja de entrega + fotos checklistInicio (cualquier fieldname). */
router.patch("/:id/operador", verifyToken, uploadTripDocs.any(), updateTripOperador);
router.put("/:id/operador", verifyToken, uploadTripDocs.any(), updateTripOperador);
/** PUT normal: si solo cambia estado/ops, usa handler operador (sin validator estricto) */
router.put("/:id", verifyToken, routeOperadorOrAdminUpdate, updateTripValidator, validate, updateTrip);
router.delete("/:id", verifyToken, deleteTrip);

export default router;
