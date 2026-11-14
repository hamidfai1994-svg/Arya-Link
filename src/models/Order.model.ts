import mongoose, { Schema, Document, Model } from 'mongoose';

export const ORDER_STATUS_ENUM = [
  'pending_payment',
  'processing',
  'nfc_writing',
  'shipping',
  'delivered',
  'cancelled',
  // Backwards compatibility with legacy records in database
  'completed',
  'printing',
  'shipped',
  'pending',
] as const;

export type OrderStatus = (typeof ORDER_STATUS_ENUM)[number];

export const ORDER_TYPE_ENUM = ['nfc_card', 'subscription'] as const;
export type OrderType = (typeof ORDER_TYPE_ENUM)[number];

export const PAYMENT_STATUS_ENUM = ['paid', 'pending', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS_ENUM)[number];

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
  sellerUserId?: mongoose.Types.ObjectId | string;
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
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  orderType?: OrderType;
  status?: OrderStatus | string;
  price?: number;
  paymentMethod: 'online' | 'cod' | 'bank' | 'wallet' | 'hawala' | 'crypto' | 'installment' | string;
  paymentGateway?: string;
  paymentMode?: 'api' | 'manual' | string;
  deliveryFee?: number;
  deliveryCompany?: string;
  isDeliverySettled?: boolean;
  trackingNumber?: string;
  physicalCardId?: mongoose.Types.ObjectId | string;
  trackingShortCode?: string;
  provisionedBy?: mongoose.Types.ObjectId | string;
  provisionedAt?: Date;
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
    userId: { type: Schema.Types.Mixed, required: false, index: true },
    sellerUserId: { type: Schema.Types.Mixed, required: false, index: true },
    profileId: { type: Schema.Types.Mixed, required: false, index: true },
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
      enum: {
        values: [...PAYMENT_STATUS_ENUM],
        message: 'مقدار {VALUE} برای وضعیت پرداخت نامعتبر است.',
      },
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: {
        values: [...ORDER_STATUS_ENUM],
        message: 'مقدار {VALUE} برای وضعیت سفارش نامعتبر است.',
      },
      default: 'pending_payment',
      index: true,
    },
    orderType: {
      type: String,
      enum: {
        values: [...ORDER_TYPE_ENUM],
        message: 'مقدار {VALUE} برای نوع سفارش نامعتبر است.',
      },
      default: 'nfc_card',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: [...ORDER_STATUS_ENUM],
        message: 'مقدار {VALUE} برای وضعیت نامعتبر است.',
      },
      default: 'pending_payment',
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
    physicalCardId: { type: Schema.Types.Mixed, ref: 'PhysicalCard', required: false, index: true },
    trackingShortCode: { type: String, required: false, trim: true, uppercase: true, index: true },
    provisionedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
    provisionedAt: { type: Date, required: false },
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

// Force-clear cached Mongoose model to guarantee reload of new enum schema in Next.js hot-reloads
if (mongoose.models && mongoose.models.Order) {
  delete (mongoose.models as any).Order;
}
if ((mongoose as any).modelSchemas && (mongoose as any).modelSchemas.Order) {
  delete (mongoose as any).modelSchemas.Order;
}

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);

export default Order;
