import { Router } from "express";
import { createViatic, deleteViatic, getViatic, getViaticById, getViaticByTrip, updateViatic } from "../controllers/viaticController";


const router =Router ();
router.get("/", getViatic);
router .post ("/" ,createViatic);
router.get ("/:id",getViaticById);
router.get("/trip/:tripId" , getViaticByTrip);
router.put("/:id" , updateViatic);
router.delete("/:id" , deleteViatic);

export default router ;
