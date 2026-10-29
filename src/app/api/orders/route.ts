import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Order } from '@/models/Order.model';
import { buildOrderIsolationQuery } from '@/lib/db/data-isolation';

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
    const userRole = (session.user.role || '').toLowerCase();
    const isSuperAdmin = userRole === 'superadmin' || userRole === 'admin';

    const url = new URL(req.url);
    const fetchAll = url.searchParams.get('all') === 'true';

    // Strict Data Isolation:
    // Only superadmin explicitly asking for ?all=true (from /admin/orders) gets all platform orders.
    // In all other cases (regular users, or user dashboard), strictly query only this user's orders!
    let query: any;
    if (isSuperAdmin && fetchAll) {
      query = {};
    } else {
      query = buildOrderIsolationQuery(session.user);
    }

    // Exclude any legacy demo/mock items (e.g. e-books, consulting packages, demo orders)
    const exclusionFilter = {
      orderNumber: { $nin: ['ORD-84920', 'ORD-84921', 'ORD-84922'] },
      customerName: { $nin: ['محمد ابراهیمی', 'سارا عزیزی', 'احمد فیاض'] },
      productTitle: { $nin: ['پکیج مشاوره کسب‌وکار (یک ساعته)', 'کتاب الکترونیکی بازاریابی دیجیتال'] },
    };
    query = { ...query, ...exclusionFilter };

    let orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const pendingCount = orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
    const printingCount = orders.filter((o) => o.orderStatus === 'printing').length;
    const shippedCount = orders.filter((o) => o.orderStatus === 'shipped' || o.orderStatus === 'completed').length;

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
        trackingNumber: o.trackingNumber || '',
        cardSpecs: o.cardSpecs || null,
        notes: o.notes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        pendingCount,
        printingCount,
        shippedCount,
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
      userId: session.user.id,
      sellerUserId: session.user.id,
      orderNumber,
      customerName: body.customerName || 'مشتری جدید',
      customerEmail: body.customerEmail || session.user.email || 'customer@example.com',
      customerPhone: body.customerPhone || '',
      productTitle: body.productTitle || 'سفارش کارت هوشمند NFC',
      quantity: Number(body.quantity) || 1,
      unitPrice: Number(body.unitPrice) || 1500,
      totalPrice: Number(body.totalPrice) || 1650,
      currency: body.currency || 'AFN',
      paymentStatus: body.paymentStatus || 'pending',
      orderStatus: body.orderStatus || 'pending',
      paymentMethod: body.paymentMethod || 'HesabPay',
      trackingNumber: '',
      cardSpecs: body.cardSpecs || {},
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

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { orderId, orderNumber, orderStatus, paymentStatus, trackingNumber, cardSpecs, notes } = body;

    const query: any = {};
    if (orderId) query._id = orderId;
    else if (orderNumber) query.orderNumber = orderNumber;
    else {
      return NextResponse.json(
        { success: false, message: 'شناسه یا شماره سفارش الزامی است.' },
        { status: 400 }
      );
    }

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'سفارش مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    const userRole = (session.user.role || '').toLowerCase();
    const isSuperAdmin = userRole === 'superadmin' || userRole === 'admin';
    const isOwner =
      order.sellerUserId.toString() === session.user.id.toString() ||
      (session.user.email && order.customerEmail?.toLowerCase() === session.user.email.toLowerCase());

    // 1. ADMIN ACTIONS: Can update orderStatus, paymentStatus, trackingNumber, notes
    if (isSuperAdmin) {
      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
      if (notes !== undefined) order.notes = notes;
      if (cardSpecs) {
        order.cardSpecs = { ...order.cardSpecs, ...cardSpecs };
      }
      await order.save();

      return NextResponse.json({
        success: true,
        message: 'وضعیت سفارش با موفقیت توسط مدیر به‌روزرسانی شد.',
        order,
      });
    }

    // 2. USER ACTIONS: Only allowed if owner and order is still in "pending" status (before printing!)
    if (!isOwner) {
      return NextResponse.json(
        { success: false, message: 'شما دسترسی ویرایش این سفارش را ندارید.' },
        { status: 403 }
      );
    }

    // Check if order has progressed to printing or shipped
    if (order.orderStatus === 'printing' || order.orderStatus === 'shipped' || order.orderStatus === 'completed') {
      return NextResponse.json(
        {
          success: false,
          message: 'امکان ویرایش مشخصات وجود ندارد؛ کارت شما وارد مرحله چاپ یا ارسال شده است.',
        },
        { status: 400 }
      );
    }

    // User is updating card specifications
    if (cardSpecs) {
      order.cardSpecs = {
        ...order.cardSpecs,
        firstName: cardSpecs.firstName ?? order.cardSpecs?.firstName,
        lastName: cardSpecs.lastName ?? order.cardSpecs?.lastName,
        jobTitle: cardSpecs.jobTitle ?? order.cardSpecs?.jobTitle,
        companyName: cardSpecs.companyName ?? order.cardSpecs?.companyName,
        logoUrl: cardSpecs.logoUrl ?? order.cardSpecs?.logoUrl,
        finishAccent: cardSpecs.finishAccent ?? order.cardSpecs?.finishAccent,
        cardUrl: cardSpecs.cardUrl ?? order.cardSpecs?.cardUrl,
      };
    }
    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'مشخصات کارت شما با موفقیت به‌روزرسانی شد.',
      order,
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در به‌روزرسانی سفارش.' },
      { status: 500 }
    );
  }
}
