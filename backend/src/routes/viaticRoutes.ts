import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { createViatic, deleteViatic, getViatic, getViaticById, getViaticByTrip, updateViatic, } from "../controllers/viaticController";
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });
const router = Router();

router.get("/", getViatic);
router.get("/:id", getViaticById);
router.get("/trip/:tripId", getViaticByTrip);
router.post("/", upload.single("ticket"), createViatic);
router.put("/:id", upload.single("ticket"), updateViatic);
router.delete("/:id", deleteViatic);

export default router;