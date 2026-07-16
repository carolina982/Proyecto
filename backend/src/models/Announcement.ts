import mongoose, { Document, Schema } from "mongoose";

interface IAnnouncement extends Document {
  titulo: string;
  contenido: string;
  fecha: Date;
  image?: string;
  autor?: string;
  autorPhotoUrl?: string | null;
  fijado?: boolean;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    titulo: { type: String, required: true },
    contenido: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    image: { type: String },
    autor: { type: String, default: "Administración" },
    autorPhotoUrl: { type: String, default: null },
    fijado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAnnouncement>("Announcement", announcementSchema);
