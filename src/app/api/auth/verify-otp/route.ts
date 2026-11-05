import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Otp } from '@/models/Otp.model';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'ایمیل و کد تایید الزامی است.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    await connectToDatabase();

    const validOtp = await Otp.findOne({ email: cleanEmail, code: cleanCode });
    if (!validOtp) {
      return NextResponse.json(
        { success: false, message: 'کد تایید نادرست یا منقضی شده است.' },
        { status: 400 }
      );
    }

    // Delete used OTP
    await Otp.deleteMany({ email: cleanEmail });

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const defaultName = cleanEmail.split('@')[0] || 'کاربر جدید';
      user = await User.create({
        name: defaultName,
        email: cleanEmail,
        role: 'user',
        isActive: true,
        lastLoginAt: new Date(),
      });

      let clean = defaultName.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
      if (!clean || clean.length < 2) clean = 'user';
      let alias = `${clean}_${Math.floor(100 + Math.random() * 900)}`;
      while (await Profile.findOne({ alias })) {
        alias = `${clean}_${Math.floor(100 + Math.random() * 900)}`;
      }

      await Profile.create({
        userId: user._id,
        alias,
        displayName: defaultName,
        themeConfig: { preset: 'modern_dark' },
        links: [],
      });
    } else {
      if (!user.isActive) {
        return NextResponse.json(
          { success: false, message: 'حساب کاربری شما غیرفعال شده است.' },
          { status: 403 }
        );
      }
      user.lastLoginAt = new Date();
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'کد تایید با موفقیت تایید شد.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'خطا در بررسی کد تایید.' },
      { status: 500 }
    );
  }
}

