import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

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
      console.warn(`[Gemini Assistant] Attempt ${attempt}/${maxRetries} failed with error:`, err?.message || err);

      if (attempt < maxRetries && isServerError(err)) {
        console.info(`[Gemini Assistant] Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await sleep(delayMs);
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

export async function POST(req: NextRequest) {
  console.log("Checking API Key in Backend:", !!process.env.GEMINI_API_KEY);

  const rawApiKey = process.env.GEMINI_API_KEY || '';
  const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

  if (!process.env.GEMINI_API_KEY || !apiKey) {
    return NextResponse.json(
      { success: false, data: null, message: "API Key is missing in server environment" },
      { status: 500 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get('authorization');
    const initDataHeader = req.headers.get('x-telegram-init-data');
    const isDev = process.env.NODE_ENV !== 'production';

    if (!session?.user && !authHeader && !initDataHeader && !isDev) {
      console.warn('[Gemini Assistant] Unauthenticated request rejected.');
      return NextResponse.json(
        { success: false, data: null, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, headline, currentText, displayName } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

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
    } else if (action === 'improve_text') {
      if (!currentText || currentText.trim().length === 0) {
        return NextResponse.json(
          { success: false, data: null, message: 'متنی برای اصلاح نگارش ارسال نشده است.' },
          { status: 400 }
        );
      }

      prompt = `شما یک ویراستار ادبی و متخصص نگارش متون معرفی شخصی و بیزینس برای پلتفرم Arya Link هستید.
متن زیر را از نظر نگارش، علائم نگارشی، لحن حرفه‌ای و تاثیرگذاری بهبود ببخش، روان‌تر کن و ایرادات املایی آن را اصلاح کن:
"${currentText}"

قوانین حیاتی:
1. فقط و فقط نسخه اصلاح‌شده نهایی متن را بازگردان. هیچ توضیح اضافه یا برچسبی ننویس.
2. لحن متن باید محترمانه، حرفه‌ای و جذاب باشد.
3. تمام اعداد در متن در صورت وجود باید صرفاً انگلیسی باشند (0123456789).`;
    } else {
      return NextResponse.json(
        { success: false, data: null, message: 'عملیات هوش مصنوعی مشخص نیست.' },
        { status: 400 }
      );
    }

    const result = await generateWithRetry(() => model.generateContent(prompt));
    const response = await result.response;
    const generatedText = response.text()?.trim() || '';

    // Remove code block markers or wrapping quotes if AI included them
    const cleanText = generatedText
      .replace(/^```(?:json|[a-z]*)\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/^["'«]+|["'»]+$/g, '')
      .trim();

    return NextResponse.json({
      success: true,
      data: cleanText,
      text: cleanText,
      message: 'متن با موفقیت توسط هوش مصنوعی تولید شد.',
    });
  } catch (error: any) {
    console.error('[Gemini AI Assistant Error Detailed Log]:', {
      message: error?.message,
      status: error?.status,
      stack: error?.stack,
    });

    const errMsg = error?.message || (typeof error === 'string' ? error : '');
    const status = error?.status;

    let userFriendlyMessage = 'خطا در ارتباط با سرویس هوش مصنوعی گوگل جمنای.';
    if (isServerError(error)) {
      userFriendlyMessage = 'سرورهای هوش مصنوعی در حال حاضر شلوغ هستند. لطفاً چند لحظه دیگر دوباره امتحان کنید.';
    } else if (status === 401 || errMsg.includes('401') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
      userFriendlyMessage = 'کلید API هوش مصنوعی در سرور نامعتبر است. لطفاً کلید GEMINI_API_KEY را در تنظیمات بررسی کنید.';
    } else if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyMessage = 'محدودیت تعداد درخواست هوش مصنوعی تکمیل شده است. لطفاً دقایقی دیگر مجدداً تلاش کنید.';
    } else if (status === 403 || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
      userFriendlyMessage = 'دسترسی به سرویس جمنای با محدودیت مواجه شده است.';
    } else if (errMsg) {
      userFriendlyMessage = `خطا در پردازش هوش مصنوعی: ${errMsg}`;
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: userFriendlyMessage,
        error: errMsg || 'AI Generation Failed',
      },
      { status: typeof status === 'number' && status >= 400 && status < 600 ? status : (isServerError(error) ? 503 : 500) }
    );
  }
}
