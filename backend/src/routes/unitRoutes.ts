import { Router } from "express";
import { createUnit, deleteUnit, getUnitById, getUnits, updateUnit } from "../controllers/unitController";
import { validate } from "../middlewares/validate";
import { createUnitValidator, updateUnitValidator } from "../validators/unitValidator";

const router =Router ();
router.post ("/",createUnitValidator,validate,createUnit);
router.get("/", getUnits);
router.get("/:id" , getUnitById);
router.put("/:id",updateUnitValidator,validate,updateUnit);
router.delete("/:id" , deleteUnit);

export default router;