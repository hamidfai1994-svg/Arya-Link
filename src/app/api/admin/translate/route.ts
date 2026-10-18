import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function isAdmin(session: any): boolean {
  const role = (session?.user?.role || '').toLowerCase();
  return ['admin', 'superadmin', 'content_editor'].includes(role);
}

// Afghan Vocabulary Dictionary for high-precision translation
const DICTIONARY: Record<string, { ps: string; en: string }> = {
  'کارت ویزیت هوشمند': { ps: 'سمارټ ویزټ کارټ', en: 'Smart Business Card' },
  'کارت ویزیت دیجیتال': { ps: 'ډیجیټل ویزټ کارټ', en: 'Digital Business Card' },
  'کارت ویزیت': { ps: 'ویزټ کارټ', en: 'Business Card' },
  'کارت هوشمند': { ps: 'سمارټ کارټ', en: 'Smart Card' },
  'کارت های nfc': { ps: 'د NFC کارټونه', en: 'NFC Cards' },
  'کارت nfc': { ps: 'NFC کارټ', en: 'NFC Card' },
  'هویت دیجیتال': { ps: 'ډیجیټل هویت', en: 'Digital Identity' },
  'خدمات سازمانی': { ps: 'سازماني خدمتونه', en: 'Enterprise Services' },
  'خدمات': { ps: 'خدمتونه', en: 'Services' },
  'درباره ما': { ps: 'زموږ په اړه', en: 'About Us' },
  'درباره شرکت': { ps: 'د شرکت په اړه', en: 'About the Company' },
  'نمایندگی ها': { ps: 'څانګې او استازولۍ', en: 'Branch Offices' },
  'نمایندگی': { ps: 'استازولي', en: 'Branch Office' },
  'شعبات': { ps: 'څانګې', en: 'Branches' },
  'تعرفه ها': { ps: 'بیې او تعرفې', en: 'Pricing & Plans' },
  'قیمت': { ps: 'بیه', en: 'Price' },
  'بلاگ': { ps: 'بلاګ', en: 'Blog' },
  'مقالات': { ps: 'مقالې', en: 'Articles' },
  'مقاله': { ps: 'مقاله', en: 'Article' },
  'صفحه اصلی': { ps: 'کورپاڼه', en: 'Home Page' },
  'ورود': { ps: 'ننوتل', en: 'Login' },
  'ثبت نام': { ps: 'نوم لیکنه', en: 'Register' },
  'پشتیبانی': { ps: 'ملاتړ', en: 'Support' },
  'تماس با ما': { ps: 'له موږ سره اړیکه', en: 'Contact Us' },
  'احراز هویت': { ps: 'د هویت تثبیت', en: 'Identity Verification' },
  'تیک آبی': { ps: 'شین نښان', en: 'Blue Badge' },
  'فروشگاه آنلاین': { ps: 'آنلاین پلورنځی', en: 'Online Store' },
  'تسویه حساب': { ps: 'د حساب تصفیه', en: 'Payout / Settlement' },
  'شرکت': { ps: 'شرکت', en: 'Company' },
  'سازمان': { ps: 'سازمان', en: 'Organization' },
  'کاربران': { ps: 'کاروونکي', en: 'Users' },
  'کاربر': { ps: 'کاروونکی', en: 'User' },
  'مشتریان': { ps: 'پیرودونکي', en: 'Customers' },
  'توسعه': { ps: 'پراختیا', en: 'Development' },
  'نوآوری': { ps: 'نوښت', en: 'Innovation' },
  'فناوری': { ps: 'ټکنالوژي', en: 'Technology' },
  'ارتباطات': { ps: 'اړیکې', en: 'Communications' },
  'افغانستان': { ps: 'افغانستان', en: 'Afghanistan' },
  'کابل': { ps: 'کابل', en: 'Kabul' },
  'هرات': { ps: 'هرات', en: 'Herat' },
  'بلخ': { ps: 'بلخ', en: 'Balkh' },
  'مزارشریف': { ps: 'مزارشریف', en: 'Mazar-i-Sharif' },
  'قندهار': { ps: 'کندهار', en: 'Kandahar' },
  'ننگرهار': { ps: 'ننګرهار', en: 'Nangarhar' },
  'خوست': { ps: 'خوست', en: 'Khost' },
  'پکتیا': { ps: 'پکتیا', en: 'Paktia' },
  'غزنی': { ps: 'غزني', en: 'Ghazni' },
  'ماموریت': { ps: 'ماموریت او موخه', en: 'Mission' },
  'چشم انداز': { ps: 'لیدلوری', en: 'Vision' },
  'پیام مدیرعامل': { ps: 'د مشر پیغام', en: 'CEO Message' },
  'رایگان': { ps: 'وړیا', en: 'Free' },
  'حرفه ای': { ps: 'مسلکي', en: 'Professional' },
  'سازمانی': { ps: 'سازماني', en: 'Enterprise' },
};

