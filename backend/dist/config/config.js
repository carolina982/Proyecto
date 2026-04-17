"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.MONGO_URI = void 0;
exports.MONGO_URI = "mongodb://127.0.0.1:27017/volta";
exports.JWT_SECRET = process.env.JWT_SECRET || "mi_super_secreto";
