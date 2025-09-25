import { Router } from "express";
import { createTrip, getTrips } from "../Controller/tripController";

const router =Router ();
router.post("/", createTrip);
router.get("/",getTrips);

export default router ;
