'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEditorStore } from '@/store/editor-store';
import { LinkModuleType } from '@/types/profile.types';
import { WhatsAppIcon } from '@/components/icons';
import {
  Instagram,
  Linkedin,
  Send,
  Users,
  MapPin,
  FileText,
  Link2,
  Youtube,
  Image as ImageIcon,
  CreditCard,
  Search,
  Sparkles,
  Phone,
  Mail,
  HelpCircle,
  Music,
  ShoppingBag,
  HeartHandshake,
  Timer,
  Type,
  Minus,
  Navigation,
  Video,
  Layers,
  Sliders,
  DollarSign,
} from 'lucide-react';

interface ModuleOption {
  type: LinkModuleType;
  title: string;
  category: 'text' | 'communication' | 'media' | 'commerce' | 'location';
  description: string;
  icon: React.ReactNode;
  badge?: string;
  colorClass: string;
}

const SECTION_3_MODULES: ModuleOption[] = [
  // ۱. متنی
  {
    type: 'simple_text',
    title: 'متن و توضیحات',
    category: 'text',
    description: 'درج پاراگراف، شرح رزومه، بیوگرافی تفصیلی یا معرفی خدمات',
    icon: <Type className="w-5 h-5 text-indigo-500" />,
    colorClass: 'hover:border-indigo-500/50',
  },
  {
    type: 'divider_heading',
    title: 'عنوان و تیتر بخش',
    category: 'text',
    description: 'تیتر موضوعی برای تفکیک بخش‌های مختلف صفحه پروفایل',
    icon: <Minus className="w-5 h-5 text-slate-500" />,
    colorClass: 'hover:border-slate-500/50',
  },
  {
    type: 'spacer_divider',
    title: 'جداکننده و فاصله‌گذار',
    category: 'text',
    description: 'ایجاد فضای تنفس و فاصله عمودی متغیر بین ماژول‌ها',
    icon: <Layers className="w-5 h-5 text-zinc-500" />,
    colorClass: 'hover:border-zinc-500/50',
  },
  {
    type: 'faq_accordion',
    title: 'پرسش و پاسخ',
    category: 'text',
    description: 'سوالات متداول مشتریان در قالب آکاردئونی بازشونده و تعاملی',
    icon: <HelpCircle className="w-5 h-5 text-purple-500" />,
    colorClass: 'hover:border-purple-500/50',
  },

  // ۲. ارتباطی
  {
    type: 'phone_call',
    title: 'دکمه تماس (تلفن)',
    category: 'communication',
    description: 'برقراری تماس صوتی تنها با یک کلیک',
    icon: <Phone className="w-5 h-5 text-green-500" />,
    colorClass: 'hover:border-green-500/50',
  },
  {
    type: 'email_direct',
    title: 'ارسال ایمیل',
    category: 'communication',
    description: 'ارسال ایمیل کاری مستقیم با موضوع و آدرس از پیش تنظیم‌شده',
    icon: <Mail className="w-5 h-5 text-amber-500" />,
    colorClass: 'hover:border-amber-500/50',
  },
  {
    type: 'whatsapp_direct',
    title: 'واتساپ',
    category: 'communication',
    description: 'چت آنی در واتساپ همراه با پیام پیش‌فرض بدون ذخیره شماره',
    icon: <WhatsAppIcon className="w-5 h-5 text-emerald-500 fill-current" />,
    badge: 'محبوب',
    colorClass: 'hover:border-emerald-500/50',
  },
  {
    type: 'telegram_channel',
    title: 'کانال یا پیام تلگرام',
    category: 'communication',
    description: 'هدایت مستقیم به کانال، گروه یا حساب کاربری تلگرام',
    icon: <Send className="w-5 h-5 text-sky-500" />,
    colorClass: 'hover:border-sky-500/50',
  },
  {
    type: 'instagram_profile',
    title: 'پیج اینستاگرام',
    category: 'communication',
    description: 'اتصال به پیج کاری اینستاگرام و افزایش تعامل و دنبال‌کنندگان',
    icon: <Instagram className="w-5 h-5 text-pink-500" />,
    colorClass: 'hover:border-pink-500/50',
  },
  {
    type: 'linkedin_profile',
    title: 'پروفایل لینکدین',
    category: 'communication',
    description: 'معرفی سوابق کاری و ارتباط شبکه‌ای حرفه‌ای در لینکدین',
    icon: <Linkedin className="w-5 h-5 text-blue-500" />,
    colorClass: 'hover:border-blue-500/50',
  },
  {
    type: 'contact_form',
    title: 'فرم تماس',
    category: 'communication',
    description: 'دریافت مشخصات و پیام مستقیم بازدیدکنندگان در بخش پیام‌ها',
    icon: <Mail className="w-5 h-5 text-amber-500" />,
    badge: 'محبوب',
    colorClass: 'hover:border-amber-500/50',
  },
  {
    type: 'video_meeting',
    title: 'تماس تصویری و جلسه آنلاین',
    category: 'communication',
    description: 'لینک ورود مستقیم به جلسه گوگل میت (Google Meet) یا Zoom',
    icon: <Video className="w-5 h-5 text-teal-500" />,
    colorClass: 'hover:border-teal-500/50',
  },

  // ۳. رسانه و فایل
  {
    type: 'single_image',
    title: 'تصویر تکی',
    category: 'media',
    description: 'نمایش پوستر، بنر تبلیغاتی یا عکس برگزیده با قابلیت کلیک',
    icon: <ImageIcon className="w-5 h-5 text-blue-500" />,
    colorClass: 'hover:border-blue-500/50',
  },
  {
    type: 'image_gallery',
    title: 'گالری تصاویر',
    category: 'media',
    description: 'شبکه عکس برای محصولات، نمونه کارها یا محیط شرکت',
    icon: <Sparkles className="w-5 h-5 text-violet-500" />,
    colorClass: 'hover:border-violet-500/50',
  },
  {
    type: 'image_slider',
    title: 'اسلایدر متحرک تصاویر',
    category: 'media',
    description: 'اسلایدر عکس‌های متحرک جهت نمایش آلبوم مدرن',
    icon: <Sliders className="w-5 h-5 text-cyan-500" />,
    colorClass: 'hover:border-cyan-500/50',
  },
  {
    type: 'youtube_embed',
    title: 'ویدیو یوتیوب',
    category: 'media',
    description: 'پخش مستقیم ویدیوهای یوتیوب بدون خروج از کارت دیجیتال',
    icon: <Youtube className="w-5 h-5 text-red-500" />,
    colorClass: 'hover:border-red-500/50',
  },
  {
    type: 'aparat_embed',
    title: 'ویدیو آپارات',
    category: 'media',
    description: 'پخش مستقیم ویدیوهای آپارات درون کارت هوشمند',
    icon: <Youtube className="w-5 h-5 text-rose-500" />,
    colorClass: 'hover:border-rose-500/50',
  },
  {
    type: 'music_player',
    title: 'موسیقی و پادکست',
    category: 'media',
    description: 'پخش استریم موسیقی یا پادکست از Spotify، SoundCloud یا فایل صوتی',
    icon: <Music className="w-5 h-5 text-emerald-500" />,
    colorClass: 'hover:border-emerald-500/50',
  },
  {
    type: 'pdf_catalog',
    title: 'کاتالوگ و فایل PDF',
    category: 'media',
    description: 'دانلود مستقیم منوی رستوران، لیست قیمت‌ها یا رزومه کاری',
    icon: <FileText className="w-5 h-5 text-rose-500" />,
    colorClass: 'hover:border-rose-500/50',
  },

  // ۴. تجاری و فروش
  {
    type: 'standard_link',
    title: 'لینک استاندارد (با قابلیت دریافت هزینه)',
    category: 'commerce',
    description: 'دکمه لینک وب‌سایت با امکان قفل‌گذاری پولی و تعیین زمان‌بندی',
    icon: <Link2 className="w-5 h-5 text-cyan-500" />,
    colorClass: 'hover:border-cyan-500/50',
  },
  {
    type: 'profile_search',
    title: 'جستجو در پروفایل',
    category: 'commerce',
    description: 'نوار سرچ زنده در صفحه پروفایل برای پیدا کردن سریع لینک‌ها',
    icon: <Search className="w-5 h-5 text-indigo-500" />,
    colorClass: 'hover:border-indigo-500/50',
  },
  {
    type: 'product_card',
    title: 'نمایش و فروش محصول',
    category: 'commerce',
    description: 'کارت کالا شامل عکس، قیمت (افغانی/دلار) و دکمه خرید سریع',
    icon: <ShoppingBag className="w-5 h-5 text-teal-500" />,
    badge: 'فروشگاهی',
    colorClass: 'hover:border-teal-500/50',
  },
  {
    type: 'sale_checkout',
    title: 'لینک فروش و پرداخت مستقیم',
    category: 'commerce',
    description: 'دکمه تسویه‌حساب و پرداخت فوری مبلغ خدمات از طریق درگاه',
    icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
    badge: 'درگاه آنلاین',
    colorClass: 'hover:border-emerald-500/50',
  },
  {
    type: 'donation_hesabpay',
    title: 'حمایت مالی و انعام',
    category: 'commerce',
    description: 'دریافت کمک مالی، انعام یا هدیه با درگاه حساب‌پی در افغانستان',
    icon: <HeartHandshake className="w-5 h-5 text-rose-500" />,
    badge: 'بومی افغان',
    colorClass: 'hover:border-rose-500/50',
  },
  {
    type: 'countdown_timer',
    title: 'شمارشگر معکوس',
    category: 'commerce',
    description: 'تایمر معکوس برای پایان تخفیف‌ها، افتتاحیه یا شروع رویداد',
    icon: <Timer className="w-5 h-5 text-amber-500" />,
    colorClass: 'hover:border-amber-500/50',
  },

  // ۵. موقعیت‌یابی
  {
    type: 'location_hours',
    title: 'نقشه و آدرس',
    category: 'location',
    description: 'نمایش موقعیت مکانی دفتر، کلینیک، رستوران و ساعات کاری',
    icon: <MapPin className="w-5 h-5 text-rose-500" />,
    colorClass: 'hover:border-rose-500/50',
  },
  {
    type: 'map_navigation',
    title: 'دکمه مسیریابی',
    category: 'location',
    description: 'شروع مستقیم مسیریابی رانندگی در نقشه‌ها',
    icon: <Navigation className="w-5 h-5 text-sky-500" />,
    colorClass: 'hover:border-sky-500/50',
  },
];

