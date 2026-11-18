import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Admin } from '@/models/Admin.model';
import { Profile } from '@/models/Profile.model';
import { Order } from '@/models/Order.model';
import { Message } from '@/models/Message.model';
import { SystemSettings } from '@/models/systemSettings.model';
import { activateUserSubscriptionFromOrder } from '@/lib/utils/subscription';
import { createPlatformNotification } from '@/lib/notifications';
import {
  getAdminBotToken,
  getSecureMiniAppUrl,
  sendTelegramInteractiveMessage,
  answerTelegramCallbackQuery,
  editTelegramMessageText,
  fetchTelegramBotUsername,
  registerTelegramWebhook,
  sendUserMessage,
  TelegramReplyMarkup,
} from '@/lib/telegram';
import { getBaseUrl } from '@/lib/base-url';

export const dynamic = 'force-dynamic';

async function isAuthorizedAdminChat(tgId: string, chatId: string): Promise<boolean> {
  const settings = await SystemSettings.findOne().lean();
  if (
    settings &&
    (settings.telegramInsightsChatId === chatId ||
      settings.telegramInsightsChatId === tgId ||
      settings.telegramSupportChatId === chatId ||
      settings.telegramSupportChatId === tgId)
  ) {
    return true;
  }

  const adminRecord = await Admin.findOne({
    isActive: true,
    $or: [
      { telegramChatId: chatId },
      { telegramChatId: tgId },
      { telegramUserId: tgId },
    ],
  }).lean();
  if (adminRecord) return true;

  const adminUser = await User.findOne({
    role: { $in: ['admin', 'superadmin', 'financial_admin', 'content_editor'] },
    $or: [
      { telegramChatId: chatId },
      { telegramChatId: tgId },
      { telegramUserId: tgId },
    ],
  }).lean();

  return Boolean(adminUser);
}

