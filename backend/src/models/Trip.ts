import mongoose, { Document, Schema } from "mongoose";

export interface ITrip extends Document {
  nombre: string;         
  destino: string;         
  fechaSalida: Date;       
  fechaLlegada: Date;      
  conductorId: mongoose.Types.ObjectId;   
  unidadId:string;      
  estado: string;          
}

const tripSchema = new Schema<ITrip>(
  {
    nombre: { type: String, required: true },
    destino: { type: String, required: true },
    fechaSalida: { type: Date, required: true },
    fechaLlegada: { type: Date, required: true },
    conductorId:{type:Schema.Types.ObjectId , ref:"User" , required:true},
    unidadId:{type:String , required:true},
    estado: { type: String, enum: ["pendiente", "en progreso", "completado"], default: "pendiente" },
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>("Trip", tripSchema);