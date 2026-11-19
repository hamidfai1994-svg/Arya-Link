import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrilingualString {
  fa: string;
  en: string;
  ps: string;
}

export interface ISiteContentHero {
  badge: ITrilingualString;
  titlePart1: ITrilingualString;
  titleHighlight: ITrilingualString;
  titlePart2: ITrilingualString;
  subtitle: ITrilingualString;
  primaryCta: ITrilingualString;
  primaryCtaLink?: string;
  secondaryCta: ITrilingualString;
  secondaryCtaLink?: string;
  mediaType: 'image' | 'video' | 'phone_mockup';
  mediaUrl: string;
  trustBadges: ITrilingualString[];
}

export interface ISiteContentNfcFeature {
  icon: string;
  title: ITrilingualString;
  desc: ITrilingualString;
}

export interface ISiteContentNfcConcept {
  badge: ITrilingualString;
  title: ITrilingualString;
  subtitle: ITrilingualString;
  phoneNotificationTitle: ITrilingualString;
  phoneNotificationDesc: ITrilingualString;
  phoneProfileName: ITrilingualString;
  phoneProfileTitle: ITrilingualString;
  phoneProfileBio: ITrilingualString;
  features: ISiteContentNfcFeature[];
  ctaText: ITrilingualString;
  ctaLink: string;
  footnote: ITrilingualString;
}

export interface ISiteContentSlider {
  id: string;
  imageUrl: string;
  badge: ITrilingualString;
  title: ITrilingualString;
  subtitle: ITrilingualString;
  buttonText: ITrilingualString;
  buttonLink: string;
  order: number;
  isActive: boolean;
}

export interface ISiteContentStat {
  value: ITrilingualString;
  label: ITrilingualString;
}

export interface ISiteContentAboutUs {
  badge: ITrilingualString;
  title: ITrilingualString;
  slogan: ITrilingualString;
  storyTitle: ITrilingualString;
  story: ITrilingualString;
  missionTitle: ITrilingualString;
  mission: ITrilingualString;
  visionTitle: ITrilingualString;
  vision: ITrilingualString;
  stats: ISiteContentStat[];
}

export interface ISiteContentFaq {
  id: string;
  question: ITrilingualString;
  answer: ITrilingualString;
  order: number;
  isActive?: boolean;
}

export interface ISiteContentQuickLink {
  label: ITrilingualString;
  url: string;
}

export interface ISiteContentTeamMember {
  id: string;
  name: ITrilingualString;
  role: ITrilingualString;
  bio?: ITrilingualString;
  avatarUrl?: string;
  order: number;
}

export interface ISiteContentPartner {
  id: string;
  name: ITrilingualString;
  badge?: ITrilingualString;
  logoUrl?: string;
  order: number;
}

export interface ISiteContentBlogCms {
  badge: ITrilingualString;
  title: ITrilingualString;
  subtitle: ITrilingualString;
}

export interface ISiteContentSeo {
  metaTitle: ITrilingualString;
  metaDescription: ITrilingualString;
  metaKeywords: ITrilingualString;
  ogImage?: string;
}

export interface ISiteContentFooter {
  desc: ITrilingualString;
  address: ITrilingualString;
  phone: string;
  email: string;
  workingHours: ITrilingualString;
  copyrightText: ITrilingualString;
  statusBadgeText: ITrilingualString;
  quickLinks: ISiteContentQuickLink[];
  socialLinks: {
    instagram: string;
    telegram: string;
    whatsapp: string;
    linkedin: string;
    twitter: string;
  };
}

export interface ISiteContentPricingPlan {
  id: string;
  key: 'free' | 'pro' | 'enterprise' | string;
  name: ITrilingualString;
  tagline: ITrilingualString;
  badge: ITrilingualString;
  monthlyPrice: number;
  annualPrice: number;
  currency: ITrilingualString;
  periodMonthlyLabel: ITrilingualString;
  periodAnnualLabel: ITrilingualString;
  ctaText: ITrilingualString;
  ctaLink: string;
  isPopular: boolean;
  isActive: boolean;
  features: ITrilingualString[];
}

export interface ISiteContentPricing {
  badge: ITrilingualString;
  title: ITrilingualString;
  subtitle: ITrilingualString;
  monthlyLabel: ITrilingualString;
  annualLabel: ITrilingualString;
  annualSaveBadge: ITrilingualString;
  plans: ISiteContentPricingPlan[];
}

export interface ISiteContentFeatureItem {
  id: string;
  key: string;
  badge: ITrilingualString;
  title: ITrilingualString;
  desc: ITrilingualString;
}

export interface ISiteContentFeatures {
  badge: ITrilingualString;
  title: ITrilingualString;
  subtitle: ITrilingualString;
  items: ISiteContentFeatureItem[];
}

export interface ISiteContentHowStep {
  id: string;
  num: string;
  color: string;
  badge: ITrilingualString;
  title: ITrilingualString;
  desc: ITrilingualString;
}

export interface ISiteContentHowItWorks {
  badge: ITrilingualString;
  title: ITrilingualString;
  subtitle: ITrilingualString;
  footerNote: ITrilingualString;
  steps: ISiteContentHowStep[];
}

export interface ISiteContentFinalCta {
  badge: ITrilingualString;
  title: ITrilingualString;
  subtitle: ITrilingualString;
  primaryCtaText: ITrilingualString;
  primaryCtaLink: string;
  secondaryCtaText: ITrilingualString;
  secondaryCtaLink: string;
}

export interface ISiteContentLegalSection {
  id: string;
  title: ITrilingualString;
  content: ITrilingualString;
}

export interface ISiteContentLegal {
  termsBadge: ITrilingualString;
  termsTitle: ITrilingualString;
  termsUpdatedAt: ITrilingualString;
  termsIntro: ITrilingualString;
  termsSections: ISiteContentLegalSection[];
  privacyBadge: ITrilingualString;
  privacyTitle: ITrilingualString;
  privacyUpdatedAt: ITrilingualString;
  privacyIntro: ITrilingualString;
  privacySections: ISiteContentLegalSection[];
}

export interface ISiteContentContactUs {
  badge: ITrilingualString;
  title: ITrilingualString;
  subtitle: ITrilingualString;
  officeTitle: ITrilingualString;
  officeAddress: ITrilingualString;
  workingHoursLabel: ITrilingualString;
  workingHours: ITrilingualString;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  telegramHandle: string;
  mapEmbedUrl: string;
}

