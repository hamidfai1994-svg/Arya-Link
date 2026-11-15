import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { autoTranslateFields, autoTranslateText } from '@/lib/i18n/auto-translate';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

/**
 * POST /api/admin/translate
 * Admin endpoint backed by the unified Gemini / Groq / OpenRouter / MyMemory / Offline Dictionary engine.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز برای ترجمه هوشمند.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { text, fields, sourceLang, targetLang } = body || {};

    if (typeof text === 'string' && text.trim()) {
      const result = await autoTranslateText(text, sourceLang, targetLang);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
      const sanitized: Record<string, string> = {};
      for (const [key, val] of Object.entries(fields)) {
        if (typeof val === 'string' && val.trim()) {
          sanitized[key] = val;
        }
      }

      const result = await autoTranslateFields(sanitized, sourceLang);
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    return NextResponse.json(
      { success: false, message: 'متن یا فیلدی برای ترجمه ارسال نشده است.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API /admin/translate] Error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ترجمه خودکار محتوا.' },
      { status: 500 }
    );
  }
}
