import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeadDocument extends Document {
  profileId: mongoose.Types.ObjectId | string;
  name: string;
  phone: string;
  message: string;
  email?: string;
  status: 'new' | 'contacted' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILeadDocument>(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'archived'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lead: Model<ILeadDocument> =
  mongoose.models.Lead || mongoose.model<ILeadDocument>('Lead', LeadSchema);

export default Lead;
