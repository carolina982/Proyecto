"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const unitController_1 = require("../controllers/unitController");
const authorize_1 = require("../middlewares/authorize");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const validate_1 = require("../middlewares/validate");
const Unit_1 = __importDefault(require("../models/Unit"));
const User_1 = __importDefault(require("../models/User"));
const unitValidator_1 = require("../validators/unitValidator");
const uploadDir = path_1.default.join(__dirname, "../../uploads");
const auth = auth_1.verifyToken;
const adminOnly = [auth_1.verifyToken, (0, authorize_1.authorize)(["Admin"])];
const router = (0, express_1.Router)();
router.get("/count", auth, unitController_1.getUnitCount);
router.get("/", auth, unitController_1.getUnits);
router.post("/", ...adminOnly, unitValidator_1.createUnitValidator, validate_1.validate, unitController_1.createUnit);
router.get("/:id", auth, unitController_1.getUnitById);
router.put("/:id", ...adminOnly, unitValidator_1.updateUnitValidator, validate_1.validate, unitController_1.updateUnit);
router.delete("/:id", ...adminOnly, unitController_1.deleteUnit);
router.post("/:id/image", ...adminOnly, upload_1.upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No se recibió imagen",
            });
        }
        const unit = await Unit_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error("ERROR IMAGEN", error);
        res.status(500).json({
            error: "Error subiendo imagen",
        });
    }
});
// Crear un inventario de entrega (ítems cantidad/descripción + firma). Solo Admin. Histórico: no se sobrescribe.
router.post("/:id/inventarios", auth_1.verifyToken, (0, authorize_1.authorize)(["Admin"]), async (req, res) => {
    try {
        const { contenido, items, operadorId, firmaBase64, hojaBase64 } = req.body || {};
        const normalizedItems = Array.isArray(items)
            ? items
                .map((it) => ({
                cantidad: Number(it?.cantidad || 0),
                descripcion: String(it?.descripcion || "").trim(),
            }))
                .filter((it) => it.descripcion.length > 0)
            : [];
        const contenidoFinal = normalizedItems.length > 0
            ? normalizedItems
                .map((it) => `${it.cantidad || 0} × ${it.descripcion}`)
                .join("\n")
            : String(contenido || "").trim();
        const hasHoja = typeof hojaBase64 === "string" && hojaBase64.startsWith("data:image/");
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
        const unit = await Unit_1.default.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ error: "Unidad no encontrada" });
        }
        // Guardar la firma como archivo PNG en /uploads
        if (!fs_1.default.existsSync(uploadDir))
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        const ext = matches[1].toLowerCase() === "png" ? "png" : "jpg";
        const filename = `firma-${Date.now()}.${ext}`;
        fs_1.default.writeFileSync(path_1.default.join(uploadDir, filename), Buffer.from(matches[2], "base64"));
        const firmaUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
        // Foto opcional de la hoja manuscrita
        let hojaUrl = "";
        if (hasHoja) {
            const hojaMatch = hojaBase64.match(/^data:image\/([a-z0-9+.-]+);base64,(.+)$/i);
            if (!hojaMatch) {
                return res.status(400).json({ error: "Imagen de hoja inválida" });
            }
            const rawType = hojaMatch[1].toLowerCase();
            const hojaExt = rawType.includes("png") ? "png" : rawType.includes("webp") ? "webp" : "jpg";
            const hojaFilename = `hoja-inv-${Date.now()}.${hojaExt}`;
            fs_1.default.writeFileSync(path_1.default.join(uploadDir, hojaFilename), Buffer.from(hojaMatch[2], "base64"));
            hojaUrl = `${req.protocol}://${req.get("host")}/uploads/${hojaFilename}`;
        }
        // Operador asignado (nombre snapshot)
        let operadorObjId = null;
        let operadorNombre = "";
        if (operadorId && mongoose_1.default.Types.ObjectId.isValid(operadorId)) {
            operadorObjId = new mongoose_1.default.Types.ObjectId(operadorId);
            const op = await User_1.default.findById(operadorObjId).select("nombre apellido");
            if (op)
                operadorNombre = `${op.nombre || ""} ${op.apellido || ""}`.trim();
        }
        // Admin que crea el registro
        const admin = req.user;
        const creadoPorNombre = admin
            ? `${admin.nombre || ""} ${admin.apellido || ""}`.trim()
            : "";
        if (!unit.inventarios)
            unit.inventarios = [];
        unit.inventarios.push({
            contenido: contenidoFinal ||
                (hojaUrl ? "Inventario registrado en hoja fotográfica" : ""),
            items: normalizedItems,
            hojaUrl,
            firmaUrl,
            operadorId: operadorObjId,
            operadorNombre,
            creadoPorId: admin?._id ?? null,
            creadoPorNombre,
            fecha: new Date(),
        });
        await unit.save();
        res.json({ ok: true, inventarios: unit.inventarios });
    }
    catch (error) {
        console.error("ERROR INVENTARIO", error);
        res.status(500).json({ error: "Error guardando inventario" });
    }
});
// Eliminar un inventario específico. Solo Admin.
router.delete("/:id/inventarios/:inventarioId", auth_1.verifyToken, (0, authorize_1.authorize)(["Admin"]), async (req, res) => {
    try {
        const { id, inventarioId } = req.params;
        const unit = await Unit_1.default.findById(id);
        if (!unit) {
            return res.status(404).json({ error: "Unidad no encontrada" });
        }
        const target = (unit.inventarios || []).find((inv) => String(inv._id) === String(inventarioId));
        // Intentar borrar el archivo de firma asociado (si existe localmente)
        if (target?.firmaUrl) {
            try {
                const firmaName = target.firmaUrl.split("/uploads/")[1];
                if (firmaName) {
                    const firmaPath = path_1.default.join(uploadDir, firmaName);
                    if (fs_1.default.existsSync(firmaPath))
                        fs_1.default.unlinkSync(firmaPath);
                }
            }
            catch (e) {
                console.warn("No se pudo borrar el archivo de firma", e);
            }
        }
        if (target?.hojaUrl) {
            try {
                const hojaName = target.hojaUrl.split("/uploads/")[1];
                if (hojaName) {
                    const hojaPath = path_1.default.join(uploadDir, hojaName);
                    if (fs_1.default.existsSync(hojaPath))
                        fs_1.default.unlinkSync(hojaPath);
                }
            }
            catch (e) {
                console.warn("No se pudo borrar la hoja de inventario", e);
            }
        }
        unit.inventarios = (unit.inventarios || []).filter((inv) => String(inv._id) !== String(inventarioId));
        await unit.save();
        res.json({ ok: true, inventarios: unit.inventarios });
    }
    catch (error) {
        console.error("ERROR ELIMINANDO INVENTARIO", error);
        res.status(500).json({ error: "Error eliminando inventario" });
    }
});
// Historial de inventarios de una unidad (más reciente primero). Solo Admin.
router.get("/:id/inventarios", auth_1.verifyToken, (0, authorize_1.authorize)(["Admin"]), async (req, res) => {
    try {
        const unit = await Unit_1.default.findById(req.params.id).populate("inventarios.operadorId", "nombre apellido");
        if (!unit) {
            return res.status(404).json({ error: "unidad no encontrada" });
        }
        const list = [...(unit.inventarios || [])].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        res.json(list);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo inventarios" });
    }
});
exports.default = router;
