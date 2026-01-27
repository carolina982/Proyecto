import mongoose from "mongoose";

const DieselSchema = new mongoose.Schema(
  {
    cargas:{type:Number, default:0},
    costo:{type:Number , default:0},
  },
  {_id:false}
);

const ConceptosSchema = new mongoose.Schema(
  {
    cantidad:{type:Number,default:0},
    costo:{type:Number,default:0},
  },
  {_id:false}
);

const ViaticoSchema = new mongoose.Schema({
  tripId:{type:mongoose.Schema.Types.ObjectId,ref:"Trip",required:true,},
  conceptos:{type:Map,of:ConceptosSchema,default:{},},
  dieselHistorial:{ype:[DieselSchema],default:[],},
  dieselCargas:{type:Number, default:0},
  diselCosto:{type:Number,default:0},
  tag:{type:Number,default:0},
  total:{type:Number , default:0},
  factura:String,
  createAT:{type:Date ,default:Date.now},
  tripNombre:{type:String,default:"Sin asignar"},
  conductorNombre:{type:String,default:"Sin asignar"},
});

export default mongoose.model("Viatico",ViaticoSchema);