import { body } from "express-validator";

export const createTripValidator = [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("destino").notEmpty().withMessage("El destino es obligatorio"),
    body("fechaSalida").notEmpty().isISO8601().withMessage("Fecha de salida inválida"),
    body("fechaLlegada").optional({nullable:true}).isISO8601().withMessage("Fecha de llagada invalida"),
    body("conductorId").notEmpty().withMessage("El ID del conductor es obligatorio"),
    body("unidadId").notEmpty().withMessage("El Id de la unidad es obligatorio"),
    body("estado").optional().isIn(["pendiente", "en progreso", "completado"]).withMessage("Estado no válido"),
    body("kilometraje").optional().isNumeric().withMessage("El kilometraje debe ser un número"),
    body("acompanante").optional({nullable:true}).isMongoId().withMessage("El ID del acompañante esta vacio"),
    body("def").notEmpty() .withMessage("El def es obligatorio")
];

export const updateTripValidator = createTripValidator;