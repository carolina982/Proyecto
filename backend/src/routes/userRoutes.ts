import express from "express";
import { createUser, deleteUser, getUser, getUserById, loginUser, registerUser, updateUser } from "../controllers/userController";
import upload from "../middlewares/upload";

const router =express.Router();
router.post("/login",loginUser);
router.post("/register",registerUser);
router.get("/",getUser);
router.get("/:id",getUserById);
router.put("/:id",upload.single("photo"),updateUser);
router.delete("/:id",deleteUser);
router.post("/",createUser);

export default router ;