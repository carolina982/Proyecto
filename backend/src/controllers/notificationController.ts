import { Request, Response } from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification";
import User from "../models/User";

export const registerPushToken = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token requerido" });
    }

    await User.findByIdAndUpdate(user._id, { expoPushToken: token.trim() });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error registrando push token:", error);
    res.status(500).json({ message: "No se pudo registrar el token" });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const limit = Math.min(Number(req.query.limit) || 30, 50);

    const items = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(
      items.map((n) => ({
        id: String(n._id),
        title: n.title,
        body: n.body,
        type: n.type,
        tripId: n.tripId ? String(n.tripId) : null,
        read: n.read,
        createdAt: n.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error listando notificaciones:", error);
    res.status(500).json({ message: "Error obteniendo notificaciones" });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const count = await Notification.countDocuments({ userId: user._id, read: false });
    res.json({ count });
  } catch (error) {
    console.error("Error contando notificaciones:", error);
    res.status(500).json({ message: "Error obteniendo contador" });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    await Notification.findOneAndUpdate(
      { _id: id, userId: user._id },
      { read: true }
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error marcando notificación:", error);
    res.status(500).json({ message: "Error actualizando notificación" });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await Notification.updateMany({ userId: user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error marcando todas:", error);
    res.status(500).json({ message: "Error actualizando notificaciones" });
  }
};
