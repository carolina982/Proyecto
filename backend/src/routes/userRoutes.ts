import express from "express";
import { createUser, deleteUser, getUser, getUserById, loginUser, registerUser, updateUser, } from "../controllers/userController";
import { upload } from "../middlewares/upload";
const router = express.Router();

router.post("/login", loginUser);
router.post("/register",upload.single("imagenUrl"), registerUser);
router.get("/", getUser);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id", upload.single("photo"), updateUser);
router.delete("/:id", deleteUser);
export default router;