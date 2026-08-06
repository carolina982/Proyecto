"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireAdminLevel = exports.requireSuperAdmin = exports.authorize = void 0;
const permissions_1 = require("../auth/permissions");
const roles_1 = require("../auth/roles");
/**
 * Autoriza por lista de roles (comparación case-insensitive).
 * Acepta aliases: Admin ≈ Administrador.
 * Legacy Superadministrador se trata como Administrador.
 */
const authorize = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "No autorizado (usuario no encontrado)" });
        }
        const allowed = roles.map((r) => (0, roles_1.normalizeRoleKey)(r));
        const userKey = (0, roles_1.normalizeRoleKey)(user.rol);
        // Legacy Superadministrador cuenta como admin
        const effectiveKey = userKey === "superadministrador" || userKey === "superadmin"
            ? "administrador"
            : userKey;
        const ok = allowed.includes(effectiveKey) ||
            allowed.includes(userKey) ||
            ((0, roles_1.isAdminLevel)(user.rol) &&
                (allowed.includes("admin") || allowed.includes("administrador")));
        if (!ok) {
            console.log(`Acceso denegado: Usuario tiene rol '${user.rol}', se requieren: ${roles.join(", ")}`);
            return res.status(403).json({ message: "Acceso denegado: No tienes permisos" });
        }
        next();
    };
};
exports.authorize = authorize;
/** @deprecated Usar requireAdminLevel. */
const requireSuperAdmin = () => (0, exports.requireAdminLevel)();
exports.requireSuperAdmin = requireSuperAdmin;
/** Admin (incluye legado Superadministrador). */
const requireAdminLevel = () => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "No autorizado" });
        }
        if (!(0, roles_1.isAdminLevel)(user.rol)) {
            return res.status(403).json({ message: "Acceso denegado: se requiere Administrador" });
        }
        next();
    };
};
exports.requireAdminLevel = requireAdminLevel;
/** Requiere un permiso explícito (o implícito por rol). */
const requirePermission = (code) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "No autorizado" });
        }
        if (!(0, permissions_1.hasPermission)(user, code)) {
            return res.status(403).json({
                message: `Acceso denegado: falta el permiso ${code}`,
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
