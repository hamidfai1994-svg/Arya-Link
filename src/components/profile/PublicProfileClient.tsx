'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ProfileLinkItem, LinkModuleType, ProfileThemeConfig } from '@/types/profile.types';
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
import { getSmartLink, formatDisplayValue } from '@/lib/smart-link';
import { LiveCountdown } from '@/components/ui/live-countdown';
import {
  Download,
  Phone,
  Mail,
  BadgeCheck,
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  ExternalLink,
  FileText,
  Youtube,
  HelpCircle,
  ShoppingBag,
  CreditCard,
  Search,
  Share2,
  User,
  Copy,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Linkedin,
  Video,
  Loader2,
  Lock,
  Layers,
  Sparkles,
  Timer,
  QrCode,
} from 'lucide-react';
import { toast } from 'sonner';

interface PublicProfileClientProps {
  profile: {
    id: string;
    alias: string;
    displayName: string;
    headline?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    headerLayout?: 'curve' | 'gradient_mask' | 'minimal';
    phone?: string;
    whatsapp?: string;
    email?: string;
    location?: string;
    directModeEnabled?: boolean;
    directModeUrl?: string;
    themeConfig?: ProfileThemeConfig;
    links: ProfileLinkItem[];
    profileType?: 'personal' | 'business';
    isVerified?: boolean;
    verificationStatus?: string;
    profileLanguage?: string;
    hideBranding?: boolean;
    passwordProtection?: {
      enabled: boolean;
      password?: string;
      hint?: string;
    };
    noIndex?: boolean;
  };
}

