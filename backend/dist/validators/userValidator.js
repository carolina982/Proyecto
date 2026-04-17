"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserValidator = exports.registerUserValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerUserValidator = [
    (0, express_validator_1.body)("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    (0, express_validator_1.body)("apellido").optional(),
    (0, express_validator_1.body)("email").isEmail().withMessage("Correo invalido"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("La contraseña es obligatoria"),
    (0, express_validator_1.body)("rol").notEmpty().isIn(["Admin", "Chofer"]).withMessage("Rol no valido"),
];
exports.loginUserValidator = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Correo invalido"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("la contraseña es obligatoria"),
];
