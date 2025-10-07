import mongoose, { Document, Schema } from "mongoose";

export interface IViatic extends Document {
  tripId: string;      
  concepto: string;
  descripcion: string;
  monto: number;
  ticket?:string;
}

const viaticSchema = new Schema<IViatic>({
  tripId: { type: String, required: true },     
  concepto: { type: String, required: true },
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  ticket:{type:String},
});

export default mongoose.model<IViatic>("Viatic",viaticSchema);