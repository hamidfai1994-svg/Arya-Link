import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Order } from '@/models/Order.model';
import { activateUserSubscriptionFromOrder } from '@/lib/utils/subscription';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    const status = searchParams.get('status') || 'SUCCESS';
    const transactionId = searchParams.get('transactionId') || `HP-TX-${Date.now()}`;

    const host = req.nextUrl.origin || 'http://localhost:3000';

    if (!orderId && !orderNumber) {
      return NextResponse.redirect(`${host}/order?paymentError=missing_order_reference`);
    }

    await connectToDatabase();

    const query: any = {};
    if (orderId) query._id = orderId;
    else if (orderNumber) query.orderNumber = orderNumber;

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.redirect(`${host}/order?paymentError=order_not_found`);
    }

    const isSubscription = order.orderType === 'subscription';

    if (status.toUpperCase() === 'SUCCESS' || status.toLowerCase() === 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = isSubscription ? 'completed' : 'processing';
      order.status = order.orderStatus;
      if (!order.paymentProviderDetails) {
        order.paymentProviderDetails = {};
      }
      order.paymentProviderDetails.providerType = 'wallet';
      order.paymentProviderDetails.walletService = 'حساب‌پی (HesabPay)';
      order.paymentProviderDetails.transactionRef = transactionId;
      await order.save();

      if (isSubscription) {
        await activateUserSubscriptionFromOrder(order);
        return NextResponse.redirect(
          `${host}/dashboard/upgrade?paymentSuccess=true&orderNumber=${encodeURIComponent(order.orderNumber)}`
        );
      }

      return NextResponse.redirect(
        `${host}/order?paymentSuccess=true&orderNumber=${encodeURIComponent(order.orderNumber)}`
      );
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      if (isSubscription) {
        return NextResponse.redirect(
          `${host}/dashboard/upgrade?paymentFailed=true&orderNumber=${encodeURIComponent(order.orderNumber)}`
        );
      }

      return NextResponse.redirect(
        `${host}/order?paymentFailed=true&orderNumber=${encodeURIComponent(order.orderNumber)}`
      );
    }
  } catch (error: any) {
    console.error('Error handling HesabPay GET callback:', error);
    const host = req.nextUrl.origin || 'http://localhost:3000';
    return NextResponse.redirect(`${host}/order?paymentError=callback_processing_failed`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, orderNumber, status, transactionId } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    await connectToDatabase();

    const query: any = {};
    if (orderId) query._id = orderId;
    else if (orderNumber) query.orderNumber = orderNumber;

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const isSubscription = order.orderType === 'subscription';

    if (status?.toUpperCase() === 'SUCCESS' || status?.toLowerCase() === 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = isSubscription ? 'completed' : 'processing';
      order.status = order.orderStatus;
      if (!order.paymentProviderDetails) {
        order.paymentProviderDetails = {};
      }
      order.paymentProviderDetails.providerType = 'wallet';
      order.paymentProviderDetails.walletService = 'حساب‌پی (HesabPay)';
      order.paymentProviderDetails.transactionRef = transactionId || `HP-WH-${Date.now()}`;
      await order.save();

      let subscriptionResult: any = null;
      if (isSubscription) {
        subscriptionResult = await activateUserSubscriptionFromOrder(order);
      }

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed successfully',
        subscription: subscriptionResult,
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      return NextResponse.json({ success: false, message: 'Payment marked as failed' });
    }
  } catch (error: any) {
    console.error('Error handling HesabPay POST webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error?.message },
      { status: 500 }
    );
  }
}
