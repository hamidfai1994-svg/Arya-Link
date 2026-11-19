import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';
import { isValidUserSession } from '@/lib/db/data-isolation';
import { syncAndCheckUserSubscription } from '@/lib/utils/subscription';
import { deleteReplacedFileIfUnused } from '@/lib/storage/file-manager';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail, normalizeEmailLocale } from '@/lib/mail';
import { getRequestLocale } from '@/lib/i18n/server-locale';
import { tServer } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';

interface EmailChangeOtpRecord {
  email: string;
  otp: string;
  expiresAt: number;
}

// In-memory cache for Email Change OTPs: userId -> { email, otp, expiresAt }
const globalForOtp = global as unknown as {
  emailChangeOtpStore?: Map<string, EmailChangeOtpRecord>;
};

const emailChangeOtpStore =
  globalForOtp.emailChangeOtpStore || new Map<string, EmailChangeOtpRecord>();
if (process.env.NODE_ENV !== 'production') {
  globalForOtp.emailChangeOtpStore = emailChangeOtpStore;
}

// GET: Retrieve authenticated user account details
export async function GET(req: NextRequest) {
  const locale = getRequestLocale(req);
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: tServer(locale, 'toast.unauthorized') },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    const subInfo = await syncAndCheckUserSubscription(session.user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role,
        subscriptionPlan: subInfo.planType,
        planType: subInfo.planType,
        planExpiresAt: subInfo.planExpiresAt || null,
        features: subInfo.features || {},
        isVerified: Boolean(user.isVerified),
        verificationStatus: user.verificationStatus || 'unverified',
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error fetching account details:', err);
    return NextResponse.json(
      { success: false, message: tServer(locale, 'toast.network_error') },
      { status: 500 }
    );
  }
}

