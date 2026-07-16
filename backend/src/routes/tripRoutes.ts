import { Router } from "express";
import {
  createTrip,
  deleteTrip,
  getTrip,
  getTripById,
  getTripCount,
  updateTrip,
  updateTripOperador,
} from "../controllers/tripController";
import { verifyToken } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createTripValidator, updateTripValidator } from "../validators/tripValidator";

/** Si el body solo trae campos de operador, evita el validator del form admin. */
const operadorBodyKeys = new Set([
  "estado",
  "destinoActualIndex",
  "fechaSalida",
  "fechaLlegada",
  "multidestino",
  "destinoExtra",
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
router.get("/count", getTripCount);
router.post("/", verifyToken, createTripValidator, validate, createTrip);
router.get("/", verifyToken, getTrip);
router.get("/:id", verifyToken, getTripById);
/** Acciones de operador (iniciar / parada / finalizar) */
router.patch("/:id/operador", verifyToken, updateTripOperador);
router.put("/:id/operador", verifyToken, updateTripOperador);
/** PUT normal: si solo cambia estado/ops, usa handler operador (sin validator estricto) */
router.put("/:id", verifyToken, routeOperadorOrAdminUpdate, updateTripValidator, validate, updateTrip);
router.delete("/:id", verifyToken, deleteTrip);

export default router;
