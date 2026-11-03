import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Message } from '@/models/Message.model';
import { Profile } from '@/models/Profile.model';
import { Lead } from '@/models/Lead.model';
import { sendUserMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['superadmin', 'admin', 'content_editor'].includes(role);
}

// GET: Admin messages list
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز به لیست پیام‌ها.' },
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
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, phone, message, profileAlias } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'متن پیام الزامی است.' },
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
        const targetProfile = await Profile.findOne({ alias: cleanAlias }).select('_id');
        if (targetProfile) {
          await Lead.create({
            profileId: targetProfile._id,
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

    // 3. Send Telegram notification directly to mini-site owner CRM (Non-blocking)
    if (cleanAlias) {
      (async () => {
        try {
          const profile = await Profile.findOne({ alias: cleanAlias });
          if (profile && profile.crmTelegramEnable === true && profile.crmTelegramChatId) {
            const senderName = savedMessage.name || 'مخاطب ناشناس';
            const contactInfo = savedMessage.phone || savedMessage.email || 'ندارد';
            const miniSiteTitle = profile.displayName || profile.alias;
            const messageText = `📬 <b>پیام جدید از فرم تماس مینی‌سایت شما</b>\n\n👤 <b>نام فرستنده:</b> ${senderName}\n📞 <b>اطلاعات تماس:</b> ${contactInfo}\n🌐 <b>کارت شما:</b> ${miniSiteTitle} (aryal.ink/${profile.alias})\n\n💬 <b>متن پیام:</b>\n${savedMessage.message}`;
            await sendUserMessage(profile.crmTelegramChatId, messageText);
          }
        } catch (teleError) {
          console.error('User telegram CRM notification failed:', teleError);
        }
      })().catch((teleErr) => {
        console.error('Non-blocking user telegram dispatch error:', teleErr);
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'پیام شما با موفقیت ارسال شد.',
        data: savedMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in /api/messages POST:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در ثبت پیام. لطفاً مجدداً تلاش نمایید.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// PATCH: Mark message as read/unread
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه پیام الزامی است.' }, { status: 400 });
    }

    const updated = await Message.findByIdAndUpdate(
      id,
      { $set: { isRead: Boolean(isRead) } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating message in /api/messages:', error);
    return NextResponse.json({ success: false, message: 'خطا در به‌روزرسانی وضعیت پیام.' }, { status: 500 });
  }
}

