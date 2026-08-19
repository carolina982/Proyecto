import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  getWebPushKey,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
  registerWebPush,
} from "../controllers/notificationController";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get("/web-push-key", verifyToken, getWebPushKey);
router.post("/web-push", verifyToken, registerWebPush);
router.post("/push-token", verifyToken, registerPushToken);
router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.patch("/read-all", verifyToken, markAllNotificationsRead);
router.patch("/:id/read", verifyToken, markNotificationRead);

export default router;
