import mongoose, { Schema, Document, Model } from 'mongoose';
import { MultilingualText } from '@/lib/i18n/multilingual';

export interface IServiceItemDocument extends Document {
  title: string | MultilingualText;
  slug: string;
  summary: string | MultilingualText;
  description: string | MultilingualText;
  icon: string;
  features: string[];
  targetAudience: string | MultilingualText;
  pricingInfo: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceItemSchema = new Schema<IServiceItemDocument>(
  {
    title: { type: Schema.Types.Mixed, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    summary: { type: Schema.Types.Mixed, required: true },
    description: { type: Schema.Types.Mixed, required: true },
    icon: { type: String, default: 'Layers' },
    features: { type: [String], default: [] },
    targetAudience: { type: Schema.Types.Mixed, default: 'کسب‌وکارها، شرکت‌ها و فریلنسرها' },
    pricingInfo: { type: String, default: 'سفارشی و پلن PRO' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const ServiceItem: Model<IServiceItemDocument> =
  mongoose.models.ServiceItem || mongoose.model<IServiceItemDocument>('ServiceItem', ServiceItemSchema);

export default ServiceItem;
