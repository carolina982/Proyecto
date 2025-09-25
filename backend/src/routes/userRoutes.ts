import { Router } from "express";
import { loginUser, registerUser } from "../Controller/userController";


const router =Router ();
 router.post ("/login" ,loginUser);
 router.post("/resgister", registerUser);

 export  default router;
 