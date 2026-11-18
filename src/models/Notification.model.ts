import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'new_user'
  | 'profile_view'
  | 'new_lead'
  | 'new_order'
  | 'order_update'
  | 'kyc_update'
  | 'ticket'
  | 'system';

export type NotificationTargetRole = 'user' | 'admin' | 'all';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  targetRole: NotificationTargetRole;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      enum: ['user', 'admin', 'all'],
      default: 'user',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'عنوان اعلان الزامی است'],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'متن اعلان الزامی است'],
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: [
        'new_user',
        'profile_view',
        'new_lead',
        'new_order',
        'order_update',
        'kyc_update',
        'ticket',
        'system',
      ],
      default: 'system',
      index: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ targetRole: 1, createdAt: -1 });

export const Notification: Model<INotificationDocument> =
  (mongoose.models && mongoose.models.Notification)
    ? (mongoose.models.Notification as Model<INotificationDocument>)
    : mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default Notification;
