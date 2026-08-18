/** Política de contraseña segura al crear o cambiar (no aplica al login). */

export const PASSWORD_POLICY_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número";

export function validatePasswordStrength(password: string): string | null {
  const plain = String(password || "");
  if (plain.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }
  if (!/[A-ZÁÉÍÓÚÜÑ]/.test(plain)) {
    return "La contraseña debe incluir al menos una letra mayúscula";
  }
  if (!/[0-9]/.test(plain)) {
    return "La contraseña debe incluir al menos un número";
  }
  return null;
}
