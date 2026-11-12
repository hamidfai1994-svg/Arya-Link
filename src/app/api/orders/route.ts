import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Order } from '@/models/Order.model';
import { AuditLog } from '@/models/AuditLog.model';
import { PhysicalCard, generatePhysicalCardCode } from '@/models/PhysicalCard.model';
import { buildOrderIsolationQuery } from '@/lib/db/data-isolation';
import { SystemSettings } from '@/models/systemSettings.model';
import { sendInsightsMessage } from '@/lib/telegram';

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

    // Exclude any legacy demo/mock items (e.g. e-books, consulting packages, demo orders) and soft-deleted records
    const exclusionFilter = {
      orderNumber: { $nin: ['ORD-84920', 'ORD-84921', 'ORD-84922'] },
      customerName: { $nin: ['محمد ابراهیمی', 'سارا عزیزی', 'احمد فیاض'] },
      productTitle: { $nin: ['پکیج مشاوره کسب‌وکار (یک ساعته)', 'کتاب الکترونیکی بازاریابی دیجیتال'] },
      isDeleted: { $ne: true },
    };
    query = { ...query, ...exclusionFilter };

    let orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Query physical cards corresponding to these orders
    const orderIds = orders.map((o) => o._id);
    const physicalCards = await PhysicalCard.find({ orderId: { $in: orderIds } }).lean();
    const cardMap = new Map<string, any>(
      physicalCards.map((c) => [c.orderId?.toString(), c])
    );

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const pendingPaymentCount = orders.filter(
      (o) => o.orderStatus === 'pending_payment' || o.orderStatus === 'pending'
    ).length;
    const processingCount = orders.filter(
      (o) => o.orderStatus === 'processing' || o.orderStatus === 'printing'
    ).length;
    const nfcWritingCount = orders.filter((o) => o.orderStatus === 'nfc_writing').length;
    const shippingCount = orders.filter(
      (o) => o.orderStatus === 'shipping' || o.orderStatus === 'shipped'
    ).length;
    const deliveredCount = orders.filter(
      (o) => o.orderStatus === 'delivered' || o.orderStatus === 'completed'
    ).length;
    const cancelledCount = orders.filter((o) => o.orderStatus === 'cancelled').length;

    return NextResponse.json({
      success: true,
      orders: orders.map((o: any) => {
        const c = cardMap.get(o._id.toString());
        return {
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
          paymentProviderDetails: o.paymentProviderDetails || null,
          trackingNumber: o.trackingNumber || '',
          cardSpecs: o.cardSpecs || null,
          trackingShortCode: o.trackingShortCode || c?.shortCode || '',
          provisionedBy: o.provisionedBy?.toString() || c?.provisionedBy?.toString() || '',
          provisionedAt: o.provisionedAt || c?.provisionedAt || null,
          physicalCard: c
            ? {
                id: c._id.toString(),
                shortCode: c.shortCode,
                scansCount: c.scansCount || 0,
                status: c.status,
                provisionedBy: c.provisionedBy?.toString(),
                provisionedAt: c.provisionedAt,
              }
            : null,
          notes: o.notes,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        };
      }),
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        pendingPaymentCount,
        processingCount,
        nfcWritingCount,
        shippingCount,
        deliveredCount,
        cancelledCount,
        // Legacy fallback fields for backwards compatibility
        pendingCount: pendingPaymentCount + processingCount,
        printingCount: processingCount + nfcWritingCount,
        shippedCount: shippingCount + deliveredCount,
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
    const session = await getServerSession(authOptions).catch((err) => {
      console.warn('Session retrieval non-fatal warning in POST /api/orders:', err);
      return null;
    });

    await connectToDatabase();
    const body = await req.json();

    // 1. Resolve user ID and identity (Authenticated user vs Guest customer)
    const userId = session?.user?.id || body.userId || null;
    const sellerUserId = userId || 'platform';
    const customerEmail =
      body.customerEmail?.trim() ||
      session?.user?.email?.trim() ||
      'customer@example.com';
    const customerName =
      body.customerName?.trim() ||
      session?.user?.name?.trim() ||
      'مشتری جدید';

    // 2. Generate unique orderNumber
    let orderNumber = body.orderNumber || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    let orderExists = await Order.exists({ orderNumber });
    let orderAttempts = 0;
    while (orderExists && orderAttempts < 5) {
      orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      orderExists = await Order.exists({ orderNumber });
      orderAttempts++;
    }

    // 3. Determine paymentStatus and orderStatus based on payment method
    const paymentMethod = (body.paymentMethod || 'online').toLowerCase();
    let paymentStatus = body.paymentStatus;
    if (!paymentStatus) {
      paymentStatus = paymentMethod === 'wallet' ? 'pending' : 'pending';
    }

    let orderStatus = body.orderStatus;
    if (!orderStatus) {
      if (paymentMethod === 'wallet' || paymentMethod === 'online') {
        orderStatus = paymentStatus === 'paid' ? 'processing' : 'pending_payment';
      } else {
        // Cash on delivery (COD), bank receipt, hawala, crypto, installments
        orderStatus = 'processing';
      }
    }

    // 4. Safely generate a unique 6-character shortCode for NFC tracking
    let trackingShortCode = (body.trackingShortCode || '').trim().toUpperCase();
    if (!trackingShortCode) {
      try {
        let code = generatePhysicalCardCode();
        let codeAttempts = 0;
        while (codeAttempts < 5 && (await PhysicalCard.exists({ shortCode: code }))) {
          code = generatePhysicalCardCode();
          codeAttempts++;
        }
        trackingShortCode = code;
      } catch (codeErr) {
        console.error('Non-critical: Error checking PhysicalCard shortCode collision:', codeErr);
        trackingShortCode = generatePhysicalCardCode();
      }
    }

    const unitPrice = Number(body.unitPrice) || 0;
    const quantity = Number(body.quantity) || 1;
    const totalPrice = Number(body.totalPrice) || unitPrice * quantity;

    // 5. Create Order record
    const newOrder = await Order.create({
      userId,
      sellerUserId,
      profileId: body.profileId || null,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone: body.customerPhone || '',
      productTitle: body.productTitle || 'سفارش کارت هوشمند NFC',
      quantity,
      unitPrice,
      totalPrice,
      currency: body.currency === 'USD' ? 'USD' : 'AFN',
      paymentStatus,
      orderStatus,
      orderType: body.orderType || 'nfc_card',
      status: orderStatus,
      price: totalPrice,
      paymentMethod,
      paymentProviderDetails: body.paymentProviderDetails || {},
      deliveryFee: Number(body.deliveryFee) || 0,
      deliveryCompany: body.deliveryCompany || '',
      isDeliverySettled: body.isDeliverySettled === true,
      trackingNumber: body.trackingNumber || '',
      trackingShortCode,
      cardSpecs: body.cardSpecs || {},
      notes: body.notes || '',
    });

    // 6. Safely create or link PhysicalCard (NON-BLOCKING: will not fail order creation if it errors)
    let physicalCard = null;
    try {
      if (trackingShortCode) {
        physicalCard = await PhysicalCard.create({
          shortCode: trackingShortCode,
          ownerId: userId || undefined,
          orderId: newOrder._id,
          profileId: body.profileId || undefined,
          scansCount: 0,
          status: 'pending_write',
        });

        if (physicalCard?._id) {
          newOrder.physicalCardId = physicalCard._id as any;
          await newOrder.save();
        }
      }
    } catch (cardError: any) {
      console.error('Non-critical: Failed to create PhysicalCard for order:', cardError);
      // Non-fatal error; order is safely saved, admin can provision/re-link card anytime in admin dashboard
    }

    // 7. Non-blocking notification to Insights Telegram Bot
    (async () => {
      try {
        const settings = await SystemSettings.findOne();
        if (
          settings &&
          settings.telegramBotsActive &&
          settings.telegramInsightsChatId &&
          settings.notifyOrders
        ) {
          const msg = `🛍️ <b>سفارش جدید در سیستم ثبت شد</b>\n\n📦 <b>شماره سفارش:</b> ${newOrder.orderNumber}\n👤 <b>مشتری:</b> ${newOrder.customerName}\n📞 <b>تماس:</b> ${newOrder.customerPhone || 'ندارد'}\n🏷️ <b>محصول:</b> ${newOrder.productTitle}\n💰 <b>مبلغ کل:</b> ${Number(newOrder.totalPrice).toLocaleString('en-US')} ${newOrder.currency}\n💳 <b>وضعیت پرداخت:</b> ${newOrder.paymentStatus}\n🏷️ <b>وضعیت سفارش:</b> ${newOrder.orderStatus}\n🔗 <b>کد رهگیری NFC:</b> <code>${trackingShortCode}</code>`;
          await sendInsightsMessage(settings.telegramInsightsChatId, msg);
        }
      } catch (e) {
        console.error('Insights bot order alert error:', e);
      }
    })().catch(() => { });

    return NextResponse.json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد.',
      order: {
        ...newOrder.toObject(),
        physicalCardId: physicalCard?._id || newOrder.physicalCardId,
        trackingShortCode,
      },
    });
  } catch (error: any) {
    console.error('Critical Error in POST /api/orders:', error);

    let clientMessage = 'خطای سرور در ثبت سفارش.';
    if (error?.name === 'ValidationError') {
      const fieldErrors = Object.values(error.errors || {})
        .map((e: any) => e.message || e.path)
        .join(' | ');
      clientMessage = `خطا در ولیدیشن دیتابیس: ${fieldErrors || error.message}`;
    } else if (error?.code === 11000) {
      clientMessage = 'خطا در ثبت سفارش: شماره سفارش یا کد کارت تکراری است.';
    } else if (error?.message) {
      clientMessage = `خطا در ایجاد سفارش: ${error.message}`;
    }

    return NextResponse.json(
      {
        success: false,
        message: clientMessage,
        details: process.env.NODE_ENV !== 'production' ? error?.message : undefined,
      },
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
    const {
      orderId,
      orderNumber,
      orderStatus,
      paymentStatus,
      trackingNumber,
      cardSpecs,
      notes,
      action,
    } = body;

    const query: any = {};
    if (orderId) query._id = orderId;
    else if (orderNumber) query.orderNumber = orderNumber;
    else {
      return NextResponse.json(
        { success: false, message: 'آی دی یا شماره سفارش الزامی است.' },
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

    // 1. ADMIN ACTIONS
    if (isSuperAdmin) {
      // Direct action: Confirm NFC Writing & activate (transitions to shipping)
      if (action === 'confirm_provision') {
        let card = await PhysicalCard.findOne({ orderId: order._id });
        if (!card) {
          let uniqueCode = generatePhysicalCardCode();
          while (await PhysicalCard.exists({ shortCode: uniqueCode })) {
            uniqueCode = generatePhysicalCardCode();
          }
          card = await PhysicalCard.create({
            shortCode: uniqueCode,
            ownerId: order.sellerUserId || order.userId,
            orderId: order._id,
            profileId: order.profileId,
            scansCount: 0,
            status: 'active',
            provisionedBy: session.user.id,
            provisionedAt: new Date(),
          });
        } else {
          card.status = 'active';
          card.provisionedBy = session.user.id as any;
          card.provisionedAt = new Date();
          await card.save();
        }

        order.orderStatus = 'shipping';
        order.status = 'shipping';
        order.physicalCardId = card._id as any;
        order.trackingShortCode = card.shortCode;
        order.provisionedBy = session.user.id as any;
        order.provisionedAt = new Date();
        await order.save();

        return NextResponse.json({
          success: true,
          message: 'کارت هوشمند NFC با موفقیت رایت و فعال گردید و سفارش به مرحله ارسال با پیک منتقل شد.',
          order,
          physicalCard: {
            id: card._id.toString(),
            shortCode: card.shortCode,
            scansCount: card.scansCount,
            status: card.status,
            provisionedBy: card.provisionedBy?.toString(),
            provisionedAt: card.provisionedAt,
          },
        });
      }

      // Normal admin status updates
      if (orderStatus) {
        order.orderStatus = orderStatus;
        order.status = orderStatus;

        // Auto-ensure PhysicalCard exists if advancing to processing or nfc_writing
        if (
          (orderStatus === 'nfc_writing' || orderStatus === 'processing') &&
          !order.trackingShortCode
        ) {
          let card = await PhysicalCard.findOne({ orderId: order._id });
          if (!card) {
            let uniqueCode = generatePhysicalCardCode();
            while (await PhysicalCard.exists({ shortCode: uniqueCode })) {
              uniqueCode = generatePhysicalCardCode();
            }
            card = await PhysicalCard.create({
              shortCode: uniqueCode,
              ownerId: order.sellerUserId || order.userId,
              orderId: order._id,
              profileId: order.profileId,
              scansCount: 0,
              status: 'pending_write',
            });
          }
          order.physicalCardId = card._id as any;
          order.trackingShortCode = card.shortCode;
        }

        if (orderStatus === 'shipping') {
          order.provisionedBy = session.user.id as any;
          order.provisionedAt = new Date();
          await PhysicalCard.updateOne(
            { orderId: order._id },
            {
              $set: {
                status: 'active',
                provisionedBy: session.user.id,
                provisionedAt: new Date(),
              },
            }
          );
        }
      }

      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
      if (notes !== undefined) order.notes = notes;
      if (cardSpecs) {
        order.cardSpecs = { ...order.cardSpecs, ...cardSpecs };
      }
      await order.save();

      const linkedCard = await PhysicalCard.findOne({ orderId: order._id }).lean();

      return NextResponse.json({
        success: true,
        message: 'وضعیت سفارش با موفقیت توسط مدیر به‌روزرسانی شد.',
        order,
        physicalCard: linkedCard
          ? {
              id: (linkedCard as any)._id.toString(),
              shortCode: (linkedCard as any).shortCode,
              scansCount: (linkedCard as any).scansCount,
              status: (linkedCard as any).status,
              provisionedBy: (linkedCard as any).provisionedBy?.toString(),
              provisionedAt: (linkedCard as any).provisionedAt,
            }
          : null,
      });
    }

    // 2. USER ACTIONS: Only allowed if owner and order is still in "pending_payment" or "pending" status
    if (!isOwner) {
      return NextResponse.json(
        { success: false, message: 'شما دسترسی ویرایش این سفارش را ندارید.' },
        { status: 403 }
      );
    }

    // Check if order has progressed
    if (
      order.orderStatus === 'processing' ||
      order.orderStatus === 'nfc_writing' ||
      order.orderStatus === 'shipping' ||
      order.orderStatus === 'delivered' ||
      order.orderStatus === 'printing' ||
      order.orderStatus === 'shipped' ||
      order.orderStatus === 'completed'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'امکان ویرایش مشخصات وجود ندارد؛ کارت شما وارد مرحله چاپ، رایت یا ارسال شده است.',
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user?.role || '').toLowerCase();
    const isSuperAdmin = userRole === 'superadmin' || userRole === 'admin';

    if (!session?.user?.id || !isSuperAdmin) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران سیستم مجاز به حذف سفارش هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'آی دی سفارش الزامی است.' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json(
        { success: false, message: 'ثبت دلیل حذف سفارش الزامی است و برای حسابرسی امنیتی ذخیره می‌شود.' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'سفارش مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    if (order.isDeleted) {
      return NextResponse.json(
        { success: false, message: 'این سفارش قبلاً حذف شده و در زباله‌دان سیستم قرار دارد.' },
        { status: 400 }
      );
    }

    const adminName = session.user.name || 'مدیر سیستم';
    const adminEmail = session.user.email || 'admin@aryalink.af';

    // 1. Soft delete the order
    order.isDeleted = true;
    order.deletedAt = new Date();
    order.deletedBy = adminName;
    order.deletedReason = reason.trim();
    await order.save();

    // 2. Record security audit log
    await AuditLog.create({
      recordType: 'order',
      recordId: order._id.toString(),
      referenceNumber: order.orderNumber,
      title: `${order.productTitle} (${order.customerName})`,
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
      message: `سفارش #${order.orderNumber} با موفقیت به زباله‌دان سیستم منتقل گردید.`,
      orderId: order._id,
    });
  } catch (error: any) {
    console.error('Error soft deleting order:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف امن سفارش.' },
      { status: 500 }
    );
  }
}
