import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { Transaction } from '@/models/Transaction.model';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      profileId,
      profileAlias,
      payerName,
      amount,
      currency,
      description,
      trackingNumber,
      receiptImageUrl,
      paymentGateway = 'hesabpay',
      paymentMode = 'manual',
    } = body;

    await connectToDatabase();

    let targetProfile = null;
    if (profileId) {
      targetProfile = await Profile.findById(profileId).lean();
    } else if (profileAlias) {
      targetProfile = await Profile.findOne({ alias: profileAlias.toLowerCase().trim() }).lean();
    }

    const effectiveAmount = Math.max(Number(amount) || 0, 0);
    const trimmedPayerName = (payerName || '').trim();
    const baseDescription =
      description || `ثبت فیش واریزی آفلاین (${targetProfile?.displayName || 'مینی‌سایت'})`;

    const transaction = await Transaction.create({
      profileId: targetProfile?._id || undefined,
      userId: targetProfile?.userId || undefined,
      payerName: trimmedPayerName,
      amount: effectiveAmount,
      type: 'donation_hesabpay',
      status: 'pending_verification',
      currency: currency || 'AFN',
      description: trimmedPayerName
        ? `${baseDescription} - پرداخت‌کننده: ${trimmedPayerName}`
        : baseDescription,
      paymentGateway: (paymentGateway || 'hesabpay').toLowerCase(),
      paymentMode: (paymentMode || 'manual').toLowerCase(),
      referenceNumber: trackingNumber || '',
      receiptUrl: receiptImageUrl || '',
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction._id.toString(),
      status: transaction.status,
      message: 'رسید شما با موفقیت با وضعیت در انتظار بررسی ثبت گردید و برای صاحب پروفایل ارسال شد.',
    });
  } catch (error: any) {
    console.error('Error recording payment receipt:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت مشخصات رسید واریز.' },
      { status: 500 }
    );
  }
}

