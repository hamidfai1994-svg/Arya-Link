import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isVerified: !!user.isVerified,
      verificationStatus: user.verificationStatus || 'unverified',
      kycData: user.kycData || {},
    });
  } catch (error: any) {
    console.error('Error fetching KYC info:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری اطلاعات احراز هویت.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userId = session.user.id;
    const body = await req.json();
    const { nationalId, documentType, selfieUrl, documentUrl, fullName } = body;

    if (!nationalId || !documentType || !selfieUrl || !documentUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'لطفاً تمام موارد خواسته شده (شماره مدرک، عکس سلفی، و تصویر مدرک شناسایی) را وارد کنید.',
        },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          verificationStatus: 'pending',
          kycData: {
            fullName: fullName || session.user.name,
            nationalId: nationalId.trim(),
            documentType,
            selfieUrl,
            documentUrl,
            submittedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    // Also mark user's profiles with pending verification status
    await Profile.updateMany(
      { userId },
      { $set: { verificationStatus: 'pending' } }
    );

    return NextResponse.json({
      success: true,
      message: 'مدارک احراز هویت با موفقیت ثبت شد و در صف بررسی ادمین قرار گرفت.',
      verificationStatus: 'pending',
      kycData: updatedUser?.kycData,
    });
  } catch (error: any) {
    console.error('Error submitting KYC:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت مدارک احراز هویت.' },
      { status: 500 }
    );
  }
}
