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

export interface ISiteContentDocument extends Document {
  hero: ISiteContentHero;
  nfcConcept: ISiteContentNfcConcept;
  sliders: ISiteContentSlider[];
  aboutUs: ISiteContentAboutUs;
  team?: ISiteContentTeamMember[];
  partners?: ISiteContentPartner[];
  blogCms?: ISiteContentBlogCms;
  seo?: ISiteContentSeo;
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
