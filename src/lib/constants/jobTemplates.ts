import { LinkModuleType, ProfileLinkItem, ModuleMetadata, BusinessHourDay } from '@/types/profile.types';

export type ReferenceTemplateId = 'medical' | 'creative' | 'corporate' | 'education' | 'general';

export interface JobTemplateModuleDef {
  moduleType: LinkModuleType;
  title: string;
  url: string;
  metadata?: ModuleMetadata;
}

export interface JobTemplate {
  id: ReferenceTemplateId | string;
  title: string;
  titleEn: string;
  description: string;
  iconName: 'Stethoscope' | 'Code' | 'Briefcase' | 'GraduationCap' | 'Video' | 'Sparkles';
  defaultHeadline: string;
  defaultBio: string;
  defaultThemePreset: 'dark_neon' | 'glass_morphism' | 'emerald_luxury' | 'royal_gold' | 'cyberpunk';
  defaultModules: JobTemplateModuleDef[];
}

export interface JobCategory {
  id: string;
  title: string;
  titleEn: string;
  defaultTemplateId: ReferenceTemplateId;
  icon: string;
}

export interface JobItem {
  id?: string;
  title: string;
  categoryId: string;
  templateId: ReferenceTemplateId;
  isUserAdded: boolean;
}

const DEFAULT_CLINIC_HOURS: BusinessHourDay[] = [
  { dayIndex: 0, dayName: 'شنبه', isOpen: true, openTime: '08:30', closeTime: '17:00' },
  { dayIndex: 1, dayName: 'یکشنبه', isOpen: true, openTime: '08:30', closeTime: '17:00' },
  { dayIndex: 2, dayName: 'دوشنبه', isOpen: true, openTime: '08:30', closeTime: '17:00' },
  { dayIndex: 3, dayName: 'سه‌شنبه', isOpen: true, openTime: '08:30', closeTime: '17:00' },
  { dayIndex: 4, dayName: 'چهارشنبه', isOpen: true, openTime: '08:30', closeTime: '17:00' },
  { dayIndex: 5, dayName: 'پنجشنبه', isOpen: true, openTime: '08:30', closeTime: '13:00' },
  { dayIndex: 6, dayName: 'جمعه', isOpen: false, openTime: '08:30', closeTime: '17:00' },
];

/**
 * 1. REFERENCE TEMPLATES (قالب‌های مرجع)
 * - medical: سلامت و خدمات صحی
 * - creative: هنر، تکنالوژی و دیزاین
 * - corporate: تجارت، بازرگانی و فروش
 * - education: آموزش، پوهنتون و پژوهش
 * - general: عمومی و خدمات
 */
