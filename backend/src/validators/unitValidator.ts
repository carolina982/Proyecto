import { body } from "express-validator";

export const createUnitValidator =[
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("placas").notEmpty().withMessage("Las placas son obligatorias"),
    body("modelo").notEmpty().withMessage("El modelo es obligatorio"),
    body("capacidad").notEmpty().withMessage("La capacidad es obligatoria"),
    body("estado").optional().isIn(["Disponible","Mantenimiento","Ocupado"]).withMessage("Estado invalido"),
];

export const updateUnitValidator=createUnitValidator;