/**
 * Free translation fallback using MyMemory public API with timeout
 */
async function fetchOnlineTranslation(text: string, targetLang: 'ps' | 'en'): Promise<string | null> {
  try {
    const langPair = targetLang === 'en' ? 'fa|en' : 'fa|ps';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const encoded = encodeURIComponent(text.slice(0, 450));
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${langPair}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText && !data.responseData.translatedText.includes('QUERY LENGTH LIMIT')) {
        return data.responseData.translatedText;
      }
    }
  } catch {
    // Online API timed out or unreachable, fall through to offline dictionary
  }
  return null;
}

/**
 * Offline intelligent translation using phrase replacement and linguistic mapping
 */
function translateOffline(text: string, targetLang: 'ps' | 'en'): string {
  if (!text || !text.trim()) return '';

  let output = text.trim();

  // Sort keys by length descending to replace compound phrases first
  const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(key, 'gi');
    if (regex.test(output)) {
      output = output.replace(regex, DICTIONARY[key][targetLang]);
    }
  }

  // Common suffix / particle transformations for Pashto
  if (targetLang === 'ps') {
    output = output
      .replace(/های /g, 'و ')
      .replace(/های/g, 'ونه')
      .replace(/برای /g, 'لپاره د ')
      .replace(/در /g, 'په ')
      .replace(/با /g, 'سره ')
      .replace(/است\./g, 'دی.')
      .replace(/می‌شود/g, 'کیږي')
      .replace(/می‌کند/g, 'کوي');
  }

  // English fallback phrase tweaks
  if (targetLang === 'en' && output === text) {
    // If no dictionary hit, provide a sensible title format
    output = output
      .replace(/شرکت/g, 'Company')
      .replace(/خدمات/g, 'Services')
      .replace(/کارت/g, 'Card');
  }

  return output;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { success: false, message: 'دسترسی غیرمجاز به ابزار ترجمه.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { fields, text } = body;

    // Mode 1: Single text string
    if (typeof text === 'string') {
      const trimmed = text.trim();
      if (!trimmed) {
        return NextResponse.json({ success: true, ps: '', en: '' });
      }

      const [onlinePs, onlineEn] = await Promise.all([
        fetchOnlineTranslation(trimmed, 'ps'),
        fetchOnlineTranslation(trimmed, 'en'),
      ]);

      const ps = onlinePs || translateOffline(trimmed, 'ps');
      const en = onlineEn || translateOffline(trimmed, 'en');

      return NextResponse.json({
        success: true,
        ps,
        en,
      });
    }

    // Mode 2: Multi-field object { title: '...', summary: '...', content: '...' }
    if (fields && typeof fields === 'object') {
      const translatedPs: Record<string, string> = {};
      const translatedEn: Record<string, string> = {};

      for (const [key, val] of Object.entries(fields)) {
        if (typeof val === 'string' && val.trim()) {
          const trimmed = val.trim();
          const [onlinePs, onlineEn] = await Promise.all([
            fetchOnlineTranslation(trimmed, 'ps'),
            fetchOnlineTranslation(trimmed, 'en'),
          ]);

          translatedPs[key] = onlinePs || translateOffline(trimmed, 'ps');
          translatedEn[key] = onlineEn || translateOffline(trimmed, 'en');
        } else {
          translatedPs[key] = '';
          translatedEn[key] = '';
        }
      }

      return NextResponse.json({
        success: true,
        ps: translatedPs,
        en: translatedEn,
      });
    }

    return NextResponse.json(
      { success: false, message: 'متن یا فیلدهای مورد نظر برای ترجمه ارسال نشده است.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در پردازش ترجمه.' },
      { status: 500 }
    );
  }
}
