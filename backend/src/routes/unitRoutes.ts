import { Router } from "express";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { createUnit, deleteUnit, getUnitById, getUnitCount, getUnits, updateUnit } from "../controllers/unitController";
import { authorize } from "../middlewares/authorize";
import { verifyToken } from "../middlewares/auth";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import Unit from "../models/Unit";
import User from "../models/User";
import { createUnitValidator, updateUnitValidator } from "../validators/unitValidator";

const uploadDir = path.join(__dirname, "../../uploads");

const auth = verifyToken;
const adminOnly = [verifyToken, authorize(["Admin"])];

const router = Router();

router.get("/count", auth, getUnitCount);
router.get("/", auth, getUnits);
router.post("/", ...adminOnly, createUnitValidator, validate, createUnit);
router.get("/:id", auth, getUnitById);
router.put("/:id", ...adminOnly, updateUnitValidator, validate, updateUnit);
router.delete("/:id", ...adminOnly, deleteUnit);

router.post("/:id/image", ...adminOnly, upload.single("image"), async (req, res) => {
    try {
       if (!req.file) {
        return res.status(400).json({
          error: "No se recibió imagen",
        });
      }
      const unit = await Unit.findById(req.params.id);
      if (!unit) {
        return res.status(404).json({
          error: "Unidad no encontrada",
        });
      }
      // Ruta relativa: el frontend arma la URL con el host actual (http/https).
      const imagenUrl = `/uploads/${req.file.filename}`;

      unit.imagenUrl = imagenUrl;
      await unit.save();
      res.json({
        ok: true,
        imagenUrl,
      });

    } catch (error) {
      console.error("ERROR IMAGEN", error);
      res.status(500).json({
        error: "Error subiendo imagen",
      });
    }
  }
);

// Crear un inventario de entrega (ítems cantidad/descripción + firma). Solo Admin. Histórico: no se sobrescribe.
router.post("/:id/inventarios", verifyToken, authorize(["Admin"]), async (req, res) => {
  try {
    const { contenido, items, operadorId, firmaBase64, hojaBase64 } = req.body || {};

    const normalizedItems = Array.isArray(items)
      ? items
          .map((it: any) => ({
            cantidad: Number(it?.cantidad || 0),
            descripcion: String(it?.descripcion || "").trim(),
          }))
          .filter((it: any) => it.descripcion.length > 0)
      : [];

    const contenidoFinal =
      normalizedItems.length > 0
        ? normalizedItems
            .map((it: any) => `${it.cantidad || 0} × ${it.descripcion}`)
            .join("\n")
        : String(contenido || "").trim();

    const hasHoja =
      typeof hojaBase64 === "string" && hojaBase64.startsWith("data:image/");

    if (!contenidoFinal && !hasHoja) {
      return res.status(400).json({ error: "El inventario no puede estar vacío" });
    }
    if (!firmaBase64 || typeof firmaBase64 !== "string") {
      return res.status(400).json({ error: "Falta la firma" });
    }

    const matches = firmaBase64.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/i);
    if (!matches) {
      return res.status(400).json({ error: "Firma inválida" });
    }

    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ error: "Unidad no encontrada" });
    }

    // Guardar la firma como archivo PNG en /uploads
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const ext = matches[1].toLowerCase() === "png" ? "png" : "jpg";
    const filename = `firma-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(matches[2], "base64"));
    const firmaUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    // Foto opcional de la hoja manuscrita
    let hojaUrl = "";
    if (hasHoja) {
      const hojaMatch = hojaBase64.match(/^data:image\/([a-z0-9+.-]+);base64,(.+)$/i);
      if (!hojaMatch) {
        return res.status(400).json({ error: "Imagen de hoja inválida" });
      }
      const rawType = hojaMatch[1].toLowerCase();
      const hojaExt =
        rawType.includes("png") ? "png" : rawType.includes("webp") ? "webp" : "jpg";
      const hojaFilename = `hoja-inv-${Date.now()}.${hojaExt}`;
      fs.writeFileSync(path.join(uploadDir, hojaFilename), Buffer.from(hojaMatch[2], "base64"));
      hojaUrl = `${req.protocol}://${req.get("host")}/uploads/${hojaFilename}`;
    }

    // Operador asignado (nombre snapshot)
    let operadorObjId: mongoose.Types.ObjectId | null = null;
    let operadorNombre = "";
    if (operadorId && mongoose.Types.ObjectId.isValid(operadorId)) {
      operadorObjId = new mongoose.Types.ObjectId(operadorId);
      const op = await User.findById(operadorObjId).select("nombre apellido");
      if (op) operadorNombre = `${op.nombre || ""} ${op.apellido || ""}`.trim();
    }

    // Admin que crea el registro
    const admin = (req as any).user;
    const creadoPorNombre = admin
      ? `${admin.nombre || ""} ${admin.apellido || ""}`.trim()
      : "";

    if (!unit.inventarios) unit.inventarios = [];
    unit.inventarios.push({
      contenido:
        contenidoFinal ||
        (hojaUrl ? "Inventario registrado en hoja fotográfica" : ""),
      items: normalizedItems,
      hojaUrl,
      firmaUrl,
      operadorId: operadorObjId,
      operadorNombre,
      creadoPorId: admin?._id ?? null,
      creadoPorNombre,
      fecha: new Date(),
    } as any);

    await unit.save();

    res.json({ ok: true, inventarios: unit.inventarios });
  } catch (error) {
    console.error("ERROR INVENTARIO", error);
    res.status(500).json({ error: "Error guardando inventario" });
  }
});

