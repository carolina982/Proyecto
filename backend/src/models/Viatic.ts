import mongoose, { Document, Schema } from "mongoose";

export interface IViatic extends Document {
  tripId:mongoose.Types.ObjectId;      
  concepto: string;
  descripcion: string;
  monto: number;
  ticket?:string;
  nombre:string;
}

const viaticSchema = new Schema<IViatic>({
  tripId: {type:mongoose.Schema.Types.ObjectId, ref:"Trip", required:true},     
  concepto: { type: String, required: true },
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  ticket:{type:String},
  nombre:{type:String , required:true},
});

export default mongoose.model<IViatic>("Viatic",viaticSchema);