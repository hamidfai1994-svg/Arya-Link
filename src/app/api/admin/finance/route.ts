import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Order } from '@/models/Order.model';
import { Payout } from '@/models/Payout.model';
import { User } from '@/models/User.model';
import { AuditLog } from '@/models/AuditLog.model';

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

    // 1. Fetch all store product orders (excluding soft-deleted & mock items)
    const fakeFilter = {
      orderNumber: { $nin: ['ORD-84920', 'ORD-84921', 'ORD-84922'] },
      customerName: { $nin: ['محمد ابراهیمی', 'سارا عزیزی', 'احمد فیاض'] },
      isDeleted: { $ne: true },
    };
    const allOrders = await Order.find(fakeFilter).sort({ createdAt: -1 }).lean();

    // 2. Fetch all user payouts (excluding soft-deleted)
    const allPayouts = await Payout.find({ isDeleted: { $ne: true } }).sort({ requestedAt: -1 }).lean();

    // 3. User subscription breakdown
    const proUsersCount = await User.countDocuments({ subscriptionPlan: 'pro' });
    const enterpriseUsersCount = await User.countDocuments({ subscriptionPlan: 'enterprise' });

    // Financial calculations based strictly on real database data
    const paidOrders = allOrders.filter((o) => o.paymentStatus === 'paid');
    const totalOrderRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const subscriptionRevenue = proUsersCount * 590 + enterpriseUsersCount * 2500;

    // Real NFC card sales from paid orders
    const nfcCardRevenue = paidOrders
      .filter((o) => o.productTitle?.includes('NFC') || o.cardSpecs)
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const totalGrossRevenue = totalOrderRevenue + subscriptionRevenue;

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isFinancialAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز برای حذف تراکنش‌های مالی.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { recordId, recordType, reason } = body;

    if (!recordId || !recordType) {
      return NextResponse.json(
        { success: false, message: 'شناسه و نوع رکورد مالی الزامی است.' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json(
        { success: false, message: 'درج دلیل حذف الزامی است و در گزارش حسابرسی امنیتی ثبت می‌شود.' },
        { status: 400 }
      );
    }

    const adminName = session.user.name || 'مدیر مالی';
    const adminEmail = session.user.email || 'admin@aryalink.af';

    if (recordType === 'payout') {
      const payout = await Payout.findById(recordId);
      if (!payout) {
        return NextResponse.json({ success: false, message: 'رکورد تسویه حساب یافت نشد.' }, { status: 404 });
      }

      payout.isDeleted = true;
      payout.deletedAt = new Date();
      payout.deletedBy = adminName;
      payout.deletedReason = reason.trim();
      await payout.save();

      await AuditLog.create({
        recordType: 'payout',
        recordId: payout._id.toString(),
        referenceNumber: payout.referenceId || `PO-${payout._id.toString().slice(-6)}`,
        title: `تسویه حساب: ${(payout as any).accountHolderName || payout.accountTitle} (${payout.bankOrProvider})`,
        amount: payout.amount,
        currency: payout.currency || 'AFN',
        deletedByAdminName: adminName,
        deletedByAdminEmail: adminEmail,
        deletedAt: new Date(),
        deletedReason: reason.trim(),
        originalData: payout.toObject ? payout.toObject() : payout,
      });

      return NextResponse.json({
        success: true,
        message: 'رکورد تسویه حساب با موفقیت به زباله‌دان سیستم منتقل گردید.',
      });
    } else {
      // Order/Transaction deletion
      const order = await Order.findById(recordId);
      if (!order) {
        return NextResponse.json({ success: false, message: 'تراکنش سفارش یافت نشد.' }, { status: 404 });
      }

      order.isDeleted = true;
      order.deletedAt = new Date();
      order.deletedBy = adminName;
      order.deletedReason = reason.trim();
      await order.save();

      await AuditLog.create({
        recordType: 'transaction',
        recordId: order._id.toString(),
        referenceNumber: order.orderNumber,
        title: `تراکنش سفارش #${order.orderNumber} (${order.customerName})`,
        amount: order.totalPrice,
        currency: order.currency || 'AFN',
        deletedByAdminName: adminName,
        deletedByAdminEmail: adminEmail,
        deletedAt: new Date(),
        deletedReason: reason.trim(),
        originalData: order.toObject ? order.toObject() : order,
      });

      return NextResponse.json({
        success: true,
        message: `تراکنش #${order.orderNumber} با موفقیت به زباله‌دان سیستم منتقل گردید.`,
      });
    }
  } catch (error: any) {
    console.error('Error soft deleting finance record:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف امن رکورد مالی.' },
      { status: 500 }
    );
  }
}
