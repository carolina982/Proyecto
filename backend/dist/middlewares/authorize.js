"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "No autorizado " });
        if (!roles.includes(user.rol)) {
            return res.status(403).json({ message: "Acesso denegado " });
        }
        next();
    };
};
exports.authorize = authorize;
