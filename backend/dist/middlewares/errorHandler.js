"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandeler = void 0;
const errorHandeler = (err, req, res, next) => {
    console.error("Error global:", err);
    res.status(err.status || 500).json({ message: err.message || "Error interno del servidor" });
};
exports.errorHandeler = errorHandeler;
