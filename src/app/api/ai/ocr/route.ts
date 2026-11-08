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
      console.warn(`[Gemini OCR] Attempt ${attempt}/${maxRetries} failed with error:`, err?.message || err);

      if (attempt < maxRetries && isServerError(err)) {
        console.info(`[Gemini OCR] Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
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
    const authHeader = req.headers.get('authorization');
    const initDataHeader = req.headers.get('x-telegram-init-data');
    const isDev = process.env.NODE_ENV !== 'production';

    // Allow authenticated web users, Telegram mini-app requests, or local development
    if (!session?.user && !authHeader && !initDataHeader && !isDev) {
      console.warn('[Gemini OCR] Unauthenticated request rejected.');
      return NextResponse.json(
        { success: false, data: null, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const rawApiKey = process.env.GEMINI_API_KEY || '';
    const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

    if (!apiKey) {
      console.error('[Gemini OCR Error] GEMINI_API_KEY is not defined in environment variables.');
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'کلید وب‌سرویس هوش مصنوعی (GEMINI_API_KEY) در سرور تنظیم نشده است.',
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { imageBase64, imageUrl } = body;

    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      try {
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          return NextResponse.json(
            { success: false, data: null, message: 'دانلود تصویر از آدرس اینترنتی با خطا مواجه شد.' },
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
        console.error('[Gemini OCR Error] Failed to fetch image URL:', err);
        return NextResponse.json(
          { success: false, data: null, message: 'خطا در بارگیری آدرس اینترنتی تصویر کارت.', error: err?.message },
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
        { success: false, data: null, message: 'لطفاً تصویر کارت ویزیت را به صورت فایل یا آدرس اینترنتی ارسال کنید.' },
        { status: 400 }
      );
    }

    if (!base64Data || base64Data.length < 10) {
      return NextResponse.json(
        { success: false, data: null, message: 'داده‌های تصویر ارسالی نامعتبر یا بسیار کوتاه است.' },
        { status: 400 }
      );
    }

    // Initialize Google Generative AI Client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.1,
      },
    });

    const prompt = `شما یک مدل هوش مصنوعی بینایی ماشین با دقت ۱۰۰٪ برای خواندن و استخراج اطلاعات از کارت‌های ویزیت هستید.
متن این کارت ویزیت را بخوان و فقط یک آبجکت JSON با کلیدهای name, phone, email, website, company, job_title, socials برگردان. زبان کارت ممکن است فارسی، دری، پشتو یا انگلیسی باشد.

قوانین حیاتی:
۱. تمام اعداد، شماره تلفن‌ها و ارقام باید صرفاً با ارقام انگلیسی (0123456789) باشند.
۲. فیلد name: نام و نام خانوادگی فرد روی کارت.
۳. فیلد phone: شماره تماس مستقیم یا موبایل با پیش‌شماره در صورت وجود (صرفاً ارقام انگلیسی).
۴. فیلد email: آدرس ایمیل معتبر.
۵. فیلد website: آدرس وب‌سایت اینترنتی (مثلاً https://example.com یا example.com).
۶. فیلد company: نام شرکت، سازمان یا برند.
۷. فیلد job_title: سمت یا عنوان شغلی فرد.
۸. فیلد socials: آبجکتی از آیدی یا لینک شبکه‌های اجتماعی یافت‌شده روی کارت شامل whatsapp, telegram, instagram, linkedin, twitter, facebook.
۹. خروجی باید صرفاً یک JSON استاندارد باشد:
{
  "name": "",
  "phone": "",
  "email": "",
  "website": "",
  "company": "",
  "job_title": "",
  "socials": {
    "whatsapp": "",
    "telegram": "",
    "instagram": "",
    "linkedin": "",
    "twitter": "",
    "facebook": ""
  }
}`;

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
      console.warn('[Gemini OCR] JSON parse fallback via regex:', rawText);
      const nameMatch = rawText.match(/"name"\s*:\s*"([^"]*)"/);
      const phoneMatch = rawText.match(/"phone"\s*:\s*"([^"]*)"/);
      const emailMatch = rawText.match(/"email"\s*:\s*"([^"]*)"/);
      const websiteMatch = rawText.match(/"website"\s*:\s*"([^"]*)"/);
      const companyMatch = rawText.match(/"company"\s*:\s*"([^"]*)"/);
      const jobTitleMatch = rawText.match(/"job_title"\s*:\s*"([^"]*)"/);
      parsedResult = {
        name: nameMatch ? nameMatch[1] : '',
        phone: phoneMatch ? phoneMatch[1] : '',
        email: emailMatch ? emailMatch[1] : '',
        website: websiteMatch ? websiteMatch[1] : '',
        company: companyMatch ? companyMatch[1] : '',
        job_title: jobTitleMatch ? jobTitleMatch[1] : '',
        socials: {},
      };
    }

    const name = (parsedResult.name || '').trim();
    const phone = normalizeToEnglishDigits((parsedResult.phone || '').trim().replace(/[\s-]/g, ''));
    const email = (parsedResult.email || '').trim().toLowerCase();
    const website = (parsedResult.website || '').trim();
    const company = (parsedResult.company || '').trim();
    const job_title = (parsedResult.job_title || '').trim();
    const socials = parsedResult.socials || {};

    return NextResponse.json({
      success: true,
      data: {
        name,
        phone,
        email,
        website,
        company,
        job_title,
        socials,
      },
      message: 'کارت ویزیت با موفقیت توسط هوش مصنوعی تحلیل شد.',
    });
  } catch (error: any) {
    console.error('[Gemini OCR Error Detailed Log]:', {
      message: error?.message,
      status: error?.status,
      stack: error?.stack,
    });

    const errMsg = error?.message || (typeof error === 'string' ? error : '');
    const status = error?.status;

    let userFriendlyMessage = 'خطا در تحلیل تصویر کارت ویزیت با هوش مصنوعی جمنای.';
    if (isServerError(error)) {
      userFriendlyMessage = 'سرورهای هوش مصنوعی در حال حاضر شلوغ هستند. لطفاً چند لحظه دیگر دوباره امتحان کنید.';
    } else if (status === 401 || errMsg.includes('401') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
      userFriendlyMessage = 'کلید وب‌سرویس گوگل جمنای نامعتبر است. لطفاً کلید معتبر را در فایل env تنظیم نمایید.';
    } else if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyMessage = 'سقف مجاز درخواست‌های مدل جمنای در این لحظه تکمیل شده است. لطفاً دقایقی دیگر مجدداً تلاش کنید.';
    } else if (status === 403 || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
      userFriendlyMessage = 'دسترسی به سرویس جمنای با محدودیت مواجه شده است.';
    } else if (errMsg) {
      userFriendlyMessage = `خطا در اسکن تصویر کارت ویزیت: ${errMsg}`;
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: userFriendlyMessage,
        error: errMsg || 'OCR processing failed',
      },
      { status: typeof status === 'number' && status >= 400 && status < 600 ? status : (isServerError(error) ? 503 : 500) }
    );
  }
}
