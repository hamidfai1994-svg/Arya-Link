import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function normalizeToEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

function cleanJsonOutput(rawText: string): string {
  if (!rawText) return '{}';

  // 1. Extract markdown code block content if present
  const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // 2. Extract outermost JSON object if enclosed in brackets
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return rawText.substring(firstBrace, lastBrace + 1).trim();
  }

  // 3. Fallback clean backticks and formatting
  return rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const rawApiKey = process.env.OPENROUTER_API_KEY || '';
    const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'کلید وب‌سرویس هوش مصنوعی (OPENROUTER_API_KEY) در متغیرهای سرور تنظیم نشده است.',
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageBase64, imageUrl } = body;

    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      try {
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          return NextResponse.json(
            { success: false, message: 'دانلود تصویر مدرک از آدرس اینترنتی با خطا مواجه شد.' },
            { status: 400 }
          );
        }
        const contentType = imageRes.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          mimeType = contentType;
        }
        const buffer = await imageRes.arrayBuffer();
        base64Data = Buffer.from(buffer).toString('base64');
      } catch (err: any) {
        console.error('[OpenRouter KYC Error] Failed to fetch image URL:', err);
        return NextResponse.json(
          { success: false, message: 'خطا در بارگیری آدرس اینترنتی تصویر مدرک.', error: err?.message },
          { status: 400 }
        );
      }
    } else if (imageBase64 && typeof imageBase64 === 'string') {
      const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      } else {
        base64Data = imageBase64.replace(/^data:image\/[a-z0-9-.+]+;base64,/, '');
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'لطفاً تصویر مدرک هویتی (پاسپورت یا تذکره) را ارسال فرمایید.' },
        { status: 400 }
      );
    }

    if (!base64Data || base64Data.length < 10) {
      return NextResponse.json(
        { success: false, message: 'داده‌های تصویر ارسالی نامعتبر است.' },
        { status: 400 }
      );
    }

    const prompt = `شما یک دستیار هوشمند و بسیار دقیق در زمینه استخراج اطلاعات از مدارک هویتی (تذکره الکترونیکی یا کاغذی افغانستان، پاسپورت، گواهینامه و کارت ملی) هستید.
زبان متن سند ممکن است فارسی، دری، پشتو یا انگلیسی باشد.
تصویر این مدرک هویتی را بخوان و فقط و فقط یک آبجکت JSON معتبر شامل دقیقاً این 6 کلید برگردان:
{
  "firstName": "",
  "lastName": "",
  "fatherName": "",
  "idNumber": "",
  "birthDate": "",
  "expiryDate": ""
}

قوانین امنیتی و حیاتی:
1. خروجی باید منحصراً یک JSON معتبر باشد بدون علامت نقل‌قول مارک‌داون یا توضیحات جانبی.
2. تمام اعداد، شماره تذکره/پاسپورت و تاریخ‌ها باید صرفاً با ارقام انگلیسی (0123456789) نوشته شوند.
3. در صورت نبود یا ناخوانا بودن هر مورد، مقدار آن را یک رشته خالی "" قرار بده.
4. شما به هیچ وجه حق تصمیم‌گیری، تایید یا رد هویت کاربر را ندارید؛ وظیفه شما صرفاً استخراج دقیق حروف و ارقام مندرج روی مدرک برای پیش‌نویس کردن فیلدها جهت بررسی توسط مدیر است.`;

    const formattedImageDataUrl = `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://aryalink.com',
        'X-Title': 'Arya Link',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        models: ['google/gemini-flash-1.5', 'google/gemini-2.0-flash-001'],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: formattedImageDataUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody?.error?.message || `OpenRouter API error: HTTP ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    const result = await response.json();
    const rawText = result?.choices?.[0]?.message?.content?.trim() || '{}';
    const cleanedText = cleanJsonOutput(rawText);

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch {
      console.warn('[OpenRouter KYC] JSON parse fallback via regex:', rawText);
      const fnMatch = rawText.match(/"firstName"\s*:\s*"([^"]*)"/);
      const lnMatch = rawText.match(/"lastName"\s*:\s*"([^"]*)"/);
      const faMatch = rawText.match(/"fatherName"\s*:\s*"([^"]*)"/);
      const idMatch = rawText.match(/"idNumber"\s*:\s*"([^"]*)"/);
      const bdMatch = rawText.match(/"birthDate"\s*:\s*"([^"]*)"/);
      const exMatch = rawText.match(/"expiryDate"\s*:\s*"([^"]*)"/);
      parsedResult = {
        firstName: fnMatch ? fnMatch[1] : '',
        lastName: lnMatch ? lnMatch[1] : '',
        fatherName: faMatch ? faMatch[1] : '',
        idNumber: idMatch ? idMatch[1] : '',
        birthDate: bdMatch ? bdMatch[1] : '',
        expiryDate: exMatch ? exMatch[1] : '',
      };
    }

    const firstName = (parsedResult.firstName || '').trim();
    const lastName = (parsedResult.lastName || '').trim();
    const fatherName = (parsedResult.fatherName || '').trim();
    const idNumber = normalizeToEnglishDigits((parsedResult.idNumber || '').trim().replace(/[\s-]/g, ''));
    const birthDate = normalizeToEnglishDigits((parsedResult.birthDate || '').trim());
    const expiryDate = normalizeToEnglishDigits((parsedResult.expiryDate || '').trim());

    return NextResponse.json({
      success: true,
      data: {
        firstName,
        lastName,
        fatherName,
        idNumber,
        birthDate,
        expiryDate,
      },
      message: 'اطلاعات هویتی با موفقیت توسط هوش مصنوعی استخراج شد.',
    });
  } catch (error: any) {
    console.error('RAW_OPENROUTER_ERROR:', error);

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
