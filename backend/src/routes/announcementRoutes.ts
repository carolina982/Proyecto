import express from "express";
import { createAnnouncements, deleteAnnouncement, getAnnouncements, updateAnnouncement } from "../controllers/announcementController";
import { verifyToken } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createAnnouncementsValidator, updateAnnouncementValidator } from "../validators/announcementValidator";

const router =express.Router();
router.get("/",getAnnouncements);
router.post("/",verifyToken,authorize(["admin"]),upload.single("image"),createAnnouncementsValidator,validate,createAnnouncements);
router.put("/:id",verifyToken,authorize(["admin"]),upload.single("image"),updateAnnouncementValidator,validate,updateAnnouncement);
router.delete("/:id",verifyToken,authorize(["admin"]),deleteAnnouncement);

export default router;