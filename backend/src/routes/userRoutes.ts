import express from "express";
import { createUser, deleteUser, forgotPassword, getUser, getUserById, loginUser, registesrUser, resetPassword, updateUser, } from "../controllers/userController";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { loginUserValidator, registerUserValidator } from "../validators/userValidator";


const router = express.Router();
router.post("/login", loginUserValidator,validate,loginUser);
router.post("/register",upload.single("imagenUrl"), registerUserValidator,validate,registesrUser);
router.get("/", getUser);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id", upload.single("photo"), updateUser);
router.delete("/:id", deleteUser);
router.post ("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);

export default router;