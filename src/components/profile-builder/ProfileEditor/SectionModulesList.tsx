'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { ProfileLinkItem, LinkModuleType, FAQItem } from '@/types/profile.types';
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
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const SectionModulesList: React.FC = () => {
  const {
    profile,
    updateLink: rawUpdateLink,
    updateLinkMetadata: rawUpdateLinkMetadata,
    updateLinkAdvancedSettings: rawUpdateLinkAdvancedSettings,
    removeLink: rawRemoveLink,
    saveProfileData,
    expandedModuleId,
    setExpandedModuleId,
    unconfirmedModuleId,
    setUnconfirmedModuleId,
  } = useEditorStore();

  const [activeSettingsTab, setActiveSettingsTab] = useState<Record<string, 'content' | 'advanced'>>({});
  const snapshotsRef = React.useRef<Record<string, ProfileLinkItem>>({});

  React.useEffect(() => {
    if (expandedModuleId) {
      const currentLink = profile.links.find((l) => l.id === expandedModuleId);
      if (currentLink && !snapshotsRef.current[expandedModuleId]) {
        snapshotsRef.current[expandedModuleId] = JSON.parse(JSON.stringify(currentLink));
      }
    }
  }, [expandedModuleId, profile.links]);

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
    } else {
      const currentLink = profile.links.find((l) => l.id === id);
      if (currentLink) {
        snapshotsRef.current[id] = JSON.parse(JSON.stringify(currentLink));
      }
      setExpandedModuleId(id);
    }
  };

  const handleConfirm = (id: string) => {
    delete snapshotsRef.current[id];
    setUnconfirmedModuleId(null);
    setExpandedModuleId(null);
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
    toast.success('ماژول حذف شد');
  };

  const isInteractiveModule = (type: LinkModuleType): boolean => {
    return [
      'standard_link',
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
            انتخاب تصویری نوع خط (Line Style)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {lineStyles.map((item) => {
              const isSelected = currentStyle === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateLinkMetadata(link.id, { dividerStyle: item.id as any })}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-500 ring-2 ring-cyan-500/25 font-bold shadow-sm'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  {item.renderLine()}
                  <div className="mt-1">
                    <span className="text-[11px] block">{item.title}</span>
                    <span className="text-[9px] opacity-60 font-outfit block">{item.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1.5">فاصله عمودی خط (Padding)</label>
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
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  currentPadding === p.id
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
          <label className="block text-[11px] font-bold text-foreground mb-1.5">چینش متن (Text Alignment)</label>
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
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
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
              <span className="font-outfit text-xs text-muted-foreground">{style.customBgColor || 'پیش‌فرض'}</span>
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
              <span className="font-outfit text-xs text-muted-foreground">{style.customTextColor || 'پیش‌فرض'}</span>
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
            className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
            dir="ltr"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            پیام‌های ارسالی بازدیدکنندگان علاوه بر بخش سرنخ‌ها (CRM)، به این ایمیل نیز ارسال خواهند شد.
          </p>
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

      case 'spacer_divider':
        return (
          <div className="space-y-3 pt-1">
            <label className="block text-[11px] font-bold text-foreground mb-1.5">ارتفاع فاصله خالی (Vertical Space)</label>
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
                  className={`py-2 px-1 text-center rounded-xl border text-[11px] font-semibold transition-all ${
                    (meta.spacerHeight || 24) === item.val
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
              <label className="block text-[11px] font-medium text-foreground mb-1">متن راهنما درون کادر جستجو (Placeholder)</label>
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
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">چت مستقیم واتساپ (WhatsApp)</span>
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
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: whatsapp://send?phone={(meta.phoneNumber || '').replace(/[^0-9]/g, '')}
              </p>
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
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">تلگرام (Telegram)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه یا لینک تلگرام</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => {
                  let val = e.target.value.trim();
                  if (val.startsWith('@')) val = `https://t.me/${val.substring(1)}`;
                  updateLink(link.id, { url: val });
                }}
                placeholder="https://t.me/channel_name یا @channel"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: tg://resolve?domain={formatDisplayValue(link.url || '')}
              </p>
            </div>
          </div>
        );

      case 'instagram_profile':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-2">
              <InstagramIcon className="w-5 h-5 text-pink-500 shrink-0" />
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400">صفحه اینستاگرام (Instagram)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری اینستاگرام (آیدی)</label>
              <div className="flex items-center bg-background border border-border rounded-xl px-3 focus-within:border-cyan-500">
                <span className="text-muted-foreground text-xs font-outfit">@</span>
                <input
                  type="text"
                  value={meta.username || ''}
                  onChange={(e) => {
                    const cleanUsername = e.target.value.replace(/[@/]/g, '').trim();
                    updateLinkMetadata(link.id, { username: cleanUsername });
                    updateLink(link.id, { url: `https://instagram.com/${cleanUsername}` });
                  }}
                  placeholder="your_username"
                  className="w-full bg-transparent border-0 py-1.5 px-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none font-outfit text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: instagram://user?username={meta.username || 'username'}
              </p>
            </div>
          </div>
        );

      case 'linkedin_profile':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <LinkedInIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">پروفایل لینکدین (LinkedIn)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">آدرس پروفایل یا آیدی لینکدین</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: linkedin://profile/{formatDisplayValue(link.url || '')}
              </p>
            </div>
          </div>
        );

      case 'twitter_x':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/10 border border-border flex items-center gap-2">
              <XTwitterIcon className="w-5 h-5 text-foreground shrink-0" />
              <span className="text-xs font-bold text-foreground">ایکس / توییتر (X)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری ایکس (Twitter Username)</label>
              <div className="flex items-center bg-background border border-border rounded-xl px-3 focus-within:border-cyan-500">
                <span className="text-muted-foreground text-xs font-outfit">@</span>
                <input
                  type="text"
                  value={meta.username || ''}
                  onChange={(e) => {
                    const u = e.target.value.replace(/[@/]/g, '').trim();
                    updateLinkMetadata(link.id, { username: u });
                    updateLink(link.id, { url: getSmartLink('twitter_x', u) });
                  }}
                  placeholder="username"
                  className="w-full bg-transparent border-0 py-1.5 px-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none font-outfit text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: twitter://user?screen_name={meta.username || 'username'}
              </p>
            </div>
          </div>
        );

      case 'pinterest':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <PinterestIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">پینترست (Pinterest)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری پینترست</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const u = e.target.value.replace(/[@/]/g, '').trim();
                  updateLinkMetadata(link.id, { username: u });
                  updateLink(link.id, { url: getSmartLink('pinterest', u) });
                }}
                placeholder="pinterest_username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: pinterest://user/{meta.username || 'username'}
              </p>
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center gap-2">
              <FacebookIcon className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">فیسبوک (Facebook)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه یا نام کاربری فیسبوک</label>
              <input
                type="text"
                value={meta.username || meta.targetId || ''}
                onChange={(e) => {
                  const u = e.target.value.trim();
                  updateLinkMetadata(link.id, { username: u, targetId: u });
                  updateLink(link.id, { url: getSmartLink('facebook', u) });
                }}
                placeholder="profile_id یا username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: fb://profile/{meta.targetId || meta.username || 'ID'} یا https://facebook.com/{meta.username || 'username'}
              </p>
            </div>
          </div>
        );

      case 'dribbble':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center gap-2">
              <DribbbleIcon className="w-5 h-5 text-pink-500 shrink-0" />
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400">دریبل (Dribbble)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری دریبل</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const u = e.target.value.replace(/[@/]/g, '').trim();
                  updateLinkMetadata(link.id, { username: u });
                  updateLink(link.id, { url: getSmartLink('dribbble', u) });
                }}
                placeholder="designer_username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'behance':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <BehanceIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">بیهنس (Behance)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری بیهنس</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const u = e.target.value.replace(/[@/]/g, '').trim();
                  updateLinkMetadata(link.id, { username: u });
                  updateLink(link.id, { url: getSmartLink('behance', u) });
                }}
                placeholder="portfolio_username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'youtube_channel':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center gap-2">
              <YouTubeIcon className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400">کانال یوتیوب (YouTube Channel)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">هندل یا نام کانال یوتیوب</label>
              <div className="flex items-center bg-background border border-border rounded-xl px-3 focus-within:border-cyan-500">
                <span className="text-muted-foreground text-xs font-outfit">@</span>
                <input
                  type="text"
                  value={meta.username || ''}
                  onChange={(e) => {
                    const u = e.target.value.replace(/[@/]/g, '').trim();
                    updateLinkMetadata(link.id, { username: u });
                    updateLink(link.id, { url: getSmartLink('youtube_channel', u) });
                  }}
                  placeholder="channelHandle"
                  className="w-full bg-transparent border-0 py-1.5 px-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none font-outfit text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: vnd.youtube://www.youtube.com/@{meta.username || 'channel'}
              </p>
            </div>
          </div>
        );

      case 'clubhouse':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <ClubhouseIcon className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">کلاب‌هاوس (Clubhouse)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری کلاب‌هاوس</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const u = e.target.value.replace(/[@/]/g, '').trim();
                  updateLinkMetadata(link.id, { username: u });
                  updateLink(link.id, { url: getSmartLink('clubhouse', u) });
                }}
                placeholder="clubhouse_username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: clubhouse://user/{meta.username || 'username'}
              </p>
            </div>
          </div>
        );

      case 'patreon':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <PatreonIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">پاترئون (Patreon)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه یا نام کاربری پاترئون</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const u = e.target.value.replace(/[@/]/g, '').trim();
                  updateLinkMetadata(link.id, { username: u });
                  updateLink(link.id, { url: getSmartLink('patreon', u) });
                }}
                placeholder="creator_handle"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'twitch':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
              <TwitchIcon className="w-5 h-5 text-purple-500 shrink-0" />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">توییچ استریم (Twitch)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کانال توییچ</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const u = e.target.value.replace(/[@/]/g, '').trim();
                  updateLinkMetadata(link.id, { username: u });
                  updateLink(link.id, { url: getSmartLink('twitch', u) });
                }}
                placeholder="streamer_name"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: twitch://stream/{meta.username || 'username'}
              </p>
            </div>
          </div>
        );

      case 'github':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/10 border border-border flex items-center gap-2">
              <GitHubIcon className="w-5 h-5 text-foreground shrink-0" />
              <span className="text-xs font-bold text-foreground">گیت‌هاب (GitHub)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری یا سازمان گیت‌هاب</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const u = e.target.value.replace(/[@/]/g, '').trim();
                  updateLinkMetadata(link.id, { username: u });
                  updateLink(link.id, { url: getSmartLink('github', u) });
                }}
                placeholder="developer_username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'aparat_channel':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <AparatIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">کانال آپارات (Aparat)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری کانال آپارات</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const u = e.target.value.replace(/[@/]/g, '').trim();
                  updateLinkMetadata(link.id, { username: u });
                  updateLink(link.id, { url: getSmartLink('aparat_channel', u) });
                }}
                placeholder="channel_id"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'tiktok':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900/10 dark:bg-white/10 border border-border flex items-center gap-2">
              <TikTokIcon className="w-5 h-5 text-foreground shrink-0" />
              <span className="text-xs font-bold text-foreground">تیک‌تاک (TikTok)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری تیک‌تاک</label>
              <div className="flex items-center bg-background border border-border rounded-xl px-3 focus-within:border-cyan-500">
                <span className="text-muted-foreground text-xs font-outfit">@</span>
                <input
                  type="text"
                  value={meta.username || ''}
                  onChange={(e) => {
                    const u = e.target.value.replace(/[@/]/g, '').trim();
                    updateLinkMetadata(link.id, { username: u });
                    updateLink(link.id, { url: getSmartLink('tiktok', u) });
                  }}
                  placeholder="tiktok_handle"
                  className="w-full bg-transparent border-0 py-1.5 px-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none font-outfit text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: snssdk1233://user/profile/{meta.username || 'username'}
              </p>
            </div>
          </div>
        );

      // AUDIO & PODCAST PLATFORMS
      case 'apple_music':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
              <AppleMusicIcon className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">آیتونز / اپل موزیک (Apple Music)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک هنرمند یا آلبوم در Apple Music</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://music.apple.com/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
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
              <span className="text-xs font-bold text-red-600 dark:text-red-400">یوتیوب موزیک (YouTube Music)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک یا شناسه در YouTube Music</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://music.youtube.com/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
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
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">کست‌باکس (Castbox)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه یا لینک کانال پادکست کست‌باکس</label>
              <input
                type="text"
                value={meta.targetId || link.url || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { targetId: val });
                  updateLink(link.id, { url: getSmartLink('castbox', val) });
                }}
                placeholder="https://castbox.fm/ch/12345 یا شناسه عددی"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
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
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">رادیو جوان (Radio Javan)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه یا آیدی پادکست رادیو جوان</label>
              <input
                type="text"
                value={meta.targetId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { targetId: val });
                  updateLink(link.id, { url: getSmartLink('radio_javan', val) });
                }}
                placeholder="podcast-id"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: rj://podcast/{meta.targetId || 'ID'}
              </p>
            </div>
          </div>
        );

      case 'spotify_podcaster':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
              <SpotifyIcon className="w-5 h-5 text-purple-500 shrink-0" />
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">اسپاتیفای پادکستر (Anchor)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک پادکست در Spotify for Podcasters</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://podcasters.spotify.com/pod/show/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
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
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">اسپاتیفای (Spotify)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه یا لینک هنرمند / کاربر در Spotify</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="spotify:artist:[ID] یا https://open.spotify.com/..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: spotify:artist:[ID] یا spotify:user:[ID]
              </p>
            </div>
          </div>
        );

      case 'soundcloud':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
              <SoundCloudIcon className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">ساوندکلاود (SoundCloud)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه یا نام کاربری ساوندکلاود</label>
              <input
                type="text"
                value={meta.username || meta.targetId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { username: val, targetId: val });
                  updateLink(link.id, { url: getSmartLink('soundcloud', val) });
                }}
                placeholder="username یا user_id"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: soundcloud://users/[ID] یا https://soundcloud.com/[username]
              </p>
            </div>
          </div>
        );

      // DIRECT MESSENGERS
      case 'skype':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-2">
              <SkypeIcon className="w-5 h-5 text-sky-500 shrink-0" />
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">اسکایپ (Skype)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">نام کاربری یا شناسه اسکایپ (Skype Handle)</label>
              <input
                type="text"
                value={meta.username || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { username: val });
                  updateLink(link.id, { url: `skype:${val}?chat` });
                }}
                placeholder="live:username"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: skype:{meta.username || 'username'}?chat
              </p>
            </div>
          </div>
        );

      case 'wechat':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <WeChatIcon className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-xs font-bold text-green-600 dark:text-green-400">ویچت (WeChat)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه کاربری ویچت (WeChat ID)</label>
              <input
                type="text"
                value={meta.targetId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { targetId: val });
                  updateLink(link.id, { url: `weixin://dl/chat?${val}` });
                }}
                placeholder="wechat_id"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: weixin://dl/chat?{meta.targetId || 'ID'}
              </p>
            </div>
          </div>
        );

      case 'messenger':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <MessengerIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">مسنجر فیسبوک (Messenger)</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">شناسه یا نام کاربری مسنجر</label>
              <input
                type="text"
                value={meta.targetId || meta.username || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  updateLinkMetadata(link.id, { targetId: val, username: val });
                  updateLink(link.id, { url: getSmartLink('messenger', val) });
                }}
                placeholder="username یا user_id"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: fb-messenger://user-thread/{meta.targetId || 'ID'} یا https://m.me/{meta.targetId || 'username'}
              </p>
            </div>
          </div>
        );

      case 'signal':
        return (
          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <SignalIcon className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">سیگنال (Signal)</span>
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
              <p className="text-[10px] text-muted-foreground mt-1 font-outfit" dir="ltr">
                دیپ‌لینک: sgnl://signal.me/#p/{(meta.phoneNumber || '').replace(/[^0-9]/g, '')}
              </p>
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
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">واحد پول</label>
                <select
                  value={meta.productCurrency || 'AFN'}
                  onChange={(e) => updateLinkMetadata(link.id, { productCurrency: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-outfit"
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
                description="عکس باکیفیت محصول یا خدمات (حداکثر ۲ مگابایت)"
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
                placeholder="https://wa.me/93... یا آدرس سایت"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
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
                placeholder="مثال: رزرو وقت مشاوره ۱ ساعته"
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
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">واحد پول</label>
                <select
                  value={meta.paymentCurrency || 'AFN'}
                  onChange={(e) => updateLinkMetadata(link.id, { paymentCurrency: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-outfit"
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
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

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
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      (meta.meetingPlatform || 'google_meet') === item.id
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
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
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
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک نقشه گوگل (Google Maps)</label>
              <input
                type="url"
                value={meta.googleMapsLink || link.url || ''}
                onChange={(e) => {
                  updateLinkMetadata(link.id, { googleMapsLink: e.target.value });
                  updateLink(link.id, { url: e.target.value });
                }}
                placeholder="https://maps.google.com/?q=..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک ویز (Waze - اختیاری)</label>
              <input
                type="url"
                value={meta.wazeLink || ''}
                onChange={(e) => updateLinkMetadata(link.id, { wazeLink: e.target.value })}
                placeholder="https://waze.com/ul?..."
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

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
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
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
              description="فرمت PDF، حداکثر ۵ مگابایت"
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
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک یا شناسه ویدیو یوتیوب</label>
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
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
            </div>
          </div>
        );

      case 'aparat_embed':
        return (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک یا شناسه ویدیو آپارات</label>
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
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
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
              description="حداکثر ۲ مگابایت"
              maxSizeMB={2}
            />
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">لینک بازگشایی با کلیک روی عکس (اختیاری)</label>
              <input
                type="url"
                value={meta.singleImageLink || ''}
                onChange={(e) => updateLinkMetadata(link.id, { singleImageLink: e.target.value })}
                placeholder="https://example.com"
                className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
                dir="ltr"
              />
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
                  className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-outfit text-left"
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

  // 5. ADVANCED SETTINGS (ONLY for Interactive Modules: Links, Social, Products, Video, Maps)
  const renderAdvancedSettings = (link: ProfileLinkItem) => {
    const adv = link.advancedSettings || {};
    const sched = adv.scheduling || { enabled: false, days: [0, 1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '20:00' };
    const lock = adv.monetization || { isLocked: false, price: 50, currency: 'AFN', unlockNote: '' };
    const style = adv.customStyling || {};

    return (
      <div className="space-y-4 pt-1">
        {/* 1. BUTTON ANIMATION (Visual Cards) */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            انیمیشن جلب توجه دکمه (Button Animation)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'none',
                label: 'بدون انیمیشن',
                sub: 'ثابت',
                renderPreview: () => <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />,
              },
              {
                id: 'pulse',
                label: 'نبض ملایم',
                sub: 'Pulse',
                renderPreview: () => <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-sm shadow-cyan-500" />,
              },
              {
                id: 'bounce',
                label: 'پرش مداوم',
                sub: 'Bounce',
                renderPreview: () => <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" />,
              },
              {
                id: 'shake',
                label: 'لرزش هوشمند',
                sub: 'Shake',
                renderPreview: () => <span className="w-3 h-3 rounded bg-rose-500 animate-shake inline-block" />,
              },
              {
                id: 'glow',
                label: 'درخشش نئونی',
                sub: 'Glow',
                renderPreview: () => (
                  <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.8)] ring-1 ring-cyan-300" />
                ),
              },
            ].map((anim) => {
              const isSelected = (adv.buttonAnimation || 'none') === anim.id;
              return (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => updateLinkAdvancedSettings(link.id, { buttonAnimation: anim.id as any })}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-500 ring-2 ring-cyan-500/20 font-bold shadow-sm'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  <div className="h-5 flex items-center justify-center">{anim.renderPreview()}</div>
                  <span className="text-xs font-semibold block">{anim.label}</span>
                  <span className="text-[9px] opacity-65 block font-outfit" dir="ltr">{anim.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. OPEN IN NEW TAB SWITCH */}
        <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground block">باز شدن در پنجره جدید (Open in new tab)</span>
            <span className="text-[10px] text-muted-foreground block">هنگام کلیک، این لینک در یک صفحه مجزا باز شود</span>
          </div>
          <Switch
            checked={adv.openInNewTab !== false}
            onCheckedChange={(checked) => updateLinkAdvancedSettings(link.id, { openInNewTab: checked })}
          />
        </div>

        {/* 3. SCHEDULING */}
        <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-foreground">زمان‌بندی هوشمند نمایش دکمه</span>
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
            <div className="space-y-3 pt-2 border-t border-border animate-in fade-in">
              <p className="text-[11px] text-muted-foreground">
                این دکمه فقط در ساعات تعیین‌شده در طول روز به بازدیدکنندگان نمایش داده می‌شود:
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
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-outfit"
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
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-outfit"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. MONETIZATION / LOCKED LINK */}
        <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-foreground">لینک قفل‌شده / محتوای پولی (Locked Link)</span>
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
            <div className="space-y-3 pt-2 border-t border-border animate-in fade-in">
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
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-outfit text-left"
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
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground font-outfit"
                  >
                    <option value="AFN">AFN (افغانی)</option>
                    <option value="USD">USD (دلار)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. CUSTOM STYLING (COLORS) */}
        <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
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
                <span className="font-outfit text-xs text-muted-foreground">{style.customBgColor || 'پیش‌فرض'}</span>
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
                <span className="font-outfit text-xs text-muted-foreground">{style.customTextColor || 'پیش‌فرض'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. BUTTON CORNER RADIUS (Visual Cards) */}
        <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
          <label className="block text-xs font-bold text-foreground">
            شکل و انحنای گوشه‌ها (Border Radius)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'rounded-none', label: 'مربع تیز', sub: 'Sharp', radiusStyle: '0px' },
              { id: 'rounded-md', label: 'لبه‌گرد ملایم', sub: 'Soft', radiusStyle: '8px' },
              { id: 'rounded-full', label: 'کاملاً گرد', sub: 'Pill', radiusStyle: '9999px' },
            ].map((r) => {
              const isSelected = (style.borderRadius || 'rounded-md') === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() =>
                    updateLinkAdvancedSettings(link.id, {
                      customStyling: { ...style, borderRadius: r.id },
                    })
                  }
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-500 ring-2 ring-cyan-500/20 font-bold shadow-sm'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  <div
                    className="w-8 h-4 border-2 border-current bg-foreground/5 flex items-center justify-center transition-all"
                    style={{ borderRadius: r.radiusStyle }}
                  />
                  <span className="text-[11px] font-semibold block">{r.label}</span>
                  <span className="text-[9px] opacity-65 block font-outfit" dir="ltr">{r.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (profile.links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {profile.links.map((link) => {
        const isExpanded = expandedModuleId === link.id;
        const isUnconfirmed = unconfirmedModuleId === link.id;
        const currentTab = activeSettingsTab[link.id] || 'content';
        const isInteractive = isInteractiveModule(link.moduleType);

        return (
          <div
            key={link.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isExpanded
                ? 'bg-card border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                : 'bg-card/75 border-border hover:border-border/80'
            }`}
          >
            {/* Header / Summary Bar (Clicking expands the card) */}
            <div
              onClick={() => toggleExpand(link.id)}
              className="p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Drag Grip Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground transition-colors p-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  title="جابه‌جایی ماژول"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Module Icon */}
                <div className="w-8 h-8 rounded-xl bg-muted/80 border border-border flex items-center justify-center shrink-0">
                  {getModuleIcon(link.moduleType)}
                </div>

                {/* Module Title */}
                <div className="flex-1 min-w-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {link.moduleType === 'divider_heading' ? (
                    <span className="text-xs font-bold text-foreground">خط جداکننده</span>
                  ) : link.moduleType === 'spacer_divider' ? (
                    <span className="text-xs font-bold text-foreground">فاصله خالی</span>
                  ) : (
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => updateLink(link.id, { title: e.target.value })}
                      className="bg-transparent border-0 text-xs font-bold text-foreground focus:outline-none focus:ring-0 p-0 font-sans w-full truncate"
                      placeholder="عنوان ماژول..."
                    />
                  )}
                  {isUnconfirmed && (
                    <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                      تاییدنشده
                    </span>
                  )}
                  {link.advancedSettings?.monetization?.isLocked && (
                    <span className="text-[10px] bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 shrink-0 font-outfit">
                      <Lock className="w-2.5 h-2.5" />
                      پولی
                    </span>
                  )}
                  {link.advancedSettings?.buttonAnimation && link.advancedSettings.buttonAnimation !== 'none' && (
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-500 font-bold px-2 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1 shrink-0 font-outfit">
                      <Sparkles className="w-2.5 h-2.5" />
                      {link.advancedSettings.buttonAnimation}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Active Eye Toggle Switch */}
                <button
                  type="button"
                  onClick={() => updateLink(link.id, { isActive: !link.isActive })}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    link.isActive
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
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors ${
                        currentTab === 'content'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      محتوای ماژول
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSettingsTab((prev) => ({ ...prev, [link.id]: 'advanced' }))}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                        currentTab === 'advanced'
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
                    renderModuleSpecificInputs(link)
                  ) : (
                    renderAdvancedSettings(link)
                  )
                ) : (
                  renderModuleSpecificInputs(link)
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
      })}
    </div>
  );
};

export default SectionModulesList;
