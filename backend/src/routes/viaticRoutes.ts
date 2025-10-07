import { Router } from "express";
import multer from "multer";
import { createViatic, deleteViatic, getViatic, getViaticById, getViaticByTrip, updateViatic, } from "../controllers/viaticController";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = Router();
router.post("/" ,upload.single("ticket"),createViatic);
router.get("/", getViatic);
router.get("/:id" , getViaticById);
router.get("/trip/:tipId",getViaticByTrip);
router.put("/:id" ,updateViatic);
router.delete("/:id", deleteViatic);

export default router;