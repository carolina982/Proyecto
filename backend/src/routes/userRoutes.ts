import express from "express";
import { createUser, deleteUser, deleteUserPhoto, forgotPassword, getUser, getUserById, loginUser, registerUser, resetPassword, updateUser, updateUserEmailNotifications, updateUserPhoto, } from "../controllers/userController";
import { verifyToken } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
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

const auth = verifyToken;
const adminOnly = [
  verifyToken,
  authorize(["Admin", "Administrador"]),
];

router.post("/login", loginUserValidator, validate, loginUser);
router.post("/register", upload.single("photo"), registerUserValidator, validate, registerUser);
router.get("/", auth, getUser);
router.get("/:id", auth, getUserById);
router.post("/", ...adminOnly, createUser);
router.patch("/:id/photo", auth, upload.single("photo"), updateUserPhoto);
router.delete("/:id/photo", auth, deleteUserPhoto);
// Admin: cualquier usuario. Autenticado: solo su propio perfil (nombre/contacto/foto).
router.patch("/:id/email-notifications", ...adminOnly, updateUserEmailNotifications);
router.patch("/:id", auth, optionalPhotoUpload, updateUser);
router.delete("/:id", ...adminOnly, deleteUser);
// Recuperación activa: POST /api/auth/forgot-password y /api/auth/reset-password (Gmail SMTP + código).
// Estas rutas legacy quedan deshabilitadas (410).
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
