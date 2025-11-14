import { body } from "express-validator";

export const createTripValidator =[
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("destino").notEmpty().withMessage("El destino es obligatorio"),
    body("fechaSalida").notEmpty().isISO8601().withMessage("Fecha de salida invalida"),
    body("fechaLlegada").notEmpty().isISO8601().withMessage("Fecha de llegada invalida"),
    body("conductorId").notEmpty().withMessage("El ID del cunductor es obligarotio"),
    body("unidadID").notEmpty().withMessage("El Id de la unidad es obligatorio"),
    body("estado").optional().isIn(["pendiente", "completado"]).withMessage("Etsado no valido"),
    body("Kilometraje").optional().isNumeric().withMessage("Debe ser numero"),
    body("acopanate").notEmpty().withMessage("El acompañante es obligatorio"),
    body("def").notEmpty().withMessage("El def es obligatorio"),
];

export const updateTripValidator=createTripValidator;