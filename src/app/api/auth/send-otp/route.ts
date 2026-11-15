import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Otp } from '@/models/Otp.model';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendVerificationEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, recaptchaToken, isResend } = body;

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

    // Allow legitimate resend if an unexpired OTP session already exists
    let skipRecaptcha = false;
    if (isResend) {
      const recentOtp = await Otp.findOne({ email: cleanEmail });
      if (recentOtp) {
        skipRecaptcha = true;
      }
    }

    if (!skipRecaptcha) {
      const remoteIp =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        undefined;

      const recaptchaResult = await verifyRecaptcha(recaptchaToken, remoteIp);
      if (!recaptchaResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: recaptchaResult.message || 'درخواست نامعتبر: اعتبارسنجی امنیتی تایید نشد.',
          },
          { status: 400 }
        );
      }
    }

    // Generate 6-digit random English numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any previous OTP for this email and save the new one
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({
      email: cleanEmail,
      code,
      createdAt: new Date(),
    });

    // Send real verification email via Hostinger SMTP
    await sendVerificationEmail(cleanEmail, code);

    return NextResponse.json({
      success: true,
      message: 'کد تایید با موفقیت به ایمیل شما ارسال شد. لطفاً صندوق ورودی (و پوشه اسپم) خود را بررسی کنید.',
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'خطا در ارسال کد تایید.' },
      { status: 500 }
    );
  }
}

