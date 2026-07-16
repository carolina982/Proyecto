"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "No autorizado (usuario no encontrado)" });
        }
        const userRole = user.rol?.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());
        if (!allowedRoles.includes(userRole)) {
            console.log(`Acceso denegado: Usuario tiene rol '${user.rol}', se requieren: ${roles.join(', ')}`);
            return res.status(403).json({ message: "Acceso denegado: No tienes permisos" });
        }
        next();
    };
};
exports.authorize = authorize;
