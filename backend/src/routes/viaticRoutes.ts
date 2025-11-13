import { Router } from "express";
import { createViatic, deleteViatic, getViatic, getViaticById, getViaticByTrip, updateViatic, } from "../controllers/viaticController";
import { upload } from "../middlewares/upload";

const router = Router();
router.get("/", getViatic);
router.get("/:id", getViaticById);
router.get("/trip/:tripId", getViaticByTrip);
router.post("/", upload.single("factura"), createViatic);
router.put("/:id", upload.single("factura"), updateViatic);
router.delete("/:id", deleteViatic);

export default router;