import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Order } from '@/models/Order.model';
import { Payout } from '@/models/Payout.model';
import { User } from '@/models/User.model';

export const dynamic = 'force-dynamic';

function isFinancialAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'financial_admin'].includes(role);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isFinancialAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز به بخش مالی.' }, { status: 403 });
    }

    await connectToDatabase();

    // 1. Fetch all store product orders
    const allOrders = await Order.find({}).sort({ createdAt: -1 }).lean();

    // 2. Fetch all user payouts
    const allPayouts = await Payout.find({}).sort({ requestedAt: -1 }).lean();

    // 3. User subscription breakdown
    const proUsersCount = await User.countDocuments({ subscriptionPlan: 'pro' });
    const enterpriseUsersCount = await User.countDocuments({ subscriptionPlan: 'enterprise' });

    // Financial calculations
    const totalOrderRevenue = allOrders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const subscriptionRevenue = proUsersCount * 590 + enterpriseUsersCount * 2500;

    // Simulated NFC card sales
    const nfcCardRevenue = 145000;

    const totalGrossRevenue = totalOrderRevenue + subscriptionRevenue + nfcCardRevenue;

    const totalPayoutsPaid = allPayouts
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingPayoutsTotal = allPayouts
      .filter((p) => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      metrics: {
        totalGrossRevenue,
        nfcCardRevenue,
        subscriptionRevenue,
        storeSalesRevenue: totalOrderRevenue,
        totalPayoutsPaid,
        pendingPayoutsTotal,
        proSubscribersCount: proUsersCount,
        enterpriseSubscribersCount: enterpriseUsersCount,
        currency: 'AFN',
      },
      recentOrders: allOrders.slice(0, 10),
      recentPayouts: allPayouts.slice(0, 10),
      pendingPayouts: allPayouts.filter((p) => p.status === 'pending' || p.status === 'processing'),
    });
  } catch (error: any) {
    console.error('Error fetching admin finance:', error);
    return NextResponse.json({ success: false, message: 'خطا در بارگذاری اطلاعات مالی.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isFinancialAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { payoutId, action, referenceId, adminNote } = body;

    if (!payoutId || !action || !['pay', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'اطلاعات ناقص است.' }, { status: 400 });
    }

    const payout = await Payout.findById(payoutId);
    if (!payout) {
      return NextResponse.json({ success: false, message: 'درخواست تسویه یافت نشد.' }, { status: 404 });
    }

    if (action === 'pay') {
      payout.status = 'completed';
      payout.referenceId = referenceId || `TX-${Date.now().toString().slice(-6)}`;
      payout.adminNote = adminNote || 'واریز از طریق سامانه مالی انجام شد.';
      payout.processedAt = new Date();
      await payout.save();

      return NextResponse.json({ success: true, message: 'تسویه حساب با موفقیت پرداخت و تایید شد.' });
    } else {
      payout.status = 'rejected';
      payout.adminNote = adminNote || 'شماره حساب یا نام صاحب حساب مغایرت دارد.';
      payout.processedAt = new Date();
      await payout.save();

      return NextResponse.json({ success: true, message: 'درخواست تسویه رد شد.' });
    }
  } catch (error: any) {
    console.error('Error updating payout finance:', error);
    return NextResponse.json({ success: false, message: 'خطا در عملیات تسویه.' }, { status: 500 });
  }
}
