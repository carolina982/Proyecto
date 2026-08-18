import { Request, Response } from "express";
import { PERMISSION_CATALOG, hasPermission, PERMISSIONS } from "../auth/permissions";
import { isAdminLevel } from "../auth/roles";
import Settings, { DEFAULT_DEF_UNIT_PRICE, SETTINGS_KEY } from "../models/Settings";

async function getOrCreateSettings() {
  let doc = await Settings.findOne({ key: SETTINGS_KEY });
  if (!doc) {
    doc = await Settings.create({
      key: SETTINGS_KEY,
      defUnitPrice: DEFAULT_DEF_UNIT_PRICE,
      emailSendingEnabled: true,
      tripEmailsEnabled: false,
    });
  }
  return doc;
}

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    return res.json({
      defUnitPrice: Number(settings.defUnitPrice ?? DEFAULT_DEF_UNIT_PRICE),
      tripEmailsEnabled: settings.tripEmailsEnabled === true,
      emailSendingEnabled: settings.emailSendingEnabled !== false,
      extras: settings.extras || {},
      permissionCatalog: PERMISSION_CATALOG,
    });
  } catch (error) {
    console.error("Error al obtener settings", error);
    return res.status(500).json({ message: "Error al obtener configuración" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const raw = req.body?.defUnitPrice;
    const hasDef = raw !== undefined && raw !== null && String(raw).trim() !== "";
    const hasTripEmailToggle = req.body?.tripEmailsEnabled !== undefined;
    const hasGlobalEmailToggle = req.body?.emailSendingEnabled !== undefined;
    const hasExtras = req.body?.extras !== undefined && typeof req.body.extras === "object";

    // Configuración global del sistema: permiso system.config
    if ((hasGlobalEmailToggle || hasExtras) && !hasPermission(authUser, PERMISSIONS.SYSTEM_CONFIG)) {
      return res.status(403).json({
        message: "Necesitas el permiso system.config para cambiar la configuración del sistema",
      });
    }

    // Precio DEF / correos de viaje: Administrador o system.config
    if (
      (hasDef || hasTripEmailToggle) &&
      !isAdminLevel(authUser?.rol) &&
      !hasPermission(authUser, PERMISSIONS.SYSTEM_CONFIG)
    ) {
      return res.status(403).json({
        message: "No tienes permiso para actualizar esta configuración",
      });
    }

    if (!hasDef && !hasTripEmailToggle && !hasGlobalEmailToggle && !hasExtras) {
      return res.status(400).json({ message: "Nada que actualizar" });
    }

    let defUnitPrice: number | undefined;
    if (hasDef) {
      defUnitPrice = Number(raw);
      if (!Number.isFinite(defUnitPrice) || defUnitPrice < 0) {
        return res.status(400).json({ message: "Precio DEF inválido" });
      }
    }

    const settings = await getOrCreateSettings();
    if (hasTripEmailToggle) {
      settings.tripEmailsEnabled = Boolean(req.body.tripEmailsEnabled);
    }
    if (hasGlobalEmailToggle) {
      settings.emailSendingEnabled = Boolean(req.body.emailSendingEnabled);
    }
    if (hasDef && defUnitPrice !== undefined) {
      settings.defUnitPrice = defUnitPrice;
    }
    if (hasExtras) {
      settings.extras = { ...(settings.extras || {}), ...req.body.extras };
      settings.markModified("extras");
    }
    await settings.save();

    const messages: string[] = [];
    if (hasDef) messages.push("Precio DEF actualizado");
    if (hasTripEmailToggle) {
      messages.push(
        settings.tripEmailsEnabled
          ? "Correos de viaje activados"
          : "Correos de viaje desactivados"
      );
    }
    if (hasGlobalEmailToggle) {
      messages.push(
        settings.emailSendingEnabled
          ? "Envío global de correos activado"
          : "Envío global de correos desactivado"
      );
    }
    if (hasExtras) messages.push("Configuración extra actualizada");

    return res.json({
      message: messages.join(". ") + (hasDef ? " Solo aplica a nuevos registros." : "."),
      defUnitPrice: Number(settings.defUnitPrice),
      tripEmailsEnabled: settings.tripEmailsEnabled === true,
      emailSendingEnabled: settings.emailSendingEnabled !== false,
      extras: settings.extras || {},
    });
  } catch (error) {
    console.error("Error al actualizar settings", error);
    return res.status(500).json({ message: "Error al actualizar configuración" });
  }
};

/** Config de cámaras (IPs / URLs) compartida entre administradores. */
export const getCameraConfig = async (_req: Request, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    const extras = (settings.extras || {}) as Record<string, unknown>;
    const devices =
      extras.cameraDevices && typeof extras.cameraDevices === "object"
        ? extras.cameraDevices
        : {};
    return res.json({ devices });
  } catch (error) {
    console.error("Error al obtener camera config", error);
    return res.status(500).json({ message: "Error al obtener cámaras" });
  }
};

export const updateCameraConfig = async (req: Request, res: Response) => {
  try {
    const devices = req.body?.devices;
    if (!devices || typeof devices !== "object" || Array.isArray(devices)) {
      return res.status(400).json({ message: "devices inválido" });
    }
    const settings = await getOrCreateSettings();
    const extras = {
      ...((settings.extras || {}) as Record<string, unknown>),
      cameraDevices: devices,
    };
    settings.extras = extras;
    settings.markModified("extras");
    await settings.save();
    return res.json({
      ok: true,
      message: "Configuración de cámaras guardada para todos los admins",
      devices: extras.cameraDevices,
    });
  } catch (error) {
    console.error("Error al guardar camera config", error);
    return res.status(500).json({ message: "Error al guardar cámaras" });
  }
};
