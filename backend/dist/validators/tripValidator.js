"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTripValidator = exports.createTripValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createTripValidator = [
    (0, express_validator_1.body)("rutaAcubrir").notEmpty().withMessage("El nombre es obligatorio"),
    (0, express_validator_1.body)("destino").notEmpty().withMessage("El destino es obligatorio"),
    (0, express_validator_1.body)("fechaSalida").notEmpty().isISO8601().withMessage("Fecha de salida inválida"),
    (0, express_validator_1.body)("fechaLlegada").optional({ nullable: true }).isISO8601().withMessage("Fecha de llegada inválida"),
    (0, express_validator_1.body)("conductorId").notEmpty().withMessage("El ID del conductor es obligatorio"),
    (0, express_validator_1.body)("unidadId").notEmpty().withMessage("El Id de la unidad es obligatorio"),
    (0, express_validator_1.body)("estado").optional().isIn(["pendiente", "en progreso", "en parada", "completado"]).withMessage("Estado no válido"),
    // Validamos que sea un array y que cada objeto dentro tenga la propiedad 'numero' como un número
    (0, express_validator_1.body)("kilometrajeSalida").optional().isArray().withMessage("El kilometraje debe ser una lista"),
    (0, express_validator_1.body)("kilometrajeSalida.*.numero").optional().isNumeric().withMessage("El valor de KM debe ser un número"),
    (0, express_validator_1.body)("kilometrajeSalida.*.descripcion").optional().isString(),
    (0, express_validator_1.body)("kilometrajeLlegada").optional().isArray().withMessage("El kilometraje debe ser una lista"),
    (0, express_validator_1.body)("kilometrajeLlegada.*.numero").optional().isNumeric().withMessage("El valor de KM debe ser un número"),
    (0, express_validator_1.body)("kilometrajeLlegada.*.descripcion").optional().isString(),
    (0, express_validator_1.body)("acompanante").optional({ nullable: true }).isMongoId().withMessage("ID de acompañante inválido"),
    (0, express_validator_1.body)("def").optional().isString().withMessage("DEF inválido"),
    (0, express_validator_1.body)("destinoActualIndex").optional().isNumeric().withMessage("Índice de destino inválido"),
];
exports.updateTripValidator = [
    (0, express_validator_1.body)("rutaAcubrir").optional().notEmpty().withMessage("El nombre es obligatorio"),
    (0, express_validator_1.body)("destino").optional().notEmpty().withMessage("El destino es obligatorio"),
    (0, express_validator_1.body)("fechaSalida").optional({ nullable: true }).isISO8601().withMessage("Fecha de salida inválida"),
    (0, express_validator_1.body)("fechaLlegada").optional({ nullable: true }).isISO8601().withMessage("Fecha de llegada inválida"),
    (0, express_validator_1.body)("conductorId").optional().notEmpty().withMessage("El ID del conductor es obligatorio"),
    (0, express_validator_1.body)("unidadId").optional().notEmpty().withMessage("El Id de la unidad es obligatorio"),
    (0, express_validator_1.body)("estado").optional().isIn(["pendiente", "en progreso", "en parada", "completado"]).withMessage("Estado no válido"),
    (0, express_validator_1.body)("kilometrajeSalida").optional().isArray().withMessage("El kilometraje debe ser una lista"),
    (0, express_validator_1.body)("kilometrajeSalida.*.numero").optional().isNumeric().withMessage("El valor de KM debe ser un número"),
    (0, express_validator_1.body)("kilometrajeSalida.*.descripcion").optional().isString(),
    (0, express_validator_1.body)("kilometrajeLlegada").optional().isArray().withMessage("El kilometraje debe ser una lista"),
    (0, express_validator_1.body)("kilometrajeLlegada.*.numero").optional().isNumeric().withMessage("El valor de KM debe ser un número"),
    (0, express_validator_1.body)("kilometrajeLlegada.*.descripcion").optional().isString(),
    (0, express_validator_1.body)("acompanante").optional({ nullable: true }).custom((value) => {
        if (value === null || value === "" || value === "none")
            return true;
        if (typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value))
            return true;
        throw new Error("ID de acompañante inválido");
    }),
    (0, express_validator_1.body)("def").optional().isString().withMessage("DEF inválido"),
    (0, express_validator_1.body)("destinoActualIndex").optional().isNumeric().withMessage("Índice de destino inválido"),
    (0, express_validator_1.body)("multidestino").optional().isBoolean().withMessage("Multidestino inválido"),
];
