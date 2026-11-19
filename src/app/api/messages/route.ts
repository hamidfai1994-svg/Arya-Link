import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Message } from '@/models/Message.model';
import { Profile } from '@/models/Profile.model';
import { Lead } from '@/models/Lead.model';
import { User } from '@/models/User.model';
import { sendUserLeadAlert } from '@/lib/telegram';
import { createPlatformNotification } from '@/lib/notifications';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import { getRequestLocale } from '@/lib/i18n/server-locale';
import { tServer } from '@/lib/i18n/translations';
import { getContactMessageSchema } from '@/lib/validations/forms';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['superadmin', 'admin', 'content_editor'].includes(role);
}

// GET: Admin messages list
export async function GET(req: NextRequest) {
  const locale = getRequestLocale(req);
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: tServer(locale, 'toast.forbidden') },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const isReadParam = searchParams.get('isRead');
    const profileAlias = searchParams.get('profileAlias');

    const query: Record<string, any> = {};
    if (isReadParam !== null) {
      query.isRead = isReadParam === 'true';
    }
    if (profileAlias) {
      query.profileAlias = profileAlias.toLowerCase().trim();
    }

    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('Error fetching messages in /api/messages:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت پیام‌ها.', error: error?.message },
      { status: 500 }
    );
  }
}

// POST: Public submission endpoint for contact form / messages
export async function POST(req: NextRequest) {
  let locale = getRequestLocale(req);
  try {
    await connectToDatabase();
    const body = await req.json();
    locale = getRequestLocale(req, body?.locale || body?.language);
    const { name, email, phone, message, profileAlias, organizationId } = body;

    const schema = getContactMessageSchema(locale);
    const parsed = schema.safeParse({
      senderName: typeof name === 'string' && name.trim() ? name.trim() : 'Visitor',
      senderEmail: typeof email === 'string' ? email : '',
      senderPhone: typeof phone === 'string' ? phone : '',
      messageText: typeof message === 'string' ? message : '',
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || tServer(locale, 'validation.message_required') },
        { status: 400 }
      );
    }

    const cleanAlias = (profileAlias || '').toLowerCase().trim();

    // 1. Save in Message model
    const savedMessage = await Message.create({
      name: typeof name === 'string' ? name.trim() : 'ناشناس',
      email: typeof email === 'string' ? email.trim() : '',
      phone: typeof phone === 'string' ? phone.trim() : '',
      message: message.trim(),
      profileAlias: cleanAlias,
      isRead: false,
    });

    // 2. Also sync to Lead if profileAlias exists
    if (cleanAlias) {
      try {
        const targetProfile = await Profile.findOne({ alias: cleanAlias }).select('_id userId orgId');
        if (targetProfile) {
          let resolvedOrgId: any = targetProfile.orgId || null;
          if (!resolvedOrgId && organizationId && mongoose.isValidObjectId(organizationId)) {
            resolvedOrgId = new mongoose.Types.ObjectId(organizationId);
          }
          if (!resolvedOrgId && targetProfile.userId) {
            const ownerUser = await User.findById(targetProfile.userId)
              .select('organizationId')
              .lean();
            if (ownerUser?.organizationId) {
              resolvedOrgId = ownerUser.organizationId;
            }
          }

          await Lead.create({
            profileId: targetProfile._id,
            organizationId: resolvedOrgId || null,
            employeeUserId: targetProfile.userId || null,
            name: savedMessage.name,
            phone: savedMessage.phone || '-',
            email: savedMessage.email || '',
            message: savedMessage.message,
            status: 'new',
          });
          await Profile.updateOne({ _id: targetProfile._id }, { $inc: { leadsCount: 1 } });
        }
      } catch (leadSyncErr) {
        console.warn('Lead secondary sync error:', leadSyncErr);
      }
    }

    // 3. Send DB Notifications & Interactive Telegram Alert to mini-site owner CRM (Non-blocking)
    if (cleanAlias) {
      (async () => {
        try {
          const profile = await Profile.findOne({ alias: cleanAlias });
          const senderName = savedMessage.name || 'مخاطب ناشناس';
          const contactInfo = savedMessage.phone || savedMessage.email || 'درج نگردیده';

          if (profile) {
            const miniSiteTitle = getLocalizedText(profile.displayName, 'da', profile.alias);

            // Create platform bell notifications for user & admin
            await Promise.all([
              profile.userId
                ? createPlatformNotification({
                    userId: String(profile.userId),
                    targetRole: 'user',
                    title: 'پیام جدید در فرم تماس مینی‌سایت',
                    message: `${senderName}: «${savedMessage.message.slice(0, 70)}»`,
                    type: 'new_lead',
                    link: '/dashboard/editor',
                    metadata: { messageId: savedMessage._id.toString(), alias: cleanAlias },
                  })
                : Promise.resolve(null),
              createPlatformNotification({
                userId: 'admin',
                targetRole: 'admin',
                title: 'تیکت / پیام جدید در مینی‌سایت',
                message: `پیام جدید برای کارت aryal.ink/${cleanAlias} از طرف ${senderName}`,
                type: 'ticket',
                link: '/admin/reports',
              }),
            ]);

            // Resolve owner's Telegram Chat ID (either on Profile CRM or bound User account)
            let targetChatId = profile.crmTelegramEnable !== false ? profile.crmTelegramChatId : '';
            if (!targetChatId && profile.userId && mongoose.isValidObjectId(String(profile.userId))) {
              const ownerUser = await User.findById(profile.userId).select('telegramChatId').lean();
              if (ownerUser?.telegramChatId) {
                targetChatId = ownerUser.telegramChatId;
              }
            }

            if (targetChatId) {
              await sendUserLeadAlert(targetChatId, {
                messageId: savedMessage._id.toString(),
                senderName,
                contactInfo,
                miniSiteTitle,
                alias: profile.alias,
                messageText: savedMessage.message,
              });
            }
          }
        } catch (teleError) {
          console.error('User telegram CRM notification failed:', teleError);
        }
      })().catch((teleErr) => {
        console.error('Non-blocking user telegram dispatch error:', teleErr);
      });
    } else {
      createPlatformNotification({
        userId: 'admin',
        targetRole: 'admin',
        title: 'تیکت جدید ثبت گردید',
        message: `پیام جدید از ${savedMessage.name || 'کاربر'}: «${savedMessage.message.slice(0, 70)}»`,
        type: 'ticket',
        link: '/admin/reports',
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        message: tServer(locale, 'toast.message_sent'),
        data: savedMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in /api/messages POST:', error);
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

// PATCH: Mark message as read/unread
export async function PATCH(req: NextRequest) {
  const locale = getRequestLocale(req);
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ success: false, message: tServer(locale, 'toast.forbidden') }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: tServer(locale, 'validation.required') }, { status: 400 });
    }

    const updated = await Message.findByIdAndUpdate(
      id,
      { $set: { isRead: Boolean(isRead) } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating message in /api/messages:', error);
    return NextResponse.json({ success: false, message: tServer(locale, 'toast.save_error') }, { status: 500 });
  }
}

