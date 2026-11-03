import mongoose, { Schema, models, model, Document, Model } from 'mongoose';

export interface ISystemSettings extends Document {
  telegramSupportChatId: string;
  telegramInsightsChatId: string;
  telegramBotsActive: boolean;
  notifyNewUsers: boolean;
  notifyOrders: boolean;
  notifySupportTickets: boolean;
  notifySystemAlerts: boolean;
  appPushEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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
  },
  { timestamps: true }
);

export const SystemSettings: Model<ISystemSettings> =
  (models && models.SystemSettings)
    ? (models.SystemSettings as Model<ISystemSettings>)
    : model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

export default SystemSettings;
