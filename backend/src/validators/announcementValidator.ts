import { body } from "express-validator";

export const createAnnouncementsValidator=[
    body("titulo").notEmpty().withMessage("El titulo es requerido"),
    body("contenido").notEmpty().withMessage("El contenido es requerido"),
    body("fecha").optional().isISO8601().withMessage("La fecha debe ser valida"),
];

export const updateAnnouncementValidator=[
    body("titulo").optional().isString(),
    body("contenido").optional().isString(),
    body("fecha").optional().isISO8601(),
];
