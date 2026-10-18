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
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران سیستم مجاز هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch profile counts per user
    const userIds = users.map((u) => u._id.toString());
    const profiles = await Profile.find({}).select('userId alias').lean();

    const profilesCountMap: Record<string, number> = {};
    profiles.forEach((p) => {
      const uId = p.userId?.toString();
      if (uId) {
        profilesCountMap[uId] = (profilesCountMap[uId] || 0) + 1;
      }
    });

    const enrichedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      avatar: u.avatar || '',
      phone: u.phone || '',
      role: u.role,
      subscriptionPlan: u.subscriptionPlan || 'free',
      isActive: u.isActive !== false,
      isVerified: !!u.isVerified,
      verificationStatus: u.verificationStatus || 'unverified',
      kycData: u.kycData || {},
      profilesCount: profilesCountMap[u._id.toString()] || 0,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    }));

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      totalUsers: users.length,
      verifiedUsersCount: users.filter((u) => u.isVerified).length,
      pendingKycCount: users.filter((u) => u.verificationStatus === 'pending').length,
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در واکشی کاربران.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    const { userId, role, isActive, subscriptionPlan } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'شناسه کاربر الزامی است.' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (role && ['user', 'admin', 'superadmin', 'financial_admin', 'content_editor'].includes(role)) {
      updates.role = role;
    }
    if (typeof isActive === 'boolean') {
      updates.isActive = isActive;
    }
    if (subscriptionPlan && ['free', 'pro', 'enterprise'].includes(subscriptionPlan)) {
      updates.subscriptionPlan = subscriptionPlan;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-password');

    return NextResponse.json({
      success: true,
      message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد.',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ویرایش کاربر.' },
      { status: 500 }
    );
  }
}
