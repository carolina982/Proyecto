import { Router } from "express";
import mongoose from "mongoose";
import { createUnit, deleteUnit, getUnitById, getUnitCount, getUnits, updateUnit } from "../controllers/unitController";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import Unit from "../models/Unit";
import { createUnitValidator, updateUnitValidator } from "../validators/unitValidator";


const router =Router ();
router.get("/count",getUnitCount)
router.post ("/",createUnitValidator,validate,createUnit);
router.get("/", getUnits);
router.get("/:id" , getUnitById);
router.put("/:id",updateUnitValidator,validate,updateUnit);

router.delete("/:id" , deleteUnit);
router.post("/:id/image",upload.single("image"),async (req, res) => {
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
      const imagenUrl =
        `https://${req.get("host")}/uploads/${req.file.filename}`;
    

      

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

router.post("/:id/inventario", upload.single("file"), async (req, res) => {
  try {
    const conductorIdRaw = req.body?.conductorId;
    if (!req.file) {
      return res.status(400).json({ error: "No se recibio archivo" });
    };

    console.log("MIMETYPE",req.file.mimetype);
    console.log("FILE",req.file);
    //if (req.file.mimetype !== "application/pdf") {
      //return res.status(400).json({ error: "Solo se permite PDF" });
    //}
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({ error: "Unidad no encontrada" });
    }

    if (!unit.inventarios) {
      unit.inventarios = [];
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const conductorId =
      conductorIdRaw && mongoose.Types.ObjectId.isValid(conductorIdRaw)
        ? new mongoose.Types.ObjectId(conductorIdRaw)
        : undefined;

    unit.inventarios.push({
      archivo: fileUrl,
      ...(conductorId ? { conductorId } : {}),
      fecha: new Date(),
    } as any);
    await unit.save();

    
    res.json({ ok: true, inventarios: unit.inventarios, });
  } catch (error) {
    console.error("ERROR INVENTARIO", error);

    res.status(500).json({
      error: "Error subiendo archivo",
    });
  }
});


router.delete("/:unitId/inventarios/:inventarioId", async (req ,res)=>{
    try {
        const {unitId,inventarioId}=req.params;
        const unit=await Unit.findById(unitId);
        if (!unit){
            return res.status(404).json({error:"Unidad no econtrada"});
        }
        unit.inventarios=unit.inventarios?.filter(
            (inv:any) => inv._id.toString() !== inventarioId
        );
        await unit.save();
        res.json({ok:true,inventarios:unit.inventarios});
    }catch (error){
        res.status(500).json({error:"Error eliminando inventario "})
    }
});

router.get("/:id/inventarios",async (req , res) =>{
    try {
        const unit =await Unit.findById(req.params.id)
        .populate("inventarios.conductorId","nombre");
        if (!unit){
            return res.status(404).json({error:"unidad no econtrada"});
        }
        res.json(unit.inventarios || []);
    }catch (error){
        console.error(error);
        res.status(500).json({error:"Error obteniendo inventarios"});
    }
});

export default  router;