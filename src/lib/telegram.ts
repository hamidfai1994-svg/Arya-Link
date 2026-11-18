import { getBaseUrl } from '@/lib/base-url';

/**
 * Telegram Multi-Bot API Notification & Interactive Command Service
 * Supports decoupled bots: Admin/Insights, Support, and User CRM Bots.
 */

export interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
  web_app?: { url: string };
}

export interface TelegramReplyMarkup {
  inline_keyboard: TelegramInlineButton[][];
}

export function getAdminBotToken(): string {
  return (
    process.env.TELEGRAM_INSIGHTS_BOT_TOKEN ||
    process.env.TELEGRAM_SUPPORT_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    ''
  ).trim();
}

export function getSupportBotToken(): string {
  return (
    process.env.TELEGRAM_SUPPORT_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_INSIGHTS_BOT_TOKEN ||
    ''
  ).trim();
}

export function getUserBotToken(): string {
  return (
    process.env.TELEGRAM_USER_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    ''
  ).trim();
}

export function getSecureMiniAppUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (base.startsWith('https://')) {
    return `${base}${cleanPath}`;
  }
  return `https://aryal.ink${cleanPath}`;
}

async function sendTelegramPayload(
  botToken: string | undefined,
  chatId: string,
  text: string,
  botName: string,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML',
  replyMarkup?: TelegramReplyMarkup
): Promise<boolean> {
  if (!botToken || !chatId) {
    console.warn(`Telegram ${botName} token or chat ID is missing.`);
    return false;
  }

  const cleanChatId = String(chatId).trim();
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const payload: Record<string, any> = {
      chat_id: cleanChatId,
      text,
      parse_mode: parseMode,
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`Telegram ${botName} API Error:`, error);
      // Fallback: if reply_markup (e.g. web_app URL in dev) was rejected, retry plain text
      if (replyMarkup) {
        const retryRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: cleanChatId,
            text,
            parse_mode: parseMode,
          }),
        });
        return retryRes.ok;
      }
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Failed to send Telegram message via ${botName}:`, error);
    return false;
  }
}

export async function sendTelegramInteractiveMessage(
  botToken: string,
  chatId: string,
  text: string,
  replyMarkup: TelegramReplyMarkup,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML'
): Promise<boolean> {
  return sendTelegramPayload(botToken, chatId, text, 'InteractiveBot', parseMode, replyMarkup);
}

export async function answerTelegramCallbackQuery(
  botToken: string,
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
): Promise<boolean> {
  if (!botToken || !callbackQueryId) return false;
  try {
    const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || undefined,
        show_alert: showAlert,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error('answerCallbackQuery failed:', error);
    return false;
  }
}

export async function editTelegramMessageText(
  botToken: string,
  chatId: string | number,
  messageId: number,
  text: string,
  replyMarkup?: TelegramReplyMarkup,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML'
): Promise<boolean> {
  if (!botToken || !chatId || !messageId) return false;
  try {
    const url = `https://api.telegram.org/bot${botToken}/editMessageText`;
    const payload: Record<string, any> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: parseMode,
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (error) {
    console.error('editMessageText failed:', error);
    return false;
  }
}

export async function fetchTelegramBotUsername(botToken: string): Promise<string | null> {
  if (!botToken) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.ok && data?.result?.username ? String(data.result.username) : null;
  } catch {
    return null;
  }
}

export async function registerTelegramWebhook(
  botToken: string,
  webhookUrl: string
): Promise<{ ok: boolean; description?: string }> {
  if (!botToken) {
    return { ok: false, description: 'توکن ربات تنظیم نگردیده است.' };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });
    const data = await res.json();
    return {
      ok: Boolean(data?.ok),
      description: data?.description || '',
    };
  } catch (error: any) {
    return { ok: false, description: error?.message || 'خطا در اتصال به تلگرام' };
  }
}

/**
 * 1. Support Bot: Sends operational tickets, alerts and system notifications to Super Admin
 */
export async function sendSupportMessage(
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML'
): Promise<boolean> {
  const token = getSupportBotToken();
  return sendTelegramPayload(token, chatId, text, 'SupportBot', parseMode);
}

/**
 * 2. Insights Bot: Sends business analytics, daily stats, and growth metrics to Super Admin
 */
export async function sendInsightsMessage(
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML',
  replyMarkup?: TelegramReplyMarkup
): Promise<boolean> {
  const token = getAdminBotToken();
  return sendTelegramPayload(token, chatId, text, 'InsightsBot', parseMode, replyMarkup);
}

/**
 * 3. User Bot: Sends direct visitor leads & contact form inquiries to mini-site owners
 */
export async function sendUserMessage(
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML',
  replyMarkup?: TelegramReplyMarkup
): Promise<boolean> {
  const token = getUserBotToken();
  return sendTelegramPayload(token, chatId, text, 'UserBot', parseMode, replyMarkup);
}

/**
 * Sends an interactive order approval notification to the Super Admin on Telegram.
 */
