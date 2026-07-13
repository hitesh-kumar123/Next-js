// models/Analytics.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnalytics extends Document {
  views: number;
  clicks: number;
  revenue: number;
  timestamp: Date;
}

const AnalyticsSchema: Schema<IAnalytics> = new Schema({
  views: { type: Number, required: true, default: 0 },
  clicks: { type: Number, required: true, default: 0 },
  revenue: { type: Number, required: true, default: 0 },
  timestamp: { type: Date, default: Date.now, index: true },
});

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
export default Analytics;
