import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rawApiKey = process.env.GROQ_API_KEY || '';
  const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

  if (!process.env.GROQ_API_KEY || !apiKey) {
    console.error('[Groq Assistant] GROQ_API_KEY is not defined in environment variables.');
    return NextResponse.json(
      { success: false, data: null, message: 'GROQ_API_KEY is missing in server environment' },
      { status: 500 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const authHeader = req.headers.get('authorization');
    const initDataHeader = req.headers.get('x-telegram-init-data');
    const isDev = process.env.NODE_ENV !== 'production';

    if (!session?.user && !authHeader && !initDataHeader && !isDev) {
      console.warn('[Groq Assistant] Unauthenticated request rejected.');
      return NextResponse.json(
        { success: false, data: null, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, headline, currentText, displayName } = body;

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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody?.error?.message || `Groq API error: HTTP ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    const result = await response.json();
    const generatedText = result?.choices?.[0]?.message?.content?.trim() || '';

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
    console.error('RAW_GROQ_ERROR:', error);

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
