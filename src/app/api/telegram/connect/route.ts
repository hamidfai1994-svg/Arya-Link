import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Admin } from '@/models/Admin.model';
import { Profile } from '@/models/Profile.model';
import { SystemSettings } from '@/models/systemSettings.model';
import { createPlatformNotification } from '@/lib/notifications';
import {
  getAdminBotToken,
  getUserBotToken,
  getSecureMiniAppUrl,
  fetchTelegramBotUsername,
  registerTelegramWebhook,
  sendTelegramInteractiveMessage,
} from '@/lib/telegram';
import { getBaseUrl } from '@/lib/base-url';

export const dynamic = 'force-dynamic';

function isAdminRole(role?: string): boolean {
  const r = (role || '').toLowerCase();
  return ['superadmin', 'admin', 'financial_admin', 'content_editor'].includes(r);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select('-password').lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر مورد نظر یافت نگردید.' },
        { status: 404 }
      );
    }

    const [profile, adminDoc, settings, resolvedUserBot, resolvedAdminBot] = await Promise.all([
      Profile.findOne({
        $or: [{ userId: user._id }, { userId: user._id.toString() }],
      })
        .sort({ createdAt: 1 })
        .select('crmTelegramChatId crmTelegramEnable alias')
        .lean(),
      isAdminRole(user.role)
        ? Admin.findOne({
            $or: [{ userId: user._id }, { email: user.email }],
          }).lean()
        : Promise.resolve(null),
      isAdminRole(user.role) ? SystemSettings.findOne().lean() : Promise.resolve(null),
      fetchTelegramBotUsername(getUserBotToken()),
      fetchTelegramBotUsername(getAdminBotToken()),
    ]);

    const userBotUsername =
      resolvedUserBot ||
      process.env.NEXT_PUBLIC_TELEGRAM_USER_BOT_USERNAME ||
      'AryaLinkBot';
    const adminBotUsername =
      resolvedAdminBot ||
      process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_BOT_USERNAME ||
      'AryaLinkAdminBot';

    const effectiveChatId =
      user.telegramChatId ||
      adminDoc?.telegramChatId ||
      profile?.crmTelegramChatId ||
      '';

    const isConnected = Boolean(effectiveChatId);

    return NextResponse.json({
      success: true,
      isConnected,
      telegramChatId: effectiveChatId,
      telegramUserId: user.telegramUserId || adminDoc?.telegramUserId || '',
      telegramUsername: user.telegramUsername || adminDoc?.telegramUsername || '',
      telegramConnectedAt: user.telegramConnectedAt || adminDoc?.telegramConnectedAt || null,
      adminChatIdConfigured: settings?.telegramInsightsChatId || settings?.telegramSupportChatId || '',
      userBotUsername,
      adminBotUsername,
      miniAppUserUrl: getSecureMiniAppUrl('/twa/user'),
      miniAppAdminUrl: getSecureMiniAppUrl('/twa/admin'),
    });
  } catch (error: any) {
    console.error('Telegram connect GET error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بررسی وضعیت اتصال تلگرام.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد سیستم شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'generate_token';
    const targetBot: 'admin' | 'user' =
      body.targetBot === 'admin' && isAdminRole(session.user.role) ? 'admin' : 'user';

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'حساب کاربری یافت نگردید.' },
        { status: 404 }
      );
    }

    // =========================================================================
    // 1. GENERATE UNIQUE ONE-TIME BINDING TOKEN & DEEP LINK
    // =========================================================================
    if (action === 'generate_token') {
      const token = `bind_${crypto.randomBytes(12).toString('hex')}`;
      const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      user.telegramBindToken = token;
      user.telegramBindTokenExpires = expires;
      await user.save();

      if (targetBot === 'admin' && isAdminRole(user.role)) {
        await Admin.findOneAndUpdate(
          { email: user.email },
          {
            $set: {
              userId: user._id,
              name: user.name,
              email: user.email,
              role: user.role as any,
              telegramBindToken: token,
              telegramBindTokenExpires: expires,
              isActive: true,
            },
          },
          { upsert: true }
        );
      }

      const rawToken = targetBot === 'admin' ? getAdminBotToken() : getUserBotToken();
      const liveUsername = await fetchTelegramBotUsername(rawToken);
      const botUsername =
        liveUsername ||
        (targetBot === 'admin'
          ? process.env.NEXT_PUBLIC_TELEGRAM_ADMIN_BOT_USERNAME || 'AryaLinkAdminBot'
          : process.env.NEXT_PUBLIC_TELEGRAM_USER_BOT_USERNAME || 'AryaLinkBot');

      const deepLink = `https://t.me/${botUsername}?start=${token}`;

      return NextResponse.json({
        success: true,
        token,
        botUsername,
        deepLink,
        startCommand: `/start ${token}`,
        expiresAt: expires.toISOString(),
        message: 'لینک اتصال اختصاصی با موفقیت ایجاد گردید.',
      });
    }

    // =========================================================================
    // 2. MANUAL CHAT ID BINDING FALLBACK
    // =========================================================================
    if (action === 'manual_bind') {
      const cleanChatId = String(body.chatId || '').trim();
      if (!cleanChatId) {
        return NextResponse.json(
          { success: false, message: 'لطفاً نمبر چت (Chat ID) تلگرام خود را درج نمایید.' },
          { status: 400 }
        );
      }

      user.telegramChatId = cleanChatId;
      user.telegramUserId = cleanChatId;
      user.telegramConnectedAt = new Date();
      await user.save();

      await Profile.updateMany(
        {
          $or: [{ userId: user._id }, { userId: user._id.toString() }],
        },
        {
          $set: {
            crmTelegramChatId: cleanChatId,
            crmTelegramEnable: true,
          },
        }
      );

      if (targetBot === 'admin' && isAdminRole(user.role)) {
        await Admin.findOneAndUpdate(
          { email: user.email },
          {
            $set: {
              userId: user._id,
              name: user.name,
              email: user.email,
              role: user.role as any,
              telegramChatId: cleanChatId,
              telegramUserId: cleanChatId,
              telegramConnectedAt: new Date(),
              isActive: true,
            },
          },
          { upsert: true }
        );

        let settings = await SystemSettings.findOne();
        if (!settings) settings = new SystemSettings({});
        settings.telegramInsightsChatId = cleanChatId;
        if (!settings.telegramSupportChatId) {
          settings.telegramSupportChatId = cleanChatId;
        }
        settings.telegramBotsActive = true;
        await settings.save();

        const adminToken = getAdminBotToken();
        if (adminToken) {
          await sendTelegramInteractiveMessage(
            adminToken,
            cleanChatId,
            `✅ <b>حساب مدیریت شما به این چت متصل گردید!</b>\n\nهم‌اکنون می‌توانید مینی‌اپ مرکز فرماندهی را از دکمه ذیل باز نمایید:`,
            {
              inline_keyboard: [
                [
                  {
                    text: '📱 باز کردن مینی‌اپ مدیریت',
                    web_app: { url: getSecureMiniAppUrl('/twa/admin') },
                  },
                ],
              ],
            }
          );
        }
      } else {
        const userToken = getUserBotToken();
        if (userToken) {
          await sendTelegramInteractiveMessage(
            userToken,
            cleanChatId,
            `✅ <b>اتصال حساب کاربری آریا لینک تایید گردید!</b>\n\nتمام پیام‌های فرم تماس مینی‌سایت به این چت ارسال می‌شوند:`,
            {
              inline_keyboard: [
                [
                  {
                    text: '📱 باز کردن مینی‌اپ مدیریت پروفایل',
                    web_app: { url: getSecureMiniAppUrl('/twa/user') },
                  },
                ],
              ],
            }
          );
        }
      }

      await createPlatformNotification({
        userId: targetBot === 'admin' ? 'admin' : user._id.toString(),
        targetRole: targetBot === 'admin' ? 'admin' : 'user',
        title: 'همگام‌سازی موفق با تلگرام',
        message: `اکانت شما با شناسه تلگرام ${cleanChatId} متصل گردید.`,
        type: 'system',
        link: targetBot === 'admin' ? '/admin/system' : '/dashboard/account',
      });

      return NextResponse.json({
        success: true,
        telegramChatId: cleanChatId,
        message: 'حساب تلگرام شما با موفقیت متصل گردید.',
      });
    }

    // =========================================================================
    // 3. SET WEBHOOKS AUTOMATICALLY (ADMIN ONLY)
    // =========================================================================
    if (action === 'set_webhooks') {
      if (!isAdminRole(session.user.role)) {
        return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
      }

      const baseUrl = getBaseUrl();
      const adminToken = getAdminBotToken();
      const userToken = getUserBotToken();

      const [adminWebhook, userWebhook] = await Promise.all([
        registerTelegramWebhook(adminToken, `${baseUrl}/api/telegram/admin-bot`),
        registerTelegramWebhook(userToken, `${baseUrl}/api/telegram/user-bot`),
      ]);

      return NextResponse.json({
        success: adminWebhook.ok || userWebhook.ok,
        baseUrl,
        adminWebhook,
        userWebhook,
        message:
          adminWebhook.ok && userWebhook.ok
            ? 'وب‌هوک‌های ربات ادمین و کاربر با موفقیت در تلگرام ثبت گردید.'
            : 'ثبت وب‌هوک با هشدار مواجه شد. مطمئن شوید آدرس سایت HTTPS معتبر دارد.',
      });
    }

    return NextResponse.json({ success: false, message: 'عملیات نامعتبر است.' }, { status: 400 });
  } catch (error: any) {
    console.error('Telegram connect POST error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'خطا در برقراری اتصال تلگرام.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 401 });
    }

    await connectToDatabase();

    await User.updateOne(
      { _id: session.user.id },
      {
        $set: {
          telegramChatId: '',
          telegramUserId: '',
          telegramUsername: '',
          telegramBindToken: '',
          telegramBindTokenExpires: null,
        },
      }
    );

    const uidConditions: any[] = [{ userId: String(session.user.id) }];
    if (mongoose.isValidObjectId(session.user.id)) {
      uidConditions.push({ userId: new mongoose.Types.ObjectId(session.user.id) });
    }

    await Profile.updateMany(
      { $or: uidConditions },
      {
        $set: {
          crmTelegramEnable: false,
          crmTelegramChatId: '',
        },
      }
    );

    if (isAdminRole(session.user.role)) {
      await Admin.updateMany(
        { $or: [{ userId: session.user.id }, { userId: String(session.user.id) }] },
        { $set: { telegramChatId: '', telegramUserId: '', telegramBindToken: '' } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'اتصال تلگرام با موفقیت لغو گردید.',
    });
  } catch (error: any) {
    console.error('Telegram connect DELETE error:', error);
    return NextResponse.json({ success: false, message: 'خطا در قطع اتصال.' }, { status: 500 });
  }
}
