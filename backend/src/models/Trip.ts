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

const ChecklistItemSchema = new Schema(
  {
    id: { type: String, default: "" },
    label: { type: String, default: "" },
    checked: { type: Boolean, default: false },
    /** URL de foto opcional (p. ej. checklist de inicio). */
    foto: { type: String, default: "" },
  },
  { _id: false }
);

const ChecklistSchema = new Schema(
  {
    items: { type: [ChecklistItemSchema], default: [] },
    /** Texto libre; en UI de inicio se muestra como "Observaciones". */
    extras: { type: String, default: "" },
    observaciones: { type: String, default: "" },
    completadoEn: { type: Date, default: null },
  },
  { _id: false }
);

const ChecklistParadaSchema = new Schema(
  {
    index: { type: Number, default: 0 },
    destino: { type: String, default: "" },
    items: { type: [ChecklistItemSchema], default: [] },
    extras: { type: String, default: "" },
    completadoEn: { type: Date, default: null },
    recepcion: { type: ChecklistSchema, default: null },
  },
  { _id: false }
);

export type IChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
  foto?: string;
};
export type IChecklist = {
  items: IChecklistItem[];
  extras?: string;
  observaciones?: string;
  completadoEn?: Date | null;
};
export type IChecklistParada = IChecklist & {
  index: number;
  destino?: string;
  recepcion?: IChecklist | null;
};

export interface ITrip extends Document {
  rutaAcubrir: string;         
  destino: string;
  cliente?: string;
  fechaSalida: Date;       
  fechaLlegada: Date | null;      
  conductorId: string| mongoose.Types.ObjectId;   
  unidadId:string;      
  estado: string;   
  kilometrajeSalida:Ikilometraje[];
  kilometrajeLlegada:Ikilometraje[];
  acompanante:string|null|mongoose.Types.ObjectId;
  def?: string;
  playo?: string;
  tarjeta?: string;
  multidestino: boolean;
  destinoExtra: IDestinoExtra[];
  destinoActualIndex: number;
  asignadoPor: string | mongoose.Types.ObjectId | null;
  checklistInicio: IChecklist | null;
  checklistRecepcion: IChecklist | null;
  checklistFin: IChecklist | null;
  checklistParadas: IChecklistParada[];
  hojaEntrega: string;
  /** Varias hojas (p. ej. multidestino: una por recepción). `hojaEntrega` = la primera. */
  hojasEntrega: string[];
  cartaPorte?: string;
  bitacoraHoras?: string;
  facturaViaje?: string;
  finalizadoEn: Date | null;
  /** Hora real en que el operador inició el viaje (pasó a en progreso). */
  iniciadoEn: Date | null;
}
const tripSchema = new Schema<ITrip>(
  {
    rutaAcubrir: { type: String, required: true },
    destino: { type: String, required: true },
    cliente: { type: String, required: false, default: "" },
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
    def: { type: String, required: false, default: "" },
    playo: { type: String, required: false, default: "" },
    tarjeta: { type: String, default: "" },
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
    checklistInicio: { type: ChecklistSchema, default: null },
    checklistRecepcion: { type: ChecklistSchema, default: null },
    checklistFin: { type: ChecklistSchema, default: null },
    checklistParadas: { type: [ChecklistParadaSchema], default: [] },
    hojaEntrega: { type: String, default: "" },
    hojasEntrega: { type: [String], default: [] },
    cartaPorte: { type: String, default: "" },
    bitacoraHoras: { type: String, default: "" },
    facturaViaje: { type: String, default: "" },
    finalizadoEn: { type: Date, default: null },
    iniciadoEn: { type: Date, default: null },

},
  {timestamps:true}
);

export default mongoose.model<ITrip>("Trip",tripSchema);
