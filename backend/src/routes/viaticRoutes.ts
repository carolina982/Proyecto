import { Router } from "express";
import { createViatic, deleteViatic, getViatic, getViaticById, getViaticByTrip, updateViatic, } from "../controllers/viaticController";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createViaticValidator, updateViaticValidator } from "../validators/viaticValidator";

const router = Router();
router.get("/", getViatic);
router.get("/trip/:tripId", getViaticByTrip);
router.get("/:id", getViaticById);
router.post("/", upload.single("factura"), createViaticValidator,validate,createViatic);
router.put("/:id", upload.single("factura"), updateViaticValidator,validate,updateViatic);
router.delete("/:id", deleteViatic);


export default router;