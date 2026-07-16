"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const list = errors.array();
        return res.status(400).json({
            message: list[0]?.msg || "Datos inválidos",
            errors: list,
        });
    }
    next();
};
exports.validate = validate;
