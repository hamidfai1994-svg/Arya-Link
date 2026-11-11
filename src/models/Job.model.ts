import mongoose, { Schema, Document, Model } from 'mongoose';
import { ReferenceTemplateId } from '@/lib/constants/jobTemplates';

export interface IJobDocument extends Document {
  title: string;
  categoryId: string;
  templateId: ReferenceTemplateId | string;
  isUserAdded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    title: {
      type: String,
      required: [true, 'عنوان شغل الزامی است'],
      trim: true,
      unique: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: [true, 'آی دی دسته‌بندی الزامی است'],
      trim: true,
      index: true,
    },
    templateId: {
      type: String,
      required: [true, 'آی دی قالب مرجع الزامی است'],
      default: 'general',
      trim: true,
      index: true,
    },
    isUserAdded: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Helpful compound index for fast grouped searches
JobSchema.index({ categoryId: 1, title: 1 });

export const Job: Model<IJobDocument> =
  (mongoose.models && mongoose.models.Job)
    ? (mongoose.models.Job as Model<IJobDocument>)
    : mongoose.model<IJobDocument>('Job', JobSchema);

export default Job;