export const DEFAULT_PRICING_CONTENT: ISiteContentPricing = {
  badge: {
    fa: 'تعرفه‌های شفاف و منصفانه',
    en: 'Transparent & Fair Pricing',
    ps: 'روڼ او عادلانه بیې',
  },
  title: {
    fa: 'سرمایه‌گذاری هوشمند برای برند شما',
    en: 'Smart Investment for Your Brand',
    ps: 'ستاسو د برانډ لپاره هوښیاره پانګونه',
  },
  subtitle: {
    fa: 'رایگان آغاز کنید و همگام با رشد برندتان پلن خود را ارتقا دهید. بدون هزینه‌های پنهان.',
    en: 'Start for free and upgrade as your brand grows. Zero hidden fees.',
    ps: 'وړیا پیل کړئ او د خپل برانډ له ودې سره خپل پلان لوړ کړئ. پرته له پټو لګښتونو.',
  },
  monthlyLabel: {
    fa: 'پرداخت ماهانه',
    en: 'Monthly Billing',
    ps: 'میاشتنۍ تادیه',
  },
  annualLabel: {
    fa: 'پرداخت سالانه',
    en: 'Annual Billing',
    ps: 'کلنۍ تادیه',
  },
  annualSaveBadge: {
    fa: '20٪ تخفیف',
    en: '20% OFF',
    ps: '20% تخفیف',
  },
  plans: [
    {
      id: 'plan-free',
      key: 'free',
      name: { fa: 'شروع رایگان', en: 'Starter Free', ps: 'وړیا پیل' },
      tagline: {
        fa: 'مناسب برای استفاده شخصی و آزمایش امکانات',
        en: 'Great for personal use and getting started',
        ps: 'د شخصي کارونې او پیل لپاره غوره',
      },
      badge: { fa: 'رایگان همیشگی', en: 'Free Forever', ps: 'تل وړیا' },
      monthlyPrice: 0,
      annualPrice: 0,
      currency: { fa: 'افغانی', en: 'AFN', ps: 'افغانۍ' },
      periodMonthlyLabel: { fa: '/ همیشه رایگان', en: '/ forever', ps: '/ تل وړیا' },
      periodAnnualLabel: { fa: '/ همیشه رایگان', en: '/ forever', ps: '/ تل وړیا' },
      ctaText: { fa: 'شروع رایگان', en: 'Start Free', ps: 'وړیا پیل کړئ' },
      ctaLink: '/register',
      isPopular: false,
      isActive: true,
      features: [
        { fa: '1 کارت دیجیتال هوشمند فعال', en: '1 Active Smart Digital Card', ps: '1 فعال هوښیار ډیجیټل کارت' },
        { fa: 'لینک‌های اجتماعی و ذخیره تماس (vCard)', en: 'Social Links & Save Contact (vCard)', ps: 'ټولنیزې شبکې او د اړیکې خوندي کول' },
        { fa: 'آمار بازدید لحظه‌ای', en: 'Real-Time View Counter', ps: 'ژوندۍ د لیدنو شمېرنه' },
        { fa: 'کیوآر کد اختصاصی برای کارت', en: 'Custom QR Code for Profile', ps: 'د پروفایل ځانګړی QR کوډ' },
      ],
    },
    {
      id: 'plan-pro',
      key: 'pro',
      name: { fa: 'حرفه‌ای (PRO)', en: 'Professional (PRO)', ps: 'مسلکی (PRO)' },
      tagline: {
        fa: 'بهترین انتخاب برای متخصصان، فروشندگان و مدیران',
        en: 'Best choice for professionals, creators & merchants',
        ps: 'د مسلکی کسانو، پلورونکو او مدیرانو لپاره غوره انتخاب',
      },
      badge: { fa: 'پرفروش‌ترین', en: 'Most Popular', ps: 'تر ټولو مشهور' },
      monthlyPrice: 590,
      annualPrice: 470,
      currency: { fa: 'افغانی', en: 'AFN', ps: 'افغانۍ' },
      periodMonthlyLabel: { fa: '/ ماهانه', en: '/ mo', ps: '/ میاشتنی' },
      periodAnnualLabel: { fa: '/ ماهانه (سالانه)', en: '/ mo (annual)', ps: '/ میاشتنی (کلنی)' },
      ctaText: { fa: 'ارتقا به نسخه حرفه‌ای', en: 'Upgrade to Pro', ps: 'PRO ته لوړول' },
      ctaLink: '/register?plan=pro',
      isPopular: true,
      isActive: true,
      features: [
        { fa: 'ایجاد تا 10 کارت و پروفایل مجزا', en: 'Up to 10 Distinct Smart Cards', ps: 'تر 10 بېلابېل هوښیار کارتونه' },
        { fa: 'حذف کامل لوگو و برندینگ آریا لینک', en: '100% Whitelabel (No Watermark)', ps: 'بشپړ وایټ لیبل پرته له نښې' },
        { fa: 'فروشگاه آنلاین و دریافت سفارش با حساب‌پی', en: 'Online Store & HesabPay Checkout', ps: 'آنلاین پلورنځی او حساب‌پي تادیه' },
        { fa: 'نشان تایید هویت آبی (Blue Tick)', en: 'Official Blue Verification Badge', ps: 'د هویت رسمي آبي نښه' },
        { fa: 'فرم تماس CRM و ارسال فوری به تلگرام', en: 'Mini CRM & Instant Telegram Alerts', ps: 'د اړیکو CRM او سمدستي ټیلیګرام خبرتیاوې' },
      ],
    },
    {
      id: 'plan-enterprise',
      key: 'enterprise',
      name: { fa: 'سازمانی و شرکت‌ها (B2B)', en: 'Enterprise & Teams', ps: 'سازماني او شرکتونه' },
      tagline: {
        fa: 'مدیریت متمرکز تیم فروش و کارمندان همراه با کارت‌های NFC',
        en: 'Centralized team identity & physical NFC fleet management',
        ps: 'د ټیم او کارکوونکو مرکزي مدیریت او NFC کارتونه',
      },
      badge: { fa: 'ویژه سازمان‌ها', en: 'For Teams', ps: 'د شرکتونو لپاره' },
      monthlyPrice: 2490,
      annualPrice: 1990,
      currency: { fa: 'افغانی', en: 'AFN', ps: 'افغانۍ' },
      periodMonthlyLabel: { fa: '/ ماهانه', en: '/ mo', ps: '/ میاشتنی' },
      periodAnnualLabel: { fa: '/ ماهانه (سالانه)', en: '/ mo (annual)', ps: '/ میاشتنی (کلنی)' },
      ctaText: { fa: 'مشاوره و سفارش سازمانی', en: 'Contact for Team Setup', ps: 'د سازماني امر لپاره اړیکه' },
      ctaLink: '/contact',
      isPopular: false,
      isActive: true,
      features: [
        { fa: 'پنل مدیریت مدیران و کارمندان بدون محدودیت', en: 'Centralized Organization Dashboard', ps: 'د شرکت مرکزي اداري ډشبورډ' },
        { fa: 'دامنه اختصاصی برند (card.company.com)', en: 'Custom Domain Support', ps: 'د شرکت ځانګړی ډومین' },
        { fa: 'طراحی و چاپ اختصاصی کارت‌های NFC فلزی و چوبی', en: 'Custom Branded Metal & Wood NFC Cards', ps: 'د فلزي او لرګیو NFC کارتونو ځانګړې چاپ' },
        { fa: 'پشتیبانی اختصاصی و قرارداد رسمی شرکتی', en: 'Dedicated Account & SLA Support', ps: 'ځانګړې تخنیکي ملاتړ' },
      ],
    },
  ],
};

export const DEFAULT_FEATURES_CONTENT: ISiteContentFeatures = {
  badge: {
    fa: 'اکوسیستم ماژولار',
    en: 'Modular Ecosystem',
    ps: 'ماډولر ایکوسیستم',
  },
  title: {
    fa: 'فراتر از یک کارت ویزیت ساده',
    en: 'Far Beyond a Standard Business Card',
    ps: 'له عادي سوداګریز کارت څخه خورا پورته',
  },
  subtitle: {
    fa: 'تمامی ابزارهایی که برای معرفی حرفه‌ای، جذب مشتری و فروش آنلاین نیاز دارید در یک پلتفرم یکپارچه شده‌اند.',
    en: 'Everything you need for professional branding, lead capture, and online sales in one unified platform.',
    ps: 'ټول هغه وسایل چې تاسو یې د مسلکي معرفي، پیرودونکو جذب او آنلاین پلور لپاره اړتیا لرئ په یو ځای کې.',
  },
  items: [
    {
      id: 'feat-1',
      key: 'qr',
      badge: { fa: 'پخش آنی', en: 'Instant Share', ps: 'فوري شریکول' },
      title: { fa: 'کیوآر کد پویا و اتصال به تمام شبکه‌ها', en: 'Dynamic QR & Unified Links', ps: 'متحرک QR کوډ او ټولنیز لینکونه' },
      desc: {
        fa: 'لینک اختصاصی، کیوآر کد، واتساپ مستقیم و ذخیره شماره تماس در گوشی مخاطب با یک لمس.',
        en: 'Share your custom link, dynamic QR code, direct WhatsApp, and one-tap vCard contact saving.',
        ps: 'خپل ځانګړی لینک، متحرک QR کوډ، مستقیم واټساپ او په یوه کلیک کې د اړیکې خوندي کول شریک کړئ.',
      },
    },
    {
      id: 'feat-2',
      key: 'analytics',
      badge: { fa: 'تحلیل داده', en: 'Live Data', ps: 'ژوندی تحلیل' },
      title: { fa: 'آمار زنده و ردیابی کلیک‌ها', en: 'Real-Time Views & CTR Analytics', ps: 'ژوندۍ لیدنې او کلیک احصایه' },
      desc: {
        fa: 'تعداد بازدیدهای روزانه پروفایل، نرخ کلیک بالای لینک‌ها و علاقه‌مندی مشتریان را دقیق رصد کنید.',
        en: 'Track daily profile visits, link click-through rates, and top customer engagement insights.',
        ps: 'د ورځنیو لیدنو شمېر، د لینکونو کلیک کچه او د پیرودونکو لیوالتیا دقیق وڅارئ.',
      },
    },
    {
      id: 'feat-3',
      key: 'crm',
      badge: { fa: 'مدیریت مشتری', en: 'Lead Capture', ps: 'پیرودونکي مدیریت' },
      title: { fa: 'فرم CRM و اطلاع‌رسانی تلگرام', en: 'Mini CRM & Instant Telegram Bot', ps: 'CRM فورم او ټیلیګرام خبرتیا' },
      desc: {
        fa: 'پیام‌ها و شماره تماس مشتریان را دریافت کرده و هم‌زمان نوتیفیکیشن فوری در تلگرام بگیرید.',
        en: 'Collect visitor leads directly and receive instant notifications straight inside Telegram.',
        ps: 'د پیرودونکو پیغامونه او د اړیکې شمېرې ترلاسه کړئ او سمدستي په ټیلیګرام کې خبرتیا واخلئ.',
      },
    },
    {
      id: 'feat-4',
      key: 'ecommerce',
      badge: { fa: 'فروش مستقیم', en: 'Commerce', ps: 'مستقیم پلور' },
      title: { fa: 'فروشگاه کوچک و پرداخت داخلی', en: 'Mini Store & Local Checkout', ps: 'کوچنی پلورنځی او سیمه‌ییزه تادیه' },
      desc: {
        fa: 'محصولات و خدمات مشاوره خود را به نمایش بگذارید و سفارش‌ها را با حساب‌پی یا بانکی تسویه کنید.',
        en: 'Showcase products or consultation services and accept orders seamlessly with HesabPay or bank transfer.',
        ps: 'خپل محصولات او مشورې نندارې ته وړاندې کړئ او د حساب‌پي یا بانکي لارې تادیات ترلاسه کړئ.',
      },
    },
    {
      id: 'feat-5',
      key: 'kyc',
      badge: { fa: 'اعتمادسازی', en: 'Verified Trust', ps: 'باور او تایید' },
      title: { fa: 'راستی‌آزمایی هویت و نشان آبی', en: 'Identity Verification & Blue Tick', ps: 'د هویت تایید او آبي نښه' },
      desc: {
        fa: 'با تایید تذکره و مدارک، نشان آبی رسمی اعتماد را در بالای کارت ویزیت دیجیتال خود دریافت کنید.',
        en: 'Verify your identity documents to earn the official Blue Badge on your digital profile.',
        ps: 'د تذکرې او اسنادو په تایید سره په خپل پروفایل رسمي آبي نښه ترلاسه کړئ.',
      },
    },
  ],
};

