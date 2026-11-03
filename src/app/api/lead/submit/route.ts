import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Profile } from '@/models/Profile.model';
import { Lead } from '@/models/Lead.model';
import { Message } from '@/models/Message.model';
import { sendUserMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { profileAlias, name, phone, email, message } = body;

    if (!profileAlias || typeof profileAlias !== 'string') {
      return NextResponse.json(
        { success: false, message: 'شناسه پروفایل نامعتبر است.' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'لطفاً نام و نام خانوادگی خود را وارد نمایید.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'لطفاً شماره تماس خود را وارد نمایید.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'لطفاً متن پیام یا درخواست خود را بنویسید.' },
        { status: 400 }
      );
    }

    const cleanAlias = profileAlias.toLowerCase().trim();
    const profile = await Profile.findOne({ alias: cleanAlias }).select('_id alias displayName crmTelegramEnable crmTelegramChatId');

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

    // Secondary sync into general Message model for super admin auditing
    try {
      await Message.create({
        name: name.trim(),
        phone: phone.trim(),
        email: typeof email === 'string' ? email.trim() : '',
        message: message.trim(),
        profileAlias: cleanAlias,
        isRead: false,
      });
    } catch (msgErr) {
      console.warn('Message model sync warning:', msgErr);
    }

    // Increment profile leads count
    await Profile.updateOne({ _id: profile._id }, { $inc: { leadsCount: 1 } });

    // Send Telegram Notification to Mini-site owner CRM (User bot - Non-blocking)
    if (profile.crmTelegramEnable === true && profile.crmTelegramChatId) {
      (async () => {
        try {
          const senderName = newLead.name || 'مخاطب ناشناس';
          const contactInfo = newLead.phone || newLead.email || 'ندارد';
          const miniSiteTitle = profile.displayName || profile.alias;
          const messageText = `📬 <b>پیام جدید از فرم تماس مینی‌سایت شما</b>\n\n👤 <b>نام فرستنده:</b> ${senderName}\n📞 <b>اطلاعات تماس:</b> ${contactInfo}\n🌐 <b>کارت شما:</b> ${miniSiteTitle} (aryal.ink/${profile.alias})\n\n💬 <b>متن پیام:</b>\n${newLead.message}`;

          await sendUserMessage(profile.crmTelegramChatId, messageText);
        } catch (teleError) {
          console.error('User telegram CRM notification failed:', teleError);
        }
      })().catch((teleErr) => {
        console.error('Background user telegram dispatch error:', teleErr);
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'پیام شما با موفقیت ارسال شد و در اسرع وقت پاسخ داده خواهد شد.',
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
        message: 'خطا در ثبت پیام. لطفاً مجدداً تلاش نمایید.',
        error: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