export async function sendAdminOrderAlert(
  chatId: string,
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone?: string;
    productTitle: string;
    totalPrice: number;
    currency?: string;
    paymentStatus?: string;
    orderStatus?: string;
    trackingShortCode?: string;
  }
): Promise<boolean> {
  const token = getAdminBotToken();
  if (!token || !chatId) return false;

  const text = `🛍️ <b>سفارش جدید در آریا لینک ثبت گردید</b>\n\n📦 <b>نمبر سفارش:</b> <code>${order.orderNumber}</code>\n👤 <b>مشتری:</b> ${order.customerName}\n📞 <b>نمبر تماس:</b> ${order.customerPhone || 'درج نگردیده'}\n🏷️ <b>محصول:</b> ${order.productTitle}\n💰 <b>مبلغ مجموعی:</b> ${Number(order.totalPrice || 0).toLocaleString('en-US')} ${order.currency || 'AFN'}\n💳 <b>وضعیت پرداخت:</b> ${order.paymentStatus || 'pending'}\n📌 <b>وضعیت سفارش:</b> ${order.orderStatus || 'pending_payment'}${order.trackingShortCode ? `\n🔗 <b>کد رهگیری NFC:</b> <code>${order.trackingShortCode}</code>` : ''}\n\n⚡ <i>از طریق دکمه‌های ذیل می‌توانید مستقیماً در دیتابیس تصمیم بگیرید:</i>`;

  const replyMarkup: TelegramReplyMarkup = {
    inline_keyboard: [
      [
        { text: '✅ تایید سفارش', callback_data: `order_approve:${order.id}` },
        { text: '❌ رد سفارش', callback_data: `order_reject:${order.id}` },
      ],
      [
        { text: '📦 علامت‌گذاری ارسال‌شده', callback_data: `order_ship:${order.id}` },
      ],
      [
        { text: '📱 باز کردن مینی‌اپ مدیریت', web_app: { url: getSecureMiniAppUrl('/twa/admin') } },
      ],
    ],
  };

  return sendTelegramInteractiveMessage(token, chatId, text, replyMarkup);
}

/**
 * Sends an interactive KYC verification request notification to Admin on Telegram.
 */
export async function sendAdminKycAlert(
  chatId: string,
  kyc: {
    userId: string;
    fullName: string;
    nationalId: string;
    documentType: string;
  }
): Promise<boolean> {
  const token = getAdminBotToken();
  if (!token || !chatId) return false;

  const text = `🛡️ <b>درخواست جدید راستی‌آزمایی هویت (KYC)</b>\n\n👤 <b>نام متقاضی:</b> ${kyc.fullName}\n🪪 <b>نمبر تذکره / پاسپورت:</b> <code>${kyc.nationalId}</code>\n📄 <b>نوع سند:</b> ${kyc.documentType}\n\nلطفاً پس از بررسی، وضعیت را تایید یا رد نمایید:`;

  const replyMarkup: TelegramReplyMarkup = {
    inline_keyboard: [
      [
        { text: '✅ تایید و اعطای تیک آبی', callback_data: `kyc_approve:${kyc.userId}` },
        { text: '❌ رد درخواست', callback_data: `kyc_reject:${kyc.userId}` },
      ],
      [
        { text: '📱 باز کردن مینی‌اپ مدیریت', web_app: { url: getSecureMiniAppUrl('/twa/admin') } },
      ],
    ],
  };

  return sendTelegramInteractiveMessage(token, chatId, text, replyMarkup);
}

/**
 * Sends an interactive contact form lead notification to the mini-site owner on Telegram.
 */
export async function sendUserLeadAlert(
  chatId: string,
  lead: {
    messageId?: string;
    senderName: string;
    contactInfo: string;
    miniSiteTitle: string;
    alias: string;
    messageText: string;
  }
): Promise<boolean> {
  const token = getUserBotToken();
  if (!token || !chatId) return false;

  const text = `📬 <b>پیام جدید از فرم تماس مینی‌سایت شما</b>\n\n👤 <b>نام فرستنده:</b> ${lead.senderName}\n📞 <b>معلومات تماس:</b> ${lead.contactInfo}\n🌐 <b>کارت شما:</b> ${lead.miniSiteTitle} (aryal.ink/${lead.alias})\n\n💬 <b>متن پیام:</b>\n${lead.messageText}`;

  const inlineKeyboard: TelegramInlineButton[][] = [];
  if (lead.messageId) {
    inlineKeyboard.push([
      { text: '📞 تماس گرفته شد', callback_data: `lead_contacted:${lead.messageId}` },
      { text: '✅ تکمیل شد', callback_data: `lead_resolved:${lead.messageId}` },
    ]);
  }
  inlineKeyboard.push([
    { text: '📱 باز کردن مینی‌اپ مدیریت پروفایل', web_app: { url: getSecureMiniAppUrl('/twa/user') } },
  ]);

  return sendTelegramInteractiveMessage(token, chatId, text, { inline_keyboard: inlineKeyboard });
}

// Backward compatibility aliases
export const sendTelegramMessage = sendSupportMessage;
export const sendUserTelegramMessage = sendUserMessage;
export default sendSupportMessage;
