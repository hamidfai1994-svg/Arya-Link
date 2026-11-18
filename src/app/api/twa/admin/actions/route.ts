import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongodb';
import { verifyAndExtractTwaUser } from '@/lib/twa-auth';
import { SystemSettings } from '@/models/systemSettings.model';
import { Profile } from '@/models/Profile.model';
import { Order } from '@/models/Order.model';
import { User } from '@/models/User.model';
import { Admin } from '@/models/Admin.model';
import { SiteContent, DEFAULT_SITE_CONTENT } from '@/models/SiteContent.model';
import { Notification } from '@/models/Notification.model';
import { activateUserSubscriptionFromOrder } from '@/lib/utils/subscription';
import { createPlatformNotification } from '@/lib/notifications';
import { sendUserMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData, actionType, profileId, orderId, newStatus, payload } = body;

    const verified = verifyAndExtractTwaUser(initData, 'admin');
    if (!verified.valid || !verified.tgId) {
      return NextResponse.json(
        { error: verified.error || 'Invalid Hash' },
        { status: 403 }
      );
    }

    const tgId = verified.tgId;
    await connectToDatabase();

    const settings = await SystemSettings.findOne().lean();
    const adminDoc = await Admin.findOne({
      isActive: true,
      $or: [{ telegramChatId: tgId }, { telegramUserId: tgId }],
    }).lean();
    const adminUser = await User.findOne({
      role: { $in: ['admin', 'superadmin', 'financial_admin', 'content_editor'] },
      $or: [{ telegramChatId: tgId }, { telegramUserId: tgId }],
    }).lean();

    const isAuthorized =
      (settings &&
        (settings.telegramInsightsChatId === tgId ||
          settings.telegramSupportChatId === tgId)) ||
      Boolean(adminDoc) ||
      Boolean(adminUser);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not Admin' }, { status: 403 });
    }

    // 1. Toggle User Profile Status (Active / Blocked)
    if (actionType === 'toggleUserStatus') {
      if (!profileId || !mongoose.isValidObjectId(profileId)) {
        return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 });
      }

      const profile = await Profile.findById(profileId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      const currentStatus = profile.isActive !== false;
      profile.isActive = !currentStatus;
      await profile.save();

      return NextResponse.json({
        success: true,
        actionType,
        profileId: profile._id.toString(),
        isActive: profile.isActive,
        message: profile.isActive ? 'حساب کاربری فعال گردید' : 'کاربر مسدود گردید',
      });
    }

    // 2. Toggle User Blue Tick Verification
    if (actionType === 'toggleUserVerify') {
      if (!profileId || !mongoose.isValidObjectId(profileId)) {
        return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 });
      }

      const profile = await Profile.findById(profileId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      const nextVerified = !Boolean(profile.isVerified);
      profile.isVerified = nextVerified;
      profile.verificationStatus = nextVerified ? 'verified' : 'unverified';
      await profile.save();

      if (profile.userId && mongoose.isValidObjectId(String(profile.userId))) {
        await User.updateOne(
          { _id: profile.userId },
          {
            $set: {
              isVerified: nextVerified,
              verificationStatus: nextVerified ? 'verified' : 'unverified',
            },
          }
        );

        await createPlatformNotification({
          userId: String(profile.userId),
          targetRole: 'user',
          title: nextVerified ? 'نشان آبی تایید هویت فعال گردید' : 'تغییر وضعیت تیک آبی',
          message: nextVerified
            ? 'حساب و کارت هوشمند شما توسط مدیریت تایید و نشان آبی دریافت نمود.'
            : 'وضعیت تایید هویت پروفایل شما بازنگری شد.',
          type: 'kyc_update',
          link: '/dashboard/kyc',
        });
      }

      return NextResponse.json({
        success: true,
        actionType,
        profileId: profile._id.toString(),
        isVerified: nextVerified,
        message: nextVerified ? 'تیک آبی کاربر با موفقیت فعال گردید' : 'تیک آبی کاربر برداشته شد',
      });
    }

    // 3. Update User Subscription Plan
    if (actionType === 'updateUserPlan') {
      const targetPlan = payload?.planType || newStatus;
      if (!profileId || !mongoose.isValidObjectId(profileId) || !['free', 'pro', 'vip'].includes(targetPlan)) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
      }

      const profile = await Profile.findById(profileId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      profile.planType = targetPlan;
      await profile.save();

      if (profile.userId && mongoose.isValidObjectId(String(profile.userId))) {
        await User.updateOne(
          { _id: profile.userId },
          {
            $set: {
              planType: targetPlan,
              subscriptionPlan: targetPlan === 'free' ? 'free' : 'pro',
            },
          }
        );
      }

      return NextResponse.json({
        success: true,
        actionType,
        profileId: profile._id.toString(),
        planType: targetPlan,
        message: `اشتراک پروفایل به طرح ${targetPlan.toUpperCase()} تغییر یافت`,
      });
    }

    // 4. Update Order Status
    if (actionType === 'updateOrderStatus') {
      const targetOrderId = orderId || payload?.orderId;
      const targetStatus = newStatus || payload?.newStatus || payload;

      if (!targetOrderId || !mongoose.isValidObjectId(targetOrderId)) {
        return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
      }

      const order = await Order.findById(targetOrderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (
        !['pending', 'pending_payment', 'processing', 'nfc_writing', 'shipping', 'shipped', 'delivered', 'completed', 'cancelled'].includes(
          targetStatus
        )
      ) {
        return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
      }

      order.status = targetStatus;
      order.orderStatus = targetStatus as any;
      if (targetStatus === 'processing' || targetStatus === 'completed' || targetStatus === 'shipped') {
        order.paymentStatus = 'paid';
      }
      await order.save();

      if (order.orderType === 'subscription' && order.paymentStatus === 'paid') {
        try {
          await activateUserSubscriptionFromOrder(order);
        } catch (subErr) {
          console.error('Subscription activation warning:', subErr);
        }
      }

      if (order.userId) {
        await createPlatformNotification({
          userId: String(order.userId),
          targetRole: 'user',
          title: 'تغییر وضعیت سفارش',
          message: `سفارش #${order.orderNumber} به وضعیت «${targetStatus}» تغییر یافت.`,
          type: 'order_update',
          link: '/dashboard/orders',
        });
      }

      return NextResponse.json({
        success: true,
        actionType,
        orderId: order._id.toString(),
        status: order.status,
        message: 'وضعیت سفارش با موفقیت به‌روزرسانی گردید',
      });
    }

    // 5. Settle Delivery Fee
    if (actionType === 'settleDelivery') {
      const targetOrderId = orderId || payload?.orderId || payload;

      if (!targetOrderId || !mongoose.isValidObjectId(targetOrderId)) {
        return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
      }

      const order = await Order.findById(targetOrderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      order.isDeliverySettled = true;
      await order.save();

      return NextResponse.json({
        success: true,
        actionType,
        orderId: order._id.toString(),
        isDeliverySettled: true,
        message: 'تسویه حساب دلیوری با موفقیت ثبت گردید',
      });
    }

    // 6. Content Management: Update Landing Hero Title & Subtitle
    if (actionType === 'updateCmsHero') {
      const { heroTitleHighlight, heroSubtitle } = payload || {};
      let siteContent = await SiteContent.findOne();
      if (!siteContent) {
        siteContent = new SiteContent(DEFAULT_SITE_CONTENT);
      }

      if (!siteContent.hero) {
        siteContent.hero = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT.hero));
      }

      if (typeof heroTitleHighlight === 'string' && heroTitleHighlight.trim()) {
        if (!siteContent.hero.titleHighlight) {
          siteContent.hero.titleHighlight = { fa: '', en: '', ps: '' };
        }
        siteContent.hero.titleHighlight.fa = heroTitleHighlight.trim();
      }
      if (typeof heroSubtitle === 'string' && heroSubtitle.trim()) {
        if (!siteContent.hero.subtitle) {
          siteContent.hero.subtitle = { fa: '', en: '', ps: '' };
        }
        siteContent.hero.subtitle.fa = heroSubtitle.trim();
      }

      siteContent.markModified('hero');
      await siteContent.save();

      return NextResponse.json({
        success: true,
        actionType,
        message: 'محتوای بخش اصلی صفحه نخست با موفقیت ذخیره گردید',
      });
    }

    // 7. Broadcast Platform Notification (+ Telegram Delivery)
    if (actionType === 'broadcastNotification') {
      const title = String(payload?.title || '').trim();
      const messageText = String(payload?.message || '').trim();
      const sendToTelegram = Boolean(payload?.sendToTelegram);

      if (!title || !messageText) {
        return NextResponse.json(
          { error: 'عنوان و متن پیام همگانی الزامی است.' },
          { status: 400 }
        );
      }

      const activeUsers = await User.find({ isActive: { $ne: false } })
        .select('_id telegramChatId')
        .lean();

      if (activeUsers.length > 0) {
        const docs = activeUsers.map((u: any) => ({
          userId: u._id.toString(),
          targetRole: 'user',
          title,
          message: messageText,
          type: 'system',
          link: '/dashboard',
          isRead: false,
        }));
        await Notification.insertMany(docs);
      }

      let tgSentCount = 0;
      if (sendToTelegram) {
        const tgUsers = activeUsers.filter((u: any) => u.telegramChatId);
        for (const u of tgUsers as any[]) {
          const ok = await sendUserMessage(
            u.telegramChatId,
            `📢 <b>${title}</b>\n\n${messageText}`
          );
          if (ok) tgSentCount++;
        }
      }

      return NextResponse.json({
        success: true,
        actionType,
        notifiedUsers: activeUsers.length,
        tgSentCount,
        message: `اطلاعیه برای ${activeUsers.length} کاربر در سایت ثبت گردید${
          sendToTelegram ? ` و به ${tgSentCount} کاربر در تلگرام ارسال شد` : ''
        }.`,
      });
    }

    return NextResponse.json({ error: 'Unknown actionType' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
