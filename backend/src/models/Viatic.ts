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
    cantidad: { type: Number, default: 0 },
    costo: { type: Number, default: 0 },
    /** Precio unitario vigente al crear/actualizar el concepto (snapshot histórico). */
    precioUnitario: { type: Number, default: undefined },
  },
  { _id: false }
);

const ViaticoSchema = new mongoose.Schema({
  tripId:{type:mongoose.Schema.Types.ObjectId,ref:"Trip",required:true,},
  conceptos:{type:Map,of:ConceptosSchema,default:{},},
  dieselHistorial:{type:[DieselSchema],default:[],},
  dieselCargas:{type:Number, default:0},
  diselCosto:{type:Number,default:0},
  tag:{type:Number,default:0},
  total:{type:Number , default:0},
  /** Kilometraje del viaje para cálculo automático de DEF gastado. */
  kilometrajeInicial:{type:Number, default:0},
  kilometrajeFinal:{type:Number, default:0},
  kilometrosRecorridos:{type:Number, default:0},
  /** Total DEF calculado: km × factor (tractor 83.3 / plataforma 100). */
  totalDefGastado:{type:Number, default:0},
  /** Snapshot del tipo usado en el cálculo: tractor | plataforma | "". */
  tipoUnidadDef:{type:String, default:""},
  costosExtras:{
    type:[{
      description:{type:String,default:""},
      costo:{type:Number,default:0},
    }],
    default:[],
  },
  factura:String,
  // Histórico: createAT (typo). Se mantiene y además se expone createdAt.
  createAT:{type:Date ,default:Date.now},
  createdAt:{type:Date, default:Date.now},
  tripNombre:{type:String,default:"Sin asignar"},
  conductorNombre:{type:String,default:"Sin asignar"},
});

ViaticoSchema.pre("save", function () {
  const anyThis = this as any;
  if (anyThis.createAT && !anyThis.createdAt) {
    anyThis.createdAt = anyThis.createAT;
  }
  if (anyThis.createdAt && !anyThis.createAT) {
    anyThis.createAT = anyThis.createdAt;
  }
});

ViaticoSchema.set("toJSON", {
  transform(_doc, ret: any) {
    if (!ret.createdAt && ret.createAT) ret.createdAt = ret.createAT;
    if (!ret.createAT && ret.createdAt) ret.createAT = ret.createdAt;
    return ret;
  },
});

export default mongoose.model("Viatico",ViaticoSchema);