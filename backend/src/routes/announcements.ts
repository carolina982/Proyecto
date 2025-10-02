import express from "express";
import { createAnnouncements, deleteAnnouncement, getAnnouncements, updateAnnouncement } from "../controllers/announcementController";

const router =express.Router();
router.get("/",getAnnouncements);
router.post("/", createAnnouncements);
router.put("/:id",updateAnnouncement);
router.delete("/:id" , deleteAnnouncement);

export default router;

