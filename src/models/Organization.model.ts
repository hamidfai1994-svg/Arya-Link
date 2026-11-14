import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrganizationBranding {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  companySlogan?: string;
  enforceBranding?: boolean;
}

export interface IOrganizationDocument extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId | string;
  totalLicenses: number;
  usedLicenses: number;
  branding: IOrganizationBranding;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: [true, 'نام شرکت یا سازمان الزامی است'],
      trim: true,
      maxlength: 150,
    },
    ownerId: {
      type: Schema.Types.Mixed,
      ref: 'User',
      required: [true, 'شناسه مدیر سازمان الزامی است'],
      index: true,
    },
    totalLicenses: {
      type: Number,
      default: 50,
      min: [1, 'حداقل تعداد جواز (لایسنس) باید ۱ عدد باشد'],
    },
    usedLicenses: {
      type: Number,
      default: 0,
      min: 0,
    },
    branding: {
      primaryColor: {
        type: String,
        default: '#0ea5e9',
        trim: true,
      },
      accentColor: {
        type: String,
        default: '#10b981',
        trim: true,
      },
      backgroundColor: {
        type: String,
        default: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        trim: true,
      },
      logoUrl: {
        type: String,
        default: '',
        trim: true,
      },
      companySlogan: {
        type: String,
        default: '',
        trim: true,
        maxlength: 200,
      },
      enforceBranding: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Organization: Model<IOrganizationDocument> =
  mongoose.models.Organization ||
  mongoose.model<IOrganizationDocument>('Organization', OrganizationSchema);

export default Organization;
