import { Router } from "express";
import { createViatic, deleteViatic, getViatic, getViaticById, getViaticByTrip, getViaticCount, updateViatic, } from "../controllers/viaticController";
import { verifyToken } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createViaticValidator, updateViaticValidator } from "../validators/viaticValidator";

const router = Router();
const adminOnly = [verifyToken, authorize(["Admin"])];

router.get("/count", ...adminOnly, getViaticCount);
router.get("/", ...adminOnly, getViatic);
router.get("/trip/:tripId", ...adminOnly, getViaticByTrip);
router.get("/:id", ...adminOnly, getViaticById);
router.post("/", ...adminOnly, upload.single("factura"), createViaticValidator, validate, createViatic);
router.put("/:id", ...adminOnly, upload.single("factura"), updateViaticValidator, validate, updateViatic);
router.delete("/:id", ...adminOnly, deleteViatic);

export default router;
