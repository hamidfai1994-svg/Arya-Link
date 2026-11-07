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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
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
        base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
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

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const textOutput = response.text()?.trim() || '{}';

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(textOutput);
    } catch {
      const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
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
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در تحلیل تصویر مدرک با هوش مصنوعی.',
        error: error?.message || 'KYC extraction failed',
      },
      { status: 500 }
    );
  }
}

