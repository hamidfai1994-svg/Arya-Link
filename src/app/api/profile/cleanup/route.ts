import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { buildUserIsolationQuery, isValidUserSession } from '@/lib/db/data-isolation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userQuery = buildUserIsolationQuery(session!.user);

    const userProfiles = await Profile.find(userQuery).sort({ createdAt: 1 });

    if (userProfiles.length <= 1) {
      return NextResponse.json({
        success: true,
        message: 'شما فقط یک پروفایل دارید و نیازی به پاکسازی نیست.',
        deletedCount: 0,
      });
    }

    // Keep the first/primary profile
    const primaryProfile = userProfiles[0];
    const duplicateIds = userProfiles.slice(1).map((p) => p._id);

    // Strictly limit deleteMany to IDs matching this user's isolation query
    const deleteResult = await Profile.deleteMany({
      _id: { $in: duplicateIds },
      ...userQuery,
    });

    return NextResponse.json({
      success: true,
      message: `${deleteResult.deletedCount} پروفایل تکراری با موفقیت حذف شدند و حساب شما یکپارچه شد.`,
      keptProfile: {
        id: primaryProfile._id.toString(),
        alias: primaryProfile.alias,
        displayName: primaryProfile.displayName,
      },
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error: any) {
    console.error('Profile cleanup API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطایی در پاکسازی پروفایل‌ها رخ داد.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
