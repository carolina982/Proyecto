import mongoose, { Document, Schema } from "mongoose";

/** Inventario de entrega: ítems (cantidad + descripción) + firma digital. Histórico, no se sobrescribe. */
export interface IInventarioItem {
  cantidad: number;
  descripcion: string;
}

export interface IInventarioUnidad {
  contenido: string;
  items?: IInventarioItem[];
  /** Foto opcional de la hoja manuscrita (solo en algunos inventarios). */
  hojaUrl?: string;
  firmaUrl: string;
  operadorId?: mongoose.Types.ObjectId | null;
  operadorNombre: string;
  creadoPorId?: mongoose.Types.ObjectId | null;
  creadoPorNombre: string;
  fecha: Date;
}

export interface IUnit extends Document {
    nombre:string;
    placas:string;
    modelo:string;
    capacidad:string;
    estado:"Disponible" | "Mantenimiento" | "En ruta" | "No disponible" | "Ocupado";
    tipoRemolque?:"Lowboy" |"Caja Seca" |"";
    placaRemolque?:string;
    imagenUrl:string;

    inventarios?: IInventarioUnidad[];
}

const InventarioItemSchema = new Schema<IInventarioItem>(
  {
    cantidad: { type: Number, default: 0 },
    descripcion: { type: String, default: "" },
  },
  { _id: false }
);

const InventarioSchema = new Schema<IInventarioUnidad>(
  {
    contenido: { type: String, default: "" },
    items: { type: [InventarioItemSchema], default: [] },
    hojaUrl: { type: String, default: "" },
    firmaUrl: { type: String, default: "" },
    operadorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    operadorNombre: { type: String, default: "" },
    creadoPorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    creadoPorNombre: { type: String, default: "" },
    fecha: { type: Date, default: Date.now },
  },
  { _id: true }
);

const UNIT_ESTADOS = [
  "Disponible",
  "Mantenimiento",
  "En ruta",
  "No disponible",
  "Ocupado", // legacy → se muestra/normaliza como "En ruta"
] as const;

const uniSchema =new Schema<IUnit> ({
    nombre:{type:String , required:true},
    placas:{type:String , required:true},
    modelo:{type:String,  required:true},
    capacidad:{type:String , required:true},
    estado:{type:String , enum: UNIT_ESTADOS, default: "Disponible"},
    tipoRemolque:{type:String, enum:["Lowboy","Caja Seca",""],default:""},
    placaRemolque:{type:String,default:""},
    imagenUrl:{type:String,default:""},
    inventarios:{ type: [InventarioSchema], default: [] },
},
{timestamps:true}
);
uniSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    // Compat: "Ocupado" legacy → "En ruta"
    if (ret.estado === "Ocupado") ret.estado = "En ruta";
  },
});




export default  mongoose.model<IUnit> ("Unit" , uniSchema);