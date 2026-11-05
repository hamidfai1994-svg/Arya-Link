import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongodb';
import { validateTelegramWebAppData } from '@/lib/twa-auth';
import { Profile } from '@/models/Profile.model';
import { Message } from '@/models/Message.model';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData, messageId, actionType, payload } = body;

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'No user data' }, { status: 400 });
    }

    const token = process.env.TELEGRAM_USER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
    if (!token || !validateTelegramWebAppData(initData, token)) {
      return NextResponse.json({ error: 'Invalid Hash' }, { status: 403 });
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

    const profile = await Profile.findOne({ crmTelegramChatId: tgId });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!messageId || !mongoose.isValidObjectId(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const cleanAlias = (profile.alias || '').toLowerCase().trim();
    const filterQuery: any = { _id: messageId };
    if (cleanAlias) {
      filterQuery.$or = [
        { profileAlias: cleanAlias },
        { profileId: profile._id },
      ];
    } else {
      filterQuery.profileId = profile._id;
    }

    const message = await Message.findOne(filterQuery);
    if (!message) {
      return NextResponse.json({ error: 'Message not found or unauthorized' }, { status: 404 });
    }

    if (actionType === 'updateStatus') {
      if (!['new', 'contacted', 'resolved'].includes(payload)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }

      message.status = payload;
      await message.save();

      return NextResponse.json({
        success: true,
        actionType,
        messageId: message._id.toString(),
        status: message.status,
        message: 'وضعیت لید با موفقیت به‌روزرسانی شد',
      });
    }

    if (actionType === 'updateNote') {
      message.privateNote = typeof payload === 'string' ? payload.trim() : '';
      await message.save();

      return NextResponse.json({
        success: true,
        actionType,
        messageId: message._id.toString(),
        privateNote: message.privateNote,
        message: 'یادداشت شخصی با موفقیت ذخیره شد',
      });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    console.error('User CRM action error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