interface ModuleSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ModuleSelectorModal: React.FC<ModuleSelectorModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { addModule } = useEditorStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectModule = (type: LinkModuleType) => {
    addModule(type);
    onOpenChange(false);
  };

  const filteredModules = SECTION_3_MODULES.filter((mod) => {
    const matchesCategory = activeCategory === 'all' || mod.category === activeCategory;
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 font-sans shadow-2xl transition-colors duration-200" dir="rtl">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800 text-right bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>کاتالوگ ماژول‌های آریا لینک</span>
          </div>
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
            افزودن ماژول محتوایی به کارت
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            ماژول مورد نظر خود را از دسته‌بندی‌های زیر انتخاب فرمایید تا فوراً به کارت اضافه شود.
          </DialogDescription>

          {/* Search Input */}
          <div className="relative mt-3">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بین ماژول‌ها (تماس، واتساپ، ویدیو، محصول، حساب‌پی، نقشه...)"
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder:font-sans placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'all', title: 'همه ماژول‌ها' },
              { id: 'text', title: 'متنی و چیدمان' },
              { id: 'communication', title: 'ارتباطی و فرم‌ها' },
              { id: 'media', title: 'رسانه و فایل' },
              { id: 'commerce', title: 'تجاری و فروش' },
              { id: 'location', title: 'موقعیت‌یابی' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${activeCategory === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                  }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Modules Grid */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/40">
          {filteredModules.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-sans">
              ماژولی با عبارت جستجو شده پیدا نشد.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredModules.map((module) => (
                <button
                  key={module.type}
                  type="button"
                  onClick={() => handleSelectModule(module.type)}
                  className={`text-right p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 flex items-start gap-3.5 group hover:scale-[1.01] active:scale-[0.99] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm hover:shadow-md ${module.colorClass}`}
                >
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                    {module.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {module.title}
                      </span>
                      {module.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                          {module.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {module.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleSelectorModal;
