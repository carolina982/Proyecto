import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { verifyToken } from "../middlewares/auth";
import { authorize, requirePermission } from "../middlewares/authorize";
import { PERMISSIONS } from "../auth/permissions";

const router = Router();
const adminLevel = [verifyToken, authorize(["Admin", "Administrador"])];

/** Cualquier usuario autenticado puede leer settings públicos + catálogo de permisos. */
router.get("/", verifyToken, getSettings);
/** Admin puede actualizar DEF / correos de viaje. */
router.put("/", ...adminLevel, updateSettings);
/** Configuración del sistema: solo con permiso system.config. */
router.put("/system", verifyToken, requirePermission(PERMISSIONS.SYSTEM_CONFIG), updateSettings);

export default router;
