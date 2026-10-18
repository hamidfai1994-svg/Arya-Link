import mongoose, { Schema, Document, Model } from 'mongoose';
import { MultilingualText } from '@/lib/i18n/multilingual';

export interface IBlogPostDocument extends Document {
  title: string | MultilingualText;
  slug: string;
  summary: string | MultilingualText;
  content: string | MultilingualText;
  coverImage?: string;
  category: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  readTimeMinutes: number;
  viewsCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPostDocument>(
  {
    title: { type: Schema.Types.Mixed, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    summary: { type: Schema.Types.Mixed, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    coverImage: { type: String, default: '' },
    category: { type: String, default: 'فناوری و کسب‌وکار' },
    author: { type: String, default: 'تیم تحریریه آریا لینک' },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true, index: true },
    readTimeMinutes: { type: Number, default: 4 },
    viewsCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const BlogPost: Model<IBlogPostDocument> =
  mongoose.models.BlogPost || mongoose.model<IBlogPostDocument>('BlogPost', BlogPostSchema);

export default BlogPost;
