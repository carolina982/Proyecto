import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
  | "trip_assigned"
  | "companion_assigned"
  | "trip_completed";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: NotificationType;
  tripId?: mongoose.Types.ObjectId | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["trip_assigned", "companion_assigned", "trip_completed"],
      required: true,
    },
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", default: null },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", notificationSchema);
