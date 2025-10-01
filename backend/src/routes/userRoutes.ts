import express from "express";
import { createUser, deleteUser, getUser, getUserById, loginUser, registerUser, updateUser } from "../controllers/userController";

const router =express.Router();
router.post("/login" ,loginUser);
router.post("/register" , registerUser);
router.get("/", getUser);
router.get("/:id", getUserById);
router.get("/:id", updateUser);
router.get("/:id", deleteUser);
router.get("/" , createUser);

export default router ;