import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhysicalCardDocument extends Document {
  shortCode: string;
  ownerId?: mongoose.Types.ObjectId | string;
  orderId?: mongoose.Types.ObjectId | string;
  profileId?: mongoose.Types.ObjectId | string;
  scansCount: number;
  provisionedBy?: mongoose.Types.ObjectId | string;
  provisionedAt?: Date;
  status: 'pending_write' | 'active' | 'deactivated';
  createdAt: Date;
  updatedAt: Date;
}

const PhysicalCardSchema = new Schema<IPhysicalCardDocument>(
  {
    shortCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 8,
      index: true,
    },
    ownerId: {
      type: Schema.Types.Mixed,
      ref: 'User',
      required: false,
      index: true,
    },
    orderId: {
      type: Schema.Types.Mixed,
      ref: 'Order',
      required: false,
      index: true,
    },
    profileId: {
      type: Schema.Types.Mixed,
      ref: 'Profile',
      required: false,
      index: true,
    },
    scansCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    provisionedBy: {
      type: Schema.Types.Mixed,
      ref: 'User',
      required: false,
    },
    provisionedAt: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending_write', 'active', 'deactivated'],
      default: 'pending_write',
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * Generates a clean, readable 6-character alphanumeric code (e.g. X9B2V1).
 * Omits ambiguous characters like 0, O, 1, I to avoid visual confusion.
 */
export function generatePhysicalCardCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

// Force-clear cached Mongoose model to guarantee reload in Next.js hot-reloads
if (mongoose.models && mongoose.models.PhysicalCard) {
  delete (mongoose.models as any).PhysicalCard;
}
if ((mongoose as any).modelSchemas && (mongoose as any).modelSchemas.PhysicalCard) {
  delete (mongoose as any).modelSchemas.PhysicalCard;
}

export const PhysicalCard: Model<IPhysicalCardDocument> =
  mongoose.models.PhysicalCard ||
  mongoose.model<IPhysicalCardDocument>('PhysicalCard', PhysicalCardSchema);

export default PhysicalCard;

