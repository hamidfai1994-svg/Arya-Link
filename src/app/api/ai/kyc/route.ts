import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

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
        { status: 503 }
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

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://aryalink.com',
        'X-Title': 'AryaLink KYC Assistant',
      },
    });

    const prompt = `شما یک دستیار هوشمند و بسیار دقیق در زمینه استخراج اطلاعات از مدارک هویتی (تذکره الکترونیکی یا کاغذی افغانستان، پاسپورت، گواهینامه و کارت ملی) هستید.
زبان متن سند ممکن است فارسی، دری، پشتو یا انگلیسی باشد.
تصویر این مدرک هویتی را بخوان و فقط و فقط یک آبجکت JSON معتبر شامل دقیقاً این ۶ کلید برگردان:
{
  "firstName": "",
  "lastName": "",
  "fatherName": "",
  "idNumber": "",
  "birthDate": "",
  "expiryDate": ""
}

قوانین امنیتی و حیاتی:
۱. خروجی باید منحصراً یک JSON معتبر باشد بدون علامت نقل‌قول مارک‌داون یا توضیحات جانبی.
۲. تمام اعداد، شماره تذکره/پاسپورت و تاریخ‌ها باید صرفاً با ارقام انگلیسی (0123456789) نوشته شوند.
۳. در صورت نبود یا ناخوانا بودن هر مورد، مقدار آن را یک رشته خالی "" قرار بده.
۴. شما به هیچ وجه حق تصمیم‌گیری، تایید یا رد هویت کاربر را ندارید؛ وظیفه شما صرفاً استخراج دقیق حروف و ارقام مندرج روی مدرک برای پیش‌نویس کردن فیلدها جهت بررسی توسط مدیر است.`;

    const imageUrlData = `data:${mimeType};base64,${base64Data}`;

    const completion = await openai.chat.completions.create({
      model: 'google/gemini-1.5-flash:free',
      temperature: 0.1,
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
                url: imageUrlData,
              },
            },
          ],
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content?.trim() || '{}';
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
    console.error('OpenRouter KYC Assistant error:', error);

    const errMsg = error?.message || (typeof error === 'string' ? error : '');
    const status = error?.status;

    let userFriendlyMessage = 'خطا در تحلیل تصویر مدرک با هوش مصنوعی OpenRouter.';
    if (status === 401 || errMsg.includes('401') || errMsg.includes('invalid_api_key')) {
      userFriendlyMessage = 'کلید API هوش مصنوعی در سرور نامعتبر است.';
    } else if (status === 429 || errMsg.includes('429') || errMsg.includes('rate limit')) {
      userFriendlyMessage = 'سقف مجاز درخواست‌های مدل هوش مصنوعی در این لحظه تکمیل شده است. لطفاً دقایقی دیگر تلاش فرمایید.';
    } else if (errMsg) {
      userFriendlyMessage = `خطا در استخراج اطلاعات مدرک: ${errMsg}`;
    }

    return NextResponse.json(
      {
        success: false,
        message: userFriendlyMessage,
        error: errMsg || 'KYC extraction failed',
      },
      { status: typeof status === 'number' && status >= 400 && status < 600 ? status : 500 }
    );
  }
}

