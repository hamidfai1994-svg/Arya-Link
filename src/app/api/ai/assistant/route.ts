import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface CachedGroqModel {
  modelId: string;
  cachedAt: number;
}

// In-Memory Cache for auto-discovered active Groq model (24 hours TTL)
const MODEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let cachedGroqModel: CachedGroqModel | null = null;

/**
 * Filter and select the best active chat-capable model from Groq's live models list.
 * Preference: Llama models containing '8b' or '70b' (avoiding moderation/guard models).
 */
function selectBestGroqModel(models: Array<{ id?: string; active?: boolean }>): string | null {
  if (!Array.isArray(models) || models.length === 0) return null;

  // 1. Filter models containing 'llama' but excluding non-chat guard/whisper/embedding models
  const llamaCandidates = models.filter((m) => {
    if (!m.id || typeof m.id !== 'string') return false;
    const lower = m.id.toLowerCase();
    return (
      lower.includes('llama') &&
      !lower.includes('guard') &&
      !lower.includes('whisper') &&
      !lower.includes('embed')
    );
  });

  // 2. Prioritize Llama models with '8b' (lightweight/fast) or '70b' (high capacity)
  const preferred8bOr70b = llamaCandidates.find((m) => {
    const lower = (m.id || '').toLowerCase();
    return lower.includes('8b') || lower.includes('70b');
  });
  if (preferred8bOr70b?.id) return preferred8bOr70b.id;

  // 3. Fallback to any non-guard llama model
  if (llamaCandidates.length > 0 && llamaCandidates[0].id) {
    return llamaCandidates[0].id;
  }

  // 4. Fallback to any general chat model if llama is temporarily absent
  const chatCandidate = models.find((m) => {
    if (!m.id || typeof m.id !== 'string') return false;
    const lower = m.id.toLowerCase();
    return (
      !lower.includes('guard') &&
      !lower.includes('whisper') &&
      !lower.includes('embed')
    );
  });
  if (chatCandidate?.id) return chatCandidate.id;

  return null;
}

/**
 * Auto-discover active Groq model from `https://api.groq.com/openai/v1/models`
 * Cached in memory so it only queries once per 24 hours.
 */
export async function getActiveGroqModel(apiKey: string): Promise<string> {
  const now = Date.now();
  if (cachedGroqModel && now - cachedGroqModel.cachedAt < MODEL_CACHE_TTL_MS) {
    return cachedGroqModel.modelId;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.data)) {
        const discovered = selectBestGroqModel(data.data);
        if (discovered) {
          cachedGroqModel = {
            modelId: discovered,
            cachedAt: now,
          };
          return discovered;
        }
      }
    } else {
      console.warn(
        `[Groq Auto-Discovery] GET /models returned HTTP ${response.status}: ${response.statusText}`
      );
    }
  } catch (err: any) {
    console.warn(
      '[Groq Auto-Discovery] Failed to fetch active models list:',
      err?.message || err
    );
  }

  // If previous cached value exists, reuse it
  if (cachedGroqModel?.modelId) {
    return cachedGroqModel.modelId;
  }

  // Fallback to configured env variable or modern default
  const fallbackModel = (process.env.GROQ_MODEL_NAME || 'llama-3.1-8b-instant').trim();
  cachedGroqModel = {
    modelId: fallbackModel,
    cachedAt: now,
  };
  return fallbackModel;
}

/**
 * Clean AI outputs (removes Markdown code block ticks, wrapping quotes, etc.)
 */
