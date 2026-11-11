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
  orderType?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  price?: number;
  paymentMethod: 'online' | 'cod' | 'bank' | 'wallet' | 'hawala' | 'crypto' | 'installment' | string;
  deliveryFee?: number;
  deliveryCompany?: string;
  isDeliverySettled?: boolean;
  trackingNumber?: string;
  paymentProviderDetails?: {
    providerType?: 'bank' | 'wallet' | 'hawala' | 'crypto' | 'cod' | 'installment' | string;
    walletService?: string;
    walletAccount?: string;
    bankName?: string;
    bankAccountHolder?: string;
    bankAccountNumber?: string;
    hawalaExchangeName?: string;
    hawalaReceiverName?: string;
    hawalaReceiverPhone?: string;
    hawalaCityBranch?: string;
    cryptoNetwork?: string;
    cryptoWalletAddress?: string;
    codTerms?: string;
    installmentTotalAmount?: number;
    installmentDownPayment?: number;
    installmentCount?: number;
    installmentInterval?: string;
    receiptUrl?: string;
    transactionRef?: string;
  };
  cardSpecs?: IOrderCardSpecs;
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deletedReason?: string;
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
    orderType: {
      type: String,
      default: 'nfc_card',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: 'online',
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    deliveryCompany: {
      type: String,
      default: '',
      trim: true,
    },
    isDeliverySettled: {
      type: Boolean,
      default: false,
      index: true,
    },
    trackingNumber: { type: String, default: '' },
    paymentProviderDetails: {
      providerType: { type: String, default: '' },
      walletService: { type: String, default: '' },
      walletAccount: { type: String, default: '' },
      bankName: { type: String, default: '' },
      bankAccountHolder: { type: String, default: '' },
      bankAccountNumber: { type: String, default: '' },
      hawalaExchangeName: { type: String, default: '' },
      hawalaReceiverName: { type: String, default: '' },
      hawalaReceiverPhone: { type: String, default: '' },
      hawalaCityBranch: { type: String, default: '' },
      cryptoNetwork: { type: String, default: '' },
      cryptoWalletAddress: { type: String, default: '' },
      codTerms: { type: String, default: '' },
      installmentTotalAmount: { type: Number, default: 0 },
      installmentDownPayment: { type: Number, default: 0 },
      installmentCount: { type: Number, default: 0 },
      installmentInterval: { type: String, default: 'monthly' },
      receiptUrl: { type: String, default: '' },
      transactionRef: { type: String, default: '' },
    },
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
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: String },
    deletedReason: { type: String },
  },
  { timestamps: true }
);

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