export const DEFAULT_HOW_IT_WORKS_CONTENT: ISiteContentHowItWorks = {
  badge: {
    fa: 'ساده، مدرن و سریع',
    en: 'Simple, Modern & Fast',
    ps: 'اسانه، عصري او چټک',
  },
  title: {
    fa: 'در 3 گام ساده کارت هوشمند خود را بسازید',
    en: 'Create Your Smart Card in 3 Simple Steps',
    ps: 'په 3 اسانه ګامونو کې خپل هوښیار کارت جوړ کړئ',
  },
  subtitle: {
    fa: 'کمتر از 2 دقیقه زمان می‌برد تا کسب‌وکار یا صفحه شخصی خود را به دنیای فناوری NFC متصل کنید.',
    en: 'It takes less than 2 minutes to connect your brand or personal identity to smart NFC technology.',
    ps: 'ستاسو د سوداګرۍ یا شخصي پاڼې د NFC نړۍ سره نښلول له 2 دقیقو څخه لږ وخت نیسي.',
  },
  footerNote: {
    fa: 'انجام بدون نیاز به دانش فنی',
    en: 'No technical skills required',
    ps: 'تخنیکي پوهې ته اړتیا نشته',
  },
  steps: [
    {
      id: 'step-1',
      num: '01',
      color: 'from-cyan-500 to-blue-600',
      badge: { fa: 'گام اول', en: 'Step 01', ps: 'لومړی ګام' },
      title: {
        fa: 'ثبت‌نام و انتخاب نام اختصاصی',
        en: 'Sign Up & Claim Your Handle',
        ps: 'نوم‌لیکنه او ځانګړی نوم انتخاب',
      },
      desc: {
        fa: 'حساب کاربری خود را در کمتر از 1 دقیقه رایگان ایجاد کنید و آدرس یکتا مانند aryal.ink/ali را برای برند شخصی یا تجاری خود رزرو نمایید.',
        en: 'Create your free account in under 60 seconds and reserve a unique URL like aryal.ink/ali for your brand.',
        ps: 'له 1 دقیقې کم وخت کې وړیا حساب جوړ کړئ او خپل برانډ لپاره ځانګړی لینک لکه aryal.ink/ali خوندي کړئ.',
      },
    },
    {
      id: 'step-2',
      num: '02',
      color: 'from-blue-600 to-indigo-600',
      badge: { fa: 'گام دوم', en: 'Step 02', ps: 'دویم ګام' },
      title: {
        fa: 'شخصی‌سازی با ویرایشگر زنده',
        en: 'Customize With Live Editor',
        ps: 'د ژوندي ایډیټر سره تنظیمول',
      },
      desc: {
        fa: 'عکس پروفایل، تم‌های لوکس نئون، شبکه‌های اجتماعی، کاتالوگ‌های دانلودی و محصولات فروشگاهی را در پیش‌نمایش زنده موبایل بچینید.',
        en: 'Arrange your avatar, luxury themes, social channels, downloadable PDFs, and store items in real-time preview.',
        ps: 'د پروفایل عکس، عصري بڼې، ټولنیز لینکونه، کټالوګونه او محصولات په ژوندۍ بڼه ترتیب کړئ.',
      },
    },
    {
      id: 'step-3',
      num: '03',
      color: 'from-purple-600 to-pink-600',
      badge: { fa: 'گام سوم', en: 'Step 03', ps: 'درېیم ګام' },
      title: {
        fa: 'اشتراک‌گذاری هوشمند و فروش',
        en: 'Share Smartly & Grow Sales',
        ps: 'هوښیار شریکول او پلور',
      },
      desc: {
        fa: 'لینک را در بیو اینستاگرام قرار دهید یا با کارت فیزیکی هوشمند NFC در جلسات، کنفرانس‌ها و نمایشگاه‌ها تنها با یک تماس اطلاعات را انتقال دهید.',
        en: 'Place your link in social bios or tap your physical NFC card at meetings and events to share everything instantly.',
        ps: 'خپل لینک په ټولنیزو شبکو کې کېږدئ یا د NFC فزیکي کارت په مرسته په غونډو کې په یوه لمس خپل معلومات شریک کړئ.',
      },
    },
  ],
};

export const DEFAULT_FINAL_CTA_CONTENT: ISiteContentFinalCta = {
  badge: {
    fa: 'پیوستن به نسل جدید کارت‌های هوشمند',
    en: 'Join the Next Generation of Smart Networking',
    ps: 'د هوښیارو کارتونو نوي نسل سره یوځای شئ',
  },
  title: {
    fa: 'آماده‌اید ارتباطات کاری خود را متحول کنید؟',
    en: 'Ready to Transform How People Connect With You?',
    ps: 'ایا چمتو یاست چې خپلې سوداګریزې اړیکې بدلې کړئ؟',
  },
  subtitle: {
    fa: 'همین حالا به صورت رایگان ثبت‌نام کنید، مینی‌وب‌سایت اختصاصی خود را بسازید یا کارت فیزیکی لوکس NFC را با ارسال رایگان سفارش دهید.',
    en: 'Sign up free right now, build your sleek digital mini-site, or order your luxury physical NFC card with fast delivery.',
    ps: 'همدا اوس په وړیا توګه نوم‌لیکنه وکړئ، خپل ډیجیټل پروفایل جوړ کړئ یا فزیکي NFC کارت فرمایش ورکړئ.',
  },
  primaryCtaText: {
    fa: 'شروع رایگان و ساخت کارت',
    en: 'Start Free & Build Card',
    ps: 'وړیا پیل او کارت جوړول',
  },
  primaryCtaLink: '/register',
  secondaryCtaText: {
    fa: 'سفارش سازمانی و شرکتی',
    en: 'Enterprise & Team Order',
    ps: 'سازماني او شرکتي فرمایش',
  },
  secondaryCtaLink: '/services',
};

