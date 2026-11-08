import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isServerError(error: any): boolean {
  const status = error?.status || error?.statusCode;
  const msg = (error?.message || '').toLowerCase();

  if (typeof status === 'number' && status >= 500 && status < 600) {
    return true;
  }

  return (
    msg.includes('503') ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('504') ||
    msg.includes('service unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('resource_exhausted') ||
    msg.includes('resource exhausted') ||
    msg.includes('rate limit')
  );
}

async function generateWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 500): Promise<T> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini KYC] Attempt ${attempt}/${maxRetries} failed with error:`, err?.message || err);

      if (attempt < maxRetries && isServerError(err)) {
        console.info(`[Gemini KYC] Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await sleep(delayMs);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
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

    const rawApiKey = process.env.GEMINI_API_KEY || '';
    const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'کلید وب‌سرویس هوش مصنوعی (GEMINI_API_KEY) در متغیرهای سرور تنظیم نشده است.',
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.1,
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

    const result = await generateWithRetry(() =>
      model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        },
      ])
    );

    const response = await result.response;
    const rawText = response.text()?.trim() || '{}';
    const cleanedText = cleanJsonOutput(rawText);

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch {
      console.warn('[Gemini KYC] JSON parse fallback via regex:', rawText);
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
    console.error('Gemini KYC Assistant error:', error);

    const errMsg = error?.message || (typeof error === 'string' ? error : '');
    const status = error?.status;

    let userFriendlyMessage = 'خطا در تحلیل تصویر مدرک با هوش مصنوعی جمنای.';
    if (isServerError(error)) {
      userFriendlyMessage = 'سرورهای هوش مصنوعی در حال حاضر شلوغ هستند. لطفاً چند لحظه دیگر دوباره امتحان کنید.';
    } else if (status === 401 || errMsg.includes('401') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
      userFriendlyMessage = 'کلید API هوش مصنوعی در سرور نامعتبر است.';
    } else if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
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
      { status: typeof status === 'number' && status >= 400 && status < 600 ? status : (isServerError(error) ? 503 : 500) }
    );
  }
}

