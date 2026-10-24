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
import {
  WhatsAppIcon,
  TelegramIcon,
  InstagramIcon,
  LinkedInIcon,
  XTwitterIcon,
  PinterestIcon,
  FacebookIcon,
  DribbbleIcon,
  BehanceIcon,
  YouTubeIcon,
  ClubhouseIcon,
  PatreonIcon,
  TwitchIcon,
  GitHubIcon,
  AparatIcon,
  TikTokIcon,
  AppleMusicIcon,
  YouTubeMusicIcon,
  CastboxIcon,
  RadioJavanIcon,
  SpotifyIcon,
  SoundCloudIcon,
  SkypeIcon,
  WeChatIcon,
  MessengerIcon,
  SignalIcon,
} from '@/components/icons';
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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X as CloseIcon,
} from 'lucide-react';

interface ModuleOption {
  type: LinkModuleType;
  title: string;
  category: 'social' | 'audio' | 'messengers' | 'text' | 'communication' | 'media' | 'commerce' | 'location';
  description: string;
  icon: React.ReactNode;
  badge?: string;
  colorClass: string;
}

const SECTION_3_MODULES: ModuleOption[] = [
  // ۱. شبکه‌های اجتماعی و پلتفرم‌ها (Social)
  {
    type: 'instagram_profile',
    title: 'اینستاگرام',
    category: 'social',
    description: 'اتصال به پیج کاری اینستاگرام و افزایش تعامل و دنبال‌کنندگان',
    icon: <InstagramIcon className="w-5 h-5 text-pink-500 fill-current" />,
    badge: 'محبوب',
    colorClass: 'hover:border-pink-500/50',
  },
  {
    type: 'twitter_x',
    title: 'X (توییتر)',
    category: 'social',
    description: 'هدایت به اکانت رسمی با دیپ‌لینک هوشمند اپلیکیشن X',
    icon: <XTwitterIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100 fill-current" />,
    colorClass: 'hover:border-zinc-500/50',
  },
  {
    type: 'linkedin_profile',
    title: 'لینکدین',
    category: 'social',
    description: 'معرفی سوابق کاری و ارتباط شبکه‌ای حرفه‌ای در لینکدین',
    icon: <LinkedInIcon className="w-5 h-5 text-sky-600 fill-current" />,
    colorClass: 'hover:border-sky-500/50',
  },
  {
    type: 'youtube_channel',
    title: 'کانال یوتیوب',
    category: 'social',
    description: 'عضویت و بازگشایی کانال در اپلیکیشن یوتیوب',
    icon: <YouTubeIcon className="w-5 h-5 text-red-600 fill-current" />,
    badge: 'محبوب',
    colorClass: 'hover:border-red-500/50',
  },
  {
    type: 'aparat_channel',
    title: 'کانال آپارات',
    category: 'social',
    description: 'دنبال‌کردن کانال رسمی در پلتفرم آپارات',
    icon: <AparatIcon className="w-5 h-5 text-rose-500 fill-current" />,
    colorClass: 'hover:border-rose-500/50',
  },
  {
    type: 'tiktok',
    title: 'تیک‌تاک (TikTok)',
    category: 'social',
    description: 'اتصال سریع به حساب تیک‌تاک با دیپ‌لینک مستقیم',
    icon: <TikTokIcon className="w-5 h-5 text-black dark:text-white fill-current" />,
    colorClass: 'hover:border-pink-500/50',
  },
  {
    type: 'facebook',
    title: 'فیس‌بوک',
    category: 'social',
    description: 'پروفایل یا صفحه کاری با دیپ‌لینک اپ فیس‌بوک',
    icon: <FacebookIcon className="w-5 h-5 text-blue-600 fill-current" />,
    colorClass: 'hover:border-blue-500/50',
  },
  {
    type: 'pinterest',
    title: 'پینترست (Pinterest)',
    category: 'social',
    description: 'مشاهده بوردها و ایده‌ها در اپلیکیشن پینترست',
    icon: <PinterestIcon className="w-5 h-5 text-red-600 fill-current" />,
    colorClass: 'hover:border-red-500/50',
  },
  {
    type: 'github',
    title: 'گیت‌هاب (GitHub)',
    category: 'social',
    description: 'نمایش پروژه‌ها و مخازن کدنویسی توسعه‌دهنده',
    icon: <GitHubIcon className="w-5 h-5 text-slate-900 dark:text-slate-100 fill-current" />,
    colorClass: 'hover:border-slate-500/50',
  },
  {
    type: 'dribbble',
    title: 'دریبل (Dribbble)',
    category: 'social',
    description: 'پورتفولیو و شات‌های دیزاین UI/UX طراحان',
    icon: <DribbbleIcon className="w-5 h-5 text-pink-500 fill-current" />,
    colorClass: 'hover:border-pink-500/50',
  },
  {
    type: 'behance',
    title: 'بیهنس (Behance)',
    category: 'social',
    description: 'پروژه‌های کامل گرافیک، برندینگ و موشن‌گرافیک',
    icon: <BehanceIcon className="w-5 h-5 text-blue-500 fill-current" />,
    colorClass: 'hover:border-blue-500/50',
  },
  {
    type: 'twitch',
    title: 'توییچ (Twitch)',
    category: 'social',
    description: 'استریم زنده بازی و برنامه‌های آنلاین گیمینگ',
    icon: <TwitchIcon className="w-5 h-5 text-purple-600 fill-current" />,
    colorClass: 'hover:border-purple-500/50',
  },
  {
    type: 'clubhouse',
    title: 'کلاب‌هاوس (Clubhouse)',
    category: 'social',
    description: 'پروفایل کلاب‌هاوس جهت شرکت در اتاق‌های گفتگو صوتی',
    icon: <ClubhouseIcon className="w-5 h-5 text-amber-500 fill-current" />,
    colorClass: 'hover:border-amber-500/50',
  },
  {
    type: 'patreon',
    title: 'پاترئون (Patreon)',
    category: 'social',
    description: 'صفحه عضویت ویژه و حمایت ماهانه از تولیدکنندگان محتوا',
    icon: <PatreonIcon className="w-5 h-5 text-orange-500 fill-current" />,
    colorClass: 'hover:border-orange-500/50',
  },

  // ۲. پیام‌رسان‌های مستقیم (Messengers)
  {
    type: 'whatsapp_direct',
    title: 'واتساپ (WhatsApp)',
    category: 'messengers',
    description: 'چت آنی در واتساپ با پیام پیش‌فرض بدون ذخیره شماره',
    icon: <WhatsAppIcon className="w-5 h-5 text-emerald-500 fill-current" />,
    badge: 'محبوب',
    colorClass: 'hover:border-emerald-500/50',
  },
  {
    type: 'telegram_channel',
    title: 'تلگرام (Telegram)',
    category: 'messengers',
    description: 'هدایت مستقیم به چت خصوصی، کانال یا گروه تلگرام',
    icon: <TelegramIcon className="w-5 h-5 text-sky-500 fill-current" />,
    badge: 'محبوب',
    colorClass: 'hover:border-sky-500/50',
  },
  {
    type: 'messenger',
    title: 'مسنجر (Messenger)',
    category: 'messengers',
    description: 'گفتگوی فوری در فیس‌بوک مسنجر با دیپ‌لینک مستقیم',
    icon: <MessengerIcon className="w-5 h-5 text-blue-500 fill-current" />,
    colorClass: 'hover:border-blue-500/50',
  },
  {
    type: 'signal',
    title: 'سیگنال (Signal)',
    category: 'messengers',
    description: 'چت امن و رمزگذاری‌شده در پیام‌رسان سیگنال',
    icon: <SignalIcon className="w-5 h-5 text-blue-600 fill-current" />,
    colorClass: 'hover:border-blue-500/50',
  },
  {
    type: 'skype',
    title: 'اسکایپ (Skype)',
    category: 'messengers',
    description: 'برقراری تماس کاری و چت از طریق دیپ‌لینک اسکایپ',
    icon: <SkypeIcon className="w-5 h-5 text-sky-500 fill-current" />,
    colorClass: 'hover:border-sky-500/50',
  },
  {
    type: 'wechat',
    title: 'وی‌چت (WeChat)',
    category: 'messengers',
    description: 'اتصال به وی‌چت برای مراودات تجاری بین‌المللی',
    icon: <WeChatIcon className="w-5 h-5 text-green-500 fill-current" />,
    colorClass: 'hover:border-green-500/50',
  },

  // ۳. پلتفرم‌های صوتی و پادکست (Audio)
  {
    type: 'spotify',
    title: 'اسپاتیفای (Spotify)',
    category: 'audio',
    description: 'پروفایل هنرمند، آلبوم یا پلی‌لیست اختصاصی اسپاتیفای',
    icon: <SpotifyIcon className="w-5 h-5 text-emerald-500 fill-current" />,
    badge: 'محبوب',
    colorClass: 'hover:border-emerald-500/50',
  },
  {
    type: 'apple_music',
    title: 'اپل موزیک (Apple Music)',
    category: 'audio',
    description: 'آهنگ‌ها و آلبوم‌های منتشر شده در اکوسیستم اپل',
    icon: <AppleMusicIcon className="w-5 h-5 text-rose-500 fill-current" />,
    colorClass: 'hover:border-rose-500/50',
  },
  {
    type: 'youtube_music',
    title: 'یوتیوب موزیک (YouTube Music)',
    category: 'audio',
    description: 'پلی‌لیست و ترک‌های موسیقی در YouTube Music',
    icon: <YouTubeMusicIcon className="w-5 h-5 text-red-500 fill-current" />,
    colorClass: 'hover:border-red-500/50',
  },
  {
    type: 'soundcloud',
    title: 'ساوندکلاود (SoundCloud)',
    category: 'audio',
    description: 'پخش آنلاین موزیک و پادکست در ساوندکلاود',
    icon: <SoundCloudIcon className="w-5 h-5 text-amber-500 fill-current" />,
    colorClass: 'hover:border-amber-500/50',
  },
  {
    type: 'castbox',
    title: 'کست‌باکس (Castbox)',
    category: 'audio',
    description: 'کانال پادکست و اپیزودها در محبوب‌ترین اپ پادکست',
    icon: <CastboxIcon className="w-5 h-5 text-orange-500 fill-current" />,
    colorClass: 'hover:border-orange-500/50',
  },
  {
    type: 'radio_javan',
    title: 'رادیو جوان (Radio Javan)',
    category: 'audio',
    description: 'پادکست‌ها، میکس‌ها و موزیک‌های رادیو جوان',
    icon: <RadioJavanIcon className="w-5 h-5 text-amber-400 fill-current" />,
    colorClass: 'hover:border-amber-400/50',
  },
  {
    type: 'spotify_podcaster',
    title: 'اسپاتیفای پادکستر (Anchor)',
    category: 'audio',
    description: 'صفحه رسمی پادکست در پلتفرم پادکستر اسپاتیفای',
    icon: <SpotifyIcon className="w-5 h-5 text-purple-500 fill-current" />,
    colorClass: 'hover:border-purple-500/50',
  },

  // ۴. تماس و ارتباط (Communication)
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
    type: 'contact_form',
    title: 'فرم تماس و پیام',
    category: 'communication',
    description: 'دریافت مشخصات و پیام مستقیم بازدیدکنندگان در بخش پیام‌ها',
    icon: <Mail className="w-5 h-5 text-amber-500" />,
    badge: 'کاربردی',
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

  // ۵. رسانه و فایل (Media)
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
    title: 'پخش ویدیو یوتیوب',
    category: 'media',
    description: 'پخش مستقیم ویدیوهای یوتیوب بدون خروج از کارت دیجیتال',
    icon: <Youtube className="w-5 h-5 text-red-500" />,
    colorClass: 'hover:border-red-500/50',
  },
  {
    type: 'aparat_embed',
    title: 'پخش ویدیو آپارات',
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

  // ۶. تجاری و فروش (Commerce)
  {
    type: 'standard_link',
    title: 'لینک استاندارد (با دریافت هزینه)',
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

  // ۷. موقعیت‌یابی (Location)
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

  // ۸. متنی و چیدمان (Text)
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
];

const CATEGORIES: {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { id: 'all', title: 'همه ماژول‌ها', description: 'مشاهده کل کاتالوگ ماژول‌ها', icon: Layers, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10' },
  { id: 'social', title: 'شبکه‌های اجتماعی', description: 'اینستاگرام، لینکدین، یوتیوب، توییتر، تیک‌تاک...', icon: Instagram, color: 'text-pink-600 dark:text-pink-400 bg-pink-500/10' },
  { id: 'messengers', title: 'پیام‌رسان‌ها', description: 'واتساپ، تلگرام، بله، ایتا، روبیکا، سیگنال...', icon: Send, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
  { id: 'communication', title: 'تماس و ارتباط', description: 'تماس مستقیم، ایمیل، پیامک، فرم تماس...', icon: Phone, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10' },
  { id: 'audio', title: 'صدا و پادکست', description: 'اسپاتیفای، کست‌باکس، ساندکلاد، رادیوجوان...', icon: Music, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  { id: 'commerce', title: 'فروش و درگاه مالی', description: 'شماره کارت، شبا، درگاه پرداخت، کاتالوگ و منو...', icon: ShoppingBag, color: 'text-green-600 dark:text-green-400 bg-green-500/10' },
  { id: 'media', title: 'رسانه و تصویر', description: 'ویدیو، کانال آپارات، تیزر، گالری تصاویر...', icon: Video, color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  { id: 'location', title: 'آدرس و نقشه', description: 'لوکیشن گوگل، نشان، بلد، ویز، مسیریابی...', icon: MapPin, color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10' },
  { id: 'text', title: 'متن و چیدمان', description: 'توضیحات متنی، تیتر، خط جداکننده، FAQ...', icon: Type, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10' },
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
  const [mobileView, setMobileView] = useState<'categories' | 'modules'>('categories');

  React.useEffect(() => {
    if (open) {
      setMobileView('categories');
      setSearchQuery('');
    }
  }, [open]);

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

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full h-[100dvh] max-h-none md:max-w-5xl md:h-[85vh] md:max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-slate-100 border-0 md:border md:border-slate-200/80 md:dark:border-slate-800/80 font-sans shadow-2xl rounded-none md:rounded-3xl [&>button]:left-4 [&>button]:right-auto"
        overlayClassName="backdrop-blur-md bg-black/60"
        dir="rtl"
      >
        {/* ===================== DESKTOP VIEW (md:flex) ===================== */}
        <div className="hidden md:flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
            <div>
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>کاتالوگ ماژول‌های هوشمند آریا لینک</span>
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                افزودن ماژول محتوایی به کارت دیجیتال
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ماژول مورد نظر خود را از دسته‌بندی‌های سمت راست انتخاب فرمایید تا فوراً به کارت اضافه شود.
              </DialogDescription>
            </div>

            {/* Desktop Search Bar */}
            <div className="relative w-80 shrink-0 ml-8">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بین تمام ماژول‌ها..."
                className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder:font-sans placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Desktop Body: Right Sidebar + Left Module Grid */}
          <div className="flex flex-1 overflow-hidden">
            {/* RIGHT SIDEBAR: Categories */}
            <div className="w-64 lg:w-72 border-l border-slate-200 dark:border-slate-800 p-3 space-y-1 overflow-y-auto custom-scrollbar bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                دسته‌بندی‌های ماژول
              </div>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = SECTION_3_MODULES.filter((m) => cat.id === 'all' || m.category === cat.id).length;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-right p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2.5 group ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isActive
                            ? 'bg-slate-950/15 text-slate-950'
                            : `${cat.color}`
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{cat.title}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* LEFT MAIN AREA: Module Grid */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/20 dark:bg-slate-950/30">
              <div className="px-5 py-3 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {searchQuery ? `نتایج جستجو برای "${searchQuery}"` : activeCategoryObj.title}
                </span>
                <span>{filteredModules.length} ماژول آماده انتخاب</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {filteredModules.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    ماژولی با عبارت جستجو شده پیدا نشد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredModules.map((module) => (
                      <button
                        key={module.type}
                        type="button"
                        onClick={() => handleSelectModule(module.type)}
                        className={`text-right p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 flex items-start gap-3 group hover:scale-[1.01] active:scale-[0.99] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm hover:shadow-md ${module.colorClass}`}
                      >
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                          {module.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
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
            </div>
          </div>
        </div>

        {/* ===================== MOBILE FULL-SCREEN VIEW (md:hidden) ===================== */}
        <div className="flex md:hidden flex-col h-full overflow-hidden">
          {/* STEP 1: MOBILE CATEGORIES LIST */}
          {mobileView === 'categories' && !searchQuery && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Mobile Category Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">افزودن ماژول جدید</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">یک دسته‌بندی را انتخاب کنید</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Bar */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو بین تمام ماژول‌ها..."
                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Categories Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-950">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const count = SECTION_3_MODULES.filter((m) => cat.id === 'all' || m.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setMobileView('modules');
                      }}
                      className="w-full text-right p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3.5 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <div className={`p-2.5 rounded-xl ${cat.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{cat.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {count} ماژول
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{cat.description}</p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: MOBILE MODULES OF SELECTED CATEGORY (OR SEARCH) */}
          {(mobileView === 'modules' || searchQuery) && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Back Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMobileView('categories');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>بازگشت</span>
                </button>

                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                  {searchQuery ? 'نتایج جستجو' : activeCategoryObj.title}
                </span>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Bar inside modules view */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در این بخش..."
                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Modules List for Mobile */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50 dark:bg-slate-950">
                {filteredModules.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    ماژولی پیدا نشد.
                  </div>
                ) : (
                  filteredModules.map((module) => (
                    <button
                      key={module.type}
                      type="button"
                      onClick={() => handleSelectModule(module.type)}
                      className={`w-full text-right p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all flex items-start gap-3 bg-white dark:bg-slate-900 shadow-sm active:scale-[0.98] ${module.colorClass}`}
                    >
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                        {module.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {module.title}
                          </span>
                          {module.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                              {module.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleSelectorModal;
