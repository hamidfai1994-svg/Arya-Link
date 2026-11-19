import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Message } from '@/models/Message.model';
import { getRequestLocale } from '@/lib/i18n/server-locale';
import { tServer } from '@/lib/i18n/translations';
import { getContactMessageSchema } from '@/lib/validations/forms';
import { createPlatformNotification } from '@/lib/notifications';
import { sendSupportMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

/**
 * POST /api/contact
 * Stores public Contact Us inquiries and notifies platform admins on web & Telegram.
 */
export async function POST(req: NextRequest) {
  let locale = getRequestLocale(req);
  try {
    const body = await req.json();
    locale = getRequestLocale(req, body?.locale || body?.language);

    const schema = getContactMessageSchema(locale);
    const parsed = schema.safeParse({
      senderName: body?.name || body?.senderName || '',
      senderEmail: body?.email || body?.senderEmail || '',
      senderPhone: body?.phone || body?.senderPhone || '',
      messageText: body?.message || body?.messageText || '',
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || tServer(locale, 'validation.required');
      return NextResponse.json({ success: false, message: firstIssue }, { status: 400 });
    }

    const { senderName, senderEmail, senderPhone, messageText } = parsed.data;
    await connectToDatabase();

    const doc = await Message.create({
      name: senderName,
      email: senderEmail || '',
      phone: senderPhone || '',
      message: messageText,
      profileAlias: '__site_contact__',
      isRead: false,
      status: 'new',
    });

    await createPlatformNotification({
      userId: 'admin',
      targetRole: 'admin',
      title: tServer(locale, 'notifications.contact_title', 'پیام جدید از فرم تماس با ما'),
      message: `${senderName}${senderPhone ? ` (${senderPhone})` : ''}: ${messageText.slice(0, 90)}`,
      type: 'ticket',
      link: '/admin/system',
      metadata: { messageId: doc._id.toString() },
    });

    const adminChatId = (process.env.TELEGRAM_ADMIN_CHAT_ID || '').trim();
    if (adminChatId) {
      await sendSupportMessage(
        adminChatId,
        `📩 <b>پیام جدید فرم تماس با ما</b>\n👤 نام: ${senderName}\n📞 تماس: ${senderPhone || '-'}\n📧 ایمیل: ${senderEmail || '-'}\n💬 متن:\n${messageText}`
      ).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        message: tServer(locale, 'toast.message_sent'),
        data: { id: doc._id.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting public contact form:', error);
    return NextResponse.json(
      {
        success: false,
        message: tServer(locale, 'toast.message_error'),
      },
      { status: 500 }
    );
  }
}