export const DEFAULT_LEGAL_CONTENT: ISiteContentLegal = {
  termsBadge: {
    fa: 'مقررات استفاده از پلتفرم',
    en: 'Platform Terms & Conditions',
    ps: 'د کارونې اصول او شرایط',
  },
  termsTitle: {
    fa: 'قوانین و مقررات استفاده از آریا لینک',
    en: 'Arya Link Terms of Service',
    ps: 'د آریا لینک د خدماتو اصول او مقررات',
  },
  termsUpdatedAt: {
    fa: 'آخرین به‌روزرسانی: سنبله 1404',
    en: 'Last Updated: September 2025',
    ps: 'وروستی تازه کول: وږی 1404',
  },
  termsIntro: {
    fa: 'استفاده از وب‌سایت، ابزارهای دیجیتال، ربات‌های تلگرام و کارت‌های فیزیکی هوشمند آریا لینک به معنای پذیرش کامل قوانین و مقررات ذیل می‌باشد.',
    en: 'By accessing or using the Arya Link platform, digital cards, Telegram ecosystem, or NFC hardware, you agree to comply with the following Terms of Service.',
    ps: 'د آریا لینک ویب‌پاڼې، ډیجیټل وسایلو، ټیلیګرام بوټونو او هوښیارو NFC کارتونو کارول د لاندې اصولو بشپړ منل دي.',
  },
  termsSections: [
    {
      id: 'term-1',
      title: {
        fa: '1. ثبت حساب کاربری و مسئولیت محتوا',
        en: '1. Account Registration & User Content',
        ps: '1. د حساب جوړول او د منځپانګې مسؤلیت',
      },
      content: {
        fa: 'کاربران متعهد هستند هنگام ثبت‌نام و راستی‌آزمایی هویت (KYC) معلومات دقیق و واقعی ارائه دهند. مسئولیت کامل لینک‌ها، تصاویر، محصولات و معلومات منتشرشده در پروفایل بر عهده صاحب حساب است.',
        en: 'Users must provide accurate registration and KYC details. You are solely responsible for all links, media, and product listings published on your public profile.',
        ps: 'کاروونکي مکلف دي د نوم‌لیکنې او هویت تایید پر مهال دقیق معلومات وړاندې کړي. په پروفایل کې د خپرو شویو لینکونو او انځورونو مسؤلیت د حساب پر مالک دی.',
      },
    },
    {
      id: 'term-2',
      title: {
        fa: '2. سفارشات کارت فیزیکی NFC و گارانتی',
        en: '2. Physical NFC Orders & Warranty',
        ps: '2. د فزیکي NFC کارتونو فرمایش او تضمین',
      },
      content: {
        fa: 'تمامی کارت‌های هوشمند PVC، فلزی و چوبی قبل از ارسال از نظر عملکرد تراشه NFC بررسی می‌شوند. زمان چاپ و ارسال در کابل 24 تا 48 ساعت و در سایر ولایات 3 تا 5 روز کاری است.',
        en: 'Every PVC, metal, and wood NFC card is tested before dispatch. Production and delivery take 24–48 hours inside Kabul and 3–5 business days across provinces.',
        ps: 'ټول پي‌وي‌سي، فلزي او لرګین NFC کارتونه تر لېږلو مخکې ازمایل کېږي. په کابل کې له 24 تر 48 ساعتونو او نورو ولایتونو کې له 3 تر 5 کاري ورځو وخت نیسي.',
      },
    },
    {
      id: 'term-3',
      title: {
        fa: '3. اشتراک‌های حرفه‌ای و پرداخت‌ها',
        en: '3. Pro Subscriptions & Payments',
        ps: '3. مسلکي ګډون او تادیات',
      },
      content: {
        fa: 'هزینه پلن‌های Pro و سازمانی پس از تایید رسید یا درگاه حساب‌پی فعال می‌گردد. لغو یا تغییر پلن در هر زمان از پنل کاربری قابل درخواست است.',
        en: 'Pro and Enterprise subscriptions activate upon payment verification via HesabPay or bank transfer. Plan adjustments can be managed anytime in your dashboard.',
        ps: 'د Pro او سازماني پلانونو فیس د حساب‌پي یا بانکي رسید له تایید وروسته فعالېږي. د پلان بدلول هر وخت له ډشبورډ څخه شونې دي.',
      },
    },
  ],
  privacyBadge: {
    fa: 'حفاظت از داده‌های شما',
    en: 'Data Protection & Security',
    ps: 'ستاسو د معلوماتو خوندیتوب',
  },
  privacyTitle: {
    fa: 'سیاست حفظ حریم خصوصی آریا لینک',
    en: 'Arya Link Privacy Policy',
    ps: 'د آریا لینک د محرمیت پالیسي',
  },
  privacyUpdatedAt: {
    fa: 'آخرین به‌روزرسانی: سنبله 1404',
    en: 'Last Updated: September 2025',
    ps: 'وروستی تازه کول: وږی 1404',
  },
  privacyIntro: {
    fa: 'حفظ امنیت معلومات شخصی، مدارک راستی‌آزمایی و داده‌های مشتریان شما بالاترین اولویت تخنیکی پلتفرم آریا لینک است.',
    en: 'Safeguarding your personal information, KYC verification files, and lead CRM data is the top technical priority at Arya Link.',
    ps: 'ستاسو د شخصي معلوماتو، د هویت تایید اسنادو او د پیرودونکو معلوماتو خوندیتوب زموږ لومړنی لومړیتوب دی.',
  },
  privacySections: [
    {
      id: 'priv-1',
      title: {
        fa: '1. جمع‌آوری و رمزنگاری معلومات',
        en: '1. Data Collection & Encryption',
        ps: '1. د معلوماتو راټولول او کوډګذاري',
      },
      content: {
        fa: 'ما تنها معلومات ضروری برای ساخت پروفایل دیجیتال، ارسال سفارشات فیزیکی و اطلاع‌رسانی تلگرامی را ذخیره می‌کنیم. تمام گذرواژه‌ها و توکن‌های امنیتی با الگوریتم‌های معیاری رمزنگاری می‌شوند.',
        en: 'We collect only the information required to operate your digital profile, fulfill physical NFC deliveries, and send Telegram alerts. Credentials and tokens are securely hashed/encrypted.',
        ps: 'موږ یوازې ستاسو د پروفایل، فزیکي کارتونو لېږلو او ټیلیګرام خبرتیاوو لپاره اړین معلومات ساتو. ټول پاسورډونه او امنیتي نښانې په معیاري توګه کوډ کېږي.',
      },
    },
    {
      id: 'priv-2',
      title: {
        fa: '2. عدم فروش معلومات به اشخاص ثالث',
        en: '2. Zero Third-Party Data Selling',
        ps: '2. درېیم اړخ ته د معلوماتو نه پلورل',
      },
      content: {
        fa: 'آریا لینک هرگز معلومات تماس، پیام‌های فرم CRM یا مدارک تذکره کاربران را به شرکت‌های تبلیغاتی یا اشخاص ثالث نمی‌فروشد یا واگذار نمی‌کند.',
        en: 'Arya Link never sells, rents, or trades user contact lists, CRM lead submissions, or KYC identity documents to third parties.',
        ps: 'آریا لینک هېڅکله د کاروونکو اړیکې، د CRM پیغامونه یا د تذکرې اسناد درېیمو اړخونو یا اعلاناتي شرکتونو ته نه پلوري.',
      },
    },
  ],
};

