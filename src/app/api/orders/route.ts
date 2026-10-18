import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
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

    let orders = await Order.find({ sellerUserId: userId })
      .sort({ createdAt: -1 })
      .lean();

    // If zero orders found, seed 3 demo commercial orders so user can immediately test
    if (orders.length === 0) {
      const demoOrders = [
        {
          sellerUserId: userId,
          orderNumber: 'ORD-84920',
          customerName: 'محمد ابراهیمی',
          customerEmail: 'm.ebrahimi@gmail.com',
          customerPhone: '0799123456',
          productTitle: 'پکیج مشاوره کسب‌وکار (یک ساعته)',
          quantity: 1,
          unitPrice: 1500,
          totalPrice: 1500,
          currency: 'AFN',
          paymentStatus: 'paid',
          orderStatus: 'completed',
          paymentMethod: 'HesabPay',
          notes: 'ارسال لینک گوگل میت انجام شد',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          sellerUserId: userId,
          orderNumber: 'ORD-84921',
          customerName: 'سارا عزیزی',
          customerEmail: 'sara.azizi@outlook.com',
          customerPhone: '0788987654',
          productTitle: 'کتاب الکترونیکی بازاریابی دیجیتال',
          quantity: 2,
          unitPrice: 450,
          totalPrice: 900,
          currency: 'AFN',
          paymentStatus: 'paid',
          orderStatus: 'completed',
          paymentMethod: 'کیف پول آریا لینک',
          notes: 'فایل به ایمیل ارسال شد',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          sellerUserId: userId,
          orderNumber: 'ORD-84922',
          customerName: 'احمد فیاض',
          customerEmail: 'fayaz_tech@gmail.com',
          customerPhone: '0777555444',
          productTitle: 'کارت ویزیت فلزی NFC سفارشی',
          quantity: 1,
          unitPrice: 2800,
          totalPrice: 2800,
          currency: 'AFN',
          paymentStatus: 'pending',
          orderStatus: 'processing',
          paymentMethod: 'انتقال بانکی عزیزی',
          notes: 'در حال آماده‌سازی و ارسال پستی',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      await Order.insertMany(demoOrders);
      orders = await Order.find({ sellerUserId: userId })
        .sort({ createdAt: -1 })
        .lean();
    }

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const completedCount = orders.filter((o) => o.orderStatus === 'completed').length;
    const pendingCount = orders.filter((o) => o.orderStatus === 'processing' || o.orderStatus === 'pending').length;

    return NextResponse.json({
      success: true,
      orders: orders.map((o: any) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        productTitle: o.productTitle,
        quantity: o.quantity,
        unitPrice: o.unitPrice,
        totalPrice: o.totalPrice,
        currency: o.currency || 'AFN',
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        paymentMethod: o.paymentMethod,
        notes: o.notes,
        createdAt: o.createdAt,
      })),
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        completedCount,
        pendingCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری سفارشات.' },
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
    const body = await req.json();

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = await Order.create({
      sellerUserId: session.user.id,
      orderNumber,
      customerName: body.customerName || 'مشتری جدید',
      customerEmail: body.customerEmail || 'customer@example.com',
      customerPhone: body.customerPhone || '',
      productTitle: body.productTitle || 'سفارش محصول',
      quantity: Number(body.quantity) || 1,
      unitPrice: Number(body.unitPrice) || 100,
      totalPrice: (Number(body.quantity) || 1) * (Number(body.unitPrice) || 100),
      currency: body.currency || 'AFN',
      paymentStatus: body.paymentStatus || 'paid',
      orderStatus: body.orderStatus || 'completed',
      paymentMethod: body.paymentMethod || 'HesabPay',
      notes: body.notes || '',
    });

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد.',
      order: newOrder,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد سفارش.' },
      { status: 500 }
    );
  }
}
