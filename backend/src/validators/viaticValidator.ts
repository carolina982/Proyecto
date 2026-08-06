import { body } from "express-validator";

const optionalNumber = (field: string, message: string) =>
  body(field)
    .optional({ values: "falsy" })
    .custom((value) => {
      if (value === undefined || value === null || value === "") return true;
      if (!Number.isNaN(Number(value))) return true;
      throw new Error(message);
    });

export const createViaticValidator = [
  body("tripId").notEmpty().withMessage("El tripId es obligatorio"),
  body("conceptos")
    .optional({ values: "falsy" })
    .custom((value) => {
      if (value === undefined || value === null || value === "") return true;
      if (typeof value === "string") {
        JSON.parse(value);
        return true;
      }
      if (typeof value === "object") return true;
      throw new Error("Conceptos debe ser un objeto o JSON valido");
    }),
  optionalNumber("dieselCargas", "Debe ser numero"),
  optionalNumber("dieselCosto", "Debe ser numero"),
  optionalNumber("tag", "Debe ser numero"),
  optionalNumber("total", "Debe ser numero"),
  optionalNumber("kilometrajeInicial", "Debe ser numero"),
  optionalNumber("kilometrajeFinal", "Debe ser numero"),
  optionalNumber("kilometrosRecorridos", "Debe ser numero"),
  optionalNumber("totalDefGastado", "Debe ser numero"),
];

export const updateViaticValidator = createViaticValidator;
