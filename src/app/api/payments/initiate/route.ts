import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { createHesabPayCheckoutSession } from '@/lib/payment/hesabpay';
import { StorePaymentSettings } from '@/models/StorePaymentSettings.model';
import { Transaction } from '@/models/Transaction.model';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      amount,
      currency,
      orderId,
      orderNumber,
      description,
      customerName,
      customerPhone,
      profileName,
      profileId,
      profileAlias,
    } = body;

    await connectToDatabase();

    let ownerMerchantId: string | undefined;
    let ownerApiKey: string | undefined;
    let targetProfile: any = null;

    // Strict Offline Architecture for Mini-Site Users: Direct API payment is reserved exclusively for Platform / Super Admin
    if (profileId || profileAlias) {
      return NextResponse.json(
        {
          success: false,
          message:
            'پرداخت در مینی‌سایت کاربران صرفاً به صورت آفلاین (اسکن بارکد و آپلود فیش واریزی) انجام می‌شود.',
        },
        { status: 400 }
      );
    } else {
      // Platform / Super Admin store order fallback
      const settings = await StorePaymentSettings.findOne().lean();
      const hpSettings = settings?.hesabPay;

      if (hpSettings && hpSettings.isApiEnabled === false) {
        return NextResponse.json(
          {
            success: false,
            message:
              'درگاه آنلاین حساب‌پی در حال حاضر غیرفعال است. لطفاً از گزینه پرداخت از طریق صراف / دکاندار استفاده فرمایید.',
          },
          { status: 400 }
        );
      }

      ownerMerchantId = hpSettings?.merchantId;
      ownerApiKey = hpSettings?.apiKey;
    }

    // Determine host origin for seamless redirect
    const origin = req.headers.get('origin') || req.headers.get('host') || 'http://localhost:3000';
    const hostUrl = origin.startsWith('http') ? origin : `https://${origin}`;

    const effectiveOrderNum = orderNumber || `PAY-${Date.now().toString().slice(-6)}`;
    const effectiveOrderId = orderId || `adhoc_${Date.now()}`;
    const effectiveAmount = Math.max(Number(amount) || 100, 1);

    const sessionResult = await createHesabPayCheckoutSession({
      orderId: effectiveOrderId,
      orderNumber: effectiveOrderNum,
      amount: effectiveAmount,
      currency: (currency as any) || 'AFN',
      customerName: customerName || profileName || 'مشتری حساب‌پی آریا لینک',
      customerPhone: customerPhone || '',
      description: description || `پرداخت آنلاین با حساب‌پی - ${profileName || targetProfile?.displayName || 'آریا لینک'}`,
      hostUrl,
      merchantId: ownerMerchantId,
      apiKey: ownerApiKey,
    });

    if (!sessionResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: sessionResult.message || 'خطا در برقراری ارتباط با درگاه حساب‌پی.',
        },
        { status: 500 }
      );
    }

    // Record transaction with paymentGateway & paymentMode tracking
    try {
      await Transaction.create({
        profileId: targetProfile?._id || undefined,
        userId: targetProfile?.userId || undefined,
        amount: effectiveAmount,
        type: targetProfile ? 'donation_hesabpay' : 'order_payment',
        status: 'pending',
        currency: (currency as any) || 'AFN',
        description: description || `پرداخت آنلاین مستقیم با حساب‌پی (${targetProfile?.displayName || profileName || 'سفارش'})`,
        paymentGateway: 'hesabpay',
        paymentMode: 'api',
        referenceNumber: sessionResult.invoiceId || '',
      });
    } catch (txErr) {
      console.warn('Non-critical: Could not record transaction log:', txErr);
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: sessionResult.checkoutUrl,
      invoiceId: sessionResult.invoiceId,
      isSandbox: sessionResult.isSandbox,
      message: sessionResult.message || 'جلسه پرداخت آنلاین با موفقیت ایجاد گردید.',
    });
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطای سرور در ایجاد جلسه پرداخت حساب‌پی.',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
