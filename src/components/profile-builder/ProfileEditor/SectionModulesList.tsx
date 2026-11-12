'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore, getDefaultModuleConfig } from '@/store/editor-store';
import { ProfileLinkItem, LinkModuleType, FAQItem, BusinessHourDay } from '@/types/profile.types';
import { FileUploader } from '@/components/ui/file-uploader';
import { JalaliDatePicker } from '@/components/ui/jalali-date-picker';
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
import { PhoneInput } from '@/components/ui/phone-input';
import {
  PAYMENT_PROVIDERS,
  AFGHAN_WALLETS,
  AFGHAN_BANKS,
  CRYPTO_NETWORKS,
  calculateInstallmentSchedule,
  PaymentProviderType,
  AfghanBankType,
  WalletServiceType,
  CryptoNetworkType,
  InstallmentInterval,
} from '@/lib/constants/paymentProviders';
import { PaymentCustomSelect, PaymentSelectOption } from '@/components/payment/PaymentCustomSelect';
import { PaymentLogoBadge } from '@/components/payment/PaymentLogos';
import { PaymentMethodItem } from '@/types/profile.types';
import { toast } from 'sonner';
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
  ChevronDown,
  ChevronUp,
  Trash2,
  GripVertical,
  ExternalLink,
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
  Search,
  Settings,
  Lock,
  Calendar,
  Clock,
  Palette,
  Plus,
  Layers,
  Video,
  Sliders,
  DollarSign,
  Eye,
  EyeOff,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Sparkles,
  Check,
  RotateCcw,
  FolderPlus,
  Folder,
  ShieldCheck,
  KeyRound,
  MousePointerClick,
  Hourglass,
  Wallet,
  Building2,
  Landmark,
  Coins,
  Truck,
  CalendarClock,
  Calculator,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SectionModulesList: React.FC = () => {
  const {
    profile,
    updateLink: rawUpdateLink,
    updateLinkMetadata: rawUpdateLinkMetadata,
    updateLinkAdvancedSettings: rawUpdateLinkAdvancedSettings,
    removeLink: rawRemoveLink,
    reorderLinks,
    moveLink,
    saveProfileData,
    expandedModuleId,
    setExpandedModuleId,
    activeModuleId,
    setActiveModuleId,
    unconfirmedModuleId,
    setUnconfirmedModuleId,
  } = useEditorStore();

  const [activeSettingsTab, setActiveSettingsTab] = useState<Record<string, 'content' | 'advanced'>>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [storePaymentSettings, setStorePaymentSettings] = useState<any>(null);
  const snapshotsRef = React.useRef<Record<string, ProfileLinkItem>>({});

  useEffect(() => {
    async function fetchStoreSettings() {
      try {
        const res = await fetch('/api/store/payment-settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setStorePaymentSettings(data.settings);
        }
      } catch (err) {
        console.warn('Failed to load store payment settings in profile editor:', err);
      }
    }
    fetchStoreSettings();
  }, []);

  const dragSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const debouncedDragSave = () => {
    if (dragSaveTimeoutRef.current) clearTimeout(dragSaveTimeoutRef.current);
    dragSaveTimeoutRef.current = setTimeout(() => {
      saveProfileData();
    }, 1000);
  };

  React.useEffect(() => {
    return () => {
      if (dragSaveTimeoutRef.current) clearTimeout(dragSaveTimeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (expandedModuleId) {
      const currentLink = profile.links.find((l) => l.id === expandedModuleId);
      if (currentLink && !snapshotsRef.current[expandedModuleId]) {
        snapshotsRef.current[expandedModuleId] = JSON.parse(JSON.stringify(currentLink));
      }
    }
  }, [expandedModuleId, profile.links]);

  // Two-way binding: Smooth scroll to active module when clicked in Live Preview
  React.useEffect(() => {
    if (activeModuleId) {
      if (expandedModuleId !== activeModuleId) {
        setExpandedModuleId(activeModuleId);
      }
      const timer = setTimeout(() => {
        const element = document.getElementById(`module-edit-item-${activeModuleId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 75);
      return () => clearTimeout(timer);
    }
  }, [activeModuleId]);

  const markDirty = (id: string) => {
    if (!snapshotsRef.current[id]) {
      const currentLink = profile.links.find((l) => l.id === id);
      if (currentLink) {
        snapshotsRef.current[id] = JSON.parse(JSON.stringify(currentLink));
      }
    }
    setUnconfirmedModuleId(id);
  };

  const updateLink = (id: string, updates: Partial<ProfileLinkItem>) => {
    markDirty(id);
    rawUpdateLink(id, updates);
  };

  const updateLinkMetadata = (id: string, metadataUpdates: any) => {
    markDirty(id);
    rawUpdateLinkMetadata(id, metadataUpdates);
  };

  const updateLinkAdvancedSettings = (id: string, settingsUpdates: any) => {
    markDirty(id);
    rawUpdateLinkAdvancedSettings(id, settingsUpdates);
  };

  const toggleExpand = (id: string) => {
    if (unconfirmedModuleId && unconfirmedModuleId !== id) {
      toast.error('این بخش هنوز تایید نشده است. لطفاً ابتدا تغییرات را تایید یا لغو کنید.');
      return;
    }
    if (unconfirmedModuleId && unconfirmedModuleId === id) {
      toast.error('این بخش هنوز تایید نشده است. لطفاً ابتدا تغییرات را تایید یا لغو کنید.');
      return;
    }
    if (expandedModuleId === id) {
      setExpandedModuleId(null);
      if (activeModuleId === id) setActiveModuleId(null);
    } else {
      const currentLink = profile.links.find((l) => l.id === id);
      if (currentLink) {
        snapshotsRef.current[id] = JSON.parse(JSON.stringify(currentLink));
      }
      setExpandedModuleId(id);
      setActiveModuleId(id);
    }
  };

  const handleConfirm = (id: string) => {
    delete snapshotsRef.current[id];
    setUnconfirmedModuleId(null);
    setExpandedModuleId(null);
    if (activeModuleId === id) setActiveModuleId(null);
    saveProfileData();
    toast.success('تنظیمات ماژول تایید و ذخیره شد');
  };

  const handleCancel = (id: string) => {
    const snapshot = snapshotsRef.current[id];
    if (snapshot) {
      rawUpdateLink(id, snapshot);
      delete snapshotsRef.current[id];
    }
    setUnconfirmedModuleId(null);
    setExpandedModuleId(null);
    if (activeModuleId === id) setActiveModuleId(null);
    toast.info('تغییرات ماژول لغو شد');
  };

  const handleRemoveLink = (id: string) => {
    if (unconfirmedModuleId && unconfirmedModuleId !== id) {
      toast.error('این بخش هنوز تایید نشده است. لطفاً ابتدا تغییرات را تایید یا لغو کنید.');
      return;
    }
    rawRemoveLink(id);
    delete snapshotsRef.current[id];
    if (unconfirmedModuleId === id) setUnconfirmedModuleId(null);
    if (expandedModuleId === id) setExpandedModuleId(null);
    if (activeModuleId === id) setActiveModuleId(null);
    toast.success('ماژول حذف شد');
  };

  const isSocialModule = (type: LinkModuleType): boolean => {
    return [
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
    ].includes(type);
  };

  const isInteractiveModule = (type: LinkModuleType): boolean => {
    return [
      'standard_link',
      'payment',
      'product_card',
      'sale_checkout',
      'donation_hesabpay',
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
      'video_meeting',
      'map_navigation',
      'location_hours',
      'business_hours',
      'phone_call',
      'email_direct',
      'pdf_catalog',
      'music_player',
    ].includes(type);
  };

  const getModuleIcon = (type: LinkModuleType) => {
    switch (type) {
      case 'whatsapp_direct':
        return <WhatsAppIcon className="w-4 h-4 text-emerald-500 fill-current" />;
      case 'telegram_channel':
        return <TelegramIcon className="w-4 h-4 text-sky-500" />;
      case 'instagram_profile':
        return <InstagramIcon className="w-4 h-4 text-pink-500" />;
      case 'linkedin_profile':
        return <LinkedInIcon className="w-4 h-4 text-blue-500" />;
      case 'twitter_x':
        return <XTwitterIcon className="w-4 h-4 text-foreground" />;
      case 'pinterest':
        return <PinterestIcon className="w-4 h-4 text-rose-500" />;
      case 'facebook':
        return <FacebookIcon className="w-4 h-4 text-blue-600" />;
      case 'dribbble':
        return <DribbbleIcon className="w-4 h-4 text-pink-500" />;
      case 'behance':
        return <BehanceIcon className="w-4 h-4 text-blue-500" />;
      case 'youtube_channel':
        return <YouTubeIcon className="w-4 h-4 text-red-600" />;
      case 'clubhouse':
        return <ClubhouseIcon className="w-4 h-4 text-amber-500" />;
      case 'patreon':
        return <PatreonIcon className="w-4 h-4 text-rose-500" />;
      case 'twitch':
        return <TwitchIcon className="w-4 h-4 text-purple-500" />;
      case 'github':
        return <GitHubIcon className="w-4 h-4 text-foreground" />;
      case 'aparat_channel':
        return <AparatIcon className="w-4 h-4 text-rose-500" />;
      case 'tiktok':
        return <TikTokIcon className="w-4 h-4 text-foreground" />;
      case 'apple_music':
        return <AppleMusicIcon className="w-4 h-4 text-rose-500" />;
      case 'youtube_music':
        return <YouTubeMusicIcon className="w-4 h-4 text-red-500" />;
      case 'castbox':
        return <CastboxIcon className="w-4 h-4 text-amber-500" />;
      case 'radio_javan':
        return <RadioJavanIcon className="w-4 h-4 text-indigo-500" />;
      case 'spotify_podcaster':
        return <SpotifyIcon className="w-4 h-4 text-purple-500" />;
      case 'spotify':
        return <SpotifyIcon className="w-4 h-4 text-emerald-500" />;
      case 'soundcloud':
        return <SoundCloudIcon className="w-4 h-4 text-orange-500" />;
      case 'skype':
        return <SkypeIcon className="w-4 h-4 text-sky-500" />;
      case 'wechat':
        return <WeChatIcon className="w-4 h-4 text-green-500" />;
      case 'messenger':
        return <MessengerIcon className="w-4 h-4 text-blue-500" />;
      case 'signal':
        return <SignalIcon className="w-4 h-4 text-blue-400" />;
      case 'simple_text':
        return <Type className="w-4 h-4 text-indigo-500" />;
      case 'divider_heading':
        return <Minus className="w-4 h-4 text-slate-500" />;
      case 'container_group':
        return <FolderPlus className="w-4 h-4 text-cyan-400" />;
      case 'spacer_divider':
        return <Layers className="w-4 h-4 text-zinc-500" />;
      case 'phone_call':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'email_direct':
        return <Mail className="w-4 h-4 text-amber-500" />;
      case 'faq_accordion':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'contact_form':
      case 'lead_capture_form':
        return <Mail className="w-4 h-4 text-amber-500" />;
      case 'video_meeting':
        return <Video className="w-4 h-4 text-teal-500" />;
      case 'location_hours':
        return <MapPin className="w-4 h-4 text-rose-500" />;
      case 'map_navigation':
        return <Navigation className="w-4 h-4 text-sky-500" />;
      case 'business_hours':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'pdf_catalog':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'youtube_embed':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'aparat_embed':
        return <AparatIcon className="w-4 h-4 text-rose-500" />;
      case 'music_player':
        return <Music className="w-4 h-4 text-emerald-500" />;
      case 'single_image':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'image_gallery':
        return <ImageIcon className="w-4 h-4 text-violet-500" />;
      case 'image_slider':
        return <Sliders className="w-4 h-4 text-cyan-500" />;
      case 'product_card':
        return <ShoppingBag className="w-4 h-4 text-teal-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'sale_checkout':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'donation_hesabpay':
        return <HeartHandshake className="w-4 h-4 text-rose-500" />;
      case 'countdown_timer':
        return <Timer className="w-4 h-4 text-amber-500" />;
      case 'profile_search':
        return <Search className="w-4 h-4 text-indigo-500" />;
      case 'standard_link':
      default:
        return <Link2 className="w-4 h-4 text-cyan-500" />;
    }
  };

  // 0. DISPLAY TITLE INPUT (فیلد عنوان نمایشی جهت به‌روزرسانی زنده)
  const renderDisplayTitleInput = (link: ProfileLinkItem) => {
    if (link.moduleType === 'spacer_divider') return null;

    const defaultConfig = getDefaultModuleConfig(link.moduleType);
    const defaultTitle = defaultConfig?.title || 'ماژول جدید';

    return (
      <div className="space-y-3 mb-3">
        {/* Social Compact Icon Mode Toggle */}
        {isSocialModule(link.moduleType) && (
          <div className="p-3.5 rounded-xl border border-border/80 bg-background/60 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-foreground block">نمایش فشرده (فقط آیکون)</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                {link.advancedSettings?.isCompactIcon !== false
                  ? 'آیکون در نوار کانتینر افقی شبکه‌های اجتماعی نمایش داده می‌شود'
                  : 'به صورت دکمه کامل در لیست عمودی با عنوان و آیکون نمایش داده می‌شود'}
              </span>
            </div>
            <Switch
              checked={link.advancedSettings?.isCompactIcon !== false}
              onCheckedChange={(checked) =>
                updateLinkAdvancedSettings(link.id, { isCompactIcon: checked })
              }
            />
          </div>
        )}

        <div className="p-3.5 rounded-xl border border-border/80 bg-background/60 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-cyan-500" />
              <span>عنوان نمایشی</span>
            </label>

          </div>
          <input
            type="text"
            value={link.title || ''}
            onChange={(e) => updateLink(link.id, { title: e.target.value })}
            placeholder={defaultTitle}
            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans shadow-sm transition-all"
          />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            عنوانی که در این فیلد تایپ می‌کنید بلافاصله روی دکمه کارت در پیش‌نمایش زنده اعمال می‌شود.
          </p>
        </div>
      </div>
    );
  };

  // 1. DIVIDER VISUAL SELECTOR (کارتهای تصویری انواع خط)
  const renderDividerInputs = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};
    const currentStyle = meta.dividerStyle || 'solid_thin';
    const currentPadding = meta.dividerPadding || 'md';

    const lineStyles = [
      {
        id: 'solid_thin',
        title: 'خط صاف نازک',
        sub: '1px',
        renderLine: () => <div className="w-full border-t border-solid border-current my-2.5 opacity-80" />,
      },
      {
        id: 'solid_thick',
        title: 'خط صاف ضخیم',
        sub: '3px',
        renderLine: () => <div className="w-full border-t-2 border-solid border-current my-2.5" />,
      },
      {
        id: 'dashed',
        title: 'خط‌چین',
        sub: 'Dashed',
        renderLine: () => <div className="w-full border-t border-dashed border-current my-2.5 opacity-80" />,
      },
      {
        id: 'dotted',
        title: 'نقطه‌چین',
        sub: 'Dotted',
        renderLine: () => <div className="w-full border-t-2 border-dotted border-current my-2.5" />,
      },
      {
        id: 'double',
        title: 'دوخطی',
        sub: 'Double',
        renderLine: () => <div className="w-full border-t-4 border-double border-current my-2" />,
      },
    ];

    return (
      <div className="space-y-4 pt-1">
        <div>
          <label className="block text-[11px] font-bold text-foreground mb-2">
            انتخاب نوع خط
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {lineStyles.map((item) => {
              const isSelected = currentStyle === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateLinkMetadata(link.id, { dividerStyle: item.id as any })}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col justify-between ${isSelected
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-500 ring-2 ring-cyan-500/25 font-bold shadow-sm'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70'
                    }`}
                >
                  {item.renderLine()}
                  <div className="mt-1">
                    <span className="text-[11px] block">{item.title}</span>
                    <span className="text-[9px] opacity-60 font-sans block">{item.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1.5">فاصله عمودی خط</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'sm', label: 'کم (8px)' },
              { id: 'md', label: 'متوسط (16px)' },
              { id: 'lg', label: 'زیاد (32px)' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => updateLinkMetadata(link.id, { dividerPadding: p.id as any })}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${currentPadding === p.id
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                  : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 2. TEXT MODULE (فقط تراز، رنگ و متن - بدون انیمیشن یا لینک)
  const renderSimpleTextInputs = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};
    const adv = link.advancedSettings || {};
    const style = adv.customStyling || {};

    return (
      <div className="space-y-3.5 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-foreground mb-1">متن محتوا</label>
          <textarea
            rows={3}
            value={meta.simpleTextContent || ''}
            onChange={(e) => updateLinkMetadata(link.id, { simpleTextContent: e.target.value })}
            placeholder="متن دلخواه، توضیحات کاری، معرفی خدمات یا پیام خوش‌آمدگویی بنویسید..."
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 resize-none font-sans"
          />
        </div>

        {/* Visual Text Alignment */}
        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1.5">چینش متن</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'right', label: 'راست‌چین', icon: AlignRight },
              { id: 'center', label: 'وسط‌چین', icon: AlignCenter },
              { id: 'left', label: 'چپ‌چین', icon: AlignLeft },
            ].map((a) => {
              const Icon = a.icon;
              const isSelected = (meta.textAlign || 'right') === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => updateLinkMetadata(link.id, { textAlign: a.id as any })}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                    : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/50">
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">رنگ پس‌زمینه کارت</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.customBgColor || '#1e293b'}
                onChange={(e) =>
                  updateLinkAdvancedSettings(link.id, {
                    customStyling: { ...style, customBgColor: e.target.value },
                  })
                }
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="font-sans text-xs text-muted-foreground">{style.customBgColor || 'پیش‌فرض'}</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-muted-foreground mb-1">رنگ متن</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.customTextColor || '#ffffff'}
                onChange={(e) =>
                  updateLinkAdvancedSettings(link.id, {
                    customStyling: { ...style, customTextColor: e.target.value },
                  })
                }
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="font-sans text-xs text-muted-foreground">{style.customTextColor || 'پیش‌فرض'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. CONTACT FORM (فقط فیلدهای فرم، placeholder و ایمیل دریافت‌کننده)
  const renderContactFormInputs = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};

    return (
      <div className="space-y-3 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-foreground mb-1">عنوان بالای فرم تماس</label>
          <input
            type="text"
            value={meta.leadHeadline || link.title || ''}
            onChange={(e) => {
              updateLinkMetadata(link.id, { leadHeadline: e.target.value });
              updateLink(link.id, { title: e.target.value });
            }}
            placeholder="مثال: با من در ارتباط باشید یا ثبت پیام"
            className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-foreground mb-1">ایمیل دریافت‌کننده پیام‌ها</label>
          <input
            type="email"
            value={meta.recipientEmail || ''}
            onChange={(e) => updateLinkMetadata(link.id, { recipientEmail: e.target.value })}
            placeholder="your-email@example.com"
            className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
            dir="ltr"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            پیام‌های ارسالی بازدیدکنندگان علاوه بر بخش سرنخ‌ها (CRM)، به این ایمیل نیز ارسال خواهند شد.
          </p>
        </div>
      </div>
    );
  };

  // Fixed Prefix Input for Social & Messenger Handles
  const renderFixedPrefixInput = (
    prefix: string,
    currentValue: string,
    onValueChange: (cleanValue: string) => void,
    placeholder: string = 'username'
  ) => {
    let displayVal = (currentValue || '')
      .trim()
      .replace(/^https?:\/\/(www\.)?/i, '')
      .replace(/^tg:\/\/resolve\?domain=/i, '')
      .replace(/^instagram:\/\/user\?username=/i, '')
      .replace(/^twitter:\/\/user\?screen_name=/i, '')
      .replace(/^linkedin:\/\/profile\//i, '')
      .replace(/^vnd\.youtube:\/\/www\.youtube\.com\/@/i, '')
      .replace(/^snssdk1233:\/\/user\/profile\//i, '')
      .replace(/^pinterest:\/\/user\//i, '')
      .replace(/^fb:\/\/profile\//i, '')
      .replace(/^fb-messenger:\/\/user-thread\//i, '');

    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    displayVal = displayVal.replace(new RegExp(`^${escapedPrefix}`, 'i'), '');
    displayVal = displayVal.replace(/^@/, '').replace(/^\//, '');

    return (
      <div
        className="flex items-center bg-background border border-border rounded-xl overflow-hidden focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all shadow-xs"
        dir="ltr"
      >
        <span className="bg-muted/80 text-muted-foreground px-3 py-1.5 text-xs font-sans font-medium border-r border-border select-none shrink-0 tracking-tight">
          {prefix}
        </span>
        <input
          type="text"
          value={displayVal}
          onChange={(e) => {
            let raw = e.target.value.trim();
            raw = raw
              .replace(/^https?:\/\/(www\.)?/i, '')
              .replace(/^tg:\/\/resolve\?domain=/i, '')
              .replace(/^instagram:\/\/user\?username=/i, '')
              .replace(/^twitter:\/\/user\?screen_name=/i, '')
              .replace(/^linkedin:\/\/profile\//i, '')
              .replace(/^vnd\.youtube:\/\/www\.youtube\.com\/@/i, '')
              .replace(/^snssdk1233:\/\/user\/profile\//i, '')
              .replace(/^pinterest:\/\/user\//i, '')
              .replace(/^fb:\/\/profile\//i, '')
              .replace(/^fb-messenger:\/\/user-thread\//i, '')
              .replace(new RegExp(`^${escapedPrefix}`, 'i'), '')
              .replace(/^@/, '')
              .replace(/^\//, '');
            onValueChange(raw);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 py-1.5 px-2.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none font-sans text-left min-w-0"
          dir="ltr"
        />
      </div>
    );
  };

  // PAYMENT MODULE INPUTS (سیستم پرداخت ماژولار افغانستان با پشتیبانی از چند روش همزمان)
  const renderPaymentInputs = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};

    // Multi-method list: if empty, initialize from legacy metadata
    const rawMethods: PaymentMethodItem[] = Array.isArray(meta.supportedMethods) && meta.supportedMethods.length > 0
      ? meta.supportedMethods
      : [
        {
          id: 'pm_primary',
          providerType: (meta.paymentProviderType as any) || 'wallet',
          walletService: (meta.paymentWalletService || meta.walletService || 'HesabPay') as any,
          walletAccount: meta.paymentWalletAccount || meta.walletAccount || '',
          bankName: (meta.paymentBankName || meta.bankName || 'AIB') as any,
          bankAccountHolder: meta.paymentAccountHolder || meta.bankAccountHolder || '',
          bankAccountNumber: meta.paymentAccountNumber || meta.bankAccountNumber || '',
          hawalaExchangeName: meta.paymentHawalaSarafiName || meta.hawalaExchangeName || '',
          hawalaReceiverName: meta.paymentHawalaReceiverName || meta.hawalaReceiverName || '',
          hawalaReceiverPhone: meta.paymentHawalaReceiverPhone || meta.hawalaReceiverPhone || '',
          hawalaCityBranch: meta.paymentHawalaBranchCity || meta.hawalaCityBranch || '',
          cryptoNetwork: (meta.paymentCryptoNetwork || meta.cryptoNetwork || 'TRC20') as any,
          cryptoWalletAddress: meta.paymentCryptoAddress || meta.cryptoWalletAddress || '',
        },
      ];

    const updateMethods = (newMethods: PaymentMethodItem[]) => {
      const primary: Partial<PaymentMethodItem> = newMethods[0] || {};
      updateLinkMetadata(link.id, {
        supportedMethods: newMethods,
        // Sync top-level for legacy fallbacks
        paymentProviderType: primary.providerType || 'wallet',
        paymentWalletService: primary.walletService,
        walletService: primary.walletService,
        paymentWalletAccount: primary.walletAccount,
        walletAccount: primary.walletAccount,
        paymentBankName: primary.bankName,
        bankName: primary.bankName,
        paymentAccountHolder: primary.bankAccountHolder,
        bankAccountHolder: primary.bankAccountHolder,
        paymentAccountNumber: primary.bankAccountNumber,
        bankAccountNumber: primary.bankAccountNumber,
        paymentHawalaSarafiName: primary.hawalaExchangeName,
        hawalaExchangeName: primary.hawalaExchangeName,
        paymentHawalaReceiverName: primary.hawalaReceiverName,
        hawalaReceiverName: primary.hawalaReceiverName,
        paymentHawalaReceiverPhone: primary.hawalaReceiverPhone,
        hawalaReceiverPhone: primary.hawalaReceiverPhone,
        paymentHawalaBranchCity: primary.hawalaCityBranch,
        hawalaCityBranch: primary.hawalaCityBranch,
        paymentCryptoNetwork: primary.cryptoNetwork,
        cryptoNetwork: primary.cryptoNetwork,
        paymentCryptoAddress: primary.cryptoWalletAddress,
        cryptoWalletAddress: primary.cryptoWalletAddress,
      });
    };

    const handleAddMethod = () => {
      const newMethod: PaymentMethodItem = {
        id: `pm_${Date.now()}`,
        providerType: 'bank',
        bankName: 'AIB',
        bankAccountHolder: '',
        bankAccountNumber: '',
        walletService: 'HesabPay',
        walletAccount: '',
        cryptoNetwork: 'TRC20',
      };
      updateMethods([...rawMethods, newMethod]);
      toast.success('روش پرداخت جدید اضافه گردید.');
    };

    const handleRemoveMethod = (index: number) => {
      if (rawMethods.length <= 1) {
        toast.error('حداقل یک روش پرداخت باید در ماژول فعال باشد.');
        return;
      }
      const updated = rawMethods.filter((_, i) => i !== index);
      updateMethods(updated);
      toast.info('روش پرداخت حذف گردید.');
    };

    const handleMethodChange = (index: number, patch: Partial<PaymentMethodItem>) => {
      const updated = rawMethods.map((m, i) => (i === index ? { ...m, ...patch } : m));
      updateMethods(updated);
    };

    // Category options for dropdown (filtered by super admin active settings)
    const allCategoryOptions: PaymentSelectOption[] = [
      {
        id: 'wallet',
        title: 'پلتفرم‌های آنلاین (کیف پول دیجیتال)',
        subtitle: 'حساب‌پی، ام‌پیسه، اتوما پی، مای‌مانی، اوروم و استار پی',
        badge: 'فوری و بومی',
        type: 'wallet',
        logoId: 'hesabpay',
      },
      {
        id: 'bank',
        title: 'واریز به حساب بانکی',
        subtitle: 'انتقال مستقیم به بانک‌های معتبر افغانستان',
        badge: 'رسمی و شرکتی',
        type: 'bank',
        logoId: 'aib',
      },
      {
        id: 'hawala',
        title: 'حواله صرافی و نقدی',
        subtitle: 'حواله از طریق صرافی‌های کابل (سرای شهزاده) و ولایات',
        badge: 'صرافی و نقد',
        type: 'hawala',
        logoId: 'hawala',
      },
      {
        id: 'crypto',
        title: 'ارز دیجیتال (تتر USDT)',
        subtitle: 'دریافت تتر با کیف پول TRC20 و ERC20',
        badge: 'بین‌المللی',
        type: 'crypto',
        logoId: 'usdt',
      },
    ];

    const categoryOptions = allCategoryOptions.filter((cat) => {
      if (!storePaymentSettings) return true;
      if (storePaymentSettings.activeProfileCategories && storePaymentSettings.activeProfileCategories[cat.id] === false) {
        return false;
      }
      if (cat.id === 'wallet') {
        if (storePaymentSettings.wallets && storePaymentSettings.wallets.length > 0) {
          return storePaymentSettings.wallets.some((w: any) => w.isActive);
        }
      }
      if (cat.id === 'bank') {
        if (storePaymentSettings.banks && storePaymentSettings.banks.length > 0) {
          return storePaymentSettings.banks.some((b: any) => b.isActive);
        }
      }
      if (cat.id === 'hawala') {
        if (storePaymentSettings.hawalas && storePaymentSettings.hawalas.length > 0) {
          return storePaymentSettings.hawalas.some((h: any) => h.isActive);
        }
      }
      if (cat.id === 'crypto') {
        if (storePaymentSettings.cryptos && storePaymentSettings.cryptos.length > 0) {
          return storePaymentSettings.cryptos.some((c: any) => c.isActive);
        }
      }
      return true;
    });

    // Wallet options for dropdown (100% dynamic from storePaymentSettings when available, respecting admin ordering and custom items)
    const activeWalletsList = (storePaymentSettings?.wallets && storePaymentSettings.wallets.length > 0)
      ? storePaymentSettings.wallets.filter((w: any) => w.isActive)
      : AFGHAN_WALLETS;

    const walletSelectOptions: PaymentSelectOption[] = activeWalletsList.map((w: any) => ({
      id: w.id,
      title: w.nameFa || w.name || w.id,
      subtitle: w.providerCompany || '',
      type: 'wallet',
      logoId: (w.id || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
      customLogoUrl: w.logoUrl || undefined,
    }));

    // Bank options for dropdown (100% dynamic from storePaymentSettings when available, respecting admin ordering and custom items)
    const activeBanksList = (storePaymentSettings?.banks && storePaymentSettings.banks.length > 0)
      ? storePaymentSettings.banks.filter((b: any) => b.isActive)
      : AFGHAN_BANKS;

    const bankSelectOptions: PaymentSelectOption[] = activeBanksList.map((b: any) => ({
      id: b.id,
      title: b.bankNameFa || b.nameFa || b.bankName || b.name || b.id,
      subtitle: b.swiftCode ? `${b.bankName || b.name || ''} - سویفت: ${b.swiftCode}` : (b.bankName || b.name || ''),
      type: 'bank',
      logoId: (b.id || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
      customLogoUrl: b.logoUrl || undefined,
    }));

    // Crypto options for dropdown (100% dynamic from storePaymentSettings when available)
    const activeCryptosList = (storePaymentSettings?.cryptos && storePaymentSettings.cryptos.length > 0)
      ? storePaymentSettings.cryptos.filter((c: any) => c.isActive)
      : CRYPTO_NETWORKS;

    const cryptoSelectOptions: PaymentSelectOption[] = activeCryptosList.map((net: any) => ({
      id: net.id,
      title: net.name ? `تتر USDT - شبکه ${net.name}` : (net.network ? `تتر USDT - شبکه ${net.network}` : net.id),
      subtitle: net.blockchain ? `بلاکچین ${net.blockchain}${net.feeEstimated ? ` - کارمزد: ${net.feeEstimated}` : ''}` : (net.currency ? `واحد: ${net.currency}` : ''),
      type: 'crypto',
      logoId: 'usdt',
      customLogoUrl: net.logoUrl || undefined,
    }));

    return (
      <div className="space-y-4 pt-1" dir="rtl">
        {/* روش‌های پرداخت فعال در این ماژول */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>روش‌های پرداخت فعال ({rawMethods.length} روش):</span>
            </label>
            <span className="text-[10px] text-emerald-500 font-medium">پشتیبانی چنددرگاهی همزمان</span>
          </div>

          {/* لیست کارت‌های روش‌های پرداخت */}
          <div className="space-y-3">
            {rawMethods.map((method, index) => {
              const currentProvider = method.providerType || 'wallet';

              return (
                <div
                  key={method.id || index}
                  className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-3 relative group"
                >
                  {/* هدر کارت روش پرداخت */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 text-[11px] font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        روش {index + 1}: {categoryOptions.find((c) => c.id === currentProvider)?.title.split('(')[0] || 'روش پرداخت'}
                      </span>
                    </div>

                    {rawMethods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMethod(index)}
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="حذف این روش پرداخت"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* انتخاب دسته‌بندی با لوگوهای رسمی */}
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      نوع روش پرداخت:
                    </label>
                    <PaymentCustomSelect
                      value={currentProvider}
                      onChange={(val) => handleMethodChange(index, { providerType: val as any })}
                      options={categoryOptions}
                    />
                  </div>

                  {/* فیلدهای اختصاصی هر روش */}
                  {/* ۱. کیف پول دیجیتال */}
                  {currentProvider === 'wallet' && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          سرویس کیف پول (با لوگوی رسمی):
                        </label>
                        <PaymentCustomSelect
                          value={method.walletService || walletSelectOptions[0]?.id || 'hesabpay'}
                          onChange={(val) => handleMethodChange(index, { walletService: val as any })}
                          options={walletSelectOptions}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          شماره حساب یا مبایل کیف پول:
                        </label>
                        <input
                          type="text"
                          value={method.walletAccount || ''}
                          onChange={(e) => handleMethodChange(index, { walletAccount: e.target.value })}
                          placeholder="مثال: 0799123456 یا 0700112233"
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 font-mono text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}

                  {/* ۲. حساب بانکی */}
                  {currentProvider === 'bank' && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          بانک مقصد در افغانستان:
                        </label>
                        <PaymentCustomSelect
                          value={method.bankName || bankSelectOptions[0]?.id || 'aib'}
                          onChange={(val) => handleMethodChange(index, { bankName: val as any })}
                          options={bankSelectOptions}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-foreground mb-1">
                            نام صاحب حساب:
                          </label>
                          <input
                            type="text"
                            value={method.bankAccountHolder || ''}
                            onChange={(e) => handleMethodChange(index, { bankAccountHolder: e.target.value })}
                            placeholder="مثال: احمد ولی رسولی"
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-foreground mb-1">
                            شماره حساب یا IBAN:
                          </label>
                          <input
                            type="text"
                            value={method.bankAccountNumber || ''}
                            onChange={(e) => handleMethodChange(index, { bankAccountNumber: e.target.value })}
                            placeholder="0101-2345678-001"
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 font-mono text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ۳. حواله صرافی */}
                  {currentProvider === 'hawala' && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          نام صرافی یا شرکت خدمات پولی:
                        </label>
                        <input
                          type="text"
                          value={method.hawalaExchangeName || ''}
                          onChange={(e) => handleMethodChange(index, { hawalaExchangeName: e.target.value })}
                          placeholder="مثال: صرافی برادران رحیمی / سرای شهزاده کابل"
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-foreground mb-1">
                            نام و ولد گیرنده حواله:
                          </label>
                          <input
                            type="text"
                            value={method.hawalaReceiverName || ''}
                            onChange={(e) => handleMethodChange(index, { hawalaReceiverName: e.target.value })}
                            placeholder="احمد ولد محمد سرور"
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-foreground mb-1">
                            شماره تماس گیرنده:
                          </label>
                          <input
                            type="tel"
                            value={method.hawalaReceiverPhone || ''}
                            onChange={(e) => handleMethodChange(index, { hawalaReceiverPhone: e.target.value })}
                            placeholder="0799000000"
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 font-mono text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          شهر و موقعیت شعبه (آدرس دقیق):
                        </label>
                        <input
                          type="text"
                          value={method.hawalaCityBranch || ''}
                          onChange={(e) => handleMethodChange(index, { hawalaCityBranch: e.target.value })}
                          placeholder="کابل، سرای شهزاده، منزل اول"
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* ۴. ارز دیجیتال */}
                  {currentProvider === 'crypto' && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          شبکه انتقال تتر USDT:
                        </label>
                        <PaymentCustomSelect
                          value={method.cryptoNetwork || 'TRC20'}
                          onChange={(val) => handleMethodChange(index, { cryptoNetwork: val as any })}
                          options={cryptoSelectOptions}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          آدرس کیف پول تتر شما:
                        </label>
                        <input
                          type="text"
                          value={method.cryptoWalletAddress || ''}
                          onChange={(e) => handleMethodChange(index, { cryptoWalletAddress: e.target.value })}
                          placeholder="T..."
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 font-mono text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* دکمه افزودن روش پرداخت جدید */}
          <button
            type="button"
            onClick={handleAddMethod}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن یک روش پرداخت دیگر به این ماژول</span>
          </button>
        </div>

        {/* فیلد مبلغ مشخص اختیاری */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1">
              مبلغ ثابت / حق‌الزحمه (اختیاری)
            </label>
            <input
              type="number"
              value={meta.paymentAmount || ''}
              onChange={(e) => updateLinkMetadata(link.id, { paymentAmount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="مثلاً: 500"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 font-mono text-left"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1">
              واحد پول
            </label>
            <select
              value={meta.paymentCurrency || 'AFN'}
              onChange={(e) => updateLinkMetadata(link.id, { paymentCurrency: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500 font-sans"
            >
              <option value="AFN">AFN (افغانی)</option>
              <option value="USD">USD (دالر آمریکا)</option>
            </select>
          </div>
        </div>

        {/* توضیحات تکمیلی یا پیام پس از پرداخت */}
        <div>
          <label className="block text-[11px] font-medium text-foreground mb-1">
            پیام یا راهنمای واریزکننده (اختیاری)
          </label>
          <textarea
            rows={2}
            value={meta.paymentDescription || ''}
            onChange={(e) => updateLinkMetadata(link.id, { paymentDescription: e.target.value })}
            placeholder="مثال: لطفاً پس از واریز وجه، عکس رسید را از طریق واتساپ ارسال فرمایید."
            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 font-sans resize-none"
          />
        </div>
      </div>
    );
  };

  // 4. MODULE-SPECIFIC CONTENT INPUTS
  const renderModuleSpecificInputs = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};

    switch (link.moduleType) {
      // DIVIDER
      case 'divider_heading':
        return renderDividerInputs(link);

      case 'container_group':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-cyan-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 block">گروه / کانتینر ماژول‌ها</span>
                  <span className="text-[10px] text-muted-foreground block">مدیریت چینش و نحوه نمایش زیرمجموعه‌ها</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5 max-w-[80%]">
                <label className="text-xs font-bold text-foreground block cursor-pointer">
                  نمایش گروهی (فقط آیکون)
                </label>
                <p className="text-[10px] text-muted-foreground">
                  در صورت فعال بودن، ماژول‌های این گروه به صورت آیکون‌های فشرده افقی کنار هم قرار می‌گیرند. در غیر این صورت به صورت لیست عمودی نمایش داده می‌شوند.
                </p>
              </div>
              <Switch
                checked={meta.containerLayout === 'horizontal_compact'}
                onCheckedChange={(checked) =>
                  updateLinkMetadata(link.id, {
                    containerLayout: checked ? 'horizontal_compact' : 'vertical',
                  })
                }
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                توضیحات کوتاه گروه (اختیاری)
              </label>
              <input
                type="text"
                value={meta.containerDescription || ''}
                onChange={(e) => updateLinkMetadata(link.id, { containerDescription: e.target.value })}
                placeholder="مثلاً: راه‌های ارتباطی و شبکه‌های اجتماعی"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>
        );
      case 'spacer_divider':
        return (
          <div className="space-y-3 pt-1">
            <label className="block text-[11px] font-bold text-foreground mb-1.5">ارتفاع فاصله خالی</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'کوچک (16px)', val: 16 },
                { label: 'متوسط (24px)', val: 24 },
                { label: 'بزرگ (32px)', val: 32 },
                { label: 'بسیار بزرگ (48px)', val: 48 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => updateLinkMetadata(link.id, { spacerHeight: item.val })}
                  className={`py-2 px-1 text-center rounded-xl border text-[11px] font-semibold transition-all ${(meta.spacerHeight || 24) === item.val
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                    : 'bg-muted/60 text-muted-foreground border-border hover:text-foreground'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        );

      // TEXT
      case 'simple_text':
        return renderSimpleTextInputs(link);

      // CONTACT & SEARCH
      case 'contact_form':
      case 'lead_capture_form':
        return renderContactFormInputs(link);

      case 'profile_search':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">متن راهنما درون کادر جستجو</label>
              <input
                type="text"
                value={meta.searchPlaceholder || ''}
                onChange={(e) => updateLinkMetadata(link.id, { searchPlaceholder: e.target.value })}
                placeholder="جستجو در بین خدمات و لینک‌ها..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>
        );

      // FAQ ACCORDION
      case 'faq_accordion':
        const faqList: FAQItem[] = meta.faqItems || [];
        return (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-foreground">پرسش‌ها و پاسخ‌ها ({faqList.length})</label>
              <button
                type="button"
                onClick={() => {
                  const updated = [...faqList, { id: String(Date.now()), question: 'سوال جدید', answer: 'پاسخ سوال' }];
                  updateLinkMetadata(link.id, { faqItems: updated });
                }}
                className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                افزودن سوال جدید
              </button>
            </div>

            <div className="space-y-2">
              {faqList.map((item, idx) => (
                <div key={item.id || idx} className="p-2.5 rounded-xl border border-border bg-muted/40 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => {
                        const copy = [...faqList];
                        copy[idx].question = e.target.value;
                        updateLinkMetadata(link.id, { faqItems: copy });
                      }}
                      placeholder="متن سوال..."
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = faqList.filter((_, i) => i !== idx);
                        updateLinkMetadata(link.id, { faqItems: copy });
                      }}
                      className="text-muted-foreground hover:text-rose-500 p-1"
                      title="حذف سوال"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={item.answer}
                    onChange={(e) => {
                      const copy = [...faqList];
                      copy[idx].answer = e.target.value;
                      updateLinkMetadata(link.id, { faqItems: copy });
                    }}
                    placeholder="پاسخ کامل..."
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-cyan-500 resize-none font-sans"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      // COUNTDOWN
      case 'countdown_timer':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">عنوان رویداد یا تخفیف</label>
              <input
                type="text"
                value={meta.countdownTitle || link.title || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { countdownTitle: e.target.value });
                  updateLink(link.id, { title: e.target.value });
                }}
                placeholder="مثال: پایان تخفیف عید یا آغاز وبینار"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">تاریخ و ساعت پایان شمارش معکوس</label>
              <JalaliDatePicker
                value={meta.countdownTargetDate || ''}
                onChange={(dateStr) => updateLinkMetadata(link.id, { countdownTargetDate: dateStr })}
              />
            </div>
          </div>
        );

      // SOCIAL NETWORKS & PLATFORMS
      case 'whatsapp_direct':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <WhatsAppIcon className="w-5 h-5 text-emerald-500 fill-current shrink-0" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">چت مستقیم واتساپ</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شماره تماس واتساپ</label>
              <PhoneInput
                value={meta.phoneNumber || ''}
                onChange={(val) => {
                  updateLinkMetadata(link.id, { phoneNumber: val });
                  updateLink(link.id, {
                    url: `https://wa.me/${val.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      meta.prefilledMessage || ''
                    )}`,
                  });
                }}
                placeholder="799 123 456"
                defaultCountry="AF"
              />

            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">متن پیام پیش‌فرض (اختیاری)</label>
              <textarea
                rows={2}
                value={meta.prefilledMessage || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateLinkMetadata(link.id, { prefilledMessage: val });
                  updateLink(link.id, {
                    url: `https://wa.me/${(meta.phoneNumber || '').replace(
                      /[^0-9]/g,
                      ''
                    )}?text=${encodeURIComponent(val)}`,
                  });
                }}
                placeholder="سلام، از طریق کارت دیجیتال شما پیام می‌دهم..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 resize-none font-sans"
              />
            </div>
          </div>
        );

      case 'telegram_channel':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-2">
              <TelegramIcon className="w-5 h-5 text-sky-500 shrink-0" />
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">تلگرام</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا کانال تلگرام</label>
              {renderFixedPrefixInput(
                't.me/',
                meta.username || meta.channelUsername || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle, channelUsername: handle });
                  updateLink(link.id, { url: getSmartLink('telegram_channel', handle) });
                },
                'username_or_channel'
              )}
            </div>
          </div>
        );

      case 'instagram_profile':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-2">
              <InstagramIcon className="w-5 h-5 text-pink-500 shrink-0" />
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400">صفحه اینستاگرام</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری اینستاگرام (آیدی)</label>
              {renderFixedPrefixInput(
                'instagram.com/',
                meta.username || meta.instagramUsername || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle, instagramUsername: handle });
                  updateLink(link.id, { url: getSmartLink('instagram_profile', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'linkedin_profile':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <LinkedInIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">پروفایل لینکدین</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا آدرس پروفایل لینکدین</label>
              {renderFixedPrefixInput(
                'linkedin.com/in/',
                meta.username || meta.linkedinUsername || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle, linkedinUsername: handle });
                  updateLink(link.id, { url: getSmartLink('linkedin_profile', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'twitter_x':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/10 border border-border flex items-center gap-2">
              <XTwitterIcon className="w-5 h-5 text-foreground shrink-0" />
              <span className="text-xs font-bold text-foreground">ایکس (توییتر)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری ایکس</label>
              {renderFixedPrefixInput(
                'x.com/',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('twitter_x', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'pinterest':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <PinterestIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">پینترست</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری پینترست</label>
              {renderFixedPrefixInput(
                'pinterest.com/',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('pinterest', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center gap-2">
              <FacebookIcon className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">فیسبوک</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا نام کاربری فیسبوک</label>
              {renderFixedPrefixInput(
                'facebook.com/',
                meta.username || meta.targetId || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle, targetId: handle });
                  updateLink(link.id, { url: getSmartLink('facebook', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'dribbble':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-2">
              <DribbbleIcon className="w-5 h-5 text-pink-500 shrink-0" />
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400">دریبل</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری دریبل</label>
              {renderFixedPrefixInput(
                'dribbble.com/',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('dribbble', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'behance':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <BehanceIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">بیهنس</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری بیهنس</label>
              {renderFixedPrefixInput(
                'behance.net/',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('behance', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'youtube_channel':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center gap-2">
              <YouTubeIcon className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400">کانال یوتیوب</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">هندل یا نام کانال یوتیوب</label>
              {renderFixedPrefixInput(
                'youtube.com/@',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('youtube_channel', handle) });
                },
                'channel_handle'
              )}
            </div>
          </div>
        );

      case 'clubhouse':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <ClubhouseIcon className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">کلاب‌هاوس</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری کلاب‌هاوس</label>
              {renderFixedPrefixInput(
                'clubhouse.com/@',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('clubhouse', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'patreon':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <PatreonIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">پاترئون</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا نام کاربری پاترئون</label>
              {renderFixedPrefixInput(
                'patreon.com/',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('patreon', handle) });
                },
                'creator_handle'
              )}
            </div>
          </div>
        );

      case 'twitch':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
              <TwitchIcon className="w-5 h-5 text-purple-500 shrink-0" />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">توییچ استریم</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کانال توییچ</label>
              {renderFixedPrefixInput(
                'twitch.tv/',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('twitch', handle) });
                },
                'streamer_name'
              )}
            </div>
          </div>
        );

      case 'github':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/10 border border-border flex items-center gap-2">
              <GitHubIcon className="w-5 h-5 text-foreground shrink-0" />
              <span className="text-xs font-bold text-foreground">گیت‌هاب</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری یا سازمان گیت‌هاب</label>
              {renderFixedPrefixInput(
                'github.com/',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('github', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'aparat_channel':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <AparatIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">کانال آپارات</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری کانال آپارات</label>
              {renderFixedPrefixInput(
                'aparat.com/',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('aparat_channel', handle) });
                },
                'channel_id'
              )}
            </div>
          </div>
        );

      case 'tiktok':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/10 border border-border flex items-center gap-2">
              <TikTokIcon className="w-5 h-5 text-foreground shrink-0" />
              <span className="text-xs font-bold text-foreground">تیک‌تاک</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری تیک‌تاک</label>
              {renderFixedPrefixInput(
                'tiktok.com/@',
                meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { username: handle });
                  updateLink(link.id, { url: getSmartLink('tiktok', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      // AUDIO & PODCAST PLATFORMS
      case 'apple_music':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <AppleMusicIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">اپل موزیک</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک هنرمند یا آلبوم در Apple Music</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://music.apple.com/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'youtube_music':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <YouTubeMusicIcon className="w-5 h-5 text-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400">یوتیوب موزیک</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک یا آی دی در YouTube Music</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://music.youtube.com/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'castbox':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <CastboxIcon className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">کست‌باکس</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا لینک کانال پادکست کست‌باکس</label>
              <input
                type="text"
                value={meta.targetId || link.url || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { targetId: val });
                  updateLink(link.id, { url: getSmartLink('castbox', val) });
                }}
                placeholder="آی دی عددی کانال یا لینک پادکست"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
                dir={meta.targetId || link.url ? 'ltr' : 'auto'}
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-sans" dir="ltr">
                قالب وب: https://castbox.fm/ch/[ID]
              </p>
            </div>
          </div>
        );

      case 'radio_javan':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
              <RadioJavanIcon className="w-5 h-5 text-indigo-500 shrink-0" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">رادیو جوان</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا آیدی پادکست رادیو جوان</label>
              <input
                type="text"
                value={meta.targetId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { targetId: val });
                  updateLink(link.id, { url: getSmartLink('radio_javan', val) });
                }}
                placeholder="podcast-id"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />

            </div>
          </div>
        );

      case 'spotify_podcaster':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
              <SpotifyIcon className="w-5 h-5 text-purple-500 shrink-0" />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">اسپاتیفای پادکستر</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک پادکست در Spotify for Podcasters</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://podcasters.spotify.com/pod/show/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'spotify':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <SpotifyIcon className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">اسپاتیفای</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا لینک هنرمند / کاربر در Spotify</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="spotify:artist:[ID] یا https://open.spotify.com/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />

            </div>
          </div>
        );

      case 'soundcloud':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
              <SoundCloudIcon className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">ساوندکلاود</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا نام کاربری ساوندکلاود</label>
              <input
                type="text"
                value={meta.username || meta.targetId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { username: val, targetId: val });
                  updateLink(link.id, { url: getSmartLink('soundcloud', val) });
                }}
                placeholder="username یا user_id"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />

            </div>
          </div>
        );

      // DIRECT MESSENGERS
      case 'skype':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-2">
              <SkypeIcon className="w-5 h-5 text-sky-500 shrink-0" />
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">اسکایپ</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری یا آی دی اسکایپ</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { username: val });
                  updateLink(link.id, { url: `skype:${val}?chat` });
                }}
                placeholder="live:username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />

            </div>
          </div>
        );

      case 'wechat':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <WeChatIcon className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-xs font-bold text-green-600 dark:text-green-400">ویچت</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی کاربری ویچت</label>
              <input
                type="text"
                value={meta.targetId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { targetId: val });
                  updateLink(link.id, { url: `weixin://dl/chat?${val}` });
                }}
                placeholder="wechat_id"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />

            </div>
          </div>
        );

      case 'messenger':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <MessengerIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">مسنجر فیسبوک</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آی دی یا نام کاربری مسنجر</label>
              {renderFixedPrefixInput(
                'm.me/',
                meta.targetId || meta.username || link.url || '',
                (handle) => {
                  updateLinkMetadata(link.id, { targetId: handle, username: handle });
                  updateLink(link.id, { url: getSmartLink('messenger', handle) });
                },
                'username'
              )}
            </div>
          </div>
        );

      case 'signal':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <SignalIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">سیگنال</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شماره تماس در سیگنال</label>
              <PhoneInput
                value={meta.phoneNumber || ''}
                onChange={(val) => {
                  updateLinkMetadata(link.id, { phoneNumber: val });
                  updateLink(link.id, { url: getSmartLink('signal', val) });
                }}
                placeholder="799 123 456"
                defaultCountry="AF"
              />

            </div>
          </div>
        );

      // PRODUCT CARD
      case 'product_card':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام محصول یا خدمات</label>
              <input
                type="text"
                value={meta.productTitle || link.title || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { productTitle: e.target.value });
                  updateLink(link.id, { title: e.target.value });
                }}
                placeholder="مثال: کارت ویزیت هوشمند با حک اختصاصی"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">قیمت</label>
                <input
                  type="number"
                  value={meta.productPrice || ''}
                  onChange={(e) => updateLinkMetadata(link.id, { productPrice: Number(e.target.value) })}
                  placeholder="1500"
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">واحد پول</label>
                <select
                  value={meta.productCurrency || 'AFN'}
                  onChange={(e) => updateLinkMetadata(link.id, { productCurrency: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-sans"
                >
                  <option value="AFN">AFN (افغانی)</option>
                  <option value="USD">USD (دلار آمریکا)</option>
                </select>
              </div>
            </div>
            <div>
              <FileUploader
                value={meta.productImage || ''}
                onChange={(url) => updateLinkMetadata(link.id, { productImage: url })}
                fileType="image"
                folder="products"
                label="تصویر محصول"
                description="عکس باکیفیت محصول یا خدمات (حداکثر 2 مگابایت)"
                maxSizeMB={2}
                aspectRatio="square"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک خرید یا چت سفارش در واتساپ</label>
              <input
                type="url"
                value={meta.productBuyUrl || link.url || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { productBuyUrl: e.target.value });
                  updateLink(link.id, { url: e.target.value });
                }}
                placeholder="لینک خرید محصول یا گفتگوی سفارش در واتساپ"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
                dir={meta.productBuyUrl || link.url ? 'ltr' : 'auto'}
              />
            </div>
          </div>
        );

      // SALE / DIRECT CHECKOUT
      case 'sale_checkout':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کالا یا خدمت جهت فروش مستقیم</label>
              <input
                type="text"
                value={meta.checkoutItemName || link.title || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { checkoutItemName: e.target.value });
                  updateLink(link.id, { title: e.target.value });
                }}
                placeholder="مثال: رزرو وقت مشاوره 1 ساعته"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">مبلغ پرداختی</label>
                <input
                  type="number"
                  value={meta.checkoutAmount || 500}
                  onChange={(e) => updateLinkMetadata(link.id, { checkoutAmount: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">واحد پول</label>
                <select
                  value={meta.paymentCurrency || 'AFN'}
                  onChange={(e) => updateLinkMetadata(link.id, { paymentCurrency: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-sans"
                >
                  <option value="AFN">AFN (افغانی)</option>
                  <option value="USD">USD (دلار آمریکا)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک درگاه پرداخت (حساب‌پی یا URL)</label>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://hesabpay.af/pay/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      // PAYMENT PROVIDER (AFGHANISTAN)
      case 'payment':
        return renderPaymentInputs(link);

      // VIDEO MEETING
      case 'video_meeting':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1.5">پلتفرم جلسه</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'google_meet', label: 'Google Meet' },
                  { id: 'zoom', label: 'Zoom' },
                  { id: 'teams', label: 'MS Teams' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateLinkMetadata(link.id, { meetingPlatform: item.id as any })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${(meta.meetingPlatform || 'google_meet') === item.id
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک مستقیم ورود به جلسه (URL)</label>
              <input
                type="url"
                value={meta.meetingUrl || link.url || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { meetingUrl: e.target.value });
                  updateLink(link.id, { url: e.target.value });
                }}
                placeholder="https://meet.google.com/xyz..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      // MAP & NAVIGATION
      case 'map_navigation':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک نقشه گوگل</label>
              <input
                type="url"
                value={meta.googleMapsLink || link.url || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { googleMapsLink: e.target.value });
                  updateLink(link.id, { url: e.target.value });
                }}
                placeholder="لینک موقعیت مکانی خود را از نقشه گوگل کپی کرده و اینجا قرار دهید"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
                dir={meta.googleMapsLink || link.url ? 'ltr' : 'auto'}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک ویز (Waze - اختیاری)</label>
              <input
                type="url"
                value={meta.wazeLink || ''}
                onChange={(e) => updateLinkMetadata(link.id, { wazeLink: e.target.value })}
                placeholder="https://waze.com/ul/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
                dir={meta.wazeLink ? 'ltr' : 'auto'}
              />
            </div>
          </div>
        );

      case 'location_hours':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آدرس متنی موقعیت مکانی</label>
              <input
                type="text"
                value={meta.address || ''}
                onChange={(e) => updateLinkMetadata(link.id, { address: e.target.value })}
                placeholder="کابل، شهر نو، جاده شهید مزاری..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
                dir="auto"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک موقعیت مکانی در نقشه گوگل</label>
              <input
                type="url"
                value={meta.mapLink || link.url || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { mapLink: e.target.value });
                  updateLink(link.id, { url: e.target.value });
                }}
                placeholder="لینک موقعیت مکانی خود را از نقشه گوگل کپی کرده و اینجا قرار دهید"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
                dir={meta.mapLink || link.url ? 'ltr' : 'auto'}
              />
            </div>
          </div>
        );

      // BUSINESS HOURS
      case 'business_hours': {
        const defaultWeek: BusinessHourDay[] = [
          { dayIndex: 0, dayName: 'شنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayIndex: 1, dayName: 'یکشنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayIndex: 2, dayName: 'دوشنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayIndex: 3, dayName: 'سه‌شنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayIndex: 4, dayName: 'چهارشنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
          { dayIndex: 5, dayName: 'پنجشنبه', isOpen: true, openTime: '08:00', closeTime: '13:00' },
          { dayIndex: 6, dayName: 'جمعه', isOpen: false, openTime: '08:00', closeTime: '17:00' },
        ];
        const currentWeek: BusinessHourDay[] =
          Array.isArray(meta.businessHours) && meta.businessHours.length === 7
            ? meta.businessHours
            : defaultWeek;

        const handleDayToggle = (dayIdx: number, isOpen: boolean) => {
          const updated = currentWeek.map((d) => (d.dayIndex === dayIdx ? { ...d, isOpen } : d));
          updateLinkMetadata(link.id, { businessHours: updated });
        };

        const handleTimeChange = (dayIdx: number, field: 'openTime' | 'closeTime', val: string) => {
          const updated = currentWeek.map((d) => (d.dayIndex === dayIdx ? { ...d, [field]: val } : d));
          updateLinkMetadata(link.id, { businessHours: updated });
        };

        const handleApplySaturdayToAll = () => {
          const sat = currentWeek[0];
          const updated = currentWeek.map((d) => {
            if (d.dayIndex === 6) return d; // Keep Friday as closed by default
            return { ...d, isOpen: sat.isOpen, openTime: sat.openTime, closeTime: sat.closeTime };
          });
          updateLinkMetadata(link.id, { businessHours: updated });
          toast.success('ساعات کاری شنبه به روزهای کاری هفته اعمال شد');
        };

        return (
          <div className="space-y-4 pt-1">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                    برنامه ساعات کاری هفتگی
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    تعیین وضعیت روزهای کاری و ساعات ورود و خروج
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplySaturdayToAll}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
                title="اعمال ساعات شنبه به تمام روزهای کاری (شنبه تا پنجشنبه)"
              >
                اعمال شنبه به کل هفته
              </button>
            </div>

            <div className="space-y-2">
              {currentWeek.map((day) => (
                <div
                  key={day.dayIndex}
                  className={`p-3 rounded-xl border transition-all ${day.isOpen
                    ? 'bg-card/90 border-border shadow-xs'
                    : 'bg-muted/30 border-border/60 opacity-80'
                    }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5 min-w-[100px]">
                      <span className="text-xs font-bold text-foreground">
                        {day.dayName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${day.isOpen
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}
                      >
                        {day.isOpen ? 'روز کاری' : 'روز تعطیل'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {day.isOpen ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-muted-foreground">شروع:</label>
                            <input
                              type="time"
                              value={day.openTime || '08:00'}
                              onChange={(e) => handleTimeChange(day.dayIndex, 'openTime', e.target.value)}
                              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-sans focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          <span className="text-muted-foreground text-xs">-</span>
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-muted-foreground">پایان:</label>
                            <input
                              type="time"
                              value={day.closeTime || '17:00'}
                              onChange={(e) => handleTimeChange(day.dayIndex, 'closeTime', e.target.value)}
                              className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-sans focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          تعطیل رسمی (عدم حضور)
                        </span>
                      )}

                      <Switch
                        checked={day.isOpen}
                        onCheckedChange={(checked) => handleDayToggle(day.dayIndex, checked)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // PHONE & EMAIL
      case 'phone_call':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شماره تماس جهت برقراری مستقیم</label>
              <PhoneInput
                value={meta.phoneNumber || ''}
                onChange={(val) => {
                  updateLinkMetadata(link.id, { phoneNumber: val });
                  updateLink(link.id, { url: `tel:${val.replace(/\s+/g, '')}` });
                }}
                placeholder="799 123 456"
                defaultCountry="AF"
              />
            </div>
          </div>
        );

      case 'email_direct':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آدرس ایمیل گیرنده</label>
              <input
                type="email"
                value={meta.emailAddress || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { emailAddress: e.target.value });
                  updateLink(link.id, { url: `mailto:${e.target.value}?subject=${encodeURIComponent(meta.emailSubject || '')}` });
                }}
                placeholder="info@example.af"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">موضوع ایمیل (اختیاری)</label>
              <input
                type="text"
                value={meta.emailSubject || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { emailSubject: e.target.value });
                  updateLink(link.id, { url: `mailto:${meta.emailAddress || ''}?subject=${encodeURIComponent(e.target.value)}` });
                }}
                placeholder="پیام از طریق کارت دیجیتال"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>
        );

      // PDF CATALOG
      case 'pdf_catalog':
        return (
          <div className="space-y-3 pt-1">
            <FileUploader
              value={meta.catalogFileUrl || link.url || ''}
              onChange={(url) => {
                updateLinkMetadata(link.id, { catalogFileUrl: url });
                updateLink(link.id, { url });
              }}
              fileType="document"
              folder="documents"
              label="فایل سند یا کاتالوگ (PDF)"
              description="فرمت PDF، حداکثر 5 مگابایت"
              maxSizeMB={5}
            />
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">توضیح کوتاه زیر عنوان کاتالوگ</label>
              <input
                type="text"
                value={meta.pdfDescription || ''}
                onChange={(e) => updateLinkMetadata(link.id, { pdfDescription: e.target.value })}
                placeholder="مشاهده و دانلود کاتالوگ معرفی محصولات"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>
        );

      // VIDEO EMBEDS
      case 'youtube_embed':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک یا آی دی ویدیو یوتیوب</label>
              <input
                type="url"
                value={meta.youtubeUrl || link.url || ''}
                onChange={(e) => {
                  const url = e.target.value;
                  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                  const videoId = match ? match[1] : url;
                  updateLinkMetadata(link.id, { youtubeUrl: url, youtubeVideoId: videoId });
                  updateLink(link.id, { url });
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'aparat_embed':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک یا آی دی ویدیو آپارات</label>
              <input
                type="url"
                value={meta.aparatUrl || link.url || ''}
                onChange={(e) => {
                  const url = e.target.value;
                  const match = url.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/);
                  const videoId = match ? match[1] : url.replace(/[^a-zA-Z0-9]/g, '');
                  updateLinkMetadata(link.id, { aparatUrl: url, aparatVideoId: videoId });
                  updateLink(link.id, { url });
                }}
                placeholder="https://www.aparat.com/v/xyz12"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      // IMAGES
      case 'single_image':
        return (
          <div className="space-y-3 pt-1">
            <FileUploader
              value={meta.singleImageUrl || ''}
              onChange={(url) => updateLinkMetadata(link.id, { singleImageUrl: url })}
              fileType="image"
              folder="general"
              label="تصویر تک بنری"
              description="حداکثر 2 مگابایت"
              maxSizeMB={2}
            />
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک بازگشایی با کلیک روی عکس (اختیاری)</label>
              <input
                type="url"
                value={meta.singleImageLink || ''}
                onChange={(e) => updateLinkMetadata(link.id, { singleImageLink: e.target.value })}
                placeholder="https://example.com"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      // CONTAINER / GROUP
      case 'container_group':
        return (
          <div className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-foreground">حالت نمایش ماژول‌های درون گروه</label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {meta.containerLayout === 'horizontal_compact'
                      ? 'نمایش فشرده: آیکون‌های کوچک در یک ردیف افقی (مناسب شبکه‌ها و لینک‌های پرتکرار)'
                      : 'نمایش لیست: کارت‌های مجزا به صورت ستون عمودی'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-semibold ${meta.containerLayout !== 'horizontal_compact'
                      ? 'text-foreground font-bold'
                      : 'text-muted-foreground'
                      }`}
                  >
                    عمودی
                  </span>
                  <Switch
                    checked={meta.containerLayout === 'horizontal_compact'}
                    onCheckedChange={(checked) =>
                      updateLinkMetadata(link.id, {
                        containerLayout: checked ? 'horizontal_compact' : 'vertical',
                      })
                    }
                  />
                  <span
                    className={`text-[11px] font-semibold ${meta.containerLayout === 'horizontal_compact'
                      ? 'text-cyan-400 font-bold'
                      : 'text-muted-foreground'
                      }`}
                  >
                    فشرده / افقی
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-start gap-2">
              <FolderPlus className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
              <span className="leading-relaxed">
                <strong>راهنمای چیدمان تو در تو:</strong> ماژول‌های دیگر را با گرفتن دستگیره درگ به سمت این کانتینر بکشید تا به عنوان زیرمجموعه در آن قرار گیرند. همچنین با کشیدن به بیرون، از گروه خارج می‌شوند.
              </span>
            </div>
          </div>
        );

      // STANDARD LINK
      case 'standard_link':
      default:
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آدرس اینترنتی (URL)</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans text-left"
                  dir="ltr"
                />
                {link.url && (
                  <a
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-xl border border-border transition-colors"
                    title="تست لینک در تب جدید"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  // 5. ADVANCED SETTINGS (Structured into 2 Unified Groups: Access & Scheduling, then Appearance & Styling)
  const renderAdvancedSettings = (link: ProfileLinkItem) => {
    const adv = link.advancedSettings || {};
    const sched = adv.scheduling || { enabled: false, days: [0, 1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '20:00' };
    const lock = adv.monetization || { isLocked: false, price: 50, currency: 'AFN', unlockNote: '' };
    const style = adv.customStyling || {};

    return (
      <div className="space-y-4 pt-1">
        {/* ========================================================================= */}
        {/* GROUP 1: ACCESS & SCHEDULING (دسترسی و زمان‌بندی)                         */}
        {/* ========================================================================= */}
        <div className="p-3.5 rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/20 via-background to-slate-900/30 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-xs font-bold text-foreground block">
                دسترسی و زمان‌بندی (Access &amp; Scheduling)
              </span>
              <span className="text-[10px] text-muted-foreground block">
                مدیریت زمان، انقضا، سقف کلیک و سطوح دسترسی امنیتی دکمه
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* 1. زمان‌بندی نمایش روزانه (ساعات فعال بودن / Daily Scheduling) */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">۱. زمان‌بندی نمایش روزانه</span>
                    <span className="text-[10px] text-muted-foreground block">تعیین بازه ساعات فعال بودن ماژول در طول شبانه‌روز</span>
                  </div>
                </div>
                <Switch
                  checked={sched.enabled}
                  onCheckedChange={(checked) =>
                    updateLinkAdvancedSettings(link.id, {
                      scheduling: { ...sched, enabled: checked },
                    })
                  }
                />
              </div>

              {sched.enabled && (
                <div className="space-y-3 pt-2.5 border-t border-border/50 animate-in fade-in">
                  <p className="text-[11px] text-muted-foreground">
                    این دکمه فقط در ساعات تعیین‌شده در طول شبانه‌روز برای بازدیدکنندگان فعال و نمایان است:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">ساعت شروع</label>
                      <input
                        type="time"
                        value={sched.startTime || '08:00'}
                        onChange={(e) =>
                          updateLinkAdvancedSettings(link.id, {
                            scheduling: { ...sched, startTime: e.target.value },
                          })
                        }
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">ساعت پایان</label>
                      <input
                        type="time"
                        value={sched.endTime || '20:00'}
                        onChange={(e) =>
                          updateLinkAdvancedSettings(link.id, {
                            scheduling: { ...sched, endTime: e.target.value },
                          })
                        }
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. تاریخ انقضای ماژول (Module Expiration Date) */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">۲. تاریخ انقضای ماژول</span>
                    <span className="text-[10px] text-muted-foreground block">غیرفعال‌سازی خودکار دکمه پس از سررسید زمانی</span>
                  </div>
                </div>
                <Switch
                  checked={Boolean(link.expiresAt || adv.expiresAt)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const defaultExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
                      updateLink(link.id, {
                        expiresAt: defaultExp,
                        advancedSettings: { ...adv, expiresAt: defaultExp },
                      });
                    } else {
                      updateLink(link.id, {
                        expiresAt: null,
                        advancedSettings: { ...adv, expiresAt: null },
                      });
                    }
                  }}
                />
              </div>

              {Boolean(link.expiresAt || adv.expiresAt) && (
                <div className="pt-2 border-t border-border/50 space-y-1.5 animate-in fade-in">
                  <label className="block text-[10px] text-muted-foreground">
                    پس از رسیدن به این تاریخ و ساعت، دکمه به طور خودکار غیرفعال و مخفی خواهد شد:
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      link.expiresAt
                        ? (link.expiresAt instanceof Date ? link.expiresAt.toISOString().slice(0, 16) : String(link.expiresAt).slice(0, 16))
                        : (adv.expiresAt ? String(adv.expiresAt).slice(0, 16) : '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      updateLink(link.id, {
                        expiresAt: val || null,
                        advancedSettings: { ...adv, expiresAt: val || null },
                      });
                    }}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-sans text-left"
                    dir="ltr"
                  />
                </div>
              )}
            </div>

            {/* 3. محدودیت تعداد کلیک/بازدید (Max Clicks / Click Limit) */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">۳. محدودیت تعداد کلیک/بازدید</span>
                    <span className="text-[10px] text-muted-foreground block">تعیین سقف کلیک مجاز قبل از انقضای دکمه</span>
                  </div>
                </div>
                <Switch
                  checked={typeof (link.maxClicks ?? adv.maxClicks) === 'number' && (link.maxClicks ?? adv.maxClicks)! > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateLink(link.id, {
                        maxClicks: 100,
                        advancedSettings: { ...adv, maxClicks: 100 },
                      });
                    } else {
                      updateLink(link.id, {
                        maxClicks: null,
                        advancedSettings: { ...adv, maxClicks: null },
                      });
                    }
                  }}
                />
              </div>

              {typeof (link.maxClicks ?? adv.maxClicks) === 'number' && (link.maxClicks ?? adv.maxClicks)! > 0 && (
                <div className="pt-2 border-t border-border/50 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-muted-foreground">حداکثر کلیک مجاز:</label>
                    <span className="text-[10px] text-cyan-400 font-sans">
                      کلیک‌های ثبت‌شده تاکنون: {link.clickCount || 0}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={link.maxClicks ?? adv.maxClicks ?? 100}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : null;
                      updateLink(link.id, {
                        maxClicks: val,
                        advancedSettings: { ...adv, maxClicks: val },
                      });
                    }}
                    placeholder="مثلاً 100"
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-sans text-left"
                    dir="ltr"
                  />
                </div>
              )}
            </div>

            {/* 4. قفل با گذرواژه (Password Lock) */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">۴. قفل با گذرواژه</span>
                    <span className="text-[10px] text-muted-foreground block">دسترسی و باز شدن لینک منوط به وارد کردن رمز اختصاصی</span>
                  </div>
                </div>
                <Switch
                  checked={Boolean(link.hasPassword || link.passwordHash || adv.hasPassword || (link as any).rawPassword)}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      updateLink(link.id, {
                        passwordHash: null,
                        hasPassword: false,
                        rawPassword: '',
                        removePassword: true,
                        advancedSettings: {
                          ...adv,
                          passwordHash: null,
                          hasPassword: false,
                          removePassword: true,
                        },
                      } as any);
                      toast.success('رمز عبور این لینک حذف شد.');
                    }
                  }}
                />
              </div>

              <div className="space-y-2 pt-1 animate-in fade-in">
                {Boolean(link.hasPassword || link.passwordHash || adv.hasPassword) && (
                  <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg">
                    <span className="text-[11px] text-purple-300 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3 text-purple-400" />
                      رمز عبور فعال است
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateLink(link.id, {
                          passwordHash: null,
                          hasPassword: false,
                          rawPassword: '',
                          removePassword: true,
                          advancedSettings: {
                            ...adv,
                            passwordHash: null,
                            hasPassword: false,
                            removePassword: true,
                          },
                        } as any);
                        toast.success('رمز عبور لینک برداشته شد.');
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      حذف رمز
                    </button>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="block text-[10px] text-muted-foreground">
                    {link.hasPassword || link.passwordHash || adv.hasPassword
                      ? 'تعیین رمز عبور جدید (در صورت تمایل به تغییر رمز فعلی):'
                      : 'رمز عبور دلخواه برای قفل کردن لینک:'}
                  </label>
                  <input
                    type="password"
                    placeholder="رمز عبور دلخواه..."
                    value={(link as any).rawPassword || ''}
                    onChange={(e) => {
                      const pass = e.target.value;
                      updateLink(link.id, {
                        rawPassword: pass,
                        hasPassword: Boolean(pass || link.hasPassword || link.passwordHash),
                        removePassword: false,
                        advancedSettings: {
                          ...adv,
                          hasPassword: Boolean(pass || link.hasPassword || link.passwordHash),
                          removePassword: false,
                        },
                      } as any);
                    }}
                    className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-sans text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* 5. قفل پولی/VIP (پرداخت برای مشاهده / Monetization) */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">۵. قفل پولی / VIP (پرداخت برای مشاهده)</span>
                    <span className="text-[10px] text-muted-foreground block">دریافت هزینه از کاربر جهت دسترسی به محتوا یا لینک</span>
                  </div>
                </div>
                <Switch
                  checked={lock.isLocked}
                  onCheckedChange={(checked) =>
                    updateLinkAdvancedSettings(link.id, {
                      monetization: { ...lock, isLocked: checked },
                    })
                  }
                />
              </div>

              {lock.isLocked && (
                <div className="space-y-3 pt-2.5 border-t border-border/50 animate-in fade-in">
                  <p className="text-[11px] text-muted-foreground">
                    بازدیدکننده برای باز کردن و دسترسی به این لینک باید هزینه تعیین‌شده را پرداخت کند:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">مبلغ بازگشایی</label>
                      <input
                        type="number"
                        value={lock.price || 50}
                        onChange={(e) =>
                          updateLinkAdvancedSettings(link.id, {
                            monetization: { ...lock, price: Number(e.target.value) },
                          })
                        }
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-sans text-left"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">واحد پول</label>
                      <select
                        value={lock.currency || 'AFN'}
                        onChange={(e) =>
                          updateLinkAdvancedSettings(link.id, {
                            monetization: { ...lock, currency: e.target.value as any },
                          })
                        }
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-sans"
                      >
                        <option value="AFN">AFN (افغانی)</option>
                        <option value="USD">USD (دلار)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 2: APPEARANCE & STYLING (ظاهر و استایل)                             */}
        {/* ========================================================================= */}
        <div className="p-3.5 rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-950/20 via-background to-slate-900/30 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-xs font-bold text-foreground block">
                ظاهر و استایل (Appearance &amp; Styling)
              </span>
              <span className="text-[10px] text-muted-foreground block">
                تنظیمات بصری، انیمیشن‌ها، رنگ اختصاصی و فرم هندسی دکمه
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* 1. انیمیشن دکمه (Button Animation + Trigger + Speed + Types) */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  <span>انیمیشن دکمه</span>
                </label>
                <span className="text-[10px] text-muted-foreground font-sans">
                  Duration: {adv.animationSpeed || 1.6}s
                </span>
              </div>

              {/* Animation Trigger Category (Infinite Loop vs Hover-Only) */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-background/80 border border-border">
                <button
                  type="button"
                  onClick={() => updateLinkAdvancedSettings(link.id, { animationTrigger: 'infinite' })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${(adv.animationTrigger || 'infinite') === 'infinite'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  انیمیشن همیشگی
                </button>
                <button
                  type="button"
                  onClick={() => updateLinkAdvancedSettings(link.id, { animationTrigger: 'hover' })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${adv.animationTrigger === 'hover'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  انیمیشن با عبور ماوس
                </button>
              </div>

              {/* Animation Speed Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-medium">سرعت اجرای انیمیشن</span>
                  <span className="font-sans font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    {adv.animationSpeed || 1.6}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={adv.animationSpeed || 1.6}
                  onChange={(e) =>
                    updateLinkAdvancedSettings(link.id, {
                      animationSpeed: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-sans">
                  <span>0.5s (سریع)</span>
                  <span>1.6s (استاندارد)</span>
                  <span>3.0s (ملایم)</span>
                </div>
              </div>

              {/* 7 Animation Types Grid */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { id: 'shake_x', label: 'Shake x', animClass: 'animate-shake-x' },
                  { id: 'wobble', label: 'Wobble', animClass: 'animate-wobble' },
                  { id: 'buzz', label: 'Buzz', animClass: 'animate-buzz' },
                  { id: 'tada', label: 'Tada', animClass: 'animate-tada' },
                  { id: 'heart', label: 'Heart', animClass: 'animate-heart' },
                  { id: 'pulse', label: 'Pulse', animClass: 'animate-pulse-smooth' },
                  { id: 'shake_y', label: 'Shake y', animClass: 'animate-shake-y' },
                  { id: 'none', label: 'None', animClass: '' },
                ].map((anim) => {
                  const isSelected = (adv.buttonAnimation || 'none') === anim.id;
                  return (
                    <button
                      key={anim.id}
                      type="button"
                      onClick={() => updateLinkAdvancedSettings(link.id, { buttonAnimation: anim.id as any })}
                      className={`relative p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group min-h-[72px] ${isSelected
                        ? 'bg-card border-slate-900 dark:border-purple-400 ring-2 ring-purple-500/40 shadow-md font-bold'
                        : 'bg-card/90 border-border/70 hover:border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-purple-700 text-white flex items-center justify-center text-[9px] shadow-xs">
                          ✓
                        </span>
                      )}
                      <div className="w-5 h-5 rounded-md bg-purple-900/90 dark:bg-purple-500 flex items-center justify-center shadow-xs">
                        <span className={`w-3.5 h-3.5 rounded-sm bg-purple-300 dark:bg-purple-950 ${anim.animClass}`} />
                      </div>
                      <span className="text-[11px] font-sans font-medium text-foreground block text-center">
                        {anim.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. شخصی‌سازی رنگ‌های دکمه (Custom Colors) */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-foreground">شخصی‌سازی رنگ اختصاصی این دکمه</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">رنگ پس‌زمینه</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.customBgColor || '#0ea5e9'}
                      onChange={(e) =>
                        updateLinkAdvancedSettings(link.id, {
                          customStyling: { ...style, customBgColor: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-sans text-xs text-muted-foreground">{style.customBgColor || 'پیش‌فرض'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">رنگ متن</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.customTextColor || '#ffffff'}
                      onChange={(e) =>
                        updateLinkAdvancedSettings(link.id, {
                          customStyling: { ...style, customTextColor: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-sans text-xs text-muted-foreground">{style.customTextColor || 'پیش‌فرض'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. شکل هندسی دکمه (Button Shape & Inheritance) */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground block">
                  شکل و فرم هندسی دکمه
                </label>
                <span className="text-[10px] text-muted-foreground font-sans bg-muted/60 px-2 py-0.5 rounded-md">
                  تم عمومی: {(() => {
                    const s = profile.themeConfig.buttonShape || 'soft';
                    switch (s) {
                      case 'sharp': return 'مربع تیز';
                      case 'soft': return 'لبه‌گرد ملایم';
                      case 'pill': return 'کاملاً گرد (کپسولی)';
                      case 'leaf': return 'برگ';
                      case 'cut_corners': return 'پخ‌خورده';
                      case 'ticket': return 'تیکت';
                      case 'hexagon': return 'شش‌ضلعی';
                      case 'parallelogram_l': return 'متوازی';
                      default: return s;
                    }
                  })()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'inherit',
                    label: 'ارث‌بری از تم',
                    sub: 'Inherit (پیش‌فرض)',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border-2 border-dashed border-current rounded-md flex items-center justify-center text-[8px] font-sans font-bold">
                        AUTO
                      </div>
                    ),
                  },
                  {
                    id: 'sharp',
                    label: 'مربع تیز',
                    sub: 'Sharp',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border-2 border-current rounded-none" />
                    ),
                  },
                  {
                    id: 'soft',
                    label: 'لبه‌گرد ملایم',
                    sub: 'Soft',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border-2 border-current rounded-[3px]" />
                    ),
                  },
                  {
                    id: 'pill',
                    label: 'کاملاً گرد',
                    sub: 'Pill',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border-2 border-current rounded-full" />
                    ),
                  },
                  {
                    id: 'leaf',
                    label: 'برگ',
                    sub: 'Leaf',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border-2 border-current rounded-tr-lg rounded-bl-lg rounded-tl-none rounded-br-none" />
                    ),
                  },
                  {
                    id: 'cut_corners',
                    label: 'پخ‌خورده',
                    sub: 'Cut Corners',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border border-current btn-shape-cut_corners bg-current/25" />
                    ),
                  },
                  {
                    id: 'ticket',
                    label: 'تیکت',
                    sub: 'Ticket',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border border-current btn-shape-ticket bg-current/25" />
                    ),
                  },
                  {
                    id: 'hexagon',
                    label: 'شش‌ضلعی',
                    sub: 'Hexagon',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border border-current btn-shape-hexagon bg-current/25" />
                    ),
                  },
                  {
                    id: 'parallelogram_l',
                    label: 'متوازی',
                    sub: 'Parallelogram',
                    renderWireframe: () => (
                      <div className="w-10 h-5 border border-current btn-shape-parallelogram_l bg-current/25" />
                    ),
                  },
                ].map((r) => {
                  const currentShape = style.buttonShape || 'inherit';
                  const isSelected = currentShape === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        updateLinkAdvancedSettings(link.id, {
                          customStyling: {
                            ...style,
                            buttonShape: r.id === 'inherit' ? 'inherit' : (r.id as any),
                          },
                        })
                      }
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 ring-2 ring-cyan-500/30 font-bold shadow-sm'
                        : 'bg-card/80 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      <div className="h-6 flex items-center justify-center">{r.renderWireframe()}</div>
                      <span className="text-[11px] font-bold block truncate w-full">{r.label}</span>
                      <span className="text-[9px] opacity-70 block font-sans" dir="ltr">
                        {r.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                در حالت «ارث‌بری از تم»، شکل دکمه به طور خودکار از تنظیمات تب طراحی و تم ارث برده می‌شود. با انتخاب هر شکل اختصاصی، این دکمه استایل منحصربه‌فرد خواهد داشت.
              </p>
            </div>

            {/* 4. باز شدن در پنجره جدید */}
            <div className="p-3 rounded-lg border border-border/80 bg-background/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground block">باز شدن در پنجره جدید</span>
                <span className="text-[10px] text-muted-foreground block">هنگام کلیک، این لینک در یک صفحه مجزا باز شود</span>
              </div>
              <Switch
                checked={adv.openInNewTab !== false}
                onCheckedChange={(checked) => updateLinkAdvancedSettings(link.id, { openInNewTab: checked })}
              />
            </div>

            {/* 5. نمایش فشرده (فقط آیکون) (Compact Icon) */}
            {isSocialModule(link.moduleType) && !link.parentId && (
              <div className="p-3 rounded-lg border border-border/80 bg-background/60 flex items-center justify-between">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-xs font-bold text-foreground block">
                    نمایش فشرده (فقط آیکون)
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    نمایش به عنوان آیکون کوچک در ردیف بالای صفحه به جای کارت مستقل
                  </span>
                </div>
                <Switch
                  checked={adv.isCompactIcon !== false}
                  onCheckedChange={(checked) =>
                    updateLinkAdvancedSettings(link.id, { isCompactIcon: checked })
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
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

    // Dropping onto container placeholder
    const containerDropPrefix = 'container-drop-';
    if (overId.startsWith(containerDropPrefix)) {
      const targetContainerId = overId.replace(containerDropPrefix, '');
      if (activeItem.moduleType === 'container_group') return links;

      const newLinks = [...links];
      const [moved] = newLinks.splice(activeIndex, 1);
      moved.parentId = targetContainerId;

      const containerIdx = newLinks.findIndex((l) => l.id === targetContainerId);
      if (containerIdx === -1) {
        newLinks.push(moved);
      } else {
        newLinks.splice(containerIdx + 1, 0, moved);
      }
      return newLinks.map((item, idx) => ({ ...item, order: idx }));
    }

    const overIndex = links.findIndex((l) => l.id === overId);
    if (overIndex === -1) return links;
    const overItem = links[overIndex];

    // Case 1: active item is container_group (containers cannot be nested)
    if (activeItem.moduleType === 'container_group') {
      const newLinks = [...links];
      const [moved] = newLinks.splice(activeIndex, 1);
      moved.parentId = null;
      const newOverIndex = newLinks.findIndex((l) => l.id === overId);
      newLinks.splice(newOverIndex, 0, moved);
      return newLinks.map((item, idx) => ({ ...item, order: idx }));
    }

    // Case 2: active item dropped onto a container_group card -> becomes child
    if (overItem.moduleType === 'container_group') {
      const newLinks = [...links];
      const [moved] = newLinks.splice(activeIndex, 1);
      moved.parentId = overItem.id;
      const newOverIndex = newLinks.findIndex((l) => l.id === overId);
      newLinks.splice(newOverIndex + 1, 0, moved);
      return newLinks.map((item, idx) => ({ ...item, order: idx }));
    }

    // Case 3: active item dropped onto a child inside a container -> adopt container
    if (overItem.parentId) {
      const newLinks = [...links];
      const [moved] = newLinks.splice(activeIndex, 1);
      moved.parentId = overItem.parentId;
      const newOverIndex = newLinks.findIndex((l) => l.id === overId);
      newLinks.splice(newOverIndex, 0, moved);
      return newLinks.map((item, idx) => ({ ...item, order: idx }));
    }

    // Case 4: active item dropped onto top-level item -> become top-level
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
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const reordered = handleTreeReorder(
        [...profile.links],
        String(active.id),
        String(over.id)
      );
      reorderLinks(reordered);
      debouncedDragSave(); // Auto-save on drag end with debounce
      toast.success('چیدمان ماژول‌ها به‌روزرسانی و ذخیره شد');
    }
    setActiveDragId(null);
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const activeDragLink = activeDragId ? profile.links.find((l) => l.id === activeDragId) : null;

  if (profile.links.length === 0) {
    return null;
  }

  const topLevelLinks = profile.links.filter((l) => !l.parentId);
  const getChildLinks = (containerId: string) => profile.links.filter((l) => l.parentId === containerId);

  return (
    <DndContext
      id="sidebar-modules-dnd-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={profile.links.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {topLevelLinks.map((link) => {
            if (link.moduleType === 'container_group') {
              const children = getChildLinks(link.id);
              return (
                <SortableSidebarContainerItem
                  key={link.id}
                  container={link}
                  childLinks={children}
                  isExpanded={expandedModuleId === link.id}
                  isUnconfirmed={unconfirmedModuleId === link.id}
                  activeModuleId={activeModuleId}
                  activeSettingsTab={activeSettingsTab}
                  toggleExpand={toggleExpand}
                  updateLink={updateLink}
                  updateLinkMetadata={updateLinkMetadata}
                  handleRemoveLink={handleRemoveLink}
                  setActiveSettingsTab={setActiveSettingsTab}
                  renderDisplayTitleInput={renderDisplayTitleInput}
                  renderModuleSpecificInputs={renderModuleSpecificInputs}
                  renderAdvancedSettings={renderAdvancedSettings}
                  handleCancel={handleCancel}
                  handleConfirm={handleConfirm}
                  getModuleIcon={getModuleIcon}
                  isInteractiveModule={isInteractiveModule}
                />
              );
            }

            return (
              <SortableSidebarModuleItem
                key={link.id}
                link={link}
                isExpanded={expandedModuleId === link.id}
                isUnconfirmed={unconfirmedModuleId === link.id}
                activeModuleId={activeModuleId}
                activeSettingsTab={activeSettingsTab}
                isInteractive={isInteractiveModule(link.moduleType)}
                toggleExpand={toggleExpand}
                updateLink={updateLink}
                handleRemoveLink={handleRemoveLink}
                setActiveSettingsTab={setActiveSettingsTab}
                renderDisplayTitleInput={renderDisplayTitleInput}
                renderModuleSpecificInputs={renderModuleSpecificInputs}
                renderAdvancedSettings={renderAdvancedSettings}
                handleCancel={handleCancel}
                handleConfirm={handleConfirm}
                getModuleIcon={getModuleIcon}
              />
            );
          })}
        </div>
      </SortableContext>

      {/* DragOverlay (True visual clone of module following the pointer) */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeDragLink ? (
          <div className="rounded-2xl border border-cyan-500 bg-card p-3 flex items-center justify-between gap-2.5 shadow-2xl ring-2 ring-cyan-500/40 cursor-grabbing scale-[1.02] opacity-95">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="text-cyan-500 p-1 shrink-0">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-muted/80 border border-border flex items-center justify-center shrink-0">
                {getModuleIcon(activeDragLink.moduleType)}
              </div>
              <span className="text-xs font-bold text-foreground truncate font-sans">
                {activeDragLink.title || (activeDragLink.moduleType === 'container_group' ? 'گروه / کانتینر' : 'ماژول')}
              </span>
            </div>
            {activeDragLink.moduleType === 'container_group' && (
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                گروه
              </span>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface SortableSidebarContainerItemProps {
  container: ProfileLinkItem;
  childLinks: ProfileLinkItem[];
  isExpanded: boolean;
  isUnconfirmed: boolean;
  activeModuleId: string | null;
  activeSettingsTab: Record<string, 'content' | 'advanced'>;
  toggleExpand: (id: string) => void;
  updateLink: (id: string, updates: Partial<ProfileLinkItem>) => void;
  updateLinkMetadata: (id: string, metadataUpdates: any) => void;
  handleRemoveLink: (id: string) => void;
  setActiveSettingsTab: React.Dispatch<React.SetStateAction<Record<string, 'content' | 'advanced'>>>;
  renderDisplayTitleInput: (link: ProfileLinkItem) => React.ReactNode;
  renderModuleSpecificInputs: (link: ProfileLinkItem) => React.ReactNode;
  renderAdvancedSettings: (link: ProfileLinkItem) => React.ReactNode;
  handleCancel: (id: string) => void;
  handleConfirm: (id: string) => void;
  getModuleIcon: (type: LinkModuleType) => React.ReactNode;
  isInteractiveModule: (type: LinkModuleType) => boolean;
}

const SortableSidebarContainerItem: React.FC<SortableSidebarContainerItemProps> = ({
  container,
  childLinks,
  isExpanded,
  isUnconfirmed,
  activeModuleId,
  activeSettingsTab,
  toggleExpand,
  updateLink,
  updateLinkMetadata,
  handleRemoveLink,
  setActiveSettingsTab,
  renderDisplayTitleInput,
  renderModuleSpecificInputs,
  renderAdvancedSettings,
  handleCancel,
  handleConfirm,
  getModuleIcon,
  isInteractiveModule,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: container.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: 'relative',
    zIndex: isDragging ? 50 : undefined,
  };

  const isCompact = container.metadata?.containerLayout === 'horizontal_compact';

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`module-edit-item-${container.id}`}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isDragging ? 'ring-2 ring-cyan-500/50 shadow-2xl' : ''
        } ${isExpanded
          ? 'bg-card border-cyan-500/80 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20'
          : 'bg-card/90 border-cyan-500/30 hover:border-cyan-500/50'
        } ${activeModuleId === container.id
          ? 'ring-2 ring-cyan-500 border-cyan-500 shadow-xl shadow-cyan-500/25'
          : ''
        }`}
    >
      {/* Container Header */}
      <div
        onClick={() => toggleExpand(container.id)}
        className="p-3 bg-gradient-to-r from-cyan-500/10 via-muted/40 to-transparent flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-md transition-colors p-1 shrink-0 touch-none"
            onClick={(e) => e.stopPropagation()}
            title="جابه‌جایی کانتینر (کشیدن و رها کردن)"
          >
            <GripVertical className="w-4 h-4 text-cyan-500" />
          </div>

          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Folder className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={container.title}
              onChange={(e) => updateLink(container.id, { title: e.target.value })}
              className="bg-transparent border-0 text-xs font-bold text-foreground focus:outline-none focus:ring-0 p-0 font-sans w-full truncate"
              placeholder="عنوان گروه / کانتینر..."
            />
            <span className="text-[10px] bg-cyan-500/15 text-cyan-400 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 shrink-0 font-sans">
              {childLinks.length} ماژول
            </span>
            <span className="text-[9px] bg-muted text-muted-foreground font-semibold px-1.5 py-0.5 rounded-md border border-border shrink-0">
              {isCompact ? 'فشرده / افقی' : 'لیست عمودی'}
            </span>
            {isUnconfirmed && (
              <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                تاییدنشده
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => updateLink(container.id, { isActive: !container.isActive })}
            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${container.isActive
              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30'
              : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
              }`}
            title={container.isActive ? 'کانتینر فعال است' : 'کانتینر مخفی است'}
          >
            {container.isActive ? (
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleExpand(container.id)}
            className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border flex items-center justify-center transition-colors"
            title="تنظیمات چیدمان کانتینر"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleRemoveLink(container.id)}
            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center"
            title="حذف کانتینر (ماژول‌های درون آن مستقل می‌شوند)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Container Settings Form */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 bg-muted/20 border-t border-border space-y-3">
          {renderDisplayTitleInput(container)}
          {renderModuleSpecificInputs(container)}

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleCancel(container.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all active:scale-95 border border-border"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              لغو
            </button>

            <button
              type="button"
              onClick={() => handleConfirm(container.id)}
              className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-sm transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              تایید
            </button>
          </div>
        </div>
      )}

      {/* Nested Children Area */}
      <div className="p-3 bg-muted/10 border-t border-cyan-500/20">
        <div className="mr-3 pr-2 border-r-2 border-cyan-500/40 space-y-2.5">
          {childLinks.map((child) => (
            <SortableSidebarModuleItem
              key={child.id}
              link={child}
              isNested={true}
              containerId={container.id}
              isExpanded={activeModuleId === child.id}
              isUnconfirmed={isUnconfirmed && activeModuleId === child.id}
              activeModuleId={activeModuleId}
              activeSettingsTab={activeSettingsTab}
              isInteractive={isInteractiveModule(child.moduleType)}
              toggleExpand={toggleExpand}
              updateLink={updateLink}
              handleRemoveLink={handleRemoveLink}
              setActiveSettingsTab={setActiveSettingsTab}
              renderDisplayTitleInput={renderDisplayTitleInput}
              renderModuleSpecificInputs={renderModuleSpecificInputs}
              renderAdvancedSettings={renderAdvancedSettings}
              handleCancel={handleCancel}
              handleConfirm={handleConfirm}
              getModuleIcon={getModuleIcon}
            />
          ))}

          {childLinks.length === 0 && (
            <div
              id={`container-drop-${container.id}`}
              className="p-3 border-2 border-dashed border-cyan-500/30 rounded-xl text-center text-muted-foreground text-[11px] bg-cyan-500/5 select-none transition-colors hover:border-cyan-500/60"
            >
              این کانتینر در حال حاضر خالی است. ماژول‌ها را با دستگیره کشیده و اینجا بیندازید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SortableSidebarModuleItemProps {
  link: ProfileLinkItem;
  isExpanded: boolean;
  isUnconfirmed: boolean;
  activeModuleId: string | null;
  activeSettingsTab: Record<string, 'content' | 'advanced'>;
  isInteractive: boolean;
  isNested?: boolean;
  containerId?: string;
  toggleExpand: (id: string) => void;
  updateLink: (id: string, updates: Partial<ProfileLinkItem>) => void;
  handleRemoveLink: (id: string) => void;
  setActiveSettingsTab: React.Dispatch<React.SetStateAction<Record<string, 'content' | 'advanced'>>>;
  renderDisplayTitleInput: (link: ProfileLinkItem) => React.ReactNode;
  renderModuleSpecificInputs: (link: ProfileLinkItem) => React.ReactNode;
  renderAdvancedSettings: (link: ProfileLinkItem) => React.ReactNode;
  handleCancel: (id: string) => void;
  handleConfirm: (id: string) => void;
  getModuleIcon: (type: LinkModuleType) => React.ReactNode;
}

const SortableSidebarModuleItem: React.FC<SortableSidebarModuleItemProps> = ({
  link,
  isExpanded,
  isUnconfirmed,
  activeModuleId,
  activeSettingsTab,
  isInteractive,
  isNested = false,
  containerId,
  toggleExpand,
  updateLink,
  handleRemoveLink,
  setActiveSettingsTab,
  renderDisplayTitleInput,
  renderModuleSpecificInputs,
  renderAdvancedSettings,
  handleCancel,
  handleConfirm,
  getModuleIcon,
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
    position: 'relative',
    zIndex: isDragging ? 50 : undefined,
  };

  const currentTab = activeSettingsTab[link.id] || 'content';

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`module-edit-item-${link.id}`}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isDragging ? 'ring-2 ring-cyan-500/50 shadow-2xl' : ''
        } ${isExpanded
          ? 'bg-card border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20'
          : 'bg-card/75 border-border hover:border-border/80'
        } ${activeModuleId === link.id
          ? 'ring-2 ring-cyan-500 border-cyan-500 shadow-xl shadow-cyan-500/25'
          : ''
        } ${isNested ? 'bg-card/95 border-border/80' : ''}`}
    >
      {/* Header / Summary Bar */}
      <div
        onClick={() => toggleExpand(link.id)}
        className="p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Drag Grip Handle with dnd-kit attributes & listeners */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-md transition-colors p-1 shrink-0 touch-none"
            onClick={(e) => e.stopPropagation()}
            title="جابه‌جایی ماژول (کشیدن و رها کردن)"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Module Icon */}
          <div className="w-8 h-8 rounded-xl bg-muted/80 border border-border flex items-center justify-center shrink-0">
            {getModuleIcon(link.moduleType)}
          </div>

          {/* Module Title (Read-only display; clicking anywhere on header row expands/collapses accordion) */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-xs font-bold text-foreground truncate select-none">
              {link.moduleType === 'divider_heading'
                ? 'خط جداکننده'
                : link.moduleType === 'spacer_divider'
                  ? 'فاصله خالی'
                  : link.title || 'بدون عنوان'}
            </span>
            {isUnconfirmed && (
              <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                تاییدنشده
              </span>
            )}
            {link.advancedSettings?.monetization?.isLocked && (
              <span className="text-[10px] bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 shrink-0 font-sans" title="قفل پولی / VIP">
                <Lock className="w-2.5 h-2.5" />
                پولی
              </span>
            )}
            {Boolean(link.hasPassword || link.passwordHash || link.advancedSettings?.passwordHash || link.advancedSettings?.hasPassword) && (
              <span className="text-[10px] bg-purple-500/15 text-purple-400 font-bold px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1 shrink-0 font-sans" title="محافظت با رمز عبور">
                <KeyRound className="w-2.5 h-2.5" />
                رمزدار
              </span>
            )}
            {Boolean(link.expiresAt || link.advancedSettings?.expiresAt) && (
              <span className="text-[10px] bg-rose-500/15 text-rose-400 font-bold px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1 shrink-0 font-sans" title="دارای زمان انقضا">
                <Hourglass className="w-2.5 h-2.5" />
                انقضا
              </span>
            )}
            {typeof (link.maxClicks ?? link.advancedSettings?.maxClicks) === 'number' && (link.maxClicks ?? link.advancedSettings?.maxClicks)! > 0 && (
              <span className="text-[10px] bg-cyan-500/15 text-cyan-400 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1 shrink-0 font-sans" title="محدودیت تعداد کلیک">
                <MousePointerClick className="w-2.5 h-2.5" />
                سقف کلیک
              </span>
            )}
            {link.advancedSettings?.scheduling?.enabled && (
              <span className="text-[10px] bg-sky-500/15 text-sky-400 font-bold px-2 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1 shrink-0 font-sans" title="زمان‌بندی ساعات نمایش روزانه">
                <Clock className="w-2.5 h-2.5" />
                زمان‌بندی
              </span>
            )}
            {link.advancedSettings?.buttonAnimation && link.advancedSettings.buttonAnimation !== 'none' && (
              <span className="text-[10px] bg-cyan-500/10 text-cyan-500 font-bold px-2 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1 shrink-0 font-sans">
                <Sparkles className="w-2.5 h-2.5" />
                {link.advancedSettings.buttonAnimation}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Eject / Out of container button if nested */}
          {isNested && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateLink(link.id, { parentId: null });
                toast.success('ماژول از گروه خارج و مستقل شد');
              }}
              className="w-7 h-7 rounded-lg text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors flex items-center justify-center border border-border"
              title="خروج از گروه (تبدیل به ماژول مستقل)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Active Eye Toggle Switch */}
          <button
            type="button"
            onClick={() => updateLink(link.id, { isActive: !link.isActive })}
            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${link.isActive
              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30'
              : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
              }`}
            title={link.isActive ? 'در حال نمایش در کارت (کلیک برای مخفی کردن)' : 'مخفی در کارت (کلیک برای نمایش)'}
          >
            {link.isActive ? (
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>

          {/* Expand / Collapse Button */}
          <button
            type="button"
            onClick={() => toggleExpand(link.id)}
            className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border flex items-center justify-center transition-colors"
            title="باز و بسته کردن تنظیمات ماژول"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => handleRemoveLink(link.id)}
            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center justify-center"
            title="حذف ماژول"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Module-Specific Configuration Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 bg-muted/20 border-t border-border space-y-3">
          {/* Sub-tabs: ONLY for interactive modules */}
          {isInteractive && (
            <div className="flex items-center gap-2 border-b border-border pb-2.5">
              <button
                type="button"
                onClick={() => setActiveSettingsTab((prev) => ({ ...prev, [link.id]: 'content' }))}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors ${currentTab === 'content'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                محتوای ماژول
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab((prev) => ({ ...prev, [link.id]: 'advanced' }))}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${currentTab === 'advanced'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Sparkles className="w-3 h-3" />
                تنظیمات پیشرفته و انیمیشن
              </button>
            </div>
          )}

          {/* Render Body */}
          {isInteractive ? (
            currentTab === 'content' ? (
              <>
                {renderDisplayTitleInput(link)}
                {renderModuleSpecificInputs(link)}
              </>
            ) : (
              renderAdvancedSettings(link)
            )
          ) : (
            <>
              {renderDisplayTitleInput(link)}
              {renderModuleSpecificInputs(link)}
            </>
          )}

          {/* Confirmation Footer */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleCancel(link.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all active:scale-95 border border-border"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              لغو
            </button>

            <button
              type="button"
              onClick={() => handleConfirm(link.id)}
              className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-sm transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              تایید
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionModulesList;
