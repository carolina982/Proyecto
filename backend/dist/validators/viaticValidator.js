"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateViaticValidator = exports.createViaticValidator = void 0;
const express_validator_1 = require("express-validator");
const optionalNumber = (field, message) => (0, express_validator_1.body)(field)
    .optional({ values: "falsy" })
    .custom((value) => {
    if (value === undefined || value === null || value === "")
        return true;
    if (!Number.isNaN(Number(value)))
        return true;
    throw new Error(message);
});
exports.createViaticValidator = [
    (0, express_validator_1.body)("tripId").notEmpty().withMessage("El tripId es obligatorio"),
    (0, express_validator_1.body)("conceptos")
        .optional({ values: "falsy" })
        .custom((value) => {
        if (value === undefined || value === null || value === "")
            return true;
        if (typeof value === "string") {
            JSON.parse(value);
            return true;
        }
        if (typeof value === "object")
            return true;
        throw new Error("Conceptos debe ser un objeto o JSON valido");
    }),
    optionalNumber("dieselCargas", "Debe ser numero"),
    optionalNumber("dieselCosto", "Debe ser numero"),
    optionalNumber("tag", "Debe ser numero"),
    optionalNumber("total", "Debe ser numero"),
    optionalNumber("kilometrajeInicial", "Debe ser numero"),
    optionalNumber("kilometrajeFinal", "Debe ser numero"),
    optionalNumber("kilometrosRecorridos", "Debe ser numero"),
    optionalNumber("totalDefGastado", "Debe ser numero"),
];
exports.updateViaticValidator = exports.createViaticValidator;
