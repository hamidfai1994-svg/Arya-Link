import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessageDocument extends Document {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  profileAlias?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    profileAlias: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Message: Model<IMessageDocument> =
  (mongoose.models && mongoose.models.Message)
    ? (mongoose.models.Message as Model<IMessageDocument>)
    : mongoose.model<IMessageDocument>('Message', MessageSchema);

export default Message;

