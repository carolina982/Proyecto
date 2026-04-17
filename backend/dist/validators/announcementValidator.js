"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAnnouncementValidator = exports.createAnnouncementsValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createAnnouncementsValidator = [
    (0, express_validator_1.body)("titulo").notEmpty().withMessage("El titulo es requerido"),
    (0, express_validator_1.body)("contenido").notEmpty().withMessage("El contenido es requerido"),
    (0, express_validator_1.body)("fecha").optional().isISO8601().withMessage("La fecha debe ser valida"),
];
exports.updateAnnouncementValidator = [
    (0, express_validator_1.body)("titulo").optional().isString(),
    (0, express_validator_1.body)("contenido").optional().isString(),
    (0, express_validator_1.body)("fecha").optional().isISO8601(),
];
