import { Router } from "express";
import { createUnit, deleteUnit, getUnitById, getUnits, updateUnit } from "../controllers/unitController";
const router =Router ();
router.post ("/", createUnit);
router.get("/", getUnits);
router.get("/:id" , getUnitById);
router.put("/:id" ,updateUnit);
router.delete("/:id" , deleteUnit);
export default router;