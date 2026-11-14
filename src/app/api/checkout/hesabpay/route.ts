import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Order } from '@/models/Order.model';
import { createHesabPayCheckoutSession } from '@/lib/payment/hesabpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'شناسه سفارش الزامی است.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'سفارش یافت نشد.' },
        { status: 404 }
      );
    }

    // Determine host
    const origin = req.headers.get('origin') || req.headers.get('host') || 'http://localhost:3000';
    const hostUrl = origin.startsWith('http') ? origin : `https://${origin}`;

    const sessionResult = await createHesabPayCheckoutSession({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      amount: order.totalPrice,
      currency: order.currency || 'AFN',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      description:
        order.orderType === 'subscription'
          ? `خرید اشتراک سالانه پروفایل حرفه‌ای آریا لینک #${order.orderNumber}`
          : `خرید کارت هوشمند NFC #${order.orderNumber} آریا لینک`,
      hostUrl,
    });

    if (!sessionResult.success) {
      return NextResponse.json(
        { success: false, message: sessionResult.message || 'خطا در ارتباط با حساب‌پی.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: sessionResult.checkoutUrl,
      invoiceId: sessionResult.invoiceId,
      isSandbox: sessionResult.isSandbox,
      message: sessionResult.message,
    });
  } catch (error: any) {
    console.error('Error in HesabPay checkout route:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور در ایجاد جلسه پرداخت حساب‌پی.', error: error?.message },
      { status: 500 }
    );
  }
}

