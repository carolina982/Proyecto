import mongoose from "mongoose";
import { hasPermission, PERMISSIONS } from "../auth/permissions";
import Settings, { SETTINGS_KEY } from "../models/Settings";
import User from "../models/User";

export type TripEmailKind = "tripAssigned" | "tripStarted" | "tripCompleted";

/** Envía correo solo si el sistema, el permiso y la preferencia del usuario lo permiten. */
export async function shouldSendTripEmailToUser(
  userId: string | mongoose.Types.ObjectId | null | undefined,
  kind: TripEmailKind
): Promise<boolean> {
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) return false;
  try {
    const settings = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    if (settings && settings.emailSendingEnabled === false) return false;
    if (settings && settings.tripEmailsEnabled !== true) return false;

    const user = await User.findById(userId).select(
      "email emailNotifications permissions rol"
    );
    if (!user?.email) return false;
    if (!hasPermission(user, PERMISSIONS.EMAIL_RECEIVE)) return false;

    const prefs = user.emailNotifications || {};
    if (prefs.enabled === false) return false;
    return prefs[kind] === true;
  } catch {
    return false;
  }
}
