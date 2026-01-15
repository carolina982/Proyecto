import { body } from "express-validator";

export const  createViaticValidator =[
    
    body ("tripId").notEmpty().withMessage("El tripId es obligatorio"),
    body("conceptos").optional().isObject().withMessage("Conceptos debe de ser un objeto"),
    body("dieselCargas").optional().isNumeric().withMessage("Debe ser numero"),
    body("dieselCosto").optional().isNumeric().withMessage("Debe ser numero"),
    body("tag").optional().isNumeric().withMessage("Debe ser numero"),
    body("total").optional().isNumeric().withMessage("Debe ser numero"),
];

export const updateViaticValidator=createViaticValidator;