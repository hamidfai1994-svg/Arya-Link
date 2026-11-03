import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { validateTelegramWebAppData } from '@/lib/twa-auth';
import { SystemSettings } from '@/models/systemSettings.model';
import { Profile } from '@/models/Profile.model';
import { Message } from '@/models/Message.model';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json();
    const { initData, type } = body;

    const limitParam = url.searchParams.get('limit') || body.limit || '5';
    const limit = Math.max(1, parseInt(String(limitParam), 10) || 5);

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

      const [totalProfiles, totalMessages, recentProfiles] = await Promise.all([
        Profile.countDocuments(),
        Message.countDocuments(),
        Profile.find()
          .select('displayName alias headline avatarUrl viewsCount leadsCount createdAt')
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
      ]);

      return NextResponse.json({
        success: true,
        role: 'admin',
        stats: {
          totalProfiles,
          totalMessages,
        },
        recentProfiles,
      });
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

      const cleanAlias = (profile.alias || '').toLowerCase().trim();
      const [totalUserMessages, recentMessages] = await Promise.all([
        Message.countDocuments({ profileAlias: cleanAlias }),
        Message.find({ profileAlias: cleanAlias })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),
      ]);

      return NextResponse.json({
        success: true,
        role: 'user',
        profile: {
          displayName: profile.displayName || profile.alias,
          alias: profile.alias,
          avatarUrl: profile.avatarUrl || '',
        },
        stats: {
          viewsCount: profile.viewsCount || 0,
          leadsCount: totalUserMessages,
        },
        recentMessages,
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('TWA Dashboard Route Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
