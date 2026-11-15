import nodemailer from 'nodemailer';
import { getSiteSettings } from '@/lib/settings';

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
 * Resolves an absolute public logo URL for email clients (fallback to hosted Arya Link logo).
 */
function resolveEmailLogoUrl(rawLogo?: string | null): string {
  const clean = (rawLogo || '').trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.startsWith('/')) {
    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      'https://aryalink.af'
    ).replace(/\/$/, '');
    return `${baseUrl}${clean}`;
  }
  return 'https://i.postimg.cc/wT3GQCv8/logo.png';
}

/**
 * Sends a localized Afghan Dari OTP verification email via Hostinger SMTP.
 */
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpFromRaw = (process.env.SMTP_FROM || '').trim();

  if (!smtpUser || !smtpPass) {
    throw new Error('تنظیمات سرویس ایمیل (SMTP) روی سرور تکمیل نشده است.');
  }

  let siteName = 'آریا لینک | Arya Link';
  let logoUrl = 'https://i.postimg.cc/wT3GQCv8/logo.png';

  try {
    const settings = await getSiteSettings();
    if (settings?.siteName) {
      siteName = settings.siteName;
    }
    logoUrl = resolveEmailLogoUrl(settings?.platformMainLogo || settings?.companyLogo);
  } catch {
    // Fallback to default brand values if DB settings lookup fails
  }

  const senderEmail = smtpFromRaw || smtpUser;
  const fromAddress = senderEmail.includes('<')
    ? senderEmail
    : `"${siteName}" <${senderEmail}>`;

  const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>کد تایید ورود به آریا لینک</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: Tahoma, 'Segoe UI', Arial, sans-serif; color: #f8fafc; direction: rtl;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #111827; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #0ea5e9 0%, #06b6d4 50%, #2563eb 100%);"></td>
          </tr>

          <!-- Header & Logo -->
          <tr>
            <td align="center" style="padding: 32px 28px 16px 28px;">
              <img src="${logoUrl}" alt="${siteName}" width="64" height="64" style="display: block; max-width: 64px; height: auto; border-radius: 14px; margin-bottom: 14px;" />
              <div style="font-size: 20px; font-weight: bold; color: #22d3ee; letter-spacing: 0.5px;">
                آریا لینک <span style="color: #94a3b8; font-weight: normal; font-size: 14px;">| Arya Link</span>
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td align="center" style="padding: 8px 32px 28px 32px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; font-size: 19px; font-weight: bold; color: #ffffff; line-height: 1.5;">
                کد تایید ورود شما به آریا لینک: <span dir="ltr" style="color: #22d3ee;">${code}</span>
              </h1>
              <p style="margin: 0 0 26px 0; font-size: 13px; color: #cbd5e1; line-height: 1.8;">
                کاربر گرامی، سلام! جهت ورود یا تکمیل دسترسی به اکانت کاربری خود در سیستم هوشمند آریا لینک، کد تایید ۶ رقمی زیر را در صفحه ورود درج نمایید:
              </p>

              <!-- OTP Box -->
              <div style="display: inline-block; background-color: #0f172a; border: 2px dashed #06b6d4; border-radius: 16px; padding: 16px 34px; margin-bottom: 26px;">
                <span dir="ltr" style="font-size: 32px; font-weight: 900; letter-spacing: 8px; font-family: 'Courier New', monospace; color: #22d3ee; display: inline-block;">${code}</span>
              </div>

              <div style="background-color: rgba(14, 165, 233, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.7;">
                  این کد یکبار مصرف تا <strong style="color: #e2e8f0;">۵ دقیقه</strong> دیگر معتبر است. لطفاً آن را در اختیار دیگران قرار ندهید. اگر شما این درخواست را ثبت نکرده‌اید، این ایمیل را نادیده بگیرید.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #0b1120; padding: 18px 24px; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.6;">
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
    subject: `کد تایید ورود شما به آریا لینک: ${code}`,
    text: `کد تایید ورود شما به آریا لینک: ${code}\nاین کد تا ۵ دقیقه دیگر معتبر است.`,
    html,
  });
}
