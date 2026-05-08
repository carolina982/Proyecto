import { Router } from "express";
import { createUnit, deleteUnit, getUnitById, getUnits, updateUnit } from "../controllers/unitController";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import Unit from "../models/Unit";
import { createUnitValidator, updateUnitValidator } from "../validators/unitValidator";


const router =Router ();
router.post ("/",createUnitValidator,validate,createUnit);
router.get("/", getUnits);
router.get("/:id" , getUnitById);
router.put("/:id",updateUnitValidator,validate,updateUnit);
router.delete("/:id" , deleteUnit);

router.post("/:id/inventario",upload.single("file"),async (req ,res)=>{
    try {
        const {conductorId}=req.body;
        if (!req.file){
            return res.status(400).json({error:"No se recibio archivo"});
        }
        const unit=await Unit.findById(req.params.id);
        if (!unit){
            return res.status(404).json({error:"Unidad no econtrada"});
        }
        const fileUrl=`${req.protocol}://${req.get("host")}/${req.file.path}`;
        unit.inventarios?.push({
            archivo:fileUrl,
            conductorId,
            fecha:new Date()
        });
        await unit.save();
        res.json({ok:true});
    }catch (error){
        console.error("ERROR INVENTARIO",error);
        res.status(500).json({error:"Error subiendo archivo"});
    }
});

router.delete("/:unitId/inventarios/:inventarioId", async (req ,res)=>{
    try {
        const {unitId,inventarioId}=req.params;
        const unit=await Unit.findById(unitId);
        if (!unit){
            return res.status(404).json({error:"Unidad no econtrada"});
        }
        await unit.save();
        res.json({ok:true});
    }catch (error){
        res.status(500).json({error:"Error eliminando inventario "})
    }
});

router.get("/:id/inventarios",async (req , res) =>{
    try {
        const unit =await Unit.findById(req.params.id)
        .populate("inventarios.conductorId");
        if (!unit?.inventarios){
            return res.status(404).json({error:"unidad no econtrada"});
        }
    }catch (error){
        console.error(error);
        res.status(500).json({error:"Error obteniendo inventarios"});
    }
});

export default  router;