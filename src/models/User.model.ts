import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'user' | 'admin' | 'superadmin' | 'content_editor' | 'financial_admin';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface IAuthProvider {
  provider: 'credentials' | 'google' | 'apple' | 'github';
  providerId?: string;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  username?: string;
  profileUrl?: string;
  password?: string;
  avatar?: string;
  phone?: string;
  occupation?: string;
  jobCategory?: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  accountType?: 'personal' | 'business' | 'corporate';
  providers: IAuthProvider[];
  isActive: boolean;
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  kycData?: {
    nationalId?: string;
    documentType?: string;
    selfieUrl?: string;
    documentUrl?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    fatherName?: string;
    idNumber?: string;
    birthDate?: string;
    expiryDate?: string;
    [key: string]: any;
  };
  financialSettings?: {
    hesabPay?: {
      isActive?: boolean;
      isApiEnabled?: boolean;
      merchantId?: string;
      apiKey?: string;
      accountName?: string;
      accountNumber?: string;
    };
    [key: string]: any;
  };
  emailVerified?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuthProviderSubSchema = new Schema<IAuthProvider>(
  {
    provider: {
      type: String,
      enum: ['credentials', 'google', 'apple', 'github'],
      default: 'credentials',
    },
    providerId: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'نام کاربر الزامی است'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'ایمیل الزامی است'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'فرمت ایمیل وارد شده نامعتبر است',
      ],
    },
    password: {
      type: String,
      select: false,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
    },
    profileUrl: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    occupation: {
      type: String,
      default: '',
      trim: true,
    },
    jobCategory: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin', 'content_editor', 'financial_admin'],
      default: 'user',
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
      index: true,
    },
    accountType: {
      type: String,
      enum: ['personal', 'business', 'corporate'],
      default: 'personal',
      index: true,
    },
    providers: {
      type: [AuthProviderSubSchema],
      default: [{ provider: 'credentials' }],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
      index: true,
    },
    kycData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    financialSettings: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    emailVerified: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
