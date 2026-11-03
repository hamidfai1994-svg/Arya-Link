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

  return calculatedHash === hash;
}
