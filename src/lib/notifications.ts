import { connectToDatabase } from '@/lib/db/mongodb';
import {
  Notification,
  NotificationType,
  NotificationTargetRole,
} from '@/models/Notification.model';
import mongoose from 'mongoose';

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  targetRole?: NotificationTargetRole;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Safely creates a platform notification without throwing errors that could interrupt caller workflows.
 */
export async function createPlatformNotification(params: CreateNotificationParams) {
  try {
    await connectToDatabase();
    const doc = await Notification.create({
      userId: params.userId,
      targetRole: params.targetRole || (params.userId === 'admin' ? 'admin' : 'user'),
      title: params.title,
      message: params.message,
      type: params.type || 'system',
      link: params.link || '',
      metadata: params.metadata || {},
      isRead: false,
    });
    return doc;
  } catch (error) {
    console.warn('[Notification Helper] Failed to create notification:', error);
    return null;
  }
}

/**
 * Creates a throttled profile view notification so rapid page refreshes do not spam the user's bell.
 */
export async function createProfileViewNotification(
  ownerUserId: string | mongoose.Types.ObjectId,
  profileAlias: string,
  profileTitle: string
) {
  try {
    if (!ownerUserId) return null;
    await connectToDatabase();
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const existingRecent = await Notification.findOne({
      userId: String(ownerUserId),
      type: 'profile_view',
      isRead: false,
      createdAt: { $gte: thirtyMinutesAgo },
      'metadata.alias': profileAlias,
    }).lean();

    if (existingRecent) return null;

    return await Notification.create({
      userId: String(ownerUserId),
      targetRole: 'user',
      title: 'بازدید جدید از پروفایل شما',
      message: `یک بازدیدکننده جدید از کارت هوشمند «${profileTitle || profileAlias}» دیدن نمود.`,
      type: 'profile_view',
      link: '/dashboard/analytics',
      metadata: { alias: profileAlias },
      isRead: false,
    });
  } catch (error) {
    console.warn('[Notification Helper] Failed to log profile view notification:', error);
    return null;
  }
}
