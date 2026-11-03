import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { validateTelegramWebAppData } from '@/lib/twa-auth';
import { SystemSettings } from '@/models/systemSettings.model';
import { Profile } from '@/models/Profile.model';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { initData, type } = await req.json();
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

    await connectToDatabase();

    if (type === 'admin') {
      const token = process.env.TELEGRAM_INSIGHTS_BOT_TOKEN;
      if (!token || !validateTelegramWebAppData(initData, token)) {
        return NextResponse.json({ error: 'Invalid Hash' }, { status: 403 });
      }

      const settings = await SystemSettings.findOne();
      if (!settings || settings.telegramInsightsChatId !== tgId) {
        return NextResponse.json({ error: 'Not Admin' }, { status: 403 });
      }

      return NextResponse.json({ success: true, role: 'admin' });
    }

    if (type === 'user') {
      const token = process.env.TELEGRAM_USER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
      if (!token || !validateTelegramWebAppData(initData, token)) {
        return NextResponse.json({ error: 'Invalid Hash' }, { status: 403 });
      }

      const profile = await Profile.findOne({ crmTelegramChatId: tgId });
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, role: 'user', profileId: profile._id });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('TWA Auth Route Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

