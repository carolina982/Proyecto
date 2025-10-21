import express from "express";
import multer from "multer";
import { createUser, deleteUser, getUser, getUserById, loginUser, registerUser, updateUser, } from "../controllers/userController";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), 
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/", getUser);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id", upload.single("photo"), updateUser);
router.delete("/:id", deleteUser);
export default router;