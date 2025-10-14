import mongoose, { Document, Schema } from "mongoose";

export interface ITrip extends Document {
  nombre: string;         
  destino: string;         
  fechaSalida: Date;       
  fechaLlegada: Date;      
  conductorId: string;   
  unidadId:string;      
  estado: string;   
  kilometraje?:number;       
}
const tripSchema = new Schema<ITrip>(
  {
    nombre: { type: String, required: true },
    destino: { type: String, required: true },
    fechaSalida: { type: Date, required: true },
    fechaLlegada: { type: Date, required: true },
    conductorId:{type:String, required:true},
    unidadId:{type:String , required:true},
    estado: { type: String, enum: ["pendiente", "en progreso", "completado"], default: "pendiente" },
      kilometraje:{type:Number , default: 0},
},
  {timestamps:true}
);
export default mongoose.model<ITrip>("Trip", tripSchema);