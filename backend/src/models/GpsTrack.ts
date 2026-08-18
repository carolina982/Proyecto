import mongoose, { Document, Schema } from "mongoose";

export type GpsPointDoc = {
  lat: number;
  lng: number;
  at: number;
  ubicacion: string;
};

export interface IGpsTrack extends Document {
  unitId: string;
  last: GpsPointDoc;
  points: GpsPointDoc[];
}

const PointSchema = new Schema<GpsPointDoc>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    at: { type: Number, required: true },
    ubicacion: { type: String, default: "GPS" },
  },
  { _id: false }
);

const GpsTrackSchema = new Schema<IGpsTrack>(
  {
    unitId: { type: String, required: true, unique: true, index: true },
    last: { type: PointSchema, required: true },
    points: { type: [PointSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IGpsTrack>("GpsTrack", GpsTrackSchema);
