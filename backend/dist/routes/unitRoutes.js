"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const unitController_1 = require("../controllers/unitController");
const upload_1 = require("../middlewares/upload");
const validate_1 = require("../middlewares/validate");
const Unit_1 = __importDefault(require("../models/Unit"));
const unitValidator_1 = require("../validators/unitValidator");
const router = (0, express_1.Router)();
router.get("/count", unitController_1.getUnitCount);
router.post("/", unitValidator_1.createUnitValidator, validate_1.validate, unitController_1.createUnit);
router.get("/", unitController_1.getUnits);
router.get("/:id", unitController_1.getUnitById);
router.put("/:id", unitValidator_1.updateUnitValidator, validate_1.validate, unitController_1.updateUnit);
router.delete("/:id", unitController_1.deleteUnit);
router.post("/:id/image", upload_1.upload.single("image"), async (req, res) => {
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
        const imagenUrl = `https://${req.get("host")}/uploads/${req.file.filename}`;
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
router.post("/:id/inventario", upload_1.upload.single("file"), async (req, res) => {
    try {
        const { conductorId } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "No se recibio archivo" });
        }
        ;
        console.log("MIMETYPE", req.file.mimetype);
        console.log("FILE", req.file);
        //if (req.file.mimetype !== "application/pdf") {
        //return res.status(400).json({ error: "Solo se permite PDF" });
        //}
        const unit = await Unit_1.default.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ error: "Unidad no encontrada" });
        }
        if (!unit.inventarios) {
            unit.inventarios = [];
        }
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        unit.inventarios.push({ archivo: fileUrl, conductorId, fecha: new Date(), });
        await unit.save();
        res.json({ ok: true, inventarios: unit.inventarios, });
    }
    catch (error) {
        console.error("ERROR INVENTARIO", error);
        res.status(500).json({
            error: "Error subiendo archivo",
        });
    }
});
router.delete("/:unitId/inventarios/:inventarioId", async (req, res) => {
    try {
        const { unitId, inventarioId } = req.params;
        const unit = await Unit_1.default.findById(unitId);
        if (!unit) {
            return res.status(404).json({ error: "Unidad no econtrada" });
        }
        unit.inventarios = unit.inventarios?.filter((inv) => inv._id.toString() !== inventarioId);
        await unit.save();
        res.json({ ok: true, inventarios: unit.inventarios });
    }
    catch (error) {
        res.status(500).json({ error: "Error eliminando inventario " });
    }
});
router.get("/:id/inventarios", async (req, res) => {
    try {
        const unit = await Unit_1.default.findById(req.params.id)
            .populate("inventarios.conductorId", "nombre");
        if (!unit) {
            return res.status(404).json({ error: "unidad no econtrada" });
        }
        res.json(unit.inventarios || []);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo inventarios" });
    }
});
exports.default = router;
