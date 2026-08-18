import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePasswordStrength } from "./passwordPolicy";

describe("validatePasswordStrength", () => {
  it("rechaza corta", () => {
    assert.equal(validatePasswordStrength("Ab1"), "La contraseña debe tener al menos 8 caracteres");
  });
  it("exige mayúscula", () => {
    assert.equal(
      validatePasswordStrength("password1"),
      "La contraseña debe incluir al menos una letra mayúscula"
    );
  });
  it("exige número", () => {
    assert.equal(
      validatePasswordStrength("Password"),
      "La contraseña debe incluir al menos un número"
    );
  });
  it("acepta válida", () => {
    assert.equal(validatePasswordStrength("Password1"), null);
  });
});
