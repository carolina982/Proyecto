import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
} from "../controllers/notificationController";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/push-token", verifyToken, registerPushToken);
router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.patch("/read-all", verifyToken, markAllNotificationsRead);
router.patch("/:id/read", verifyToken, markNotificationRead);

export default router;
