import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { SystemSettings, ISystemSettings } from '@/models/systemSettings.model';

export const dynamic = 'force-dynamic';

function isSuperAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['superadmin', 'admin'].includes(role);
}

const DEFAULT_SETTINGS = {
  telegramSupportChatId: '',
  telegramInsightsChatId: '',
  telegramBotsActive: false,
  notifyNewUsers: true,
  notifyOrders: true,
  notifySupportTickets: true,
  notifySystemAlerts: false,
  appPushEnabled: false,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد مجاز هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    let settings = await SystemSettings.findOne().lean();
    if (!settings) {
      settings = await SystemSettings.create(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت تنظیمات سیستم.', error: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز. فقط مدیران ارشد مجاز هستند.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await req.json();

    const updateData: Partial<ISystemSettings> = {
      telegramSupportChatId: typeof body.telegramSupportChatId === 'string' ? body.telegramSupportChatId.trim() : '',
      telegramInsightsChatId: typeof body.telegramInsightsChatId === 'string' ? body.telegramInsightsChatId.trim() : '',
      telegramBotsActive: Boolean(body.telegramBotsActive),
      notifyNewUsers: Boolean(body.notifyNewUsers),
      notifyOrders: Boolean(body.notifyOrders),
      notifySupportTickets: Boolean(body.notifySupportTickets),
      notifySystemAlerts: Boolean(body.notifySystemAlerts),
      appPushEnabled: false, // Future mobile app push feature
    };

    let settings = await SystemSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: 'تنظیمات کلان API و ربات‌های تلگرام با موفقیت ذخیره شد.',
      data: settings,
    });
  } catch (error: any) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره‌سازی تنظیمات سیستم.', error: error?.message },
      { status: 500 }
    );
  }
}

