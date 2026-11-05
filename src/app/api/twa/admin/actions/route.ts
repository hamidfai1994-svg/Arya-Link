import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongodb';
import { validateTelegramWebAppData } from '@/lib/twa-auth';
import { SystemSettings } from '@/models/systemSettings.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData, actionType, profileId } = body;

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'No user data' }, { status: 400 });
    }

    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (!userStr) {
      return NextResponse.json({ error: 'No user data' }, { status: 400 });
    }

    const tgUser = JSON.parse(userStr);
    const tgId = tgUser.id?.toString();
    if (!tgId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const token = process.env.TELEGRAM_INSIGHTS_BOT_TOKEN;
    if (!token || !validateTelegramWebAppData(initData, token)) {
      return NextResponse.json({ error: 'Invalid Hash' }, { status: 403 });
    }

    await connectToDatabase();

    const settings = await SystemSettings.findOne();
    if (!settings || settings.telegramInsightsChatId !== tgId) {
      return NextResponse.json({ error: 'Not Admin' }, { status: 403 });
    }

    if (actionType === 'toggleUserStatus') {
      if (!profileId || !mongoose.isValidObjectId(profileId)) {
        return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 });
      }

      const profile = await Profile.findById(profileId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      const currentStatus = profile.isActive !== false;
      const newStatus = !currentStatus;
      profile.isActive = newStatus;
      await profile.save();

      return NextResponse.json({
        success: true,
        actionType,
        profileId: profile._id.toString(),
        isActive: profile.isActive,
        message: profile.isActive ? 'وضعیت کاربر به فعال تغییر یافت' : 'کاربر با موفقیت مسدود شد',
      });
    }

    return NextResponse.json({ error: 'Unknown actionType' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

