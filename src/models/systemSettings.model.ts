import mongoose, { Schema, models, model, Document, Model } from 'mongoose';

export interface IModuleAccessConfigItem {
  moduleType: string;
  title?: any;
  category?: string;
  requiredPlan: 'free' | 'pro' | 'vip';
  isPremium: boolean;
  isEnabled?: boolean;
}

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
    aiSettings: { type: Schema.Types.Mixed, default: {} },
    cloudStorageSettings: { type: Schema.Types.Mixed, default: {} },
    securitySettings: { type: Schema.Types.Mixed, default: {} },
    paymentSettings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const SystemSettings: Model<ISystemSettings> =
  (models && models.SystemSettings)
    ? (models.SystemSettings as Model<ISystemSettings>)
    : model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
