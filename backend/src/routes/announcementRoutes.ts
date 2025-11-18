import express from "express";
import { createAnnouncements, deleteAnnouncement, getAnnouncements, updateAnnouncement } from "../controllers/announcementController";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createAnnouncementsValidator, updateAnnouncementValidator } from "../validators/announcementValidator";

const router =express.Router();
router.get("/",getAnnouncements);
router.post("/",upload.single("image"),createAnnouncementsValidator,validate,createAnnouncements);
router.put("/:id",upload.single("image"),updateAnnouncementValidator,validate,updateAnnouncement);
router.delete("/:id" , deleteAnnouncement);

export default router;