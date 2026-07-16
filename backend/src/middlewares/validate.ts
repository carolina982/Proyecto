import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const list = errors.array();
    return res.status(400).json({
      message: list[0]?.msg || "Datos inválidos",
      errors: list,
    });
  }

  next();
};