import mongoose from "mongoose";

const ViaticoSchema = new mongoose.Schema({
  tripId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Trip",
    required:true,
  },
  conceptos:{
    type:mongoose.Schema.Types.Mixed,
    default:{},
  },
  dieselCargas:{type:Number,default:0},
  dieselCosto:{type:Number,default:0},
  tag:{type:Number, default:0},
  total:{type:Number,default:0},
  factura:{type:String},
  createAt:{type:Date , default:Date.now},
});

export default mongoose.model("Viatico",ViaticoSchema);