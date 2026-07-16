"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resend = void 0;
// para recuperacion de contraseña
const resend_1 = require("resend");
exports.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
