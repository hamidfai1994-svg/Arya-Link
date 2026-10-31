import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { AuditLog } from '@/models/AuditLog.model';
import { Order } from '@/models/Order.model';
import { Payout } from '@/models/Payout.model';

export const dynamic = 'force-dynamic';

function isSuperAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return role === 'superadmin' || role === 'admin';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیر کل مجاز به بازیابی است.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json(
        { success: false, message: 'شناسه گزارش لاگ الزامی است.' },
        { status: 400 }
      );
    }

    const log = await AuditLog.findById(logId);
    if (!log) {
      return NextResponse.json(
        { success: false, message: 'گزارش لاگ مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    if (log.isRestored) {
      return NextResponse.json(
        { success: false, message: 'این مورد قبلاً بازیابی شده است.' },
        { status: 400 }
      );
    }

    const adminName = session.user.name || 'مدیر کل سیستم';

    // Restore depending on recordType
    if (log.recordType === 'order' || log.recordType === 'transaction') {
      const order = await Order.findById(log.recordId);
      if (order) {
        order.isDeleted = false;
        order.deletedAt = undefined;
        order.deletedBy = undefined;
        order.deletedReason = undefined;
        await order.save();
      }
    } else if (log.recordType === 'payout') {
      const payout = await Payout.findById(log.recordId);
      if (payout) {
        payout.isDeleted = false;
        payout.deletedAt = undefined;
        payout.deletedBy = undefined;
        payout.deletedReason = undefined;
        await payout.save();
      }
    }

    // Mark audit log as restored
    log.isRestored = true;
    log.restoredAt = new Date();
    log.restoredBy = adminName;
    await log.save();

    return NextResponse.json({
      success: true,
      message: `مورد «${log.title}» با موفقیت بازیابی شد و به لیست فعال بازگشت.`,
    });
  } catch (error: any) {
    console.error('Error restoring audit log item:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بازیابی مورد از زباله‌دان.' },
      { status: 500 }
    );
  }
}

