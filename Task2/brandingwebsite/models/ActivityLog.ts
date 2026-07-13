// models/ActivityLog.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true },
);

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;