function getAdminWelcomeKeyboard(): TelegramReplyMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: '📱 باز کردن مینی‌اپ مدیریت پلتفرم',
          web_app: { url: getSecureMiniAppUrl('/twa/admin') },
        },
      ],
      [
        { text: '📊 آمار فوری پلتفرم', callback_data: 'admin_quick_stats' },
        { text: '🛒 سفارشات در انتظار', callback_data: 'admin_recent_orders' },
      ],
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const token = getAdminBotToken();
    const action = req.nextUrl.searchParams.get('action');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'توکن ربات ادمین در متغیرهای محیطی تنظیم نگردیده است.' },
        { status: 400 }
      );
    }

    if (action === 'setWebhook') {
      const baseUrl = getBaseUrl();
      const webhookUrl = `${baseUrl}/api/telegram/admin-bot`;
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
      webhookEndpoint: `${getBaseUrl()}/api/telegram/admin-bot`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAdminBotToken();
    if (!token) {
      return NextResponse.json({ ok: true, warning: 'Admin bot token not configured' });
    }

    const update = await req.json().catch(() => null);
    if (!update) {
      return NextResponse.json({ ok: true });
    }

    await connectToDatabase();

    // =========================================================================
    // 1. HANDLE INCOMING TEXT MESSAGES & COMMANDS
    // =========================================================================
    if (update.message) {
      const msg = update.message;
      const chatId = String(msg.chat?.id || '');
      const fromId = String(msg.from?.id || chatId);
      const fromUsername = msg.from?.username ? `@${msg.from.username}` : '';
      const text = (msg.text || '').trim();

      if (!chatId) return NextResponse.json({ ok: true });

      // Handle /start and /start <token>
      if (text.startsWith('/start')) {
        const parts = text.split(/\s+/);
        const rawPayload = parts[1]?.trim() || '';

        if (rawPayload) {
          // Lookup bind token on Admin or Admin User
          const now = new Date();
          const matchedAdminDoc = await Admin.findOne({
            telegramBindToken: rawPayload,
            $or: [
              { telegramBindTokenExpires: { $gt: now } },
              { telegramBindTokenExpires: null },
            ],
          });

          const matchedAdminUser = await User.findOne({
            telegramBindToken: rawPayload,
            role: { $in: ['admin', 'superadmin', 'financial_admin', 'content_editor'] },
            $or: [
              { telegramBindTokenExpires: { $gt: now } },
              { telegramBindTokenExpires: null },
            ],
          });

          if (matchedAdminDoc || matchedAdminUser) {
            const adminName = matchedAdminUser?.name || matchedAdminDoc?.name || msg.from?.first_name || 'مدیر سیستم';

            if (matchedAdminUser) {
              matchedAdminUser.telegramChatId = chatId;
              matchedAdminUser.telegramUserId = fromId;
              matchedAdminUser.telegramUsername = fromUsername;
              matchedAdminUser.telegramBindToken = '';
              matchedAdminUser.telegramBindTokenExpires = null;
              matchedAdminUser.telegramConnectedAt = new Date();
              await matchedAdminUser.save();
            }

            if (matchedAdminDoc) {
              matchedAdminDoc.telegramChatId = chatId;
              matchedAdminDoc.telegramUserId = fromId;
              matchedAdminDoc.telegramUsername = fromUsername;
              matchedAdminDoc.telegramBindToken = '';
              matchedAdminDoc.telegramBindTokenExpires = null;
              matchedAdminDoc.telegramConnectedAt = new Date();
              await matchedAdminDoc.save();
            } else if (matchedAdminUser) {
              await Admin.findOneAndUpdate(
                { email: matchedAdminUser.email },
                {
                  $set: {
                    userId: matchedAdminUser._id,
                    name: matchedAdminUser.name,
                    email: matchedAdminUser.email,
                    role: matchedAdminUser.role as any,
                    telegramChatId: chatId,
                    telegramUserId: fromId,
                    telegramUsername: fromUsername,
                    telegramBindToken: '',
                    telegramConnectedAt: new Date(),
                    isActive: true,
                  },
                },
                { upsert: true }
              );
            }

            // Sync with SystemSettings so insights & support alerts route immediately
            let settings = await SystemSettings.findOne();
            if (!settings) {
              settings = new SystemSettings({});
            }
            settings.telegramInsightsChatId = chatId;
            if (!settings.telegramSupportChatId) {
              settings.telegramSupportChatId = chatId;
            }
            settings.telegramBotsActive = true;
            await settings.save();

            await createPlatformNotification({
              userId: 'admin',
              targetRole: 'admin',
              title: 'حساب مدیریت به تلگرام متصل گردید',
              message: `حساب ${adminName} موفقانه با تلگرام (${fromUsername || chatId}) همگام‌سازی شد.`,
              type: 'system',
              link: '/admin/system',
            });

            await sendTelegramInteractiveMessage(
              token,
              chatId,
              `✅ <b>اتصال حساب مدیریت با موفقیت انجام گردید!</b>\n\nسلام <b>${adminName}</b> گرامی،\nاکانت مدیریتی شما در آریا لینک به صورت کامل به این ربات متصل شد.\n\nاز این پس تمامی سفارشات جدید، درخواست‌های راستی‌آزمایی و پیام‌های مهم را به همراه دکمه‌های تایید/رد فوری در همین‌جا دریافت خواهید نمود.`,
              getAdminWelcomeKeyboard()
            );
            return NextResponse.json({ ok: true });
          }
        }

        const isAllowed = await isAuthorizedAdminChat(fromId, chatId);
        if (isAllowed) {
          await sendTelegramInteractiveMessage(
            token,
            chatId,
            `🛡️ <b>مرکز فرماندهی مدیریتی آریا لینک</b>\n\nخوش آمدید! دسترسی مدیریت شما فعال است.\nاز دکمه‌های ذیل برای باز کردن مینی‌اپ جامع یا مشاهده گزارش‌های آنی استفاده نمایید:`,
            getAdminWelcomeKeyboard()
          );
        } else {
          await sendTelegramInteractiveMessage(
            token,
            chatId,
            `🔒 <b>پنل مدیریتی آریا لینک</b>\n\nاین ربات ویژه مدیران پلتفرم است.\nبرای اتصال حساب مدیریت خود، لطفاً وارد <b>پنل مدیریت وب -> تنظیمات سیستم</b> شده و روی دکمه <b>«اتصال به تلگرام»</b> کلیک نمایید.\n\n🆔 <b>نمبر چت شما:</b> <code>${chatId}</code>`,
            {
              inline_keyboard: [
                [{ text: '🌐 ورود به پنل وب', url: `${getBaseUrl()}/admin/system` }],
              ],
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      // Check authorization for subsequent commands
      const authorized = await isAuthorizedAdminChat(fromId, chatId);
      if (!authorized) {
        await sendTelegramInteractiveMessage(
          token,
          chatId,
          `⛔ حساب تلگرام شما هنوز به عنوان مدیر تایید نگردیده است.\nنمبر چت شما: <code>${chatId}</code>`,
          { inline_keyboard: [] }
        );
        return NextResponse.json({ ok: true });
      }

      if (text === '/stats') {
        const [usersCount, profilesCount, pendingOrders, totalMessages] = await Promise.all([
          User.countDocuments(),
          Profile.countDocuments(),
          Order.countDocuments({
            isDeleted: { $ne: true },
            orderStatus: { $in: ['pending', 'pending_payment', 'processing'] },
          }),
          Message.countDocuments(),
        ]);

        await sendTelegramInteractiveMessage(
          token,
          chatId,
          `📊 <b>گزارش آنی وضعیت پلتفرم آریا لینک</b>\n\n👥 <b>مجموع کاربران:</b> ${usersCount.toLocaleString('en-US')}\n🪪 <b>مجموع کارت‌ها و مینی‌سایت‌ها:</b> ${profilesCount.toLocaleString('en-US')}\n⏳ <b>سفارشات جاری / در انتظار:</b> ${pendingOrders.toLocaleString('en-US')}\n💬 <b>کل پیام‌های ثبت‌شده:</b> ${totalMessages.toLocaleString('en-US')}`,
          getAdminWelcomeKeyboard()
        );
        return NextResponse.json({ ok: true });
      }

      if (text === '/orders') {
        const recentOrders = await Order.find({
          isDeleted: { $ne: true },
          orderStatus: { $in: ['pending', 'pending_payment'] },
        })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        if (recentOrders.length === 0) {
          await sendTelegramInteractiveMessage(
            token,
            chatId,
            `✅ در حال حاضر هیچ سفارش در انتظار تایید وجود ندارد.`,
            getAdminWelcomeKeyboard()
          );
          return NextResponse.json({ ok: true });
        }

        for (const ord of recentOrders as any[]) {
          const orderText = `📦 <b>سفارش #${ord.orderNumber}</b>\n👤 خریدار: ${ord.customerName}\n🏷️ محصول: ${ord.productTitle}\n💰 مبلغ: ${Number(ord.totalPrice || 0).toLocaleString('en-US')} ${ord.currency || 'AFN'}\n📌 وضعیت فعلی: ${ord.orderStatus}`;
          await sendTelegramInteractiveMessage(token, chatId, orderText, {
            inline_keyboard: [
              [
                { text: '✅ تایید سفارش', callback_data: `order_approve:${ord._id.toString()}` },
                { text: '❌ رد سفارش', callback_data: `order_reject:${ord._id.toString()}` },
              ],
            ],
          });
        }
        return NextResponse.json({ ok: true });
      }

      // Default response
      await sendTelegramInteractiveMessage(
        token,
        chatId,
        `دستور دریافت شد. از دستورات <code>/stats</code> یا <code>/orders</code> یا دکمه‌های ذیل استفاده نمایید:`,
        getAdminWelcomeKeyboard()
      );
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 2. HANDLE INLINE KEYBOARD CALLBACK QUERIES (DIRECT DB ACTIONS)
    // =========================================================================
    if (update.callback_query) {
      const cb = update.callback_query;
      const cbId = String(cb.id);
      const data = String(cb.data || '');
      const chatId = String(cb.message?.chat?.id || cb.from?.id || '');
      const fromId = String(cb.from?.id || chatId);
      const messageId = cb.message?.message_id;
      const originalText = cb.message?.text || '';

      const authorized = await isAuthorizedAdminChat(fromId, chatId);
      if (!authorized) {
        await answerTelegramCallbackQuery(token, cbId, 'شما مجوز انجام این عملیات مدیریتی را ندارید.', true);
        return NextResponse.json({ ok: true });
      }

      const [action, targetId] = data.split(':');

      // --- Order Approve ---
      if (action === 'order_approve' && targetId && mongoose.isValidObjectId(targetId)) {
        const order = await Order.findById(targetId);
        if (!order) {
          await answerTelegramCallbackQuery(token, cbId, 'سفارش مورد نظر در دیتابیس یافت نگردید.', true);
          return NextResponse.json({ ok: true });
        }

        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        order.status = 'processing';
        await order.save();

        if (order.orderType === 'subscription') {
          try {
            await activateUserSubscriptionFromOrder(order);
          } catch (subErr) {
            console.error('Subscription activation error in admin-bot:', subErr);
          }
        }

        if (order.userId) {
          await createPlatformNotification({
            userId: String(order.userId),
            targetRole: 'user',
            title: 'سفارش شما تایید گردید',
            message: `سفارش #${order.orderNumber} (${order.productTitle}) توسط مدیریت تایید شد و وارد مرحله آماده‌سازی گردید.`,
            type: 'order_update',
            link: '/dashboard/orders',
            metadata: { orderId: order._id.toString() },
          });

          if (mongoose.isValidObjectId(String(order.userId))) {
            const buyer = await User.findById(order.userId).select('telegramChatId').lean();
            if (buyer?.telegramChatId) {
              await sendUserMessage(
                buyer.telegramChatId,
                `✅ <b>خبر خوش! سفارش شما تایید گردید</b>\n\n📦 نمبر سفارش: <code>${order.orderNumber}</code>\n🏷️ محصول: ${order.productTitle}\n📌 وضعیت جدید: در حال پردازش و آماده‌سازی`
              );
            }
          }
        }

        await answerTelegramCallbackQuery(token, cbId, '✅ سفارش با موفقیت تایید و در دیتابیس ثبت گردید.');
        if (messageId) {
          await editTelegramMessageText(
            token,
            chatId,
            messageId,
            `${originalText}\n\n━━━━━━━━━━━━━━━\n✅ <b>وضعیت:</b> تایید شده توسط مدیر سیستم در تاریخ ${new Date().toLocaleTimeString('en-US')}`,
            {
              inline_keyboard: [
                [{ text: '📦 علامت‌گذاری ارسال‌شده', callback_data: `order_ship:${targetId}` }],
                [{ text: '📱 باز کردن مینی‌اپ مدیریت', web_app: { url: getSecureMiniAppUrl('/twa/admin') } }],
              ],
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      // --- Order Reject ---
      if (action === 'order_reject' && targetId && mongoose.isValidObjectId(targetId)) {
        const order = await Order.findById(targetId);
        if (!order) {
          await answerTelegramCallbackQuery(token, cbId, 'سفارش یافت نگردید.', true);
          return NextResponse.json({ ok: true });
        }

        order.orderStatus = 'cancelled';
        order.status = 'cancelled';
        await order.save();

        if (order.userId) {
          await createPlatformNotification({
            userId: String(order.userId),
            targetRole: 'user',
            title: 'وضعیت سفارش: رد شده',
            message: `متاسفانه سفارش #${order.orderNumber} توسط بخش مالی/مدیریت تایید نگردید.`,
            type: 'order_update',
            link: '/dashboard/orders',
          });

          if (mongoose.isValidObjectId(String(order.userId))) {
            const buyer = await User.findById(order.userId).select('telegramChatId').lean();
            if (buyer?.telegramChatId) {
              await sendUserMessage(
                buyer.telegramChatId,
                `❌ <b>سفارش #${order.orderNumber} رد و لغو گردید</b>\nلطفاً جهت معلومات بیشتر با تیم پشتیبانی آریا لینک تماس بگیرید.`
              );
            }
          }
        }

        await answerTelegramCallbackQuery(token, cbId, '❌ سفارش رد و لغو گردید.');
        if (messageId) {
          await editTelegramMessageText(
            token,
            chatId,
            messageId,
            `${originalText}\n\n━━━━━━━━━━━━━━━\n❌ <b>وضعیت:</b> رد و لغو شده توسط مدیر سیستم`,
            {
              inline_keyboard: [
                [{ text: '📱 باز کردن مینی‌اپ مدیریت', web_app: { url: getSecureMiniAppUrl('/twa/admin') } }],
              ],
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      // --- Order Ship ---
      if (action === 'order_ship' && targetId && mongoose.isValidObjectId(targetId)) {
        const order = await Order.findById(targetId);
        if (!order) {
          await answerTelegramCallbackQuery(token, cbId, 'سفارش یافت نگردید.', true);
          return NextResponse.json({ ok: true });
        }

        order.orderStatus = 'shipped';
        order.status = 'shipped';
        await order.save();

        if (order.userId) {
          await createPlatformNotification({
            userId: String(order.userId),
            targetRole: 'user',
            title: 'سفارش شما ارسال گردید',
            message: `بسته سفارش #${order.orderNumber} تحویل پیک/پست گردید و در مسیر ارسال قرار دارد.`,
            type: 'order_update',
            link: '/dashboard/orders',
          });
        }

        await answerTelegramCallbackQuery(token, cbId, '📦 وضعیت سفارش به «ارسال‌شده» تغییر یافت.');
        if (messageId) {
          await editTelegramMessageText(
            token,
            chatId,
            messageId,
            `${originalText}\n\n━━━━━━━━━━━━━━━\n📦 <b>وضعیت:</b> ارسال شده به مشتری ✅`,
            {
              inline_keyboard: [
                [{ text: '📱 باز کردن مینی‌اپ مدیریت', web_app: { url: getSecureMiniAppUrl('/twa/admin') } }],
              ],
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      // --- KYC Approve / Reject ---
      if ((action === 'kyc_approve' || action === 'kyc_reject') && targetId && mongoose.isValidObjectId(targetId)) {
        const targetUser = await User.findById(targetId);
        if (!targetUser) {
          await answerTelegramCallbackQuery(token, cbId, 'کاربر یافت نگردید.', true);
          return NextResponse.json({ ok: true });
        }

        const isApprove = action === 'kyc_approve';
        targetUser.isVerified = isApprove;
        targetUser.verificationStatus = isApprove ? 'verified' : 'rejected';
        if (!targetUser.kycData) targetUser.kycData = {};
        targetUser.kycData.reviewedAt = new Date();
        if (!isApprove) {
          targetUser.kycData.rejectionReason = 'رد شده از طریق پنل تلگرام مدیریت.';
        }
        await targetUser.save();

        await Profile.updateMany(
          { userId: targetUser._id },
          { $set: { isVerified: isApprove, verificationStatus: isApprove ? 'verified' : 'rejected' } }
        );

        await createPlatformNotification({
          userId: targetUser._id.toString(),
          targetRole: 'user',
          title: isApprove ? 'تایید هویت شما موفقانه انجام شد' : 'درخواست راستی‌آزمایی هویت رد گردید',
          message: isApprove
            ? 'تبریک! هویت شما تایید و نشان آبی رسمی برای پروفایل شما فعال گردید.'
            : 'مدارک ارسالی شما مورد تایید قرار نگرفت. لطفاً دوباره بررسی و ارسال نمایید.',
          type: 'kyc_update',
          link: '/dashboard/kyc',
        });

        await answerTelegramCallbackQuery(
          token,
          cbId,
          isApprove ? '✅ هویت کاربر تایید و تیک آبی فعال گردید.' : '❌ درخواست راستی‌آزمایی رد گردید.'
        );

        if (messageId) {
          await editTelegramMessageText(
            token,
            chatId,
            messageId,
            `${originalText}\n\n━━━━━━━━━━━━━━━\n${isApprove ? '✅ <b>نتیجه:</b> هویت تایید و تیک آبی فعال گردید' : '❌ <b>نتیجه:</b> درخواست رد گردید'}`,
            {
              inline_keyboard: [
                [{ text: '📱 باز کردن مینی‌اپ مدیریت', web_app: { url: getSecureMiniAppUrl('/twa/admin') } }],
              ],
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      // --- Quick Stats Callback ---
      if (action === 'admin_quick_stats') {
        const [usersCount, profilesCount, pendingOrders, totalMessages] = await Promise.all([
          User.countDocuments(),
          Profile.countDocuments(),
          Order.countDocuments({
            isDeleted: { $ne: true },
            orderStatus: { $in: ['pending', 'pending_payment', 'processing'] },
          }),
          Message.countDocuments(),
        ]);

        await answerTelegramCallbackQuery(token, cbId, 'آمار لحظه‌ای بارگذاری گردید');
        await sendTelegramInteractiveMessage(
          token,
          chatId,
          `📊 <b>آمار لحظه‌ای پلتفرم آریا لینک</b>\n\n👥 کاربران کل: <b>${usersCount.toLocaleString('en-US')}</b>\n🪪 کارت‌های هوشمند: <b>${profilesCount.toLocaleString('en-US')}</b>\n⏳ سفارشات باز: <b>${pendingOrders.toLocaleString('en-US')}</b>\n💬 پیام‌ها و لیدها: <b>${totalMessages.toLocaleString('en-US')}</b>`,
          getAdminWelcomeKeyboard()
        );
        return NextResponse.json({ ok: true });
      }

      // --- Recent Pending Orders Callback ---
      if (action === 'admin_recent_orders') {
        const recentOrders = await Order.find({
          isDeleted: { $ne: true },
          orderStatus: { $in: ['pending', 'pending_payment'] },
        })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();

        await answerTelegramCallbackQuery(
          token,
          cbId,
          recentOrders.length > 0 ? `${recentOrders.length} سفارش در انتظار نمایش داده شد` : 'سفارش منتظری یافت نشد'
        );

        if (recentOrders.length === 0) {
          await sendTelegramInteractiveMessage(
            token,
            chatId,
            `✅ هیچ سفارش در انتظار تاییدی در سیستم وجود ندارد.`,
            getAdminWelcomeKeyboard()
          );
        } else {
          for (const ord of recentOrders as any[]) {
            await sendTelegramInteractiveMessage(
              token,
              chatId,
              `📦 <b>سفارش #${ord.orderNumber}</b>\n👤 خریدار: ${ord.customerName}\n🏷️ محصول: ${ord.productTitle}\n💰 مبلغ: ${Number(ord.totalPrice || 0).toLocaleString('en-US')} ${ord.currency || 'AFN'}`,
              {
                inline_keyboard: [
                  [
                    { text: '✅ تایید سفارش', callback_data: `order_approve:${ord._id.toString()}` },
                    { text: '❌ رد سفارش', callback_data: `order_reject:${ord._id.toString()}` },
                  ],
                ],
              }
            );
          }
        }
        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(token, cbId);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Admin Bot Webhook Error:', error);
    return NextResponse.json({ ok: true, error: error?.message });
  }
}
