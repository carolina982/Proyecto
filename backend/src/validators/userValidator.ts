import { body } from "express-validator";

export const registerUserValidator=[
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("apellido").optional(),
    body("email").isEmail().withMessage("Correo invalido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
    body("rol").notEmpty().isIn(["Admin","Chofer"]).withMessage("Rol no valido"),
];

export const loginUserValidator=[
    body("email").isEmail().withMessage("Correo invalido"),
    body("password").notEmpty().withMessage("la contraseña es obligatoria"),
];
