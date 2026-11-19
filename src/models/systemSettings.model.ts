import mongoose, { Schema, models, model, Document, Model } from 'mongoose';

export interface IModuleAccessConfigItem {
  moduleType: string;
  title?: any;
  category?: string;
  requiredPlan: 'free' | 'pro' | 'vip';
  isPremium: boolean;
  isEnabled?: boolean;
}

export interface INfcCardMaterialConfig {
  id: string;
  name: {
    fa: string;
    en: string;
    ps: string;
  };
  priceWithPrint: number;
  isAvailable: boolean;
  metalness: number;
  roughness: number;
  clearcoat: number;
  envMapIntensity: number;
  brushed: boolean;
}

export interface INfcQtyDiscountTier {
  qty: number;
  disc: number;
}

export const DEFAULT_NFC_CARD_MATERIALS: INfcCardMaterialConfig[] = [
  {
    id: 'pvc-matte',
    name: {
      fa: 'PVC مات ضدخش',
      ps: 'مات PVC',
      en: 'Matte PVC',
    },
    priceWithPrint: 650,
    isAvailable: true,
    metalness: 0.12,
    roughness: 0.56,
    clearcoat: 0.18,
    envMapIntensity: 0.15,
    brushed: false,
  },
  {
    id: 'pvc-gloss',
    name: {
      fa: 'PVC براق ساتن',
      ps: 'براق PVC',
      en: 'Gloss Satin PVC',
    },
    priceWithPrint: 750,
    isAvailable: true,
    metalness: 0.22,
    roughness: 0.24,
    clearcoat: 0.85,
    envMapIntensity: 0.35,
    brushed: false,
  },
  {
    id: 'metal',
    name: {
      fa: 'فلزی برس‌خورده',
      ps: 'فلزي پریمیوم',
      en: 'Brushed Metal',
    },
    priceWithPrint: 1450,
    isAvailable: true,
    metalness: 0.84,
    roughness: 0.26,
    clearcoat: 0.55,
    envMapIntensity: 0.55,
    brushed: true,
  },
];

export const DEFAULT_NFC_QTY_DISCOUNTS: INfcQtyDiscountTier[] = [
  { qty: 1, disc: 0 },
  { qty: 3, disc: 10 },
  { qty: 5, disc: 15 },
  { qty: 10, disc: 20 },
];

export interface ISystemSettings extends Document {
  telegramSupportChatId: string;
  telegramInsightsChatId: string;
  telegramBotsActive: boolean;
  notifyNewUsers: boolean;
  notifyOrders: boolean;
  notifySupportTickets: boolean;
  notifySystemAlerts: boolean;
  appPushEnabled: boolean;
  platformMainLogo: string;
  platformFavicon: string;
  moduleAccessConfig?: IModuleAccessConfigItem[];
  nfcCardMaterials?: INfcCardMaterialConfig[];
  nfcQtyDiscounts?: INfcQtyDiscountTier[];
  aiSettings?: {
    groqApiKey?: string;
    groqModelName?: string;
    cloudflareAccountId?: string;
    cloudflareApiToken?: string;
    cloudflareModelName?: string;
    isFallbackActive?: boolean;
  };
  cloudStorageSettings?: {
    cloudinaryCloudName?: string;
    cloudinaryApiKey?: string;
    cloudinaryApiSecret?: string;
    imageKitPublicKey?: string;
    imageKitPrivateKey?: string;
    imageKitUrlEndpoint?: string;
    primaryStorage?: 'cloudinary' | 'imagekit' | 'local';
  };
  securitySettings?: {
    turnstileSiteKey?: string;
    turnstileSecretKey?: string;
    captchaEnabled?: boolean;
    ipRateLimitingEnabled?: boolean;
  };
  paymentSettings?: {
    hesabPayMerchantId?: string;
    hesabPayApiKey?: string;
    hesabPayApiSecret?: string;
    hesabPayEndpoint?: string;
    hesabPaySandbox?: boolean;
    hesabPayActive?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ModuleAccessItemSubSchema = new Schema(
  {
    moduleType: { type: String, required: true, trim: true },
    title: { type: Schema.Types.Mixed, default: '' },
    category: { type: String, default: '' },
    requiredPlan: {
      type: String,
      enum: ['free', 'pro', 'vip'],
      default: 'free',
    },
    isPremium: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const NfcCardMaterialSubSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    name: {
      fa: { type: String, default: '' },
      en: { type: String, default: '' },
      ps: { type: String, default: '' },
    },
    priceWithPrint: { type: Number, required: true, min: 0, default: 650 },
    isAvailable: { type: Boolean, default: true },
    metalness: { type: Number, default: 0.12 },
    roughness: { type: Number, default: 0.56 },
    clearcoat: { type: Number, default: 0.18 },
    envMapIntensity: { type: Number, default: 0.15 },
    brushed: { type: Boolean, default: false },
  },
  { _id: false }
);

const NfcQtyDiscountSubSchema = new Schema(
  {
    qty: { type: Number, required: true, min: 1 },
    disc: { type: Number, required: true, min: 0, max: 90 },
  },
  { _id: false }
);

const SystemSettingsSchema = new Schema(
  {
    telegramSupportChatId: { type: String, default: '' },
    telegramInsightsChatId: { type: String, default: '' }, // برای تفکیک دو رباتی که کاربر خواست
    telegramBotsActive: { type: Boolean, default: false },
    notifyNewUsers: { type: Boolean, default: true },
    notifyOrders: { type: Boolean, default: true },
    notifySupportTickets: { type: Boolean, default: true },
    notifySystemAlerts: { type: Boolean, default: false },
    appPushEnabled: { type: Boolean, default: false },
    platformMainLogo: { type: String, default: '', trim: true },
    platformFavicon: { type: String, default: '', trim: true },
    moduleAccessConfig: { type: [ModuleAccessItemSubSchema], default: [] },
    nfcCardMaterials: {
      type: [NfcCardMaterialSubSchema],
      default: () => DEFAULT_NFC_CARD_MATERIALS.map((m) => ({ ...m, name: { ...m.name } })),
    },
    nfcQtyDiscounts: {
      type: [NfcQtyDiscountSubSchema],
      default: () => DEFAULT_NFC_QTY_DISCOUNTS.map((d) => ({ ...d })),
    },
    aiSettings: { type: Schema.Types.Mixed, default: {} },
    cloudStorageSettings: { type: Schema.Types.Mixed, default: {} },
    securitySettings: { type: Schema.Types.Mixed, default: {} },
    paymentSettings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Clear cached Mongoose model on hot reload so new schema fields persist cleanly
if (mongoose.models && mongoose.models.SystemSettings) {
  delete (mongoose.models as any).SystemSettings;
}
if ((mongoose as any).modelSchemas && (mongoose as any).modelSchemas.SystemSettings) {
  delete (mongoose as any).modelSchemas.SystemSettings;
}

export const SystemSettings: Model<ISystemSettings> =
  (models && models.SystemSettings)
    ? (models.SystemSettings as Model<ISystemSettings>)
    : model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
