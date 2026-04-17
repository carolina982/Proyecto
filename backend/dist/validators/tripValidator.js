"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTripValidator = exports.createTripValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createTripValidator = [
    (0, express_validator_1.body)("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    (0, express_validator_1.body)("destino").notEmpty().withMessage("El destino es obligatorio"),
    (0, express_validator_1.body)("fechaSalida").notEmpty().isISO8601().withMessage("Fecha de salida inválida"),
    (0, express_validator_1.body)("fechaLlegada").optional({ nullable: true }).isISO8601().withMessage("Fecha de llagada invalida"),
    (0, express_validator_1.body)("conductorId").notEmpty().withMessage("El ID del conductor es obligatorio"),
    (0, express_validator_1.body)("unidadId").notEmpty().withMessage("El Id de la unidad es obligatorio"),
    (0, express_validator_1.body)("estado").optional().isIn(["pendiente", "en progreso", "completado"]).withMessage("Estado no válido"),
    (0, express_validator_1.body)("kilometraje").optional().isNumeric().withMessage("El kilometraje debe ser un número"),
    (0, express_validator_1.body)("acompanante").optional({ nullable: true }).isMongoId().withMessage("El ID del acompañante esta vacio"),
    (0, express_validator_1.body)("def").notEmpty().withMessage("El def es obligatorio")
];
exports.updateTripValidator = exports.createTripValidator;
