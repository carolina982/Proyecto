import { Router } from "express";
import { createUnit, getUnits } from "../Controller/unitController";


const router =Router ();
router.post ("/", createUnit);
router.get("/", getUnits);

export default router;