import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'احراز هویت الزامی است.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).select('financialSettings').lean();
    const hesabPay = user?.financialSettings?.hesabPay || {
      isApiEnabled: false,
      merchantId: '',
      apiKey: '',
      accountNumber: '',
      accountName: '',
      qrCodeImage: '',
      instructions: '',
      isActive: true,
    };

    return NextResponse.json({
      success: true,
      settings: {
        hesabPay: {
          isApiEnabled: false,
          merchantId: '',
          apiKey: '',
          accountNumber: hesabPay.accountNumber || '',
          accountName: hesabPay.accountName || '',
          qrCodeImage: hesabPay.qrCodeImage || '',
          instructions: hesabPay.instructions || '',
          isActive: hesabPay.isActive !== false,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching user financial settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری تنظیمات مالی کاربر.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'احراز هویت الزامی است.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { hesabPay } = body;

    if (!hesabPay) {
      return NextResponse.json(
        { success: false, message: 'اطلاعات درگاه حساب‌پی ارسال نشده است.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Mini-site users are strictly offline (API credentials stripped)
    const sanitizedHesabPay = {
      isApiEnabled: false,
      merchantId: '',
      apiKey: '',
      accountNumber: (hesabPay.accountNumber || '').trim(),
      accountName: (hesabPay.accountName || '').trim(),
      qrCodeImage: (hesabPay.qrCodeImage || '').trim(),
      instructions: (hesabPay.instructions || '').trim(),
      isActive: hesabPay.isActive !== false,
    };

    // Update User model
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        'financialSettings.hesabPay': sanitizedHesabPay,
      },
    });

    // Synchronize to all profiles owned by this user
    await Profile.updateMany(
      { userId: session.user.id },
      {
        $set: {
          'financialSettings.hesabPay': sanitizedHesabPay,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'تنظیمات اختصاصی درگاه حساب‌پی با موفقیت ذخیره گردید.',
      settings: {
        hesabPay: sanitizedHesabPay,
      },
    });
  } catch (error: any) {
    console.error('Error updating user financial settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره‌سازی تنظیمات درگاه مالی.' },
      { status: 500 }
    );
  }
}

