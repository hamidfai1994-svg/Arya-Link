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
  crmTelegramChatId?: string;
  crmTelegramEnable?: boolean;
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
      currency: { type: String, default: 'AFN' },
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
      buttonShape: { type: String },
      buttonSize: { type: String },
      borderWidth: { type: String },
      borderRadius: { type: String },
      animationTrigger: { type: String },
      animationSpeed: { type: Number },
    },
    openInNewTab: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    buttonAnimation: { type: String, default: 'none' },
    animationTrigger: { type: String, default: 'infinite' },
    animationSpeed: { type: Number, default: 1.6 },
    isCompactIcon: { type: Boolean, default: true },
  },
  { _id: false, strict: false }
);

const ProfileLinkSubSchema = new Schema(
  {
    id: { type: String, default: () => `link_${Date.now()}` },
    title: { type: String, default: '' },
    url: { type: String, default: '' },
    icon: { type: String },
    moduleType: {
      type: String,
      default: 'standard_link',
    },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    parentId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: () => ({}) },
    advancedSettings: { type: Schema.Types.Mixed, default: () => ({}) },
  },
  { _id: false, timestamps: true, strict: false }
);

const ProfileThemeConfigSchema = new Schema(
  {
    preset: {
      type: String,
      default: 'dark_neon',
    },
    primaryColor: { type: String, default: '#0ea5e9' },
    accentColor: { type: String, default: '#06b6d4' },
    backgroundColor: { type: String, default: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)' },
    cardBlur: { type: String, default: 'backdrop-blur-md bg-white/10 border-white/20' },
    textColor: { type: String, default: '#ffffff' },
    borderRadius: { type: String, default: 'rounded-2xl' },
    backgroundType: { type: String, default: 'gradient' },
    bgSolidColor: { type: String, default: '#090d16' },
    bgGradientColors: { type: [String], default: ['#090d16', '#0f172a', '#1e1b4b'] },
    bgGradientType: { type: String, default: 'linear' },
    bgPatternId: { type: String, default: 'circuit' },
    bgPatternOpacity: { type: Schema.Types.Mixed, default: 0.15 },
    bgImageUrl: { type: String, default: '' },
    bgImageOpacity: { type: Schema.Types.Mixed, default: 0.25 },
    bgGradientPosition: { type: Schema.Types.Mixed, default: 50 },
    bgPatternSize: { type: Schema.Types.Mixed, default: 24 },
    buttonBorderStyle: { type: String, default: 'solid' },
    buttonShadowStyle: { type: String, default: 'sm' },
    buttonShape: {
      type: String,
      default: 'soft',
    },
    buttonSize: { type: String, default: 'md' },
    buttonBorderWidth: { type: String, default: 'thin' },
    buttonBorderColor: { type: String, default: '#38bdf8' },
    buttonBgColor: { type: String, default: '#0ea5e9' },
    buttonTextColor: { type: String, default: '#ffffff' },
    compactSocialIcons: { type: Boolean, default: true },
    fontFa: { type: String, default: 'vazirmatn' },
    fontEn: { type: String, default: 'inter' },
    fontSizeDari: { type: Schema.Types.Mixed, default: 15 },
    fontSizePashto: { type: Schema.Types.Mixed, default: 15 },
    fontSizeEn: { type: Schema.Types.Mixed, default: 14 },
  },
  { _id: false, strict: false }
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
      default: 'curve',
    },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '', index: true },
    userEmail: { type: String, default: '', index: true },
    location: { type: String, default: '' },
    directModeEnabled: { type: Boolean, default: false },
    directModeUrl: { type: String, default: '' },
    themeConfig: { type: Schema.Types.Mixed, default: () => ({}) },
    links: { type: [ProfileLinkSubSchema], default: [] },
    profileType: {
      type: String,
      default: 'personal',
    },
    isVerified: { type: Boolean, default: false, index: true },
    verificationStatus: {
      type: String,
      default: 'unverified',
    },
    verificationData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    profileLanguage: {
      type: String,
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
    crmTelegramChatId: { type: String, default: '' },
    crmTelegramEnable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    viewsCount: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const Profile: Model<IProfileDocument> =
  (mongoose.models && mongoose.models.Profile)
    ? (mongoose.models.Profile as Model<IProfileDocument>)
    : mongoose.model<IProfileDocument>('Profile', ProfileSchema);

export default Profile;
