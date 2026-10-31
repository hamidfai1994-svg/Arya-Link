import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLogDocument extends Document {
  recordType: 'order' | 'transaction' | 'payout';
  recordId: string;
  referenceNumber: string;
  title: string;
  amount?: number;
  currency?: string;
  deletedByAdminName: string;
  deletedByAdminEmail: string;
  deletedAt: Date;
  deletedReason: string;
  originalData?: any;
  isRestored?: boolean;
  restoredAt?: Date;
  restoredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    recordType: {
      type: String,
      enum: ['order', 'transaction', 'payout'],
      required: true,
      index: true,
    },
    recordId: {
      type: String,
      required: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'AFN',
    },
    deletedByAdminName: {
      type: String,
      required: true,
      trim: true,
    },
    deletedByAdminEmail: {
      type: String,
      required: true,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deletedReason: {
      type: String,
      required: true,
      trim: true,
    },
    originalData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    isRestored: {
      type: Boolean,
      default: false,
      index: true,
    },
    restoredAt: {
      type: Date,
    },
    restoredBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog: Model<IAuditLogDocument> =
  (mongoose?.models && mongoose.models.AuditLog)
    ? (mongoose.models.AuditLog as Model<IAuditLogDocument>)
    : mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;

