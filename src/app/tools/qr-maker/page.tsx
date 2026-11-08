'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Link2,
  User,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Wifi,
  MapPin,
  Palette,
  Image as ImageIcon,
  Settings2,
  Download,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Upload,
  X,
  Layers,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useProfileLoader } from '@/components/tools/useProfileLoader';
import { ToolsCtaBanner } from '@/components/tools/ToolsCtaBanner';
import { toast } from 'sonner';

type ContentTab =
  | 'url'
  | 'vcard'
  | 'text'
  | 'email'
  | 'sms'
  | 'phone'
  | 'wifi'
  | 'location';

type DotStyle =
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'square'
  | 'extra-rounded';

type CornerSquareStyle = 'square' | 'dot' | 'extra-rounded';
type CornerDotStyle = 'square' | 'dot';

export default function AdvancedQrMakerPage() {
  const { dir, language } = useLanguage();
  const isRtl = dir === 'rtl';
  const { loadProfile, isLoading: isProfileLoading } = useProfileLoader();

  // Active Tab
  const [activeTab, setActiveTab] = useState<ContentTab>('url');

  // Tab Content States
  const [url, setUrl] = useState('https://aryalink.com');

  // vCard fields
  const [vcard, setVcard] = useState({
    firstName: 'احمد',
    lastName: 'رسولی',
    org: 'آریا لینک | AryaLink',
    title: 'مدیر فناوری و توسعه',
    phone: '+93700123456',
    mobile: '+93799654321',
    email: 'info@aryalink.com',
    website: 'https://aryalink.com',
    address: 'کابل، کارته 4',
  });

  // Plain Text
  const [plainText, setPlainText] = useState('به وب‌سایت آریا لینک خوش آمدید!');

  // Email fields
  const [emailData, setEmailData] = useState({
    to: 'contact@aryalink.com',
    subject: 'درخواست همکاری و مشاوره',
    body: 'با سلام و احترام،\nجهت دریافت مشاوره برای کارت هوشمند پیام می‌دهم.',
  });

  // SMS fields
  const [smsData, setSmsData] = useState({
    phone: '+93700123456',
    message: 'سلام، کارت دیجیتال شما را بررسی کردم. تمایل به همکاری دارم.',
  });

  // Phone
  const [phoneNumber, setPhoneNumber] = useState('+93700123456');

  // Wi-Fi fields
  const [wifiData, setWifiData] = useState({
    ssid: 'AryaLink_Guest_WiFi',
    password: '',
    encryption: 'WPA' as 'WPA' | 'WEP' | 'nopass',
    hidden: false,
  });

  // Location fields
  const [locationData, setLocationData] = useState({
    lat: '34.5281',
    lng: '69.1723',
    address: 'Kabul, Afghanistan',
  });

  // Styling States
  const [dotStyle, setDotStyle] = useState<DotStyle>('rounded');
  const [cornerSquareStyle, setCornerSquareStyle] =
    useState<CornerSquareStyle>('extra-rounded');
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotStyle>('dot');

  // Colors
  const [colorMode, setColorMode] = useState<'single' | 'gradient'>('gradient');
  const [singleColor, setSingleColor] = useState('#06b6d4');
  const [gradientColor1, setGradientColor1] = useState('#06b6d4');
  const [gradientColor2, setGradientColor2] = useState('#3b82f6');
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientRotation, setGradientRotation] = useState(45);

  // Background
  const [isTransparentBg, setIsTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');

  // Eye custom colors
  const [customEyeColors, setCustomEyeColors] = useState(false);
  const [eyeSquareColor, setEyeSquareColor] = useState('#0e7490');
  const [eyeDotColor, setEyeDotColor] = useState('#0284c7');

  // Logo upload
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.35);
  const [logoMargin, setLogoMargin] = useState(3);
  const [hideBehindLogo, setHideBehindLogo] = useState(true);

  // Advanced QR options
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<
    'L' | 'M' | 'Q' | 'H'
  >('Q');
  const [margin, setMargin] = useState(8);
  const [downloadSize, setDownloadSize] = useState<number>(1000);

  // QR Container Ref & Instance Ref
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrCodeInstanceRef = useRef<any>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate final payload string based on active tab
  const computedPayload = useMemo(() => {
    switch (activeTab) {
      case 'url':
        return url.trim() || 'https://aryalink.com';
      case 'vcard': {
        const vcardLines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${vcard.lastName || ''};${vcard.firstName || ''};;;`,
          `FN:${(vcard.firstName + ' ' + vcard.lastName).trim()}`,
          vcard.org ? `ORG:${vcard.org}` : '',
          vcard.title ? `TITLE:${vcard.title}` : '',
          vcard.phone ? `TEL;TYPE=WORK,VOICE:${vcard.phone}` : '',
          vcard.mobile ? `TEL;TYPE=CELL:${vcard.mobile}` : '',
          vcard.email ? `EMAIL:${vcard.email}` : '',
          vcard.website ? `URL:${vcard.website}` : '',
          vcard.address ? `ADR;TYPE=WORK:;;${vcard.address};;;;` : '',
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\n');
        return vcardLines;
      }
      case 'text':
        return plainText || 'AryaLink';
      case 'email': {
        const qParams: string[] = [];
        if (emailData.subject)
          qParams.push(`subject=${encodeURIComponent(emailData.subject)}`);
        if (emailData.body)
          qParams.push(`body=${encodeURIComponent(emailData.body)}`);
        return `mailto:${emailData.to || ''}${
          qParams.length ? '?' + qParams.join('&') : ''
        }`;
      }
      case 'sms': {
        const p = smsData.phone ? encodeURIComponent(smsData.phone) : '';
        const m = smsData.message ? encodeURIComponent(smsData.message) : '';
        return `smsto:${p}:${m}`;
      }
      case 'phone':
        return `tel:${phoneNumber || ''}`;
      case 'wifi': {
        const t = wifiData.encryption;
        const s = wifiData.ssid || '';
        const p = wifiData.password || '';
        const h = wifiData.hidden ? 'true' : 'false';
        return `WIFI:T:${t};S:${s};P:${p};H:${h};;`;
      }
      case 'location': {
        if (locationData.lat && locationData.lng) {
          return `https://maps.google.com/?q=${locationData.lat},${locationData.lng}`;
        }
        return `https://maps.google.com/?q=${encodeURIComponent(
          locationData.address || 'Kabul'
        )}`;
      }
      default:
        return 'https://aryalink.com';
    }
  }, [
    activeTab,
    url,
    vcard,
    plainText,
    emailData,
    smsData,
    phoneNumber,
    wifiData,
    locationData,
  ]);

  // Handle Load Profile button
  const handleLoadProfile = () => {
    loadProfile((profile) => {
      // Split name into first and last
      const nameParts = profile.displayName.trim().split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.slice(1).join(' ') || '';

      setVcard({
        firstName: fName,
        lastName: lName,
        org: profile.company || 'AryaLink Cardholder',
        title: profile.headline || '',
        phone: profile.phone || '',
        mobile: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        address: profile.location || '',
      });

      if (profile.website) {
        setUrl(profile.website);
      }
      if (profile.email) {
        setEmailData((prev) => ({ ...prev, to: profile.email }));
      }
      if (profile.phone) {
        setPhoneNumber(profile.phone);
        setSmsData((prev) => ({ ...prev, phone: profile.phone }));
      }
      if (profile.avatarUrl) {
        setLogoDataUrl(profile.avatarUrl);
      }

      // Switch to vcard tab to display rich profile
      setActiveTab('vcard');
    });
  };

  // Build options for QRCodeStyling
  const buildQrOptions = (targetSize: number = 320) => {
    const isGrad = colorMode === 'gradient';

    const dotsGradient = isGrad
      ? {
          type: gradientType,
          rotation: (gradientRotation * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: gradientColor1 },
            { offset: 1, color: gradientColor2 },
          ],
        }
      : undefined;

    return {
      width: targetSize,
      height: targetSize,
      data: computedPayload,
      margin: margin,
      image: logoDataUrl || undefined,
      qrOptions: {
        errorCorrectionLevel: logoDataUrl ? 'H' : errorCorrectionLevel,
      },
      imageOptions: {
        hideBackgroundDots: hideBehindLogo,
        imageSize: logoSize,
        margin: logoMargin,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        type: dotStyle,
        color: !isGrad ? singleColor : undefined,
        gradient: dotsGradient,
      },
      backgroundOptions: {
        color: isTransparentBg ? 'transparent' : bgColor,
      },
      cornersSquareOptions: {
        type: cornerSquareStyle,
        color: customEyeColors
          ? eyeSquareColor
          : !isGrad
          ? singleColor
          : gradientColor1,
      },
      cornersDotOptions: {
        type: cornerDotStyle,
        color: customEyeColors
          ? eyeDotColor
          : !isGrad
          ? singleColor
          : gradientColor2,
      },
    };
  };

  // Initialize qr-code-styling on mount in browser
  useEffect(() => {
    setIsClientReady(true);
    let isMounted = true;

    async function initQr() {
      if (typeof window === 'undefined') return;
      try {
        const QRCodeStylingClass = (await import('qr-code-styling')).default;
        if (!isMounted) return;

        const initialOptions = buildQrOptions(300);
        const qrInstance = new QRCodeStylingClass(initialOptions);
        qrCodeInstanceRef.current = qrInstance;

        if (qrContainerRef.current) {
          qrContainerRef.current.innerHTML = '';
          qrInstance.append(qrContainerRef.current);
        }
      } catch (err) {
        console.error('Failed to initialize QRCodeStyling:', err);
      }
    }

    initQr();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update QR code whenever config changes
  useEffect(() => {
    if (!qrCodeInstanceRef.current || !qrContainerRef.current) return;
    try {
      const updatedOpts = buildQrOptions(300);
      qrCodeInstanceRef.current.update(updatedOpts);
    } catch (err) {
      console.error('Failed to update QR Code:', err);
    }
  }, [
    computedPayload,
    dotStyle,
    cornerSquareStyle,
    cornerDotStyle,
    colorMode,
    singleColor,
    gradientColor1,
    gradientColor2,
    gradientType,
    gradientRotation,
    isTransparentBg,
    bgColor,
    customEyeColors,
    eyeSquareColor,
    eyeDotColor,
    logoDataUrl,
    logoSize,
    logoMargin,
    hideBehindLogo,
    errorCorrectionLevel,
    margin,
  ]);

  // Handle Logo Upload
  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setLogoDataUrl(dataUrl);
      // Auto upgrade error correction to H to preserve scannability
      setErrorCorrectionLevel('H');
      toast.success(
        language === 'en'
          ? 'Logo uploaded! Error correction upgraded to High (H).'
          : 'لوگو اضافه شد! سطح اصلاح خطا برای خوانایی بیشتر روی حداکثر (H) تنظیم شد.'
      );
    };
    reader.readAsDataURL(file);
  };

  // Download QR Code
  const handleDownload = async (ext: 'png' | 'svg' | 'jpeg') => {
    try {
      if (typeof window === 'undefined') return;

      const QRCodeStylingClass = (await import('qr-code-styling')).default;
      const exportInstance = new QRCodeStylingClass(
        buildQrOptions(ext === 'svg' ? 800 : downloadSize)
      );

      await exportInstance.download({
        name: `aryalink-qr-${activeTab}-${Date.now()}`,
        extension: ext,
      });

      toast.success(
        language === 'en'
          ? `QR Code downloaded as ${ext.toUpperCase()}`
          : `کد QR با فرمت ${ext.toUpperCase()} با موفقیت دانلود شد.`
      );
    } catch (err) {
      console.error('Download error:', err);
      toast.error(
        language === 'en'
          ? 'Download failed. Please try another format.'
          : 'خطا در دانلود. لطفاً فرمت دیگری را امتحان کنید.'
      );
    }
  };

  // Copy raw payload text
  const handleCopyPayload = () => {
    navigator.clipboard.writeText(computedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(
      language === 'en' ? 'Payload copied!' : 'محتوای کد در کلیپ‌بورد کپی شد!'
    );
  };

  // Reset to default
  const handleReset = () => {
    setColorMode('gradient');
    setSingleColor('#06b6d4');
    setGradientColor1('#06b6d4');
    setGradientColor2('#3b82f6');
    setDotStyle('rounded');
    setCornerSquareStyle('extra-rounded');
    setCornerDotStyle('dot');
    setIsTransparentBg(false);
    setBgColor('#ffffff');
    setCustomEyeColors(false);
    setLogoDataUrl(null);
    setMargin(8);
    setErrorCorrectionLevel('Q');
    toast.info(language === 'en' ? 'Styles reset to defaults.' : 'تنظیمات ظاهری بازنشانی شدند.');
  };

  // Preset Colors
  const colorPresets = [
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Slate', hex: '#0f172a' },
  ];

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-6">
          <Link
            href="/"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            {language === 'en' ? 'Home' : 'صفحه اصلی'}
          </Link>
          {isRtl ? (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          )}
          <span className="text-slate-300 font-medium">
            {language === 'en'
              ? 'Digital Toolbox'
              : language === 'ps'
              ? 'ډیجیټل اوزار بکس'
              : 'جعبه ابزار دیجیتال'}
          </span>
          {isRtl ? (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          )}
          <span className="text-cyan-400 font-semibold">
            {language === 'en'
              ? 'Advanced QR Code Generator'
              : language === 'ps'
              ? 'پرمختللی QR کوډ جوړونکی'
              : 'کیوآر کد ساز پیشرفته'}
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'en'
                  ? 'Ultra HD & Vector Vector Graphics'
                  : language === 'ps'
                  ? 'لوړ کیفیت او مسلکي ډیزاین'
                  : 'کیفیت فوق‌العاده چاپی و گرافیک برداری'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10">
                <QrCode className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              {language === 'en'
                ? 'Advanced QR Code Generator'
                : language === 'ps'
                ? 'د مسلکي او پرمختللو QR کوډونو جوړول'
                : 'کیوآر کد ساز فوق پیشرفته'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              {language === 'en'
                ? 'Create custom, high-resolution QR codes with custom gradients, shapes, center logo upload, and vector export (SVG, PNG, JPG).'
                : language === 'ps'
                ? 'د رنګین ګریډینټ، ځانګړو اشکالو، لوګو او لوړ کیفیت سره د ټولو بڼو (وېب پاڼه، اړیکه، وای فای او نور) لپاره مسلکي QR کوډ جوړ کړئ.'
                : 'ساخت کدهای QR با گرادیان‌های رنگی، اشکال هندسی مدرن، قرار دادن لوگو در مرکز و دانلود وکتور با کیفیت چاپی بالا (SVG، PNG و JPG).'}
            </p>
          </div>

          {/* Quick Action: Load My Profile */}
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
              className="border-slate-700/80 hover:bg-slate-800 text-slate-300 rounded-xl px-3.5"
              title={language === 'en' ? 'Reset styles' : 'بازنشانی استایل'}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Grid: Left Config Tabs & Form | Right Sticky Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Content Tabs + Design Customizers */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Content Type Tabs */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  {language === 'en'
                    ? 'Step 1: Choose Content Type'
                    : language === 'ps'
                    ? 'لومړی ګام: د کوډ محتوا وټاکئ'
                    : 'مرحله 1: نوع محتوا را انتخاب کنید'}
                </span>
                <span className="text-xs text-slate-400">
                  {activeTab.toUpperCase()}
                </span>
              </div>

              {/* Tabs Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'url' as ContentTab,
                    label: language === 'en' ? 'Website' : 'لینک وب‌سایت',
                    icon: Link2,
                  },
                  {
                    id: 'vcard' as ContentTab,
                    label: language === 'en' ? 'vCard Contact' : 'کارت مخاطب (vCard)',
                    icon: User,
                  },
                  {
                    id: 'text' as ContentTab,
                    label: language === 'en' ? 'Text' : 'متن ساده',
                    icon: FileText,
                  },
                  {
                    id: 'email' as ContentTab,
                    label: language === 'en' ? 'Email' : 'ارسال ایمیل',
                    icon: Mail,
                  },
                  {
                    id: 'sms' as ContentTab,
                    label: language === 'en' ? 'SMS' : 'پیامک (SMS)',
                    icon: MessageSquare,
                  },
                  {
                    id: 'phone' as ContentTab,
                    label: language === 'en' ? 'Call' : 'تماس تلفنی',
                    icon: Phone,
                  },
                  {
                    id: 'wifi' as ContentTab,
                    label: language === 'en' ? 'Wi-Fi' : 'اتصال وای‌فای',
                    icon: Wifi,
                  },
                  {
                    id: 'location' as ContentTab,
                    label: language === 'en' ? 'Location' : 'موقعیت مکانی',
                    icon: MapPin,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Form Content */}
              <div className="mt-6 pt-6 border-t border-slate-800/80">
                {/* 1. URL TAB */}
                {activeTab === 'url' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en'
                        ? 'Target Web Address (URL)'
                        : 'آدرس اینترنتی (URL)'}
                    </label>
                    <div className="relative">
                      <Link2 className="absolute top-3 start-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://aryalink.com/your-name"
                        className="w-full ps-10 pe-4 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {language === 'en'
                        ? 'Anyone scanning this QR code will directly open this page in their browser.'
                        : 'اسکن این کد، کاربر را مستقیماً به آدرس فوق در مرورگر هدایت می‌کند.'}
                    </p>
                  </div>
                )}

                {/* 2. VCARD TAB */}
                {activeTab === 'vcard' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        {language === 'en'
                          ? 'Contact Card Information (vCard 3.0)'
                          : 'اطلاعات کارت مخاطب الکترونیکی'}
                      </span>
                      <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                        {language === 'en' ? 'Direct phone import' : 'ذخیره خودکار در دفترچه تلفن'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'First Name' : 'نام'}
                        </label>
                        <input
                          type="text"
                          value={vcard.firstName}
                          onChange={(e) =>
                            setVcard({ ...vcard, firstName: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Last Name' : 'نام خانوادگی'}
                        </label>
                        <input
                          type="text"
                          value={vcard.lastName}
                          onChange={(e) =>
                            setVcard({ ...vcard, lastName: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Company / Organization' : 'نام سازمان یا شرکت'}
                        </label>
                        <input
                          type="text"
                          value={vcard.org}
                          onChange={(e) =>
                            setVcard({ ...vcard, org: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Job Title' : 'عنوان شغلی'}
                        </label>
                        <input
                          type="text"
                          value={vcard.title}
                          onChange={(e) =>
                            setVcard({ ...vcard, title: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Work Phone' : 'تلفن ثابت یا کار'}
                        </label>
                        <input
                          type="tel"
                          value={vcard.phone}
                          onChange={(e) =>
                            setVcard({ ...vcard, phone: e.target.value })
                          }
                          placeholder="+93..."
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Mobile / WhatsApp' : 'شماره موبایل یا واتساپ'}
                        </label>
                        <input
                          type="tel"
                          value={vcard.mobile}
                          onChange={(e) =>
                            setVcard({ ...vcard, mobile: e.target.value })
                          }
                          placeholder="+93..."
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
                          value={vcard.email}
                          onChange={(e) =>
                            setVcard({ ...vcard, email: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Website or Bio Link' : 'وب‌سایت یا لینک کارت دیجیتال'}
                        </label>
                        <input
                          type="url"
                          value={vcard.website}
                          onChange={(e) =>
                            setVcard({ ...vcard, website: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {language === 'en' ? 'Address / Location' : 'آدرس دفتر یا محل کار'}
                      </label>
                      <input
                        type="text"
                        value={vcard.address}
                        onChange={(e) =>
                          setVcard({ ...vcard, address: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 3. TEXT TAB */}
                {activeTab === 'text' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en' ? 'Plain Text Message' : 'متن پیام یا توضیحات'}
                    </label>
                    <textarea
                      rows={4}
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      placeholder="متن دلخواه خود را بنویسید..."
                      className="w-full p-3 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>
                )}

                {/* 4. EMAIL TAB */}
                {activeTab === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {language === 'en' ? 'Recipient Email' : 'ایمیل دریافت‌کننده'}
                      </label>
                      <input
                        type="email"
                        value={emailData.to}
                        onChange={(e) =>
                          setEmailData({ ...emailData, to: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {language === 'en' ? 'Subject' : 'موضوع ایمیل'}
                      </label>
                      <input
                        type="text"
                        value={emailData.subject}
                        onChange={(e) =>
                          setEmailData({ ...emailData, subject: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {language === 'en' ? 'Pre-filled Body' : 'متن پیش‌فرض ایمیل'}
                      </label>
                      <textarea
                        rows={3}
                        value={emailData.body}
                        onChange={(e) =>
                          setEmailData({ ...emailData, body: e.target.value })
                        }
                        className="w-full p-3 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 5. SMS TAB */}
                {activeTab === 'sms' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {language === 'en' ? 'Phone Number' : 'شماره دریافت‌کننده پیامک'}
                      </label>
                      <input
                        type="tel"
                        value={smsData.phone}
                        onChange={(e) =>
                          setSmsData({ ...smsData, phone: e.target.value })
                        }
                        placeholder="+93..."
                        className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {language === 'en' ? 'SMS Body' : 'متن پیامک'}
                      </label>
                      <textarea
                        rows={3}
                        value={smsData.message}
                        onChange={(e) =>
                          setSmsData({ ...smsData, message: e.target.value })
                        }
                        className="w-full p-3 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 6. PHONE TAB */}
                {activeTab === 'phone' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en' ? 'Phone Number' : 'شماره تماس مستقیم'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute top-3 start-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+93700123456"
                        className="w-full ps-10 pe-4 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {language === 'en'
                        ? 'Scanning instantly opens the dialer with this number.'
                        : 'پس از اسکن، صفحه شماره‌گیر گوشی کاربر به طور خودکار باز می‌شود.'}
                    </p>
                  </div>
                )}

                {/* 7. WIFI TAB */}
                {activeTab === 'wifi' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Network Name (SSID)' : 'نام شبکه (SSID)'}
                        </label>
                        <input
                          type="text"
                          value={wifiData.ssid}
                          onChange={(e) =>
                            setWifiData({ ...wifiData, ssid: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Password' : 'رمز عبور وای‌فای'}
                        </label>
                        <input
                          type="text"
                          value={wifiData.password}
                          onChange={(e) =>
                            setWifiData({ ...wifiData, password: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">
                          {language === 'en' ? 'Security:' : 'نوع رمزنگاری:'}
                        </label>
                        {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                          <button
                            key={enc}
                            type="button"
                            onClick={() =>
                              setWifiData({ ...wifiData, encryption: enc })
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              wifiData.encryption === enc
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {enc === 'nopass' ? 'None (Open)' : enc}
                          </button>
                        ))}
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={wifiData.hidden}
                          onChange={(e) =>
                            setWifiData({ ...wifiData, hidden: e.target.checked })
                          }
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                        />
                        <span>
                          {language === 'en' ? 'Hidden Network' : 'شبکه پنهان (Hidden SSID)'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 8. LOCATION TAB */}
                {activeTab === 'location' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Latitude' : 'عرض جغرافیایی (Latitude)'}
                        </label>
                        <input
                          type="text"
                          value={locationData.lat}
                          onChange={(e) =>
                            setLocationData({
                              ...locationData,
                              lat: e.target.value,
                            })
                          }
                          placeholder="34.5281"
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          {language === 'en' ? 'Longitude' : 'طول جغرافیایی (Longitude)'}
                        </label>
                        <input
                          type="text"
                          value={locationData.lng}
                          onChange={(e) =>
                            setLocationData({
                              ...locationData,
                              lng: e.target.value,
                            })
                          }
                          placeholder="69.1723"
                          className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        {language === 'en'
                          ? 'Or Search Address / Title'
                          : 'یا آدرس / نام مکان در نقشه'}
                      </label>
                      <input
                        type="text"
                        value={locationData.address}
                        onChange={(e) =>
                          setLocationData({
                            ...locationData,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Visual Styling & Design System */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                  <Palette className="w-4 h-4" />
                  {language === 'en'
                    ? 'Step 2: Shapes & Color Customization'
                    : language === 'ps'
                    ? 'دویم ګام: رنګونه او اشکال'
                    : 'مرحله 2: شخصی‌سازی اشکال، رنگ و قالب'}
                </span>
                <span className="text-xs text-slate-400">
                  {colorMode === 'gradient'
                    ? language === 'en'
                      ? 'Gradient'
                      : 'گرادیان مدرن'
                    : language === 'en'
                    ? 'Single Color'
                    : 'تک‌رنگ'}
                </span>
              </div>

              {/* Dots Shape Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'en' ? 'Dot Pattern Style' : 'شکل نقاط داخلی (Dot Pattern)'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(
                    [
                      { id: 'rounded', label: 'Rounded' },
                      { id: 'dots', label: 'Dots' },
                      { id: 'classy', label: 'Classy' },
                      { id: 'classy-rounded', label: 'Classy-R' },
                      { id: 'square', label: 'Square' },
                      { id: 'extra-rounded', label: 'Extra-R' },
                    ] as const
                  ).map((pattern) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => setDotStyle(pattern.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        dotStyle === pattern.id
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pattern.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Eye Shapes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {language === 'en'
                      ? 'Corner Squares (Outer Eye)'
                      : 'فریم چشم‌های گوشه (Outer Eye)'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'extra-rounded', label: 'Extra Round' },
                        { id: 'dot', label: 'Circle' },
                        { id: 'square', label: 'Square' },
                      ] as const
                    ).map((shape) => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setCornerSquareStyle(shape.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                          cornerSquareStyle === shape.id
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {shape.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {language === 'en'
                      ? 'Corner Dots (Inner Eye)'
                      : 'نقطه مرکزی چشم‌ها (Inner Dot)'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'dot', label: 'Circle / Dot' },
                        { id: 'square', label: 'Square' },
                      ] as const
                    ).map((dot) => (
                      <button
                        key={dot.id}
                        type="button"
                        onClick={() => setCornerDotStyle(dot.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                          cornerDotStyle === dot.id
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {dot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Mode Switcher */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-slate-300">
                    {language === 'en' ? 'Color Configuration' : 'پالت رنگی کدهای QR'}
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setColorMode('gradient')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        colorMode === 'gradient'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {language === 'en' ? 'Gradient' : 'گرادیان دو رنگ'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorMode('single')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        colorMode === 'single'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {language === 'en' ? 'Single Color' : 'تک رنگ'}
                    </button>
                  </div>
                </div>

                {colorMode === 'gradient' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Gradient Color 1 */}
                      <div>
                        <span className="block text-xs text-slate-400 mb-1.5">
                          {language === 'en' ? 'Start Color' : 'رنگ آغازین گرادیان'}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={gradientColor1}
                            onChange={(e) => setGradientColor1(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-slate-700"
                          />
                          <input
                            type="text"
                            value={gradientColor1}
                            onChange={(e) => setGradientColor1(e.target.value)}
                            className="w-28 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Gradient Color 2 */}
                      <div>
                        <span className="block text-xs text-slate-400 mb-1.5">
                          {language === 'en' ? 'End Color' : 'رنگ پایانی گرادیان'}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={gradientColor2}
                            onChange={(e) => setGradientColor2(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-slate-700"
                          />
                          <input
                            type="text"
                            value={gradientColor2}
                            onChange={(e) => setGradientColor2(e.target.value)}
                            className="w-28 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Type & Rotation Slider */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {language === 'en' ? 'Type:' : 'نوع:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGradientType('linear')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            gradientType === 'linear'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          {language === 'en' ? 'Linear' : 'خطی (Linear)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setGradientType('radial')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            gradientType === 'radial'
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          {language === 'en' ? 'Radial' : 'دایره‌ای (Radial)'}
                        </button>
                      </div>

                      {gradientType === 'linear' && (
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          <span className="text-xs text-slate-400 shrink-0">
                            {language === 'en' ? 'Angle:' : 'زاویه:'}{' '}
                            <span className="font-mono text-cyan-400">
                              {gradientRotation}°
                            </span>
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={gradientRotation}
                            onChange={(e) =>
                              setGradientRotation(Number(e.target.value))
                            }
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="color"
                        value={singleColor}
                        onChange={(e) => setSingleColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-slate-700"
                      />
                      <input
                        type="text"
                        value={singleColor}
                        onChange={(e) => setSingleColor(e.target.value)}
                        className="w-28 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    {/* Palette Presets */}
                    <div className="flex flex-wrap gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setSingleColor(preset.hex)}
                          className="w-7 h-7 rounded-lg border border-white/20 transition-transform hover:scale-110"
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Background Options */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    {language === 'en' ? 'Background Color:' : 'رنگ پس‌زمینه:'}
                  </span>
                  {!isTransparentBg && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                      />
                      <span className="text-xs font-mono text-slate-400">
                        {bgColor}
                      </span>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isTransparentBg}
                    onChange={(e) => setIsTransparentBg(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>
                    {language === 'en'
                      ? 'Transparent Background (PNG / SVG)'
                      : 'پس‌زمینه کاملاً شفاف (بدون رنگ سفید)'}
                  </span>
                </label>
              </div>

              {/* Custom Eye Colors Toggle */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={customEyeColors}
                      onChange={(e) => setCustomEyeColors(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>
                      {language === 'en'
                        ? 'Custom Eye Colors (Corners)'
                        : 'رنگ‌بندی مجزای چشم‌های گوشه (Corners)'}
                    </span>
                  </label>
                </div>

                {customEyeColors && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">
                        {language === 'en' ? 'Outer Corner Frame' : 'فریم بیرونی گوشه‌ها'}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={eyeSquareColor}
                          onChange={(e) => setEyeSquareColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                        />
                        <span className="text-xs font-mono text-slate-400">
                          {eyeSquareColor}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">
                        {language === 'en' ? 'Inner Corner Dot' : 'نقطه مرکزی چشم‌ها'}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={eyeDotColor}
                          onChange={(e) => setEyeDotColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                        />
                        <span className="text-xs font-mono text-slate-400">
                          {eyeDotColor}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Logo Upload & Advanced Settings */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  {language === 'en'
                    ? 'Step 3: Center Logo & Advanced'
                    : language === 'ps'
                    ? 'دریم ګام: لوګو او پرمختللي تنظیمات'
                    : 'مرحله 3: قرار دادن لوگو در مرکز و تنظیمات پیشرفته'}
                </span>
                {logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoDataUrl(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Remove Logo' : 'حذف لوگو'}
                  </button>
                )}
              </div>

              {/* Logo Uploader */}
              <div>
                {!logoDataUrl ? (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl bg-slate-950/40 cursor-pointer transition-colors group">
                    <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors mb-2" />
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300">
                      {language === 'en'
                        ? 'Click or drag logo image here (PNG, SVG, JPG)'
                        : 'جهت بارگذاری لوگو در مرکز کیوآر کد اینجا کلیک کنید'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      {language === 'en'
                        ? 'Recommended: Transparent PNG with high contrast'
                        : 'پیشنهاد: تصویر PNG با پس‌زمینه شفاف'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFile}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoDataUrl}
                        alt="Center Logo Preview"
                        className="w-14 h-14 object-contain rounded-lg border border-slate-700 bg-white/10 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-200 block truncate">
                          {language === 'en' ? 'Logo Loaded' : 'لوگو با موفقیت اضافه شد'}
                        </span>
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" />
                          {language === 'en'
                            ? 'Error correction upgraded to High (H)'
                            : 'اصلاح خطا روی حداکثر تنظیم شد'}
                        </span>
                      </div>
                      <label className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer">
                        {language === 'en' ? 'Change' : 'تغییر'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFile}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Logo Size and Margin Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{language === 'en' ? 'Logo Size' : 'اندازه لوگو'}</span>
                          <span className="font-mono text-cyan-400">
                            {Math.round(logoSize * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.15"
                          max="0.45"
                          step="0.05"
                          value={logoSize}
                          onChange={(e) => setLogoSize(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>
                            {language === 'en' ? 'Logo Padding' : 'حاشیه امن لوگو'}
                          </span>
                          <span className="font-mono text-cyan-400">
                            {logoMargin}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={logoMargin}
                          onChange={(e) => setLogoMargin(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={hideBehindLogo}
                        onChange={(e) => setHideBehindLogo(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>
                        {language === 'en'
                          ? 'Hide QR dots behind the logo (Clean look)'
                          : 'پنهان کردن نقاط کیوآر کد در زیر لوگو جهت خوانایی تمیزتر'}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Advanced Settings Accordion / Details */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {language === 'en'
                      ? 'Error Correction Level'
                      : 'سطح بازیابی خطای اسکن (Error Correction)'}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: 'L', label: 'L (7%)' },
                        { id: 'M', label: 'M (15%)' },
                        { id: 'Q', label: 'Q (25%)' },
                        { id: 'H', label: 'H (30%)' },
                      ] as const
                    ).map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setErrorCorrectionLevel(lvl.id)}
                        className={`py-1 rounded-lg text-xs font-medium border text-center transition-colors ${
                          errorCorrectionLevel === lvl.id
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>
                      {language === 'en' ? 'Outer Margin' : 'حاشیه سفید بیرونی'}
                    </span>
                    <span className="font-mono text-cyan-400">{margin}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="2"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sticky Live Render & High-Res Download Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              {/* Subtle top ambient indicator */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  {language === 'en'
                    ? 'Live Real-Time Preview'
                    : language === 'ps'
                    ? 'د ژوندۍ کتلو ساحه'
                    : 'پیش‌نمایش زنده و آماده اسکن'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  {language === 'en' ? 'Active' : 'فعال'}
                </span>
              </div>

              {/* QR Render Box */}
              <div className="relative flex items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner min-h-[340px]">
                {/* Visual checkboard pattern behind transparent QR */}
                {isTransparentBg && (
                  <div
                    className="absolute inset-4 rounded-xl opacity-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(#94a3b8 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                    }}
                  />
                )}

                <div
                  ref={qrContainerRef}
                  className="transition-transform duration-200 hover:scale-105 flex items-center justify-center"
                />
              </div>

              {/* Payload Summary Info */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">
                    {language === 'en' ? 'Payload Target' : 'محتوای خروجی'}
                  </span>
                  <span className="text-slate-200 font-mono truncate block text-xs">
                    {computedPayload}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                  title={language === 'en' ? 'Copy payload' : 'کپی متن محتوا'}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Export Resolution Selector */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium">
                    {language === 'en'
                      ? 'Download Resolution (Raster)'
                      : 'کیفیت دانلود (PNG / JPG):'}
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    {downloadSize} x {downloadSize} px
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { size: 500, label: '500px (Web)' },
                    { size: 1000, label: '1000px (HD)' },
                    { size: 2000, label: '2000px (Print)' },
                  ].map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => setDownloadSize(item.size)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-medium border transition-colors ${
                        downloadSize === item.size
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Buttons: SVG (Vector) + PNG + JPG */}
              <div className="mt-5 space-y-2.5">
                {/* SVG Vector (Primary for Designers / Print) */}
                <Button
                  type="button"
                  onClick={() => handleDownload('svg')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {language === 'en'
                      ? 'Download SVG (Vector Graphics)'
                      : language === 'ps'
                      ? 'د SVG برداري بڼه ډاونلوډ'
                      : 'دانلود وکتور SVG (بدون افت کیفیت جهت چاپ)'}
                  </span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDownload('png')}
                    className="py-2.5 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>PNG (شفاف / HD)</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDownload('jpeg')}
                    className="py-2.5 rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200 font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>JPG (استاندارد)</span>
                  </Button>
                </div>
              </div>

              {/* Security & Standard Note */}
              <p className="mt-4 text-[11px] text-slate-500 text-center leading-relaxed">
                {language === 'en'
                  ? 'All QR codes generated here are 100% static and private. They function forever without expiration or third-party redirection.'
                  : 'تمام کدهای تولیدشده 100% استاتیک و ایمن هستند؛ بدون تاریخ انقضا و بدون وابستگی به هیچ سرور واسطه‌ای همیشه کار می‌کنند.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global CTA Banner at bottom */}
        <ToolsCtaBanner />
      </div>
    </div>
  );
}
