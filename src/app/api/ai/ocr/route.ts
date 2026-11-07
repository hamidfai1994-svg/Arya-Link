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
    const authHeader = req.headers.get('authorization');
    const initDataHeader = req.headers.get('x-telegram-init-data');
    const isDev = process.env.NODE_ENV !== 'production';

    // Allow authenticated web users, Telegram mini-app requests, or local development
    if (!session?.user && !authHeader && !initDataHeader && !isDev) {
      console.warn('[OpenRouter OCR] Unauthenticated request rejected.');
      return NextResponse.json(
        { success: false, data: null, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const rawApiKey = process.env.OPENROUTER_API_KEY || '';
    const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

    if (!apiKey) {
      console.error('[OpenRouter OCR Error] OPENROUTER_API_KEY is not defined in environment variables.');
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'کلید وب‌سرویس هوش مصنوعی (OPENROUTER_API_KEY) در سرور تنظیم نشده است.',
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
        console.error('[OpenRouter OCR Error] Failed to fetch image URL:', err);
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

    // Initialize OpenAI Client for OpenRouter
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://aryalink.com',
        'X-Title': 'AryaLink OCR Scanner',
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
      console.warn('[OpenRouter OCR] JSON parse fallback via regex:', rawText);
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
      message: 'کارت ویزیت با موفقیت توسط هوش مصنوعی OpenRouter تحلیل شد.',
    });
  } catch (error: any) {
    console.error('[OpenRouter OCR Error Detailed Log]:', {
      message: error?.message,
      status: error?.status,
      stack: error?.stack,
    });

    const errMsg = error?.message || (typeof error === 'string' ? error : '');
    const status = error?.status;

    let userFriendlyMessage = 'خطا در تحلیل تصویر کارت ویزیت با هوش مصنوعی OpenRouter.';
    if (status === 401 || errMsg.includes('401') || errMsg.includes('User key not found') || errMsg.includes('invalid_api_key')) {
      userFriendlyMessage = 'کلید وب‌سرویس OpenRouter نامعتبر است. لطفاً کلید معتبر در فایل env تنظیم نمایید.';
    } else if (status === 429 || errMsg.includes('429') || errMsg.includes('rate limit')) {
      userFriendlyMessage = 'سقف مجاز درخواست‌های مدل رایگان OpenRouter در این لحظه تکمیل شده است. لطفاً دقایقی دیگر مجدداً تلاش کنید.';
    } else if (status === 403 || errMsg.includes('403')) {
      userFriendlyMessage = 'دسترسی به این مدل در OpenRouter مسدود است.';
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
      { status: typeof status === 'number' && status >= 400 && status < 600 ? status : 500 }
    );
  }
}