// Framer Motion Staggered Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const PublicProfileClient: React.FC<PublicProfileClientProps> = ({ profile }) => {
  const themeConfig = profile.themeConfig || {
    preset: 'dark_neon',
    primaryColor: '#0ea5e9',
    accentColor: '#06b6d4',
    cardBlur: 'backdrop-blur-md bg-white/10 border-white/20',
    backgroundColor: '',
    textColor: '#ffffff',
    borderRadius: 'rounded-2xl',
  };

  const isLight = themeConfig.preset === 'minimal_light';
  const isLtr = profile.profileLanguage === 'en';
  const isPashto = profile.profileLanguage === 'pashto';
  const isVerifiedApproved = Boolean(profile.isVerified && profile.verificationStatus === 'verified');

  // Live URL for QR Code and sharing
  const [currentUrl, setCurrentUrl] = useState(`https://aryal.ink/${profile.alias}`);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [profile.alias]);

  // Password Protection Gate State
  const isProtected = Boolean(profile.passwordProtection?.enabled && profile.passwordProtection?.password);
  const [isUnlocked, setIsUnlocked] = useState(!isProtected);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === profile.passwordProtection?.password?.trim()) {
      setIsUnlocked(true);
      setPasswordError(false);
      toast.success('رمز عبور صحیح است. به کارت خوش آمدید!');
    } else {
      setPasswordError(true);
      toast.error('رمز عبور وارد شده نادرست است!');
    }
  };

  // Button Animation Class Generator
  const getButtonAnimationClass = (anim?: string) => {
    switch (anim) {
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      case 'shake':
        return 'animate-shake';
      case 'glow':
        return 'shadow-[0_0_18px_rgba(6,182,212,0.65)] ring-2 ring-cyan-400/60 animate-pulse';
      default:
        return '';
    }
  };

  // Uniform rounded border styling (defaults to rounded-2xl)
  const getBorderRadiusClass = (customRadius?: string) => {
    const r = customRadius || themeConfig.borderRadius || 'rounded-2xl';
    switch (r) {
      case 'rounded-none':
        return 'rounded-none';
      case 'rounded-md':
        return 'rounded-md';
      case 'rounded-lg':
        return 'rounded-xl';
      case 'rounded-full':
        return 'rounded-full';
      default:
        return 'rounded-2xl';
    }
  };

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Social networks filter (excluding hidden)
  const socialModuleTypes: LinkModuleType[] = [
    'whatsapp_direct',
    'telegram_channel',
    'instagram_profile',
    'linkedin_profile',
    'twitter_x',
    'pinterest',
    'facebook',
    'dribbble',
    'behance',
    'youtube_channel',
    'clubhouse',
    'patreon',
    'twitch',
    'github',
    'aparat_channel',
    'tiktok',
    'apple_music',
    'youtube_music',
    'castbox',
    'radio_javan',
    'spotify_podcaster',
    'spotify',
    'soundcloud',
    'skype',
    'wechat',
    'messenger',
    'signal',
  ];

  const socialLinks = (profile.links || []).filter(
    (l) => l.isActive && !l.advancedSettings?.isHidden && socialModuleTypes.includes(l.moduleType)
  );

  const nonSocialLinks = (profile.links || []).filter(
    (l) => l.isActive && !l.advancedSettings?.isHidden && !socialModuleTypes.includes(l.moduleType)
  );

  const filteredNonSocialLinks = nonSocialLinks.filter((l) => {
    return searchFilter ? l.title.toLowerCase().includes(searchFilter.toLowerCase()) : true;
  });

  const hasWhatsAppLink = socialLinks.some((l) => l.moduleType === 'whatsapp_direct');
  const hasPhoneLink = (profile.links || []).some((l) => l.moduleType === 'phone_call');
  const hasAnySocial =
    socialLinks.length > 0 ||
    Boolean(profile.whatsapp) ||
    Boolean(profile.email) ||
    Boolean(profile.phone);

  // 2. vCard Generator (.vcf)
  const handleDownloadVCard = () => {
    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN;CHARSET=UTF-8:${profile.displayName || ''}`,
      `N;CHARSET=UTF-8:${profile.displayName || ''};;;;`,
      profile.headline ? `TITLE;CHARSET=UTF-8:${profile.headline}` : '',
      profile.bio ? `NOTE;CHARSET=UTF-8:${profile.bio.replace(/\n/g, '\\n')}` : '',
      profile.phone ? `TEL;TYPE=CELL,VOICE:${profile.phone}` : '',
      profile.whatsapp && profile.whatsapp !== profile.phone
        ? `TEL;TYPE=WORK,VOICE:${profile.whatsapp}`
        : '',
      profile.email ? `EMAIL;TYPE=INTERNET,WORK:${profile.email}` : '',
      `URL;TYPE=WORK:https://aryal.ink/${profile.alias}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    const blob = new Blob([vCardLines], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.alias || 'contact'}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('مخاطب آماده ذخیره در گوشی شما است.');
  };

  // 3. Share Card Link
  const handleShare = async () => {
    const fullUrl = typeof window !== 'undefined' ? window.location.href : `https://aryal.ink/${profile.alias}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.displayName,
          text: profile.headline || profile.bio,
          url: fullUrl,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(fullUrl);
      toast.success('لینک کارت هوشمند در کلیپ‌بورد کپی شد.');
    }
  };

  // 3.5. Copy Link
  const handleCopyLink = () => {
    const fullUrl = typeof window !== 'undefined' ? window.location.href : `https://aryal.ink/${profile.alias}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      toast.success('لینک کارت هوشمند در کلیپ‌بورد کپی شد.');
    }
  };

  // 4. Contact Form Submit
  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) {
      toast.error('لطفاً فیلدهای ضروری نام، شماره تماس و متن پیام را تکمیل فرمایید.');
      return;
    }

    setIsSubmittingForm(true);
    try {
      const res = await fetch('/api/lead/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileAlias: profile.alias,
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim(),
          message: formMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSubmitted(true);
        toast.success('پیام شما با موفقیت ارسال شد و به اطلاع صاحب کارت خواهد رسید.');
      } else {
        toast.error(data.message || 'خطا در ثبت پیام');
      }
    } catch (err) {
      toast.error('خطای شبکه در برقراری ارتباط');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // 5. Render Social Icon (Unified 12x12 rounded-2xl with hover glow)
  const renderSocialIcon = (link: ProfileLinkItem) => {
    const rawVal =
      link.url ||
      (link.metadata?.phoneNumber as string) ||
      (link.metadata?.channelUsername as string) ||
      (link.metadata?.instagramUsername as string) ||
      (link.metadata?.linkedinUsername as string) ||
      (link.metadata?.targetId as string) ||
      '';
    const smartUrl = getSmartLink(link.moduleType, rawVal);
    const animClass = getButtonAnimationClass(link.advancedSettings?.buttonAnimation);

    switch (link.moduleType) {
      case 'whatsapp_direct':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'واتساپ'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(16,185,129,0.4)]`}
          >
            <WhatsAppIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'telegram_channel':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'کانال یا حساب تلگرام'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(14,165,233,0.4)]`}
          >
            <TelegramIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'instagram_profile':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'صفحه اینستاگرام'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(236,72,153,0.4)]`}
          >
            <InstagramIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'linkedin_profile':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'پروفایل لینکدین'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/30 text-blue-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(59,130,246,0.4)]`}
          >
            <LinkedInIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'twitter_x':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'X (توییتر)'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(255,255,255,0.2)]`}
          >
            <XTwitterIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'pinterest':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'پینترست'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-red-600/15 hover:bg-red-600/25 border border-red-600/30 text-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(239,68,68,0.4)]`}
          >
            <PinterestIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'facebook':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'فیس‌بوک'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/30 text-blue-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(59,130,246,0.4)]`}
          >
            <FacebookIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'dribbble':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'دریبل'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(236,72,153,0.4)]`}
          >
            <DribbbleIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'behance':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'بیهنس'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(59,130,246,0.4)]`}
          >
            <BehanceIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'youtube_channel':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'یوتیوب'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-red-600/15 hover:bg-red-600/25 border border-red-600/30 text-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(239,68,68,0.4)]`}
          >
            <YouTubeIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'clubhouse':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'کلاب‌هاوس'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(245,158,11,0.4)]`}
          >
            <ClubhouseIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'patreon':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'پاترئون'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(249,115,22,0.4)]`}
          >
            <PatreonIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'twitch':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'توییچ'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-purple-600/15 hover:bg-purple-600/25 border border-purple-600/30 text-purple-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(168,85,247,0.4)]`}
          >
            <TwitchIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'github':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'گیت‌هاب'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-zinc-700/20 hover:bg-zinc-700/30 border border-zinc-700/40 text-slate-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(255,255,255,0.2)]`}
          >
            <GitHubIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'aparat_channel':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'آپارات'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(244,63,94,0.4)]`}
          >
            <AparatIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'tiktok':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'تیک‌تاک'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(236,72,153,0.4)]`}
          >
            <TikTokIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'apple_music':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'اپل موزیک'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(244,63,94,0.4)]`}
          >
            <AppleMusicIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'youtube_music':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'یوتیوب موزیک'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-red-600/15 hover:bg-red-600/25 border border-red-600/30 text-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(239,68,68,0.4)]`}
          >
            <YouTubeMusicIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'castbox':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'کست‌باکس'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(249,115,22,0.4)]`}
          >
            <CastboxIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'radio_javan':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'رادیو جوان'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(251,191,36,0.4)]`}
          >
            <RadioJavanIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'spotify_podcaster':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'اسپاتیفای پادکستر'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(168,85,247,0.4)]`}
          >
            <SpotifyIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'spotify':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'اسپاتیفای'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(16,185,129,0.4)]`}
          >
            <SpotifyIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'soundcloud':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'ساوندکلاود'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(245,158,11,0.4)]`}
          >
            <SoundCloudIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'skype':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'اسکایپ'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(14,165,233,0.4)]`}
          >
            <SkypeIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'wechat':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'وی‌چت'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-600/30 text-emerald-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(16,185,129,0.4)]`}
          >
            <WeChatIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'messenger':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'فیس‌بوک مسنجر'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(59,130,246,0.4)]`}
          >
            <MessengerIcon className="w-5 h-5 fill-current" />
          </a>
        );
      case 'signal':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title || 'سیگنال'}
            className={`w-12 h-12 rounded-2xl ${animClass} bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/30 text-blue-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(59,130,246,0.4)]`}
          >
            <SignalIcon className="w-5 h-5 fill-current" />
          </a>
        );
      default:
        return null;
    }
  };

  // 6. Render Module Card
  const renderModuleCard = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};
    const adv = link.advancedSettings || {};
    const customStyle = adv.customStyling;

    const customCardStyle: React.CSSProperties = {};
    if (customStyle?.customBgColor) customCardStyle.backgroundColor = customStyle.customBgColor;
    if (customStyle?.customTextColor) customCardStyle.color = customStyle.customTextColor;

    // 1. Text & Layout modules
    if (link.moduleType === 'simple_text') {
      const alignClass =
        meta.textAlign === 'center'
          ? 'text-center'
          : meta.textAlign === 'left'
            ? 'text-left'
            : 'text-right';

      return (
        <div
          key={link.id}
          className={`w-full p-4 border shadow-sm ${alignClass} ${getBorderRadiusClass(customStyle?.borderRadius)} ${
            isLight ? 'bg-white/90 border-slate-200 text-slate-800' : 'bg-white/[0.05] backdrop-blur-md border-white/10 text-white'
          }`}
          style={customCardStyle}
        >
          {link.title && <h3 className="text-xs font-bold mb-1 opacity-90">{link.title}</h3>}
          <p className="text-xs leading-relaxed opacity-85 whitespace-pre-wrap font-sans">
            {meta.simpleTextContent || ''}
          </p>
        </div>
      );
    }

    if (link.moduleType === 'divider_heading') {
      const style = meta.dividerStyle || 'solid_thin';
      const padding = meta.dividerPadding || 'md';
      const pyClass = padding === 'sm' ? 'py-1' : padding === 'lg' ? 'py-5' : 'py-2.5';

      const getLineClass = () => {
        switch (style) {
          case 'solid_thick':
            return 'border-t-2 border-solid';
          case 'dashed':
            return 'border-t border-dashed';
          case 'dotted':
            return 'border-t-2 border-dotted';
          case 'double':
            return 'border-t-4 border-double';
          case 'solid_thin':
          default:
            return 'border-t border-solid';
        }
      };

      const lineBorderColor = customStyle?.customBorderColor
        ? ''
        : isLight
          ? 'border-slate-300'
          : 'border-white/20';

      const lineStyle: React.CSSProperties = {};
      if (customStyle?.customBorderColor) {
        lineStyle.borderColor = customStyle.customBorderColor;
      }

      return (
        <div key={link.id} className={`w-full ${pyClass}`}>
          <div className={`w-full ${getLineClass()} ${lineBorderColor}`} style={lineStyle} />
        </div>
      );
    }

    if (link.moduleType === 'spacer_divider') {
      const height = meta.spacerHeight || 24;
      return <div key={link.id} style={{ height: `${height}px` }} className="w-full select-none" />;
    }

    // 2. Interactive Search
    if (link.moduleType === 'profile_search') {
      return (
        <div key={link.id} className="relative mb-2">
          <Search className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="جستجو در بین خدمات و لینک‌ها..."
            className={`w-full rounded-2xl pr-10 pl-3.5 py-3 text-xs border focus:outline-none transition-all shadow-sm ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500'
                : 'bg-white/[0.06] backdrop-blur-md border-white/10 text-white placeholder:text-slate-400 focus:border-cyan-400'
            }`}
          />
        </div>
      );
    }

    // 3. YouTube Embed
    if (link.moduleType === 'youtube_embed' && meta.youtubeVideoId) {
      return (
        <div key={link.id} className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-md bg-black">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${meta.youtubeVideoId}`}
              title={link.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          {link.title && (
            <div className={`p-3 text-center text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {link.title}
            </div>
          )}
        </div>
      );
    }

    // 4. Aparat Embed
    if (link.moduleType === 'aparat_embed' && meta.aparatHash) {
      return (
        <div key={link.id} className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-md bg-black">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.aparat.com/video/video/embed/videohash/${meta.aparatHash}/vt/frame`}
              title={link.title}
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          {link.title && (
            <div className={`p-3 text-center text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {link.title}
            </div>
          )}
        </div>
      );
    }

    // 5. PDF Catalog
    if (link.moduleType === 'pdf_catalog') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <a
          key={link.id}
          href={meta.pdfUrl || link.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full p-4 border shadow-sm flex items-center justify-between gap-3 transition-all duration-300 md:hover:scale-[1.02] md:hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] active:scale-[0.99] text-right ${cardRadius} ${
            isLight ? 'bg-white/90 border-slate-200' : 'bg-white/[0.05] backdrop-blur-md border-white/10'
          }`}
          style={customCardStyle}
        >
          <div className={`w-11 h-11 ${cardRadius} bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/30`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block truncate font-sans">
              {meta.pdfDescription || 'مشاهده و دانلود فایل کاتالوگ PDF'}
            </span>
          </div>
          <Download className="w-4 h-4 text-slate-400 shrink-0" />
        </a>
      );
    }

    // 6. Contact Form Module (CRM Lead Capture Form)
    if (link.moduleType === 'contact_form' || link.moduleType === 'lead_capture_form') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-5 border shadow-lg space-y-4 text-right ${cardRadius} ${
            isLight ? 'bg-white/95 border-slate-200' : 'bg-white/[0.05] backdrop-blur-md border-white/10'
          }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
            <Mail className="w-4 h-4 text-amber-400" />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {meta.leadHeadline || link.title || 'ارسال پیام و فرم تماس'}
            </span>
          </div>

          {formSubmitted ? (
            <div className="py-6 text-center space-y-2 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                پیام شما با موفقیت ثبت شد
              </h4>
              <p className="text-[11px] text-slate-300 max-w-xs mx-auto leading-relaxed font-sans">
                اطلاعات شما با موفقیت به صاحب این کارت هوشمند تحویل داده شد و در اسرع وقت با شما تماس خواهند گرفت.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormMessage('');
                }}
                className="text-[11px] font-semibold text-cyan-400 hover:underline pt-2 inline-block cursor-pointer"
              >
                ارسال پیام جدید
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactFormSubmit} className="space-y-3 text-right font-sans">
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  نام و نام خانوادگی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: علی احمدی"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-cyan-500 transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  شماره تماس <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0700 000 000"
                  dir="ltr"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-outfit text-left border focus:outline-none focus:border-cyan-500 transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  ایمیل (اختیاری)
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-outfit text-left border focus:outline-none focus:border-cyan-500 transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  متن پیام یا درخواست <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="پیام یا شرح درخواست همکاری خود را اینجا بنویسید..."
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs resize-none border focus:outline-none focus:border-cyan-500 font-sans transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingForm}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {isSubmittingForm ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>در حال ارسال پیام...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال پیام</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      );
    }

    // 7. FAQ Accordion (Independent Glass Container with HelpCircle Icon - Match Admin Preview)
    if (link.moduleType === 'faq_accordion' && meta.faqItems?.length) {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-4 border shadow-sm space-y-3 text-right ${cardRadius} ${
            isLight
              ? 'bg-white/95 border-slate-200'
              : 'bg-white/5 border-white/10 backdrop-blur-md'
          }`}
          style={customCardStyle}
        >
          {/* FAQ Header with Circular HelpCircle Icon */}
          <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title || 'سوالات متداول (FAQ)'}
            </span>
          </div>

          {/* Accordion items */}
          <div className="space-y-2">
            {meta.faqItems.map((item: any, idx: number) => {
              const isOpen = openFaqId === `${link.id}-${idx}`;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isLight
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-black/20 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : `${link.id}-${idx}`)}
                    className="w-full p-3 text-right flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer transition-colors hover:bg-white/5"
                  >
                    <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>{item.question}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-0.5 text-[11px] leading-relaxed border-t border-white/5 text-slate-300 font-sans">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 8. Location & Working Hours
    if (link.moduleType === 'location_hours') {
      return (
        <div
          key={link.id}
          className={`w-full p-4.5 rounded-2xl border shadow-sm space-y-2.5 text-right ${
            isLight ? 'bg-white/90 border-slate-200' : 'bg-white/[0.05] backdrop-blur-md border-white/10'
          }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title || 'آدرس و ساعات کاری'}
            </span>
          </div>
          {meta.address && (
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{meta.address}</p>
          )}
          {meta.workingHours && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-white/10 font-sans">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{meta.workingHours}</span>
            </div>
          )}
        </div>
      );
    }

    // 8.5. Phone Call Module (Redesigned to Match Admin Preview)
    if (link.moduleType === 'phone_call') {
      const phoneVal =
        (link.metadata?.phoneNumber as string) ||
        link.url?.replace(/^tel:/, '') ||
        profile.phone ||
        '';
      const smartHref = getSmartLink('phone_call', phoneVal);
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);

      return (
        <a
          key={link.id}
          href={smartHref}
          className={`w-full p-3 flex items-center justify-between gap-3 shadow-sm border transition-all duration-300 md:hover:scale-[1.02] md:hover:border-emerald-500/40 md:hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] cursor-pointer group ${cardRadius} ${getButtonAnimationClass(adv.buttonAnimation)} ${
            isLight
              ? 'bg-white/95 border-slate-200 hover:border-slate-300'
              : 'bg-white/5 hover:bg-white/10 border-white/10 backdrop-blur-md'
          }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Phone icon inside dark green circle */}
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <Phone className="w-4 h-4 fill-current" />
            </div>

            {/* Text: Title on top, Phone number below */}
            <div className="text-right truncate">
              <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {link.title || 'تماس تلفنی مستقیم'}
              </span>
              {phoneVal && (
                <span className="text-[11px] font-outfit text-slate-400 block mt-0.5 tracking-wider truncate" dir="ltr">
                  {formatDisplayValue(phoneVal)}
                </span>
              )}
            </div>
          </div>

          {/* Left Arrow Icon (<) */}
          <div className="shrink-0 text-slate-400 group-hover:text-white transition-colors">
            {isLtr ? (
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            ) : (
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            )}
          </div>
        </a>
      );
    }

    // 8.6. Email Direct Module (Redesigned to Match Glass Look)
    if (link.moduleType === 'email_direct') {
      const emailVal =
        (link.metadata?.email as string) ||
        link.url?.replace(/^mailto:/, '') ||
        profile.email ||
        '';
      const smartHref = getSmartLink('email_direct', emailVal);
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <a
          key={link.id}
          href={smartHref}
          className={`w-full p-3 flex items-center justify-between gap-3 shadow-sm border transition-all duration-300 md:hover:scale-[1.02] md:hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-[0.98] cursor-pointer group ${cardRadius} ${getButtonAnimationClass(adv.buttonAnimation)} ${
            isLight
              ? 'bg-white/95 border-slate-200 hover:border-slate-300'
              : 'bg-white/5 hover:bg-white/10 border-white/10 backdrop-blur-md'
          }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <div className="text-right truncate">
              <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {link.title || 'ارسال ایمیل مستقیم'}
              </span>
              {emailVal && (
                <span className="text-[11px] font-outfit text-slate-400 block mt-0.5 tracking-wider truncate" dir="ltr">
                  {formatDisplayValue(emailVal)}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-slate-400 group-hover:text-white transition-colors">
            {isLtr ? (
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            ) : (
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            )}
          </div>
        </a>
      );
    }

    // 8.7 Product Card (محصول و فروشگاه)
    if (link.moduleType === 'product_card') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-4 border shadow-md flex items-center justify-between gap-3 text-right transition-all duration-300 md:hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] ${cardRadius} ${
            isLight ? 'bg-white/90 border-slate-200' : 'bg-white/[0.05] backdrop-blur-md border-white/10'
          }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {meta.productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.productImage}
                alt={meta.productTitle || link.title}
                className={`w-14 h-14 object-cover shrink-0 border border-white/10 shadow-sm ${cardRadius}`}
              />
            ) : (
              <div className={`w-14 h-14 bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30 ${cardRadius}`}>
                <ShoppingBag className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {meta.productTitle || link.title}
              </span>
              <span className="text-xs font-outfit font-bold text-cyan-400 mt-1 block">
                {meta.productPrice ? Number(meta.productPrice).toLocaleString() : '۰'} {meta.productCurrency || 'AFN'}
              </span>
            </div>
          </div>

          <a
            href={meta.productBuyUrl || link.url || '#'}
            target={adv.openInNewTab !== false ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className={`px-4 py-2.5 ${cardRadius} bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shrink-0 shadow-md transition-all active:scale-95 flex items-center gap-1.5 md:hover:scale-105 ${getButtonAnimationClass(adv.buttonAnimation)}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>سفارش</span>
          </a>
        </div>
      );
    }

    // 8.8 Countdown Timer (شمارشگر معکوس زنده)
    if (link.moduleType === 'countdown_timer') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <LiveCountdown
          key={link.id}
          targetDate={meta.countdownTargetDate}
          title={meta.countdownTitle || link.title}
          isLight={isLight}
          className={`${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/[0.05] backdrop-blur-md border-white/10'} ${cardRadius}`}
          style={customCardStyle}
        />
      );
    }

    // 9. Standard Clickable Link / Button (Default)
    const smartUrl = getSmartLink(link.moduleType, link.url || '#');
    const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
    return (
      <a
        key={link.id}
        href={smartUrl}
        target={adv.openInNewTab === false || link.url?.startsWith('tel:') || link.url?.startsWith('mailto:') || link.url?.startsWith('#') ? '_self' : '_blank'}
        rel="noopener noreferrer"
        className={`w-full p-4 font-bold text-xs flex items-center justify-between gap-3 shadow-md border transition-all duration-300 md:hover:scale-[1.02] md:hover:shadow-[0_0_22px_rgba(14,165,233,0.35)] active:scale-[0.98] cursor-pointer group ${cardRadius} ${getButtonAnimationClass(adv.buttonAnimation)}`}
        style={{
          background: isLight
            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            : `linear-gradient(135deg, ${themeConfig.primaryColor || '#0ea5e9'}, ${themeConfig.accentColor || '#06b6d4'})`,
          color: isLight ? '#0f172a' : '#ffffff',
          borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.2)',
          ...customCardStyle,
        }}
      >
        <span className="truncate flex-1 text-right">{link.title}</span>
        {isLtr ? (
          <ChevronRight className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        ) : (
          <ChevronLeft className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
        )}
      </a>
    );
  };

  // Background gradient class based on preset
  const getThemeBackground = () => {
    switch (themeConfig.preset) {
      case 'dark_neon':
        return 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white';
      case 'glass_morphism':
        return 'bg-gradient-to-b from-purple-950 via-violet-900 to-slate-950 text-white';
      case 'emerald_luxury':
        return 'bg-gradient-to-b from-emerald-950 via-teal-900 to-slate-950 text-white';
      case 'royal_gold':
        return 'bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white';
      case 'minimal_light':
        return 'bg-gradient-to-b from-slate-100 via-white to-slate-200 text-slate-900';
      default:
        return 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white';
    }
  };

  // 7. Render Header Layout Variants (Curve, Gradient Mask, Minimal)
  const renderHeaderLayout = () => {
    // 1. CURVE LAYOUT (Default)
    if (profile.headerLayout === 'curve' || !profile.headerLayout) {
      return (
        <div className="relative w-full">
          {/* Cover Photo */}
          <div
            className="w-full h-44 sm:h-48 md:h-52 overflow-hidden relative shadow-inner bg-slate-900 rounded-3xl md:rounded-none md:rounded-t-3xl"
            style={{ clipPath: 'ellipse(90% 100% at 50% 0%)' }}
          >
            {profile.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.coverUrl}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${themeConfig.primaryColor || '#0ea5e9'}, ${themeConfig.accentColor || '#06b6d4'})`,
                }}
              />
            )}

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

            {/* Fixed Glass Share Button in top corner */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleShare}
              className={`absolute top-3.5 ${isLtr ? 'right-3.5' : 'left-3.5'} z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-lg cursor-pointer`}
              title="اشتراک‌گذاری کارت"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Overlapping 3D Avatar */}
          <div className="relative -mt-14 md:-mt-16 flex flex-col items-center z-10 px-2 md:px-5">
            <div className="relative group">
              <div
                className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 shadow-2xl relative bg-slate-800 ring-2 ring-white/10 ${
                  isLight ? 'border-white' : 'border-slate-950'
                }`}
              >
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                    {profile.displayName?.trim().charAt(0) || <User className="w-10 h-10 text-white" />}
                  </div>
                )}
              </div>

              {isVerifiedApproved && (
                <div
                  className={`absolute bottom-1 ${isLtr ? 'right-1' : 'left-1'} bg-slate-950 rounded-full p-1 border border-white/20 shadow-md`}
                  title="حساب تایید شده"
                >
                  <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-500" />
                </div>
              )}
            </div>

            {/* Name, Headline, Location, Bio */}
            <div className="text-center mt-3.5 w-full">
              <h1
                className={`text-xl md:text-2xl font-black tracking-tight flex items-center justify-center gap-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span>{profile.displayName}</span>
                {isVerifiedApproved && (
                  <BadgeCheck className="w-5 h-5 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                )}
              </h1>

              {profile.headline && (
                <p className="text-xs md:text-sm font-semibold mt-1 text-cyan-400">
                  {profile.headline}
                </p>
              )}

              {profile.location && (
                <p className="text-[11px] md:text-xs text-slate-300 flex items-center justify-center gap-1 mt-1 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{profile.location}</span>
                </p>
              )}

              {profile.bio && (
                <p
                  className={`text-xs md:text-sm mt-2.5 leading-relaxed max-w-sm mx-auto font-normal ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 2. GRADIENT MASK LAYOUT
    if (profile.headerLayout === 'gradient_mask') {
      return (
        <div className="relative w-full">
          {/* Cover Photo with gradient mask */}
          <div className="relative w-full h-44 sm:h-48 md:h-52 overflow-hidden shrink-0 rounded-3xl md:rounded-none md:rounded-t-3xl [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
            {profile.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.coverUrl}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${themeConfig.primaryColor || '#0ea5e9'}, ${themeConfig.accentColor || '#06b6d4'})`,
                }}
              />
            )}

            {/* Fixed Glass Share Button in top corner */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleShare}
              className={`absolute top-3.5 ${isLtr ? 'right-3.5' : 'left-3.5'} z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-lg cursor-pointer`}
              title="اشتراک‌گذاری کارت"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Overlapping 3D Avatar */}
          <div className="relative -mt-14 md:-mt-16 flex flex-col items-center z-10 px-2 md:px-5">
            <div className="relative group">
              <div
                className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 shadow-2xl relative bg-slate-800 ring-2 ring-white/10 ${
                  isLight ? 'border-white' : 'border-slate-950'
                }`}
              >
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                    {profile.displayName?.trim().charAt(0) || <User className="w-10 h-10 text-white" />}
                  </div>
                )}
              </div>

              {isVerifiedApproved && (
                <div
                  className={`absolute bottom-1 ${isLtr ? 'right-1' : 'left-1'} bg-slate-950 rounded-full p-1 border border-white/20 shadow-md`}
                  title="حساب تایید شده"
                >
                  <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-500" />
                </div>
              )}
            </div>

            <div className="text-center mt-3.5 w-full">
              <h1
                className={`text-xl md:text-2xl font-black tracking-tight flex items-center justify-center gap-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <span>{profile.displayName}</span>
                {isVerifiedApproved && (
                  <BadgeCheck className="w-5 h-5 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                )}
              </h1>

              {profile.headline && (
                <p className="text-xs md:text-sm font-semibold mt-1 text-cyan-400">
                  {profile.headline}
                </p>
              )}

              {profile.location && (
                <p className="text-[11px] md:text-xs text-slate-300 flex items-center justify-center gap-1 mt-1 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{profile.location}</span>
                </p>
              )}

              {profile.bio && (
                <p
                  className={`text-xs md:text-sm mt-2.5 leading-relaxed max-w-sm mx-auto font-normal ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 3. MINIMAL LAYOUT
    return (
      <div className="pt-8 pb-3 px-2 md:px-5 flex flex-col items-center text-center relative">
        {/* Fixed Glass Share Button in top corner */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleShare}
          className={`absolute top-4 ${isLtr ? 'right-4' : 'left-4'} z-20 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all shadow-md cursor-pointer`}
          title="اشتراک‌گذاری کارت"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>

        <div className="relative mb-3.5 group">
          <div
            className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 shadow-2xl relative bg-slate-800 ring-2 ring-white/10 ${
              isLight ? 'border-white' : 'border-slate-950'
            }`}
          >
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                {profile.displayName?.trim().charAt(0) || <User className="w-10 h-10 text-white" />}
              </div>
            )}
          </div>

          {isVerifiedApproved && (
            <div
              className={`absolute bottom-1 ${isLtr ? 'right-1' : 'left-1'} bg-slate-950 rounded-full p-1 border border-white/20 shadow-md`}
              title="حساب تایید شده"
            >
              <BadgeCheck className="w-5 h-5 text-sky-400 fill-sky-500" />
            </div>
          )}
        </div>

        <h1
          className={`text-xl md:text-2xl font-black tracking-tight flex items-center justify-center gap-1.5 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          <span>{profile.displayName}</span>
          {isVerifiedApproved && (
            <BadgeCheck className="w-5 h-5 text-white fill-sky-500 drop-shadow-sm shrink-0" />
          )}
        </h1>

        {profile.headline && (
          <p className="text-xs md:text-sm font-semibold mt-1 text-cyan-400">
            {profile.headline}
          </p>
        )}

        {profile.location && (
          <p className="text-[11px] md:text-xs text-slate-300 flex items-center justify-center gap-1 mt-1 font-sans">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{profile.location}</span>
          </p>
        )}

        {profile.bio && (
          <p
            className={`text-xs md:text-sm mt-2.5 leading-relaxed max-w-sm mx-auto font-normal ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            {profile.bio}
          </p>
        )}
      </div>
    );
  };

  // Password Protection Gate View
  if (!isUnlocked) {
    return (
      <div
        className={`min-h-screen w-full flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-white ${getThemeBackground()}`}
        dir={isLtr ? 'ltr' : 'rtl'}
      >
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-card/90 border border-border backdrop-blur-xl shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">کارت هوشمند محافظت‌شده</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              مشاهده محتوای این کارت مستلزم وارد کردن رمز عبور تعیین شده توسط صاحب حساب است.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3 pt-2 font-sans">
            <div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="رمز عبور را وارد نمایید..."
                className={`w-full bg-background border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none text-center ${
                  passwordError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-border focus:border-cyan-500'
                }`}
              />
              {passwordError && (
                <span className="text-[11px] text-rose-500 mt-1.5 block font-medium">
                  رمز عبور نادرست است. لطفاً دوباره تلاش کنید.
                </span>
              )}
            </div>

            {profile.passwordProtection?.hint && (
              <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50">
                💡 راهنمای رمز: <span className="font-semibold text-foreground">{profile.passwordProtection.hint}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
            >
              ورود و مشاهده کارت
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between relative selection:bg-cyan-500 selection:text-white ${getThemeBackground()}`}
      dir={isLtr ? 'ltr' : 'rtl'}
    >
      {/* Background Ambience Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Responsive Grid Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-10 flex-1 flex flex-col justify-between"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* COLUMN 1: Profile Identity & QR Code (Right in RTL, Left in LTR) */}
          <div className="col-span-1 md:col-span-5 lg:col-span-5 space-y-3.5 md:space-y-4 md:sticky md:top-8 self-start">
            {/* Identity Card: Unboxed on Mobile (bg-transparent border-0 shadow-none), Boxed Card on Desktop (md:rounded-3xl md:border md:shadow-2xl) */}
            <motion.div
              variants={itemVariants}
              className={`w-full transition-all bg-transparent border-0 shadow-none md:rounded-3xl md:overflow-hidden md:border md:shadow-2xl md:backdrop-blur-xl ${
                isLight
                  ? 'md:bg-white/85 md:border-slate-200/90 md:shadow-slate-200/50 text-slate-900'
                  : 'md:bg-white/[0.04] md:border-white/10 md:shadow-black/40 text-white'
              }`}
            >
              {/* 1. Header Layout: Cover, Avatar, Name, Headline, Bio */}
              {renderHeaderLayout()}

              {/* 2. PRIMARY ACTION: Save Contact (vCard) - DISPLAYED DIRECTLY BELOW NAME/BIO ON MOBILE */}
              <div className="pt-3 pb-1 md:hidden">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadVCard}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl border border-white/25 backdrop-blur-xl transition-all cursor-pointer shadow-cyan-500/15"
                  style={{
                    background: isLight
                      ? 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)'
                      : `linear-gradient(135deg, ${themeConfig.primaryColor || '#0ea5e9'}, ${themeConfig.accentColor || '#06b6d4'})`,
                    color: '#ffffff',
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isLtr
                      ? 'Save Contact (vCard)'
                      : isPashto
                        ? 'په اړیکو کې ساتل (vCard)'
                        : 'ذخیره در مخاطبان تلفن (vCard)'}
                  </span>
                </motion.button>
              </div>

              {/* 3. UNIFIED SOCIAL NETWORKS MATRIX - DISPLAYED AFTER vCard ON MOBILE, UNDER BIO ON DESKTOP */}
              {hasAnySocial && (
                <div className="pt-2 pb-1 md:px-5 md:pt-4 md:pb-5">
                  <div className="flex items-center justify-center flex-wrap gap-2.5 p-3 rounded-2xl bg-black/15 dark:bg-white/5 border border-white/10 backdrop-blur-md">
                    {/* WhatsApp (from profile if no module link exists) */}
                    {profile.whatsapp && !hasWhatsAppLink && (
                      <a
                        href={getSmartLink('whatsapp', profile.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="ارسال پیام در واتساپ"
                        className="w-12 h-12 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(16,185,129,0.4)]"
                      >
                        <WhatsAppIcon className="w-5 h-5 fill-current" />
                      </a>
                    )}

                    {/* Social links defined in profile.links */}
                    {socialLinks.map((link) => renderSocialIcon(link))}

                    {/* Unified Email Icon (seamlessly inside social matrix) */}
                    {profile.email && (
                      <a
                        href={getSmartLink('email', profile.email)}
                        title={`ارسال ایمیل: ${profile.email}`}
                        className="w-12 h-12 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(245,158,11,0.4)]"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}

                    {/* Direct phone call in social matrix if phone exists and no dedicated phone module */}
                    {profile.phone && !hasPhoneLink && (
                      <a
                        href={getSmartLink('phone', profile.phone)}
                        title={`تماس تلفنی: ${profile.phone}`}
                        className="w-12 h-12 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-[0_0_18px_rgba(20,184,166,0.4)]"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* DESKTOP EXCLUSIVE: Dynamic QR Code Card (Replaces vCard button on desktop) */}
            <motion.div
              variants={itemVariants}
              className={`hidden md:flex flex-col items-center text-center p-6 rounded-3xl border shadow-xl transition-all ${
                isLight
                  ? 'bg-white/85 border-slate-200/90 shadow-slate-200/50'
                  : 'bg-white/[0.04] backdrop-blur-xl border-white/10 shadow-black/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                  {isLtr ? 'Scan with Mobile Camera' : 'اسکن با دوربین گوشی'}
                </span>
              </div>

              {/* Vector SVG QR Code */}
              <div className="p-3.5 bg-white rounded-2xl shadow-md border border-slate-200/80 inline-block my-2 transition-transform duration-300 hover:scale-105">
                <QRCodeSVG
                  value={currentUrl}
                  size={140}
                  level="M"
                  includeMargin={false}
                  fgColor="#090d16"
                  bgColor="#ffffff"
                />
              </div>

              <p className={`text-[11px] leading-relaxed mt-2.5 max-w-[240px] font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {isLtr
                  ? 'Point your phone camera here to open and save this vCard instantly.'
                  : 'دوربین موبایل خود را به سمت بارکد بگیرید تا این پروفایل و مخاطب مستقیماً در گوشی شما باز و ذخیره شود.'}
              </p>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 mt-4 w-full">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                      : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-200'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isLtr ? 'Copy Link' : 'کپی لینک کارت'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadVCard}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 transition-all cursor-pointer active:scale-95"
                  title="دانلود فایل مخاطب"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>vCard</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* COLUMN 2: Links, Media, Forms & Accordions (Left in RTL, Right in LTR) */}
          <div className="col-span-1 md:col-span-7 lg:col-span-7 space-y-3.5">
            {/* Active Modules List (Staggered Animation for Each Card) */}
            {filteredNonSocialLinks.map((link) => (
              <motion.div key={link.id} variants={itemVariants}>
                {renderModuleCard(link)}
              </motion.div>
            ))}

            {/* Empty State */}
            {profile.links.filter((l) => l.isActive).length === 0 && (
              <motion.div
                variants={itemVariants}
                className={`p-8 text-center text-xs border border-dashed rounded-2xl ${
                  isLight ? 'text-slate-400 border-slate-300' : 'text-white/50 border-white/20'
                }`}
              >
                {isLtr
                  ? 'No active modules to display'
                  : isPashto
                    ? 'د ښودلو لپاره هیڅ فعال ماډل نشته'
                    : 'هیچ ماژولی برای نمایش وجود ندارد'}
              </motion.div>
            )}
          </div>
        </div>

        {/* FOOTER WATERMARK BRANDING */}
        {!profile.hideBranding && (
          <motion.div variants={itemVariants} className="pt-10 pb-6 text-center select-none shrink-0">
            <a
              href="https://aryal.ink"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs tracking-wider font-semibold inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <span>{isLtr ? 'Powered by ⚡' : isPashto ? 'جوړ شوی لخوا ⚡' : 'طراحی شده با ⚡'}</span>
              <span className="text-cyan-400 font-bold font-outfit">Arya Link</span>
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
