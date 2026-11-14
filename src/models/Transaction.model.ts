import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransactionDocument extends Document {
  profileId?: mongoose.Types.ObjectId | string;
  userId?: mongoose.Types.ObjectId | string;
  payerName?: string;
  amount: number;
  type: string;
  status: 'pending' | 'pending_verification' | 'successful' | 'failed';
  currency?: string;
  description?: string;
  paymentGateway?: string;
  paymentMode?: 'api' | 'manual' | string;
  referenceNumber?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    profileId: {
      type: Schema.Types.Mixed,
      ref: 'Profile',
      index: true,
    },
    userId: {
      type: Schema.Types.Mixed,
      ref: 'User',
      index: true,
    },
    payerName: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      required: true,
      default: 'subscription',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'pending_verification', 'successful', 'failed'],
      default: 'pending',
      index: true,
    },
    currency: {
      type: String,
      default: 'AFN',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    paymentGateway: {
      type: String,
      default: 'hesabpay',
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ['api', 'manual'],
      default: 'api',
      index: true,
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction: Model<ITransactionDocument> =
  (mongoose.models && mongoose.models.Transaction)
    ? (mongoose.models.Transaction as Model<ITransactionDocument>)
    : mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);

export default Transaction;