// PATCH: Update account profile info, verify email with OTP, or change password
export async function PATCH(req: NextRequest) {
  let locale = getRequestLocale(req);
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: tServer(locale, 'toast.unauthorized') },
        { status: 401 }
      );
    }

    const body = await req.json();
    locale = getRequestLocale(req, body?.locale || body?.language);
    const { action, newEmail, otpCode, name, phone, avatar, currentPassword, newPassword } = body;

    await connectToDatabase();

    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر مورد نظر پیدا نشد.' },
        { status: 404 }
      );
    }

    // =========================================================================
    // 1. ACTION: SEND OTP FOR EMAIL CHANGE
    // =========================================================================
    if (action === 'send_email_otp') {
      if (!newEmail || typeof newEmail !== 'string') {
        return NextResponse.json(
          { success: false, message: tServer(locale, 'validation.email_invalid') },
          { status: 400 }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const targetEmail = newEmail.trim().toLowerCase();

      if (!emailRegex.test(targetEmail)) {
        return NextResponse.json(
          { success: false, message: tServer(locale, 'validation.email_invalid') },
          { status: 400 }
        );
      }

      if (targetEmail === user.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, message: tServer(locale, 'toast.register_duplicate') },
          { status: 400 }
        );
      }

      // Check if another account already owns this email
      const existingUser = await User.findOne({
        email: targetEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: tServer(locale, 'toast.register_duplicate') },
          { status: 400 }
        );
      }

      // Generate 6-digit pure numerical OTP code
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      emailChangeOtpStore.set(user._id.toString(), {
        email: targetEmail,
        otp: generatedOtp,
        expiresAt,
      });

      // Send real localized verification email via Hostinger SMTP
      const rawLocale = body.locale || locale || req.headers.get('accept-language') || req.cookies.get('NEXT_LOCALE')?.value || 'fa';
      const userLocale = normalizeEmailLocale(rawLocale);
      try {
        await sendVerificationEmail(targetEmail, generatedOtp, userLocale);
      } catch (mailErr) {
        console.warn('[Email Change OTP] Could not send email via SMTP:', mailErr);
      }

      console.log(`[Email Change OTP] Code for user ${user._id} to ${targetEmail}: ${generatedOtp}`);

      return NextResponse.json({
        success: true,
        message: `کد تایید 6 رقمی به آدرس ایمیل ${targetEmail} ارسال گردید.`,
        expiresInSeconds: 600,
        // In local/test mode, provide demoOtp for immediate convenience
        demoOtp: process.env.NODE_ENV !== 'production' ? generatedOtp : undefined,
      });
    }

    // =========================================================================
    // 2. ACTION: VERIFY OTP AND COMMIT EMAIL CHANGE
    // =========================================================================
    if (action === 'verify_email_otp') {
      if (!newEmail || !otpCode || typeof otpCode !== 'string') {
        return NextResponse.json(
          { success: false, message: 'آدرس ایمیل و کد تایید 6 رقمی الزامی است.' },
          { status: 400 }
        );
      }

      const targetEmail = newEmail.trim().toLowerCase();
      const cleanOtp = otpCode.trim();

      const record = emailChangeOtpStore.get(user._id.toString());
      if (!record || record.expiresAt < Date.now()) {
        return NextResponse.json(
          { success: false, message: 'کد تایید منقضی شده یا درخواستی یافت نشد. لطفاً مجدداً درخواست ارسال کد نمایید.' },
          { status: 400 }
        );
      }

      if (record.email !== targetEmail) {
        return NextResponse.json(
          { success: false, message: 'آدرس ایمیل با درخواست ثبت‌شده اولیه مطابقت ندارد.' },
          { status: 400 }
        );
      }

      if (record.otp !== cleanOtp) {
        return NextResponse.json(
          { success: false, message: 'کد تایید 6 رقمی وارد شده نادرست است. لطفاً دقت فرمایید.' },
          { status: 400 }
        );
      }

      // Re-verify uniqueness
      const conflictUser = await User.findOne({
        email: targetEmail,
        _id: { $ne: user._id },
      });

      if (conflictUser) {
        return NextResponse.json(
          { success: false, message: 'این آدرس ایمیل توسط کاربر دیگری تصاحب شده است.' },
          { status: 400 }
        );
      }

      // Commit email change
      const previousEmail = user.email;
      user.email = targetEmail;
      await user.save();

      // Clean up OTP entry
      emailChangeOtpStore.delete(user._id.toString());

      // Sync with user's created profiles
      try {
        await Profile.updateMany(
          { userId: user._id },
          { $set: { userEmail: targetEmail, email: targetEmail } }
        );
      } catch (syncErr) {
        console.warn('Profile email sync error:', syncErr);
      }

      return NextResponse.json({
        success: true,
        message: 'آدرس ایمیل حساب کاربری شما با موفقیت تغییر یافت.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatar: user.avatar || '',
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          isVerified: Boolean(user.isVerified),
          verificationStatus: user.verificationStatus || 'unverified',
          createdAt: user.createdAt,
        },
      });
    }

    // =========================================================================
    // 3. ACTION: UPDATE PERSONAL INFO & PASSWORD
    // =========================================================================
    if (name && typeof name === 'string') {
      user.name = name.trim();
    }
    if (phone !== undefined && typeof phone === 'string') {
      user.phone = phone.trim();
    }
    let previousAvatar: string | undefined;
    if (avatar !== undefined && typeof avatar === 'string') {
      previousAvatar = user.avatar;
      user.avatar = avatar.trim();
    }

    // 4. Change password logic
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: tServer(locale, 'validation.password_min') },
          { status: 400 }
        );
      }

      // If user has an existing password, verify the current password
      if (user.password) {
        if (!currentPassword) {
          return NextResponse.json(
            { success: false, message: tServer(locale, 'validation.required') },
            { status: 400 }
          );
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json(
            { success: false, message: tServer(locale, 'toast.forbidden') },
            { status: 400 }
          );
        }
      }

      // Hash and set new password
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    if (previousAvatar !== undefined) {
      await deleteReplacedFileIfUnused(previousAvatar, user.avatar);
    }

    return NextResponse.json({
      success: true,
      message: tServer(locale, 'api.account.profile_updated'),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        isVerified: Boolean(user.isVerified),
        verificationStatus: user.verificationStatus || 'unverified',
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error updating account info:', err);
    return NextResponse.json(
      { success: false, message: tServer(locale, 'toast.save_error') },
      { status: 500 }
    );
  }
}
