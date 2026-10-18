'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editor-store';
import { LinkModuleType, ProfileLinkItem } from '@/types/profile.types';
import { WhatsAppIcon } from '@/components/icons';
import { getSmartLink } from '@/lib/smart-link';
import { LiveCountdown } from '@/components/ui/live-countdown';
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
  Navigation,
  Search,
  ExternalLink,
  Play,
  HelpCircle,
  Video,
  DollarSign,
  Layers,
  Sliders,
} from 'lucide-react';

export const LivePreview: React.FC = () => {
  const { profile, selectedDeviceId, setDevice } = useEditorStore();
  const { themeConfig } = profile;

  const isLight = themeConfig.preset === 'minimal_light';
  const isLtr = profile.profileLanguage === 'en';
  const isPashto = profile.profileLanguage === 'pashto';
  const isVerifiedApproved = Boolean(profile.isVerified && profile.verificationStatus === 'verified');
  const [searchFilter, setSearchFilter] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

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
  ];

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

  const socialLinks = profile.links.filter(
    (l) => l.isActive && !l.advancedSettings?.isHidden && socialModuleTypes.includes(l.moduleType)
  );

  const nonSocialLinks = profile.links.filter(
    (l) => l.isActive && !l.advancedSettings?.isHidden && !socialModuleTypes.includes(l.moduleType)
  );

  const filteredNonSocialLinks = nonSocialLinks.filter((l) => {
    return searchFilter ? l.title.toLowerCase().includes(searchFilter.toLowerCase()) : true;
  });

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
            rel="noreferrer"
            title={link.title}
            className={`w-11 h-11 ${cardRadius} ${animClass} bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
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
            rel="noreferrer"
            title={link.title}
            className={`w-11 h-11 ${cardRadius} ${animClass} bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
          >
            <Send className="w-5 h-5" />
          </a>
        );
      case 'instagram_profile':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noreferrer"
            title={link.title}
            className={`w-11 h-11 ${cardRadius} ${animClass} bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
          >
            <Instagram className="w-5 h-5" />
          </a>
        );
      case 'linkedin_profile':
        return (
          <a
            key={link.id}
            href={smartUrl}
            target="_blank"
            rel="noreferrer"
            title={link.title}
            className={`w-11 h-11 ${cardRadius} ${animClass} bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm`}
          >
            <Linkedin className="w-5 h-5" />
          </a>
        );
      default:
        return null;
    }
  };

  const renderModuleCard = (link: ProfileLinkItem) => {
    const meta = link.metadata || {};
    const adv = link.advancedSettings || {};
    const lock = adv.monetization;
    const customStyle = adv.customStyling;

    // Custom overrides if defined
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
          className={`w-full p-3.5 border shadow-sm ${alignClass} ${getBorderRadiusClass(customStyle?.borderRadius)} ${
            isLight ? 'bg-white/95 border-slate-200 text-slate-800' : `${themeConfig.cardBlur} text-white`
          }`}
          style={customCardStyle}
        >
          {link.title && <h3 className="text-xs font-bold mb-1 opacity-90">{link.title}</h3>}
          <p className="text-[11px] leading-relaxed opacity-85 whitespace-pre-wrap font-sans">
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
                <span>ویدیو آپارات (در انتظار تنظیم شناسه)</span>
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
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-outfit">
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
              <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {meta.productTitle || link.title}
              </span>
              <span className="text-xs font-outfit font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 block">
                {meta.productPrice?.toLocaleString() || '۰'} {meta.productCurrency || 'AFN'}
              </span>
            </div>
          </div>

          <a
            href={meta.productBuyUrl || link.url || '#'}
            target={adv.openInNewTab !== false ? '_blank' : '_self'}
            rel="noreferrer"
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
              <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {meta.checkoutItemName || link.title}
              </span>
              <span className="text-xs font-outfit font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {meta.checkoutAmount?.toLocaleString() || '۵۰۰'} {meta.paymentCurrency || 'AFN'}
              </span>
            </div>
          </div>
          <a
            href={link.url || '#'}
            target="_blank"
            rel="noreferrer"
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
              {meta.leadHeadline || link.title || 'فرم تماس'}
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
              <input
                type="tel"
                placeholder="0700 000 000"
                readOnly
                dir="ltr"
                className={`w-full ${cardRadius} px-3 py-1.5 text-xs font-outfit text-left border focus:outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400' : 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                  }`}
              />
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
              <span className="text-[10px] font-outfit text-teal-600 dark:text-teal-400 block mt-0.5">
                {platformName}
              </span>
            </div>
          </div>
          <a
            href={meta.meetingUrl || link.url || '#'}
            target={adv.openInNewTab !== false ? '_blank' : '_self'}
            rel="noreferrer"
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
          title={meta.countdownTitle || link.title}
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
              className={`py-1.5 px-2 ${cardRadius} bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${getButtonAnimationClass(adv.buttonAnimation)}`}
            >
              <MapPin className="w-3.5 h-3.5" />
              گوگل مپ
            </a>
            <a
              href={meta.wazeLink || 'https://waze.com'}
              target={adv.openInNewTab !== false ? '_blank' : '_self'}
              rel="noreferrer"
              className={`py-1.5 px-2 ${cardRadius} bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${getButtonAnimationClass(adv.buttonAnimation)}`}
            >
              <Navigation className="w-3.5 h-3.5" />
              ویز (Waze)
            </a>
          </div>
        </div>
      );
    }

    // 7.2 Location and Working Hours
    if (link.moduleType === 'location_hours') {
      const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
      return (
        <div
          key={link.id}
          className={`w-full p-3.5 border shadow-sm space-y-2 text-right ${cardRadius} ${isLight ? 'bg-white border-slate-200' : themeConfig.cardBlur
            }`}
          style={customCardStyle}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-500" />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {link.title}
            </span>
          </div>
          {meta.address && (
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              {meta.address}
            </p>
          )}
          {meta.workingHours && (
            <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40 flex items-center gap-1">
              <span>ساعات کاری:</span>
              <span className="font-semibold">{meta.workingHours}</span>
            </div>
          )}
          {(meta.mapLink || link.url) && (
            <a
              href={meta.mapLink || link.url}
              target="_blank"
              rel="noreferrer"
              className={`block w-full text-center py-1.5 ${cardRadius} bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-600 dark:text-violet-400 text-xs font-bold transition-all active:scale-95 mt-1`}
            >
              مشاهده موقعیت روی نقشه
            </a>
          )}
        </div>
      );
    }

    // 8. Standard / General Link Buttons (Call, Email, Waze, Donation, PDF, Custom)
    const cardRadius = getBorderRadiusClass(customStyle?.borderRadius);
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
        target={adv.openInNewTab === false || link.url.startsWith('tel:') || link.url.startsWith('mailto:') || link.url.startsWith('#') ? '_self' : '_blank'}
        rel="noopener noreferrer"
        className={`w-full p-2.5 border flex items-center justify-between gap-3 text-right shadow-sm cursor-pointer transition-all duration-200 ${cardRadius} ${getButtonAnimationClass(adv.buttonAnimation)} ${isLight
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
            {link.moduleType === 'standard_link' && <Link2 className="w-4 h-4 text-cyan-500" />}
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {link.title}
              </span>
              {lock?.isLocked && (
                <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 border border-amber-500/30 shrink-0 font-outfit">
                  <Lock className="w-2.5 h-2.5" />
                  {lock.price} {lock.currency}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] font-outfit font-medium tracking-wide truncate block mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-300/80'
                }`}
              dir="ltr"
            >
              {link.url.replace(/^https?:\/\//, '')}
            </span>
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
    <div className="flex-1 h-full bg-slate-900/40 dark:bg-slate-950/60 p-4 md:p-8 flex flex-col items-center justify-center overflow-hidden relative select-none">
      {/* Decorative Lighting */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Device Toolbar */}
      <div className="z-10 mb-4 bg-card/90 backdrop-blur-md border border-border rounded-full p-1.5 flex items-center gap-2 shadow-xl">
        <span className="text-[11px] font-semibold text-muted-foreground px-2">پیش‌نمایش زنده:</span>
        <button
          onClick={() => setDevice('iphone')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedDeviceId === 'iphone'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          iPhone
        </button>
        <button
          onClick={() => setDevice('android')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedDeviceId === 'android'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Android
        </button>
        <div className="h-3.5 w-[1px] bg-border mx-0.5" />
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-outfit text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1"
          dir="ltr"
        >
          <span>aryalink.af/{profile.alias}</span>
        </span>
      </div>

      {/* Virtual Smartphone Frame */}
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
          className={`w-full h-full overflow-hidden flex flex-col relative transition-all duration-300 font-sans ${selectedDeviceId === 'iphone' ? 'rounded-[44px]' : 'rounded-[24px]'
            }`}
          style={{
            background: isLight ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' : themeConfig.backgroundColor,
          }}
          dir={isLtr ? 'ltr' : 'rtl'}
        >
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
                    <h2 className={`text-base font-bold tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                      <span>{resolveDisplayName || 'نام شما'}</span>
                      {isVerifiedApproved && (
                        <BadgeCheck className="w-4 h-4 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                      )}
                    </h2>

                    <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-blue-600' : 'text-cyan-300/90'
                      }`}>
                      {resolveHeadline || (isLtr ? 'Job Title / Profession' : 'عنوان شغلی / تخصص')}
                    </p>

                    {resolveBio && (
                      <p className={`text-[11px] mt-2 leading-relaxed max-w-[260px] mx-auto ${isLight ? 'text-slate-600' : 'text-slate-300/80'
                        }`}>
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
                      <h2 className={`text-sm font-bold tracking-tight truncate flex items-center gap-1 ${isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                        <span className="truncate">{resolveDisplayName || 'نام شما'}</span>
                        {isVerifiedApproved && (
                          <BadgeCheck className="w-3.5 h-3.5 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                        )}
                      </h2>
                      <p className={`text-[11px] font-semibold truncate ${isLight ? 'text-blue-600' : 'text-cyan-300'
                        }`}>
                        {resolveHeadline || (isLtr ? 'Job Title / Profession' : 'عنوان شغلی / تخصص')}
                      </p>
                      {resolveBio && (
                        <p className={`text-[10px] line-clamp-2 mt-0.5 leading-snug ${isLight ? 'text-slate-600' : 'text-slate-300/80'
                          }`}>
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
                  <h2 className={`text-base font-bold tracking-tight flex items-center justify-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                    <span>{resolveDisplayName || 'نام شما'}</span>
                    {isVerifiedApproved && (
                      <BadgeCheck className="w-4 h-4 text-white fill-sky-500 drop-shadow-sm shrink-0" />
                    )}
                  </h2>

                  {/* Headline */}
                  <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-blue-600' : 'text-cyan-300/90'
                    }`}>
                    {resolveHeadline || (isLtr ? 'Job Title / Profession' : 'عنوان شغلی / تخصص')}
                  </p>

                  {/* Bio */}
                  {resolveBio && (
                    <p className={`text-[11px] mt-2 leading-relaxed max-w-[260px] ${isLight ? 'text-slate-600' : 'text-slate-300/80'
                      }`}>
                      {resolveBio}
                    </p>
                  )}
                </div>
              )}

              {/* Profile Action Buttons & Modules Container */}
              <div className="px-4 flex-1 flex flex-col">
                {/* Quick Contact Micro Actions */}
                <div className="flex items-center justify-center gap-2.5 mb-3">
                  {profile.phone && (
                    <a
                      href={getSmartLink('phone', profile.phone)}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs shadow-sm transition-all active:scale-95 ${isLight
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
                      rel="noreferrer"
                      className="w-9 h-9 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-600 dark:text-emerald-300 text-xs shadow-sm transition-all active:scale-95"
                      title="واتساپ"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-emerald-600 dark:fill-emerald-300" />
                    </a>
                  )}
                  {profile.email && (
                    <a
                      href={getSmartLink('email', profile.email)}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs shadow-sm transition-all active:scale-95 ${isLight
                          ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md text-white'
                        }`}
                      title="ایمیل"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Primary Action Button: Save Contact vCard */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mb-3 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg border border-white/30 backdrop-blur-xl transition-all"
                  style={{
                    background: isLight
                      ? 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)'
                      : `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.accentColor})`,
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

                {/* SOCIAL NETWORKS ICON GRID (Dedicated Row / Matrix) */}
                {socialLinks.length > 0 && (
                  <div className="mb-4 pt-1">
                    <div className="flex items-center justify-center flex-wrap gap-3 p-2 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 backdrop-blur-md">
                      {socialLinks.map((link) => renderSocialIcon(link))}
                    </div>
                  </div>
                )}

                {/* NON-SOCIAL MODULES LIST */}
                <div className="space-y-2.5 flex-1">
                  <AnimatePresence mode="popLayout">
                    {filteredNonSocialLinks.map((link) => renderModuleCard(link))}
                  </AnimatePresence>

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
                    <span className="text-cyan-500 dark:text-cyan-400 font-bold font-outfit">Arya Link</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
