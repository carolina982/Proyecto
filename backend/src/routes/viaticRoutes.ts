import { Router } from "express";
import { createViatic, getViatics } from "../Controller/viaticController";


const router =Router ();
router .post ("/" ,createViatic);
router.get("/", getViatics);

export default router ;
