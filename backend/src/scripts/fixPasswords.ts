import mongoose from "mongoose";
import { MONGO_URI } from "../config/config";
import User, { hashPassword, isBcryptHash } from "../models/User";

/**
 * Re-hashea contraseñas que quedaron en texto plano en MongoDB.
 * Uso: npx ts-node src/scripts/fixPasswords.ts
 */
async function fixPasswords() {
  try {
    console.log("Conectando a MongoDB...");
    await mongoose.connect(MONGO_URI);
    const users = await User.find().select("+password");
    let updateCount = 0;

    for (const user of users) {
      const password = user.password;
      if (typeof password !== "string" || !password.trim()) continue;
      if (isBcryptHash(password)) continue;

      console.log(`Re-hasheando contraseña de: ${user.email || user._id}`);
      const newHash = await hashPassword(password);
      // updateOne evita que el pre('save') intente procesar de nuevo
      await User.updateOne({ _id: user._id }, { $set: { password: newHash } });
      updateCount++;
    }

    console.log(`Proceso completado. ${updateCount} usuario(s) actualizados`);
  } catch (error) {
    console.error("Error reparando contraseñas", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
  }
}

fixPasswords();
