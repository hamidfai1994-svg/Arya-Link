/**
 * Telegram Multi-Bot API Notification Service
 * Supports 3 decoupled bots: Support, Insights, and User CRM.
 */

async function sendTelegramPayload(
  botToken: string | undefined,
  chatId: string,
  text: string,
  botName: string,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML'
): Promise<boolean> {
  if (!botToken || !chatId) {
    console.warn(`Telegram ${botName} token or chat ID is missing.`);
    return false;
  }

  const cleanChatId = chatId.trim();
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: text,
        parse_mode: parseMode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Telegram ${botName} API Error:`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Failed to send Telegram message via ${botName}:`, error);
    return false;
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
  const token = process.env.TELEGRAM_SUPPORT_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  return sendTelegramPayload(token, chatId, text, 'SupportBot', parseMode);
}

/**
 * 2. Insights Bot: Sends business analytics, daily stats, and growth metrics to Super Admin
 */
export async function sendInsightsMessage(
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML'
): Promise<boolean> {
  const token = process.env.TELEGRAM_INSIGHTS_BOT_TOKEN;
  return sendTelegramPayload(token, chatId, text, 'InsightsBot', parseMode);
}

/**
 * 3. User Bot: Sends direct visitor leads & contact form inquiries to mini-site owners
 */
export async function sendUserMessage(
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'MarkdownV2' = 'HTML'
): Promise<boolean> {
  const token = process.env.TELEGRAM_USER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  return sendTelegramPayload(token, chatId, text, 'UserBot', parseMode);
}

// Backward compatibility aliases
export const sendTelegramMessage = sendSupportMessage;
export const sendUserTelegramMessage = sendUserMessage;
export default sendSupportMessage;
