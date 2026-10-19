import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  LinkModuleType,
  ProfileThemeConfig,
  ProfileLinkItem,
} from '@/types/profile.types';

export interface IProfileDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  orgId?: mongoose.Types.ObjectId | string;
  alias: string;
  displayName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  headerLayout?: 'curve' | 'gradient_mask' | 'minimal';
  phone?: string;
  whatsapp?: string;
  email?: string;
  userEmail?: string;
  location?: string;
  directModeEnabled: boolean;
  directModeUrl?: string;
  themeConfig: ProfileThemeConfig;
  links: ProfileLinkItem[];
  profileType?: 'personal' | 'business';
  isVerified?: boolean;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationData?: any;
  profileLanguage?: 'dari' | 'pashto' | 'en' | string;
  seoTitle?: string;
  seoDescription?: string;
  noIndex?: boolean;
  passwordProtection?: { enabled: boolean; password?: string; hint?: string };
  hideBranding: boolean;
  isActive: boolean;
  viewsCount: number;
  leadsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LinkAdvancedSettingsSchema = new Schema(
  {
    scheduling: {
      enabled: { type: Boolean, default: false },
      days: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '20:00' },
    },
    monetization: {
      isLocked: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      currency: { type: String, enum: ['AFN', 'USD'], default: 'AFN' },
      unlockNote: { type: String, default: '' },
    },
    customStyling: {
      customBgColor: { type: String },
      customTextColor: { type: String },
      customBorderColor: { type: String },
      isHighlighted: { type: Boolean, default: false },
      buttonAnimation: { type: String, default: 'none' },
      borderStyle: { type: String, default: 'solid' },
      shadowStyle: { type: String, default: 'sm' },
    },
    openInNewTab: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    buttonAnimation: { type: String, default: 'none' },
  },
  { _id: false }
);

const ProfileLinkSubSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, default: '' },
    icon: { type: String },
    moduleType: {
      type: String,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    advancedSettings: { type: LinkAdvancedSettingsSchema, default: () => ({}) },
  },
  { _id: false, timestamps: true }
);

const ProfileThemeConfigSchema = new Schema(
  {
    preset: {
      type: String,
      enum: ['dark_neon', 'glass_morphism', 'emerald_luxury', 'royal_gold', 'minimal_light'],
      default: 'dark_neon',
    },
    primaryColor: { type: String, default: '#0ea5e9' },
    accentColor: { type: String, default: '#06b6d4' },
    backgroundColor: { type: String, default: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)' },
    cardBlur: { type: String, default: 'backdrop-blur-md bg-white/10 border-white/20' },
    textColor: { type: String, default: '#ffffff' },
    borderRadius: { type: String, default: 'rounded-2xl' },
    backgroundType: { type: String, enum: ['solid', 'gradient', 'pattern'], default: 'gradient' },
    buttonBorderStyle: { type: String, enum: ['none', 'solid', 'dashed'], default: 'solid' },
    buttonShadowStyle: { type: String, enum: ['none', 'sm', 'md', 'glow'], default: 'sm' },
  },
  { _id: false }
);

const ProfileSchema = new Schema<IProfileDocument>(
  {
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    orgId: { type: Schema.Types.Mixed, index: true },
    alias: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: { type: String, required: true, trim: true },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    headerLayout: {
      type: String,
      enum: ['curve', 'gradient_mask', 'minimal'],
      default: 'curve',
    },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '', index: true },
    userEmail: { type: String, default: '', index: true },
    location: { type: String, default: '' },
    directModeEnabled: { type: Boolean, default: false },
    directModeUrl: { type: String, default: '' },
    themeConfig: { type: ProfileThemeConfigSchema, default: () => ({}) },
    links: { type: [ProfileLinkSubSchema], default: [] },
    profileType: {
      type: String,
      enum: ['personal', 'business'],
      default: 'personal',
    },
    isVerified: { type: Boolean, default: false, index: true },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    verificationData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    profileLanguage: {
      type: String,
      enum: ['dari', 'pashto', 'en', 'fa', 'ps'],
      default: 'dari',
    },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    noIndex: { type: Boolean, default: false },
    passwordProtection: {
      enabled: { type: Boolean, default: false },
      password: { type: String, default: '' },
      hint: { type: String, default: '' },
    },
    hideBranding: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    viewsCount: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Profile: Model<IProfileDocument> =
  mongoose.models.Profile || mongoose.model<IProfileDocument>('Profile', ProfileSchema);

export default Profile;
