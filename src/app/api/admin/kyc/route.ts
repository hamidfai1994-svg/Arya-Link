import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return role === 'admin' || role === 'superadmin';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Fetch users who submitted KYC or are pending/verified/rejected
    const users = await User.find({
      $or: [
        { verificationStatus: { $in: ['pending', 'verified', 'rejected'] } },
        { 'kycData.selfieUrl': { $exists: true, $ne: '' } },
        { isVerified: true },
      ],
    })
      .select('name email phone avatar isVerified verificationStatus kycData createdAt')
      .sort({ 'kycData.submittedAt': -1, updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      requests: users.map((u: any) => ({
        userId: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        isVerified: !!u.isVerified,
        verificationStatus: u.verificationStatus || 'unverified',
        kycData: u.kycData || {},
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching KYC requests:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت لیست احراز هویت.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { userId, action, rejectionReason } = body;

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'شناسه کاربر و نوع عملیات الزامی است.' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      user.isVerified = true;
      user.verificationStatus = 'verified';
      if (!user.kycData) user.kycData = {};
      user.kycData.reviewedAt = new Date();
      user.kycData.rejectionReason = undefined;
      await user.save();

      // Update all profiles of this user to verified
      await Profile.updateMany(
        { userId: user._id },
        { $set: { isVerified: true, verificationStatus: 'verified' } }
      );

      return NextResponse.json({
        success: true,
        message: `احراز هویت کاربر «${user.name}» با موفقیت تایید شد. تیک آبی فعال و قفل فروشگاه باز شد.`,
        isVerified: true,
        verificationStatus: 'verified',
      });
    } else {
      user.isVerified = false;
      user.verificationStatus = 'rejected';
      if (!user.kycData) user.kycData = {};
      user.kycData.reviewedAt = new Date();
      user.kycData.rejectionReason = rejectionReason || 'مدارک ارسالی ناخوانا یا نامعتبر است.';
      await user.save();

      await Profile.updateMany(
        { userId: user._id },
        { $set: { isVerified: false, verificationStatus: 'rejected' } }
      );

      return NextResponse.json({
        success: true,
        message: `درخواست احراز هویت کاربر «${user.name}» رد شد.`,
        isVerified: false,
        verificationStatus: 'rejected',
      });
    }
  } catch (error: any) {
    console.error('Error processing KYC action:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در انجام عملیات احراز هویت.' },
      { status: 500 }
    );
  }
}
