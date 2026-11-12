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

    const transaction = await Transaction.create({
      profileId: targetProfile?._id || undefined,
      userId: targetProfile?.userId || undefined,
      amount: effectiveAmount,
      type: 'donation_hesabpay',
      status: 'pending',
      currency: currency || 'AFN',
      description: description || `ثبت فیش واریزی صراف/دکاندار (${targetProfile?.displayName || 'پروفایل'})`,
      paymentGateway: (paymentGateway || 'hesabpay').toLowerCase(),
      paymentMode: (paymentMode || 'manual').toLowerCase(),
      referenceNumber: trackingNumber || '',
      receiptUrl: receiptImageUrl || '',
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction._id.toString(),
      message: 'رسید شما با موفقیت ثبت گردید و جهت تایید به صاحب پروفایل ارسال شد.',
    });
  } catch (error: any) {
    console.error('Error recording payment receipt:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت مشخصات رسید واریز.' },
      { status: 500 }
    );
  }
}

