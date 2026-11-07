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
          message: 'کلید وب‌سرویس هوش مصنوعی (GEMINI_API_KEY) در سرور تنظیم نشده است.',
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
            { success: false, message: 'دانلود تصویر از آدرس اینترنتی با خطا مواجه شد.' },
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
          { success: false, message: 'خطا در بارگیری آدرس اینترنتی تصویر کارت.', error: err?.message },
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
        { success: false, message: 'لطفاً تصویر کارت ویزیت را به صورت فایل یا آدرس اینترنتی ارسال کنید.' },
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

    const prompt = `شما یک مدل هوش مصنوعی بینایی ماشین با دقت ۱۰۰٪ برای خواندن و استخراج اطلاعات از کارت‌های ویزیت هستید.
متن این کارت ویزیت را بخوان و فقط یک آبجکت JSON با کلیدهای name, phone, email, company, job_title برگردان. زبان کارت ممکن است فارسی، دری، پشتو یا انگلیسی باشد.

قوانین حیاتی:
۱. تمام اعداد، شماره تلفن‌ها و ارقام باید صرفاً با ارقام انگلیسی (0123456789) باشند.
۲. فیلد name: نام و نام خانوادگی فرد روی کارت.
۳. فیلد phone: شماره تماس مستقیم یا موبایل (بدون فاصله یا خط تیره).
۴. فیلد email: آدرس ایمیل معتبر.
۵. فیلد company: نام شرکت، سازمان یا برند.
۶. فیلد job_title: سمت یا عنوان شغلی فرد.
۷. خروجی باید صرفاً یک JSON استاندارد باشد:
{
  "name": "",
  "phone": "",
  "email": "",
  "company": "",
  "job_title": ""
}`;

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
      // Clean markdown wrappers if any
      const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    const name = (parsedResult.name || '').trim();
    const phone = normalizeToEnglishDigits((parsedResult.phone || '').trim().replace(/[\s-]/g, ''));
    const email = (parsedResult.email || '').trim().toLowerCase();
    const company = (parsedResult.company || '').trim();
    const job_title = (parsedResult.job_title || '').trim();

    return NextResponse.json({
      success: true,
      data: {
        name,
        phone,
        email,
        company,
        job_title,
      },
      message: 'کارت ویزیت با موفقیت توسط Gemini Vision تحلیل شد.',
    });
  } catch (error: any) {
    console.error('Gemini OCR error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطا در تحلیل تصویر کارت ویزیت با هوش مصنوعی.',
        error: error?.message || 'OCR processing failed',
      },
      { status: 500 }
    );
  }
}

