import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';
import { Message } from '@/models/Message.model';
import { Lead } from '@/models/Lead.model';
import { createPlatformNotification } from '@/lib/notifications';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import {
  getUserBotToken,
  getSecureMiniAppUrl,
  sendTelegramInteractiveMessage,
  answerTelegramCallbackQuery,
  editTelegramMessageText,
  fetchTelegramBotUsername,
  registerTelegramWebhook,
  TelegramReplyMarkup,
} from '@/lib/telegram';
import { getBaseUrl } from '@/lib/base-url';

export const dynamic = 'force-dynamic';

async function resolveBoundUserAndProfile(fromId: string, chatId: string) {
  const user = await User.findOne({
    $or: [
      { telegramChatId: chatId },
      { telegramChatId: fromId },
      { telegramUserId: fromId },
    ],
  }).lean();

  let profile: any = null;
  if (user) {
    profile = await Profile.findOne({
      $or: [
        { userId: user._id },
        { userId: user._id.toString() },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  if (!profile) {
    profile = await Profile.findOne({
      $or: [{ crmTelegramChatId: chatId }, { crmTelegramChatId: fromId }],
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  return { user, profile };
}

function getUserWelcomeKeyboard(): TelegramReplyMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: '📱 باز کردن مینی‌اپ مدیریت پروفایل',
          web_app: { url: getSecureMiniAppUrl('/twa/user') },
        },
      ],
      [
        { text: '📊 آمار بازدید کارت من', callback_data: 'user_quick_stats' },
        { text: '📬 آخرین پیام‌های دریافتی', callback_data: 'user_recent_leads' },
      ],
      [{ text: '🔗 دریافت لینک کارت هوشمند', callback_data: 'user_my_link' }],
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const token = getUserBotToken();
    const action = req.nextUrl.searchParams.get('action');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'توکن ربات کاربران تنظیم نگردیده است.' },
        { status: 400 }
      );
    }

    if (action === 'setWebhook') {
      const baseUrl = getBaseUrl();
      const webhookUrl = `${baseUrl}/api/telegram/user-bot`;
      const result = await registerTelegramWebhook(token, webhookUrl);
      return NextResponse.json({
        success: result.ok,
        webhookUrl,
        description: result.description,
      });
    }

    const username = await fetchTelegramBotUsername(token);
    return NextResponse.json({
      success: true,
      botUsername: username,
      webhookEndpoint: `${getBaseUrl()}/api/telegram/user-bot`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getUserBotToken();
    if (!token) {
      return NextResponse.json({ ok: true, warning: 'User bot token not configured' });
    }

    const update = await req.json().catch(() => null);
    if (!update) {
      return NextResponse.json({ ok: true });
    }

    await connectToDatabase();

    // =========================================================================
    // 1. HANDLE TEXT MESSAGES & /start BINDING
    // =========================================================================
    if (update.message) {
      const msg = update.message;
      const chatId = String(msg.chat?.id || '');
      const fromId = String(msg.from?.id || chatId);
      const fromUsername = msg.from?.username ? `@${msg.from.username}` : '';
      const text = (msg.text || '').trim();

      if (!chatId) return NextResponse.json({ ok: true });

      if (text.startsWith('/start')) {
        const parts = text.split(/\s+/);
        const rawPayload = parts[1]?.trim() || '';

        if (rawPayload && rawPayload !== 'crm') {
          const now = new Date();
          const targetUser = await User.findOne({
            telegramBindToken: rawPayload,
            $or: [
              { telegramBindTokenExpires: { $gt: now } },
              { telegramBindTokenExpires: null },
            ],
          });

          if (targetUser) {
            targetUser.telegramChatId = chatId;
            targetUser.telegramUserId = fromId;
            targetUser.telegramUsername = fromUsername;
            targetUser.telegramBindToken = '';
            targetUser.telegramBindTokenExpires = null;
            targetUser.telegramConnectedAt = new Date();
            await targetUser.save();

            // Synchronize all owned profiles to receive contact form leads directly
            await Profile.updateMany(
              {
                $or: [
                  { userId: targetUser._id },
                  { userId: targetUser._id.toString() },
                ],
              },
              {
                $set: {
                  crmTelegramChatId: chatId,
                  crmTelegramEnable: true,
                },
              }
            );

            await createPlatformNotification({
              userId: targetUser._id.toString(),
              targetRole: 'user',
              title: 'اتصال موفق به ربات تلگرام',
              message: `حساب کاربری شما موفقانه به تلگرام (${fromUsername || chatId}) متصل گردید. پیام‌های مینی‌سایت به صورت زنده برایتان ارسال می‌گردند.`,
              type: 'system',
              link: '/dashboard/account',
            });

            await sendTelegramInteractiveMessage(
              token,
              chatId,
              `🎉 <b>خوش آمدید ${targetUser.name} گرامی!</b>\n\nحساب کاربری شما در <b>آریا لینک</b> با موفقیت کامل به تلگرام شما متصل گردید.\n\n✅ از این پس تمام پیام‌های فرم تماس مینی‌سایت شما بلافاصله به همین ربات فرستاده می‌شوند.\n📱 همچنین می‌توانید مستقیماً از طریق دکمه ذیل وارد مینی‌اپ شده و پروفایل، لینک‌ها و آمار بازدید خود را مدیریت نمایید:`,
              getUserWelcomeKeyboard()
            );
            return NextResponse.json({ ok: true });
          }
        }

        // Handle normal /start or /start crm
        const { user, profile } = await resolveBoundUserAndProfile(fromId, chatId);
        if (user || profile) {
          const displayName =
            user?.name ||
            getLocalizedText(profile?.displayName, 'da', '') ||
            msg.from?.first_name ||
            'کاربر گرامی';
          await sendTelegramInteractiveMessage(
            token,
            chatId,
            `👋 سلام <b>${displayName}</b> عزیز!\n\nربات اختصاصی مدیریت کارت هوشمند <b>آریا لینک</b> در خدمت شماست.\nبا زدن دکمه ذیل، می‌توانید مینی‌اپ پروفایل خود را باز کرده و لینک‌ها، بیوگرافی و آمار بازدیدتان را مدیریت نمایید:`,
            getUserWelcomeKeyboard()
          );
        } else {
          await sendTelegramInteractiveMessage(
            token,
            chatId,
            `👋 سلام! به ربات هوشمند <b>آریا لینک</b> خوش آمدید.\n\nبرای اتصال خودکار کارت هوشمند و دریافت پیام‌های فرم تماس در تلگرام:\n۱. وارد <b>حساب کاربری خود در سایت</b> شوید.\n۲. در بخش <b>حساب کاربری / تنظیمات کارت</b> بالای دکمه <b>«اتصال به تلگرام»</b> کلیک کنید.\n\n🆔 <b>نمبر چت شما (Chat ID):</b> <code>${chatId}</code>`,
            {
              inline_keyboard: [
                [
                  {
                    text: '📱 باز کردن مینی‌اپ مدیریت پروفایل',
                    web_app: { url: getSecureMiniAppUrl('/twa/user') },
                  },
                ],
                [
                  {
                    text: '🌐 ورود به داشبورد وب آریا لینک',
                    url: `${getBaseUrl()}/dashboard/account`,
                  },
                ],
              ],
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      if (text === '/stats' || text === '/profile') {
        const { profile } = await resolveBoundUserAndProfile(fromId, chatId);
        if (!profile) {
          await sendTelegramInteractiveMessage(
            token,
            chatId,
            `⚠️ پروفایل متصل به تلگرام شما هنوز یافت نگردید. لطفاً از داشبورد سایت گزینه <b>اتصال به تلگرام</b> را بزنید.\n\n🆔 نمبر چت شما: <code>${chatId}</code>`,
            { inline_keyboard: [] }
          );
          return NextResponse.json({ ok: true });
        }

        const profileName = getLocalizedText(profile.displayName, 'da', profile.alias);
        const totalClicks = Array.isArray(profile.links)
          ? profile.links.reduce((s: number, l: any) => s + (l.clickCount || 0), 0)
          : 0;

        await sendTelegramInteractiveMessage(
          token,
          chatId,
          `📊 <b>آمار زنده کارت «${profileName}»</b>\n\n👁️ <b>مجموع بازدید پروفایل:</b> ${(profile.viewsCount || 0).toLocaleString('en-US')}\n🖱️ <b>مجموع کلیک روی لینک‌ها:</b> ${totalClicks.toLocaleString('en-US')}\n📩 <b>پیام‌ها و مخاطبین جذب‌شده:</b> ${(profile.leadsCount || 0).toLocaleString('en-US')}\n🔗 <b>نشانی کارت:</b> ${getBaseUrl()}/${profile.alias}`,
          getUserWelcomeKeyboard()
        );
        return NextResponse.json({ ok: true });
      }

      await sendTelegramInteractiveMessage(
        token,
        chatId,
        `برای مدیریت پروفایل، ویرایش لینک‌ها و مشاهده پیام‌ها از دکمه ذیل استفاده نمایید:`,
        getUserWelcomeKeyboard()
      );
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 2. HANDLE CALLBACK QUERIES (LEAD STATUS ACTIONS & QUICK VIEWS)
    // =========================================================================
    if (update.callback_query) {
      const cb = update.callback_query;
      const cbId = String(cb.id);
      const data = String(cb.data || '');
      const chatId = String(cb.message?.chat?.id || cb.from?.id || '');
      const fromId = String(cb.from?.id || chatId);
      const messageId = cb.message?.message_id;
      const originalText = cb.message?.text || '';

      const [action, targetId] = data.split(':');

      // Update Lead/Message status to contacted or resolved
      if ((action === 'lead_contacted' || action === 'lead_resolved') && targetId && mongoose.isValidObjectId(targetId)) {
        const newStatus = action === 'lead_resolved' ? 'resolved' : 'contacted';
        const statusLabel = newStatus === 'resolved' ? '✅ تکمیل‌شده' : '📞 تماس گرفته شد';

        let updatedDoc = await Message.findByIdAndUpdate(
          targetId,
          { $set: { status: newStatus, isRead: true } },
          { new: true }
        );
        if (!updatedDoc) {
          await Lead.findByIdAndUpdate(targetId, { $set: { status: newStatus } });
        }

        await answerTelegramCallbackQuery(token, cbId, `وضعیت مخاطب به «${statusLabel}» تغییر یافت.`);
        if (messageId) {
          await editTelegramMessageText(
            token,
            chatId,
            messageId,
            `${originalText}\n\n━━━━━━━━━━━━━━━\n📌 <b>وضعیت فعلی:</b> ${statusLabel}`,
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
        return NextResponse.json({ ok: true });
      }

      const { profile } = await resolveBoundUserAndProfile(fromId, chatId);

      if (action === 'user_quick_stats') {
        if (!profile) {
          await answerTelegramCallbackQuery(token, cbId, 'حساب شما هنوز به پروفایل متصل نشده است.', true);
          return NextResponse.json({ ok: true });
        }
        const profileName = getLocalizedText(profile.displayName, 'da', profile.alias);
        const totalClicks = Array.isArray(profile.links)
          ? profile.links.reduce((s: number, l: any) => s + (l.clickCount || 0), 0)
          : 0;

        await answerTelegramCallbackQuery(token, cbId, 'آمار کارت شما بارگذاری شد');
        await sendTelegramInteractiveMessage(
          token,
          chatId,
          `📊 <b>آمار زنده کارت «${profileName}»</b>\n\n👁️ <b>کل بازدیدها:</b> ${(profile.viewsCount || 0).toLocaleString('en-US')}\n🖱️ <b>کلیک لینک‌ها:</b> ${totalClicks.toLocaleString('en-US')}\n📥 <b>تعداد پیام‌ها:</b> ${(profile.leadsCount || 0).toLocaleString('en-US')}`,
          getUserWelcomeKeyboard()
        );
        return NextResponse.json({ ok: true });
      }

      if (action === 'user_recent_leads') {
        if (!profile) {
          await answerTelegramCallbackQuery(token, cbId, 'حساب شما متصل نیست.', true);
          return NextResponse.json({ ok: true });
        }
        const recent = await Message.find({ profileAlias: profile.alias })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        await answerTelegramCallbackQuery(
          token,
          cbId,
          recent.length > 0 ? `${recent.length} پیام اخیر نمایش داده شد` : 'پیامی یافت نشد'
        );

        if (recent.length === 0) {
          await sendTelegramInteractiveMessage(
            token,
            chatId,
            `📭 تا کنون پیامی از طریق فرم تماس مینی‌سایت شما ثبت نگردیده است.`,
            getUserWelcomeKeyboard()
          );
        } else {
          for (const m of recent as any[]) {
            await sendTelegramInteractiveMessage(
              token,
              chatId,
              `📩 <b>پیام از: ${m.name}</b>\n📞 ${m.phone || m.email || 'بدون شماره'}\n💬 ${m.message}`,
              {
                inline_keyboard: [
                  [
                    { text: '📞 تماس گرفته شد', callback_data: `lead_contacted:${m._id.toString()}` },
                    { text: '✅ تکمیل شد', callback_data: `lead_resolved:${m._id.toString()}` },
                  ],
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
        return NextResponse.json({ ok: true });
      }

      if (action === 'user_my_link') {
        if (!profile) {
          await answerTelegramCallbackQuery(token, cbId, 'پروفایل متصل یافت نشد.', true);
          return NextResponse.json({ ok: true });
        }
        const url = `${getBaseUrl()}/${profile.alias}`;
        await answerTelegramCallbackQuery(token, cbId, 'لینک کارت ارسال گردید');
        await sendTelegramInteractiveMessage(
          token,
          chatId,
          `🔗 <b>لینک اختصاصی کارت هوشمند شما:</b>\n${url}\n\nمی‌توانید این لینک را کپی کرده یا با زدن دکمه ذیل مستقیماً در مینی‌اپ مدیریت نمایید:`,
          {
            inline_keyboard: [
              [{ text: '🌐 مشاهده کارت در مرورگر', url }],
              [
                {
                  text: '📱 باز کردن مینی‌اپ مدیریت پروفایل',
                  web_app: { url: getSecureMiniAppUrl('/twa/user') },
                },
              ],
            ],
          }
        );
        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(token, cbId);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('User Bot Webhook Error:', error);
    return NextResponse.json({ ok: true, error: error?.message });
  }
}
