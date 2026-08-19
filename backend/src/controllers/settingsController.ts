import { Request, Response } from "express";
import { PERMISSION_CATALOG, hasPermission, PERMISSIONS } from "../auth/permissions";
import { isAdminLevel } from "../auth/roles";
import Settings, {
  DEFAULT_COMIDA_UNIT_PRICE,
  DEFAULT_COMISION_UNIT_PRICE,
  DEFAULT_DEF_UNIT_PRICE,
  SETTINGS_KEY,
} from "../models/Settings";
import { normalizeAndroidCertSha256, normalizeAppleTeamId } from "../utils/appLinks";

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
    const extras = (settings.extras || {}) as Record<string, unknown>;
    return res.json({
      defUnitPrice: Number(settings.defUnitPrice ?? DEFAULT_DEF_UNIT_PRICE),
      comidaUnitPrice: Number((settings as any).comidaUnitPrice ?? DEFAULT_COMIDA_UNIT_PRICE),
      comisionUnitPrice: Number((settings as any).comisionUnitPrice ?? DEFAULT_COMISION_UNIT_PRICE),
      tripEmailsEnabled: settings.tripEmailsEnabled === true,
      emailSendingEnabled: settings.emailSendingEnabled !== false,
      extras,
      appleTeamId: String(extras.appleTeamId || ""),
      androidCertSha256: String(extras.androidCertSha256 || ""),
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
    const rawComida = req.body?.comidaUnitPrice;
    const rawComision = req.body?.comisionUnitPrice;
    const hasDef = raw !== undefined && raw !== null && String(raw).trim() !== "";
    const hasComida = rawComida !== undefined && rawComida !== null && String(rawComida).trim() !== "";
    const hasComision =
      rawComision !== undefined && rawComision !== null && String(rawComision).trim() !== "";
    const hasTripEmailToggle = req.body?.tripEmailsEnabled !== undefined;
    const hasGlobalEmailToggle = req.body?.emailSendingEnabled !== undefined;
    const hasExtras = req.body?.extras !== undefined && typeof req.body.extras === "object";
    const hasAppLinks =
      req.body?.appleTeamId !== undefined || req.body?.androidCertSha256 !== undefined;

    // Configuración global del sistema: permiso system.config
    if (
      (hasGlobalEmailToggle || hasExtras || hasAppLinks) &&
      !hasPermission(authUser, PERMISSIONS.SYSTEM_CONFIG)
    ) {
      return res.status(403).json({
        message: "Necesitas el permiso system.config para cambiar la configuración del sistema",
      });
    }

    // Precio DEF / correos de viaje: Administrador o system.config
    if (
      (hasDef || hasComida || hasComision || hasTripEmailToggle) &&
      !isAdminLevel(authUser?.rol) &&
      !hasPermission(authUser, PERMISSIONS.SYSTEM_CONFIG)
    ) {
      return res.status(403).json({
        message: "No tienes permiso para actualizar esta configuración",
      });
    }

    if (
      !hasDef &&
      !hasComida &&
      !hasComision &&
      !hasTripEmailToggle &&
      !hasGlobalEmailToggle &&
      !hasExtras &&
      !hasAppLinks
    ) {
      return res.status(400).json({ message: "Nada que actualizar" });
    }

    let defUnitPrice: number | undefined;
    if (hasDef) {
      defUnitPrice = Number(raw);
      if (!Number.isFinite(defUnitPrice) || defUnitPrice < 0) {
        return res.status(400).json({ message: "Precio DEF inválido" });
      }
    }
    let comidaUnitPrice: number | undefined;
    if (hasComida) {
      comidaUnitPrice = Number(rawComida);
      if (!Number.isFinite(comidaUnitPrice) || comidaUnitPrice < 0) {
        return res.status(400).json({ message: "Precio de comidas inválido" });
      }
    }
    let comisionUnitPrice: number | undefined;
    if (hasComision) {
      comisionUnitPrice = Number(rawComision);
      if (!Number.isFinite(comisionUnitPrice) || comisionUnitPrice < 0) {
        return res.status(400).json({ message: "Precio de comisiones inválido" });
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
    if (hasComida && comidaUnitPrice !== undefined) {
      (settings as any).comidaUnitPrice = comidaUnitPrice;
    }
    if (hasComision && comisionUnitPrice !== undefined) {
      (settings as any).comisionUnitPrice = comisionUnitPrice;
    }
    if (hasExtras) {
      settings.extras = { ...(settings.extras || {}), ...req.body.extras };
      settings.markModified("extras");
    }
    if (hasAppLinks) {
      const extras = { ...((settings.extras || {}) as Record<string, unknown>) };
      if (req.body.appleTeamId !== undefined) {
        extras.appleTeamId = normalizeAppleTeamId(String(req.body.appleTeamId || ""));
      }
      if (req.body.androidCertSha256 !== undefined) {
        extras.androidCertSha256 = normalizeAndroidCertSha256(
          String(req.body.androidCertSha256 || "")
        );
      }
      settings.extras = extras;
      settings.markModified("extras");
    }
    await settings.save();

    const messages: string[] = [];
    if (hasDef) messages.push("Precio DEF actualizado");
    if (hasComida) messages.push("Precio de comidas actualizado");
    if (hasComision) messages.push("Precio de comisiones actualizado");
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
    if (hasAppLinks) messages.push("App Links actualizados");

    return res.json({
      message:
        messages.join(". ") +
        (hasDef || hasComida || hasComision ? " Solo aplica a nuevos registros." : "."),
      defUnitPrice: Number(settings.defUnitPrice),
      comidaUnitPrice: Number((settings as any).comidaUnitPrice ?? DEFAULT_COMIDA_UNIT_PRICE),
      comisionUnitPrice: Number((settings as any).comisionUnitPrice ?? DEFAULT_COMISION_UNIT_PRICE),
      tripEmailsEnabled: settings.tripEmailsEnabled === true,
      emailSendingEnabled: settings.emailSendingEnabled !== false,
      extras: settings.extras || {},
      appleTeamId: String((settings.extras as any)?.appleTeamId || ""),
      androidCertSha256: String((settings.extras as any)?.androidCertSha256 || ""),
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
