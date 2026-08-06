/**
 * Migración one-shot: roles RBAC + permisos iniciales.
 * Uso: npx ts-node --transpile-only scripts/migrate-rbac.ts
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "";

async function main() {
  if (!MONGO_URI) {
    console.error("Falta MONGO_URI en backend/.env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const users = mongoose.connection.collection("users");

  // 1) Admin legacy → Administrador
  const adminMig = await users.updateMany(
    { rol: { $in: ["Admin", "admin"] } },
    { $set: { rol: "Administrador" } }
  );
  console.log("Admin → Administrador:", adminMig.modifiedCount);

  // 2) Superadministradores (por nombre completo, una sola vez)
  const superNames = [
    { nombre: /^Carolina$/i, apellido: /Patricio/i },
    { nombre: /^Jose$/i, apellido: /Armando\s+Gonzalez/i },
    { nombre: /^José$/i, apellido: /Armando\s+Gonzalez/i },
  ];

  for (const q of superNames) {
    const r = await users.updateMany(
      { nombre: q.nombre, apellido: q.apellido },
      { $set: { rol: "Superadministrador" } }
    );
    console.log(`Superadmin match ${q.nombre} ${q.apellido}:`, r.modifiedCount, "matched", r.matchedCount);
  }

  // También por nombre completo concatenado por si apellido está partido
  const byFull = await users
    .find({})
    .project({ nombre: 1, apellido: 1, apellidoPaterno: 1, apellidoMaterno: 1, rol: 1, permissions: 1 })
    .toArray();

  for (const u of byFull) {
    const full = `${u.nombre || ""} ${u.apellido || ""} ${u.apellidoPaterno || ""} ${u.apellidoMaterno || ""}`
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    let nextRol: string | null = null;
    if (full.includes("carolina") && full.includes("patricio")) {
      nextRol = "Superadministrador";
    }
    if (full.includes("jose") && full.includes("armando") && full.includes("gonzalez")) {
      nextRol = "Superadministrador";
    }

    const set: Record<string, unknown> = {};
    if (nextRol && u.rol !== nextRol) set.rol = nextRol;

    if (Object.keys(set).length) {
      await users.updateOne({ _id: u._id }, { $set: set });
      console.log("Updated", full, set);
    }
  }

  // Asegurar Settings documento
  const settings = mongoose.connection.collection("settings");
  const existing = await settings.findOne({ key: "app" });
  if (!existing) {
    await settings.insertOne({
      key: "app",
      emailSendingEnabled: true,
      tripEmailsEnabled: false,
      defUnitPrice: 400,
      extras: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Settings app creado");
  } else if (existing.emailSendingEnabled === undefined) {
    await settings.updateOne(
      { key: "app" },
      { $set: { emailSendingEnabled: true } }
    );
    console.log("Settings emailSendingEnabled añadido");
  }

  const summary = await users
    .aggregate([{ $group: { _id: "$rol", n: { $sum: 1 } } }, { $sort: { n: -1 } }])
    .toArray();
  console.log("Roles actuales:", summary);

  await mongoose.disconnect();
  console.log("OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
