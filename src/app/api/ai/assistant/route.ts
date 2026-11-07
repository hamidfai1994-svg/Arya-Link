import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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

    const rawApiKey = process.env.GEMINI_API_KEY || '';
    const apiKey = rawApiKey.replace(/["'\r\n]/g, '').trim();

    if (!apiKey) {
      console.error('[Gemini Assistant Error] GEMINI_API_KEY is not configured.');
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: 'کلید وب‌سرویس هوش مصنوعی (GEMINI_API_KEY) در متغیرهای محیطی سیستم تنظیم نشده است.',
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, headline, currentText, displayName } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 350,
      },
    });

    let prompt = '';

    if (action === 'generate_bio') {
      prompt = `شما یک دستیار حرفه‌ای کپی‌رایتینگ برای کارت ویزیت هوشمند و صفحه لینک‌بیو (Arya Link) هستید.
با توجه به اطلاعات زیر، یک متن بیوگرافی (Bio) بسیار شیک، حرفه‌ای، جذاب و موجز (حداکثر ۲ تا ۳ جمله کوتاه، حدود ۱۵۰ تا ۲۵۰ کاراکتر) به زبان فارسی روان و شایسته برای کارت ویزیت بنویسید.
اطلاعات کاربر:
نام: ${displayName || 'کاربر گرامی'}
عنوان شغلی / هدلاین: ${headline || 'متخصص و کارآفرین'}

قوانین حیاتی:
۱. فقط و فقط متن نهایی بیوگرافی را بنویس. هیچ مقدمه، موخره، علامت نقل قول یا توضیح اضافی ننویس.
۲. از ایموجی‌های متناسب و شیک (حداکثر ۲ یا ۳ ایموجی) استفاده کن.
۳. تمام ارقام و اعداد در متن باید صرفاً انگلیسی (0123456789) باشند.`;
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
۱. فقط و فقط نسخه اصلاح‌شده نهایی متن را بازگردان. هیچ توضیح اضافه یا برچسبی ننویس.
۲. لحن متن باید محترمانه، حرفه‌ای و جذاب باشد.
۳. تمام اعداد در متن در صورت وجود باید صرفاً انگلیسی باشند (0123456789).`;
    } else {
      return NextResponse.json(
        { success: false, data: null, message: 'عملیات هوش مصنوعی مشخص نیست.' },
        { status: 400 }
      );
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text()?.trim() || '';

    // Remove wrapping quotes if Gemini included them
    const cleanText = generatedText.replace(/^["'«]+|["'»]+$/g, '').trim();

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

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: error?.message || 'خطا در ارتباط با سرویس هوش مصنوعی Gemini.',
        error: error?.message || 'AI Generation Failed',
      },
      { status: 500 }
    );
  }
}
