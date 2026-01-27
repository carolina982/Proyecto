import { body } from "express-validator";

export const  createViaticValidator =[
    
    body ("tripId").notEmpty().withMessage("El tripId es obligatorio"),
    body("conceptos").custom((value)=>{ if (typeof value == "string"){JSON.parse(value);return true; }
        if (typeof value === "object"){return true;}
        throw new Error("Conceptos debe ser un objeto o JSON valido");
    }),
    body("dieselCargas").optional().isNumeric().withMessage("Debe ser numero"),
    body("dieselCosto").optional().isNumeric().withMessage("Debe ser numero"),
    body("tag").optional().isNumeric().withMessage("Debe ser numero"),
    body("total").optional().isNumeric().withMessage("Debe ser numero"),
];


export const updateViaticValidator=createViaticValidator;