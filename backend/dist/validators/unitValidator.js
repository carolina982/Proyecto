"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUnitValidator = exports.createUnitValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createUnitValidator = [
    (0, express_validator_1.body)("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    (0, express_validator_1.body)("placas").notEmpty().withMessage("Las placas son obligatorias"),
    (0, express_validator_1.body)("modelo").notEmpty().withMessage("El modelo es obligatorio"),
    (0, express_validator_1.body)("capacidad").notEmpty().withMessage("La capacidad es obligatoria"),
    (0, express_validator_1.body)("estado").optional().isIn(["Disponible", "Mantenimiento", "Ocupado"]).withMessage("Estado invalido"),
    (0, express_validator_1.body)("tipoRemolque").optional().isIn(["Lowboy", "Caja Seca", ""]).withMessage("Tipo de remolque invalido"),
    (0, express_validator_1.body)("placaRemolque").optional().isString().withMessage("La placa del remolque debe ser texto"),
];
exports.updateUnitValidator = exports.createUnitValidator;