function cleanAiOutput(text: string): string {
  if (!text) return '';
  return text
    .replace(/^```(?:json|[a-z]*)\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/^["'«]+|["'»]+$/g, '')
    .trim();
}

/**
 * Cloudflare Workers AI Fallback Service
 */
async function generateWithCloudflareFallback(prompt: string): Promise<string> {
  const accountId = (
    process.env.CF_ACCOUNT_ID ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    ''
  )
    .replace(/["'\r\n]/g, '')
    .trim();

  const apiToken = (
    process.env.CF_API_TOKEN ||
    process.env.CLOUDFLARE_API_TOKEN ||
    ''
  )
    .replace(/["'\r\n]/g, '')
    .trim();

  const cfModel = (
    process.env.CLOUDFLARE_MODEL_NAME ||
    '@cf/meta/llama-3.1-8b-instruct'
  )
    .replace(/["'\r\n]/g, '')
    .trim();

  if (!accountId || !apiToken) {
    throw new Error(
      'Cloudflare credentials (CF_ACCOUNT_ID / CF_API_TOKEN) are missing in environment variables.'
    );
  }

  const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`;

  const cfResponse = await fetch(cfUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!cfResponse.ok) {
    const errText = await cfResponse.text().catch(() => '');
    throw new Error(`Cloudflare AI error (HTTP ${cfResponse.status}): ${errText}`);
  }

  const data = await cfResponse.json();

  let generatedText = '';
  if (typeof data?.result?.response === 'string') {
    generatedText = data.result.response;
  } else if (
    Array.isArray(data?.result?.choices) &&
    data.result.choices[0]?.message?.content
  ) {
    generatedText = data.result.choices[0].message.content;
  } else if (typeof data?.result === 'string') {
    generatedText = data.result;
  } else if (typeof data?.response === 'string') {
    generatedText = data.response;
  } else {
    generatedText = JSON.stringify(data?.result || data);
  }

  const cleaned = cleanAiOutput(generatedText);
  if (!cleaned) {
    throw new Error('Cloudflare AI returned an empty response.');
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get('authorization');
    const initDataHeader = req.headers.get('x-telegram-init-data');
    const isDev = process.env.NODE_ENV !== 'production';

    if (!session?.user && !authHeader && !initDataHeader && !isDev) {
      console.warn('[AI Assistant] Unauthenticated request rejected.');
      return NextResponse.json(
        { success: false, data: null, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, headline, currentText, displayName, fieldLabel, lang } = body;

    let prompt = '';

    if (action === 'generate_bio') {
      prompt = `شما یک دستیار حرفه‌ای کپی‌رایتینگ برای کارت ویزیت هوشمند و صفحه لینک‌بیو (Arya Link) هستید.
با توجه به اطلاعات زیر، یک متن بیوگرافی (Bio) بسیار شیک، حرفه‌ای، جذاب و موجز (حداکثر 2 تا 3 جمله کوتاه، حدود 150 تا 250 کاراکتر) به زبان فارسی روان و شایسته برای کارت ویزیت بنویسید.
اطلاعات کاربر:
نام: ${displayName || 'کاربر گرامی'}
عنوان شغلی / هدلاین: ${headline || 'متخصص و کارآفرین'}

قوانین حیاتی:
1. فقط و فقط متن نهایی بیوگرافی را بنویس. هیچ مقدمه، موخره، علامت نقل قول یا توضیح اضافی ننویس.
2. از ایموجی‌های متناسب و شیک (حداکثر 2 یا 3 ایموجی) استفاده کن.
3. تمام ارقام و اعداد در متن باید صرفاً انگلیسی (0123456789) باشند.`;
    } else if (action === 'improve_text' || action === 'refine_field') {
      const field = fieldLabel || 'متن فیلد';
      const targetLang =
        lang === 'ps'
          ? 'پشتو (رسمی و روان)'
          : lang === 'en'
            ? 'English (Professional and engaging)'
            : 'دری افغانستان (شیک و باوقار)';
      if (!currentText || currentText.trim().length === 0) {
        prompt = `شما یک کپی‌رایتر ارشد برای پلتفرم کارت هوشمند و فناوری آریا لینک (Arya Link) در افغانستان هستید.
کاربر برای فیلد "${field}" هیچ متنی وارد نکرده است. یک متن کوتاه، جذاب، متناسب با موضوع و بسیار حرفه‌ای به زبان ${targetLang} پیشنهاد دهید و بنویسید.
قوانین حیاتی:
1. فقط و فقط متن نهایی پیشنهادی را بنویس. بدون هیچ مقدمه، بدون توضیح، بدون علامت نقل قول.
2. لحن متن باید محترمانه، نوین و الهام‌بخش باشد.
3. در صورت وجود ارقام، حتماً از اعداد انگلیسی (0123456789) استفاده کن.`;
      } else {
        prompt = `شما یک ویراستار ادبی و کارشناس ارشد کپی‌رایتینگ برای پلتفرم آریا لینک (Arya Link) هستید.
متن زیر مربوط به فیلد "${field}" است. لطفاً آن را از حیث نگارش، روانی کلام، واژه‌گزینی شایسته و گیرایی به زبان ${targetLang} ارتقا بخشیده و ایرادات املایی آن را اصلاح فرمایید:
"${currentText}"

قوانین حیاتی:
1. فقط و فقط متن نهایی بازنویسی‌شده را برگردانید. هیچ توضیح، سلام، برچسب یا گیومه‌ای اضافه نکنید.
2. پیام اصلی و معنای متن را حفظ کنید و جذابیت آن را افزایش دهید.
3. تمام ارقام در صورت وجود باید صرفاً انگلیسی باشند (0123456789).`;
      }
    } else {
      return NextResponse.json(
        { success: false, data: null, message: 'عملیات هوش مصنوعی مشخص نیست.' },
        { status: 400 }
      );
    }

    let cleanText = '';
    let providerUsed: 'groq' | 'cloudflare' = 'groq';

    // ========================================================
    // PRIMARY LAYER: Groq with Auto-Discovered Live Model
    // ========================================================
    try {
      const rawApiKey = process.env.GROQ_API_KEY || '';
      const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

      if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured in server environment');
      }

      // Step 1: Discover active Groq model (or read from 24h cache)
      const selectedModel = await getActiveGroqModel(apiKey);

      // Step 2: Query Groq completions
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const errMsg =
          errBody?.error?.message ||
          `Groq API error: HTTP ${response.status} ${response.statusText}`;
        // Invalidate in-memory cache if Groq rejected the model
        cachedGroqModel = null;
        throw new Error(errMsg);
      }

      const result = await response.json();

      if (result?.error) {
        cachedGroqModel = null;
        throw new Error(result.error?.message || 'Groq returned an error response');
      }

      const rawContent = result?.choices?.[0]?.message?.content?.trim();
      if (!rawContent) {
        throw new Error('Groq returned empty text content');
      }

      cleanText = cleanAiOutput(rawContent);
      providerUsed = 'groq';
    } catch (groqError: any) {
      console.warn(
        '[AI Assistant] Groq primary service failed, falling back to Cloudflare Workers AI:',
        groqError?.message || groqError
      );

      // ========================================================
      // FALLBACK LAYER: Cloudflare Workers AI
      // ========================================================
      try {
        cleanText = await generateWithCloudflareFallback(prompt);
        providerUsed = 'cloudflare';
      } catch (cfError: any) {
        console.error(
          '[AI Assistant] Both Groq and Cloudflare failed:',
          cfError?.message || cfError
        );
        return NextResponse.json(
          {
            success: false,
            data: null,
            message:
              'خطا در برقراری ارتباط با هر دو سرویس هوش مصنوعی (گروک و کلودفلر). لطفاً دقایقی بعد دوباره تلاش نمایید.',
            error: cfError?.message || String(cfError),
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: cleanText,
      text: cleanText,
      provider: providerUsed,
      message:
        providerUsed === 'cloudflare'
          ? 'متن با موفقیت توسط سیستم پشتیبان (Cloudflare AI) تولید شد.'
          : 'متن با موفقیت توسط هوش مصنوعی تولید شد.',
    });
  } catch (error: any) {
    console.error('AI Assistant unhandled error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
