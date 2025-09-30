import { Router } from "express";
import { createUser, deleteUser, getUser, getUserById, loginUser, registerUser, updateUser } from "../controllers/userController";

const router = Router();


router.get("/", getUser); 
router.get("/:id", getUserById); 
router.post("/", createUser); 
router.post("/register", registerUser); 
router.post("/login", loginUser); 
router.put("/:id", updateUser); 
router.delete("/:id", deleteUser); 

export default router;