export const DEFAULT_CONTACT_US_CONTENT: ISiteContentContactUs = {
  badge: {
    fa: 'پشتیبانی و ارتباط مستقیم',
    en: 'Support & Direct Contact',
    ps: 'ملاتړ او مستقیمه اړیکه',
  },
  title: {
    fa: 'با تیم آریا لینک در تماس باشید',
    en: 'Get in Touch With Arya Link',
    ps: 'د آریا لینک له ټیم سره اړیکه ونیسئ',
  },
  subtitle: {
    fa: 'برای مشاوره سفارشات سازمانی، همکاری نمایندگی ولایات و یا پیگیری سفارشات کارت هوشمند با ما ارتباط بگیرید.',
    en: 'Reach out for enterprise custom orders, provincial partnership inquiries, or technical support.',
    ps: 'د سازماني فرمایشونو، ولایتي استازولۍ یا تخنیکي ملاتړ لپاره له موږ سره اړیکه ونیسئ.',
  },
  officeTitle: {
    fa: 'دفتر مرکزی کابل و مرکز چاپ NFC',
    en: 'Kabul Headquarters & NFC Studio',
    ps: 'د کابل مرکزي دفتر او NFC سټوډیو',
  },
  officeAddress: {
    fa: 'شهرنو، سرک چهارراهی صدارت، مارکت تجارتی آریا، منزل سوم، کابل، افغانستان',
    en: 'Shahr-e-Naw, Sadarat Square Street, Arya Commercial Center, 3rd Floor, Kabul, Afghanistan',
    ps: 'شهرنو، د صدارت څلورلارې سړک، آریا سوداګریز مارکیټ، درېیم پوړ، کابل، افغانستان',
  },
  workingHoursLabel: {
    fa: 'ساعات کاری پشتیبانی',
    en: 'Support Hours',
    ps: 'د کار ساعتونه',
  },
  workingHours: {
    fa: 'شنبه تا پنج‌شنبه: 8:30 صبح الی 5:30 عصر',
    en: 'Saturday – Thursday: 8:30 AM to 5:30 PM (AFT)',
    ps: 'شنبه تر پنج‌شنبې: د سهار 8:30 څخه د ماښام 5:30 پورې',
  },
  supportEmail: 'support@aryal.ink',
  supportPhone: '+93 700 123 456',
  whatsappNumber: '+93700123456',
  telegramHandle: '@aryalink_support',
  mapEmbedUrl: '',
};

