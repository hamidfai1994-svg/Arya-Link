import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransactionDocument extends Document {
  profileId?: mongoose.Types.ObjectId | string;
  amount: number;
  type: string;
  status: 'pending' | 'successful' | 'failed';
  currency?: string;
  description?: string;
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
      enum: ['pending', 'successful', 'failed'],
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

