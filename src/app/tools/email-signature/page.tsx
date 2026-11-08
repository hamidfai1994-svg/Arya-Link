'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Mail,
  User,
  Building,
  Phone,
  Globe,
  MapPin,
  Palette,
  Layout,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Upload,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  HelpCircle,
  Linkedin,
  MessageCircle,
  Send as TelegramIcon,
  Instagram,
  Twitter,
  Github,
  Youtube,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useProfileLoader } from '@/components/tools/useProfileLoader';
import { ToolsCtaBanner } from '@/components/tools/ToolsCtaBanner';
import { toast } from 'sonner';

type TemplateType = 'modern' | 'classic' | 'compact';
type AvatarShape = 'circle' | 'rounded' | 'square';

export default function EmailSignatureBuilderPage() {
  const { dir, language } = useLanguage();
  const isRtl = dir === 'rtl';
  const { loadProfile, isLoading: isProfileLoading } = useProfileLoader();

  // Template & Layout State
  const [template, setTemplate] = useState<TemplateType>('modern');
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [accentColor, setAccentColor] = useState('#06b6d4');
  const [textColor, setTextColor] = useState('#334155');
  const [avatarShape, setAvatarShape] = useState<AvatarShape>('circle');
  const [avatarSize, setAvatarSize] = useState<number>(75);

  // Profile / Identity fields
  const [fullName, setFullName] = useState('احمد رسولی');
  const [jobTitle, setJobTitle] = useState('مدیر فناوری و توسعه محصول');
  const [company, setCompany] = useState('شرکت فناوری آریا لینک');
  const [department, setDepartment] = useState('دپارتمان فناوری اطلاعات');
  const [phone, setPhone] = useState('+93202501234');
  const [mobile, setMobile] = useState('+93700123456');
  const [email, setEmail] = useState('ahmad@aryalink.com');
  const [website, setWebsite] = useState('https://aryalink.com');
  const [address, setAddress] = useState('کابل، چهارراهی صدارت، برج الماس');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  // Social Links
  const [socials, setSocials] = useState({
    linkedin: 'https://linkedin.com/in/aryalink',
    whatsapp: 'https://wa.me/93700123456',
    telegram: 'https://t.me/aryalink',
    instagram: 'https://instagram.com/aryalink',
    twitter: 'https://twitter.com/aryalink',
    website: 'https://aryalink.com',
  });

  // Promotional Banner / Disclaimer
  const [includeDisclaimer, setIncludeDisclaimer] = useState(true);
  const [disclaimerText, setDisclaimerText] = useState(
    'توجه: محتوای این پیام الکترونیکی و فایل‌های پیوست آن محرمانه بوده و صرفاً برای دریافت‌کننده مجاز در نظر گرفته شده است.'
  );

  // Copy State
  const [copiedRich, setCopiedRich] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Handle Load My Profile
  const handleLoadProfile = () => {
    loadProfile((profile) => {
      if (profile.displayName) setFullName(profile.displayName);
      if (profile.headline) setJobTitle(profile.headline);
      if (profile.company) setCompany(profile.company);
      if (profile.phone) {
        setMobile(profile.phone);
        setPhone(profile.phone);
      }
      if (profile.email) setEmail(profile.email);
      if (profile.website) setWebsite(profile.website);
      if (profile.location) setAddress(profile.location);
      if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);

      // Map social links if present
      if (Array.isArray(profile.links)) {
        const newSocials = { ...socials };
        profile.links.forEach((item) => {
          const lUrl = item.url.toLowerCase();
          if (lUrl.includes('linkedin')) newSocials.linkedin = item.url;
          if (lUrl.includes('wa.me') || lUrl.includes('whatsapp'))
            newSocials.whatsapp = item.url;
          if (lUrl.includes('t.me') || lUrl.includes('telegram'))
            newSocials.telegram = item.url;
          if (lUrl.includes('instagram')) newSocials.instagram = item.url;
          if (lUrl.includes('twitter') || lUrl.includes('x.com'))
            newSocials.twitter = item.url;
        });
        setSocials(newSocials);
      }
    });
  };

  // Avatar Border Radius based on shape
  const avatarRadius = useMemo(() => {
    if (avatarShape === 'circle') return '50%';
    if (avatarShape === 'rounded') return '12px';
    return '0px';
  }, [avatarShape]);

  // Handle local avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(
        language === 'en'
          ? 'Please select a valid image file.'
          : 'لطفاً یک فایل تصویری معتبر انتخاب کنید.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
      toast.success(
        language === 'en'
          ? 'Avatar uploaded successfully!'
          : 'تصویر با موفقیت بارگذاری شد!'
      );
    };
    reader.readAsDataURL(file);
  };

  // Generate Email-Safe HTML Code with Inline Styles
  const generatedHtml = useMemo(() => {
    const socialIconsHtml = [
      socials.linkedin
        ? `<a href="${socials.linkedin}" target="_blank" style="text-decoration:none; display:inline-block; margin-right:6px;"><img src="https://cdn-icons-png.flaticon.com/32/3536/3536505.png" alt="LinkedIn" width="20" height="20" style="display:block; border:0; border-radius:4px;" /></a>`
        : '',
      socials.whatsapp
        ? `<a href="${socials.whatsapp}" target="_blank" style="text-decoration:none; display:inline-block; margin-right:6px;"><img src="https://cdn-icons-png.flaticon.com/32/3670/3670051.png" alt="WhatsApp" width="20" height="20" style="display:block; border:0; border-radius:4px;" /></a>`
        : '',
      socials.telegram
        ? `<a href="${socials.telegram}" target="_blank" style="text-decoration:none; display:inline-block; margin-right:6px;"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111646.png" alt="Telegram" width="20" height="20" style="display:block; border:0; border-radius:4px;" /></a>`
        : '',
      socials.instagram
        ? `<a href="${socials.instagram}" target="_blank" style="text-decoration:none; display:inline-block; margin-right:6px;"><img src="https://cdn-icons-png.flaticon.com/32/3955/3955024.png" alt="Instagram" width="20" height="20" style="display:block; border:0; border-radius:4px;" /></a>`
        : '',
      socials.twitter
        ? `<a href="${socials.twitter}" target="_blank" style="text-decoration:none; display:inline-block; margin-right:6px;"><img src="https://cdn-icons-png.flaticon.com/32/5969/5969020.png" alt="X" width="20" height="20" style="display:block; border:0; border-radius:4px;" /></a>`
        : '',
      socials.website
        ? `<a href="${socials.website}" target="_blank" style="text-decoration:none; display:inline-block; margin-right:6px;"><img src="https://cdn-icons-png.flaticon.com/32/1006/1006771.png" alt="Website" width="20" height="20" style="display:block; border:0; border-radius:4px;" /></a>`
        : '',
    ]
      .filter(Boolean)
      .join('&nbsp;');

    if (template === 'modern') {
      return `<!-- AryaLink Modern Signature -->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:${fontFamily}; font-size:13px; line-height:1.4; color:${textColor}; max-width:520px; direction:ltr;">
  <tr>
    ${
      avatarUrl
        ? `<td style="vertical-align:middle; padding-right:16px;">
      <img src="${avatarUrl}" alt="${fullName}" width="${avatarSize}" height="${avatarSize}" style="width:${avatarSize}px; height:${avatarSize}px; border-radius:${avatarRadius}; object-fit:cover; display:block; border:2px solid ${accentColor};" />
    </td>`
        : ''
    }
    <td style="border-left:3px solid ${accentColor}; padding-left:16px; vertical-align:middle;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-size:16px; font-weight:bold; color:${accentColor}; display:block;">${fullName}</span>
            <span style="font-size:13px; font-weight:600; color:#475569; display:block; margin-top:2px;">
              ${jobTitle}${company ? ` <span style="color:#cbd5e1;">|</span> ${company}` : ''}
            </span>
            ${department ? `<span style="font-size:11px; color:#94a3b8; display:block;">${department}</span>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding-top:8px; font-size:12px; color:#64748b; line-height:1.6;">
            ${mobile ? `<div>📞 <strong>M:</strong> <a href="tel:${mobile}" style="color:#334155; text-decoration:none;">${mobile}</a></div>` : ''}
            ${phone && phone !== mobile ? `<div>☎️ <strong>T:</strong> <a href="tel:${phone}" style="color:#334155; text-decoration:none;">${phone}</a></div>` : ''}
            ${email ? `<div>✉️ <strong>E:</strong> <a href="mailto:${email}" style="color:${accentColor}; text-decoration:none; font-weight:500;">${email}</a></div>` : ''}
            ${website ? `<div>🌐 <strong>W:</strong> <a href="${website}" target="_blank" style="color:${accentColor}; text-decoration:none;">${website.replace(/^https?:\/\//, '')}</a></div>` : ''}
            ${address ? `<div>📍 <span style="color:#64748b;">${address}</span></div>` : ''}
          </td>
        </tr>
        ${
          socialIconsHtml
            ? `<tr>
          <td style="padding-top:10px;">
            ${socialIconsHtml}
          </td>
        </tr>`
            : ''
        }
      </table>
    </td>
  </tr>
  ${
    includeDisclaimer && disclaimerText
      ? `<tr>
    <td colspan="2" style="padding-top:12px; border-top:1px dashed #cbd5e1; margin-top:12px; font-size:10px; color:#94a3b8; line-height:1.4;">
      ${disclaimerText}
    </td>
  </tr>`
      : ''
  }
</table>`;
    }

    if (template === 'classic') {
      return `<!-- AryaLink Classic Signature -->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:${fontFamily}; font-size:13px; line-height:1.5; color:${textColor}; max-width:550px; border-top:2px solid ${accentColor}; padding-top:10px;">
  <tr>
    <td colspan="2" style="padding-bottom:8px;">
      <span style="font-size:17px; font-weight:bold; color:#0f172a;">${fullName}</span>
      <span style="font-size:13px; color:${accentColor}; font-weight:bold; margin-left:8px;">${jobTitle}</span>
      <div style="font-size:12px; color:#64748b;">${company} ${department ? `• ${department}` : ''}</div>
    </td>
  </tr>
  <tr>
    ${
      avatarUrl
        ? `<td style="vertical-align:top; padding-right:14px; width:${avatarSize + 10}px;">
      <img src="${avatarUrl}" alt="${fullName}" width="${avatarSize}" height="${avatarSize}" style="width:${avatarSize}px; height:${avatarSize}px; border-radius:${avatarRadius}; object-fit:cover; display:block;" />
    </td>`
        : ''
    }
    <td style="vertical-align:top; font-size:12px; color:#475569;">
      <table cellpadding="0" cellspacing="0" border="0" style="line-height:1.6;">
        ${phone ? `<tr><td style="color:#94a3b8; width:20px;">T:</td><td><a href="tel:${phone}" style="color:#334155; text-decoration:none;">${phone}</a></td></tr>` : ''}
        ${mobile ? `<tr><td style="color:#94a3b8; width:20px;">M:</td><td><a href="tel:${mobile}" style="color:#334155; text-decoration:none;">${mobile}</a></td></tr>` : ''}
        ${email ? `<tr><td style="color:#94a3b8; width:20px;">E:</td><td><a href="mailto:${email}" style="color:${accentColor}; text-decoration:none;">${email}</a></td></tr>` : ''}
        ${website ? `<tr><td style="color:#94a3b8; width:20px;">W:</td><td><a href="${website}" target="_blank" style="color:${accentColor}; text-decoration:none;">${website}</a></td></tr>` : ''}
        ${address ? `<tr><td style="color:#94a3b8; width:20px;">A:</td><td>${address}</td></tr>` : ''}
      </table>
      ${
        socialIconsHtml
          ? `<div style="margin-top:8px;">
        ${socialIconsHtml}
      </div>`
          : ''
      }
    </td>
  </tr>
  ${
    includeDisclaimer && disclaimerText
      ? `<tr>
    <td colspan="2" style="padding-top:12px; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; margin-top:8px;">
      ${disclaimerText}
    </td>
  </tr>`
      : ''
  }
</table>`;
    }

    // Compact Template
    return `<!-- AryaLink Compact Signature -->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:${fontFamily}; font-size:12px; color:${textColor}; line-height:1.4; max-width:500px;">
  <tr>
    ${
      avatarUrl
        ? `<td style="vertical-align:middle; padding-right:10px;">
      <img src="${avatarUrl}" alt="${fullName}" width="48" height="48" style="width:48px; height:48px; border-radius:${avatarRadius}; object-fit:cover; display:block;" />
    </td>`
        : ''
    }
    <td style="vertical-align:middle;">
      <div>
        <strong style="font-size:14px; color:${accentColor};">${fullName}</strong>
        <span style="color:#64748b;"> | ${jobTitle} at ${company}</span>
      </div>
      <div style="font-size:11px; color:#64748b; margin-top:3px;">
        ${mobile ? `<a href="tel:${mobile}" style="color:#334155; text-decoration:none;">${mobile}</a> • ` : ''}
        ${email ? `<a href="mailto:${email}" style="color:${accentColor}; text-decoration:none;">${email}</a> • ` : ''}
        ${website ? `<a href="${website}" target="_blank" style="color:${accentColor}; text-decoration:none;">${website.replace(/^https?:\/\//, '')}</a>` : ''}
      </div>
    </td>
  </tr>
</table>`;
  }, [
    template,
    fontFamily,
    accentColor,
    textColor,
    avatarShape,
    avatarRadius,
    avatarSize,
    fullName,
    jobTitle,
    company,
    department,
    phone,
    mobile,
    email,
    website,
    address,
    avatarUrl,
    socials,
    includeDisclaimer,
    disclaimerText,
  ]);

  // Copy as Rich Text / HTML (Direct paste into Gmail / Outlook)
  const handleCopyRichSignature = async () => {
    try {
      const plainText = `${fullName}\n${jobTitle} | ${company}\nEmail: ${email}\nMobile: ${mobile}\nWebsite: ${website}`;

      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([generatedHtml], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([clipboardItem]);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2500);

      toast.success(
        language === 'en'
          ? 'Copied to clipboard! You can now paste directly into Gmail or Outlook settings (Ctrl+V).'
          : 'امضا کپی شد! اکنون می‌توانید مستقیماً در تنظیمات جیمیل یا اوت‌لوک Paste (Ctrl+V) کنید.'
      );
    } catch (err) {
      console.warn('Rich clipboard not supported, fallback to text:', err);
      // Fallback
      navigator.clipboard.writeText(generatedHtml);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2500);
      toast.info(
        language === 'en'
          ? 'HTML code copied to clipboard!'
          : 'کد امضا در کلیپ‌بورد کپی شد!'
      );
    }
  };

  // Copy raw HTML source
  const handleCopyRawHtml = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
    toast.success(
      language === 'en'
        ? 'Raw HTML code copied to clipboard!'
        : 'کد خام HTML در کلیپ‌بورد کپی شد!'
    );
  };

  // Reset defaults
  const handleReset = () => {
    setTemplate('modern');
    setFontFamily('Arial, sans-serif');
    setAccentColor('#06b6d4');
    setTextColor('#334155');
    setAvatarShape('circle');
    setAvatarSize(75);
    setIncludeDisclaimer(true);
    toast.info(
      language === 'en' ? 'Signature reset to defaults.' : 'تنظیمات امضا بازنشانی شدند.'
    );
  };

  // Color Swatches
  const colorSwatches = [
    { name: 'Arya Cyan', hex: '#06b6d4' },
    { name: 'Royal Blue', hex: '#2563eb' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Rose Red', hex: '#e11d48' },
    { name: 'Violet', hex: '#7c3aed' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Slate Gray', hex: '#334155' },
  ];

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-200"
    >
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link
            href="/"
            className="hover:text-cyan-500 transition-colors flex items-center gap-1"
          >
            {language === 'en' ? 'Home' : 'صفحه اصلی'}
          </Link>
          {isRtl ? (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          )}
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {language === 'en'
              ? 'Digital Toolbox'
              : language === 'ps'
              ? 'ډیجیټل اوزار بکس'
              : 'جعبه ابزار دیجیتال'}
          </span>
          {isRtl ? (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          )}
          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
            {language === 'en'
              ? 'Email Signature Builder'
              : language === 'ps'
              ? 'د بریښنالیک لاسلیک جوړول'
              : 'امضاساز ایمیل'}
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800/80 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'en'
                  ? 'Compatible with Gmail, Outlook & Apple Mail'
                  : language === 'ps'
                  ? 'له جیمیل، اوټ لوک او ټولو سره سازګار'
                  : 'سازگار با جیمیل، اوت‌لوک، اپل میل و وب‌میل'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-500 shadow-lg shadow-cyan-500/10">
                <Mail className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              {language === 'en'
                ? 'Email Signature Builder'
                : language === 'ps'
                ? 'د مسلکي بریښنالیک لاسلیک جوړول'
                : 'سازنده امضای دیجیتال ایمیل'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {language === 'en'
                ? 'Design modern, professional HTML email signatures for your corporate communications. Copy with one click and paste directly into your email settings.'
                : language === 'ps'
                ? 'د خپل شرکت او ځان لپاره پرمختللی برېښنالیک لاسلیک جوړ کړئ او په مستقیمه توګه یې په خپل Gmail یا Outlook کې وکاروئ.'
                : 'طراحی امضای رسمی و مدرن ایمیل با چیدمان استاندارد و آیکون شبکه‌های اجتماعی. فقط با یک کلیک کپی کرده و در تنظیمات جیمیل یا اوت‌لوک جایگذاری کنید.'}
            </p>
          </div>

          {/* Header Action: Load Profile */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleLoadProfile}
              disabled={isProfileLoading}
              className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 me-2 text-cyan-200 animate-pulse" />
              <span>
                {isProfileLoading
                  ? language === 'en'
                    ? 'Loading...'
                    : 'در حال فراخوانی...'
                  : language === 'en'
                  ? 'Load My Profile'
                  : language === 'ps'
                  ? 'زما د پروفایل معلومات'
                  : 'فراخوانی اطلاعات من'}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3.5"
              title={language === 'en' ? 'Reset styles' : 'بازنشانی'}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Grid: Form Inputs (Left) | Live Outlook/Gmail Simulator (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Data Entry & Customization Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Template Selection */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Layout className="w-4 h-4" />
                  {language === 'en'
                    ? 'Step 1: Choose Layout Template'
                    : language === 'ps'
                    ? 'لومړی ګام: د لاسلیک بڼه'
                    : 'مرحله 1: انتخاب قالب و سبک امضا'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {template}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'modern' as TemplateType,
                    title: language === 'en' ? 'Modern Vertical' : 'مدرن (خط عمودی)',
                    desc: language === 'en' ? '2-Column with divider' : 'دو ستونه با خط رنگی جداکننده',
                  },
                  {
                    id: 'classic' as TemplateType,
                    title: language === 'en' ? 'Corporate Classic' : 'کلاسیک سازمانی',
                    desc: language === 'en' ? 'Formal boxed table' : 'جدول رسمی با خط افقی',
                  },
                  {
                    id: 'compact' as TemplateType,
                    title: language === 'en' ? 'Compact Minimal' : 'فشرده و مینیمال',
                    desc: language === 'en' ? 'Inline text & avatar' : 'مناسب پاسخ‌های کوتاه و موبایل',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTemplate(item.id)}
                    className={`p-3.5 rounded-xl border text-start transition-all ${
                      template === item.id
                        ? 'bg-cyan-500/15 border-cyan-500/80 text-cyan-700 dark:text-white shadow-md shadow-cyan-500/10'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                      {item.title}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Personal & Corporate Information */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <User className="w-4 h-4" />
                {language === 'en'
                  ? 'Step 2: Personal & Contact Information'
                  : language === 'ps'
                  ? 'دویم ګام: د اړیکې او هویت معلومات'
                  : 'مرحله 2: مشخصات فردی و اطلاعات تماس'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'en' ? 'Full Name' : 'نام و نام خانوادگی'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'en' ? 'Job Title' : 'سمت یا عنوان شغلی'}
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'en' ? 'Company / Organization' : 'نام شرکت یا برند'}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'en' ? 'Department / Unit' : 'واحد سازمانی یا دپارتمان'}
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'en' ? 'Mobile / WhatsApp' : 'تلفن همراه یا واتساپ'}
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'en' ? 'Office Phone' : 'تلفن ثابت دفتر'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'en' ? 'Email Address' : 'آدرس ایمیل'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {language === 'en' ? 'Website or Bio Link' : 'وب‌سایت یا لینک کارت هوشمند'}
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {language === 'en' ? 'Office Address' : 'نشانی دفتر یا شرکت'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Step 3: Photo & Styling Controls */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                <Palette className="w-4 h-4" />
                {language === 'en'
                  ? 'Step 3: Avatar, Colors & Typography'
                  : language === 'ps'
                  ? 'دریم ګام: انځور او رنګونه'
                  : 'مرحله 3: عکس پرسنلی، رنگ‌ها و قلم'}
              </span>

              {/* Avatar Image Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    {language === 'en' ? 'Avatar / Brand Photo' : 'عکس پرسنلی یا لوگوی شرکت:'}
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      {language === 'en' ? 'Remove Photo' : 'حذف عکس'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-16 h-16 object-cover border-2 border-cyan-500 bg-slate-800 shrink-0"
                      style={{ borderRadius: avatarRadius }}
                    />
                  ) : (
                    <div
                      className="w-16 h-16 bg-slate-800 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 shrink-0"
                      style={{ borderRadius: avatarRadius }}
                    >
                      <User className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-white focus:outline-none font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {language === 'en' ? 'Upload Local Photo' : 'بارگذاری عکس از سیستم'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Avatar Shape & Size */}
                {avatarUrl && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="block text-xs text-slate-400 mb-1.5">
                        {language === 'en' ? 'Avatar Shape' : 'فرم کادر عکس'}
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { id: 'circle', label: 'Circle' },
                            { id: 'rounded', label: 'Rounded' },
                            { id: 'square', label: 'Square' },
                          ] as const
                        ).map((shape) => (
                          <button
                            key={shape.id}
                            type="button"
                            onClick={() => setAvatarShape(shape.id)}
                            className={`py-1 rounded-lg text-xs font-medium border text-center transition-colors ${
                              avatarShape === shape.id
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400'
                            }`}
                          >
                            {shape.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{language === 'en' ? 'Photo Size' : 'اندازه عکس'}</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {avatarSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={avatarSize}
                        onChange={(e) => setAvatarSize(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Accent Color Selection */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'en' ? 'Primary Accent Color' : 'رنگ شاخص سازمانی (Accent Color):'}
                </span>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-slate-700"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-28 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorSwatches.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setAccentColor(swatch.hex)}
                      className="w-7 h-7 rounded-lg border border-white/20 transition-transform hover:scale-110"
                      style={{ backgroundColor: swatch.hex }}
                      title={swatch.name}
                    />
                  ))}
                </div>
              </div>

              {/* Web Safe Font Selection */}
              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'en'
                    ? 'Email-Safe Font Family'
                    : 'قلم استاندارد ایمیل (Web-Safe Font):'}
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Arial, sans-serif">Arial / Tahoma (پیشنهاد عمومی)</option>
                  <option value="'Segoe UI', Helvetica, sans-serif">Segoe UI / Modern Sans</option>
                  <option value="Georgia, serif">Georgia (کلاسیک و اداری)</option>
                  <option value="Verdana, sans-serif">Verdana (خوانایی بالا)</option>
                  <option value="'Courier New', monospace">Courier New (مهندسی و تک‌فضا)</option>
                </select>
              </div>
            </div>

            {/* Step 4: Social Links & Disclaimer */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <span className="text-xs font-bold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Globe className="w-4 h-4" />
                {language === 'en'
                  ? 'Step 4: Social Profiles & Legal Disclaimer'
                  : language === 'ps'
                  ? 'څلورم ګام: ټولنیزې شبکې او حقوقي خبرداری'
                  : 'مرحله 4: لینک شبکه‌های اجتماعی و متن بیانیه محرمانگی'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                    <span>LinkedIn</span>
                  </label>
                  <input
                    type="url"
                    value={socials.linkedin}
                    onChange={(e) =>
                      setSocials({ ...socials, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </label>
                  <input
                    type="url"
                    value={socials.whatsapp}
                    onChange={(e) =>
                      setSocials({ ...socials, whatsapp: e.target.value })
                    }
                    placeholder="https://wa.me/..."
                    className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Telegram</span>
                  </label>
                  <input
                    type="url"
                    value={socials.telegram}
                    onChange={(e) =>
                      setSocials({ ...socials, telegram: e.target.value })
                    }
                    placeholder="https://t.me/..."
                    className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>Instagram</span>
                  </label>
                  <input
                    type="url"
                    value={socials.instagram}
                    onChange={(e) =>
                      setSocials({ ...socials, instagram: e.target.value })
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeDisclaimer}
                    onChange={(e) => setIncludeDisclaimer(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>
                    {language === 'en'
                      ? 'Include Corporate Confidentiality Notice'
                      : 'درج بیانیه محرمانگی سازمانی در انتهای امضا'}
                  </span>
                </label>

                {includeDisclaimer && (
                  <textarea
                    rows={2}
                    value={disclaimerText}
                    onChange={(e) => setDisclaimerText(e.target.value)}
                    className="w-full p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live Email Mockup & Copy Center */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-cyan-500" />
                  {language === 'en'
                    ? 'Interactive Email Client Preview'
                    : language === 'ps'
                    ? 'د ایمیل ننداره'
                    : 'پیش‌نمایش زنده در قالب کلاینت ایمیل'}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Gmail & Outlook Ready
                </span>
              </div>

              {/* Simulated Email Message Container */}
              <div className="rounded-2xl bg-white text-slate-800 shadow-xl overflow-hidden border border-slate-200 text-start">
                {/* Mock Email Header */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 text-xs text-slate-600 space-y-1 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold w-12">From:</span>
                    <span className="font-semibold text-slate-800 truncate">
                      {fullName} &lt;{email}&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold w-12">To:</span>
                    <span className="text-slate-700">client@partner-company.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold w-12">Subject:</span>
                    <span className="font-medium text-slate-800">
                      پروپوزال همکاری و کارت ویزیت هوشمند آریا لینک
                    </span>
                  </div>
                </div>

                {/* Email Body & Signature Container */}
                <div className="p-5 font-sans text-xs text-slate-700 space-y-4">
                  <p className="leading-relaxed text-slate-600">
                    با سلام و احترام،
                    <br />
                    فایل پروپوزال مورد نظر پیوست گردید. در صورت نیاز به هرگونه اطلاعات تکمیلی می‌توانید از طریق راه‌های ارتباطی زیر مستقیماً با بنده در تماس باشید.
                  </p>

                  <div className="border-t border-slate-200 pt-4">
                    {/* Rendered Live HTML */}
                    <div
                      dangerouslySetInnerHTML={{ __html: generatedHtml }}
                      className="overflow-x-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Actions: Copy Rich Text (Ctrl+V) & Copy Raw HTML */}
              <div className="mt-6 space-y-3">
                {/* Primary Button: 1-Click Copy for Gmail / Outlook */}
                <Button
                  type="button"
                  onClick={handleCopyRichSignature}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {copiedRich ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-300" />
                      <span>
                        {language === 'en'
                          ? 'Copied! Ready to Paste (Ctrl+V)'
                          : 'با موفقیت کپی شد! اکنون Paste کنید'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>
                        {language === 'en'
                          ? 'Copy for Gmail / Outlook (Rich)'
                          : language === 'ps'
                          ? 'د Gmail او Outlook لپاره کاپي'
                          : 'کپی مستقیم برای جیمیل و اوت‌لوک (Ctrl+V)'}
                      </span>
                    </>
                  )}
                </Button>

                {/* Secondary Button: Copy Raw HTML Source */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyRawHtml}
                  className="w-full py-2.5 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300 font-medium flex items-center justify-center gap-2 text-xs"
                >
                  {copiedHtml ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>
                    {language === 'en'
                      ? 'Copy Raw HTML Source Code'
                      : 'کپی سورس کد خام HTML (مخصوص برنامه‌نویسان)'}
                  </span>
                </Button>
              </div>

              {/* How to install instructions card */}
              <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>
                    {language === 'en'
                      ? 'How to use in your email client:'
                      : 'راهنمای سریع نصب در جیمیل و اوت‌لوک:'}
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>
                    {language === 'en'
                      ? 'Click the cyan "Copy for Gmail / Outlook" button above.'
                      : 'روی دکمه فیروزه‌ای "کپی مستقیم برای جیمیل و اوت‌لوک" کلیک کنید.'}
                  </li>
                  <li>
                    {language === 'en'
                      ? 'Open Gmail Settings -> General -> Signature (or Outlook Settings -> Mail -> Compose).'
                      : 'به تنظیمات جیمیل یا اوت‌لوک رفته و بخش Signature را باز کنید.'}
                  </li>
                  <li>
                    {language === 'en'
                      ? 'Press Ctrl + V (Cmd + V on Mac) in the signature box and save!'
                      : 'کلید Ctrl + V (در مک Cmd + V) را فشار دهید و ذخیره نمایید.'}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Global CTA Banner at bottom */}
        <ToolsCtaBanner />
      </div>
    </div>
  );
}
