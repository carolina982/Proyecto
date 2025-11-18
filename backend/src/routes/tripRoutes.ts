import { Router } from "express";
import { createTrip, deleteTrip, getTrip, getTripById, updateTrip } from "../controllers/tripController";
import { verifyToken } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createTripValidator, updateTripValidator } from "../validators/tripValidator";

const router =Router ();
router.post("/",verifyToken,createTripValidator,validate,createTrip);
router.get("/",verifyToken,getTrip);
router.get("/:id",verifyToken,getTripById);
router.put("/:id" ,verifyToken,updateTripValidator,validate, updateTrip);
router.delete("/:id",verifyToken , deleteTrip);

export default router ;
