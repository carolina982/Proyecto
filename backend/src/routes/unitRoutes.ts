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
    try{
        const  {conductorId}=req.body;
        const unit =await Unit.findById(req.params.id);
        if (!unit){
            return res.status(404).json({error:"Unidad no econtrada"});
        }
        unit.inventarios?.push({
            archivo:req.file!.path,
            conductorId,
            fecha:new Date(),
        });
        await unit.save();
        res.json({ok:true});
    }catch (error){
        console.error(error);
        res.status(500).json({error:"Error subiendo archivo"});
    }
});

router.get("/:id/inventarios",async(req ,res)=>{
    try {
        const unit=await Unit.findById(req.params.id).populate("Inventarios.conductorId");
        if (!unit){
            return 
        }
        res.json(unit.inventarios);
    }catch (error){
        console.error(error);
        res.status(500).json({error:"Error obteniendo inventarios"});
    }
});

router.delete("/units/:unitId/inventario/:inventarioId",async (req ,res)=>{
    try{
        const {unitId,inventarioId}=req.params;

        const unit=await Unit.findById(unitId);
        if (!unit) return res.status(404).json({error:"Unidad no econtrada"});

        unit.inventarios=unit.inventarios?.filter(
            (inv:any)=>inv._id.toString()!== inventarioId
        );
        await unit.save();
        res.json({ok:true});
    }catch (error){
        res.status(500).json({error:"Error eliminando inventario "})
    }
})

export default router;