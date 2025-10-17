import express from "express";
import { createAnnouncements, deleteAnnouncement, getAnnouncements, updateAnnouncement } from "../controllers/announcementController";
import { upload } from "../middlewares/upload";

const router =express.Router();
router.get("/",getAnnouncements);
router.post("/",upload.single("image"),createAnnouncements);
router.put("/:id",upload.single("image"),updateAnnouncement);
router.delete("/:id" , deleteAnnouncement);

export default router;