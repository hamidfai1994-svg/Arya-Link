import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettingsDocument extends Document {
  companyLogo: string;
  favicon: string;
  siteName: string;
  siteDescription: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    companyLogo: {
      type: String,
      default: '',
      trim: true,
    },
    favicon: {
      type: String,
      default: '',
      trim: true,
    },
    siteName: {
      type: String,
      default: 'Arya Link',
      trim: true,
    },
    siteDescription: {
      type: String,
      default: 'پیشرفته‌ترین سامانه هویت دیجیتال، کارت ویزیت هوشمند NFC و درگاه لینک‌بایو در افغانستان',
      trim: true,
    },
    updatedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const SiteSettings: Model<ISiteSettingsDocument> =
  (mongoose?.models && mongoose.models.SiteSettings)
    ? (mongoose.models.SiteSettings as Model<ISiteSettingsDocument>)
    : mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
