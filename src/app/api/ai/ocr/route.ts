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
  if (typeof rawText !== 'string') {
    return JSON.stringify(rawText);
  }

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
      console.warn('[AI OCR] Unauthenticated request rejected.');
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

    const prompt = `شما یک مدل هوش مصنوعی بینایی ماشین با دقت 100% برای استخراج اطلاعات از کارت‌های ویزیت هستید.
تمام اطلاعات موجود روی این کارت ویزیت (شامل نام، سمت، شرکت، شماره‌های تماس، ایمیل، وب‌سایت، آدرس فیزیکی، شبکه‌های اجتماعی، فکس، شعار و...) را با دقت بخوان و یک ساختار JSON کاملاً پویا و ماژولار تولید کن. زبان کارت ممکن است فارسی، دری، پشتو یا انگلیسی باشد.

قوانین حیاتی:
1. تمام اعداد، ارقام و شماره تلفن‌ها باید صرفاً با ارقام انگلیسی (0123456789) نوشته شوند.
2. بخش basic_info: شامل نام و نام خانوادگی فرد (name)، سمت یا عنوان شغلی (job_title) و نام شرکت/سازمان/برند (company).
3. بخش modules: آرایه‌ای پویا از تمام اطلاعات و راه‌های ارتباطی یافت‌شده روی کارت ویزیت است:
   - اگر شماره تلفن، موبایل یا خط ثابت بود: { "type": "phone", "value": "+93..." }
   - اگر ایمیل بود: { "type": "email", "value": "..." }
   - اگر وب‌سایت بود: { "type": "website", "value": "https://..." }
   - اگر آدرس پستی، فیزیکی یا موقعیت مکانی بود: { "type": "address", "value": "..." }
   - اگر شبکه اجتماعی یا پیام‌رسان بود (whatsapp, telegram, instagram, linkedin, twitter, facebook و...): { "type": "social", "platform": "whatsapp", "value": "..." }
   - اگر فکس بود: { "type": "fax", "value": "..." }
   - اگر هر فیلد دیگری (مانند شعار شرکت، معرفی، شماره ثبت و...) بود: { "type": "text", "label": "عنوان", "value": "..." }
4. قانون عدم ارسال فیلد خالی: شما مجازید هر فیلد جدیدی که پیدا کردید را با type مناسب به آرایه modules اضافه کنید. اما اگر فیلدی (مانند وب‌سایت یا آدرس) روی کارت وجود نداشت، اصلاً آن را در آرایه modules قرار ندهید.
5. ساختار خروجی باید دقیقاً این قالب JSON معتبر باشد:
{
  "basic_info": {
    "name": "",
    "job_title": "",
    "company": ""
  },
  "modules": [
    { "type": "phone", "value": "" },
    { "type": "email", "value": "" },
    { "type": "website", "value": "" },
    { "type": "address", "value": "" },
    { "type": "social", "platform": "telegram", "value": "" }
  ]
}

You are a strict data extraction machine. YOU MUST ONLY RETURN RAW VALID JSON. DO NOT output any conversational text, greetings, markdown formatting, or explanations. Just output the pure JSON object starting with { and ending with }.`;

    const messages = [
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
              url: `data:image/jpeg;base64,${base64Data}`,
            },
          },
        ],
      },
    ];

    let rawText = '';

    // ========================================================
    // LAYER 1: Groq API (Primary Service)
    // ========================================================
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured in server environment');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.GROQ_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          response_format: { type: 'json_object' },
          messages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      rawText = data?.choices?.[0]?.message?.content || '{}';
    } catch (groqError: any) {
      console.error('Groq Layer Error:', groqError);
      console.warn('[OCR Fallback] Groq primary service failed, falling back to Cloudflare AI:', groqError?.message || groqError);

      // ========================================================
      // LAYER 2: Cloudflare API (Fallback Service)
      // ========================================================
      try {
        if (!process.env.CF_ACCOUNT_ID || !process.env.CF_API_TOKEN) {
          throw new Error('Cloudflare credentials (CF_ACCOUNT_ID or CF_API_TOKEN) are missing in environment variables.');
        }

        const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`;
        const cfResponse = await fetch(cfUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + process.env.CF_API_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
                      url: `data:image/jpeg;base64,${base64Data}`,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (!cfResponse.ok) {
          const cfErrText = await cfResponse.text();
          throw new Error(`Cloudflare API error (${cfResponse.status}): ${cfErrText}`);
        }

        const data = await cfResponse.json();
        const fallbackRawText = typeof data?.result?.response === 'string'
          ? data.result.response
          : JSON.stringify(data?.result?.response || data);
        rawText = fallbackRawText;
      } catch (cfError: any) {
        console.error('RAW_FALLBACK_FAIL:', {
          groq: groqError?.message || String(groqError),
          cloudflare: cfError?.message || String(cfError),
        });

        return NextResponse.json(
          { success: false, message: cfError instanceof Error ? cfError.message : String(cfError) },
          { status: 500 }
        );
      }
    }
    const cleanedText = cleanJsonOutput(rawText);

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch {
      console.warn('[OCR JSON Fallback] JSON parse fallback via regex:', rawText);
      const nameMatch = rawText.match(/"name"\s*:\s*"([^"]*)"/);
      const phoneMatch = rawText.match(/"phone"\s*:\s*"([^"]*)"/);
      const emailMatch = rawText.match(/"email"\s*:\s*"([^"]*)"/);
      const websiteMatch = rawText.match(/"website"\s*:\s*"([^"]*)"/);
      const companyMatch = rawText.match(/"company"\s*:\s*"([^"]*)"/);
      const jobTitleMatch = rawText.match(/"job_title"\s*:\s*"([^"]*)"/);
      const addressMatch = rawText.match(/"address"\s*:\s*"([^"]*)"/);
      parsedResult = {
        basic_info: {
          name: nameMatch ? nameMatch[1] : '',
          job_title: jobTitleMatch ? jobTitleMatch[1] : '',
          company: companyMatch ? companyMatch[1] : '',
        },
        modules: [
          ...(phoneMatch ? [{ type: 'phone', value: phoneMatch[1] }] : []),
          ...(emailMatch ? [{ type: 'email', value: emailMatch[1] }] : []),
          ...(websiteMatch ? [{ type: 'website', value: websiteMatch[1] }] : []),
          ...(addressMatch ? [{ type: 'address', value: addressMatch[1] }] : []),
        ],
      };
    }

    const rawBasic = parsedResult.basic_info || {};
    const name = (rawBasic.name || parsedResult.name || '').trim();
    const job_title = (rawBasic.job_title || parsedResult.job_title || '').trim();
    const company = (rawBasic.company || parsedResult.company || '').trim();

    let rawModules: any[] = Array.isArray(parsedResult.modules) ? parsedResult.modules : [];
    if (rawModules.length === 0) {
      if (parsedResult.phone) rawModules.push({ type: 'phone', value: parsedResult.phone });
      if (parsedResult.email) rawModules.push({ type: 'email', value: parsedResult.email });
      if (parsedResult.website) rawModules.push({ type: 'website', value: parsedResult.website });
      if (parsedResult.address) rawModules.push({ type: 'address', value: parsedResult.address });
      if (parsedResult.socials && typeof parsedResult.socials === 'object') {
        Object.entries(parsedResult.socials).forEach(([platform, val]) => {
          if (val && typeof val === 'string') {
            rawModules.push({ type: 'social', platform, value: val });
          }
        });
      }
    }

    const modules = rawModules
      .filter((m) => m && typeof m === 'object' && m.value && String(m.value).trim().length > 0)
      .map((m) => {
        const type = String(m.type || 'text').toLowerCase().trim();
        let value = String(m.value).trim();
        if (type === 'phone' || type === 'telephone' || type === 'fax' || type === 'mobile') {
          value = normalizeToEnglishDigits(value.replace(/[\s-]/g, ''));
        }
        return {
          type,
          value,
          ...(m.platform ? { platform: String(m.platform).toLowerCase().trim() } : {}),
          ...(m.label ? { label: String(m.label).trim() } : {}),
        };
      });

    const primaryPhone = modules.find((m) => m.type === 'phone' || m.type === 'telephone')?.value || '';
    const primaryEmail = modules.find((m) => m.type === 'email')?.value || '';
    const primaryWebsite = modules.find((m) => m.type === 'website')?.value || '';
    const primaryAddress = modules.find((m) => m.type === 'address' || m.type === 'location')?.value || '';

    const socials: Record<string, string> = {};
    modules.filter((m) => m.type === 'social' && m.platform).forEach((m) => {
      socials[m.platform!] = m.value;
    });

    return NextResponse.json({
      success: true,
      data: {
        basic_info: {
          name,
          job_title,
          company,
        },
        modules,
        // Legacy keys for backward compatibility
        name,
        phone: primaryPhone,
        email: primaryEmail,
        website: primaryWebsite,
        company,
        job_title,
        address: primaryAddress,
        socials,
      },
      message: 'کارت ویزیت با موفقیت توسط هوش مصنوعی تحلیل شد.',
    });
  } catch (error: any) {
    console.error('UNEXPECTED_OCR_ERROR:', error);

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
