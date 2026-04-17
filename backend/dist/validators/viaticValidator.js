"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateViaticValidator = exports.createViaticValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createViaticValidator = [
    (0, express_validator_1.body)("tripId").notEmpty().withMessage("El tripId es obligatorio"),
    (0, express_validator_1.body)("conceptos").custom((value) => {
        if (typeof value == "string") {
            JSON.parse(value);
            return true;
        }
        if (typeof value === "object") {
            return true;
        }
        throw new Error("Conceptos debe ser un objeto o JSON valido");
    }),
    (0, express_validator_1.body)("dieselCargas").optional().isNumeric().withMessage("Debe ser numero"),
    (0, express_validator_1.body)("dieselCosto").optional().isNumeric().withMessage("Debe ser numero"),
    (0, express_validator_1.body)("tag").optional().isNumeric().withMessage("Debe ser numero"),
    (0, express_validator_1.body)("total").optional().isNumeric().withMessage("Debe ser numero"),
];
exports.updateViaticValidator = exports.createViaticValidator;
