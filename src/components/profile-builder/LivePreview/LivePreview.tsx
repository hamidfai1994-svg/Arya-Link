'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editor-store';
import { LinkModuleType, ProfileLinkItem, BusinessHourDay } from '@/types/profile.types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ALL_COUNTRIES } from '@/constants/countries';
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
import { LiveCountdown } from '@/components/ui/live-countdown';
import { LiveBusinessHours } from '@/components/profile/LiveBusinessHours';
import { PaymentCheckoutModal } from '@/components/payment/PaymentCheckoutModal';
import { PAYMENT_PROVIDERS } from '@/lib/constants/paymentProviders';
import {
  MessageSquare,
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
  User,
  Phone,
  Mail,
  BadgeCheck,
  CheckCircle2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  Music,
  ShoppingBag,
  HeartHandshake,
  Timer,
  Clock,
  Calendar,
  Navigation,
  Search,
  ExternalLink,
  Play,
  HelpCircle,
  Video,
  DollarSign,
  Layers,
  Sliders,
  QrCode,
  Share2,
  Folder,
  Copy,
  Check,
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PRESET_PATTERNS } from '@/lib/backgrounds';

export const LivePreview: React.FC = () => {
  const {
    profile,
    selectedDeviceId,
    setDevice,
    activeModuleId,
    setActiveModuleId,
    setExpandedModuleId,
    unconfirmedModuleId,
    moveLink,
    reorderLinks,
    saveProfileData,
  } = useEditorStore();
  const { themeConfig } = profile;

  const [activeVerticalDragId, setActiveVerticalDragId] = useState<string | null>(null);
  const [activeSocialDragId, setActiveSocialDragId] = useState<string | null>(null);

  // Debounced auto-save for drag & drop operations to prevent race conditions
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveProfileData();
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [locationShareModal, setLocationShareModal] = useState<{
    isOpen: boolean;
    url: string;
    address?: string;
    title?: string;
  } | null>(null);
  const [copiedLocationLink, setCopiedLocationLink] = useState(false);
  const [previewPaymentModalLink, setPreviewPaymentModalLink] = useState<ProfileLinkItem | null>(null);

  // Dynamic background style based directly on themeConfig.backgroundType (Stage 6)
  const getThemeBackgroundStyle = (): React.CSSProperties => {
    const bgType = themeConfig.backgroundType || 'gradient';
    if (bgType === 'solid') {
      return {
        backgroundColor: themeConfig.bgSolidColor || (isLight ? '#f8fafc' : '#090d16'),
      };
    }
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
    return {
      backgroundColor: themeConfig.bgSolidColor || (isLight ? '#f8fafc' : '#090d16'),
    };
  };

  const getOverlayStyle = (): React.CSSProperties => {
    if (themeConfig.backgroundType === 'image' && themeConfig.bgImageUrl) {
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

    if (themeConfig.backgroundType === 'pattern') {
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

  const handleTreeReorder = (
    links: ProfileLinkItem[],
    activeId: string,
    overId: string
  ): ProfileLinkItem[] => {
    if (activeId === overId) return links;

    const activeIndex = links.findIndex((l) => l.id === activeId);
    if (activeIndex === -1) return links;
    const activeItem = links[activeIndex];

    const overIndex = links.findIndex((l) => l.id === overId);
    if (overIndex === -1) return links;
    const overItem = links[overIndex];

    // Containers cannot be placed inside another container
    if (activeItem.moduleType === 'container_group') {
      const newLinks = [...links];
      const [moved] = newLinks.splice(activeIndex, 1);
      moved.parentId = null;
      const newOverIndex = newLinks.findIndex((l) => l.id === overId);
      newLinks.splice(newOverIndex, 0, moved);
      return newLinks.map((item, idx) => ({ ...item, order: idx }));
    }

    // Dropping onto a container -> become child
    if (overItem.moduleType === 'container_group') {
      const newLinks = [...links];
      const [moved] = newLinks.splice(activeIndex, 1);
      moved.parentId = overItem.id;
      const newOverIndex = newLinks.findIndex((l) => l.id === overId);
      newLinks.splice(newOverIndex + 1, 0, moved);
      return newLinks.map((item, idx) => ({ ...item, order: idx }));
    }

    // Dropping onto a child inside a container -> adopt container
    if (overItem.parentId) {
      const newLinks = [...links];
      const [moved] = newLinks.splice(activeIndex, 1);
      moved.parentId = overItem.parentId;
      const newOverIndex = newLinks.findIndex((l) => l.id === overId);
      newLinks.splice(newOverIndex, 0, moved);
      return newLinks.map((item, idx) => ({ ...item, order: idx }));
    }

    // Dropping onto top-level item -> become top-level
    const newLinks = [...links];
    const [moved] = newLinks.splice(activeIndex, 1);
    moved.parentId = null;
    const newOverIndex = newLinks.findIndex((l) => l.id === overId);
    newLinks.splice(newOverIndex, 0, moved);
    return newLinks.map((item, idx) => ({ ...item, order: idx }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSocialDragStart = (event: DragStartEvent) => {
    setActiveSocialDragId(String(event.active.id));
  };

  const handleSocialDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const reordered = handleTreeReorder(
        [...profile.links],
        String(active.id),
        String(over.id)
      );
      reorderLinks(reordered);
      debouncedSave(); // Auto-save for D&D with 1000ms debounce
      toast.success('ترتیب آیکون‌های شبکه اجتماعی به‌روزرسانی و ذخیره شد');
    }
    setActiveSocialDragId(null);
  };

  const handleSocialDragCancel = () => {
    setActiveSocialDragId(null);
  };

  const activeSocialDragLink = activeSocialDragId
    ? profile.links.find((l) => l.id === activeSocialDragId)
    : null;

  const handleVerticalDragStart = (event: DragStartEvent) => {
    setActiveVerticalDragId(String(event.active.id));
  };

  const handleVerticalDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const reordered = handleTreeReorder(
        [...profile.links],
        String(active.id),
        String(over.id)
      );
      reorderLinks(reordered);
      debouncedSave(); // Auto-save for D&D with 1000ms debounce
      toast.success('ترتیب ماژول‌ها در پیش‌نمایش به‌روزرسانی و ذخیره شد');
    }
    setActiveVerticalDragId(null);
  };

  const handleVerticalDragCancel = () => {
    setActiveVerticalDragId(null);
  };

  const activeVerticalDragLink = activeVerticalDragId
    ? profile.links.find((l) => l.id === activeVerticalDragId)
    : null;

  const handleModuleClick = (id: string) => {
    if (unconfirmedModuleId && unconfirmedModuleId !== id) {
      toast.error('ماژول قبلی دارای تغییرات تاییدنشده است. لطفاً ابتدا آن را تایید یا لغو کنید.');
      return;
    }
    setActiveModuleId(id);
    setExpandedModuleId(id);
  };

  const [previewTab, setPreviewTab] = useState<'iphone' | 'android' | 'qr'>('iphone');
  const isLight = themeConfig.preset === 'minimal_light';
  const isLtr = profile.profileLanguage === 'en';
  const isPashto = profile.profileLanguage === 'pashto';
  const isVerifiedApproved = Boolean(profile.isVerified && profile.verificationStatus === 'verified');
  const previewFontClass = isLtr
    ? (themeConfig.fontEn ? `font-${themeConfig.fontEn}` : 'font-inter')
    : (themeConfig.fontFa ? `font-${themeConfig.fontFa}` : 'font-vazirmatn');
  const previewFontSize = isLtr
    ? (themeConfig.fontSizeEn || 14)
    : isPashto
      ? (themeConfig.fontSizePashto || 15)
      : (themeConfig.fontSizeDari || 15);
  const [searchFilter, setSearchFilter] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const handleDownloadPNG = () => {
    const canvas = (document.getElementById('profile-qr-canvas-hires') ||
      document.getElementById('profile-qr-canvas')) as HTMLCanvasElement;
    if (!canvas) {
      toast.error('خطا در دسترسی به بارکد');
      return;
    }
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `aryalink-${profile.alias || 'qrcode'}.png`;
    a.click();
    toast.success('تصویر PNG با کیفیت فوق‌العاده بارکد با موفقیت دانلود شد');
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById('profile-qr-svg');
    if (!svg) {
      toast.error('خطا در دسترسی به بارکد وکتور');
      return;
    }
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aryalink-${profile.alias || 'qrcode'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('فایل SVG وکتور بارکد با موفقیت دانلود شد');
  };

  const handleDownloadJPG = () => {
    const canvas = (document.getElementById('profile-qr-canvas-hires') ||
      document.getElementById('profile-qr-canvas')) as HTMLCanvasElement;
    if (!canvas) {
      toast.error('خطا در دسترسی به بارکد');
      return;
    }
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    const url = tempCanvas.toDataURL('image/jpeg', 1.0);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aryalink-${profile.alias || 'qrcode'}.jpg`;
    a.click();
    toast.success('تصویر JPG با کیفیت فوق‌العاده بارکد با موفقیت دانلود شد');
  };

  const handleShare = async () => {
    const profileUrl = `https://aryal.ink/${profile.alias}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: profile.displayName || 'کارت ویزیت هوشمند آریا لینک',
          text: `کارت دیجیتال ${profile.displayName || ''} در آریا لینک:`,
          url: profileUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    // Desktop or Web Share fallback: open share modal with Link & QR Code
    setIsShareModalOpen(true);
  };

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

    // Fallback: Desktop or Web Share unsupported -> open dialog modal
    setLocationShareModal({
      isOpen: true,
      url,
      address,
      title: shareTitle,
    });
  };

  const handleSaveContact = () => {
    try {
      const filename = downloadVCard(profile);
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
      toast.error('لطفاً حداقل شماره تماس یا نام خود را وارد کنید.');
      return;
    }

    setIsSubmittingLead(true);
    try {
      const cleanPhone = convertToEnglishDigits(leadPhone.trim());
      const cleanName = leadName.trim();

      // Log Lead & Mock API submission
      console.log('Lead captured via vCard exchange:', {
        name: cleanName,
        phone: cleanPhone,
        profileAlias: profile.alias,
        profileId: profile.id,
        createdAt: new Date().toISOString(),
      });

      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 350));

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
      console.error('Failed to submit lead:', err);
      toast.error('خطا در ثبت اطلاعات.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const resolveDisplayName =
    profile.displayName ||
    (isLtr ? 'Your Name' : isPashto ? 'ستاسو نوم' : 'نام شما');

  const resolveHeadline =
    profile.headline ||
    (isLtr ? 'Job Title / Profession' : isPashto ? 'دندې سرلیک / تخصص' : 'عنوان شغلی / تخصص');

  const resolveBio = profile.bio || '';

  // Social modules separated into grid icon row
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

  const getButtonAnimationClass = (anim?: string, trigger?: string) => {
    if (!anim || anim === 'none') return '';
    if (trigger === 'hover') {
      return `animate-hover-${anim}`;
    }
    return `animate-${anim}`;
  };

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

  // Compact social icons rendered horizontally in top matrix (only standalone ones without parentId)
  const compactSocialLinks = profile.links.filter(
    (l) =>
      l.isActive &&
      !l.advancedSettings?.isHidden &&
      !l.parentId &&
      socialModuleTypes.includes(l.moduleType) &&
      l.advancedSettings?.isCompactIcon !== false
  );

  // Top-level vertical modules (includes containers and standalone non-compact modules)
  const topLevelNonSocialLinks = profile.links.filter((l) => {
    if (!l.isActive || l.advancedSettings?.isHidden) return false;
    if (l.parentId) return false; // Child of a container
    if (socialModuleTypes.includes(l.moduleType) && l.advancedSettings?.isCompactIcon !== false) {
      return false; // Rendered in top social matrix
    }
    return true;
  });

  const filteredNonSocialLinks = topLevelNonSocialLinks.filter((l) => {
    return searchFilter ? l.title.toLowerCase().includes(searchFilter.toLowerCase()) : true;
  });

  const getContainerChildren = (containerId: string) =>
    profile.links.filter((l) => l.isActive && !l.advancedSettings?.isHidden && l.parentId === containerId);

  const renderSocialIcon = (link: ProfileLinkItem) => {
    const rawVal =
      link.url ||
      (link.metadata?.phoneNumber as string) ||
      (link.metadata?.channelUsername as string) ||
      (link.metadata?.instagramUsername as string) ||
      (link.metadata?.linkedinUsername as string) ||
      (link.metadata?.emailAddress as string) ||
      (link.metadata?.targetId as string) ||
      '';
    const smartUrl =
      link.moduleType === 'email_direct'
        ? `mailto:${rawVal}`
        : getSmartLink(link.moduleType, rawVal, { preferDeepLink: true });
    const cardShape = getButtonShapeClass(
      link.advancedSettings?.customStyling?.buttonShape,
      link.advancedSettings?.customStyling?.borderRadius
    );
    const cardRadius = cardShape;
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

    return (
      <a
        key={link.id}
        href={smartUrl}
        target="_blank"
        rel="noreferrer"
        title={link.title}
        className={`w-11 h-11 ${cardShape} ${animClass} ${sInfo.classes} flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
        style={iconStyle}
      >
        {sInfo.icon}
      </a>
    );




  };

  const renderModuleCard = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};
    const adv = link.advancedSettings || {};
    const lock = adv.monetization;
    const customStyle = adv.customStyling;

    // Custom overrides if defined
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
                <div
                  key={child.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleModuleClick(child.id);
                  }}
                  className={`cursor-pointer transition-transform hover:scale-105 active:scale-95 ${activeModuleId === child.id
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 rounded-2xl shadow-md scale-105'
                    : ''
                    }`}
                  title={`ویرایش ماژول: ${child.title}`}
                >
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
                <div
                  key={child.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleModuleClick(child.id);
                  }}
                  className={`cursor-pointer transition-all ${activeModuleId === child.id
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 rounded-2xl shadow-md'
                    : ''
                    }`}
                >
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
          {link.title && (
            <h3
              className="font-bold mb-1 opacity-90"
              style={{ fontSize: 'calc(var(--dynamic-base-size) * 1.05)' }}
            >
              {link.title}
            </h3>
          )}
          <p
            className="leading-relaxed opacity-85 whitespace-pre-wrap font-sans"
            style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.9)' }}
          >
            {meta.simpleTextContent || 'متن پیش‌فرض'}
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
      return (
        <div
          key={link.id}
          style={{ height: `${height}px` }}
          className="w-full flex items-center justify-center opacity-30 select-none"
        >
          <div className="w-6 h-[1px] bg-foreground/20 rounded-full" />
        </div>
      );
    }

    // 2. Interactive Search
    if (link.moduleType === 'profile_search') {
      return (
        <div key={link.id} className="relative mb-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="جستجو در بین خدمات و لینک‌ها..."
            className={`w-full rounded-2xl pr-8 pl-3 py-2 text-xs border focus:outline-none ${isLight
              ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              : 'bg-white/10 border-white/20 text-white placeholder:text-slate-300'
              }`}
          />
        </div>
      );
    }

    // 3. YouTube Embed
    if (link.moduleType === 'youtube_embed' && meta.youtubeVideoId) {
      return (
        <div
          key={link.id}
          className={`w-full rounded-2xl border overflow-hidden shadow-sm p-2 space-y-1.5 ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
        >
          <div className="flex items-center gap-2 px-1">
            <Youtube className="w-4 h-4 text-red-500" />
            <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title}
            </span>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${meta.youtubeVideoId}`}
              title={link.title}
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    // 3.5. Aparat Embed
    if (link.moduleType === 'aparat_embed') {
      const vidId = meta.aparatVideoId || (meta.aparatUrl ? meta.aparatUrl.split('/v/')[1] : '');
      return (
        <div
          key={link.id}
          className={`w-full rounded-2xl border overflow-hidden shadow-sm p-2 space-y-1.5 ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
        >
          <div className="flex items-center gap-2 px-1 text-rose-500">
            <Play className="w-4 h-4 fill-current" />
            <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title}
            </span>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative">
            {vidId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.aparat.com/video/video/embed/videohash/${vidId}/vt/frame`}
                title={link.title}
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                <Play className="w-6 h-6 mb-1 text-rose-500" />
                <span>ویدیو آپارات (در انتظار تنظیم آی دی)</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 4. Single Image / Banner
    if (link.moduleType === 'single_image' && meta.singleImageUrl) {
      return (
        <a
          key={link.id}
          href={meta.singleImageLink || '#'}
          target={meta.singleImageLink ? '_blank' : '_self'}
          rel="noreferrer"
          onClick={(e) => e.preventDefault()}
          className={`block w-full rounded-2xl border overflow-hidden shadow-sm group transition-transform active:scale-98 ${isLight ? 'border-slate-200 bg-white' : 'border-white/20 bg-white/5'
            }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.singleImageUrl}
            alt={link.title}
            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {link.title && (
            <div className={`p-2 text-center text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {link.title}
            </div>
          )}
        </a>
      );
    }

    // 4.1 Image Gallery
    if (link.moduleType === 'image_gallery' && meta.imageUrls?.length) {
      return (
        <div key={link.id} className="space-y-1.5 text-right">
          {link.title && (
            <span className={`text-xs font-bold block px-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {link.title}
            </span>
          )}
          <div className="grid grid-cols-2 gap-2">
            {meta.imageUrls.map((imgUrl: string, idx: number) => (
              <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-border shadow-sm group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={`gallery-${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4.2 Image Slider
    if (link.moduleType === 'image_slider' && meta.imageUrls?.length) {
      return (
        <div key={link.id} className="space-y-1.5 text-right">
          {link.title && (
            <span className={`text-xs font-bold block px-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {link.title}
            </span>
          )}
          <div className="w-full overflow-x-auto flex gap-2 pb-1 custom-scrollbar snap-x">
            {meta.imageUrls.map((imgUrl: string, idx: number) => (
              <div key={idx} className="min-w-[85%] rounded-2xl overflow-hidden aspect-[16/9] border border-border shadow-md shrink-0 snap-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={`slide-${idx}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-sans">
                  {idx + 1} / {meta.imageUrls.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 5. Product Card
    if (link.moduleType === 'product_card') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-3 border shadow-sm flex items-center justify-between gap-3 text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {meta.productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.productImage}
                alt={meta.productTitle || link.title}
                className={`w-12 h-12 object-cover shrink-0 border border-border ${cardRadius}`}
              />
            ) : (
              <div className={`w-12 h-12 bg-teal-500/20 text-teal-500 flex items-center justify-center shrink-0 ${cardRadius}`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <span
                className={`font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}
                style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.95)' }}
              >
                {link.title || meta.productTitle}
              </span>
              <span
                className="font-sans font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 block"
                style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.85)' }}
              >
                {meta.productPrice?.toLocaleString('en-US') || '0'} {meta.productCurrency || 'AFN'}
              </span>
            </div>
          </div>

          <a
            href={meta.productBuyUrl || link.url || '#'}
            target={adv.openInNewTab !== false ? '_blank' : '_self'}
            rel="noreferrer"
            onClick={(e) => e.preventDefault()}
            className={`px-3 py-1.5 ${cardRadius} bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 shadow-md transition-all active:scale-95 ${getButtonAnimationClass(adv.buttonAnimation)}`}
          >
            سفارش
          </a>
        </div>
      );
    }

    // 5.1 Sale / Direct Checkout
    if (link.moduleType === 'sale_checkout') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-3.5 border shadow-sm flex items-center justify-between gap-3 text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span
                className={`font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}
                style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.95)' }}
              >
                {link.title || meta.checkoutItemName}
              </span>
              <span
                className="font-sans font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block"
                style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.85)' }}
              >
                {meta.checkoutAmount?.toLocaleString('en-US') || '500'} {meta.paymentCurrency || 'AFN'}
              </span>
            </div>
          </div>
          <a
            href={link.url || '#'}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.preventDefault()}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 shadow-md transition-all active:scale-95 flex items-center gap-1"
          >
            <CreditCard className="w-3.5 h-3.5" />
            پرداخت آنلاین
          </a>
        </div>
      );
    }

    // 6. FAQ Accordion
    if (link.moduleType === 'faq_accordion' && meta.faqItems?.length) {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full border p-3 shadow-sm space-y-2 text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2 pb-1 border-b border-border/50">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title}
            </span>
          </div>
          <div className="space-y-1.5">
            {meta.faqItems.map((faq: any, i: number) => {
              const isOpen = openFaqId === `${link.id}_${i}`;
              return (
                <div key={i} className={`border border-border/60 overflow-hidden bg-background/50 ${cardRadius}`}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : `${link.id}_${i}`)}
                    className="w-full p-2 text-right flex items-center justify-between text-xs font-semibold"
                  >
                    <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>{faq.question}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className={`px-2 pb-2 text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 6.1 Contact Form & Lead Capture (فرم تماس)
    if (link.moduleType === 'contact_form' || link.moduleType === 'lead_capture_form') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-4 border shadow-sm space-y-3 text-right ${cardRadius} ${isLight ? 'bg-white/95 border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
            <Mail className="w-4 h-4 text-amber-500" />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title || meta.leadHeadline || 'فرم تماس'}
            </span>
          </div>
          <div className="space-y-2 text-right font-sans">
            <div>
              <label className={`block text-[10px] font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                placeholder="مثال: علی احمدی"
                readOnly
                className={`w-full ${cardRadius} px-3 py-1.5 text-xs border focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                  }`}
              />
            </div>
            <div>
              <label className={`block text-[10px] font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                شماره تماس
              </label>
              <div className="flex gap-2 w-full" dir="ltr">
                <select
                  disabled
                  defaultValue="+93"
                  style={{ fontFamily: 'var(--font-vazirmatn), var(--font-inter), sans-serif' }}
                  className={`w-[110px] shrink-0 p-1.5 border rounded-xl text-xs font-sans font-medium bg-transparent ${isLight ? 'border-slate-200 text-slate-800' : 'border-white/10 text-white'}`}
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
                  placeholder="782698484"
                  readOnly
                  dir="ltr"
                  className={`flex-1 min-w-0 ${cardRadius} px-3 py-1.5 text-xs font-sans text-left border focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-slate-500'}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-[10px] font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                پیام شما
              </label>
              <textarea
                rows={2}
                placeholder="پیام یا درخواست خود را اینجا بنویسید..."
                readOnly
                className={`w-full ${cardRadius} px-3 py-1.5 text-xs resize-none border focus:outline-none font-sans ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                  }`}
              />
            </div>
            <button
              type="button"
              className={`w-full py-2 ${cardRadius} bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-98`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>ارسال پیام</span>
            </button>
          </div>
        </div>
      );
    }

    // 6.2 Video Meeting
    if (link.moduleType === 'video_meeting') {
      const platformName = meta.meetingPlatform === 'zoom' ? 'Zoom Meeting' : meta.meetingPlatform === 'teams' ? 'Microsoft Teams' : 'Google Meet';
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);

      return (
        <div
          key={link.id}
          className={`w-full p-3 border shadow-sm flex items-center justify-between gap-3 text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-9 h-9 ${cardRadius} bg-teal-500/20 text-teal-500 flex items-center justify-center shrink-0 border border-teal-500/30`}>
              <Video className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {link.title}
              </span>
              <span className="text-[10px] font-sans text-teal-600 dark:text-teal-400 block mt-0.5">
                {platformName}
              </span>
            </div>
          </div>
          <a
            href={meta.meetingUrl || link.url || '#'}
            target={adv.openInNewTab !== false ? '_blank' : '_self'}
            rel="noreferrer"
            onClick={(e) => e.preventDefault()}
            className={`px-3 py-1.5 ${cardRadius} bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 shadow-md transition-all active:scale-95 flex items-center gap-1 ${getButtonAnimationClass(adv.buttonAnimation)}`}
          >
            <Video className="w-3 h-3" />
            ورود به جلسه
          </a>
        </div>
      );
    }

    // 7. Countdown Timer
    if (link.moduleType === 'countdown_timer') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <LiveCountdown
          key={link.id}
          targetDate={meta.countdownTargetDate}
          title={link.title || meta.countdownTitle}
          isLight={isLight}
          className={`${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur} ${cardRadius}`}
          style={customCardStyle}
        />
      );
    }

    // 7.1 Map Navigation
    if (link.moduleType === 'map_navigation') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-3.5 border shadow-sm space-y-2 text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-sky-500" />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <a
              href={meta.googleMapsLink || link.url || 'https://maps.google.com'}
              target={adv.openInNewTab !== false ? '_blank' : '_self'}
              rel="noreferrer"
              onClick={(e) => e.preventDefault()}
              className={`py-1.5 px-2 ${cardRadius} bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${getButtonAnimationClass(adv.buttonAnimation)}`}
            >
              <MapPin className="w-3.5 h-3.5" />
              گوگل مپ
            </a>
            <a
              href={meta.wazeLink || 'https://waze.com'}
              target={adv.openInNewTab !== false ? '_blank' : '_self'}
              rel="noreferrer"
              onClick={(e) => e.preventDefault()}
              className={`py-1.5 px-2 ${cardRadius} bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${getButtonAnimationClass(adv.buttonAnimation)}`}
            >
              <Navigation className="w-3.5 h-3.5" />
              ویز
            </a>
          </div>
        </div>
      );
    }

    // 7.2 Location (موقعیت مکانی)
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
          className={`w-full p-3.5 border shadow-sm space-y-2.5 text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
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
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              {meta.address}
            </p>
          )}
          <div className="pt-2 border-t border-border/30 grid grid-cols-2 gap-2">
            <a
              href={targetMapUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.preventDefault()}
              className={`py-1.5 px-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs ${getButtonAnimationClass(adv.buttonAnimation)}`}
              title="نمایش موقعیت در نقشه گوگل"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>نمایش روی نقشه</span>
            </a>
            <button
              type="button"
              onClick={(e) => handleShareLocation(e, targetMapUrl, meta.address, link.title)}
              className={`py-1.5 px-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs ${getButtonAnimationClass(adv.buttonAnimation)}`}
              title="اشتراک‌گذاری آدرس و موقعیت مکانی"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>
      );
    }

    // 7.3 Smart Business Hours (ساعات کاری هوشمند)
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

    // 8. Standard / General Link Buttons (Call, Email, Waze, Donation, PDF, Custom, or Social in vertical mode)
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

    let displaySubtitle = rawVal || link.url || '';
    if (link.moduleType === 'payment') {
      const pType = meta.paymentProviderType || 'wallet';
      const pDef = PAYMENT_PROVIDERS[pType];
      if (meta.paymentAmount) {
        displaySubtitle = `${meta.paymentAmount.toLocaleString('fa-IR')} ${meta.paymentCurrency === 'USD' ? 'دالر' : 'افغانی'}${pDef ? ` (${pDef.title})` : ''}`;
      } else if (pDef) {
        displaySubtitle = pDef.title;
      }
    } else if (link.moduleType === 'email_direct') {
      const emailVal = (link.metadata?.emailAddress as string) || link.url || '';
      const displayEmail = emailVal.replace(/^mailto:/, '').split('?')[0];
      displaySubtitle = displayEmail;
    }

    return (
      <motion.a
        key={link.id}
        layout
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
        whileHover={{ scale: 1.02, x: -2 }}
        whileTap={{ scale: 0.98 }}
        href={link.url}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (
            link.moduleType === 'payment' ||
            link.moduleType === 'donation_hesabpay' ||
            link.url === '#payment-modal' ||
            link.url?.includes('payment-modal') ||
            link.url === '#payment' ||
            link.url?.includes('#payment')
          ) {
            setPreviewPaymentModalLink(link);
          }
        }}
        target={adv.openInNewTab === false || link.url.startsWith('tel:') || link.url.startsWith('mailto:') || link.url.startsWith('#') ? '_self' : '_blank'}
        rel="noopener noreferrer"
        className={`w-full flex items-center justify-between gap-3 text-right shadow-sm cursor-pointer overflow-hidden transition-all duration-200 ${cardShape} ${cardSize} ${cardBorderWidth} ${animClass} ${isLight
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
            {link.moduleType === 'payment' && <CreditCard className="w-4 h-4 text-emerald-400" />}
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
            <div className="flex items-center gap-1.5">
              <span
                className={`font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}
                style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.95)' }}
              >
                {link.title}
              </span>
              {lock?.isLocked && (
                <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 border border-amber-500/30 shrink-0 font-sans">
                  <Lock className="w-2.5 h-2.5" />
                  {lock.price} {lock.currency}
                </span>
              )}
            </div>
            {displaySubtitle && (
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

  return (
    <div className="flex-1 h-full bg-slate-100/70 dark:bg-slate-950/60 p-4 md:p-8 flex flex-col items-center justify-center overflow-hidden relative select-none">
      {/* Decorative Lighting */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Device & QR Toolbar */}
      <div className="z-10 mb-4 bg-card/90 backdrop-blur-md border border-border rounded-full p-1.5 flex items-center gap-1.5 shadow-xl flex-wrap justify-center">
        <span className="text-[11px] font-semibold text-muted-foreground px-2">پیش‌نمایش:</span>
        <button
          onClick={() => {
            setPreviewTab('iphone');
            setDevice('iphone');
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${previewTab === 'iphone'
            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          iPhone
        </button>
        <button
          onClick={() => {
            setPreviewTab('android');
            setDevice('android');
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${previewTab === 'android'
            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Android
        </button>
        <button
          onClick={() => setPreviewTab('qr')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${previewTab === 'qr'
            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>ساخت QR کد</span>
        </button>
      </div>

      {previewTab === 'qr' ? (
        /* Dedicated QR Code Generator Component */
        <div className="relative w-[340px] bg-card border border-border rounded-[34px] p-6 space-y-4 flex flex-col items-center animate-in zoom-in-95 duration-200 text-center select-text" dir="rtl">
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/20 mb-1">
              <QrCode className="w-3.5 h-3.5" />
              <span>کد QR هوشمند اختصاصی</span>
            </div>
            <h3 className="text-sm font-bold text-foreground">
              تولید و دانلود بارکد صفحه
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              با اسکن این بارکد، کارت هوشمند شما فوراً در مرورگر گوشی مخاطب باز می‌شود.
            </p>
          </div>

          {/* QR Display Container */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative">
            <QRCodeCanvas
              id="profile-qr-canvas"
              value={`https://aryal.ink/${profile.alias}`}
              size={190}
              level="H"
              includeMargin={true}
            />
            {/* Hidden Hi-Res Canvas and SVG elements for high-resolution 1500px print-ready download */}
            <div className="hidden">
              <QRCodeCanvas
                id="profile-qr-canvas-hires"
                value={`https://aryal.ink/${profile.alias}`}
                size={1500}
                level="H"
                includeMargin={true}
              />
              <QRCodeSVG
                id="profile-qr-svg"
                value={`https://aryal.ink/${profile.alias}`}
                size={1500}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="mt-2 px-3 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-sans font-semibold border border-slate-200" dir="ltr">
              aryal.ink/{profile.alias}
            </div>
          </div>

          {/* Exactly 3 Equal-Width Buttons in ONE Row (grid grid-cols-3 gap-2) */}
          <div className="w-full space-y-1.5">
            <span className="text-[11px] font-bold text-foreground block text-right">
              دانلود بارکد برای چاپ و وب:
            </span>
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="py-2 px-2.5 rounded-xl bg-muted hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 text-foreground font-bold text-xs border border-border flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs"
                title="دانلود نسخه PNG مناسب اشتراک‌گذاری"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSVG}
                className="py-2 px-2.5 rounded-xl bg-muted hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 text-foreground font-bold text-xs border border-border flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs"
                title="دانلود نسخه وکتور SVG بدون افت کیفیت"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SVG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJPG}
                className="py-2 px-2.5 rounded-xl bg-muted hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 text-foreground font-bold text-xs border border-border flex items-center justify-center gap-1 transition-all active:scale-95 shadow-xs"
                title="دانلود نسخه JPG با پس‌زمینه سفید"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JPG</span>
              </button>
            </div>
          </div>

          {/* 100% Full-Width Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/25 transition-all active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>اشتراک‌گذاری کد و لینک</span>
          </button>

          {/* 100% Full-Width Live Profile View Button */}
          <a
            href={`/${profile.alias}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-card hover:bg-muted text-foreground border border-border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-cyan-500" />
            <span>مشاهده زنده صفحه پروفایل</span>
          </a>
        </div>
      ) : (
        /* Virtual Smartphone Frame */
        <div
          className={`relative w-[340px] h-[690px] bg-black p-[11px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1),0_0_40px_rgba(6,182,212,0.15)] ring-1 ring-slate-800 transition-all duration-300 ${selectedDeviceId === 'iphone' ? 'rounded-[54px]' : 'rounded-[34px]'
            }`}
        >
          {/* Camera Cutout: Dynamic Island for iPhone, Punch-hole for Android */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
            {selectedDeviceId === 'iphone' ? (
              /* Apple Dynamic Island: Pill shape */
              <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-white/10 transition-all duration-300">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            ) : (
              /* Android Punch-hole Camera: Single centered circle */
              <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-700/60 shadow-inner flex items-center justify-center transition-all duration-300 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>
            )}
          </div>

          {/* Screen Glass Surface */}
          <div
            className={`w-full h-full overflow-hidden flex flex-col relative transition-all duration-300 ${previewFontClass} ${selectedDeviceId === 'iphone' ? 'rounded-[44px]' : 'rounded-[24px]'
              }`}
            data-font={isLtr ? (themeConfig.fontEn || 'inter') : (themeConfig.fontFa || 'vazirmatn')}
            style={{
              ...getThemeBackgroundStyle(),
              fontSize: `${previewFontSize}px`,
              ['--dynamic-base-size' as any]: `${previewFontSize}px`,
            }}
            dir={isLtr ? 'ltr' : 'rtl'}
          >
            {/* Pattern or Image Overlay Layer (Stage 6) */}
            {(themeConfig.backgroundType === 'pattern' || themeConfig.backgroundType === 'image') && (
              <div
                className="absolute inset-0 pointer-events-none -z-0"
                style={getOverlayStyle()}
              />
            )}
            {/* Direct Mode Alert */}
            {profile.directModeEnabled && (
              <div className="z-20 bg-emerald-500 text-slate-950 text-[10px] font-bold py-1 px-3 text-center flex items-center justify-center gap-1.5 shadow-md shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                {isLtr ? 'Direct mode active (NFC tap redirects immediately)' : 'حالت مستقیم فعال است (تپ NFC مخاطب را مستقیماً هدایت می‌کند)'}
              </div>
            )}

            {/* Scrollable Screen Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="min-h-full flex flex-col">
                {/* Header Layout 1: CURVE */}
                {(profile.headerLayout || 'curve') === 'curve' && (
                  <div className="flex flex-col items-center text-center mb-4 shrink-0">
                    {/* Cover Photo with Curved Lower Edge via CSS clip-path directly on cover */}
                    <div className="relative w-full h-40 overflow-hidden shrink-0 [clip-path:ellipse(85%_100%_at_50%_0%)]">
                      {profile.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.accentColor})`,
                          }}
                        />
                      )}
                    </div>

                    {/* Circular Avatar: Half on cover, half on background below */}
                    <div className="relative -mt-12 mb-3 z-10 shrink-0">
                      <div className="relative group">
                        <div
                          className="absolute -inset-1 rounded-full opacity-60 blur-md transition duration-500"
                          style={{
                            background: `linear-gradient(45deg, ${themeConfig.primaryColor}, ${themeConfig.accentColor})`,
                          }}
                        />
                        {/* Fixed Avatar Container */}
                        <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-white dark:border-slate-900 shadow-2xl bg-slate-800">
                          {profile.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profile.avatarUrl}
                              alt={resolveDisplayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                              {resolveDisplayName?.trim().charAt(0) || <User className="w-8 h-8 text-white" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Display Name, Headline, Bio */}
                    <div className="px-4 w-full">
                      <h2
                        className={`font-bold tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}
                        style={{ fontSize: 'calc(var(--dynamic-base-size) * 1.15)' }}
                      >
                        <span>{resolveDisplayName || 'نام شما'}</span>
                        {isVerifiedApproved && (
                          <BadgeCheck className="w-4 h-4 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                        )}
                      </h2>

                      <p
                        className={`font-semibold mt-0.5 ${isLight ? 'text-blue-600' : 'text-cyan-300/90'}`}
                        style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.95)' }}
                      >
                        {resolveHeadline || (isLtr ? 'Job Title / Profession' : 'عنوان شغلی / تخصص')}
                      </p>

                      {resolveBio && (
                        <p
                          className={`mt-2 leading-relaxed max-w-[260px] mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300/80'}`}
                          style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.85)' }}
                        >
                          {resolveBio}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Header Layout 2: GRADIENT MASK */}
                {profile.headerLayout === 'gradient_mask' && (
                  <div className="relative w-full mb-4 shrink-0">
                    {/* Horizontal Cover Photo fading into background using CSS Mask */}
                    <div className="relative w-full h-40 overflow-hidden shrink-0 [mask-image:linear-gradient(to_bottom,black_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_45%,transparent_100%)]">
                      {profile.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.accentColor})`,
                          }}
                        />
                      )}
                    </div>

                    {/* Squircle Avatar on Right + Info Beside it */}
                    <div className={`relative -mt-12 px-4 flex items-center gap-3.5 z-10 ${isLtr ? 'text-left' : 'text-right'}`}>
                      {/* Fixed Avatar Container: Rounded square (Squircle) for Gradient Mask */}
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-3 border-white dark:border-slate-900 shadow-xl bg-slate-800">
                        {profile.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatarUrl} alt={resolveDisplayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                            {resolveDisplayName?.trim().charAt(0) || <User className="w-6 h-6 text-white" />}
                          </div>
                        )}
                      </div>

                      {/* Name and Bio next to it */}
                      <div className="flex-1 min-w-0">
                        <h2
                          className={`font-bold tracking-tight truncate flex items-center gap-1 ${isLight ? 'text-slate-900' : 'text-white'}`}
                          style={{ fontSize: 'calc(var(--dynamic-base-size) * 1.1)' }}
                        >
                          <span className="truncate">{resolveDisplayName || 'نام شما'}</span>
                          {isVerifiedApproved && (
                            <BadgeCheck className="w-3.5 h-3.5 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                          )}
                        </h2>
                        <p
                          className={`font-semibold truncate ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}
                          style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.9)' }}
                        >
                          {resolveHeadline || (isLtr ? 'Job Title / Profession' : 'عنوان شغلی / تخصص')}
                        </p>
                        {resolveBio && (
                          <p
                            className={`line-clamp-2 mt-0.5 leading-snug ${isLight ? 'text-slate-600' : 'text-slate-300/80'}`}
                            style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.8)' }}
                          >
                            {resolveBio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Header Layout 3: MINIMAL */}
                {profile.headerLayout === 'minimal' && (
                  <div className="flex flex-col items-center text-center pt-8 px-4 mb-4 shrink-0">
                    {/* Large Circular Avatar */}
                    <div className="relative mb-3 group shrink-0">
                      <div
                        className="absolute -inset-1 rounded-full opacity-60 blur-md transition duration-500"
                        style={{
                          background: `linear-gradient(45deg, ${themeConfig.primaryColor}, ${themeConfig.accentColor})`,
                        }}
                      />
                      {/* Fixed Avatar Container */}
                      <div className="relative w-28 h-28 rounded-full overflow-hidden shrink-0 border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-800">
                        {profile.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profile.avatarUrl}
                            alt={resolveDisplayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                            {resolveDisplayName?.trim().charAt(0) || <User className="w-10 h-10 text-white" />}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Display Name */}
                    <h2
                      className={`font-bold tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}
                      style={{ fontSize: 'calc(var(--dynamic-base-size) * 1.15)' }}
                    >
                      <span>{resolveDisplayName || 'نام شما'}</span>
                      {isVerifiedApproved && (
                        <BadgeCheck className="w-4 h-4 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                      )}
                    </h2>

                    {/* Headline */}
                    <p
                      className={`font-semibold mt-0.5 ${isLight ? 'text-blue-600' : 'text-cyan-300/90'}`}
                      style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.95)' }}
                    >
                      {resolveHeadline || (isLtr ? 'Job Title / Profession' : 'عنوان شغلی / تخصص')}
                    </p>

                    {/* Bio */}
                    {resolveBio && (
                      <p
                        className={`mt-2 leading-relaxed max-w-[260px] ${isLight ? 'text-slate-600' : 'text-slate-300/80'}`}
                        style={{ fontSize: 'calc(var(--dynamic-base-size) * 0.85)' }}
                      >
                        {resolveBio}
                      </p>
                    )}
                  </div>
                )}

                {/* Profile Action Buttons & Modules Container */}
                <div className="px-4 flex-1 flex flex-col">
                  {/* SOCIAL NETWORKS ICON GRID (Dedicated Row / Matrix with Horizontal Dnd) */}
                  {(compactSocialLinks.length > 0 || profile.whatsapp || profile.phone) && (
                    <div className="mb-4 pt-1 flex justify-center text-center">
                      <DndContext
                        id="social-dnd-context"
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleSocialDragStart}
                        onDragEnd={handleSocialDragEnd}
                        onDragCancel={handleSocialDragCancel}
                      >
                        <SortableContext
                          items={compactSocialLinks.map((l) => l.id)}
                          strategy={horizontalListSortingStrategy}
                        >
                          <div
                            className={`inline-flex flex-wrap justify-center mx-auto max-w-full w-max items-center gap-2.5 p-2 ${themeConfig.buttonShape === 'pill' || themeConfig.borderRadius === 'rounded-full'
                                ? 'rounded-full px-3.5'
                                : themeConfig.buttonShape === 'sharp' || themeConfig.borderRadius === 'rounded-none'
                                  ? 'rounded-none'
                                  : themeConfig.borderRadius === 'rounded-xl' || themeConfig.borderRadius === 'rounded-lg'
                                    ? 'rounded-xl'
                                    : 'rounded-2xl'
                              } bg-black/10 dark:bg-white/5 border border-white/10 backdrop-blur-md`}
                          >
                            {profile.whatsapp && !compactSocialLinks.some((l) => l.moduleType === 'whatsapp_direct') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toast.info('این آیکون مربوط به شماره واتساپ در اطلاعات شناسنامه‌ای پروفایل است.');
                                }}
                                className={`w-11 h-11 ${themeConfig.buttonShape === 'pill' || themeConfig.borderRadius === 'rounded-full'
                                    ? 'rounded-full'
                                    : 'rounded-2xl'
                                  } bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm cursor-pointer`}
                                title="واتساپ (پروفایل)"
                              >
                                <WhatsAppIcon className="w-5 h-5 fill-current" />
                              </button>
                            )}
                            {compactSocialLinks.map((link) => (
                              <SortablePreviewSocialIconItem
                                key={link.id}
                                link={link}
                                activeModuleId={activeModuleId}
                                handleModuleClick={handleModuleClick}
                                renderSocialIcon={renderSocialIcon}
                              />
                            ))}
                            {profile.phone && !profile.links.some((l) => l.moduleType === 'phone_call') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toast.info('این آیکون مربوط به شماره تماس در اطلاعات شناسنامه‌ای پروفایل است.');
                                }}
                                className={`w-11 h-11 ${themeConfig.buttonShape === 'pill' || themeConfig.borderRadius === 'rounded-full'
                                    ? 'rounded-full'
                                    : 'rounded-2xl'
                                  } bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-400 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm cursor-pointer`}
                                title="تماس (پروفایل)"
                              >
                                <Phone className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </SortableContext>
                        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
                          {activeSocialDragLink ? (
                            <div className="scale-110 shadow-2xl ring-2 ring-cyan-400 rounded-2xl cursor-grabbing pointer-events-none">
                              {renderSocialIcon(activeSocialDragLink)}
                            </div>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    </div>
                  )}

                  {/* NON-SOCIAL MODULES LIST (With Vertical Dnd) */}
                  <div className="space-y-2.5 flex-1">
                    <DndContext
                      id="vertical-dnd-context"
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleVerticalDragStart}
                      onDragEnd={handleVerticalDragEnd}
                      onDragCancel={handleVerticalDragCancel}
                    >
                      <SortableContext
                        items={filteredNonSocialLinks.map((l) => l.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2.5">
                          {filteredNonSocialLinks.map((link) => (
                            <SortablePreviewModuleItem
                              key={link.id}
                              link={link}
                              activeModuleId={activeModuleId}
                              handleModuleClick={handleModuleClick}
                              renderModuleCard={renderModuleCard}
                            />
                          ))}
                        </div>
                      </SortableContext>
                      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
                        {activeVerticalDragLink ? (
                          <div className="w-full scale-[1.02] shadow-2xl ring-2 ring-cyan-400 rounded-2xl cursor-grabbing pointer-events-none opacity-95">
                            {renderModuleCard(activeVerticalDragLink)}
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>

                    {profile.links.filter((l) => l.isActive).length === 0 && (
                      <div
                        className={`p-6 text-center text-xs border border-dashed rounded-2xl ${isLight ? 'text-slate-400 border-slate-300' : 'text-white/50 border-white/20'
                          }`}
                      >
                        {isLtr
                          ? 'No active modules to display'
                          : isPashto
                            ? 'د ښودلو لپاره هیڅ فعال ماډل نشته'
                            : 'هیچ ماژولی برای نمایش فعال نیست'}
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS (vCard & Share in Equal 2-Column Grid) */}
                  <div className="grid grid-cols-2 gap-2 mt-4 mb-2">
                    {/* 1. Save Contact (vCard) */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveContact();
                      }}
                      className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md border border-white/20 transition-all cursor-pointer select-none ${isLight
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
                      className="py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer backdrop-blur-md select-none"
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
                  </div>
                </div>

                {/* Footer Branding (Pinned to bottom of the screen) */}
                {!profile.hideBranding && (
                  <div className="mt-auto pt-6 pb-6 text-center select-none shrink-0">
                    <span className={`text-[10px] tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                      {isLtr
                        ? 'Powered by ⚡'
                        : isPashto
                          ? 'جوړ شوی لخوا ⚡'
                          : 'طراحی شده با ⚡'}{' '}
                      <span className="text-cyan-500 dark:text-cyan-400 font-bold font-sans">Arya Link</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Share Modal (Web & Desktop Fallback) */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-6 text-foreground shadow-2xl" dir="rtl">
          <DialogHeader className="text-center space-y-1 pb-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center mb-1">
              <Share2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              اشتراک‌گذاری کارت هوشمند دیجیتال
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              کد بارکد یا پیوند مستقیم کارت خود را برای دوستان و مشتریان ارسال کنید.
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
              <span className="text-[11px] font-bold text-muted-foreground block text-right">
                پیوند اختصاصی کارت:
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
                      toast.success('پیوند کارت با موفقیت در کلیپ‌بورد کپی شد');
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
              <span className="text-[11px] font-bold text-muted-foreground block text-right">
                ارسال مستقیم در پیام‌رسان‌ها:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`کارت دیجیتال من در آریا لینک: https://aryal.ink/${profile.alias}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                  <span>واتساپ</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://aryal.ink/${profile.alias}`)}&text=${encodeURIComponent('کارت دیجیتال من در آریا لینک')}`}
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
                لینک موقعیت مکانی (نقشه گوگل):
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
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm overflow-hidden rounded-2xl sm:rounded-2xl h-auto z-50 bg-slate-900/95 border border-white/10 backdrop-blur-2xl p-5 text-center text-white shadow-2xl isolate">
          {/* Ambient Lighting Accents */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit] z-0">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          </div>

          <DialogHeader className="space-y-2 pb-3 border-b border-white/10 text-center relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-1.5">
              <span>کارت در حال دانلود است...</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              {`برای تعامل بهتر و پشتیبانی سریع‌تر، می‌توانید شماره تماس خود را نیز با ${resolveDisplayName || profile.displayName || 'صاحب پروفایل'} به اشتراک بگذارید (اختیاری).`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitLead} className="space-y-4 pt-3 text-right relative z-10 font-sans">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-200">
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="مثال: احمد رحیمی"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all font-sans"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Phone Number Field (Strict English Digits via convertToEnglishDigits) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-200">
                  شماره تماس
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
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  <span>در حال ارسال...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ثبت اطلاعات</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsLeadModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                بستن
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Provider Checkout Modal (Live Editor Preview) */}
      <PaymentCheckoutModal
        isOpen={Boolean(previewPaymentModalLink)}
        onClose={() => setPreviewPaymentModalLink(null)}
        link={previewPaymentModalLink}
        profileName={profile.displayName || 'صاحب پروفایل'}
        recipientPhone={profile.phone || ''}
        profileId={(profile as any)._id || (profile as any).id}
        profileAlias={profile.alias}
        profileFinancialSettings={(profile as any).financialSettings}
      />
    </div>
  );
};

interface SortablePreviewSocialIconItemProps {
  link: ProfileLinkItem;
  activeModuleId: string | null;
  handleModuleClick: (id: string) => void;
  renderSocialIcon: (link: ProfileLinkItem) => React.ReactNode;
}

const SortablePreviewSocialIconItem: React.FC<SortablePreviewSocialIconItemProps> = ({
  link,
  activeModuleId,
  handleModuleClick,
  renderSocialIcon,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      id={`preview-social-${link.id}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleModuleClick(link.id);
      }}
      className={`relative cursor-grab active:cursor-grabbing transition-transform hover:scale-105 active:scale-95 ${isDragging ? 'ring-2 ring-cyan-400 scale-110 shadow-lg' : ''
        } ${activeModuleId === link.id
          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 rounded-2xl shadow-md shadow-cyan-500/50 scale-105'
          : ''
        }`}
      title={`کلیک برای ویرایش: ${link.title} (یا کشیدن به چپ/راست جهت جابه‌جایی)`}
    >
      {renderSocialIcon(link)}
    </div>
  );
};

interface SortablePreviewModuleItemProps {
  link: ProfileLinkItem;
  activeModuleId: string | null;
  handleModuleClick: (id: string) => void;
  renderModuleCard: (link: ProfileLinkItem) => React.ReactNode;
}

const SortablePreviewModuleItem: React.FC<SortablePreviewModuleItemProps> = ({
  link,
  activeModuleId,
  handleModuleClick,
  renderModuleCard,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      id={`preview-module-${link.id}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleModuleClick(link.id);
      }}
      className={`relative cursor-grab active:cursor-grabbing transition-all duration-200 group/preview-module select-none ${isDragging ? 'ring-2 ring-cyan-500 rounded-2xl shadow-lg bg-cyan-500/10' : ''
        } ${activeModuleId === link.id
          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.45)] scale-[1.01]'
          : 'hover:opacity-95'
        }`}
      title={`کلیک برای ویرایش ماژول: ${link.title || 'بدون عنوان'} (یا کشیدن به بالا/پایین)`}
    >
      {activeModuleId === link.id && (
        <div className="absolute -top-2.5 left-3 z-30 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] shadow-md flex items-center gap-1 animate-in fade-in zoom-in-75 duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
          <span>در حال ویرایش</span>
        </div>
      )}
      {renderModuleCard(link)}
    </div>
  );
};

export default LivePreview;
