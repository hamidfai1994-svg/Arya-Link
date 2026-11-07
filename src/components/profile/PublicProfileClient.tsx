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
import { downloadVCard, convertToEnglishDigits } from '@/lib/generateVCard';
import { ALL_COUNTRIES } from '@/constants/countries';
import { LiveCountdown } from '@/components/ui/live-countdown';
import { LiveBusinessHours } from '@/components/profile/LiveBusinessHours';
import { PRESET_PATTERNS } from '@/lib/backgrounds';
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
  Navigation,
  Check,
  Folder,
  Link2,
  HeartHandshake,
  Music,
  KeyRound,
  Hourglass,
  ShieldAlert,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  const activeFontClass = isLtr
    ? (themeConfig.fontEn ? `font-${themeConfig.fontEn}` : 'font-inter')
    : (themeConfig.fontFa ? `font-${themeConfig.fontFa}` : 'font-vazirmatn');
  const activeFontSize = isLtr
    ? (themeConfig.fontSizeEn || 14)
    : isPashto
      ? (themeConfig.fontSizePashto || 15)
      : (themeConfig.fontSizeDari || 15);

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

  // Link Protection States & Handlers (Zero Cost Password & Expiration Check)
  const [selectedProtectedLink, setSelectedProtectedLink] = useState<ProfileLinkItem | null>(null);
  const [linkPasswordInput, setLinkPasswordInput] = useState('');
  const [linkPasswordLoading, setLinkPasswordLoading] = useState(false);
  const [linkPasswordError, setLinkPasswordError] = useState('');

  const handleProtectedLinkClick = (e: React.MouseEvent, link: ProfileLinkItem) => {
    const exp = link.expiresAt || link.advancedSettings?.expiresAt;
    const isExpired = exp ? new Date(exp).getTime() < Date.now() : false;
    if (isExpired) {
      e.preventDefault();
      toast.error('این لینک منقضی شده است و دسترسی به آن امکان‌پذیر نیست.');
      return;
    }

    const maxClicks = typeof link.maxClicks === 'number' ? link.maxClicks : link.advancedSettings?.maxClicks;
    if (typeof maxClicks === 'number' && maxClicks > 0 && (link.clickCount || 0) >= maxClicks) {
      e.preventDefault();
      toast.error('ظرفیت مجاز کلیک برای این لینک تکمیل شده است.');
      return;
    }

    const hasPassword = Boolean(
      link.hasPassword ||
      (link as any).passwordHash ||
      link.advancedSettings?.passwordHash ||
      link.advancedSettings?.hasPassword
    );
    if (hasPassword) {
      e.preventDefault();
      setSelectedProtectedLink(link);
      setLinkPasswordInput('');
      setLinkPasswordError('');
      return;
    }
  };

  const handleVerifyLinkPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtectedLink || !linkPasswordInput.trim()) return;

    setLinkPasswordLoading(true);
    setLinkPasswordError('');
    try {
      const res = await fetch('/api/profile/link/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileAlias: profile.alias,
          profileId: (profile as any)._id || (profile as any).id,
          linkId: selectedProtectedLink.id,
          password: linkPasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        toast.success('رمز عبور تایید شد!');
        const targetUrl = data.url;
        const openInNewTab = selectedProtectedLink.advancedSettings?.openInNewTab !== false;
        setSelectedProtectedLink(null);
        setLinkPasswordInput('');
        if (openInNewTab) {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = targetUrl;
        }
      } else {
        setLinkPasswordError(data.message || 'رمز عبور وارد شده نادرست است.');
        toast.error(data.message || 'رمز عبور نادرست است.');
      }
    } catch (err) {
      setLinkPasswordError('خطا در برقراری ارتباط با سرور.');
      toast.error('خطا در بررسی رمز عبور.');
    } finally {
      setLinkPasswordLoading(false);
    }
  };

  // Button Animation Class Generator (Synced with LivePreview)
  const getButtonAnimationClass = (anim?: string, trigger?: string) => {
    if (!anim || anim === 'none') return '';
    if (trigger === 'hover') {
      return `animate-hover-${anim}`;
    }
    return `animate-${anim}`;
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

  const getButtonShapeClass = (customShape?: string, customRadius?: string) => {
    if (customShape && customShape !== 'inherit') return `btn-shape-${customShape}`;
    if (themeConfig.buttonShape) return `btn-shape-${themeConfig.buttonShape}`;
    return 'btn-shape-soft';
  };

  const getButtonSizeClass = (customSize?: string) => {
    const s = customSize || themeConfig.buttonSize || 'md';
    return `btn-size-${s}`;
  };

  const getButtonBorderWidthClass = (customWidth?: string) => {
    const w = customWidth || themeConfig.buttonBorderWidth || 'thin';
    switch (w) {
      case 'none':
        return 'border-0';
      case 'medium':
        return 'border-2';
      case 'thick':
        return 'border-4';
      case 'thin':
      default:
        return 'border';
    }
  };

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formCountryCode, setFormCountryCode] = useState('+93');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  // Location Share Modal State
  const [locationShareModal, setLocationShareModal] = useState<{
    isOpen: boolean;
    url: string;
    address?: string;
    title?: string;
  } | null>(null);
  const [copiedLocationLink, setCopiedLocationLink] = useState(false);

  // Profile Share Modal State (Desktop & Fallback)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Contact Exchange Lead Modal State (Frictionless vCard Lead Capture - Stage 72)
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

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
    'email_direct',
  ];

  // Check if link is currently active according to daily schedule
  const isLinkScheduledActive = (link: ProfileLinkItem): boolean => {
    const sched = link.advancedSettings?.scheduling;
    if (!sched || !sched.enabled) return true;

    try {
      const now = new Date();
      if (Array.isArray(sched.days) && sched.days.length > 0) {
        const currentDay = now.getDay();
        if (!sched.days.includes(currentDay)) {
          return false;
        }
      }

      if (sched.startTime && sched.endTime) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = sched.startTime.split(':').map((v) => parseInt(v, 10));
        const [endH, endM] = sched.endTime.split(':').map((v) => parseInt(v, 10));

        const startMinutes = (startH || 0) * 60 + (startM || 0);
        const endMinutes = (endH || 0) * 60 + (endM || 0);

        if (startMinutes <= endMinutes) {
          if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
            return false;
          }
        } else {
          // Cross-midnight range (e.g. 22:00 to 06:00)
          if (currentMinutes < startMinutes && currentMinutes > endMinutes) {
            return false;
          }
        }
      }
    } catch (e) {
      return true;
    }

    return true;
  };

  // Compact social icons rendered horizontally in top matrix (only standalone ones without parentId)
  const compactSocialLinks = (profile.links || []).filter(
    (l) =>
      l.isActive &&
      !l.advancedSettings?.isHidden &&
      isLinkScheduledActive(l) &&
      !l.parentId &&
      socialModuleTypes.includes(l.moduleType) &&
      l.advancedSettings?.isCompactIcon !== false
  );

  // Top-level vertical modules (includes containers and standalone non-compact modules)
  const topLevelNonSocialLinks = (profile.links || []).filter((l) => {
    if (!l.isActive || l.advancedSettings?.isHidden || !isLinkScheduledActive(l)) return false;
    if (l.parentId) return false;
    if (socialModuleTypes.includes(l.moduleType) && l.advancedSettings?.isCompactIcon !== false) {
      return false;
    }
    return true;
  });

  const filteredNonSocialLinks = topLevelNonSocialLinks.filter((l) => {
    return searchFilter ? l.title.toLowerCase().includes(searchFilter.toLowerCase()) : true;
  });

  const getContainerChildren = (containerId: string) =>
    (profile.links || []).filter(
      (l) => l.isActive && !l.advancedSettings?.isHidden && isLinkScheduledActive(l) && l.parentId === containerId
    );

  const hasWhatsAppLink = compactSocialLinks.some((l) => l.moduleType === 'whatsapp_direct');
  const hasPhoneLink = (profile.links || []).some((l) => l.moduleType === 'phone_call');
  const hasAnySocial =
    compactSocialLinks.length > 0 ||
    Boolean(profile.whatsapp) ||
    Boolean(profile.phone);

  // 2. vCard Generator (.vcf) & Frictionless Lead Capture (Stage 72)
  const handleSaveContact = () => {
    try {
      const filename = downloadVCard(profile as any);
      toast.success(
        isLtr
          ? `Contact card saved (${filename})`
          : isPashto
            ? `د اړیکې کارت ډاونلوډ شو (${filename})`
            : `فایل مخاطب با موفقیت ذخیره شد (${filename})`
      );
      // Simultaneously open Contact Exchange Lead Modal
      setIsLeadModalOpen(true);
    } catch (err) {
      console.error('Failed to export vCard:', err);
      toast.error(
        isLtr
          ? 'Failed to generate contact card'
          : 'خطا در ایجاد و دانلود فایل مخاطب'
      );
    }
  };

  const handleSubmitLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!leadPhone.trim() && !leadName.trim()) {
      toast.error(
        isLtr
          ? 'Please enter your name or phone number.'
          : 'لطفاً حداقل شماره تماس یا نام خود را وارد کنید.'
      );
      return;
    }

    setIsSubmittingLead(true);
    try {
      const cleanPhone = convertToEnglishDigits(leadPhone.trim());
      const cleanName = leadName.trim();

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileAlias: profile.alias,
          name: cleanName || 'کاربر دریافت‌کننده کارت',
          phone: cleanPhone,
          message: 'درخواست تبادل اطلاعات تماس (vCard Lead Capture)',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send contact info');
      }

      toast.success(
        isLtr
          ? 'Your information was submitted successfully!'
          : isPashto
            ? 'ستاسو معلومات په بریالیتوب سره ثبت شول!'
            : 'اطلاعات شما با موفقیت ثبت شد'
      );

      setLeadName('');
      setLeadPhone('');
      setIsLeadModalOpen(false);
    } catch (err) {
      console.error('Failed to submit public lead:', err);
      toast.error('خطا در ثبت اطلاعات.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleDownloadVCard = handleSaveContact;

  // 3. Share Card Link
  const handleShare = async () => {
    const fullUrl = `https://aryal.ink/${profile.alias}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: profile.displayName || 'کارت هوشمند آریا لینک',
          text: `کارت دیجیتال ${profile.displayName || ''} در آریا لینک:`,
          url: fullUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    // Desktop or Web Share fallback: open interactive share modal
    setIsShareModalOpen(true);
  };

  // 3.5. Copy Link
  const handleCopyLink = () => {
    const fullUrl = typeof window !== 'undefined' ? window.location.href : `https://aryal.ink/${profile.alias}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      toast.success('لینک کارت هوشمند در کلیپ‌بورد کپی شد.');
    }
  };

  // 3.6. Share Location Link
  const handleShareLocation = async (
    e: React.MouseEvent,
    url: string,
    address?: string,
    title?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const shareTitle = title || 'موقعیت مکانی';
    const shareText = address ? `${shareTitle}: ${address}` : shareTitle;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    setLocationShareModal({
      isOpen: true,
      url,
      address,
      title: shareTitle,
    });
  };

  // 4. Contact Form Submit
  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) {
      toast.error('لطفاً فیلدهای ضروری نام، شماره تماس و متن پیام را تکمیل فرمایید.');
      return;
    }

    const cleanRawPhone = convertToEnglishDigits(formPhone.trim()).replace(/^0+/, '');
    const finalPhone = formCountryCode + cleanRawPhone;

    setIsSubmittingForm(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileAlias: profile.alias,
          name: formName.trim(),
          email: formEmail.trim(),
          phone: finalPhone,
          message: formMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setFormSubmitted(true);
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormMessage('');
      toast.success(
        isLtr
          ? 'Your message has been sent successfully!'
          : isPashto
            ? 'ستاسو پیغام په بریالیتوب سره واستول شو!'
            : 'پیام شما با موفقیت ارسال شد و به اطلاع صاحب کارت خواهد رسید.'
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      toast.error(
        isLtr
          ? 'Failed to send message. Please try again.'
          : isPashto
            ? 'د پیغام په استولو کې تېروتنه رامنځته شوه.'
            : 'خطا در ارسال پیام. لطفاً مجدداً تلاش نمایید.'
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // 5. Render Social Icon (Synced with LivePreview Dynamic Shapes & Colors)
  const renderSocialIcon = (link: ProfileLinkItem) => {
    const rawVal =
      link.url ||
      (link.metadata?.phoneNumber as string) ||
      (link.metadata?.channelUsername as string) ||
      (link.metadata?.instagramUsername as string) ||
      (link.metadata?.linkedinUsername as string) ||
      (link.metadata?.emailAddress as string) ||
      (link.metadata?.email as string) ||
      (link.metadata?.targetId as string) ||
      '';
    const smartUrl =
      link.moduleType === 'email_direct'
        ? (rawVal.startsWith('mailto:') ? rawVal : `mailto:${rawVal}`)
        : getSmartLink(link.moduleType, rawVal, { preferDeepLink: true });
    const cardShape = getButtonShapeClass(
      link.advancedSettings?.customStyling?.buttonShape,
      link.advancedSettings?.customStyling?.borderRadius
    );
    const animClass = getButtonAnimationClass(
      link.advancedSettings?.buttonAnimation,
      link.advancedSettings?.animationTrigger
    );
    const animDuration = link.advancedSettings?.animationSpeed
      ? { ['--anim-speed' as any]: `${link.advancedSettings.animationSpeed}s` }
      : {};

    const getSocialColors = (type: LinkModuleType) => {
      switch (type) {
        case 'whatsapp_direct': return { border: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.15)', classes: 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400', icon: <WhatsAppIcon className="w-5 h-5 fill-current" /> };
        case 'telegram_channel': return { border: 'rgba(14, 165, 233, 0.4)', bg: 'rgba(14, 165, 233, 0.15)', classes: 'bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400', icon: <TelegramIcon className="w-5 h-5 fill-current" /> };
        case 'instagram_profile': return { border: 'rgba(236, 72, 153, 0.4)', bg: 'rgba(236, 72, 153, 0.15)', classes: 'bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-400', icon: <InstagramIcon className="w-5 h-5 fill-current" /> };
        case 'linkedin_profile': return { border: 'rgba(37, 99, 235, 0.4)', bg: 'rgba(37, 99, 235, 0.15)', classes: 'bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/30 text-blue-400', icon: <LinkedInIcon className="w-5 h-5 fill-current" /> };
        case 'twitter_x': return { border: 'rgba(161, 161, 170, 0.4)', bg: 'rgba(39, 39, 42, 0.5)', classes: 'bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-100', icon: <XTwitterIcon className="w-5 h-5 fill-current" /> };
        case 'pinterest': return { border: 'rgba(244, 63, 94, 0.4)', bg: 'rgba(244, 63, 94, 0.15)', classes: 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500', icon: <PinterestIcon className="w-5 h-5 fill-current" /> };
        case 'facebook': return { border: 'rgba(37, 99, 235, 0.4)', bg: 'rgba(37, 99, 235, 0.15)', classes: 'bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/30 text-blue-400', icon: <FacebookIcon className="w-5 h-5 fill-current" /> };
        case 'dribbble': return { border: 'rgba(236, 72, 153, 0.4)', bg: 'rgba(236, 72, 153, 0.15)', classes: 'bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-400', icon: <DribbbleIcon className="w-5 h-5 fill-current" /> };
        case 'behance': return { border: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.15)', classes: 'bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400', icon: <BehanceIcon className="w-5 h-5 fill-current" /> };
        case 'youtube_channel': return { border: 'rgba(239, 68, 68, 0.4)', bg: 'rgba(239, 68, 68, 0.15)', classes: 'bg-red-600/15 hover:bg-red-600/25 border border-red-600/30 text-red-500', icon: <YouTubeIcon className="w-5 h-5 fill-current" /> };
        case 'clubhouse': return { border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.15)', classes: 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500', icon: <ClubhouseIcon className="w-5 h-5 fill-current" /> };
        case 'patreon': return { border: 'rgba(244, 63, 94, 0.4)', bg: 'rgba(244, 63, 94, 0.15)', classes: 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500', icon: <PatreonIcon className="w-5 h-5 fill-current" /> };
        case 'twitch': return { border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.15)', classes: 'bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400', icon: <TwitchIcon className="w-5 h-5 fill-current" /> };
        case 'github': return { border: 'rgba(161, 161, 170, 0.4)', bg: 'rgba(39, 39, 42, 0.5)', classes: 'bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-100', icon: <GitHubIcon className="w-5 h-5 fill-current" /> };
        case 'aparat_channel': return { border: 'rgba(244, 63, 94, 0.4)', bg: 'rgba(244, 63, 94, 0.15)', classes: 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500', icon: <AparatIcon className="w-5 h-5 fill-current" /> };
        case 'tiktok': return { border: 'rgba(161, 161, 170, 0.4)', bg: 'rgba(24, 24, 27, 0.5)', classes: 'bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/50 text-zinc-100', icon: <TikTokIcon className="w-5 h-5 fill-current" /> };
        case 'apple_music': return { border: 'rgba(244, 63, 94, 0.4)', bg: 'rgba(244, 63, 94, 0.15)', classes: 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500', icon: <AppleMusicIcon className="w-5 h-5 fill-current" /> };
        case 'youtube_music': return { border: 'rgba(239, 68, 68, 0.4)', bg: 'rgba(239, 68, 68, 0.15)', classes: 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-500', icon: <YouTubeMusicIcon className="w-5 h-5 fill-current" /> };
        case 'castbox': return { border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.15)', classes: 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500', icon: <CastboxIcon className="w-5 h-5 fill-current" /> };
        case 'radio_javan': return { border: 'rgba(99, 102, 241, 0.4)', bg: 'rgba(99, 102, 241, 0.15)', classes: 'bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400', icon: <RadioJavanIcon className="w-5 h-5 fill-current" /> };
        case 'spotify_podcaster':
        case 'spotify': return { border: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.15)', classes: 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400', icon: <SpotifyIcon className="w-5 h-5 fill-current" /> };
        case 'soundcloud': return { border: 'rgba(249, 115, 22, 0.4)', bg: 'rgba(249, 115, 22, 0.15)', classes: 'bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400', icon: <SoundCloudIcon className="w-5 h-5 fill-current" /> };
        case 'skype': return { border: 'rgba(14, 165, 233, 0.4)', bg: 'rgba(14, 165, 233, 0.15)', classes: 'bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400', icon: <SkypeIcon className="w-5 h-5 fill-current" /> };
        case 'wechat': return { border: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.15)', classes: 'bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-600/30 text-emerald-400', icon: <WeChatIcon className="w-5 h-5 fill-current" /> };
        case 'messenger': return { border: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.15)', classes: 'bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400', icon: <MessengerIcon className="w-5 h-5 fill-current" /> };
        case 'signal': return { border: 'rgba(37, 99, 235, 0.4)', bg: 'rgba(37, 99, 235, 0.15)', classes: 'bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/30 text-blue-400', icon: <SignalIcon className="w-5 h-5 fill-current" /> };
        case 'email_direct': return { border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.15)', classes: 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400', icon: <Mail className="w-5 h-5" /> };
        default: return null;
      }
    };
    const sInfo = getSocialColors(link.moduleType);
    if (!sInfo) return null;

    const sStyle = link.advancedSettings?.customStyling;
    const iconStyle: React.CSSProperties = {
      ...animDuration,
      ['--btn-border' as any]: sStyle?.customBorderColor || sInfo.border,
      ['--btn-bg' as any]: sStyle?.customBgColor || sInfo.bg,
      ['--btn-border-width' as any]: '1.5px',
    };

    const exp = link.expiresAt || link.advancedSettings?.expiresAt;
    const isExpired = exp ? new Date(exp).getTime() < Date.now() : false;
    const maxClicks = typeof link.maxClicks === 'number' ? link.maxClicks : link.advancedSettings?.maxClicks;
    const isMaxClicksReached = typeof maxClicks === 'number' && maxClicks > 0 && (link.clickCount || 0) >= maxClicks;
    const isProtected = Boolean(
      link.hasPassword ||
      (link as any).passwordHash ||
      link.advancedSettings?.passwordHash ||
      link.advancedSettings?.hasPassword
    );
    const isDisabled = isExpired || isMaxClicksReached;

    return (
      <a
        key={link.id}
        href={isDisabled || isProtected ? '#' : smartUrl}
        target={isDisabled || isProtected ? '_self' : '_blank'}
        rel="noreferrer"
        title={isExpired ? 'منقضی شده' : isMaxClicksReached ? 'تکمیل ظرفیت کلیک' : isProtected ? 'محافظت با رمز عبور' : link.title}
        onClick={(e) => {
          if (isDisabled || isProtected) {
            handleProtectedLinkClick(e, link);
          }
        }}
        className={`w-11 h-11 ${cardShape} ${animClass} ${sInfo.classes} flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm relative ${isDisabled ? 'opacity-40 grayscale pointer-events-auto cursor-not-allowed' : ''}`}
        style={iconStyle}
      >
        {sInfo.icon}
        {isProtected && !isDisabled && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-600 rounded-full flex items-center justify-center text-[9px] text-white shadow-xs">
            <Lock className="w-2 h-2" />
          </span>
        )}
      </a>
    );
  };

  // 6. Render Module Card
  const renderModuleCard = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};
    const adv = link.advancedSettings || {};
    const lock = adv.monetization;
    const customStyle = adv.customStyling;

    const bWidthVal =
      (customStyle?.borderWidth || themeConfig.buttonBorderWidth) === 'none'
        ? '0px'
        : (customStyle?.borderWidth || themeConfig.buttonBorderWidth) === 'medium'
          ? '2px'
          : (customStyle?.borderWidth || themeConfig.buttonBorderWidth) === 'thick'
            ? '3px'
            : '1.5px';

    const customCardStyle: React.CSSProperties = {
      ...(adv.animationSpeed ? { ['--anim-speed' as any]: `${adv.animationSpeed}s` } : {}),
      ['--btn-border-width' as any]: bWidthVal,
    };

    // Background color: Only apply inline if user chose a custom color and not the default cyan (#0ea5e9 / #38bdf8)
    const rawBgColor = customStyle?.customBgColor || themeConfig.buttonBgColor;
    const isDefaultBg =
      !rawBgColor ||
      rawBgColor.trim() === '' ||
      rawBgColor.toLowerCase() === '#0ea5e9' ||
      rawBgColor.toLowerCase() === '#38bdf8';
    if (!isDefaultBg) {
      customCardStyle.backgroundColor = rawBgColor;
      customCardStyle['--btn-bg' as any] = rawBgColor;
    }

    // Text color
    const rawTextColor = customStyle?.customTextColor || themeConfig.buttonTextColor;
    if (rawTextColor && rawTextColor.trim() !== '') {
      customCardStyle.color = rawTextColor;
      customCardStyle['--btn-text' as any] = rawTextColor;
    }

    // Border color: Only apply inline if user chose a custom color and not the default cyan border (#38bdf8 / #0ea5e9)
    const rawBorderColor = customStyle?.customBorderColor || themeConfig.buttonBorderColor;
    const isDefaultBorder =
      !rawBorderColor ||
      rawBorderColor.trim() === '' ||
      rawBorderColor.toLowerCase() === '#38bdf8' ||
      rawBorderColor.toLowerCase() === '#0ea5e9';
    if (!isDefaultBorder) {
      customCardStyle.borderColor = rawBorderColor;
      customCardStyle['--btn-border' as any] = rawBorderColor;
    }

    const cardShape = getButtonShapeClass(customStyle?.buttonShape, customStyle?.borderRadius);
    const cardSize = getButtonSizeClass(customStyle?.buttonSize);
    const cardBorderWidth = getButtonBorderWidthClass(customStyle?.borderWidth);
    const animClass = getButtonAnimationClass(adv.buttonAnimation, adv.animationTrigger);

    // 0. Container / Group Module
    if (link.moduleType === 'container_group') {
      const childLinks = getContainerChildren(link.id);
      const isCompact = meta.containerLayout === 'horizontal_compact';

      return (
        <div
          key={link.id}
          className={`w-full rounded-2xl p-3 border transition-all ${isLight
            ? 'bg-slate-100/90 border-slate-300 shadow-xs'
            : 'bg-white/5 border-white/10 backdrop-blur-md'
            }`}
          style={customCardStyle}
        >
          {link.title && (
            <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-border/40">
              <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                <span>{link.title}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-sans bg-muted/60 px-1.5 py-0.5 rounded-md">
                {childLinks.length} {childLinks.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          )}

          {isCompact ? (
            /* Horizontal Matrix / Compact Icons Row */
            <div className="flex items-center justify-center flex-wrap gap-2 pt-0.5">
              {childLinks.map((child) => (
                <div key={child.id}>
                  {socialModuleTypes.includes(child.moduleType) ? (
                    renderSocialIcon(child)
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${isLight
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-white/10 border-white/20 text-white'
                        }`}
                    >
                      <Link2 className="w-5 h-5 text-cyan-400" />
                    </div>
                  )}
                </div>
              ))}
              {childLinks.length === 0 && (
                <p className="text-[10px] text-center text-muted-foreground py-2 w-full">
                  این گروه در حال حاضر خالی است.
                </p>
              )}
            </div>
          ) : (
            /* Vertical List of Child Cards */
            <div className="space-y-2 pt-0.5">
              {childLinks.map((child) => (
                <div key={child.id}>
                  {renderModuleCard(child)}
                </div>
              ))}
              {childLinks.length === 0 && (
                <p className="text-[10px] text-center text-muted-foreground py-2 w-full">
                  این گروه در حال حاضر خالی است.
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

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
          className={`w-full p-3.5 border shadow-sm ${alignClass} ${getBorderRadiusClass(customStyle?.borderRadius)} ${isLight ? 'bg-white/95 border-slate-200 text-slate-800' : `${themeConfig.cardBlur} text-white`
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
            className={`w-full rounded-2xl pr-10 pl-3.5 py-3 text-xs border focus:outline-none transition-all shadow-sm ${isLight
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

    // 6. Contact Form Module (CRM Lead Capture Form)
    if (link.moduleType === 'contact_form' || link.moduleType === 'lead_capture_form') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-5 border shadow-lg space-y-4 text-right ${cardRadius} ${isLight ? 'bg-white/95 border-slate-200' : 'bg-white/[0.05] backdrop-blur-md border-white/10'
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
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-cyan-500 transition-all ${isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  شماره تماس <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2 w-full" dir="ltr">
                  <select
                    value={formCountryCode}
                    onChange={(e) => setFormCountryCode(e.target.value)}
                    style={{ fontFamily: 'var(--font-vazirmatn), var(--font-inter), sans-serif' }}
                    className={`w-[110px] shrink-0 p-2 border rounded-xl text-xs font-sans font-medium focus:outline-none focus:border-cyan-500 transition-all cursor-pointer ${isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-white/5 border-white/10 text-white'
                      }`}
                  >
                    {ALL_COUNTRIES.map((c) => (
                      <option
                        key={c.code}
                        value={c.dialCode}
                        className="bg-slate-900 text-white font-sans"
                        style={{ fontFamily: 'var(--font-vazirmatn), var(--font-inter), sans-serif' }}
                      >
                        {c.flag} {c.dialCode} ({c.nameFa})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formPhone}
                    onChange={(e) => {
                      let raw = convertToEnglishDigits(e.target.value).replace(/[^0-9]/g, '');
                      if (raw.startsWith('0')) raw = raw.replace(/^0+/, '');
                      setFormPhone(raw);
                    }}
                    placeholder="782698484"
                    className={`p-2 border rounded-xl flex-1 min-w-0 text-xs font-sans text-left focus:outline-none focus:border-cyan-500 transition-all ${isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                        : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                      }`}
                  />
                </div>
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
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-sans text-left border focus:outline-none focus:border-cyan-500 transition-all ${isLight
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
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs resize-none border focus:outline-none focus:border-cyan-500 font-sans transition-all ${isLight
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
          className={`w-full p-4 border shadow-sm space-y-3 text-right ${cardRadius} ${isLight
              ? 'bg-white/95 border-slate-200'
              : themeConfig.cardBlur
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
                  className={`rounded-xl border transition-all overflow-hidden ${isLight
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
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''
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

    // 8. Location (موقعیت مکانی)
    if (link.moduleType === 'location_hours') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      const targetMapUrl =
        meta.mapLink ||
        meta.googleMapsLink ||
        link.url ||
        (meta.address ? `https://maps.google.com/?q=${encodeURIComponent(meta.address)}` : 'https://maps.google.com');

      return (
        <div
          key={link.id}
          className={`w-full p-4 border shadow-sm space-y-2.5 text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-500" />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title || 'موقعیت مکانی'}
            </span>
          </div>
          {meta.address && (
            <p className={`text-xs leading-relaxed font-sans ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {meta.address}
            </p>
          )}
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
            <a
              href={targetMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2 px-3 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs ${getButtonAnimationClass(adv.buttonAnimation)}`}
              title="نمایش موقعیت در نقشه گوگل"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>نمایش روی نقشه</span>
            </a>
            <button
              type="button"
              onClick={(e) => handleShareLocation(e, targetMapUrl, meta.address, link.title)}
              className={`py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs ${getButtonAnimationClass(adv.buttonAnimation)}`}
              title="اشتراک‌گذاری آدرس و موقعیت مکانی"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>
      );
    }

    // 8.1 Smart Business Hours (ساعات کاری هوشمند)
    if (link.moduleType === 'business_hours') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <LiveBusinessHours
          key={link.id}
          businessHours={meta.businessHours}
          title={link.title}
          profileLanguage={profile.profileLanguage}
          isLight={isLight}
          className={`${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur} ${cardRadius}`}
          style={customCardStyle}
          animClass={getButtonAnimationClass(adv.buttonAnimation, adv.animationTrigger)}
        />
      );
    }

    // 8.7 Product Card (محصول و فروشگاه)
    if (link.moduleType === 'product_card') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-4 border shadow-md flex items-center justify-between gap-3 text-right overflow-hidden transition-all duration-300 md:hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] ${cardRadius} ${isLight ? 'bg-white/90 border-slate-200' : 'bg-white/[0.05] backdrop-blur-md border-white/10'
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
              <span className="text-xs font-sans font-bold text-cyan-400 mt-1 block">
                {meta.productPrice ? Number(meta.productPrice).toLocaleString('en-US') : '0'} {meta.productCurrency || 'AFN'}
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

    // 8. Standard Clickable Link / Button (Default - Call, Email, Waze, Donation, PDF, Custom, or Social in vertical mode)
    const rawVal =
      link.url ||
      (link.metadata?.phoneNumber as string) ||
      (link.metadata?.channelUsername as string) ||
      (link.metadata?.instagramUsername as string) ||
      (link.metadata?.linkedinUsername as string) ||
      (link.metadata?.emailAddress as string) ||
      (link.metadata?.email as string) ||
      (link.metadata?.targetId as string) ||
      '';
    const smartUrl =
      link.moduleType === 'email_direct'
        ? (rawVal.startsWith('mailto:') ? rawVal : `mailto:${rawVal}`)
        : link.moduleType === 'phone_call'
          ? (rawVal.startsWith('tel:') ? rawVal : `tel:${rawVal}`)
          : getSmartLink(link.moduleType, rawVal || link.url || '#', { preferDeepLink: true });

    let displaySubtitle = rawVal || link.url || '';
    if (link.moduleType === 'email_direct') {
      const emailVal = (link.metadata?.emailAddress as string) || link.url || '';
      const displayEmail = emailVal.replace(/^mailto:/, '').split('?')[0];
      displaySubtitle = displayEmail;
    }

    const exp = link.expiresAt || link.advancedSettings?.expiresAt;
    const isExpired = exp ? new Date(exp).getTime() < Date.now() : false;
    const maxClicks = typeof link.maxClicks === 'number' ? link.maxClicks : link.advancedSettings?.maxClicks;
    const isMaxClicksReached = typeof maxClicks === 'number' && maxClicks > 0 && (link.clickCount || 0) >= maxClicks;
    const isProtected = Boolean(
      link.hasPassword ||
      (link as any).passwordHash ||
      link.advancedSettings?.passwordHash ||
      link.advancedSettings?.hasPassword
    );
    const isDisabled = isExpired || isMaxClicksReached;

    return (
      <motion.a
        key={link.id}
        layout
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
        whileHover={{ scale: isDisabled ? 1 : 1.02, x: isDisabled ? 0 : -2 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        href={isDisabled || isProtected ? '#' : smartUrl}
        target={isDisabled || isProtected ? '_self' : (adv.openInNewTab === false || smartUrl.startsWith('tel:') || smartUrl.startsWith('mailto:') || smartUrl.startsWith('#') ? '_self' : '_blank')}
        rel="noopener noreferrer"
        onClick={(e) => {
          if (isDisabled || isProtected) {
            handleProtectedLinkClick(e, link);
          }
        }}
        className={`w-full flex items-center justify-between gap-3 text-right shadow-sm cursor-pointer overflow-hidden transition-all duration-200 ${cardShape} ${cardSize} ${cardBorderWidth} ${animClass} ${
          isDisabled ? 'opacity-50 grayscale-[40%] cursor-not-allowed' : ''
        } ${isLight
          ? 'bg-white/95 border-slate-200 hover:border-slate-300 hover:bg-white shadow-sm'
          : themeConfig.cardBlur
          }`}
        style={customCardStyle}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Module Icon */}
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-sm border border-cyan-500/20">
            {link.moduleType === 'phone_call' && <Phone className="w-4 h-4 text-green-500" />}
            {link.moduleType === 'email_direct' && <Mail className="w-4 h-4 text-amber-500" />}
            {link.moduleType === 'pdf_catalog' && <FileText className="w-4 h-4 text-rose-500" />}
            {link.moduleType === 'music_player' && <Music className="w-4 h-4 text-emerald-500" />}
            {link.moduleType === 'donation_hesabpay' && <HeartHandshake className="w-4 h-4 text-rose-500" />}
            {link.moduleType === 'whatsapp_direct' && <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-400" />}
            {link.moduleType === 'telegram_channel' && <TelegramIcon className="w-4 h-4 fill-current text-sky-400" />}
            {link.moduleType === 'instagram_profile' && <InstagramIcon className="w-4 h-4 fill-current text-pink-400" />}
            {link.moduleType === 'linkedin_profile' && <LinkedInIcon className="w-4 h-4 fill-current text-blue-400" />}
            {link.moduleType === 'twitter_x' && <XTwitterIcon className="w-4 h-4 fill-current text-foreground" />}
            {link.moduleType === 'pinterest' && <PinterestIcon className="w-4 h-4 fill-current text-rose-500" />}
            {link.moduleType === 'facebook' && <FacebookIcon className="w-4 h-4 fill-current text-blue-500" />}
            {link.moduleType === 'dribbble' && <DribbbleIcon className="w-4 h-4 fill-current text-pink-500" />}
            {link.moduleType === 'behance' && <BehanceIcon className="w-4 h-4 fill-current text-blue-500" />}
            {link.moduleType === 'youtube_channel' && <YouTubeIcon className="w-4 h-4 fill-current text-red-500" />}
            {link.moduleType === 'clubhouse' && <ClubhouseIcon className="w-4 h-4 fill-current text-amber-500" />}
            {link.moduleType === 'patreon' && <PatreonIcon className="w-4 h-4 fill-current text-rose-500" />}
            {link.moduleType === 'twitch' && <TwitchIcon className="w-4 h-4 fill-current text-purple-400" />}
            {link.moduleType === 'github' && <GitHubIcon className="w-4 h-4 fill-current text-foreground" />}
            {link.moduleType === 'aparat_channel' && <AparatIcon className="w-4 h-4 fill-current text-rose-500" />}
            {link.moduleType === 'tiktok' && <TikTokIcon className="w-4 h-4 fill-current text-foreground" />}
            {link.moduleType === 'apple_music' && <AppleMusicIcon className="w-4 h-4 fill-current text-rose-500" />}
            {link.moduleType === 'youtube_music' && <YouTubeMusicIcon className="w-4 h-4 fill-current text-red-500" />}
            {link.moduleType === 'castbox' && <CastboxIcon className="w-4 h-4 fill-current text-amber-500" />}
            {link.moduleType === 'radio_javan' && <RadioJavanIcon className="w-4 h-4 fill-current text-indigo-400" />}
            {link.moduleType === 'spotify_podcaster' && <SpotifyIcon className="w-4 h-4 fill-current text-purple-400" />}
            {link.moduleType === 'spotify' && <SpotifyIcon className="w-4 h-4 fill-current text-emerald-400" />}
            {link.moduleType === 'soundcloud' && <SoundCloudIcon className="w-4 h-4 fill-current text-amber-400" />}
            {link.moduleType === 'skype' && <SkypeIcon className="w-4 h-4 fill-current text-sky-400" />}
            {link.moduleType === 'wechat' && <WeChatIcon className="w-4 h-4 fill-current text-emerald-400" />}
            {link.moduleType === 'messenger' && <MessengerIcon className="w-4 h-4 fill-current text-blue-400" />}
            {link.moduleType === 'signal' && <SignalIcon className="w-4 h-4 fill-current text-blue-500" />}
            {link.moduleType === 'standard_link' && <Link2 className="w-4 h-4 text-cyan-500" />}
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}
                style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.95)' }}
              >
                {link.title}
              </span>
              {isExpired && (
                <span className="text-[9px] bg-rose-500/20 text-rose-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-rose-500/30 shrink-0 font-sans">
                  <Hourglass className="w-2.5 h-2.5" />
                  منقضی شده
                </span>
              )}
              {isMaxClicksReached && !isExpired && (
                <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-500/30 shrink-0 font-sans">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  تکمیل ظرفیت
                </span>
              )}
              {isProtected && !isDisabled && (
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-purple-500/30 shrink-0 font-sans">
                  <KeyRound className="w-2.5 h-2.5" />
                  رمزدار
                </span>
              )}
              {lock?.isLocked && (
                <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 border border-amber-500/30 shrink-0 font-sans">
                  <Lock className="w-2.5 h-2.5" />
                  {lock.price} {lock.currency}
                </span>
              )}
            </div>
            {formatDisplayValue(displaySubtitle) && (
              <span
                className={`font-sans font-medium tracking-wide truncate block mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-300/80'
                  }`}
                style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.8)' }}
                dir="ltr"
              >
                {formatDisplayValue(displaySubtitle)}
              </span>
            )}
          </div>
        </div>

        {isLtr ? (
          <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 shrink-0 text-slate-400" />
        )}
      </motion.a>
    );
  };

  // Dynamic overlay style (Gradient, Image, or Pattern) for Stage 3
  const getDynamicOverlayStyle = (): React.CSSProperties => {
    const bgType = themeConfig.backgroundType || 'gradient';
    if (bgType === 'gradient') {
      const colors = (themeConfig.bgGradientColors && themeConfig.bgGradientColors.length >= 2)
        ? themeConfig.bgGradientColors
        : (isLight ? ['#f8fafc', '#f1f5f9', '#e2e8f0'] : ['#090d16', '#0f172a', '#1e1b4b']);
      const gradType = themeConfig.bgGradientType || 'linear';
      const stopPos = typeof themeConfig.bgGradientPosition === 'number' ? themeConfig.bgGradientPosition : 50;

      let colorStops = '';
      if (colors.length === 2) {
        colorStops = `${colors[0]} 0%, ${colors[1]} ${stopPos}%`;
      } else if (colors.length === 3) {
        colorStops = `${colors[0]} 0%, ${colors[1]} ${stopPos}%, ${colors[2]} 100%`;
      } else {
        colorStops = colors.join(', ');
      }

      return {
        background: gradType === 'radial'
          ? `radial-gradient(circle at center, ${colorStops})`
          : `linear-gradient(135deg, ${colorStops})`,
      };
    }

    if (bgType === 'image' && themeConfig.bgImageUrl) {
      const imgOpacity = typeof themeConfig.bgImageOpacity === 'number'
        ? (themeConfig.bgImageOpacity > 1 ? themeConfig.bgImageOpacity / 100 : themeConfig.bgImageOpacity)
        : 0.25;
      return {
        backgroundImage: `url(${themeConfig.bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: imgOpacity,
      };
    }

    if (bgType === 'pattern') {
      const pid = themeConfig.bgPatternId || 'dots';
      const size = themeConfig.bgPatternSize || 24;
      const pColor = isLight ? 'rgba(0, 0, 0, 0.22)' : 'rgba(255, 255, 255, 0.22)';
      const pOpacity = typeof themeConfig.bgPatternOpacity === 'number'
        ? (themeConfig.bgPatternOpacity > 1 ? themeConfig.bgPatternOpacity / 100 : themeConfig.bgPatternOpacity)
        : 0.15;

      const pattern = PRESET_PATTERNS.find((p) => p.id === pid) || PRESET_PATTERNS.find((p) => p.id === 'dots') || PRESET_PATTERNS[0];
      const bgImg = pattern ? pattern.cssFunc(pColor, size) : `radial-gradient(circle, ${pColor} 1.5px, transparent 1.5px)`;
      const bgSize = pattern?.backgroundSize ? pattern.backgroundSize(size) : `${size}px ${size}px`;
      const bgRepeat = pattern?.backgroundRepeat || 'repeat';

      return {
        backgroundImage: bgImg,
        backgroundSize: bgSize,
        backgroundRepeat: bgRepeat,
        backgroundPosition: 'center',
        opacity: pOpacity,
      };
    }

    return {};
  };

  const getThemeBackground = () => {
    return isLight ? 'text-slate-900' : 'text-white';
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
          </div>

          {/* Overlapping 3D Avatar */}
          <div className="relative -mt-14 md:-mt-16 flex flex-col items-center z-10 px-2 md:px-5">
            <div className="relative group">
              <div
                className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 shadow-2xl relative bg-slate-800 ring-2 ring-white/10 ${isLight ? 'border-white' : 'border-slate-950'
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
                className={`text-xl md:text-2xl font-black tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'
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
                  className={`text-xs md:text-sm mt-2.5 leading-relaxed max-w-sm mx-auto font-normal ${isLight ? 'text-slate-600' : 'text-slate-300'
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
          </div>

          {/* Overlapping 3D Avatar */}
          <div className="relative -mt-14 md:-mt-16 flex flex-col items-center z-10 px-2 md:px-5">
            <div className="relative group">
              <div
                className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 shadow-2xl relative bg-slate-800 ring-2 ring-white/10 ${isLight ? 'border-white' : 'border-slate-950'
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
                className={`text-xl md:text-2xl font-black tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'
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
                  className={`text-xs md:text-sm mt-2.5 leading-relaxed max-w-sm mx-auto font-normal ${isLight ? 'text-slate-600' : 'text-slate-300'
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
        <div className="relative mb-3.5 group">
          <div
            className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 shadow-2xl relative bg-slate-800 ring-2 ring-white/10 ${isLight ? 'border-white' : 'border-slate-950'
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
          className={`text-xl md:text-2xl font-black tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'
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
            className={`text-xs md:text-sm mt-2.5 leading-relaxed max-w-sm mx-auto font-normal ${isLight ? 'text-slate-600' : 'text-slate-300'
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
        className={`min-h-screen w-full flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-white ${activeFontClass} ${getThemeBackground()}`}
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
                className={`w-full bg-background border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none text-center ${passwordError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-border focus:border-cyan-500'
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
      className={`min-h-screen w-full flex flex-col justify-between relative selection:bg-cyan-500 selection:text-white ${activeFontClass} ${isLight ? 'text-slate-900' : 'text-white'}`}
      style={{
        fontSize: `${activeFontSize}px`,
        ['--dynamic-base-size' as any]: `${activeFontSize}px`,
      }}
      data-font={isLtr ? (themeConfig.fontEn || 'inter') : (themeConfig.fontFa || 'vazirmatn')}
      dir={isLtr ? 'ltr' : 'rtl'}
    >
      {/* Layer 1 (-z-20): Base Solid Background Color */}
      <div
        className="fixed inset-0 pointer-events-none -z-20"
        style={{
          backgroundColor: themeConfig.bgSolidColor || (isLight ? '#f8fafc' : '#090d16'),
        }}
      />

      {/* Layer 2 (-z-10): Dynamic Overlay (Gradient, Image, or Pattern) */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={getDynamicOverlayStyle()}
      />
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
              className={`w-full transition-all bg-transparent border-0 shadow-none md:rounded-3xl md:overflow-hidden md:border md:shadow-2xl md:backdrop-blur-xl ${isLight
                  ? 'md:bg-white/85 md:border-slate-200/90 md:shadow-slate-200/50 text-slate-900'
                  : 'md:bg-white/[0.04] md:border-white/10 md:shadow-black/40 text-white'
                }`}
            >
              {/* 1. Header Layout: Cover, Avatar, Name, Headline, Bio */}
              {renderHeaderLayout()}

              {/* 2. UNIFIED SOCIAL NETWORKS MATRIX */}
              {hasAnySocial && (
                <div className="pt-2 pb-1 md:px-5 md:pt-3 md:pb-4">
                  <div className="flex items-center justify-center flex-wrap gap-2.5 p-2 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 backdrop-blur-md">
                    {/* WhatsApp (from profile if no module link exists) */}
                    {profile.whatsapp && !hasWhatsAppLink && (
                      <a
                        href={getSmartLink('whatsapp', profile.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="ارسال پیام در واتساپ"
                        className="w-11 h-11 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                      >
                        <WhatsAppIcon className="w-5 h-5 fill-current" />
                      </a>
                    )}

                    {/* Social links defined in profile.links */}
                    {compactSocialLinks.map((link) => renderSocialIcon(link))}

                    {/* Direct phone call in social matrix if phone exists and no dedicated phone module */}
                    {profile.phone && !hasPhoneLink && (
                      <a
                        href={getSmartLink('phone', profile.phone)}
                        title={`تماس تلفنی: ${profile.phone}`}
                        className="w-11 h-11 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
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
              className={`hidden md:flex flex-col items-center text-center p-6 rounded-3xl border shadow-xl transition-all ${isLight
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
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                      : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-200'
                    }`}
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isLtr ? 'Copy Link' : 'کپی لینک کارت'}</span>
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
                className={`p-8 text-center text-xs border border-dashed rounded-2xl ${isLight ? 'text-slate-400 border-slate-300' : 'text-white/50 border-white/20'
                  }`}
              >
                {isLtr
                  ? 'No active modules to display'
                  : isPashto
                    ? 'د ښودلو لپاره هیڅ فعال ماډل نشته'
                    : 'هیچ ماژولی برای نمایش وجود ندارد'}
              </motion.div>
            )}

            {/* ACTION BUTTONS (vCard & Share in Equal 2-Column Grid on Mobile, Full Width on Desktop) */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-1 gap-2 mt-4 mb-2">
              {/* 1. Save Contact (vCard) - Hidden on desktop */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveContact();
                }}
                className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md border border-white/20 transition-all cursor-pointer select-none md:hidden ${isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
                  }`}
                style={
                  !isLight && themeConfig.primaryColor
                    ? { background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.accentColor})` }
                    : undefined
                }
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {isLtr
                    ? 'Save Contact'
                    : isPashto
                      ? 'په اړیکو کې ساتل'
                      : 'ذخیره در مخاطبان'}
                </span>
              </motion.button>

              {/* 2. Share Profile */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare();
                }}
                className="py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer backdrop-blur-md select-none w-full"
              >
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {isLtr
                    ? 'Share'
                    : isPashto
                      ? 'شریکول'
                      : 'اشتراک‌گذاری'}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* FOOTER WATERMARK BRANDING */}
        {!profile.hideBranding && (
          <motion.div variants={itemVariants} className="pt-10 pb-6 text-center select-none shrink-0">
            <a
              href="https://aryal.ink"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs tracking-wider font-semibold inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity ${isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
            >
              <span>{isLtr ? 'Powered by ⚡' : isPashto ? 'جوړ شوی لخوا ⚡' : 'طراحی شده با ⚡'}</span>
              <span className="text-cyan-400 font-bold font-sans">Arya Link</span>
            </a>
          </motion.div>
        )}
      </motion.div>

      {/* Location Share Modal Dialog */}
      <Dialog
        open={Boolean(locationShareModal?.isOpen)}
        onOpenChange={(open) => {
          if (!open) {
            setLocationShareModal(null);
            setCopiedLocationLink(false);
          }
        }}
      >
        <DialogContent className="max-w-sm rounded-2xl bg-card border border-border p-5 text-center">
          <DialogHeader className="space-y-1 pb-2 border-b border-border text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center mx-auto mb-1">
              <MapPin className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              اشتراک‌گذاری موقعیت مکانی
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {locationShareModal?.title || 'آدرس و نقشه گوگل'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3 text-right">
            {locationShareModal?.address && (
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground leading-relaxed">
                <span className="font-bold text-muted-foreground block text-[10px] mb-0.5">آدرس ثبت‌شده:</span>
                {locationShareModal.address}
              </div>
            )}

            {/* Direct Link with 1-Click Copy */}
            <div className="w-full space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground block">
                لینک موقعیت مکانی (Google Maps):
              </span>
              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-muted/30">
                <input
                  type="text"
                  readOnly
                  value={locationShareModal?.url || ''}
                  className="flex-1 bg-transparent border-0 text-xs font-sans text-foreground px-2 focus:outline-none"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard && locationShareModal?.url) {
                      navigator.clipboard.writeText(locationShareModal.url);
                      setCopiedLocationLink(true);
                      toast.success('لینک موقعیت مکانی با موفقیت کپی شد');
                      setTimeout(() => setCopiedLocationLink(false), 2000);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${copiedLocationLink
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-xs'
                    }`}
                >
                  {copiedLocationLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی لینک</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share to Social Apps */}
            <div className="w-full space-y-2 pt-2 border-t border-border">
              <span className="text-[11px] font-bold text-muted-foreground block">
                ارسال مستقیم در پیام‌رسان‌ها:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${locationShareModal?.title || 'موقعیت مکانی'}${locationShareModal?.address ? ` - ${locationShareModal.address}` : ''}\n${locationShareModal?.url || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>واتساپ</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    locationShareModal?.url || ''
                  )}&text=${encodeURIComponent(
                    `${locationShareModal?.title || 'موقعیت مکانی'}${locationShareModal?.address ? ` - ${locationShareModal.address}` : ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <TelegramIcon className="w-4 h-4 fill-current" />
                  <span>تلگرام</span>
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Share Modal (Web & Desktop Fallback) */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-6 text-foreground shadow-2xl" dir={isLtr ? 'ltr' : 'rtl'}>
          <DialogHeader className="text-center space-y-1 pb-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center mb-1">
              <Share2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {isLtr
                ? 'Share Digital Smart Card'
                : isPashto
                  ? 'د هوښیار ډیجیټل کارت شریکول'
                  : 'اشتراک‌گذاری کارت هوشمند دیجیتال'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {isLtr
                ? 'Send your QR code or direct card link to friends and clients.'
                : isPashto
                  ? 'خپل بارکوډ یا مستقیم لینک ملګرو او پیرودونکو ته واستوئ.'
                  : 'کد بارکد یا پیوند مستقیم کارت خود را برای دوستان و مشتریان ارسال کنید.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-4 py-3">
            {/* Vector QR Code */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col items-center justify-center">
              <QRCodeSVG
                value={`https://aryal.ink/${profile.alias}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Direct Link with 1-Click Copy */}
            <div className="w-full space-y-1.5">
              <span className={`text-[11px] font-bold text-muted-foreground block ${isLtr ? 'text-left' : 'text-right'}`}>
                {isLtr
                  ? 'Exclusive Card Link:'
                  : isPashto
                    ? 'د کارت ځانګړی پیوند:'
                    : 'پیوند اختصاصی کارت:'}
              </span>
              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-muted/30">
                <input
                  type="text"
                  readOnly
                  value={`https://aryal.ink/${profile.alias}`}
                  className="flex-1 bg-transparent border-0 text-xs font-sans text-foreground px-2 focus:outline-none"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(`https://aryal.ink/${profile.alias}`);
                      setCopiedShareLink(true);
                      toast.success(
                        isLtr
                          ? 'Card link copied to clipboard'
                          : isPashto
                            ? 'د کارت پیوند کلیپ‌بورډ ته کاپي شو'
                            : 'پیوند کارت با موفقیت در کلیپ‌بورد کپی شد'
                      );
                      setTimeout(() => setCopiedShareLink(false), 2000);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${copiedShareLink
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-xs'
                    }`}
                >
                  {copiedShareLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isLtr ? 'Copied' : isPashto ? 'کاپي شو' : 'کپی شد'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isLtr ? 'Copy Link' : isPashto ? 'لینک کاپي کړئ' : 'کپی لینک'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share to Social Apps */}
            <div className="w-full space-y-2 pt-2 border-t border-border">
              <span className={`text-[11px] font-bold text-muted-foreground block ${isLtr ? 'text-left' : 'text-right'}`}>
                {isLtr
                  ? 'Direct send in messengers:'
                  : isPashto
                    ? 'په پیغام رسوونکو کې مستقیم استول:'
                    : 'ارسال مستقیم در پیام‌رسان‌ها:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${profile.displayName || 'کارت هوشمند'}: https://aryal.ink/${profile.alias}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>واتساپ</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    `https://aryal.ink/${profile.alias}`
                  )}&text=${encodeURIComponent(profile.displayName || 'کارت دیجیتال در آریا لینک')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <TelegramIcon className="w-4 h-4 fill-current" />
                  <span>تلگرام</span>
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Exchange Lead Modal (Frictionless vCard Lead Capture - Stage 72) */}
      <Dialog
        open={isLeadModalOpen}
        onOpenChange={(open) => {
          setIsLeadModalOpen(open);
          if (!open) {
            setLeadName('');
            setLeadPhone('');
          }
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm rounded-2xl h-auto z-50 bg-slate-900/95 border border-white/10 backdrop-blur-2xl p-5 text-center text-white shadow-2xl">
          {/* Ambient Lighting Accents */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <DialogHeader className="space-y-2 pb-3 border-b border-white/10 text-center relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-1.5">
              <span>
                {isLtr
                  ? 'Contact card is downloading...'
                  : isPashto
                    ? 'د اړیکې کارت د ډاونلوډ کېدو په حال کې دی...'
                    : 'کارت در حال دانلود است...'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {isLtr
                ? `For better interaction and faster support, you can also share your contact number with ${profile.displayName || 'the profile owner'} (optional).`
                : isPashto
                  ? `د غوره تعامل او چټک ملاتړ لپاره، تاسو کولی شئ خپل د اړیکې شمیره هم له ${profile.displayName || 'د پروفایل مالک'} سره شریکه کړئ (اختیاري).`
                  : `برای تعامل بهتر و پشتیبانی سریع‌تر، می‌توانید شماره تماس خود را نیز با ${profile.displayName || 'صاحب پروفایل'} به اشتراک بگذارید (اختیاری).`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitLead} className="space-y-4 pt-3 text-right relative z-10 font-sans">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-medium text-slate-200 ${isLtr ? 'text-left' : 'text-right'}`}>
                {isLtr ? 'Full Name' : isPashto ? 'نوم او تخلص' : 'نام و نام خانوادگی'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder={isLtr ? 'e.g. John Doe' : 'مثال: احمد رحیمی'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all font-sans"
                />
                <User className={`w-4 h-4 text-slate-400 absolute ${isLtr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
              </div>
            </div>

            {/* Phone Number Field (Strict English Digits via convertToEnglishDigits) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-200">
                  {isLtr ? 'Phone Number' : isPashto ? 'د اړیکې شمیره' : 'شماره تماس'}
                </label>

              </div>
              <div className="relative">
                <input
                  type="tel"
                  value={leadPhone}
                  onChange={(e) => {
                    const converted = convertToEnglishDigits(e.target.value);
                    setLeadPhone(converted);
                  }}
                  placeholder="0700 000 000"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-left font-sans text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-white/10 tracking-wider transition-all"
                />
                <Phone className={`w-4 h-4 text-slate-400 absolute ${isLtr ? 'right-3' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingLead ? (
                  <span>{isLtr ? 'Submitting...' : 'در حال ارسال...'}</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isLtr ? 'Submit Information' : isPashto ? 'معلومات واستوئ' : 'ثبت اطلاعات'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsLeadModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                {isLtr ? 'Close' : isPashto ? 'بندول' : 'بستن'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Password Verification Modal (Zero Cost Password Protected Link) */}
      <Dialog
        open={Boolean(selectedProtectedLink)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProtectedLink(null);
            setLinkPasswordInput('');
            setLinkPasswordError('');
          }
        }}
      >
        <DialogContent
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm rounded-2xl h-auto z-50 bg-slate-900/95 border border-purple-500/30 backdrop-blur-2xl p-5 text-center text-white shadow-2xl"
          dir={isLtr ? 'ltr' : 'rtl'}
        >
          <DialogHeader className="space-y-2 pb-3 border-b border-white/10 text-center relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30 shadow-inner">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-1.5">
              <span>{isLtr ? 'Protected Link' : 'لینک محافظت‌شده با رمز'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {isLtr
                ? `Enter the password to access "${selectedProtectedLink?.title}":`
                : `جهت بازگشایی «${selectedProtectedLink?.title}»، لطفاً رمز عبور را وارد کنید:`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyLinkPassword} className="space-y-4 pt-3">
            <div className="space-y-1.5 text-right">
              <input
                type="password"
                autoFocus
                placeholder={isLtr ? 'Enter password...' : 'رمز عبور را وارد کنید...'}
                value={linkPasswordInput}
                onChange={(e) => {
                  setLinkPasswordInput(e.target.value);
                  setLinkPasswordError('');
                }}
                className="w-full bg-white/5 border border-white/15 focus:border-purple-400 rounded-xl px-3.5 py-2.5 text-xs text-center text-white placeholder-slate-400 focus:outline-none transition-all font-sans"
                dir="ltr"
              />
              {linkPasswordError && (
                <p className="text-[11px] text-rose-400 text-center">
                  {linkPasswordError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={linkPasswordLoading || !linkPasswordInput.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {linkPasswordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isLtr ? 'Unlock Link' : 'ورود و بازگشایی'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProtectedLink(null);
                  setLinkPasswordInput('');
                  setLinkPasswordError('');
                }}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                {isLtr ? 'Cancel' : 'انصراف'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
