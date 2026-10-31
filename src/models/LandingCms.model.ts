import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILandingCmsHero {
  badge: string;
  titlePart1: string;
  titleHighlight: string;
  titlePart2: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  trustBadges: string[];
}

export interface ILandingCmsPlan {
  planId: 'free' | 'pro' | 'enterprise';
  name: string;
  badge: string;
  priceMonthly: number;
  priceYearlyMonthly: number;
  currency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}

export interface ILandingCmsMaterial {
  id: string;
  name: string;
  subtitle: string;
  materialType: 'pvc' | 'black_metal' | 'gold_steel' | 'wood';
  badge: string;
  price: number;
  currency: string;
  thickness: string;
  weight: string;
  chipset: string;
  description: string;
  features: string[];
  inStock: boolean;
  stockCount: number;
}

export interface ILandingCmsTestimonial {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  rating: number;
  reviewText: string;
  verifiedBadge: string;
  cardMaterialUsed: string;
  dateStr: string;
}

export interface ILandingCmsGeneral {
  platformName: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  rulesTerms: string;
  socialLinks: {
    instagram: string;
    telegram: string;
    whatsapp: string;
    linkedin: string;
    twitter: string;
  };
}

export interface ILandingCmsDocument extends Document {
  hero: ILandingCmsHero;
  plans: ILandingCmsPlan[];
  materials: ILandingCmsMaterial[];
  testimonials: ILandingCmsTestimonial[];
  general: ILandingCmsGeneral;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const INITIAL_LANDING_CMS: Omit<ILandingCmsDocument, keyof Document | 'createdAt' | 'updatedAt'> = {
  general: {
    platformName: 'آریا لینک (Arya Link)',
    supportPhone: '+93 799 123 456',
    supportEmail: 'contact@aryal.ink',
    address: 'کابل، شهر نو، جاده انصاری، مجتمع فناوری آریا، طبقه 4',
    rulesTerms: 'کلیه حقوق مادی و معنوی این سامانه متعلق به شرکت فناوری آریا لینک می‌باشد. استفاده از کارت‌های هوشمند و سرویس بیولینک مطابق با قوانین تجارت الکترونیک و ارتباطات افغانستان است.',
    socialLinks: {
      instagram: 'https://instagram.com/aryalink.af',
      telegram: 'https://t.me/aryalink_af',
      whatsapp: '+93799123456',
      linkedin: 'https://linkedin.com/company/aryalink',
      twitter: 'https://x.com/aryalink_af',
    },
  },
  hero: {
    badge: 'یک لینک برای همه چیز • مینی‌وب‌سایت و بیولینک هوشمند',
    titlePart1: 'یک لینک هوشمند برای',
    titleHighlight: 'اتصال همه‌چیز',
    titlePart2: 'به دنیای شما',
    subtitle: 'در شبکه‌های اجتماعی فقط جا برای یک لینک دارید! با آریا لینک، تمام راه‌های ارتباطی، کاتالوگ محصولات، فروشگاه آنلاین و شبکه‌های خود را به یک مینی‌وب‌سایت لوکس تبدیل کنید — با امکان مکمل اتصال به کارت فیزیکی NFC.',
    primaryCta: 'رایگان لینک خود را بسازید',
    secondaryCta: 'مشاهده دمو و امکانات',
    trustBadges: [
      '100% رایگان بدون نیاز به برنامه‌نویسی',
      'دامنه و لینک اختصاصی aryal.ink',
      'پشتیبانی مکمل از کارت لمسی NFC',
    ],
  },
  plans: [
    {
      planId: 'free',
      name: 'پلن پایه (Free)',
      badge: 'FREE',
      priceMonthly: 0,
      priceYearlyMonthly: 0,
      currency: 'AFN',
      description: 'مناسب برای استفاده‌های شخصی و شروع فعالیت در شبکه‌های اجتماعی',
      features: [
        'لینک‌بایو اختصاصی (aryal.ink/username)',
        'ماژول‌های پایه شبکه‌های اجتماعی و تماس',
        'پیش‌نمایش آنلاین در تمام تلفن‌های همراه',
        'دارای نشان و برندینگ آریا لینک',
      ],
      isPopular: false,
      ctaText: 'شروع رایگان',
    },
    {
      planId: 'pro',
      name: 'پلن حرفه‌ای (PRO)',
      badge: 'پیشنهاد ویژه و پرفروش',
      priceMonthly: 590,
      priceYearlyMonthly: 380,
      currency: 'AFN',
      description: 'برای مدیران، کسب‌وکارها، پزشکان، وکلا، فریلنسرها و شرکت‌های معتبر که می‌خواهند حداکثر اعتبار را ایجاد کنند.',
      features: [
        'تیک آبی رسمی تایید هویت (KYC)',
        'فروشگاه آنلاین با درگاه حساب‌پی',
        'اتصال دامنه اختصاصی (yourname.af)',
        'کارت فیزیکی لمسی NFC با لوگو',
        'حذف کامل لوگو و برندینگ آریا لینک',
        'کد QR وکتور با دانلود نامحدود',
        'آمار و تحلیل پیشرفته بازدیدها',
        'پشتیبانی VIP و اولویت‌دار 24/7',
      ],
      isPopular: true,
      ctaText: 'خرید و فعال‌سازی اشتراک PRO',
    },
    {
      planId: 'enterprise',
      name: 'پلن سازمانی (Enterprise)',
      badge: 'ویژه سازمان‌ها و تیم‌ها',
      priceMonthly: 1800,
      priceYearlyMonthly: 1200,
      currency: 'AFN',
      description: 'مدیریت متمرکز تیم، دامنه‌های سازمانی متعدد، گزارش‌گیری پیشرفته و پنل مدیریت کارمندان.',
      features: [
        'تمام امکانات پلن PRO',
        'مدیریت چندکاربره و اعضای تیم نامحدود',
        'اتصال دامنه‌های متعدد سازمانی',
        'تخفیف ویژه در سفارش انبوه کارت‌های NFC',
        'مدیر حساب اختصاصی (Account Manager)',
        'قرارداد رسمی و فاکتور شرکتی معتبر',
      ],
      isPopular: false,
      ctaText: 'سفارش سازمانی و شرکتی',
    },
  ],
  materials: [
    {
      id: 'mat-pvc',
      name: 'پی‌وی‌سی مات مخملی',
      subtitle: 'Matte Obsidian PVC',
      materialType: 'pvc',
      badge: 'پرفروش‌ترین (Most Popular)',
      price: 1500,
      currency: 'AFN',
      thickness: '0.84 mm',
      weight: '5g (فوق‌العاده سبک)',
      chipset: 'NTAG216 (High-Speed)',
      description: 'ساخته شده از پی‌وی‌سی فشرده با روکش مخملی مات ضد اثر انگشت. گزینه‌ای مینیمال، مدرن و با دوام برای تبادل روزمره اطلاعات.',
      features: [
        'روکش مخملی مات (Soft-touch velvet finish)',
        'مقاومت 100% در برابر آب، رطوبت و خمیدگی',
        'تراشه NTAG216 سازگار با آیفون و اندروید',
        'چاپ باکیفیت UV صنعتی با وضوح بالا',
      ],
      inStock: true,
      stockCount: 150,
    },
    {
      id: 'mat-black-metal',
      name: 'فلز مشکی تیتانیوم',
      subtitle: 'Black Titanium Metal',
      materialType: 'black_metal',
      badge: 'ویژه مدیران (Executive)',
      price: 3500,
      currency: 'AFN',
      thickness: '0.80 mm',
      weight: '24g (وزن سنگین لوکس)',
      chipset: 'NTAG216 Hybrid Boosted',
      description: 'تراش‌خورده از استیل ضد زنگ 304 با پوشش مات مشکی الکترواستاتیک و حکاکی لیزری نقره‌ای کروم. حس وقار و پرستیژ ماندگار.',
      features: [
        'بدنه تمام فلزی استیل 304 با وزن سنگین 24 گرم',
        'پوشش نانو مات ضد سایش و ضد خط‌وخش',
        'حکاکی دقیق لیزر فیبر با بازتاب نقره‌ای',
        'ماژول هیبریدی NFC تقویت‌شده ضدتداخل فلز',
      ],
      inStock: true,
      stockCount: 85,
    },
    {
      id: 'mat-gold-steel',
      name: 'استیل طلایی آینه‌ای',
      subtitle: '24K Gold Mirror Steel',
      materialType: 'gold_steel',
      badge: 'فوق لوکس (Ultra Luxury)',
      price: 3900,
      currency: 'AFN',
      thickness: '0.80 mm',
      weight: '24g (وزن سنگین لوکس)',
      chipset: 'NTAG216 Hybrid Boosted',
      description: 'آبکاری طلای 24 عیار به روش PVD با درخشش آینه‌ای خیره‌کننده. امضای اختصاصی مدیران ارشد، دیپلمات‌ها و شرکت‌های ممتاز.',
      features: [
        'آبکاری طلای 24 عیار به روش پیشرفته خلاء PVD',
        'سطح کاملاً آینه‌ای با انعکاس نور خیره‌کننده',
        'حکاکی لیزری عمیق با درخشش متالیک طلایی',
        'بسته‌بندی اختصاصی در هاردباکس کادویی مخملین',
      ],
      inStock: true,
      stockCount: 40,
    },
    {
      id: 'mat-wood',
      name: 'چوب طبیعی گردو',
      subtitle: 'Eco Walnut Wood',
      materialType: 'wood',
      badge: 'طبیعی و ارگانیک (Eco-Friendly)',
      price: 2400,
      currency: 'AFN',
      thickness: '1.20 mm',
      weight: '7g (سبک و طبیعی)',
      chipset: 'NTAG216 Encapsulated',
      description: 'برش‌خورده از رگه‌های چوب طبیعی گردو با بافت طبیعی متمایز برای هر کارت. حسی اصیل، پایدار و 100% دوستدار محیط زیست.',
      features: [
        '100% چوب طبیعی گردوی تصفیه‌شده و بازیافت‌پذیر',
        'رگه‌ها و گره‌های چوب طبیعی متمایز برای هر کارت',
        'تراشه کپسولی NFC تعبیه‌شده در لایه‌های چوب',
        'پوشش روغن گیاهی محافظ در برابر رطوبت و تغییر رنگ',
      ],
      inStock: true,
      stockCount: 65,
    },
  ],
  testimonials: [
    {
      id: 'test-1',
      name: 'انجینیر احمد فیاض',
      title: 'مدیر ارشد فناوری و هم‌بنیان‌گذار TechKabul',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewText: '«کارت فلزی مشکی آریا لینک ارتباطات تجاری شرکت ما را متحول کرد. در کنفرانس‌های بین‌المللی کابل و دبی، فقط با نزدیک کردن کارت به مبایل مشتریان، کاتالوگ و راه‌های ارتباطی ما در کسری از ثانیه ذخیره می‌شود. بی‌نظیر و باوقار است!»',
      verifiedBadge: 'مشتری سازمانی تاییدشده',
      cardMaterialUsed: 'فلز مشکی تیتانیوم',
      dateStr: '2026-10-14',
    },
    {
      id: 'test-2',
      name: 'دکتر سمیرا رحیمی',
      title: 'جراح و متخصص دندان‌پزشکی | کلینیک تخصصی رحیمی',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewText: '«بزرگ‌ترین مزیت آریا لینک برای من، حذف کامل کارت‌های کاغذی قدیمی و امکان رزرو نوبت آنلاین مریضان بود. مراجعین کلینیک با یک لمس ساده به شماره واتساپ، آدرس دقیق روی نقشه و کانال آموزشی وصل می‌شوند.»',
      verifiedBadge: 'پروفایل تیک آبی رسمی',
      cardMaterialUsed: 'PVC مات مخملی',
      dateStr: '2026-09-28',
    },
    {
      id: 'test-3',
      name: 'محمد عثمان کریمی',
      title: 'رئیس هیئت‌مدیره گروه بازرگانی آریا افغان',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewText: '«استفاده از کارت استیل طلایی آریا لینک در جلسات اتاق تجارت و قراردادهای کلان، اعتبار و پرستیژ متفاوتی به برند ما بخشیده است. پشتیبانی فنی و تحویل سریع پستی در کابل فوق‌العاده منظم و باکیفیت بود.»',
      verifiedBadge: 'کاربر پلن شرکتی (Enterprise)',
      cardMaterialUsed: 'استیل طلایی آینه‌ای',
      dateStr: '2026-10-02',
    },
    {
      id: 'test-4',
      name: 'فاطمه علیزاده',
      title: 'مشاور برندینگ و مدیر آژانس بازاریابی افق',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewText: '«داشبورد تحلیلی و آمار لحظه‌ای کلیک‌ها روی لینک‌ها بی‌نهایت کاربردی است. ما برای بیش از 30 پرسونل شرکت کارت چوبی سفارش دادیم و بازخورد مشتریان به رویکرد ارگانیک و مدرن ما شگفت‌انگیز بود.»',
      verifiedBadge: 'مشتری تاییدشده',
      cardMaterialUsed: 'چوب طبیعی گردو',
      dateStr: '2026-08-19',
    },
    {
      id: 'test-5',
      name: 'حسیب‌الله نوری',
      title: 'مدیر توسعه بازار | خدمات لجستیک و ترانسپورت پامیر',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewText: '«سرعت اسکن چیپست NFC فوق‌العاده بالاست. دیگر نیازی به چاپ مجدد هزاران کارت ویزیت در هر تغییر شماره تماس یا ایمیل نیست؛ از پنل به راحتی همه چیز در لحظه به‌روزرسانی می‌شود.»',
      verifiedBadge: 'مشتری سازمانی',
      cardMaterialUsed: 'فلز مشکی تیتانیوم',
      dateStr: '2026-09-12',
    },
    {
      id: 'test-6',
      name: 'رویا صدیقی',
      title: 'طراح ارشد هویت بصری و فریلنسر بین‌المللی',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewText: '«کیفیت ساخت و روکش مات کارت پی‌وی‌سی فراتر از انتظارم بود. جلوه مینیمال و شیک آن همراه با لینک نمونه کارهایم در بیو، حس یک هویت دیزاین سطح جهانی را به مشتریان منتقل می‌کند.»',
      verifiedBadge: 'پروفایل هنری تاییدشده',
      cardMaterialUsed: 'PVC مات مخملی',
      dateStr: '2026-10-18',
    },
  ],
};

const LandingCmsSchema = new Schema<ILandingCmsDocument>(
  {
    hero: {
      type: Schema.Types.Mixed,
      default: INITIAL_LANDING_CMS.hero,
    },
    plans: {
      type: Schema.Types.Mixed,
      default: INITIAL_LANDING_CMS.plans,
    },
    materials: {
      type: Schema.Types.Mixed,
      default: INITIAL_LANDING_CMS.materials,
    },
    testimonials: {
      type: Schema.Types.Mixed,
      default: INITIAL_LANDING_CMS.testimonials,
    },
    general: {
      type: Schema.Types.Mixed,
      default: INITIAL_LANDING_CMS.general,
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

export const LandingCms: Model<ILandingCmsDocument> =
  (mongoose?.models && mongoose.models.LandingCms)
    ? (mongoose.models.LandingCms as Model<ILandingCmsDocument>)
    : mongoose.model<ILandingCmsDocument>('LandingCms', LandingCmsSchema);

export default LandingCms;
