import crypto from "crypto";
import mongoose from "mongoose";
import { MONGO_URI } from "../config/config";
import User, { hashPassword } from "../models/User";

/**
 * Rota contraseñas de cuentas de admin/prueba a valores seguros.
 * Uso: npx ts-node src/scripts/resetAdminPass.ts
 * Opcional: RESET_PASS_EMAILS=a@x.com,b@y.com RESET_PASS_VALUE='MiPassSegura!'
 */
const DEFAULT_EMAILS = [
  "al222010146@gmail.com",
  "tics@grupohm.com",
];

function generateSecurePassword(length = 16): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

(async () => {
  try {
    console.log("Conectando a MongoDB...");
    await mongoose.connect(MONGO_URI);

    const emails = (process.env.RESET_PASS_EMAILS || DEFAULT_EMAILS.join(","))
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const sharedPlain = process.env.RESET_PASS_VALUE?.trim() || "";
    const results: { email: string; password: string; ok: boolean }[] = [];

    for (const email of emails) {
      const plain = sharedPlain || generateSecurePassword(16);
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        console.warn(`No existe usuario: ${email}`);
        results.push({ email, password: "", ok: false });
        continue;
      }
      user.password = await hashPassword(plain);
      user.markModified("password");
      await user.save();
      results.push({ email, password: plain, ok: true });
      console.log(`OK actualizada: ${email}`);
    }

    console.log("\n--- Nuevas contraseñas (guarda y bórralas de logs) ---");
    for (const r of results) {
      if (r.ok) console.log(`${r.email} => ${r.password}`);
    }
  } catch (error) {
    console.error("Error al resetear contraseña", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
  }
})();
