import { Router } from "express";
import { createTrip, deleteTrip, getTrip, getTripById, updateTrip } from "../controllers/tripController";
const router =Router ();
router.post("/",createTrip);
router.get("/",getTrip);
router.get("/:id",getTripById);
router.put("/:id" , updateTrip);
router.delete("/:id" , deleteTrip);
export default router ;