export interface ISiteContentDocument extends Document {
  hero: ISiteContentHero;
  nfcConcept: ISiteContentNfcConcept;
  sliders: ISiteContentSlider[];
  aboutUs: ISiteContentAboutUs;
  team?: ISiteContentTeamMember[];
  partners?: ISiteContentPartner[];
  blogCms?: ISiteContentBlogCms;
  seo?: ISiteContentSeo;
  pricing?: ISiteContentPricing;
  features?: ISiteContentFeatures;
  howItWorks?: ISiteContentHowItWorks;
  finalCta?: ISiteContentFinalCta;
  legal?: ISiteContentLegal;
  contactUs?: ISiteContentContactUs;
  faq: ISiteContentFaq[];
  footer: ISiteContentFooter;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_SITE_CONTENT: Omit<ISiteContentDocument, keyof Document | 'createdAt' | 'updatedAt'> = {
  hero: {
    badge: {
      fa: 'یک لینک برای همه چیز • مینی‌وب‌سایت و بیولینک هوشمند',
      en: 'One Link for Everything • Smart Mini-Website & Bio-Link',
      ps: 'د هر څه لپاره یو لینک • سمارټ مینی وېبپاڼه او بیولینک',
    },
    titlePart1: {
      fa: 'یک لینک هوشمند برای',
      en: 'One Smart Link to',
      ps: 'یو سمارټ لینک ستاسو',
    },
    titleHighlight: {
      fa: 'اتصال همه‌چیز',
      en: 'Connect Everything',
      ps: 'نړۍ سره د هر څه نښلولو',
    },
    titlePart2: {
      fa: 'به دنیای شما',
      en: 'to Your World',
      ps: 'لپاره',
    },
    subtitle: {
      fa: 'در شبکه‌های اجتماعی فقط جا برای یک لینک دارید! با آریا لینک، تمام راه‌های ارتباطی، کاتالوگ محصولات، فروشگاه آنلاین و شبکه‌های خود را به یک مینی‌وب‌سایت لوکس تبدیل کنید — با امکان مکمل اتصال به کارت فیزیکی NFC.',
      en: 'You only have room for one link in social bios! With Arya Link, transform all your contact channels, product catalogs, online store, and social presence into a luxury mini-website — with instant NFC smart card connectivity.',
      ps: 'په ټولنیزو شبکو کې یوازې د یو لینک ځای لرئ! له آریا لینک سره خپلې ټولې اړیکې، د محصولاتو کاتالوګ او پلورنځی په یوه لوکس مینی وېبپاڼه بدل کړئ — د فزیکي NFC کارت سره د نښلولو بشپړ امکان.',
    },
    primaryCta: {
      fa: 'رایگان لینک خود را بسازید',
      en: 'Create Your Free Link',
      ps: 'وړیا خپل لینک جوړ کړئ',
    },
    primaryCtaLink: '/register',
    secondaryCta: {
      fa: 'مشاهده دمو و امکانات',
      en: 'Explore Demo & Features',
      ps: 'د امکاناتو او ډیمو لیدل',
    },
    secondaryCtaLink: '#features',
    mediaType: 'phone_mockup',
    mediaUrl: '',
    trustBadges: [
      {
        fa: '100% رایگان بدون نیاز به برنامه‌نویسی',
        en: '100% Free with zero coding required',
        ps: '۱۰۰٪ وړیا پرته له کوډ لیکنې',
      },
      {
        fa: 'دامنه و لینک اختصاصی aryal.ink',
        en: 'Custom aryal.ink domain & link',
        ps: 'ځانګړی aryal.ink ډومین او لینک',
      },
      {
        fa: 'پشتیبانی مکمل از کارت لمسی NFC',
        en: 'Full NFC smart card compatibility',
        ps: 'د NFC سمارټ کارت بشپړ ملاتړ',
      },
    ],
  },

  nfcConcept: {
    badge: {
      fa: 'فناوری لمسی نسل جدید',
      en: 'Next-Gen Touch Technology',
      ps: 'د نوي نسل ټچ ټیکنالوژي',
    },
    title: {
      fa: 'نسل بعدی ارتباطات تجاری در جیب شما',
      en: 'The Next Generation of Business Connections in Your Pocket',
      ps: 'ستاسو په جیب کې د سوداګریزو اړیکو راتلونکی نسل',
    },
    subtitle: {
      fa: 'سالانه میلیاردها کارت ویزیت کاغذی چاپ شده و بیش از 88% آن‌ها در کمتر از یک هفته دور انداخته می‌شوند. با کارت هوشمند NFC آریا لینک، یک‌بار هزینه کنید و برای همیشه یک هویت مدرن و ماندگار داشته باشید.',
      en: 'Billions of paper business cards are printed every year and over 88% are thrown away within a week. With Arya Link NFC smart card, invest once and keep a modern, everlasting digital identity.',
      ps: 'هر کال په ملیاردونو کاغذي کارتونه چاپېږي او له ۸۸٪ ډېر یې په یوه اونۍ کې غورځول کېږي. له آریا لینک سمارټ NFC کارت سره، یو ځل لګښت وکړئ او د تل لپاره عصري او تلپاتې هویت ولرئ.',
    },
    phoneNotificationTitle: {
      fa: 'آریا لینک (NFC Tap)',
      en: 'Arya Link (NFC Tap)',
      ps: 'آریا لینک (NFC Tap)',
    },
    phoneNotificationDesc: {
      fa: 'اتصال برقرار شد • دریافت پروفایل هوشمند',
      en: 'Connected • Smart profile received',
      ps: 'اړیکه ټینګه شوه • د سمارټ پروفایل ترلاسه کول',
    },
    phoneProfileName: {
      fa: 'فرهاد آریا',
      en: 'Farhad Arya',
      ps: 'فرهاد آریا',
    },
    phoneProfileTitle: {
      fa: 'مشاور ارشد کسب‌وکار و بنیان‌گذار استارتاپ',
      en: 'Senior Business Consultant & Startup Founder',
      ps: 'د سوداګرۍ لوړپوړی سلاکار او بنسټ اېښودونکی',
    },
    phoneProfileBio: {
      fa: 'یک لینک برای اتصال تمام پروژه‌ها، مشاوره آنلاین و خدمات تخصصی من',
      en: 'One link to connect all my projects, online consultations, and services',
      ps: 'زما د ټولو پروژو، آنلاین مشورو او خدمتونو نښلولو لپاره یو لینک',
    },
    features: [
      {
        icon: 'Zap',
        title: {
          fa: 'سازگار با آیفون و اندروید',
          en: 'Compatible with iPhone & Android',
          ps: 'له آیفون او انډرایډ سره مطابقت لرونکی',
        },
        desc: {
          fa: 'پشتیبانی از 100% آیفون‌ها و گوشی‌های اندرویدی مجهز به NFC بدون نیاز به تنظیم یا اپ خاص.',
          en: 'Supports 100% of NFC-enabled iPhones and Android phones without any setup or third-party apps.',
          ps: 'له ټولو هغو آیفون او انډرایډ مبایلونو سره بشپړ توافق چې NFC لري پرته له کوم اپلیکیشن.',
        },
      },
      {
        icon: 'Phone',
        title: {
          fa: 'ذخیره خودکار در مخاطبین',
          en: 'Auto-Save to Contacts',
          ps: 'په مخاطبینو کې اتومات ثبتول',
        },
        desc: {
          fa: 'با فشردن دکمه vCard، شماره تماس، ایمیل و شبکه‌های شما مستقیماً در دفترچه تلفن مخاطب ثبت می‌شود.',
          en: 'By tapping the vCard button, your phone number, email, and social networks are saved directly to contact lists.',
          ps: 'د vCard تڼۍ په کښېکاږلو سره ستاسو د اړیکو شمیره او ایمیل سمدستي د مخاطب مبایل کې ثبتېږي.',
        },
      },
      {
        icon: 'CreditCard',
        title: {
          fa: 'متریال فلزی و چوبی لوکس',
          en: 'Luxury Metal & Wood Materials',
          ps: 'لوکس فلزي او لرګین توکي',
        },
        desc: {
          fa: 'ارائه در جنس‌های فلز مشکی مات، طلایی، استیل ضدزنگ و PVC ضدآب با بالاترین کیفیت تراشه.',
          en: 'Available in matte black metal, 24k gold steel, stainless steel, and waterproof PVC with top-tier chipsets.',
          ps: 'په مات تور فلز، ۲۴ عیار طلایي، سټینلیس سټیل او ضد آب PVC کې له لوړ کیفیت چپسیټ سره.',
        },
      },
      {
        icon: 'Sparkles',
        title: {
          fa: 'ویرایش نامحدود و رایگان',
          en: 'Unlimited Free Updates',
          ps: 'نامحدود او وړیا تغیرات',
        },
        desc: {
          fa: 'تغییر شغل یا شماره تماس دادید؟ در پنل ویرایش کنید؛ کارت فیزیکی بدون نیاز به چاپ مجدد آپدیت می‌شود!',
          en: 'Changed your phone number or title? Update in your dashboard; your physical card updates instantly with no reprinting!',
          ps: 'شمیره یا دنده مو بدله شوه؟ په خپله پاڼه کې یې سمدستي تازه کړئ پرته له دې چې کارت بیا چاپ شي!',
        },
      },
    ],
    ctaText: {
      fa: 'سفارش کارت هوشمند NFC',
      en: 'Order NFC Smart Card',
      ps: 'د سمارټ NFC کارت سپارښتنه',
    },
    ctaLink: '/register',
    footnote: {
      fa: 'تحویل فوری در کابل و سراسر کشور',
      en: 'Fast delivery in Kabul and across the country',
      ps: 'په کابل او ټول هېواد کې سمدستي رسونه',
    },
  },

  sliders: [
    {
      id: 'slider-1',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      badge: {
        fa: 'نسل جدید بیولینک',
        en: 'Next-Gen Bio-Link',
        ps: 'د بیولینک نوی نسل',
      },
      title: {
        fa: 'مینی‌وب‌سایت اختصاصی و مدرن شما',
        en: 'Your Modern Exclusive Mini-Website',
        ps: 'ستاسو ځانګړې او عصري مینی وېبپاڼه',
      },
      subtitle: {
        fa: 'تمام راه‌های ارتباطی، نمونه کارها، کاتالوگ و درگاه پرداخت در یک پیوند لوکس',
        en: 'All your social links, portfolio, and payment gateways in one luxury URL',
        ps: 'ستاسو ټولې اړیکې، نمونې او د تادیاتو درشل په یوه لوکس لینک کې',
      },
      buttonText: {
        fa: 'ساخت رایگان کارت',
        en: 'Create Free Card',
        ps: 'وړیا کارت جوړ کړئ',
      },
      buttonLink: '/register',
      order: 1,
      isActive: true,
    },
    {
      id: 'slider-2',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
      badge: {
        fa: 'کارت فیزیکی لمسی NFC',
        en: 'NFC Physical Smart Card',
        ps: 'فزیکي سمارټ NFC کارت',
      },
      title: {
        fa: 'کارت‌های ویزیت فلزی و چوبی لوکس',
        en: 'Luxury Metal & Wooden Smart Cards',
        ps: 'لوکس فلزي او لرګین سمارټ کارتونه',
      },
      subtitle: {
        fa: 'تنها با یک لمس اطلاعات تماس و پروفایل کاری خود را به گوشی مشتری انتقال دهید',
        en: 'Transfer your contact info and business profile to client phones with a single tap',
        ps: 'یوازې په یو لمس سره خپلې اړیکې د پیرودونکي مبایل ته ولېږئ',
      },
      buttonText: {
        fa: 'مشاهده متریال و قیمت‌ها',
        en: 'View Materials & Pricing',
        ps: 'د متریال او قیمتونو لیدل',
      },
      buttonLink: '/services',
      order: 2,
      isActive: true,
    },
  ],

  aboutUs: {
    badge: {
      fa: 'داستان ما و تعهد به نوآوری',
      en: 'Our Story & Commitment to Innovation',
      ps: 'زموږ کیسه او نوښت ته ژمنتیا',
    },
    title: {
      fa: 'شرکت فناوری آریا لینک',
      en: 'Arya Link Technology Platform',
      ps: 'د آریا لینک ټیکنالوژۍ پلتفارم',
    },
    slogan: {
      fa: 'پیشگام در کارت‌های هوشمند NFC و هویت دیجیتال در افغانستان',
      en: 'Pioneering NFC Smart Cards & Digital Identity in Afghanistan',
      ps: 'په افغانستان کې د سمارټ NFC کارتونو او ډیجیټل هویت مخکښ',
    },
    storyTitle: {
      fa: 'چرا آریا لینک را ساختیم؟',
      en: 'Why We Built Arya Link?',
      ps: 'ولې موږ آریا لینک جوړ کړ؟',
    },
    story: {
      fa: 'آریا لینک با هدف حذف کارت‌های ویزیت کاغذی سنتی و ایجاد یک زیرساخت یکپارچه، امن و مدرن برای تبادل هویت حرفه‌ای در افغانستان بنیان‌گذاری شد. ما با ترکیب فناوری لمسی NFC و بیولینک‌های اختصاصی، ارتباطات تجاری را به بالاترین سطح ممکن ارتقا داده‌ایم.',
      en: 'Arya Link was founded to eliminate outdated paper business cards and create a unified, secure, and modern infrastructure for professional identity in Afghanistan. By combining NFC touch technology with bespoke bio-links, we elevate business networking to world-class standards.',
      ps: 'آریا لینک د دودیزو کاغذي کارتونو د ختمولو او په افغانستان کې د مسلکي هویت لپاره د یوه عصري او خوندي بنسټ رامنځته کولو په هدف جوړ شوی دی.',
    },
    missionTitle: {
      fa: 'ماموریت ما',
      en: 'Our Mission',
      ps: 'زموږ ماموریت',
    },
    mission: {
      fa: 'توانمندسازی مدیران، پزشکان، وکلا، فریلنسرها و شرکت‌های پیشرو در افغانستان با ارائه راهکارهای فناوری سطح جهانی جهت معرفی، فروش آنلاین و مدیریت ارتباطات حرفه‌ای.',
      en: 'Empowering executives, doctors, lawyers, freelancers, and leading enterprises across Afghanistan with world-class digital tools for networking, online commerce, and contact management.',
      ps: 'په افغانستان کې د مخکښو مدیرانو، ډاکټرانو، وکیلانو او شرکتونو پیاوړي کول د نړۍ په کچه ډیجیټل ټیکنالوژۍ سره.',
    },
    visionTitle: {
      fa: 'چشم‌انداز ما',
      en: 'Our Vision',
      ps: 'زموږ لیدلوری',
    },
    vision: {
      fa: 'تبدیل شدن به استاندارد اول هویت تجاری دیجیتال و کارت‌های هوشمند در منطقه، با تعهد به حفظ محیط زیست، کیفیت صنعتی بی‌نظیر و امنیت پایدار داده‌ها.',
      en: 'Becoming the premier standard for digital business identity and smart NFC solutions in the region, with strong environmental sustainability and robust data security.',
      ps: 'په سیمه کې د ډیجیټل هویت لومړنی معیاري چمتوکوونکی جوړېدل او د چاپېریال ساتنې ته ژمنتیا.',
    },
    stats: [
      {
        value: { fa: '+۱۰,۰۰۰', en: '10,000+', ps: '+۱۰,۰۰۰' },
        label: { fa: 'کارت فعال در کشور', en: 'Active Smart Cards', ps: 'فعال سمارټ کارتونه' },
      },
      {
        value: { fa: '۹۹.۸٪', en: '99.8%', ps: '۹۹.۸٪' },
        label: { fa: 'رضایت مشتریان', en: 'Customer Satisfaction', ps: 'د پیرودونکو رضایت' },
      },
      {
        value: { fa: '۲۴/۷', en: '24/7', ps: '۲۴/۷' },
        label: { fa: 'پشتیبانی فنی آنلاین', en: 'Live Technical Support', ps: 'تخنیکي آنلاین ملاتړ' },
      },
      {
        value: { fa: '۱۰۰٪', en: '100%', ps: '۱۰۰٪' },
        label: { fa: 'پوشش سراسری افغانستان', en: 'Nationwide Delivery', ps: 'په ټول هېواد کې رسونه' },
      },
    ],
  },

  faq: [
    {
      id: 'faq-1',
      question: {
        fa: 'آیا مخاطبان برای مشاهده صفحه کارت من نیاز به نصب هیچ برنامه‌ای دارند؟',
        en: 'Do clients need to install any app to view my smart card page?',
        ps: 'ایا پیرودونکي زما د کارت لیدلو لپاره کوم پروګرام انسټالولو ته اړتیا لري؟',
      },
      answer: {
        fa: 'خیر! یکی از بزرگ‌ترین مزیت‌های آریا لینک این است که مخاطب شما با هر گوشی موبایل (اندروید، آیفون یا کامپیوتر) و بدون نیاز به نصب هرگونه نرم‌افزار، تنها با لمس کارت یا اسکن کد، صفحه شما را مستقیماً در مرورگر مشاهده می‌کند.',
        en: 'No! One of the biggest advantages of Arya Link is that anyone with an iPhone, Android, or computer can view your profile directly in their browser without installing any apps, simply by tapping the card or scanning the QR code.',
        ps: 'نه! له آریا لینک سره مخاطب د هر ډول اپلیکیشن له لګولو پرته، یوازې په کارت نښلولو یا کیو آر کوډ سکن سره ستاسو پاڼه په خپل براوزر کې ګوري.',
      },
      order: 1,
      isActive: true,
    },
    {
      id: 'faq-2',
      question: {
        fa: 'کارت فیزیکی لمسی NFC چگونه کار می‌کند؟',
        en: 'How does the physical NFC smart card work?',
        ps: 'فزیکي سمارټ NFC کارت څنګه کار کوي؟',
      },
      answer: {
        fa: 'کارت‌های NFC دارای چیپست هوشمند ایمن و بدون باتری هستند. کافی است کارت را به پشت گوشی طرف مقابل نزدیک کنید؛ در کسری از ثانیه لینک کارت دیجیتال شما روی صفحه گوشی او باز می‌شود.',
        en: 'NFC cards feature secure, battery-free smart chips. Simply hold the card near the back of any compatible smartphone; in a fraction of a second, your digital profile opens automatically on their screen.',
        ps: 'د NFC کارتونه بیټرۍ ته اړتیا نلري. یوازې کارت د بل کس مبایل شاته نږدې کړئ؛ په یوه ثانیه کې ستاسو ډیجیټل کارت د هغه په مبایل کې خلاصېږي.',
      },
      order: 2,
      isActive: true,
    },
    {
      id: 'faq-3',
      question: {
        fa: 'تسویه حساب درآمدهای فروشگاه چگونه انجام می‌شود؟',
        en: 'How are store earnings and consultation payouts processed?',
        ps: 'د پلورنځي او خدمتونو عواید څنګه تادیه کېږي؟',
      },
      answer: {
        fa: 'پس از تایید هویت (KYC)، موجودی حاصل از فروش خدمات و محصولات شما از طریق پنل تسویه حساب، مستقیماً به ولت حساب‌پی (HesabPay) یا حساب‌های بانکی معتبر افغانستان واریز خواهد شد.',
        en: 'After completing identity verification (KYC), your earnings from consultations and product sales can be withdrawn directly to your HesabPay wallet or bank accounts in Afghanistan.',
        ps: 'د هویت له تایید (KYC) وروسته، ستاسو عواید مستقیماً د حساب‌پی (HesabPay) ولټ یا باوري بانکي حسابونو ته لېږل کېږي.',
      },
      order: 3,
      isActive: true,
    },
    {
      id: 'faq-4',
      question: {
        fa: 'نشان رسمی تیک آبی (KYC) چیست و چگونه دریافت می‌شود؟',
        en: 'What is the official Blue Tick badge (KYC) and how to get it?',
        ps: 'رسمي آبي ټیک (KYC) څه شی دی او څنګه ترلاسه کېږي؟',
      },
      answer: {
        fa: 'تیک آبی نشان‌دهنده اصالت هویت شماست. با ارسال تصویر تذکره الکترونیکی یا پاسپورت در پنل، کارشناسان ما مدارک را بررسی کرده و پس از تطبیق، نشان رسمی تیک آبی بر روی پروفایل و کارت شما فعال می‌شود.',
        en: 'The blue checkmark confirms your authentic identity. By submitting your electronic Tazkira or passport in your dashboard, our compliance team verifies your identity and activates the badge.',
        ps: 'آبي نښه ستاسو د باوري هویت ثبوت دی. په پنل کې د تذکرې یا پاسپورت عکس په لېږلو سره ستاسو هویت تایید او آبي ټیک فعالېږي.',
      },
      order: 4,
      isActive: true,
    },
    {
      id: 'faq-5',
      question: {
        fa: 'آیا می‌توانم لینک کارت خود را در بیو اینستاگرام و شبکه‌ها قرار دهم؟',
        en: 'Can I put my card link in Instagram bio and social profiles?',
        ps: 'ایا کولی شم د خپل کارت لینک په انسټاګرام بیو او نورو ځایونو کې کېږدم؟',
      },
      answer: {
        fa: 'بله کاملاً! آدرس اختصاصی شما مانند aryal.ink/ali را می‌توانید در بیو اینستاگرام، تیک‌تاک، تلگرام، واتساپ یا امضای ایمیل‌های اداری خود قرار دهید تا تمامی کانال‌های شما در یک لینک در دسترس باشند.',
        en: 'Absolutely! Your custom URL such as aryal.ink/ali can be pasted into Instagram bio, TikTok, Telegram, WhatsApp, or business email signatures for seamless all-in-one connectivity.',
        ps: 'هو یقیناً! ستاسو ځانګړی لینک لکه aryal.ink/ali په انسټاګرام، ټیک ټاک، ټلګرام، واټساپ او برېښنالیکونو کې د کارولو وړ دی.',
      },
      order: 5,
      isActive: true,
    },
  ],

  footer: {
    desc: {
      fa: 'پیشرفته‌ترین سیستم هویت دیجیتال، کارت ویزیت لمسی NFC و درگاه اختصاصی مینی‌وب‌سایت و بیولینک هوشمند در افغانستان.',
      en: 'The most advanced digital identity platform, touch NFC smart card, and bespoke mini-website & bio-link in Afghanistan.',
      ps: 'په افغانستان کې د ډیجیټل هویت، ټچ NFC سمارټ کارت او ځانګړي بیولینک ترټولو پرمختللی پلتفارم.',
    },
    address: {
      fa: 'کابل، شهر نو، جاده انصاری، مجتمع فناوری آریا، طبقه ۴',
      en: 'Kabul, Shahr-e Naw, Ansari Road, Arya Tech Complex, 4th Floor',
      ps: 'کابل، شهر نو، انصاري سړک، د آریا ټکنالوژۍ ودانۍ، څلورم پوړ',
    },
    phone: '+93 79 123 4567',
    email: 'info@aryal.ink',
    workingHours: {
      fa: 'شنبه تا پنج‌شنبه: ۸:۳۰ صبح الی ۵:۰۰ عصر',
      en: 'Saturday to Thursday: 8:30 AM – 5:00 PM',
      ps: 'شنبې تر پنجشنبې: ۸:۳۰ سهار تر ۵:۰۰ مازدیګر',
    },
    copyrightText: {
      fa: 'تمامی حقوق مادی و معنوی برای پلتفرم فناوری آریا لینک محفوظ است.',
      en: 'All rights reserved by Arya Link Technology Platform.',
      ps: 'ټول مادي او معنوي حقونه د آریا لینک ټیکنالوژۍ پلتفارم سره خوندي دي.',
    },
    statusBadgeText: {
      fa: 'سیستم آنلاین و فعال روی سرورهای ابری',
      en: 'All systems online & active on cloud servers',
      ps: 'سیسټم فعال او آنلاین په کلاوډ سرورونو کې',
    },
    quickLinks: [
      {
        label: { fa: 'صفحه اصلی', en: 'Home', ps: 'اصلي پاڼه' },
        url: '/',
      },
      {
        label: { fa: 'خدمات و کارت‌های NFC', en: 'Services & NFC Cards', ps: 'خدمتونه او NFC کارتونه' },
        url: '/services',
      },
      {
        label: { fa: 'بلاگ و مقالات', en: 'Blog & Articles', ps: 'بلاګ او مقالې' },
        url: '/blog',
      },
      {
        label: { fa: 'درباره ما و دفاتر', en: 'About Us & Offices', ps: 'زموږ او دفترونو په اړه' },
        url: '/about',
      },
      {
        label: { fa: 'ورود به حساب', en: 'Sign In', ps: 'حساب ته ننوتل' },
        url: '/login',
      },
      {
        label: { fa: 'ساخت کارت رایگان', en: 'Create Free Card', ps: 'وړیا کارت جوړول' },
        url: '/register',
      },
    ],
    socialLinks: {
      instagram: 'https://instagram.com/aryalink.af',
      telegram: 'https://t.me/aryalink_af',
      whatsapp: '+93791234567',
      linkedin: 'https://linkedin.com/company/aryalink',
      twitter: 'https://x.com/aryalink_af',
    },
  },

  team: [
    {
      id: 'team-1',
      name: { fa: 'فرهاد آریا', en: 'Farhad Arya', ps: 'فرهاد آریا' },
      role: { fa: 'بنیان‌گذار و مدیر ارشد اجرایی (CEO)', en: 'Founder & CEO', ps: 'بنسټ اېښودونکی او عمومي رییس' },
      bio: { fa: 'بیش از ۱۰ سال سابقه در توسعه فناوری‌های مالی و تحول دیجیتال', en: '10+ years of experience in fintech & digital innovation', ps: 'په مالي ټکنالوژۍ او ډیجیټل خدمتونو کې له لسو کلونو ډېره تجربه' },
      avatarUrl: '',
      order: 1,
    },
    {
      id: 'team-2',
      name: { fa: 'ثریا رسولی', en: 'Soraya Rasooli', ps: 'ثریا رسولي' },
      role: { fa: 'مدیر ارشد محصول و طراحی (CPO)', en: 'Head of Product Design', ps: 'د ډیزاین او کاروونکي تجربې مشره' },
      bio: { fa: 'متخصص خلق تجارب مدرن بصری و سامانه‌های هویتی لوکس', en: 'Specialist in modern UX & luxury digital identities', ps: 'د لوکس ډیجیټل هویت او عصري کاروونکي تجربې متخصصه' },
      avatarUrl: '',
      order: 2,
    },
  ],

  partners: [
    {
      id: 'partner-1',
      name: { fa: 'حساب‌پی (HesabPay)', en: 'HesabPay Afghanistan', ps: 'حساب‌پی افغانستان' },
      badge: { fa: 'درگاه رسمی پرداخت', en: 'Official Payment Gateway', ps: 'د تادیاتو رسمي درشل' },
      logoUrl: '',
      order: 1,
    },
    {
      id: 'partner-2',
      name: { fa: 'افغان بیسیم (AWCC)', en: 'AWCC Telecom', ps: 'افغان بېسیم مخابرات' },
      badge: { fa: 'پارتنر ارتباطی', en: 'Telecom Partner', ps: 'مخابراتي همکار' },
      logoUrl: '',
      order: 2,
    },
    {
      id: 'partner-3',
      name: { fa: 'روشن (Roshan)', en: 'Roshan Telecom', ps: 'روشن مخابراتي شرکت' },
      badge: { fa: 'پارتنر زیرساخت', en: 'Connectivity Partner', ps: 'ارتباطي همکار' },
      logoUrl: '',
      order: 3,
    },
  ],

  blogCms: {
    badge: {
      fa: 'پایگاه دانش و فناوری آریا لینک',
      en: 'Arya Link Tech & Knowledge Base',
      ps: 'د آریا لینک د پوهې او ټکنالوژۍ سرچینه',
    },
    title: {
      fa: 'آخرین مقالات، راهنماها و اخبار دنیای فناوری NFC',
      en: 'Latest Articles, Guides & NFC Tech News',
      ps: 'د NFC ټیکنالوژۍ وروستۍ مقالې، لارښودونه او خبرونه',
    },
    subtitle: {
      fa: 'آموزش‌های کاربردی برای افزایش فروش، ساخت کارت هوشمند و توسعه برند شخصی در افغانستان.',
      en: 'Actionable guides for sales growth, smart cards, and personal branding in Afghanistan.',
      ps: 'د پلور زیاتوالي، سمارټ کارت جوړولو او شخصي برانډینګ لپاره ګټورې لارښوونې.',
    },
  },

  seo: {
    metaTitle: {
      fa: 'آریا لینک | کارت ویزیت هوشمند NFC و پلتفرم اختصاصی بیولینک',
      en: 'Arya Link | Smart NFC Business Cards & Bio-Link Platform',
      ps: 'آریا لینک | سمارټ NFC ویزټ کارتونه او د بیولینک ځانګړی پلتفارم',
    },
    metaDescription: {
      fa: 'پیشرفته‌ترین سامانه هویت دیجیتال، کارت ویزیت لمسی NFC و درگاه مینی‌وب‌سایت اختصاصی در افغانستان.',
      en: 'The premier digital identity platform, touch NFC business card, and custom mini-website in Afghanistan.',
      ps: 'په افغانستان کې د ډیجیټل هویت، لمسي NFC کارت او مینی وېبپاڼې ترټولو مخکښ پلتفارم.',
    },
    metaKeywords: {
      fa: 'کارت ویزیت هوشمند, NFC, آریا لینک, بیولینک افغانستان, مینی وبسایت, کارت فلزی',
      en: 'smart business card, NFC, Arya Link, bio link Afghanistan, mini website, metal card',
      ps: 'سمارټ ویزټ کارت, NFC, آریا لینک, افغانستان بیولینک, فلزي کارت',
    },
    ogImage: '',
  },
};

const SiteContentSchema = new Schema<ISiteContentDocument>(
  {
    hero: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.hero,
    },
    nfcConcept: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.nfcConcept,
    },
    sliders: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.sliders,
    },
    aboutUs: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.aboutUs,
    },
    team: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.team,
    },
    partners: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.partners,
    },
    blogCms: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.blogCms,
    },
    seo: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.seo,
    },
    faq: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.faq,
    },
    pricing: {
      type: Schema.Types.Mixed,
      default: DEFAULT_PRICING_CONTENT,
    },
    features: {
      type: Schema.Types.Mixed,
      default: DEFAULT_FEATURES_CONTENT,
    },
    howItWorks: {
      type: Schema.Types.Mixed,
      default: DEFAULT_HOW_IT_WORKS_CONTENT,
    },
    finalCta: {
      type: Schema.Types.Mixed,
      default: DEFAULT_FINAL_CTA_CONTENT,
    },
    legal: {
      type: Schema.Types.Mixed,
      default: DEFAULT_LEGAL_CONTENT,
    },
    contactUs: {
      type: Schema.Types.Mixed,
      default: DEFAULT_CONTACT_US_CONTENT,
    },
    footer: {
      type: Schema.Types.Mixed,
      default: DEFAULT_SITE_CONTENT.footer,
    },
    updatedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const SiteContent: Model<ISiteContentDocument> =
  (mongoose?.models && mongoose.models.SiteContent)
    ? (mongoose.models.SiteContent as Model<ISiteContentDocument>)
    : mongoose.model<ISiteContentDocument>('SiteContent', SiteContentSchema);

export default SiteContent;
