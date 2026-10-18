'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileLinkItem, LinkModuleType, ProfileThemeConfig } from '@/types/profile.types';
import { WhatsAppIcon } from '@/components/icons';
import { getSmartLink } from '@/lib/smart-link';
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
      `URL;TYPE=WORK:https://aryalink.af/${profile.alias}`,
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
    const fullUrl = `https://aryalink.af/${profile.alias}`;
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

  // 5. Render Social Icon
  const renderSocialIcon = (link: ProfileLinkItem) => {
    const rawVal =
      link.url ||
      (link.metadata?.phoneNumber as string) ||
      (link.metadata?.channelUsername as string) ||
      (link.metadata?.instagramUsername as string) ||
      (link.metadata?.linkedinUsername as string) ||
      '';
    const smartUrl = getSmartLink(link.moduleType, rawVal);
    const cardRadius = getBorderRadiusClass(link.advancedSettings?.customStyling?.borderRadius);
    const animClass = getButtonAnimationClass(link.advancedSettings?.buttonAnimation);

    switch (link.moduleType) {
      case 'whatsapp_direct':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title}
            className={`w-12 h-12 ${cardRadius} ${animClass} bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
          >
            <WhatsAppIcon className="w-6 h-6 fill-current" />
          </a>
        );
      case 'telegram_channel':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title}
            className={`w-12 h-12 ${cardRadius} ${animClass} bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
          >
            <Send className="w-6 h-6" />
          </a>
        );
      case 'instagram_profile':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title}
            className={`w-12 h-12 ${cardRadius} ${animClass} bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
          >
            <Instagram className="w-6 h-6" />
          </a>
        );
      case 'linkedin_profile':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title}
            className={`w-12 h-12 ${cardRadius} ${animClass} bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
          >
            <Linkedin className="w-6 h-6" />
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
            isLight ? 'bg-white/95 border-slate-200 text-slate-800' : `${themeConfig.cardBlur} text-white`
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
        <div key={link.id} className="relative mb-1">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="جستجو در بین خدمات و لینک‌ها..."
            className={`w-full rounded-2xl pr-9 pl-3 py-2.5 text-xs border focus:outline-none ${isLight
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
        <div key={link.id} className="w-full rounded-2xl overflow-hidden border border-border shadow-md bg-black">
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
            <div className={`p-2.5 text-center text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {link.title}
            </div>
          )}
        </div>
      );
    }

    // 4. Aparat Embed
    if (link.moduleType === 'aparat_embed' && meta.aparatHash) {
      return (
        <div key={link.id} className="w-full rounded-2xl overflow-hidden border border-border shadow-md bg-black">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.aparat.com/video/video/embed/videohash/${meta.aparatHash}/vt/frame`}
              title={link.title}
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          {link.title && (
            <div className={`p-2.5 text-center text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
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
          className={`w-full p-3.5 border shadow-sm flex items-center justify-between gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className={`w-10 h-10 ${cardRadius} bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block truncate">
              {meta.pdfDescription || 'مشاهده و دانلود فایل کاتالوگ PDF'}
            </span>
          </div>
          <Download className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>
      );
    }

    // 6. Contact Form Module (فرم تماس پویا با قابلیت ارسال به CRM)
    if (link.moduleType === 'contact_form' || link.moduleType === 'lead_capture_form') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-4 border shadow-md space-y-3.5 text-right ${cardRadius} ${isLight ? 'bg-white/95 border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <Mail className="w-4 h-4 text-amber-500" />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {meta.leadHeadline || link.title || 'ارسال پیام و فرم تماس'}
            </span>
          </div>

          {formSubmitted ? (
            <div className="py-6 text-center space-y-2 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                پیام شما با موفقیت ثبت شد
              </h4>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                اطلاعات شما با موفقیت به صاحب این کارت هوشمند تحویل داده شد و در اسرع وقت با شما تماس خواهند گرفت.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormMessage('');
                }}
                className="text-[11px] font-semibold text-cyan-500 hover:underline pt-2 inline-block"
              >
                ارسال پیام جدید
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactFormSubmit} className="space-y-2.5 text-right font-sans">
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  نام و نام خانوادگی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: علی احمدی"
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-cyan-500 ${isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  شماره تماس <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0700 000 000"
                  dir="ltr"
                  className={`w-full rounded-xl px-3 py-2 text-xs font-outfit text-left border focus:outline-none focus:border-cyan-500 ${isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  ایمیل (اختیاری)
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className={`w-full rounded-xl px-3 py-2 text-xs font-outfit text-left border focus:outline-none focus:border-cyan-500 ${isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  متن پیام یا درخواست <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="پیام یا شرح درخواست همکاری خود را اینجا بنویسید..."
                  className={`w-full rounded-xl px-3 py-2 text-xs resize-none border focus:outline-none focus:border-cyan-500 font-sans ${isLight
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

    // 7. FAQ Accordion
    if (link.moduleType === 'faq_accordion' && meta.faqItems?.length) {
      return (
        <div key={link.id} className="space-y-2 text-right">
          {link.title && (
            <span className={`text-xs font-bold block px-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {link.title}
            </span>
          )}
          {meta.faqItems.map((item: any, idx: number) => {
            const isOpen = openFaqId === `${link.id}-${idx}`;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-colors overflow-hidden ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : `${link.id}-${idx}`)}
                  className="w-full p-3.5 text-right flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer"
                >
                  <span className={isLight ? 'text-slate-900' : 'text-white'}>{item.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 text-[11px] leading-relaxed border-t border-border/40 opacity-80 font-sans">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // 8. Location & Working Hours
    if (link.moduleType === 'location_hours') {
      return (
        <div
          key={link.id}
          className={`w-full p-4 rounded-2xl border shadow-sm space-y-2.5 text-right ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
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
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">{meta.address}</p>
          )}
          {meta.workingHours && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/40 font-sans">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>{meta.workingHours}</span>
            </div>
          )}
        </div>
      );
    }

    // 8.5. Phone Call Module
    if (link.moduleType === 'phone_call') {
      const phoneVal = link.metadata?.phoneNumber || link.url || '';
      const smartHref = getSmartLink('phone_call', phoneVal);
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <a
          key={link.id}
          href={smartHref}
          className={`w-full p-3.5 font-bold text-xs flex items-center justify-between gap-3 shadow-md border transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${cardRadius} ${getButtonAnimationClass(adv.buttonAnimation)}`}
          style={{
            background: isLight
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            borderColor: 'rgba(255,255,255,0.2)',
            ...customCardStyle,
          }}
        >
          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 shrink-0 text-white" />
            <span className="truncate">{link.title || 'تماس تلفنی مستقیم'}</span>
          </div>
          <Phone className="w-3.5 h-3.5 opacity-80" />
        </a>
      );
    }

    // 8.6. Email Direct Module
    if (link.moduleType === 'email_direct') {
      const emailVal = link.metadata?.email || link.url || '';
      const smartHref = getSmartLink('email_direct', emailVal);
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <a
          key={link.id}
          href={smartHref}
          className={`w-full p-3.5 font-bold text-xs flex items-center justify-between gap-3 shadow-md border transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${cardRadius} ${getButtonAnimationClass(adv.buttonAnimation)}`}
          style={{
            background: isLight
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            color: '#ffffff',
            borderColor: 'rgba(255,255,255,0.2)',
            ...customCardStyle,
          }}
        >
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 shrink-0 text-white" />
            <span className="truncate">{link.title || 'ارسال ایمیل مستقیم'}</span>
          </div>
          <Mail className="w-3.5 h-3.5 opacity-80" />
        </a>
      );
    }

    // 8.7 Product Card (محصول و فروشگاه)
    if (link.moduleType === 'product_card') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-3.5 border shadow-md flex items-center justify-between gap-3 text-right ${cardRadius} ${
            isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
          }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {meta.productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.productImage}
                alt={meta.productTitle || link.title}
                className={`w-14 h-14 object-cover shrink-0 border border-border shadow-sm ${cardRadius}`}
              />
            ) : (
              <div className={`w-14 h-14 bg-teal-500/20 text-teal-500 flex items-center justify-center shrink-0 border border-teal-500/30 ${cardRadius}`}>
                <ShoppingBag className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {meta.productTitle || link.title}
              </span>
              <span className="text-xs font-outfit font-bold text-cyan-600 dark:text-cyan-400 mt-1 block">
                {meta.productPrice ? Number(meta.productPrice).toLocaleString() : '۰'} {meta.productCurrency || 'AFN'}
              </span>
            </div>
          </div>

          <a
            href={meta.productBuyUrl || link.url || '#'}
            target={adv.openInNewTab !== false ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className={`px-3.5 py-2 ${cardRadius} bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shrink-0 shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${getButtonAnimationClass(adv.buttonAnimation)}`}
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
          className={`${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur} ${cardRadius}`}
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
        className={`w-full p-3.5 font-bold text-xs flex items-center justify-between gap-3 shadow-md border transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer group ${cardRadius} ${getButtonAnimationClass(adv.buttonAnimation)}`}
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
          <ChevronRight className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
        ) : (
          <ChevronLeft className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
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
    <div className={`min-h-screen w-full flex flex-col justify-between relative selection:bg-cyan-500 selection:text-white ${getThemeBackground()}`} dir={isLtr ? 'ltr' : 'rtl'}>
      {/* Background Ambience Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Center Container (Mobile width natural, centered on desktop) */}
      <div className="w-full max-w-[460px] mx-auto min-h-screen flex flex-col justify-between relative shadow-2xl overflow-hidden border-x border-white/5 backdrop-blur-xs">
        {/* Top Floating Action: Share Button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-90 shadow-lg cursor-pointer"
            title="اشتراک‌گذاری کارت"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div>
          {/* HEADER LAYOUT 1: CURVE */}
          {(profile.headerLayout === 'curve' || !profile.headerLayout) && (
            <div className="relative w-full mb-4 shrink-0">
              <div
                className="w-full h-44 overflow-hidden relative shadow-inner bg-slate-900"
                style={{ clipPath: 'ellipse(85% 100% at 50% 0%)' }}
              >
                {profile.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(135deg, ${themeConfig.primaryColor || '#0ea5e9'}, ${themeConfig.accentColor || '#06b6d4'})`,
                    }}
                  />
                )}
              </div>

              {/* Overlapping Avatar */}
              <div className="relative -mt-14 flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/80 dark:border-slate-800 shadow-2xl relative bg-slate-800">
                    {profile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                        {profile.displayName?.trim().charAt(0) || <User className="w-10 h-10 text-white" />}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Name, Headline, Bio */}
              <div className="px-5 text-center mt-3">
                <h1 className={`text-lg font-bold tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                  <span>{profile.displayName}</span>
                  {isVerifiedApproved && (
                    <BadgeCheck className="w-5 h-5 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                  )}
                </h1>
                {profile.headline && (
                  <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>
                    {profile.headline}
                  </p>
                )}
                {profile.bio && (
                  <p className={`text-xs mt-2 leading-relaxed max-w-xs mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300/85'
                    }`}>
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* HEADER LAYOUT 2: GRADIENT MASK */}
          {profile.headerLayout === 'gradient_mask' && (
            <div className="relative w-full mb-4 shrink-0">
              <div className="relative w-full h-44 overflow-hidden shrink-0 [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
                {profile.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(135deg, ${themeConfig.primaryColor || '#0ea5e9'}, ${themeConfig.accentColor || '#06b6d4'})`,
                    }}
                  />
                )}
              </div>

              {/* Squircle Avatar Beside Info */}
              <div className={`relative -mt-12 px-5 flex items-center gap-4 z-10 ${isLtr ? 'text-left' : 'text-right'}`}>
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-3 border-white dark:border-slate-800 shadow-xl bg-slate-800">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                      {profile.displayName?.trim().charAt(0) || <User className="w-6 h-6 text-white" />}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className={`text-base font-bold tracking-tight truncate flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                    <span className="truncate">{profile.displayName}</span>
                    {isVerifiedApproved && (
                      <BadgeCheck className="w-4 h-4 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                    )}
                  </h1>
                  {profile.headline && (
                    <p className={`text-xs font-semibold truncate mt-0.5 ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>
                      {profile.headline}
                    </p>
                  )}
                  {profile.bio && (
                    <p className={`text-[11px] line-clamp-2 mt-1 leading-snug ${isLight ? 'text-slate-600' : 'text-slate-300/85'}`}>
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* HEADER LAYOUT 3: MINIMAL */}
          {profile.headerLayout === 'minimal' && (
            <div className="pt-10 pb-4 px-5 flex flex-col items-center text-center shrink-0">
              <div className="relative mb-3.5">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/80 dark:border-slate-800 shadow-2xl relative bg-slate-800">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-tr from-cyan-600 to-blue-600">
                      {profile.displayName?.trim().charAt(0) || <User className="w-10 h-10 text-white" />}
                    </div>
                  )}
                </div>
              </div>

              <h1 className={`text-lg font-bold tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'
                }`}>
                <span>{profile.displayName}</span>
                {isVerifiedApproved && (
                  <BadgeCheck className="w-5 h-5 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                )}
              </h1>
              {profile.headline && (
                <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-blue-600' : 'text-cyan-300'}`}>
                  {profile.headline}
                </p>
              )}
              {profile.bio && (
                <p className={`text-xs mt-2 leading-relaxed max-w-xs ${isLight ? 'text-slate-600' : 'text-slate-300/85'}`}>
                  {profile.bio}
                </p>
              )}
            </div>
          )}

          {/* Micro Action Buttons (Phone, WhatsApp, Email) */}
          <div className="px-5">
            <div className="flex items-center justify-center gap-3 mb-4">
              {profile.phone && (
                <a
                  href={getSmartLink('phone', profile.phone)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs shadow-md transition-all active:scale-95 ${isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md text-white'
                    }`}
                  title="تماس مستقیم"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              {profile.whatsapp && (
                <a
                  href={getSmartLink('whatsapp', profile.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-600 dark:text-emerald-300 text-xs shadow-md transition-all active:scale-95"
                  title="ارسال پیام در واتساپ"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-emerald-600 dark:fill-emerald-300" />
                </a>
              )}
              {profile.email && (
                <a
                  href={getSmartLink('email', profile.email)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs shadow-md transition-all active:scale-95 ${isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md text-white'
                    }`}
                  title="ارسال ایمیل"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Primary Action Button: Save Contact (vCard) */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadVCard}
              className="w-full mb-4 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl border border-white/30 backdrop-blur-xl transition-all cursor-pointer"
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

            {/* SOCIAL NETWORKS ICON MATRIX */}
            {socialLinks.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-center flex-wrap gap-3 p-3 rounded-2xl bg-black/15 dark:bg-white/5 border border-white/10 backdrop-blur-md">
                  {socialLinks.map((link) => renderSocialIcon(link))}
                </div>
              </div>
            )}

            {/* ACTIVE MODULES LIST */}
            <div className="space-y-3 pb-8">
              {filteredNonSocialLinks.map((link) => renderModuleCard(link))}

              {profile.links.filter((l) => l.isActive).length === 0 && (
                <div
                  className={`p-8 text-center text-xs border border-dashed rounded-2xl ${isLight ? 'text-slate-400 border-slate-300' : 'text-white/50 border-white/20'
                    }`}
                >
                  {isLtr
                    ? 'No active modules to display'
                    : isPashto
                      ? 'د ښودلو لپاره هیڅ فعال ماډل نشته'
                      : 'هیچ ماژولی برای نمایش وجود ندارد'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER WATERMARK BRANDING */}
        {!profile.hideBranding && (
          <div className="pt-6 pb-8 text-center select-none shrink-0">
            <a
              href="https://aryalink.af"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[11px] tracking-wider font-semibold inline-flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity ${isLight ? 'text-slate-600' : 'text-white/50'
                }`}
            >
              <span>{isLtr ? 'Powered by ⚡' : isPashto ? 'جوړ شوی لخوا ⚡' : 'طراحی شده با ⚡'}</span>
              <span className="text-cyan-500 dark:text-cyan-400 font-bold font-outfit">Arya Link</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