// Eliminar un inventario específico. Solo Admin.
router.delete(
  "/:id/inventarios/:inventarioId",
  verifyToken,
  authorize(["Admin"]),
  async (req, res) => {
    try {
      const { id, inventarioId } = req.params;
      const unit = await Unit.findById(id);
      if (!unit) {
        return res.status(404).json({ error: "Unidad no encontrada" });
      }

      const target = (unit.inventarios || []).find(
        (inv: any) => String(inv._id) === String(inventarioId)
      );

      // Intentar borrar el archivo de firma asociado (si existe localmente)
      if (target?.firmaUrl) {
        try {
          const firmaName = target.firmaUrl.split("/uploads/")[1];
          if (firmaName) {
            const firmaPath = path.join(uploadDir, firmaName);
            if (fs.existsSync(firmaPath)) fs.unlinkSync(firmaPath);
          }
        } catch (e) {
          console.warn("No se pudo borrar el archivo de firma", e);
        }
      }
      if (target?.hojaUrl) {
        try {
          const hojaName = target.hojaUrl.split("/uploads/")[1];
          if (hojaName) {
            const hojaPath = path.join(uploadDir, hojaName);
            if (fs.existsSync(hojaPath)) fs.unlinkSync(hojaPath);
          }
        } catch (e) {
          console.warn("No se pudo borrar la hoja de inventario", e);
        }
      }

      unit.inventarios = (unit.inventarios || []).filter(
        (inv: any) => String(inv._id) !== String(inventarioId)
      );
      await unit.save();

      res.json({ ok: true, inventarios: unit.inventarios });
    } catch (error) {
      console.error("ERROR ELIMINANDO INVENTARIO", error);
      res.status(500).json({ error: "Error eliminando inventario" });
    }
  }
);

// Historial de inventarios de una unidad (más reciente primero). Solo Admin.
router.get("/:id/inventarios", verifyToken, authorize(["Admin"]), async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id).populate(
      "inventarios.operadorId",
      "nombre apellido"
    );
    if (!unit) {
      return res.status(404).json({ error: "unidad no encontrada" });
    }
    const list = [...(unit.inventarios || [])].sort(
      (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo inventarios" });
  }
});

export default  router;