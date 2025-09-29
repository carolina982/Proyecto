import mongoose, { Document, Schema } from "mongoose";

export interface IViatic extends Document {
  tripId: string;       // ID como string
  concepto: string;
  descripcion: string;
  monto: number;
}

const viaticSchema = new Schema<IViatic>({
  tripId: { type: String, required: true },     // string en vez de ObjectId
  concepto: { type: String, required: true },
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
});

export default mongoose.model<IViatic>("Viatic",viaticSchema);