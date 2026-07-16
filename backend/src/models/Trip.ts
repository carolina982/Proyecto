import mongoose, { Document, Schema } from "mongoose";

interface Ikilometraje{
  numero:number;
  descripcion:string;
}

const DestinoExtraSchema = new Schema(
  {
    destino: { type: String, default: "" },
    fechaSalida: { type: Date, default: null },
    fechaLlegada: { type: Date, default: null },
    conductorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    unidadId: { type: String, default: "" },
    acompanante: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    kilometrajeSalida: [
      {
        numero: { type: Number, required: true },
        descripcion: { type: String, default: "" },
      },
    ],
    kilometrajeLlegada: [
      {
        numero: { type: Number, required: true },
        descripcion: { type: String, default: "" },
      },
    ],
  },
  { _id: false }
);

export type IDestinoExtra = {
  destino?: string;
  fechaSalida?: Date | null;
  fechaLlegada?: Date | null;
  conductorId?: string | mongoose.Types.ObjectId | null;
  unidadId?: string;
  acompanante?: string | mongoose.Types.ObjectId | null;
  kilometrajeSalida?: Ikilometraje[];
  kilometrajeLlegada?: Ikilometraje[];
};

export interface ITrip extends Document {
  rutaAcubrir: string;         
  destino: string;         
  fechaSalida: Date;       
  fechaLlegada: Date | null;      
  conductorId: string| mongoose.Types.ObjectId;   
  unidadId:string;      
  estado: string;   
  kilometrajeSalida:Ikilometraje[];
  kilometrajeLlegada:Ikilometraje[];
  acompanante:string|null|mongoose.Types.ObjectId;
  def:string;
  multidestino: boolean;
  destinoExtra: IDestinoExtra[];
  destinoActualIndex: number;
  asignadoPor: string | mongoose.Types.ObjectId | null;
}
const tripSchema = new Schema<ITrip>(
  {
    rutaAcubrir: { type: String, required: true },
    destino: { type: String, required: true },
    fechaSalida: { type: Date, required: true },
    fechaLlegada: { type: Date, required:false,default:null},
    conductorId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    unidadId:{type:String , required:true},
    estado: {
      type: String,
      enum: ["pendiente", "en progreso", "en parada", "completado"],
      default: "pendiente",
    },

    kilometrajeSalida:[{
      numero:{type:Number,required:true},
      descripcion:{type:String,default:""},
    },],
    
    kilometrajeLlegada:[{
      numero:{type:Number,required:true},
      descripcion:{type:String,default:""},
    },],

    acompanante:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:false,default:null},
    def:{type:String , required:true},
    multidestino: { type: Boolean, default: false },
    destinoExtra: {
      type: [DestinoExtraSchema],
      default: [],
      set: (value: any) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === "object") return [value];
        return [];
      },
    },
    destinoActualIndex: { type: Number, default: 0 },
    asignadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    
},
  {timestamps:true}
);

export default mongoose.model<ITrip>("Trip",tripSchema);
