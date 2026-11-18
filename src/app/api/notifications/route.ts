import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Notification } from '@/models/Notification.model';
import { User } from '@/models/User.model';
import { Order } from '@/models/Order.model';
import { Message } from '@/models/Message.model';
import { Profile } from '@/models/Profile.model';
import { Lead } from '@/models/Lead.model';

export const dynamic = 'force-dynamic';

function isAdminRole(role?: string): boolean {
  const r = (role || '').toLowerCase();
  return ['superadmin', 'admin', 'content_editor', 'financial_admin'].includes(r);
}

function buildUserQuery(userId: string) {
  const conditions: any[] = [{ userId: String(userId) }];
  if (mongoose.isValidObjectId(userId)) {
    conditions.push({ userId: new mongoose.Types.ObjectId(userId) });
  }
  return { $or: conditions };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const scopeParam = req.nextUrl.searchParams.get('scope') || 'user';
    const userIsAdmin = isAdminRole(session.user.role);
    const effectiveScope = scopeParam === 'admin' && userIsAdmin ? 'admin' : 'user';

    if (effectiveScope === 'admin') {
      const adminFilter = {
        $or: [
          { userId: 'admin' },
          { targetRole: 'admin' },
          { userId: String(session.user.id) },
        ],
      };

      let notifications = await Notification.find(adminFilter)
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

      // Auto-seed initial real notifications from latest platform records if empty
      if (notifications.length === 0) {
        const [latestUsers, latestOrders, latestMessages] = await Promise.all([
          User.find().sort({ createdAt: -1 }).limit(3).select('name email occupation createdAt').lean(),
          Order.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(2).select('orderNumber customerName totalPrice currency createdAt').lean(),
          Message.find().sort({ createdAt: -1 }).limit(2).select('name profileAlias message createdAt').lean(),
        ]);

        const seedDocs: any[] = [];

        latestUsers.forEach((u: any) => {
          seedDocs.push({
            userId: 'admin',
            targetRole: 'admin',
            title: 'ثبت‌نام کاربر جدید',
            message: `${u.name || 'کاربر جدید'} (${u.email}) در پلتفرم ثبت‌نام نمود.`,
            type: 'new_user',
            link: '/admin/users',
            isRead: false,
            createdAt: u.createdAt || new Date(),
          });
        });

        latestOrders.forEach((o: any) => {
          seedDocs.push({
            userId: 'admin',
            targetRole: 'admin',
            title: 'سفارش جدید ثبت گردید',
            message: `سفارش #${o.orderNumber} توسط ${o.customerName || 'مشتری'} به مبلغ ${Number(o.totalPrice || 0).toLocaleString('en-US')} ${o.currency || 'AFN'}.`,
            type: 'new_order',
            link: '/admin/orders',
            isRead: false,
            createdAt: o.createdAt || new Date(),
          });
        });

        latestMessages.forEach((m: any) => {
          seedDocs.push({
            userId: 'admin',
            targetRole: 'admin',
            title: 'تیکت و پیام جدید',
            message: `پیام جدید از ${m.name || 'بازدیدکننده'}: «${String(m.message || '').slice(0, 60)}»`,
            type: 'ticket',
            link: '/admin/reports',
            isRead: false,
            createdAt: m.createdAt || new Date(),
          });
        });

        if (seedDocs.length > 0) {
          await Notification.insertMany(seedDocs);
          notifications = await Notification.find(adminFilter)
            .sort({ createdAt: -1 })
            .limit(30)
            .lean();
        }
      }

      const unreadCount = notifications.filter((n: any) => !n.isRead).length;

      return NextResponse.json({
        success: true,
        scope: 'admin',
        notifications: notifications.map((n: any) => ({
          id: n._id.toString(),
          title: n.title,
          message: n.message,
          type: n.type,
          link: n.link || '',
          isRead: Boolean(n.isRead),
          createdAt: n.createdAt,
        })),
        unreadCount,
      });
    }

    // User Scope
    const userFilter = buildUserQuery(session.user.id);
    let notifications = await Notification.find(userFilter)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    if (notifications.length === 0) {
      const userIdStr = String(session.user.id);
      const userProfiles = await Profile.find({
        $or: [
          { userId: userIdStr },
          ...(mongoose.isValidObjectId(userIdStr) ? [{ userId: new mongoose.Types.ObjectId(userIdStr) }] : []),
        ],
      })
        .select('_id alias displayName viewsCount')
        .lean();

      const profileIds = userProfiles.map((p: any) => p._id);
      const aliases = userProfiles.map((p: any) => p.alias).filter(Boolean);

      const [recentLeads, recentMsgs] = await Promise.all([
        profileIds.length > 0
          ? Lead.find({ profileId: { $in: profileIds } }).sort({ createdAt: -1 }).limit(3).lean()
          : Promise.resolve([]),
        aliases.length > 0
          ? Message.find({ profileAlias: { $in: aliases } }).sort({ createdAt: -1 }).limit(2).lean()
          : Promise.resolve([]),
      ]);

      const seedDocs: any[] = [];

      const totalViews = userProfiles.reduce((acc: number, p: any) => acc + (p.viewsCount || 0), 0);
      if (totalViews > 0) {
        seedDocs.push({
          userId: userIdStr,
          targetRole: 'user',
          title: 'گزارش بازدید از پروفایل',
          message: `مینی‌سایت و کارت‌های هوشمند شما تا کنون ${totalViews.toLocaleString('en-US')} مرتبه بازدید گردیده است.`,
          type: 'profile_view',
          link: '/dashboard/analytics',
          isRead: false,
        });
      }

      recentLeads.forEach((l: any) => {
        seedDocs.push({
          userId: userIdStr,
          targetRole: 'user',
          title: 'مخاطب و پیام جدید در فرم تماس',
          message: `${l.name || 'بازدیدکننده'} پیامی برایتان ارسال نمود: «${String(l.message || '').slice(0, 60)}»`,
          type: 'new_lead',
          link: '/dashboard/editor',
          isRead: false,
          createdAt: l.createdAt || new Date(),
        });
      });

      if (recentLeads.length === 0 && recentMsgs.length > 0) {
        recentMsgs.forEach((m: any) => {
          seedDocs.push({
            userId: userIdStr,
            targetRole: 'user',
            title: 'پیام جدید در مینی‌سایت',
            message: `${m.name || 'مخاطب'}: «${String(m.message || '').slice(0, 60)}»`,
            type: 'new_lead',
            link: '/dashboard/editor',
            isRead: false,
            createdAt: m.createdAt || new Date(),
          });
        });
      }

      seedDocs.push({
        userId: userIdStr,
        targetRole: 'user',
        title: 'خوش آمدید به آریا لینک',
        message: 'حساب کاربری شما آماده است. برای دریافت پیام‌های فوری، حساب خود را به ربات تلگرام وصل نمایید.',
        type: 'system',
        link: '/dashboard/account',
        isRead: false,
      });

      await Notification.insertMany(seedDocs);
      notifications = await Notification.find(userFilter)
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    }

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      scope: 'user',
      notifications: notifications.map((n: any) => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link || '',
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت اعلانات.', error: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { notificationId, markAll, scope } = body;

    const userIsAdmin = isAdminRole(session.user.role);
    const isAdminScope = scope === 'admin' && userIsAdmin;

    if (markAll) {
      const filter = isAdminScope
        ? {
            $or: [
              { userId: 'admin' },
              { targetRole: 'admin' },
              { userId: String(session.user.id) },
            ],
          }
        : buildUserQuery(session.user.id);

      await Notification.updateMany(filter, { $set: { isRead: true } });

      return NextResponse.json({
        success: true,
        message: 'تمامی اعلانات به عنوان خوانده‌شده علامت‌گذاری گردید.',
      });
    }

    if (notificationId && mongoose.isValidObjectId(notificationId)) {
      const ownershipFilter = isAdminScope
        ? { _id: notificationId }
        : { _id: notificationId, ...buildUserQuery(session.user.id) };

      await Notification.updateOne(ownershipFilter, { $set: { isRead: true } });

      return NextResponse.json({
        success: true,
        message: 'اعلان به عنوان خوانده‌شده ثبت گردید.',
      });
    }

    return NextResponse.json({ success: false, message: 'پارامتر نامعتبر است.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: false, message: 'خطا در به‌روزرسانی اعلان.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 401 });
    }

    await connectToDatabase();
    const scopeParam = req.nextUrl.searchParams.get('scope') || 'user';
    const userIsAdmin = isAdminRole(session.user.role);
    const isAdminScope = scopeParam === 'admin' && userIsAdmin;

    const filter = isAdminScope
      ? {
          isRead: true,
          $or: [
            { userId: 'admin' },
            { targetRole: 'admin' },
            { userId: String(session.user.id) },
          ],
        }
      : { isRead: true, ...buildUserQuery(session.user.id) };

    await Notification.deleteMany(filter);

    return NextResponse.json({
      success: true,
      message: 'اعلانات خوانده‌شده پاک‌سازی گردید.',
    });
  } catch (error: any) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ success: false, message: 'خطا در حذف اعلانات.' }, { status: 500 });
  }
}
