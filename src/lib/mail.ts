import nodemailer from 'nodemailer';
import { getSiteSettings } from '@/lib/settings';
import { getBaseUrl } from '@/lib/base-url';

const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
const smtpPort = Number(process.env.SMTP_PORT) || 465;

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Resolves an absolute public logo URL for email clients.
 * Prevents broken images by ensuring all URLs are strictly absolute.
 */
function resolveEmailLogoUrl(rawLogo?: string | null): string {
  const clean = (rawLogo || '').trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  const baseUrl = getBaseUrl();
  if (clean.startsWith('/')) {
    return `${baseUrl}${clean}`;
  }
  return `${baseUrl}/logo-dark.png`;
}

/**
 * Sends a localized Afghan Dari OTP verification email via Hostinger SMTP.
 * Designed to meet global email standards (Vercel-style) with Schema.org JSON-LD
 * for automatic Gmail 'Copy Code' detection and a 6-box OTP visual layout.
 */
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpFromRaw = (process.env.SMTP_FROM || '').trim();

  if (!smtpUser || !smtpPass) {
    throw new Error('تنظیمات سرویس ایمیل (SMTP) روی سرور تکمیل نشده است.');
  }

  const baseUrl = getBaseUrl();
  let siteName = 'آریا لینک | Arya Link';
  let logoUrl = `${baseUrl}/logo-dark.png`;

  try {
    const settings = await getSiteSettings();
    if (settings?.siteName) {
      siteName = settings.siteName;
    }
    const resolved = resolveEmailLogoUrl(settings?.platformMainLogo || settings?.companyLogo);
    if (resolved) {
      logoUrl = resolved;
    }
  } catch {
    // Fallback to default brand values if DB settings lookup fails
  }

  const senderEmail = smtpFromRaw || smtpUser;
  const fromAddress = senderEmail.includes('<')
    ? senderEmail
    : `"${siteName}" <${senderEmail}>`;

  const loginUrl = `${baseUrl}/login`;

  // Format 6-digit code into individual UI box spans
  const digits = (code || '').trim().slice(0, 6).split('');
  while (digits.length < 6) {
    digits.push('•');
  }

  const digitBoxesHtml = digits
    .map(
      (digit) =>
        `<span style="display: inline-block; padding: 10px 15px; margin: 0 4px; background-color: #f3f4f6; border-radius: 8px; font-size: 24px; font-weight: bold; border: 1px solid #e5e7eb; color: #111827; text-align: center; min-width: 14px; line-height: 1.2;">${digit}</span>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>کد تایید شما: ${code}</title>
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EmailMessage",
  "description": "کد تایید ورود به آریا لینک",
  "potentialAction": {
    "@type": "ViewAction",
    "target": "https://aryal.ink/login",
    "name": "ورود به حساب"
  }
}
  </script>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: Tahoma, Arial, sans-serif; color: #f8fafc; direction: rtl; text-align: right;" dir="rtl">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; padding: 36px 16px; font-family: Tahoma, Arial, sans-serif; direction: rtl;" dir="rtl">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #111827; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45); font-family: Tahoma, Arial, sans-serif; direction: rtl;" dir="rtl">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #0ea5e9 0%, #06b6d4 50%, #2563eb 100%);"></td>
          </tr>

          <!-- Header & Logo -->
          <tr>
            <td align="center" style="padding: 32px 28px 16px 28px; text-align: center;">
              <img src="${logoUrl}" alt="${siteName}" width="64" height="64" style="display: block; max-width: 64px; height: auto; border-radius: 14px; margin: 0 auto 14px auto; border: 0;" />
              <div style="font-size: 19px; font-weight: bold; color: #22d3ee; letter-spacing: 0.5px; font-family: Tahoma, Arial, sans-serif;">
                آریا لینک <span style="color: #94a3b8; font-weight: normal; font-size: 13px;">| Arya Link</span>
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 12px 32px 28px 32px; text-align: right; font-family: Tahoma, Arial, sans-serif;" dir="rtl">
              <h1 style="margin: 0 0 14px 0; font-size: 19px; font-weight: bold; color: #ffffff; line-height: 1.6; text-align: center; font-family: Tahoma, Arial, sans-serif;">
                کد تایید ورود به حساب کاربری
              </h1>
              <p style="margin: 0 0 22px 0; font-size: 13px; color: #cbd5e1; line-height: 1.8; text-align: right; font-family: Tahoma, Arial, sans-serif;">
                کاربر گرامی، سلام! برای ورود به حساب کاربری خود در سیستم آریا لینک، لطفاً کد تایید ۶ رقمی زیر را در بخش ورود درج فرمایید:
              </p>

              <!-- OTP 6-Box Display -->
              <div style="text-align: center; margin: 24px 0 28px 0;">
                <div dir="ltr" style="display: inline-block; direction: ltr; text-align: center; unicode-bidi: bidi-override;">
                  ${digitBoxesHtml}
                </div>
              </div>

              <!-- Security Expiry Notice -->
              <div style="background-color: rgba(14, 165, 233, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 12px; padding: 14px 18px; margin-bottom: 22px; text-align: right; direction: rtl; font-family: Tahoma, Arial, sans-serif;" dir="rtl">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.8;">
                  این کد یکبار مصرف تا <strong style="color: #22d3ee;">۵ دقیقه</strong> دیگر معتبر است. به منظور حفظ امنیت حساب خود، این کد را در اختیار هیچ فردی قرار ندهید. در صورتی که شما این درخواست را ثبت نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.
                </p>
              </div>

              <!-- Direct Action Link Button -->
              <div style="text-align: center; margin-bottom: 8px;">
                <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 28px; border-radius: 12px; font-family: Tahoma, Arial, sans-serif; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);">
                  ورود به حساب کاربری
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #0b1120; padding: 18px 24px; border-top: 1px solid #1e293b; font-family: Tahoma, Arial, sans-serif; direction: rtl;" dir="rtl">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6; text-align: center;">
                ارسال‌شده به‌صورت خودکار از پلتفرم هوشمند ${siteName}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `کد تایید شما: ${code}`,
    text: `کد تایید شما: ${code}\nاین کد تا ۵ دقیقه دیگر معتبر است.\nجهت ورود به سیستم: ${loginUrl}`,
    html,
  });
}
