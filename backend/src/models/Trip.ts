import mongoose, { Document, Schema } from "mongoose";

export interface ITrip extends Document {
  nombre: string;         
  destino: string;         
  fechaSalida: Date;       
  fechaLlegada: Date;      
  conductorId: string| mongoose.Types.ObjectId;   
  unidadId:string;      
  estado: string;   
  kilometraje?:number;     
  acompanante:string|null|mongoose.Types.ObjectId;
  def:string;  
}
const tripSchema = new Schema<ITrip>(
  {
    nombre: { type: String, required: true },
    destino: { type: String, required: true },
    fechaSalida: { type: Date, required: true },
    fechaLlegada: { type: Date, required:false,default:null},
    conductorId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    unidadId:{type:String , required:true},
    estado: { type: String, enum: ["pendiente", "en progreso", "completado"], default: "pendiente" },
    kilometraje:{type:Number , default: 0},
    acompanante:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:false,default:null},
    def:{type:String , required:true},
    
},
  {timestamps:true}
);

export default mongoose.model<ITrip>("Trip",tripSchema);