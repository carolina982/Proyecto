"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserValidator = exports.registerUserValidator = void 0;
const express_validator_1 = require("express-validator");
/** Auto-registro público: solo Operador (nunca Admin / Administrador). */
const PUBLIC_REGISTER_ROLES = ["Operador", "Chofer"];
exports.registerUserValidator = [
    (0, express_validator_1.body)("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    (0, express_validator_1.body)("apellidoPaterno")
        .optional({ nullable: true })
        .isString(),
    (0, express_validator_1.body)("apellido")
        .custom((value, { req }) => {
        const paterno = String(req.body?.apellidoPaterno || "").trim();
        const legacy = String(value || "").trim();
        if (!paterno && !legacy) {
            throw new Error("El apellido paterno es obligatorio");
        }
        return true;
    }),
    (0, express_validator_1.body)("email").isEmail().withMessage("Correo invalido"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("La contraseña es obligatoria"),
    (0, express_validator_1.body)("rol")
        .optional({ nullable: true })
        .custom((value) => {
        if (value == null || String(value).trim() === "")
            return true;
        const normalized = String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
        if (normalized === "admin" || normalized === "administrador" || normalized === "superadministrador") {
            throw new Error("No es posible auto-registrarse como administrador");
        }
        const allowed = PUBLIC_REGISTER_ROLES.map((r) => r
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase());
        if (!allowed.includes(normalized)) {
            throw new Error("Rol no válido. El auto-registro solo permite Operador");
        }
        return true;
    }),
    (0, express_validator_1.body)("contacto").notEmpty().withMessage("Ingrese el numero de contacto"),
];
exports.loginUserValidator = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Correo invalido"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("la contraseña es obligatoria"),
];
