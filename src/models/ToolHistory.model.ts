import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IToolHistoryDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  toolType: 'qr' | 'barcode';
  title: string;
  subtype: string;
  payload: string;
  previewDataUrl?: string;
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ToolHistorySchema = new Schema<IToolHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toolType: {
      type: String,
      enum: ['qr', 'barcode'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtype: {
      type: String,
      required: true,
      trim: true,
    },
    payload: {
      type: String,
      required: true,
      trim: true,
    },
    previewDataUrl: {
      type: String,
      default: '',
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query sorting
ToolHistorySchema.index({ userId: 1, createdAt: -1 });

export const ToolHistory: Model<IToolHistoryDocument> =
  mongoose.models.ToolHistory ||
  mongoose.model<IToolHistoryDocument>('ToolHistory', ToolHistorySchema);

export default ToolHistory;

