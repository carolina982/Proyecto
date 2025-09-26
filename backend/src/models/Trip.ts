import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITrip extends Document {
  nombre: string;         
  destino: string;         
  fechaSalida: Date;       
  fechaLlegada: Date;      
  conductorId: Types.ObjectId;   
  unidadId:Types.ObjectId;      
  estado: string;          
}

const tripSchema = new Schema<ITrip>(
  {
    nombre: { type: String, required: true },
    destino: { type: String, required: true },
    fechaSalida: { type: Date, required: true },
    fechaLlegada: { type: Date, required: true },
    conductorId:{type:Schema.Types.ObjectId , ref:"User", required:true},
    unidadId:{type:Schema.Types.ObjectId ,ref:"Unit" , required:true},
    estado: { type: String, enum: ["pendiente", "en progreso", "completado"], default: "pendiente" },
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>("Trip", tripSchema);