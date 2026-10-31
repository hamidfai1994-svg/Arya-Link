import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { User } from '@/models/User.model';
import { Payout } from '@/models/Payout.model';
import { Order } from '@/models/Order.model';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد.' },
        { status: 404 }
      );
    }

    const isVerified = !!user.isVerified;

    // Fetch user's payouts
    const payouts = await Payout.find({ userId })
      .sort({ requestedAt: -1 })
      .lean();

    // Calculate revenue from paid orders
    const paidOrders = await Order.find({ sellerUserId: userId, paymentStatus: 'paid' }).lean();
    const totalEarned = paidOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

    // Sum completed/pending payouts
    const totalWithdrawn = payouts
      .filter((p) => p.status === 'completed')
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const pendingPayoutAmount = payouts
      .filter((p) => p.status === 'pending' || p.status === 'processing')
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const availableBalance = Math.max(0, totalEarned - totalWithdrawn - pendingPayoutAmount);

    return NextResponse.json({
      success: true,
      isVerified,
      verificationStatus: user.verificationStatus || 'unverified',
      balance: {
        totalEarned,
        totalWithdrawn,
        pendingPayoutAmount,
        availableBalance,
        currency: 'AFN',
      },
      payouts: payouts.map((p: any) => ({
        id: p._id.toString(),
        amount: p.amount,
        currency: p.currency,
        bankOrProvider: p.bankOrProvider,
        accountTitle: p.accountTitle,
        accountNumber: p.accountNumber,
        status: p.status,
        referenceId: p.referenceId,
        adminNote: p.adminNote,
        requestedAt: p.requestedAt,
        processedAt: p.processedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری اطلاعات تسویه.' },
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
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'کاربر یافت نشد.' },
        { status: 404 }
      );
    }

    // Critical check: KYC verified
    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          isVerified: false,
          message: 'جهت درخواست تسویه حساب، ابتدا باید هویت خود را در سامانه احراز کنید.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { amount, bankOrProvider, accountTitle, accountNumber, currency } = body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      return NextResponse.json(
        { success: false, message: 'حداقل مبلغ قابل برداشت 100 افغانی است.' },
        { status: 400 }
      );
    }

    if (!bankOrProvider || !accountTitle || !accountNumber) {
      return NextResponse.json(
        { success: false, message: 'لطفاً تمام فیلدهای مربوط به حساب بانکی/صرافی را پر کنید.' },
        { status: 400 }
      );
    }

    // Calculate current available balance
    const paidOrders = await Order.find({ sellerUserId: userId, paymentStatus: 'paid' }).lean();
    const totalEarned = paidOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

    const payouts = await Payout.find({ userId }).lean();
    const totalOut = payouts
      .filter((p) => p.status === 'completed' || p.status === 'pending' || p.status === 'processing')
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const availableBalance = Math.max(0, totalEarned - totalOut);

    if (numAmount > availableBalance) {
      return NextResponse.json(
        {
          success: false,
          message: `موجودی ناکافی است. حداکثر مبلغ قابل برداشت: ${availableBalance.toLocaleString('en-US')} افغانی`,
        },
        { status: 400 }
      );
    }

    const newPayout = await Payout.create({
      userId,
      amount: numAmount,
      currency: currency || 'AFN',
      bankOrProvider,
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      status: 'pending',
      requestedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'درخواست تسویه با موفقیت ثبت شد و در صف واریز مالی قرار گرفت.',
      payout: newPayout,
    });
  } catch (error: any) {
    console.error('Error creating payout request:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت درخواست تسویه.' },
      { status: 500 }
    );
  }
}
