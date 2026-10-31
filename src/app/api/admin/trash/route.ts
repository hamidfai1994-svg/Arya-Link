import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { AuditLog } from '@/models/AuditLog.model';

export const dynamic = 'force-dynamic';

function isSuperAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return role === 'superadmin' || role === 'admin';
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی امنیتی غیرمجاز. فقط مدیر کل (Super Admin) به زباله‌دان و لاگ حسابرسی دسترسی دارد.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const logs = await AuditLog.find({ isRestored: { $ne: true } })
      .sort({ deletedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      logs: logs.map((log: any) => ({
        id: log._id.toString(),
        recordType: log.recordType,
        recordId: log.recordId,
        referenceNumber: log.referenceNumber,
        title: log.title,
        amount: log.amount,
        currency: log.currency || 'AFN',
        deletedByAdminName: log.deletedByAdminName,
        deletedByAdminEmail: log.deletedByAdminEmail,
        deletedAt: log.deletedAt,
        deletedReason: log.deletedReason,
        isRestored: log.isRestored || false,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching trash logs:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری اطلاعات زباله‌دان سیستم.' },
      { status: 500 }
    );
  }
}

