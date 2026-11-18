import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db/mongodb';
import { verifyAndExtractTwaUser } from '@/lib/twa-auth';
import { Profile } from '@/models/Profile.model';
import { User } from '@/models/User.model';
import { Message } from '@/models/Message.model';
import { Lead } from '@/models/Lead.model';
import { normalizeMultilingual } from '@/lib/i18n/multilingual';

export const dynamic = 'force-dynamic';

function buildUpdatedLocalizedField(existingVal: any, nextText: string) {
  if (existingVal && typeof existingVal === 'object') {
    return {
      ...existingVal,
      da: nextText,
      fa: nextText,
    };
  }
  return normalizeMultilingual(nextText, nextText);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData, messageId, actionType, payload } = body;

    const verified = verifyAndExtractTwaUser(initData, 'user');
    if (!verified.valid || !verified.tgId) {
      return NextResponse.json(
        { error: verified.error || 'Invalid Hash' },
        { status: 403 }
      );
    }

    const tgId = verified.tgId;
    await connectToDatabase();

    let profile = await Profile.findOne({ crmTelegramChatId: tgId });
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
        }).sort({ createdAt: 1 });
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // =========================================================================
    // 1. PROFILE BIO & INFO MANAGEMENT
    // =========================================================================
    if (actionType === 'updateBioAndInfo') {
      const data = payload || {};
      if (typeof data.displayName === 'string' && data.displayName.trim()) {
        const cleanName = data.displayName.trim();
        profile.displayName = buildUpdatedLocalizedField(profile.displayName, cleanName);
        if (!profile.translations) profile.translations = {};
        profile.translations.displayName = buildUpdatedLocalizedField(
          profile.translations.displayName,
          cleanName
        );
      }
      if (typeof data.headline === 'string') {
        const cleanHeadline = data.headline.trim();
        profile.headline = buildUpdatedLocalizedField(profile.headline, cleanHeadline);
        if (!profile.translations) profile.translations = {};
        profile.translations.headline = buildUpdatedLocalizedField(
          profile.translations.headline,
          cleanHeadline
        );
      }
      if (typeof data.bio === 'string') {
        const cleanBio = data.bio.trim();
        profile.bio = buildUpdatedLocalizedField(profile.bio, cleanBio);
        if (!profile.translations) profile.translations = {};
        profile.translations.bio = buildUpdatedLocalizedField(profile.translations.bio, cleanBio);
      }
      if (typeof data.phone === 'string') {
        profile.phone = data.phone.trim();
      }
      if (typeof data.email === 'string') {
        profile.email = data.email.trim();
      }
      if (typeof data.location === 'string') {
        profile.location = data.location.trim();
      }
      if (typeof data.directModeEnabled === 'boolean') {
        profile.directModeEnabled = data.directModeEnabled;
      }
      if (typeof data.directModeUrl === 'string') {
        profile.directModeUrl = data.directModeUrl.trim();
      }

      profile.markModified('displayName');
      profile.markModified('headline');
      profile.markModified('bio');
      profile.markModified('translations');
      await profile.save();

      return NextResponse.json({
        success: true,
        actionType,
        message: 'معلومات پروفایل و بیوگرافی با موفقیت به‌روزرسانی گردید.',
      });
    }

    // =========================================================================
    // 2. LINKS MANAGEMENT (ADD / UPDATE / DELETE)
    // =========================================================================
    if (actionType === 'addLink') {
      const title = String(payload?.title || '').trim();
      const url = String(payload?.url || '').trim();
      const moduleType = String(payload?.moduleType || 'standard_link').trim();

      if (!title || !url) {
        return NextResponse.json(
          { error: 'عنوان لینک و آدرس مقصد الزامی است.' },
          { status: 400 }
        );
      }

      const newLink: any = {
        id: `link_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: normalizeMultilingual(title, title),
        url,
        moduleType,
        isActive: true,
        isPinned: false,
        order: Array.isArray(profile.links) ? profile.links.length : 0,
        clickCount: 0,
        metadata: {
          translations: {
            title: normalizeMultilingual(title, title),
          },
        },
      };

      profile.links = [...(Array.isArray(profile.links) ? profile.links : []), newLink];
      profile.markModified('links');
      await profile.save();

      return NextResponse.json({
        success: true,
        actionType,
        link: {
          id: newLink.id,
          title,
          url,
          moduleType,
          isActive: true,
          clickCount: 0,
        },
        message: 'لینک جدید با موفقیت به کارت شما افزوده شد.',
      });
    }

    if (actionType === 'updateLink') {
      const linkId = String(payload?.id || '');
      if (!linkId) {
        return NextResponse.json({ error: 'شناسه لینک الزامی است.' }, { status: 400 });
      }

      const linksArr = Array.isArray(profile.links) ? [...profile.links] : [];
      const idx = linksArr.findIndex((l: any) => String(l.id) === linkId);
      if (idx === -1) {
        return NextResponse.json({ error: 'لینک مورد نظر یافت نشد.' }, { status: 404 });
      }

      const target: any = { ...(linksArr[idx] as any) };
      if (typeof payload?.title === 'string' && payload.title.trim()) {
        const cleanTitle = payload.title.trim();
        target.title = buildUpdatedLocalizedField(target.title, cleanTitle);
        if (target.metadata?.translations) {
          target.metadata.translations.title = buildUpdatedLocalizedField(
            target.metadata.translations.title,
            cleanTitle
          );
        }
      }
      if (typeof payload?.url === 'string' && payload.url.trim()) {
        target.url = payload.url.trim();
      }
      if (typeof payload?.isActive === 'boolean') {
        target.isActive = payload.isActive;
      }

      linksArr[idx] = target;
      profile.links = linksArr;
      profile.markModified('links');
      await profile.save();

      return NextResponse.json({
        success: true,
        actionType,
        message: 'تغییرات لینک با موفقیت ذخیره گردید.',
      });
    }

    if (actionType === 'deleteLink') {
      const linkId = String(payload?.id || '');
      if (!linkId) {
        return NextResponse.json({ error: 'شناسه لینک الزامی است.' }, { status: 400 });
      }

      profile.links = (Array.isArray(profile.links) ? profile.links : []).filter(
        (l: any) => String(l.id) !== linkId
      );
      profile.markModified('links');
      await profile.save();

      return NextResponse.json({
        success: true,
        actionType,
        message: 'لینک با موفقیت حذف گردید.',
      });
    }

    // =========================================================================
    // 3. CRM LEAD STATUS & NOTES MANAGEMENT
    // =========================================================================
    if (!messageId || !mongoose.isValidObjectId(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const cleanAlias = (profile.alias || '').toLowerCase().trim();
    const filterQuery: any = { _id: messageId };
    if (cleanAlias) {
      filterQuery.$or = [{ profileAlias: cleanAlias }, { profileId: profile._id }];
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
      await Lead.updateMany(
        { profileId: profile._id, message: message.message },
        { $set: { status: payload } }
      );

      return NextResponse.json({
        success: true,
        actionType,
        messageId: message._id.toString(),
        status: message.status,
        message: 'وضعیت مخاطب با موفقیت به‌روزرسانی گردید.',
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
        message: 'یادداشت اختصاصی با موفقیت ذخیره شد.',
      });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    console.error('User CRM / Profile action error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
