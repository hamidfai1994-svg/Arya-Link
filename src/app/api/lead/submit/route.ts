import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { Lead } from '@/models/Lead.model';
import { Message } from '@/models/Message.model';
import { User } from '@/models/User.model';
import { sendUserLeadAlert } from '@/lib/telegram';
import { createPlatformNotification } from '@/lib/notifications';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

import { getRequestLocale } from '@/lib/i18n/server-locale';
import { tServer } from '@/lib/i18n/translations';
import { getContactMessageSchema } from '@/lib/validations/forms';

export async function POST(req: NextRequest) {
  let locale = getRequestLocale(req);
  try {
    await connectToDatabase();
    const body = await req.json();
    locale = getRequestLocale(req, body?.locale || body?.language);
    const { profileAlias, name, phone, email, message } = body;

    if (!profileAlias || typeof profileAlias !== 'string') {
      return NextResponse.json(
        { success: false, message: tServer(locale, 'api.profile.alias_required') },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: tServer(locale, 'validation.phone_required') },
        { status: 400 }
      );
    }

    const parsed = getContactMessageSchema(locale).safeParse({
      senderName: typeof name === 'string' ? name : '',
      senderEmail: typeof email === 'string' ? email : '',
      senderPhone: phone,
      messageText: typeof message === 'string' ? message : '',
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || tServer(locale, 'validation.required') },
        { status: 400 }
      );
    }

    const cleanAlias = profileAlias.toLowerCase().trim();
    const profile = await Profile.findOne({ alias: cleanAlias }).select('_id userId alias displayName crmTelegramEnable crmTelegramChatId');

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'پروفایل مورد نظر یافت نشد.' },
        { status: 404 }
      );
    }

    const newLead = await Lead.create({
      profileId: profile._id,
      name: name.trim(),
      phone: phone.trim(),
      email: typeof email === 'string' ? email.trim() : '',
      message: message.trim(),
      status: 'new',
    });

    let savedMsgId = '';
    // Secondary sync into general Message model for super admin auditing
    try {
      const msgDoc = await Message.create({
        name: name.trim(),
        phone: phone.trim(),
        email: typeof email === 'string' ? email.trim() : '',
        message: message.trim(),
        profileAlias: cleanAlias,
        isRead: false,
      });
      savedMsgId = msgDoc._id.toString();
    } catch (msgErr) {
      console.warn('Message model sync warning:', msgErr);
    }

    // Increment profile leads count
    await Profile.updateOne({ _id: profile._id }, { $inc: { leadsCount: 1 } });

    // Send DB Notifications & Interactive Telegram Notification to Mini-site owner CRM (Non-blocking)
    (async () => {
      try {
        const senderName = newLead.name || 'مخاطب ناشناس';
        const contactInfo = newLead.phone || newLead.email || 'درج نگردیده';
        const miniSiteTitle = getLocalizedText(profile.displayName, 'da', profile.alias);

        await Promise.all([
          profile.userId
            ? createPlatformNotification({
                userId: String(profile.userId),
                targetRole: 'user',
                title: 'مخاطب و پیام جدید در مینی‌سایت',
                message: `${senderName} (${contactInfo}) از طریق کارت aryal.ink/${profile.alias} پیام گذاشت.`,
                type: 'new_lead',
                link: '/dashboard/editor',
                metadata: { leadId: newLead._id.toString(), alias: cleanAlias },
              })
            : Promise.resolve(null),
          createPlatformNotification({
            userId: 'admin',
            targetRole: 'admin',
            title: 'تیکت و درخواست جدید در کارت‌ها',
            message: `درخواست جدید برای کارت aryal.ink/${profile.alias} توسط ${senderName}`,
            type: 'ticket',
            link: '/admin/reports',
          }),
        ]);

        let targetChatId = profile.crmTelegramEnable !== false ? profile.crmTelegramChatId : '';
        if (!targetChatId && profile.userId && mongoose.isValidObjectId(String(profile.userId))) {
          const ownerUser = await User.findById(profile.userId).select('telegramChatId').lean();
          if (ownerUser?.telegramChatId) {
            targetChatId = ownerUser.telegramChatId;
          }
        }

        if (targetChatId) {
          await sendUserLeadAlert(targetChatId, {
            messageId: savedMsgId || newLead._id.toString(),
            senderName,
            contactInfo,
            miniSiteTitle,
            alias: profile.alias,
            messageText: newLead.message,
          });
        }
      } catch (teleError) {
        console.error('User telegram CRM notification failed:', teleError);
      }
    })().catch((teleErr) => {
      console.error('Background user telegram dispatch error:', teleErr);
    });

    return NextResponse.json(
      {
        success: true,
        message: tServer(locale, 'toast.message_sent'),
        data: {
          id: newLead._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting lead:', error);
    return NextResponse.json(
      {
        success: false,
        message: tServer(locale, 'toast.message_error'),
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
