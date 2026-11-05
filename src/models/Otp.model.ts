import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtpDocument extends Document {
  email: string;
  code: string;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 300 }, // 300 seconds = 5 minutes TTL
    },
  },
  {
    timestamps: false,
  }
);

export const Otp: Model<IOtpDocument> =
  mongoose.models.Otp || mongoose.model<IOtpDocument>('Otp', OtpSchema);

export default Otp;

