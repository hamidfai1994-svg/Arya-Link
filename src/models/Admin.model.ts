import mongoose, { Schema, Document, Model } from 'mongoose';

export type AdminRole = 'admin' | 'superadmin' | 'financial_admin' | 'content_editor';

export interface IAdminDocument extends Document {
  userId?: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  role: AdminRole;
  telegramChatId?: string;
  telegramUserId?: string;
  telegramUsername?: string;
  telegramBindToken?: string;
  telegramBindTokenExpires?: Date | null;
  telegramConnectedAt?: Date | null;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    userId: {
      type: Schema.Types.Mixed,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'نام مدیر الزامی است'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'ایمیل مدیر الزامی است'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin', 'financial_admin', 'content_editor'],
      default: 'admin',
      index: true,
    },
    telegramChatId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    telegramUserId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    telegramUsername: {
      type: String,
      default: '',
      trim: true,
    },
    telegramBindToken: {
      type: String,
      default: '',
      index: true,
    },
    telegramBindTokenExpires: {
      type: Date,
      default: null,
    },
    telegramConnectedAt: {
      type: Date,
      default: null,
    },
    permissions: {
      type: [String],
      default: ['all'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Admin: Model<IAdminDocument> =
  (mongoose.models && mongoose.models.Admin)
    ? (mongoose.models.Admin as Model<IAdminDocument>)
    : mongoose.model<IAdminDocument>('Admin', AdminSchema);

export default Admin;
