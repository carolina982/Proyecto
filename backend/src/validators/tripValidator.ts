import { body } from "express-validator";

export const createTripValidator = [
    body("rutaAcubrir").notEmpty().withMessage("El nombre es obligatorio"),
    body("destino").notEmpty().withMessage("El destino es obligatorio"),
    body("fechaSalida").notEmpty().isISO8601().withMessage("Fecha de salida inválida"),
    body("fechaLlegada").optional({nullable: true}).isISO8601().withMessage("Fecha de llegada inválida"),
    body("conductorId").notEmpty().withMessage("El ID del conductor es obligatorio"),
    body("unidadId").notEmpty().withMessage("El Id de la unidad es obligatorio"),
    body("estado").optional().isIn(["pendiente", "en progreso", "completado"]).withMessage("Estado no válido"),
    
   
    // Validamos que sea un array y que cada objeto dentro tenga la propiedad 'numero' como un número
    body("kilometrajeSalida").optional().isArray().withMessage("El kilometraje debe ser una lista"),
    body("kilometrajeSalida.*.numero").optional().isNumeric().withMessage("El valor de KM debe ser un número"),
    body("kilometrajeSalida.*.descripcion").optional().isString(),

    body("kilometrajeLlegada").optional().isArray().withMessage("El kilometraje debe ser una lista"),
    body("kilometrajeLlegada.*.numero").optional().isNumeric().withMessage("El valor de KM debe ser un número"),
    body("kilometrajeLlegada.*.descripcion").optional().isString(),
   

    body("acompanante").optional({nullable: true}).isMongoId().withMessage("ID de acompañante inválido"),
    body("def").notEmpty().withMessage("El def es obligatorio")
];

export const updateTripValidator = createTripValidator;