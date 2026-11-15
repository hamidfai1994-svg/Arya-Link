import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isValidUserSession } from '@/lib/db/data-isolation';
import { autoTranslateFields, autoTranslateText } from '@/lib/i18n/auto-translate';

export const dynamic = 'force-dynamic';

const MAX_TEXT_LENGTH = 5000;
const MAX_BATCH_FIELDS = 25;

/**
 * POST /api/translate
 * Authenticated endpoint for any logged-in user (Profile Editor, Dashboard, SuperAdmin)
 * to auto-translate content into Afghan Dari (`da`/`fa`), Pashto (`ps`), and English (`en`).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isValidUserSession(session?.user)) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { text, fields, sourceLang, targetLang } = body || {};

    if (typeof text === 'string') {
      if (!text.trim()) {
        return NextResponse.json(
          { success: false, message: 'متن برای ترجمه خالی است.' },
          { status: 400 }
        );
      }

      if (text.length > MAX_TEXT_LENGTH) {
        return NextResponse.json(
          { success: false, message: 'طول متن از حد مجاز بیشتر است.' },
          { status: 400 }
        );
      }

      const result = await autoTranslateText(text, sourceLang, targetLang);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
      const entries = Object.entries(fields).slice(0, MAX_BATCH_FIELDS);
      const sanitized: Record<string, string> = {};
      for (const [key, val] of entries) {
        if (typeof val === 'string' && val.trim()) {
          sanitized[key] = val.slice(0, MAX_TEXT_LENGTH);
        }
      }

      if (Object.keys(sanitized).length === 0) {
        return NextResponse.json(
          { success: false, message: 'هیچ متنی برای ترجمه ارسال نشده است.' },
          { status: 400 }
        );
      }

      const result = await autoTranslateFields(sanitized, sourceLang);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    return NextResponse.json(
      { success: false, message: 'پارامترهای ترجمه معتبر نیست.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API /translate] Error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در سرور هنگام ترجمه خودکار.' },
      { status: 500 }
    );
  }
}
