import { body } from "express-validator";

export const createTripValidator = [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("destino").notEmpty().withMessage("El destino es obligatorio"),
    body("fechaSalida").notEmpty().isISO8601().withMessage("Fecha de salida inválida"),
    body("fechaLlegada").notEmpty().isISO8601().withMessage("Fecha de llegada inválida"),
    body("conductorId").notEmpty().withMessage("El ID del conductor es obligatorio"),
    body("unidadId").notEmpty().withMessage("El Id de la unidad es obligatorio"),
    body("estado").optional().isIn(["pendiente", "en progreso", "completado"]).withMessage("Estado no válido"),
    body("kilometraje").optional().isNumeric().withMessage("El kilometraje debe ser un número"),
    body("acompanante").notEmpty().withMessage("El acompañante es obligatorio"),
    body("def").notEmpty() .withMessage("El def es obligatorio")
];

export const updateTripValidator = createTripValidator;