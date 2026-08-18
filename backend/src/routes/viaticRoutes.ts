import { Router } from "express";
import { createViatic, deleteViatic, getViatic, getViaticById, getViaticByTrip, getViaticCount, updateViatic, } from "../controllers/viaticController";
import { PERMISSIONS } from "../auth/permissions";
import { verifyToken } from "../middlewares/auth";
import { requirePermission } from "../middlewares/authorize";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createViaticValidator, updateViaticValidator } from "../validators/viaticValidator";

const router = Router();
const canGastos = [verifyToken, requirePermission(PERMISSIONS.GASTOS_MANAGE)];

router.get("/count", ...canGastos, getViaticCount);
router.get("/", ...canGastos, getViatic);
router.get("/trip/:tripId", ...canGastos, getViaticByTrip);
router.get("/:id", ...canGastos, getViaticById);
router.post("/", ...canGastos, upload.single("factura"), createViaticValidator, validate, createViatic);
router.put("/:id", ...canGastos, upload.single("factura"), updateViaticValidator, validate, updateViatic);
router.delete("/:id", ...canGastos, deleteViatic);

export default router;
