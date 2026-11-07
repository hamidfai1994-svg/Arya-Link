import mongoose, { Schema } from 'mongoose';
import { ProfileLinkItem } from '@/types/profile.types';
import { ProfileLinkSubSchema } from './Profile.model';

export { ProfileLinkSubSchema };
export type { ProfileLinkItem };

export interface IProfileLinkDocument extends mongoose.Document, Omit<ProfileLinkItem, 'id'> {
  id: string;
  expiresAt?: Date | null;
  maxClicks?: number | null;
  passwordHash?: string | null;
}

