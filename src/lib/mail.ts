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

export type SupportedEmailLocale = 'fa' | 'en' | 'ps';

export function normalizeEmailLocale(locale?: string | null): SupportedEmailLocale {
  if (!locale) return 'fa';
  const clean = locale.toLowerCase().trim();
  if (clean.startsWith('en')) return 'en';
  if (clean.startsWith('ps')) return 'ps';
  return 'fa';
}

interface EmailTranslation {
  subject: (code: string) => string;
  title: string;
  greeting: string;
  securityAlert: string;
  actionBtn: string;
  footer: (siteName: string) => string;
  dir: 'rtl' | 'ltr';
  lang: string;
  fontFamily: string;
  textAlign: 'right' | 'left';
}

const EMAIL_TRANSLATIONS: Record<SupportedEmailLocale, EmailTranslation> = {
  fa: {
    subject: (code: string) => `کد تایید شما: ${code}`,
    title: 'کد تایید ورود به حساب کاربری',
    greeting: 'کاربر گرامی، سلام! برای ورود به حساب کاربری خود در سیستم آریا لینک، لطفاً کد تایید ۶ رقمی زیر را در بخش ورود درج فرمایید:',
    securityAlert: 'این کد یکبار مصرف تا <strong style="color: #22d3ee;">۵ دقیقه</strong> دیگر معتبر است. به منظور حفظ امنیت حساب خود، این کد را در اختیار هیچ فردی قرار ندهید. در صورتی که شما این درخواست را ثبت نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.',
    actionBtn: 'ورود به حساب کاربری',
    footer: (siteName: string) => `ارسال‌شده به‌صورت خودکار از پلتفرم هوشمند ${siteName}`,
    dir: 'rtl',
    lang: 'fa',
    fontFamily: 'Tahoma, Arial, sans-serif',
    textAlign: 'right',
  },
  ps: {
    subject: (code: string) => `ستاسو د تایید کوډ: ${code}`,
    title: 'حساب ته د ننوتلو تایید کوډ',
    greeting: 'دروند کاروونکی، سلام! په آریا لینک کې خپل حساب ته د ننوتلو لپاره، مهرباني وکړئ لاندې ۶ عددي کوډ اړوند ځای کې ولیکئ:',
    securityAlert: 'دا یو ځلي کوډ تر <strong style="color: #22d3ee;">۵ دقیقو</strong> پورې د اعتبار وړ دی. د خپل حساب د خوندیتوب لپاره دا کوډ له هیچا سره مه شریکوئ. که دا غوښتنه تاسو نه وي کړې، دا برېښنالیک له پامه وغورځوئ.',
    actionBtn: 'حساب ته ننوتل',
    footer: (siteName: string) => `دا برېښنالیک په اتوماتیک ډول د ${siteName} هوښیار پلتفارم لخوا لېږل شوی دی.`,
    dir: 'rtl',
    lang: 'ps',
    fontFamily: 'Tahoma, Arial, sans-serif',
    textAlign: 'right',
  },
  en: {
    subject: (code: string) => `Your verification code: ${code}`,
    title: 'Sign in to your account',
    greeting: 'Hello! To sign in to your Arya Link account, please enter the 6-digit verification code below:',
    securityAlert: 'This one-time code is valid for <strong style="color: #22d3ee;">5 minutes</strong>. For your security, never share this code with anyone. If you did not request this code, you can safely ignore this email.',
    actionBtn: 'Sign In to Account',
    footer: (siteName: string) => `Sent automatically from ${siteName} platform`,
    dir: 'ltr',
    lang: 'en',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    textAlign: 'left',
  },
};

/**
 * Sends a fully responsive, multilingual OTP verification email via Hostinger SMTP.
 * Designed to meet global email standards (Vercel-style) with Schema.org JSON-LD
 * for automatic Gmail 'Copy Code' detection and an unbroken 6-box OTP responsive layout.
 */
