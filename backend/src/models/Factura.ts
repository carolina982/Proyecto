import mongoose, { Document, Schema, Types } from "mongoose";

export type FacturaFileType = "pdf" | "xml" | "ambos";
export type FacturaEstado = "activo" | "eliminado";

export interface IFactura extends Document {
  tripId: Types.ObjectId;
  fileName: string;
  fileType: FacturaFileType;
  /** Ruta/URL del PDF (o del único archivo). */
  fileUrl: string;
  /** Ruta/URL del XML cuando fileType es "ambos". */
  xmlUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
  estado: FacturaEstado;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
}

const FacturaSchema = new Schema<IFactura>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true, trim: true },
    fileType: {
      type: String,
      enum: ["pdf", "xml", "ambos"],
      required: true,
    },
    fileUrl: { type: String, required: true, trim: true },
    xmlUrl: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: { type: Date, default: Date.now },
    estado: {
      type: String,
      enum: ["activo", "eliminado"],
      default: "activo",
      index: true,
    },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

FacturaSchema.index({ tripId: 1, estado: 1, uploadedAt: -1 });

FacturaSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret: any) {
    ret.id = String(ret._id || ret.id || "");
    delete ret.__v;
    return ret;
  },
});
FacturaSchema.set("toObject", { virtuals: true });

export default mongoose.model<IFactura>("Factura", FacturaSchema);
