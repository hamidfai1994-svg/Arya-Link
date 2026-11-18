import crypto from 'crypto';

/**
 * Validates Telegram Web App initData using HMAC-SHA256 according to Telegram specifications.
 * @param initData The raw initData string received from window.Telegram.WebApp.initData
 * @param botToken The bot token used to sign the Web App data
 * @returns boolean True if hash is authentic and unaltered
 */
export function validateTelegramWebAppData(initData: string, botToken: string): boolean {
  if (!initData || !botToken) return false;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  if (!hash) return false;

  urlParams.delete('hash');

  const pairs: string[] = [];
  urlParams.forEach((value, key) => {
    pairs.push(`${key}=${value}`);
  });
  pairs.sort();

  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  } catch {
    return calculatedHash === hash;
  }
}

export interface VerifiedTwaResult {
  valid: boolean;
  error?: string;
  tgId?: string;
  tgUser?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
}

/**
 * Verifies Telegram Mini App initData signature against candidate bot tokens for the specified role
 * and checks auth_date freshness (max 24 hours).
 */
export function verifyAndExtractTwaUser(
  initData: string,
  role: 'admin' | 'user'
): VerifiedTwaResult {
  if (!initData || typeof initData !== 'string') {
    return { valid: false, error: 'اطلاعات احراز هویت تلگرام (initData) ارسال نگردیده است.' };
  }

  const candidateTokens =
    role === 'admin'
      ? [
          process.env.TELEGRAM_INSIGHTS_BOT_TOKEN,
          process.env.TELEGRAM_SUPPORT_BOT_TOKEN,
          process.env.TELEGRAM_BOT_TOKEN,
        ]
      : [
          process.env.TELEGRAM_USER_BOT_TOKEN,
          process.env.TELEGRAM_BOT_TOKEN,
        ];

  const validTokens = Array.from(
    new Set(candidateTokens.map((t) => (t || '').trim()).filter(Boolean))
  );

  if (validTokens.length === 0) {
    return { valid: false, error: 'توکن ربات تلگرام در تنظیمات سرور تعریف نشده است.' };
  }

  const isSignatureValid = validTokens.some((token) =>
    validateTelegramWebAppData(initData, token)
  );

  if (!isSignatureValid) {
    return { valid: false, error: 'امضای امنیتی تلگرام نامعتبر است (Invalid Hash).' };
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const authDateStr = urlParams.get('auth_date');
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10);
      const nowSec = Math.floor(Date.now() / 1000);
      // Reject tokens older than 24 hours
      if (!isNaN(authDate) && nowSec - authDate > 86400) {
        return { valid: false, error: 'نشست تلگرام منقضی گردیده است. لطفاً مینی‌اپ را دوباره باز نمایید.' };
      }
    }

    const userStr = urlParams.get('user');
    if (!userStr) {
      return { valid: false, error: 'مشخصات کاربر در initData موجود نیست.' };
    }

    const tgUser = JSON.parse(userStr);
    const tgId = tgUser?.id?.toString();
    if (!tgId) {
      return { valid: false, error: 'شناسه کاربری تلگرام نامعتبر است.' };
    }

    return {
      valid: true,
      tgId,
      tgUser,
    };
  } catch {
    return { valid: false, error: 'ساختار داده‌های تلگرام قابل تجزیه نیست.' };
  }
}