export const REFERENCE_TEMPLATES: Record<ReferenceTemplateId, JobTemplate> = {
  medical: {
    id: 'medical',
    title: 'سلامت',
    titleEn: 'Healthcare & Medical',
    description: 'قالب اختصاصی داکتران، کلینیک‌ها و پرسونل صحی همراه با نوبت‌دهی، موقعیت معاینه‌خانه و ساعات کاری',
    iconName: 'Stethoscope',
    defaultHeadline: 'داکتر و متخصص | نوبت‌دهی و مشاوره',
    defaultBio: 'به صفحه نوبت‌دهی و ارتباط مستقیم با معاینه‌خانه خوش آمدید. جهت دریافت مشاوره و وقت معاینه از گزینه‌های زیر استفاده نمایید.',
    defaultThemePreset: 'emerald_luxury',
    defaultModules: [
      {
        moduleType: 'phone_call',
        title: 'تماس تیلیفونی با معاینه‌خانه / پذیرش',
        url: 'tel:+93',
        metadata: { phoneNumber: '+93' },
      },
      {
        moduleType: 'video_meeting',
        title: 'رزرو وقت مشاوره آنلاین تصویری',
        url: 'https://meet.google.com',
        metadata: { meetingPlatform: 'google_meet', meetingUrl: '' },
      },
      {
        moduleType: 'whatsapp_direct',
        title: 'مشاوره و پیام در واتساپ',
        url: 'https://wa.me/93',
        metadata: {
          phoneNumber: '+93',
          prefilledMessage: 'سلام، جهت دریافت مشاوره صحی و وقت معاینه پیام می‌دهم.',
        },
      },
      {
        moduleType: 'location_hours',
        title: 'آدرس و موقعیت معاینه‌خانه / کلینیک',
        url: '#location',
        metadata: {
          address: 'کابل، شهر نو، مرکز صحی و کلینیک تخصصی',
          mapLink: '',
        },
      },
      {
        moduleType: 'business_hours',
        title: 'ساعات حضور و معاینه مریضان',
        url: '#business-hours',
        metadata: {
          businessHours: DEFAULT_CLINIC_HOURS,
        },
      },
      {
        moduleType: 'lead_capture_form',
        title: 'فورم ثبت درخواست وقت معاینه حضوری یا آنلاین',
        url: '#contact-form',
        metadata: {
          leadHeadline: 'درخواست معاینه و نوبت‌دهی تخصصی',
          requireEmail: true,
          requireNote: true,
        },
      },
    ],
  },
  creative: {
    id: 'creative',
    title: 'هنر، تکنالوژی و دیزاین',
    titleEn: 'Creative, Tech & Design',
    description: 'قالب دیزاینران، برنامه‌نویسان و تولیدکنندگان محتوا با نمونه‌کارها، گیت‌هاب و راه‌های سفارش پروژه',
    iconName: 'Code',
    defaultHeadline: 'دیزاینر رابط کاربری و توسعه‌دهنده نرم‌افزار',
    defaultBio: 'طراحی تجربیات بصری جذاب و انکشاف سیستم‌های نرم‌افزاری مدرن. نمونه‌کارها و پروژه‌های من را در زیر مشاهده فرمایید.',
    defaultThemePreset: 'dark_neon',
    defaultModules: [
      {
        moduleType: 'image_gallery',
        title: 'نمونه‌کارها و پورتفولیو',
        url: '#gallery',
        metadata: {
          imageUrls: [
            'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          ],
        },
      },
      {
        moduleType: 'github',
        title: 'گیت‌هاب و کدهای منبع',
        url: 'https://github.com/',
        metadata: { username: '' },
      },
      {
        moduleType: 'dribbble',
        title: 'پورتفولیو طرح‌ها در دریبل',
        url: 'https://dribbble.com/',
        metadata: { username: '' },
      },
      {
        moduleType: 'linkedin_profile',
        title: 'سوابق و خلص سوانح کاری در لینکدین',
        url: 'https://linkedin.com/in/',
        metadata: { username: '' },
      },
      {
        moduleType: 'telegram_channel',
        title: 'کانال تلگرام و نمونه آثار',
        url: 'https://t.me/',
        metadata: { username: '' },
      },
      {
        moduleType: 'email_direct',
        title: 'ارسال پیشنهاد پروژه و همکاری کاری',
        url: 'mailto:',
        metadata: {
          emailAddress: '',
          emailSubject: 'پیشنهاد همکاری تخصصی و سفارش پروژه',
        },
      },
    ],
  },
  corporate: {
    id: 'corporate',
    title: 'تجارت، بازرگانی و فروش',
    titleEn: 'Corporate & Sales',
    description: 'قالب ویژه شرکت‌ها، مدیران تجارتی و فروشگاه‌ها با کاتالوگ خدمات، استعلام فاکتور و تماس مستقیم',
    iconName: 'Briefcase',
    defaultHeadline: 'مدیر فروش و توسعه بازار | تجارت و خدمات',
    defaultBio: 'تأمین اموال، توزیع و خدمات تخصصی تجارتی. برای دریافت کاتالوگ، استعلام نرخ و عقد قرارداد با ما در تماس شوید.',
    defaultThemePreset: 'emerald_luxury',
    defaultModules: [
      {
        moduleType: 'product_card',
        title: 'کاتالوگ خدمات و محصولات ویژه',
        url: '#product',
        metadata: {
          productTitle: 'محصولات و تجهیزات تجارتی برتر',
          productPrice: 0,
          productCurrency: 'AFN',
          productImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        },
      },
      {
        moduleType: 'phone_call',
        title: 'تماس مستقیم با شعبات فروش و مشاوره',
        url: 'tel:+93',
        metadata: { phoneNumber: '+93' },
      },
      {
        moduleType: 'lead_capture_form',
        title: 'فورم ثبت فرمایش و درخواست پیش‌فاکتور',
        url: '#contact-form',
        metadata: {
          leadHeadline: 'درخواست پیش‌فاکتور، استعلام نرخ و مشاوره فروش',
          requireEmail: true,
          requireNote: true,
        },
      },
      {
        moduleType: 'whatsapp_direct',
        title: 'ارتباط مستقیم با مدیر فروش در واتساپ',
        url: 'https://wa.me/93',
        metadata: {
          phoneNumber: '+93',
          prefilledMessage: 'سلام، جهت استعلام نرخ، دریافت کاتالوگ و ثبت فرمایش پیام می‌دهم.',
        },
      },
      {
        moduleType: 'location_hours',
        title: 'آدرس دفتر مرکزی و نمایندگی‌های تجارتی',
        url: '#location',
        metadata: {
          address: 'کابل، شهر نو، مجتمع تجارتی آریا',
          mapLink: '',
        },
      },
      {
        moduleType: 'email_direct',
        title: 'مکاتبه رسمی و ایمیل سازمانی',
        url: 'mailto:',
        metadata: {
          emailAddress: '',
          emailSubject: 'استعلام رسمی و درخواست همکاری تجارتی',
        },
      },
    ],
  },
  education: {
    id: 'education',
    title: 'آموزش، پوهنتون و پژوهش',
    titleEn: 'Education & Research',
    description: 'قالب مناسب محصلین و پژوهشگران با معرفی سوابق تحصیلی، لینکدین، ایمیل آکادمیک و مقالات',
    iconName: 'GraduationCap',
    defaultHeadline: 'محصل و پژوهشگر | کارت ارتباطی آکادمیک',
    defaultBio: 'مشتاق به یادگیری، تحقیق و فعالیت‌های علمی و پوهنتونی. راه‌های ارتباطی و شبکه‌های علمی من در زیر در دسترس است.',
    defaultThemePreset: 'glass_morphism',
    defaultModules: [
      {
        moduleType: 'simple_text',
        title: 'درباره من و زمینه تحقیقی',
        url: '#text',
        metadata: {
          simpleTextContent: 'محصل و پژوهشگر علاقه‌مند به هوش مصنوعی، تکنالوژی‌های نوین و تبادل تجربیات علمی.',
        },
      },
      {
        moduleType: 'linkedin_profile',
        title: 'پروفایل آکادمیک و مسلکی در لینکدین',
        url: 'https://linkedin.com/in/',
        metadata: { username: '' },
      },
      {
        moduleType: 'email_direct',
        title: 'مکاتبه و ارسال ایمیل پوهنتونی',
        url: 'mailto:',
        metadata: {
          emailAddress: '',
          emailSubject: 'ارتباط علمی و مکاتبه آکادمیک',
        },
      },
      {
        moduleType: 'telegram_channel',
        title: 'کانال چپترها، مقالات و یادداشت‌ها',
        url: 'https://t.me/',
        metadata: { username: '' },
      },
      {
        moduleType: 'twitter_x',
        title: 'نظرات و دیدگاه‌ها در شبکه ایکس',
        url: 'https://x.com/',
        metadata: { username: '' },
      },
    ],
  },
  general: {
    id: 'general',
    title: 'عمومی و خدمات',
    titleEn: 'General & Services',
    description: 'قالب همه‌منظوره و انعطاف‌پذیر با ماژول‌های پرکاربرد برای انواع کسب‌وکارها و ارتباطات روزمره',
    iconName: 'Sparkles',
    defaultHeadline: 'کارت ویزیت هوشمند و صفحه ارتباطات',
    defaultBio: 'به صفحه هوشمند ارتباطی من در آریا لینک خوش آمدید. از طریق گزینه‌های زیر می‌توانید با من در ارتباط شوید.',
    defaultThemePreset: 'dark_neon',
    defaultModules: [
      {
        moduleType: 'phone_call',
        title: 'تماس مستقیم تیلیفونی',
        url: 'tel:+93',
        metadata: { phoneNumber: '+93' },
      },
      {
        moduleType: 'whatsapp_direct',
        title: 'ارسال پیام در واتساپ',
        url: 'https://wa.me/93',
        metadata: {
          phoneNumber: '+93',
          prefilledMessage: 'سلام، از طریق کارت هوشمند دیجیتال شما پیام می‌دهم.',
        },
      },
      {
        moduleType: 'instagram_profile',
        title: 'صفحه اینستاگرام',
        url: 'https://instagram.com/',
        metadata: { username: '' },
      },
      {
        moduleType: 'lead_capture_form',
        title: 'ارسال پیام مستقیم و ثبت مشخصات',
        url: '#contact-form',
        metadata: {
          leadHeadline: 'فورم ارتباط سریع و ارسال پیام',
          requireEmail: true,
          requireNote: true,
        },
      },
      {
        moduleType: 'location_hours',
        title: 'آدرس و موقعیت مکانی',
        url: '#location',
        metadata: {
          address: 'افغانستان',
          mapLink: '',
        },
      },
    ],
  },
};

export const JOB_TEMPLATES: JobTemplate[] = Object.values(REFERENCE_TEMPLATES);

/**
 * 2. BROAD CATEGORIES (دسته‌بندی‌های کلی)
 */
export const JOB_CATEGORIES: JobCategory[] = [
  {
    id: 'medical',
    title: 'سلامت',
    titleEn: 'Healthcare & Medical',
    defaultTemplateId: 'medical',
    icon: 'Stethoscope',
  },
  {
    id: 'tech_design',
    title: 'انجنیری، تکنالوژی و هنر',
    titleEn: 'Engineering, Tech & Design',
    defaultTemplateId: 'creative',
    icon: 'Code',
  },
  {
    id: 'business',
    title: 'تجارت، بازرگانی و فروش',
    titleEn: 'Commerce, Sales & Business',
    defaultTemplateId: 'corporate',
    icon: 'Briefcase',
  },
  {
    id: 'education',
    title: 'آموزش، پوهنتون و پژوهش',
    titleEn: 'Education & Research',
    defaultTemplateId: 'education',
    icon: 'GraduationCap',
  },
  {
    id: 'services',
    title: 'خدمات، مشاوره و حقوقی',
    titleEn: 'Services & Consulting',
    defaultTemplateId: 'general',
    icon: 'Sparkles',
  },
  {
    id: 'other',
    title: 'سایر زمینه‌ها',
    titleEn: 'Other Fields',
    defaultTemplateId: 'general',
    icon: 'Sparkles',
  },
];

/**
 * 3. INITIAL SEED JOBS (مشاغل اولیه استاندارد به فارسی دری)
 */
export const INITIAL_SEED_JOBS: JobItem[] = [
  // سلامت (Medical / Healthcare)
  { title: 'داکتر عمومی', categoryId: 'medical', templateId: 'medical', isUserAdded: false },
  { title: 'داکتر متخصص و جراح', categoryId: 'medical', templateId: 'medical', isUserAdded: false },
  { title: 'داکتر دندان (دندانساز)', categoryId: 'medical', templateId: 'medical', isUserAdded: false },
  { title: 'دواسازی / دواخانه', categoryId: 'medical', templateId: 'medical', isUserAdded: false },
  { title: 'نرس و پرسونل صحی', categoryId: 'medical', templateId: 'medical', isUserAdded: false },
  { title: 'روانشناس و مشاور صحت روان', categoryId: 'medical', templateId: 'medical', isUserAdded: false },
  { title: 'فیزیوتراپیست (فزیوتراپی)', categoryId: 'medical', templateId: 'medical', isUserAdded: false },

  // انجنیری، تکنالوژی و هنر (Engineering, Tech & Creative)
  { title: 'برنامه‌نویس و انجنیر نرم‌افزار', categoryId: 'tech_design', templateId: 'creative', isUserAdded: false },
  { title: 'گرافیک دیزاینر و دیزاینر UI/UX', categoryId: 'tech_design', templateId: 'creative', isUserAdded: false },
  { title: 'طراح و دیزاینر وب‌سایت', categoryId: 'tech_design', templateId: 'creative', isUserAdded: false },
  { title: 'تولیدکننده محتوا / ولاگر / اینفلوئنسر', categoryId: 'tech_design', templateId: 'creative', isUserAdded: false },
  { title: 'عکاس و ادیتور ویدیو', categoryId: 'tech_design', templateId: 'creative', isUserAdded: false },
  { title: 'انجنیر شبکه و امنیت تکنالوژی معلوماتی (IT)', categoryId: 'tech_design', templateId: 'creative', isUserAdded: false },
  { title: 'انجنیر معمار و دیزاینر داخلی', categoryId: 'tech_design', templateId: 'creative', isUserAdded: false },
  { title: 'متخصص سئو و مارکتینگ دیجیتال', categoryId: 'tech_design', templateId: 'creative', isUserAdded: false },

  // تجارت، بازرگانی و فروش (Business & Corporate)
  { title: 'مدیر فروش و مارکتینگ', categoryId: 'business', templateId: 'corporate', isUserAdded: false },
  { title: 'رئیس اجرایی / بنیان‌گذار شرکت', categoryId: 'business', templateId: 'corporate', isUserAdded: false },
  { title: 'رهنمای معاملات و املاک', categoryId: 'business', templateId: 'corporate', isUserAdded: false },
  { title: 'واردکننده و صادرکننده اموال', categoryId: 'business', templateId: 'corporate', isUserAdded: false },
  { title: 'حسابدار و مشاور امور مالیاتی', categoryId: 'business', templateId: 'corporate', isUserAdded: false },
  { title: 'مدیر رستورانت، هوتل و کافه', categoryId: 'business', templateId: 'corporate', isUserAdded: false },
  { title: 'دکاندار / کسبه‌کار بازار', categoryId: 'business', templateId: 'corporate', isUserAdded: false },

  // آموزش، پوهنتون و پژوهش (Education & Research)
  { title: 'استاد پوهنتون و پژوهشگر', categoryId: 'education', templateId: 'education', isUserAdded: false },
  { title: 'محصل / متعلم', categoryId: 'education', templateId: 'education', isUserAdded: false },
  { title: 'معلم و استاد مکتب', categoryId: 'education', templateId: 'education', isUserAdded: false },
  { title: 'مدیر مکتب', categoryId: 'education', templateId: 'education', isUserAdded: false },
  { title: 'استاد لسان‌های خارجی', categoryId: 'education', templateId: 'education', isUserAdded: false },
  { title: 'مربی ورزش و فتنس', categoryId: 'education', templateId: 'education', isUserAdded: false },
  { title: 'پژوهشگر علمی و پوهنتونی', categoryId: 'education', templateId: 'education', isUserAdded: false },

  // خدمات، مشاوره و حقوقی (Services)
  { title: 'وکیل مدافع و مشاور حقوقی', categoryId: 'services', templateId: 'general', isUserAdded: false },
  { title: 'ترجمان رسمی و ویراستار', categoryId: 'services', templateId: 'education', isUserAdded: false },
  { title: 'آرایشگاه و سالن زیبایی', categoryId: 'services', templateId: 'general', isUserAdded: false },
  { title: 'تکنسین فنی و مستری / ترمیم‌کار', categoryId: 'services', templateId: 'general', isUserAdded: false },
  { title: 'درایور و خدمات ترانسپورت', categoryId: 'services', templateId: 'general', isUserAdded: false },
  { title: 'خیاط و دیزاینر لباس', categoryId: 'services', templateId: 'creative', isUserAdded: false },

  // سایر (Other)
  { title: 'عمومی / سایر مسلک‌ها', categoryId: 'other', templateId: 'general', isUserAdded: false },
];

/**
 * Normalizes any template identifier (including legacy keys) to one of the 5 reference template IDs:
 * 'medical' | 'creative' | 'corporate' | 'education' | 'general'
 */
export function normalizeTemplateId(input?: string): ReferenceTemplateId {
  if (!input) return 'general';
  const val = input.toLowerCase().trim();

  if (
    val === 'medical' ||
    val === 'doctor_nurse' ||
    val.includes('پزشک') ||
    val.includes('داکتر') ||
    val.includes('صحی') ||
    val.includes('سلامت') ||
    val.includes('صحت') ||
    val.includes('درمان') ||
    val.includes('دوا') ||
    val.includes('نرس') ||
    val.includes('دندان') ||
    val.includes('مریض')
  ) {
    return 'medical';
  }
  if (
    val === 'creative' ||
    val === 'developer_designer' ||
    val === 'content_creator' ||
    val.includes('دیزاین') ||
    val.includes('برنامه') ||
    val.includes('طراح') ||
    val.includes('انجنیر') ||
    val.includes('تکنالوژی')
  ) {
    return 'creative';
  }
  if (
    val === 'corporate' ||
    val === 'sales_manager' ||
    val.includes('فروش') ||
    val.includes('شرکت') ||
    val.includes('تجارت') ||
    val.includes('بازرگان') ||
    val.includes('دکان') ||
    val.includes('اموال') ||
    val.includes('رهنما')
  ) {
    return 'corporate';
  }
  if (
    val === 'education' ||
    val === 'student_academic' ||
    val.includes('دانش') ||
    val.includes('آموزش') ||
    val.includes('پوهنتون') ||
    val.includes('مکتب') ||
    val.includes('محصل') ||
    val.includes('متعلم') ||
    val.includes('استاد') ||
    val.includes('معلم')
  ) {
    return 'education';
  }

  return 'general';
}

/**
 * Finds a job template by ID, falling back to 'general' if not found.
 */
export function getJobTemplate(templateOrJobId?: string): JobTemplate {
  const norm = normalizeTemplateId(templateOrJobId);
  return REFERENCE_TEMPLATES[norm] || REFERENCE_TEMPLATES.general;
}

/**
 * Generates an array of ready-to-save ProfileLinkItem objects populated with the reference template defaults.
 */
export function generateDefaultModulesForJob(templateOrJobId?: string): ProfileLinkItem[] {
  const template = getJobTemplate(templateOrJobId);
  const now = Date.now();

  return template.defaultModules.map((mod, index) => ({
    id: `mod_${now}_${index}_${Math.random().toString(36).substring(2, 7)}`,
    title: mod.title,
    url: mod.url,
    moduleType: mod.moduleType,
    isActive: true,
    isPinned: false,
    order: index,
    clickCount: 0,
    parentId: null,
    metadata: mod.metadata ? JSON.parse(JSON.stringify(mod.metadata)) : {},
    advancedSettings: {
      openInNewTab: true,
      isHidden: false,
      buttonAnimation: 'none',
      isCompactIcon: false,
    },
  }));
}
