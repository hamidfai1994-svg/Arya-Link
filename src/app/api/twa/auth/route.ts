import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { verifyAndExtractTwaUser } from '@/lib/twa-auth';
import { SystemSettings } from '@/models/systemSettings.model';
import { Profile } from '@/models/Profile.model';
import { User } from '@/models/User.model';
import { Admin } from '@/models/Admin.model';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { initData, type } = await req.json();
    if (!type || (type !== 'admin' && type !== 'user')) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const verified = verifyAndExtractTwaUser(initData, type);
    if (!verified.valid || !verified.tgId) {
      return NextResponse.json(
        { error: verified.error || 'Invalid Hash' },
        { status: 403 }
      );
    }

    const tgId = verified.tgId;
    await connectToDatabase();

    if (type === 'admin') {
      const settings = await SystemSettings.findOne().lean();
      const adminDoc = await Admin.findOne({
        isActive: true,
        $or: [{ telegramChatId: tgId }, { telegramUserId: tgId }],
      }).lean();

      const adminUser = await User.findOne({
        role: { $in: ['admin', 'superadmin', 'financial_admin', 'content_editor'] },
        $or: [{ telegramChatId: tgId }, { telegramUserId: tgId }],
      }).lean();

      const isAuthorized =
        (settings &&
          (settings.telegramInsightsChatId === tgId ||
            settings.telegramSupportChatId === tgId)) ||
        Boolean(adminDoc) ||
        Boolean(adminUser);

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Not Admin' }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        role: 'admin',
        tgId,
      });
    }

    // type === 'user'
    let profile = await Profile.findOne({ crmTelegramChatId: tgId }).lean();
    if (!profile) {
      const boundUser = await User.findOne({
        $or: [{ telegramChatId: tgId }, { telegramUserId: tgId }],
      })
        .select('_id')
        .lean();

      if (boundUser) {
        profile = await Profile.findOne({
          $or: [
            { userId: boundUser._id },
            { userId: boundUser._id.toString() },
          ],
        })
          .sort({ createdAt: 1 })
          .lean();
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      role: 'user',
      profileId: profile._id.toString(),
      tgId,
    });
  } catch (error) {
    console.error('TWA Auth Route Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
