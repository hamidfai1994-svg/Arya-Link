import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Otp } from '@/models/Otp.model';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'لطفاً آدرس ایمیل معتبر وارد نمایید.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'فرمت آدرس ایمیل نامعتبر است.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate 6-digit random English numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any previous OTP for this email and save the new one
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({
      email: cleanEmail,
      code,
      createdAt: new Date(),
    });

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // DEV MODE: If SMTP variables are missing, log to console and return success
    if (!smtpUser || !smtpPass) {
      console.log('--------------------------------------------------');
      console.log(`[DEV MODE OTP] Email: ${cleanEmail}`);
      console.log(`[DEV MODE OTP] Code:  ${code}`);
      console.log('--------------------------------------------------');

      return NextResponse.json({
        success: true,
        message: 'کد تایید تولید شد (حالت توسعه فعال است - کد در کنسول سرور چاپ گردید).',
        devMode: true,
        devCode: code,
      });
    }

    // PRODUCTION MODE: Send email via Nodemailer (Namecheap Private Email settings)
    const host = process.env.SMTP_HOST || 'mail.privateemail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const emailHtml = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 32px 16px; text-align: center;">
        <div style="max-width: 460px; margin: 0 auto; background-color: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: bold; color: #06b6d4;">Arya Link</span>
          </div>
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #ffffff;">کد تایید یک‌بار مصرف ورود</h2>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px;">
            جهت ورود یا ساخت اکانت در سامانه هوشمند آریا لینک، کد ۶ رقمی زیر را در کادر مربوطه وارد نمایید:
          </p>
          <div style="display: inline-block; background: rgba(6, 182, 212, 0.1); border: 2px dashed #06b6d4; border-radius: 16px; padding: 14px 28px; margin-bottom: 28px;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; font-family: monospace; color: #22d3ee;" dir="ltr">${code}</span>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 0;">
            این کد تا ۵ دقیقه دیگر معتبر است. اگر شما این درخواست را ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Arya Link Security" <${smtpUser}>`,
      to: cleanEmail,
      subject: `کد تایید ورود به آریا لینک: ${code}`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'کد تایید با موفقیت به ایمیل شما ارسال شد.',
      devMode: false,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'خطا در ارسال کد تایید.' },
      { status: 500 }
    );
  }
}

