import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncAndCheckUserSubscription } from '@/lib/utils/subscription';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        subscription: {
          planType: 'free',
          isPro: false,
          isVip: false,
          isExpired: false,
          daysRemaining: 0,
        },
      });
    }

    const result = await syncAndCheckUserSubscription(session.user.id);
    return NextResponse.json({
      success: true,
      subscription: result,
    });
  } catch (error: any) {
    console.error('Error fetching user subscription status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در دریافت وضعیت اشتراک کاربری.',
      },
      { status: 500 }
    );
  }
}

