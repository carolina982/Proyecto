import mongoose from "mongoose";

const ViaticoSchema =new  mongoose.Schema({
  tripId:{type:mongoose.Schema.Types.ObjectId, ref:"Trip", required :true},
  conceptos:{
    type:Map, of:Number, 
    default:{
      Comidas:0, Hospedaje:0 , Pensión:0 ,
      Vulcanizadora:0 , Taxi:0 ,
      "Casetas efectivo":0, "Limpieza Unidad":0,
      Multa:0, Comisiones:0 , Fumigación:0 ,DEF:0,
      Regaderas:0,
    }
  },
  dieselCantidad:{type:Number, default:0},
  dieselCosto:{type:Number,default:0},
  tag:{type:Number, default:0},
  total:{type:Number,default:0},
  factura:{type:String},
  createdAt:{type:Date,default:Date.now},
});

export default mongoose.model("Viatico",ViaticoSchema);