import { body } from "express-validator";

const VALID_ROLES = ["Admin", "Operador", "Ayudante General"];

export const registerUserValidator = [
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("apellido").notEmpty().withMessage("El apellido es obligatorio"),
  body("email").isEmail().withMessage("Correo invalido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  body("rol")
    .notEmpty()
    .custom((value) => {
      const normalized = String(value || "").trim().toLowerCase();
      // Chofer = alias legacy → Operador
      if (normalized === "chofer") return true;
      const allowed = VALID_ROLES.map((r) => r.toLowerCase());
      if (!allowed.includes(normalized)) {
        throw new Error("Rol no valido. Usa Admin, Operador o Ayudante General");
      }
      return true;
    }),
  body("contacto").notEmpty().withMessage("Ingrese el numero de contacto"),
];

export const loginUserValidator = [
  body("email").isEmail().withMessage("Correo invalido"),
  body("password").notEmpty().withMessage("la contraseña es obligatoria"),
];
