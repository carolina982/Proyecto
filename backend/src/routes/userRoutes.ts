import express from "express";
import { createUser, deleteUser, forgotPassword, getUser, getUserById, loginUser, registerUser, resetPassword, updateUser, updateUserPhoto, } from "../controllers/userController";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { loginUserValidator, registerUserValidator } from "../validators/userValidator";

/** Multer solo si viene multipart; no toca body JSON (editar usuario / contraseña). */
const optionalPhotoUpload = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const contentType = String(req.headers["content-type"] || "");
  if (contentType.includes("multipart/form-data")) {
    return upload.single("photo")(req, res, next);
  }
  return next();
};

const router = express.Router();
router.post("/login", loginUserValidator, validate, loginUser);
router.post("/register", upload.single("photo"), registerUserValidator, validate, registerUser);
router.get("/", getUser);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id/photo", upload.single("photo"), updateUserPhoto);
router.patch("/:id", optionalPhotoUpload, updateUser);
router.delete("/:id", deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
