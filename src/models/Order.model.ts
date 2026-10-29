import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderCardSpecs {
  material?: string;
  templateId?: string;
  templateName?: string;
  orientation?: 'horizontal' | 'vertical';
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  companyName?: string;
  logoUrl?: string;
  finishAccent?: string;
  cardUrl?: string;
  customArtworkFront?: string;
  customArtworkBack?: string;
}

export interface IOrderDocument extends Document {
  userId?: mongoose.Types.ObjectId | string;
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
  orderStatus: 'completed' | 'processing' | 'printing' | 'shipped' | 'pending' | 'cancelled';
  paymentMethod: string;
  trackingNumber?: string;
  cardSpecs?: IOrderCardSpecs;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    userId: { type: Schema.Types.Mixed, index: true },
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
      enum: ['completed', 'processing', 'printing', 'shipped', 'pending', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: { type: String, default: 'HesabPay' },
    trackingNumber: { type: String, default: '' },
    cardSpecs: {
      material: { type: String, default: '' },
      templateId: { type: String, default: '' },
      templateName: { type: String, default: '' },
      orientation: { type: String, default: 'horizontal' },
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      jobTitle: { type: String, default: '' },
      companyName: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      finishAccent: { type: String, default: 'gold' },
      cardUrl: { type: String, default: '' },
      customArtworkFront: { type: String, default: '' },
      customArtworkBack: { type: String, default: '' },
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
