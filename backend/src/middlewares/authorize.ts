import { NextFunction, Request, Response } from "express";
import { hasPermission, PermissionCode } from "../auth/permissions";
import { isAdminLevel, normalizeRoleKey } from "../auth/roles";

/**
 * Autoriza por lista de roles (comparación case-insensitive).
 * Acepta aliases: Admin ≈ Administrador.
 * Legacy Superadministrador se trata como Administrador.
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "No autorizado (usuario no encontrado)" });
    }

    const allowed = roles.map((r) => normalizeRoleKey(r));
    const userKey = normalizeRoleKey(user.rol);
    // Legacy Superadministrador cuenta como admin
    const effectiveKey =
      userKey === "superadministrador" || userKey === "superadmin"
        ? "administrador"
        : userKey;

    const ok =
      allowed.includes(effectiveKey) ||
      allowed.includes(userKey) ||
      (isAdminLevel(user.rol) &&
        (allowed.includes("admin") || allowed.includes("administrador")));

    if (!ok) {
      console.log(
        `Acceso denegado: Usuario tiene rol '${user.rol}', se requieren: ${roles.join(", ")}`
      );
      return res.status(403).json({ message: "Acceso denegado: No tienes permisos" });
    }

    next();
  };
};

/** @deprecated Usar requireAdminLevel. */
export const requireSuperAdmin = () => requireAdminLevel();

/** Admin (incluye legado Superadministrador). */
export const requireAdminLevel = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "No autorizado" });
    }
    if (!isAdminLevel(user.rol)) {
      return res.status(403).json({ message: "Acceso denegado: se requiere Administrador" });
    }
    next();
  };
};

/** Requiere un permiso explícito (o implícito por rol). */
export const requirePermission = (code: PermissionCode) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "No autorizado" });
    }
    if (!hasPermission(user, code)) {
      return res.status(403).json({
        message: `Acceso denegado: falta el permiso ${code}`,
      });
    }
    next();
  };
};
