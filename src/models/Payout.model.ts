import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayoutDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  amount: number;
  currency: 'AFN' | 'USD';
  bankOrProvider: string; // 'HesabPay', 'Azizi Bank', 'Kabul Bank', 'Cash Sarafi'
  accountTitle: string;
  accountNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  referenceId?: string;
  adminNote?: string;
  requestedAt: Date;
  processedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deletedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayoutDocument>(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['AFN', 'USD'], default: 'AFN' },
    bankOrProvider: { type: String, required: true },
    accountTitle: { type: String, required: true },
    accountNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    referenceId: { type: String },
    adminNote: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: String },
    deletedReason: { type: String },
  },
  { timestamps: true }
);

export const Payout: Model<IPayoutDocument> =
  mongoose.models.Payout || mongoose.model<IPayoutDocument>('Payout', PayoutSchema);

export default Payout;
