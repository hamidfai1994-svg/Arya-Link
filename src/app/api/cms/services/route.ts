import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongodb';
import { ServiceItem } from '@/models/ServiceItem.model';

export const dynamic = 'force-dynamic';

function isContentAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

export async function GET() {
  try {
    await connectToDatabase();
    let services = await ServiceItem.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

    // Seed default enterprise services if empty
    if (services.length === 0) {
      const defaultServices = [
        {
          title: 'طراحی و تولید کارت‌های هوشمند لمسی NFC',
          slug: 'smart-nfc-cards-production',
          summary: 'تولید کارت‌های فلزی لوکس، چوب طبیعی بامبو، و PVC با چاپ اختصاصی لوگو و متریال ضد آب.',
          description: 'کارت‌های هوشمند آریا لینک با بهره‌گیری از باکیفیت‌ترین چیپ‌های NTAG216 تولید می‌شوند و بدون نیاز به باتری، امکان اشتراک‌گذاری تمامی اطلاعات شخصی و تجاری را در کسری از ثانیه فراهم می‌کنند.',
          icon: 'CreditCard',
          features: ['متریال لوکس فلزی، چوبی و PVC', 'تراشه فوق‌سریع NFC', 'بارکد داینامیک اختصاصی (QR Code)', 'گارانتی تعویض ۲ ساله'],
          targetAudience: 'مدیران، پزشکان، وکلا، فروشندگان و شرکت‌ها',
          pricingInfo: 'از ۱,۲۰۰ افغانی',
          order: 1,
          isActive: true,
        },
        {
          title: 'زیرساخت اختصاصی سازمانی (Enterprise Fleet)',
          slug: 'enterprise-fleet-management',
          summary: 'سامانه مدیریت متمرکز کارت‌های ویزیت صدها پرسنل، آمار سازمانی و یکپارچه‌سازی با اکتیودایرکتوری.',
          description: 'ویژه بانک‌ها، دانشگاه‌ها، موسسات بین‌المللی و شرکت‌های بزرگ؛ با یک کلیک برای تمامی کارمندان کارت و ایمیل رسمی ست کنید و در صورت تغییر سمت یا خروج پرسنل، اطلاعات را فورا مدیریت نمایید.',
          icon: 'Building2',
          features: ['داشبورد متمرکز ادمین شرکت', 'تولید انبوه کارت‌ها با قالب یکدست', 'آمار لیدهای جذب شده سازمانی', 'اتصال به API سازمان'],
          targetAudience: 'سازمان‌های دولتی، بانک‌ها، هلدینگ‌ها و شرکت‌ها',
          pricingInfo: 'استعلام قیمت سازمانی',
          order: 2,
          isActive: true,
        },
        {
          title: 'فروشگاه آنلاین و درگاه پرداخت مستقیم محلی',
          slug: 'instant-store-checkout',
          summary: 'امکان فروش مستقیم محصولات فیزیکی و دانلودی با پرداخت آنلاین حساب‌پی (HesabPay) و تسویه بانکی.',
          description: 'مخاطبان می‌توانند بدون خروج از صفحه بیو شما، محصولات، رزرو جلسات یا بسته‌های آموزشی شما را سفارش داده و هزینه را مستقیماً به افغانی پرداخت کنند.',
          icon: 'ShoppingBag',
          features: ['اتصال به کیف‌پول‌های افغانستان', 'ثبت و پیگیری سفارشات', 'تسویه حساب تضمین‌شده', 'نوتیفیکیشن لحظه‌ای پیامک/ایمیل'],
          targetAudience: 'فروشگاه‌های اینستاگرامی، مدرسان و مشاوران',
          pricingInfo: 'رایگان در پلن PRO',
          order: 3,
          isActive: true,
        },
        {
          title: 'اتصال دامنه اختصاصی و برندینگ سفید (Whitelabel)',
          slug: 'custom-domain-whitelabel',
          summary: 'صفحه اختصاصی شما با آدرس برند خودتان (مثلاً yourname.com) بدون نام یا لوگوی آریا لینک.',
          description: 'برندینگ کسب‌وکار خود را به بالاترین سطح برسانید. اتصال آسان دامنه با گواهینامه امنیتی SSL رایگان و هاستینگ پرسرعت ابری.',
          icon: 'Globe',
          features: ['اتصال دامنه .com / .af', 'SSL اختصاصی رایگان', 'حذف ۱۰۰٪ نام آریا لینک', 'بهینه‌سازی ویژه سئو (SEO)'],
          targetAudience: 'کسب‌وکارهای برندمحور و آژانس‌های تبلیغاتی',
          pricingInfo: 'موجود در پلن PRO',
          order: 4,
          isActive: true,
        },
      ];

      await ServiceItem.insertMany(defaultServices);
      services = await ServiceItem.find({ isActive: true }).sort({ order: 1 }).lean();
    }

    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ success: false, message: 'خطا در بارگذاری خدمات.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { title, slug, summary, description, icon, features, pricingInfo } = body;

    const titleStr = typeof title === 'object' ? (title.da || title.en || title.ps || '') : String(title || '');

    const newService = await ServiceItem.create({
      title,
      slug: (slug || titleStr).toLowerCase().replace(/\s+/g, '-'),
      summary,
      description,
      icon: icon || 'Layers',
      features: Array.isArray(features) ? features : [],
      pricingInfo: pricingInfo || 'استعلام قیمت',
      isActive: true,
    });

    return NextResponse.json({ success: true, message: 'خدمت جدید اضافه شد.', service: newService });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'خطا در افزودن خدمت.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه خدمت الزامی است.' }, { status: 400 });
    }

    const updated = await ServiceItem.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return NextResponse.json({ success: true, message: 'خدمت با موفقیت ویرایش شد.', service: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'خطا در ویرایش خدمت.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isContentAdmin(session)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه خدمت الزامی است.' }, { status: 400 });
    }

    await ServiceItem.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'خدمت با موفقیت حذف شد.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'خطا در حذف خدمت.' }, { status: 500 });
  }
}