export async function sendVerificationEmail(
  to: string,
  code: string,
  locale: SupportedEmailLocale | string = 'fa'
): Promise<void> {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpFromRaw = (process.env.SMTP_FROM || '').trim();

  if (!smtpUser || !smtpPass) {
    throw new Error('تنظیمات سرویس ایمیل (SMTP) روی سرور تکمیل نشده است.');
  }

  const activeLocale = normalizeEmailLocale(locale);
  const t = EMAIL_TRANSLATIONS[activeLocale];

  const baseUrl = getBaseUrl();
  let siteName = 'آریا لینک | Arya Link';
  const logoUrl = 'https://i.postimg.cc/7YJCQh2J/logo.png';

  try {
    const settings = await getSiteSettings();
    if (settings?.siteName) {
      siteName = settings.siteName;
    }
  } catch {
    // Fallback to default brand values if DB settings lookup fails
  }

  const senderEmail = smtpFromRaw || smtpUser;
  const fromAddress = senderEmail.includes('<')
    ? senderEmail
    : `"${siteName}" <${senderEmail}>`;

  const loginUrl = `${baseUrl}/login`;

  // Format 6-digit code into individual UI box spans with compact responsive dimensions
  const digits = (code || '').trim().slice(0, 6).split('');
  while (digits.length < 6) {
    digits.push('•');
  }

  const digitBoxesHtml = digits
    .map(
      (digit) =>
        `<span style="padding: 8px 10px; margin: 0 2px; font-size: 20px; border-radius: 6px; display: inline-block; text-align: center; background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #111827; font-weight: bold; line-height: 1.2; min-width: 14px; font-family: monospace, -apple-system, sans-serif;">${digit}</span>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${t.subject(code)}</title>
  <script type="application/ld+json">
[{
  "@context": "https://schema.org",
  "@type": "EmailMessage",
  "description": "Verification Code",
  "potentialAction": {
    "@type": "ViewAction",
    "target": "https://aryal.ink/login",
    "name": "Copy Code"
  }
}]
  </script>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: ${t.fontFamily}; color: #f8fafc; direction: ${t.dir}; text-align: ${t.textAlign};" dir="${t.dir}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; padding: 36px 12px; font-family: ${t.fontFamily}; direction: ${t.dir};" dir="${t.dir}">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #111827; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45); font-family: ${t.fontFamily}; direction: ${t.dir};" dir="${t.dir}">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #0ea5e9 0%, #06b6d4 50%, #2563eb 100%);"></td>
          </tr>

          <!-- Header & Logo -->
          <tr>
            <td align="center" style="padding: 32px 24px 16px 24px; text-align: center;">
              <img src="${logoUrl}" alt="${siteName}" width="64" height="64" style="display: block; max-width: 64px; height: auto; border-radius: 14px; margin: 0 auto 14px auto; border: 0;" />
              <div style="font-size: 19px; font-weight: bold; color: #22d3ee; letter-spacing: 0.5px; font-family: ${t.fontFamily};">
                آریا لینک <span style="color: #94a3b8; font-weight: normal; font-size: 13px;">| Arya Link</span>
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 12px 24px 28px 24px; text-align: ${t.textAlign}; font-family: ${t.fontFamily}; direction: ${t.dir};" dir="${t.dir}">
              <h1 style="margin: 0 0 14px 0; font-size: 19px; font-weight: bold; color: #ffffff; line-height: 1.5; text-align: center; font-family: ${t.fontFamily};">
                ${t.title}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #cbd5e1; line-height: 1.8; text-align: ${t.textAlign}; font-family: ${t.fontFamily};">
                ${t.greeting}
              </p>

              <!-- OTP 6-Box Responsive Display (Never breaks on mobile) -->
              <div style="text-align: center; margin: 22px 0 26px 0;">
                <div dir="ltr" style="display: inline-block; direction: ltr; text-align: center; white-space: nowrap; unicode-bidi: bidi-override;">
                  ${digitBoxesHtml}
                </div>
              </div>

              <!-- Security Expiry Notice -->
              <div style="background-color: rgba(14, 165, 233, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 12px; padding: 12px 16px; margin-bottom: 22px; text-align: ${t.textAlign}; direction: ${t.dir}; font-family: ${t.fontFamily};" dir="${t.dir}">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.8;">
                  ${t.securityAlert}
                </p>
              </div>

              <!-- Direct Action Link Button -->
              <div style="text-align: center; margin-bottom: 8px;">
                <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 28px; border-radius: 12px; font-family: ${t.fontFamily}; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);">
                  ${t.actionBtn}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #0b1120; padding: 18px 24px; border-top: 1px solid #1e293b; font-family: ${t.fontFamily}; direction: ${t.dir};" dir="${t.dir}">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6; text-align: center; font-family: ${t.fontFamily};">
                ${t.footer(siteName)}
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
    subject: t.subject(code),
    text: `${t.subject(code)}\n${t.greeting}\n${code}\n${loginUrl}`,
    html,
  });
}
