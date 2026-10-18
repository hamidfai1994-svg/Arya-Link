import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderDocument extends Document {
  sellerUserId: mongoose.Types.ObjectId | string;
  profileId?: mongoose.Types.ObjectId | string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: 'AFN' | 'USD';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  orderStatus: 'completed' | 'processing' | 'pending' | 'cancelled';
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    sellerUserId: { type: Schema.Types.Mixed, required: true, index: true },
    profileId: { type: Schema.Types.Mixed, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    customerPhone: { type: String, default: '' },
    productTitle: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    currency: { type: String, enum: ['AFN', 'USD'], default: 'AFN' },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'refunded'],
      default: 'paid',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['completed', 'processing', 'pending', 'cancelled'],
      default: 'completed',
      index: true,
    },
    paymentMethod: { type: String, default: 'HesabPay' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
