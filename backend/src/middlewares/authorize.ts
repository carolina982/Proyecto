import { NextFunction, Request, Response } from "express";

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
       
        const user = (req as any).user;
        
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