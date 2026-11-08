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
  const rawApiKey = process.env.OPENROUTER_API_KEY || '';
  const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

  if (!process.env.OPENROUTER_API_KEY || !apiKey) {
    console.error('[OpenRouter OCR] OPENROUTER_API_KEY is not defined in environment variables.');
    return NextResponse.json(
      { success: false, data: null, message: 'OPENROUTER_API_KEY is missing in server environment' },
      { status: 500 }
    );
  }

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

    const prompt = `شما یک مدل هوش مصنوعی بینایی ماشین با دقت 100% برای خواندن و استخراج اطلاعات از کارت‌های ویزیت هستید.
متن این کارت ویزیت را بخوان و فقط یک آبجکت JSON با کلیدهای name, phone, email, website, company, job_title, socials برگردان. زبان کارت ممکن است فارسی، دری، پشتو یا انگلیسی باشد.

قوانین حیاتی:
1. تمام اعداد، شماره تلفن‌ها و ارقام باید صرفاً با ارقام انگلیسی (0123456789) باشند.
2. فیلد name: نام و نام خانوادگی فرد روی کارت.
3. فیلد phone: شماره تماس مستقیم یا موبایل با پیش‌شماره در صورت وجود (صرفاً ارقام انگلیسی).
4. فیلد email: آدرس ایمیل معتبر.
5. فیلد website: آدرس وب‌سایت اینترنتی (مثلاً https://example.com یا example.com).
6. فیلد company: نام شرکت، سازمان یا برند.
7. فیلد job_title: سمت یا عنوان شغلی فرد.
8. فیلد socials: آبجکتی از آیدی یا لینک شبکه‌های اجتماعی یافت‌شده روی کارت شامل whatsapp, telegram, instagram, linkedin, twitter, facebook.
9. خروجی باید صرفاً یک JSON استاندارد باشد:
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
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody?.error?.message || `OpenRouter API error: HTTP ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content?.trim() || '{}';
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
      message: 'کارت ویزیت با موفقیت توسط هوش مصنوعی تحلیل شد.',
    });
  } catch (error: any) {
    console.error('RAW_OPENROUTER_ERROR:', error);

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
