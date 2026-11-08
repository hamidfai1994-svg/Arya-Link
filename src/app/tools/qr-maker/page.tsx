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
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useProfileLoader } from '@/components/tools/useProfileLoader';
import { ToolsCtaBanner } from '@/components/tools/ToolsCtaBanner';
import { CodeScanner } from '@/components/tools/CodeScanner';
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

export type FrameStyle =
  | 'none'
  | 'bottom-banner'
  | 'top-banner'
  | 'rounded-banner'
  | 'phone'
  | 'clipboard';

const toSvgDataUrl = (svgStr: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;

const PRESET_LOGOS = [
  {
    id: 'link',
    label: 'Link',
    bg: '#8b5cf6',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#8b5cf6"/><path d="M42 58a12 12 0 0 0 17 0l8-8a12 12 0 0 0-17-17l-4 4" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M58 42a12 12 0 0 0-17 0l-8 8a12 12 0 0 0 17 17l4-4" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`,
  },
  {
    id: 'location',
    label: 'Location',
    bg: '#ef4444',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#ef4444"/><path d="M50 26a16 16 0 0 0-16 16c0 12 16 32 16 32s16-20 16-32a16 16 0 0 0-16-16zm0 22a6 6 0 1 1 6-6 6 6 0 0 1-6 6z" fill="#ffffff"/></svg>`,
  },
  {
    id: 'email',
    label: 'Email',
    bg: '#f59e0b',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#f59e0b"/><rect x="26" y="33" width="48" height="34" rx="6" fill="#ffffff"/><path d="M28 36l22 16 22-16" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    bg: '#22c55e',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#22c55e"/><path d="M50 24a26 26 0 0 0-22 39.5L25 76l13-3.4A26 26 0 1 0 50 24z" fill="#ffffff"/><path d="M60 55c-.8 2.2-3.8 4-5.3 4.2-1.5.3-3.4.4-11-2.8-9.2-3.8-15-13.4-15.5-14-.5-.6-3.8-5-3.8-9.6s2.4-6.8 3.3-7.7c.9-.9 1.9-1.1 2.5-1.1s1.3 0 1.8.1c.6 0 1.4-.2 2.2 1.7.8 1.9 2.7 6.6 2.9 7.1.3.5.4 1.1.1 1.7-.3.7-.6 1-1.1 1.6-.6.6-1.1 1.1-1.6 1.7-.5.5-.9 1.1-.4 2 2.1 3.7 4.7 6.4 8.5 8.5.9.5 1.5.1 2-.4.6-.5 1.1-1.1 1.7-1.6.6-.5 1.2-.4 1.8-.1.7.3 4.2 2 4.9 2.3.7.4 1.2.6 1.4.9.2.4.2 2.1-.6 4.3z" fill="#22c55e"/></svg>`,
  },
  {
    id: 'wifi',
    label: 'WiFi',
    bg: '#3b82f6',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#3b82f6"/><path d="M30 40a28 28 0 0 1 40 0M37 49a18 18 0 0 1 26 0M44 58a8 8 0 0 1 12 0" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="50" cy="69" r="4" fill="#ffffff"/></svg>`,
  },
  {
    id: 'vcard',
    label: 'Contact',
    bg: '#1e40af',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#1e40af"/><rect x="25" y="32" width="50" height="36" rx="5" fill="#ffffff"/><circle cx="40" cy="46" r="6" fill="#1e40af"/><rect x="52" y="42" width="16" height="3" rx="1.5" fill="#1e40af"/><rect x="52" y="49" width="11" height="3" rx="1.5" fill="#1e40af"/><path d="M32 59c0-4 4-6 8-6s8 2 8 6" fill="#1e40af"/></svg>`,
  },
  {
    id: 'paypal',
    label: 'PayPal',
    bg: '#0284c7',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#0284c7"/><path d="M38 72l6-38h15c7 0 11 3 10 9-1 5-4 8-9 8h-5l-3 21h-9z" fill="#ffffff"/><path d="M46 64l4-24h12c5 0 9 2 8 7-1 5-3 7-8 7h-4l-3 18h-9z" fill="#bae6fd"/></svg>`,
  },
  {
    id: 'bitcoin',
    label: 'Bitcoin',
    bg: '#f97316',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#f97316"/><path d="M57 45c4-1 6-4 5-8-1-5-6-7-11-7h-11v38h13c6 0 11-2 11-8 0-4-3-7-7-8zm-11-9h5c3 0 5 1 5 4s-2 4-5 4h-5v-8zm6 24h-6v-9h6c3 0 6 1 6 4.5s-3 4.5-6 4.5z" fill="#ffffff"/><path d="M47 24v4M53 24v4M47 70v4M53 70v4" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
];

const PRESET_BADGES = [
  {
    id: 'scanme_bracket',
    label: '[SCAN ME]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="#ffffff" rx="10"/><path d="M22 36V22h14M78 36V22H64M22 64v14h14M78 64v14H64" stroke="#000000" stroke-width="6" stroke-linecap="round" fill="none"/><text x="50" y="44" font-family="sans-serif" font-weight="900" font-size="16" fill="#000000" text-anchor="middle">SCAN</text><text x="50" y="66" font-family="sans-serif" font-weight="900" font-size="20" fill="#000000" text-anchor="middle">ME</text></svg>`,
  },
  {
    id: 'scanme_badge',
    label: 'SCAN ME',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="#ffffff" rx="10"/><rect x="8" y="24" width="84" height="52" rx="8" fill="#000000"/><text x="50" y="48" font-family="sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle" letter-spacing="1">SCAN</text><text x="50" y="67" font-family="sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="2">ME</text></svg>`,
  },
  {
    id: 'qr_badge',
    label: 'QR Scanner',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="#ffffff" rx="10"/><path d="M25 35V25h10M75 35V25H65M25 65v10h10M75 65v10H65" stroke="#000000" stroke-width="5" stroke-linecap="round" fill="none"/><rect x="36" y="36" width="12" height="12" fill="#000000"/><rect x="52" y="36" width="12" height="12" fill="#000000"/><rect x="36" y="52" width="12" height="12" fill="#000000"/><rect x="52" y="52" width="12" height="12" fill="#000000"/></svg>`,
  },
  {
    id: 'barcode_badge',
    label: 'Barcode',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="#ffffff" rx="10"/><path d="M20 30v40M27 30v40M37 30v40M42 30v40M49 30v40M59 30v40M64 30v40M74 30v40M80 30v40" stroke="#000000" stroke-width="4" stroke-linecap="square"/></svg>`,
  },
];

export default function AdvancedQrMakerPage() {
  const { dir, language } = useLanguage();
  const isRtl = dir === 'rtl';
  const { loadProfile, isLoading: isProfileLoading } = useProfileLoader();

  // Top-Level Mode Tab: Generator vs Scanner
  const [mainViewMode, setMainViewMode] = useState<'generator' | 'scanner'>('generator');

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

  // Design Tab: 'frame' | 'shape' | 'logo' (Step 2)
  const [designTab, setDesignTab] = useState<'frame' | 'shape' | 'logo'>('shape');

  // Styling States - Default: Pure Black #000000, Square Dots, Square Outer Eye, Square Inner Dot
  const [dotStyle, setDotStyle] = useState<DotStyle>('square');
  const [cornerSquareStyle, setCornerSquareStyle] =
    useState<CornerSquareStyle>('square');
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotStyle>('square');

  // Frame States
  const [frameStyle, setFrameStyle] = useState<
    'none' | 'bottom-banner' | 'top-banner' | 'rounded-banner' | 'phone' | 'clipboard'
  >('none');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#000000');

  // Colors - Default: Single color Pure Black #000000
  const [colorMode, setColorMode] = useState<'single' | 'gradient'>('single');
  const [singleColor, setSingleColor] = useState('#000000');
  const [gradientColor1, setGradientColor1] = useState('#000000');
  const [gradientColor2, setGradientColor2] = useState('#000000');
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientRotation, setGradientRotation] = useState(45);

  // Background
  const [isTransparentBg, setIsTransparentBg] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');

  // Eye custom colors
  const [customEyeColors, setCustomEyeColors] = useState(false);
  const [eyeSquareColor, setEyeSquareColor] = useState('#000000');
  const [eyeDotColor, setEyeDotColor] = useState('#000000');

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

  // Reset to default - Pure Black #000000, Square
  const handleReset = () => {
    setColorMode('single');
    setSingleColor('#000000');
    setGradientColor1('#000000');
    setGradientColor2('#000000');
    setDotStyle('square');
    setCornerSquareStyle('square');
    setCornerDotStyle('square');
    setIsTransparentBg(false);
    setBgColor('#ffffff');
    setCustomEyeColors(false);
    setEyeSquareColor('#000000');
    setEyeDotColor('#000000');
    setLogoDataUrl(null);
    setFrameStyle('none');
    setFrameText('SCAN ME');
    setFrameColor('#000000');
    setMargin(8);
    setErrorCorrectionLevel('Q');
    toast.info(language === 'en' ? 'Styles reset to defaults.' : 'تنظیمات ظاهری به حالت پیش‌فرض بازنشانی شدند.');
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

        {/* Top-Level Mode Navigation: Generator vs Scanner */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mb-8 max-w-md">
          <button
            type="button"
            onClick={() => setMainViewMode('generator')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mainViewMode === 'generator'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>
              {language === 'en'
                ? 'QR Generator'
                : language === 'ps'
                ? 'QR جوړونکی'
                : 'سازنده کیوآر کد'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMainViewMode('scanner')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mainViewMode === 'scanner'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>
              {language === 'en'
                ? 'QR Scanner'
                : language === 'ps'
                ? 'QR سکینر'
                : 'اسکنر کیوآر کد'}
            </span>
          </button>
        </div>

        {mainViewMode === 'generator' ? (
          /* Main Grid: Left Config Tabs & Form | Right Sticky Live Preview */
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

            {/* Step 2: Visual Styling & Design System - 3 Dedicated Tabs: Frame, Shape, Logo */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
              {/* Top Tabs: Frame | Shape | Logo (Exact Match to Reference Screenshots) */}
              <div className="flex items-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDesignTab('frame')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    designTab === 'frame'
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  فریم (Frame)
                </button>
                <button
                  type="button"
                  onClick={() => setDesignTab('shape')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    designTab === 'shape'
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  شکل (Shape)
                </button>
                <button
                  type="button"
                  onClick={() => setDesignTab('logo')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    designTab === 'logo'
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  لوگو (Logo)
                </button>
              </div>

              {/* TAB 1: FRAME */}
              {designTab === 'frame' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-3">
                      انتخاب قالب و فریم کیوآر کد (Frame Style):
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {/* Frame 1: None (X) */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('none')}
                        className={`aspect-square p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          frameStyle === 'none'
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                        title="بدون فریم"
                      >
                        <X className="w-6 h-6 stroke-[2.5]" />
                        <span className="text-[10px] font-medium">None</span>
                      </button>

                      {/* Frame 2: Bottom Banner */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('bottom-banner')}
                        className={`aspect-square p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          frameStyle === 'bottom-banner'
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                        title="بنر پایین"
                      >
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <rect x="5" y="4" width="30" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                          <rect x="10" y="8" width="20" height="18" fill="currentColor" fillOpacity="0.4" />
                          <rect x="5" y="27" width="30" height="9" fill="currentColor" />
                          <text x="20" y="33.5" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN</text>
                        </svg>
                        <span className="text-[10px] font-medium">Bottom</span>
                      </button>

                      {/* Frame 3: Top Banner */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('top-banner')}
                        className={`aspect-square p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          frameStyle === 'top-banner'
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                        title="بنر بالا"
                      >
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <rect x="5" y="4" width="30" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                          <rect x="5" y="4" width="30" height="9" fill="currentColor" />
                          <text x="20" y="10.5" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN</text>
                          <rect x="10" y="14" width="20" height="18" fill="currentColor" fillOpacity="0.4" />
                        </svg>
                        <span className="text-[10px] font-medium">Top</span>
                      </button>

                      {/* Frame 4: Rounded Banner */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('rounded-banner')}
                        className={`aspect-square p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          frameStyle === 'rounded-banner'
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                        title="بج گرد"
                      >
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <rect x="5" y="4" width="30" height="32" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="10" y="8" width="20" height="18" rx="2" fill="currentColor" fillOpacity="0.4" />
                          <rect x="9" y="27" width="22" height="7" rx="3.5" fill="currentColor" />
                          <text x="20" y="32" fontSize="4" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN</text>
                        </svg>
                        <span className="text-[10px] font-medium">Badge</span>
                      </button>

                      {/* Frame 5: Phone */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('phone')}
                        className={`aspect-square p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          frameStyle === 'phone'
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                        title="موبایل"
                      >
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <rect x="7" y="3" width="26" height="34" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
                          <rect x="15" y="5.5" width="10" height="1.5" rx="0.75" fill="currentColor" />
                          <rect x="10" y="9" width="20" height="20" rx="1" fill="currentColor" fillOpacity="0.4" />
                          <circle cx="20" cy="33" r="1.5" fill="currentColor" />
                        </svg>
                        <span className="text-[10px] font-medium">Phone</span>
                      </button>

                      {/* Frame 6: Clipboard */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('clipboard')}
                        className={`aspect-square p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          frameStyle === 'clipboard'
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                        title="تخته‌شاسی"
                      >
                        <svg viewBox="0 0 40 40" className="w-8 h-8">
                          <rect x="6" y="6" width="28" height="31" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          <rect x="13" y="3" width="14" height="5" rx="1.5" fill="currentColor" />
                          <rect x="10" y="11" width="20" height="20" rx="1" fill="currentColor" fillOpacity="0.4" />
                        </svg>
                        <span className="text-[10px] font-medium">Clip</span>
                      </button>
                    </div>
                  </div>

                  {/* Frame Text & Color Settings (Active when frame is not 'none') */}
                  {frameStyle !== 'none' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 animate-in fade-in">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                          متن داخل فریم (Frame Label):
                        </label>
                        <input
                          type="text"
                          value={frameText}
                          onChange={(e) => setFrameText(e.target.value)}
                          placeholder="SCAN ME"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-white focus:outline-none uppercase font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                          رنگ فریم (Frame Color):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={frameColor}
                            onChange={(e) => setFrameColor(e.target.value)}
                            className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border border-slate-700 shrink-0"
                          />
                          <input
                            type="text"
                            value={frameColor}
                            onChange={(e) => setFrameColor(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SHAPE (Exact match to Reference Screenshot 2) */}
              {designTab === 'shape' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300">
                      Shape & Color
                    </span>
                  </div>

                  {/* 1. Shape Style (Dots) */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-medium text-slate-400">
                      Shape style (شکل نقاط داخلی):
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {(
                        [
                          { id: 'square', label: 'Square' },
                          { id: 'dots', label: 'Dots' },
                          { id: 'rounded', label: 'Rounded' },
                          { id: 'classy', label: 'Classy' },
                          { id: 'classy-rounded', label: 'Classy-R' },
                          { id: 'extra-rounded', label: 'Extra-R' },
                        ] as const
                      ).map((pattern) => {
                        const isSelected = dotStyle === pattern.id;
                        return (
                          <button
                            key={pattern.id}
                            type="button"
                            onClick={() => setDotStyle(pattern.id)}
                            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30 font-bold'
                                : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                            }`}
                            title={pattern.label}
                          >
                            {pattern.id === 'square' ? (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <rect x="6" y="6" width="7" height="7" fill="currentColor" />
                                <rect x="17" y="6" width="7" height="7" fill="currentColor" />
                                <rect x="28" y="6" width="7" height="7" fill="currentColor" />
                                <rect x="6" y="17" width="7" height="7" fill="currentColor" />
                                <rect x="17" y="17" width="7" height="7" fill="currentColor" />
                                <rect x="28" y="17" width="7" height="7" fill="currentColor" />
                                <rect x="6" y="28" width="7" height="7" fill="currentColor" />
                                <rect x="17" y="28" width="7" height="7" fill="currentColor" />
                                <rect x="28" y="28" width="7" height="7" fill="currentColor" />
                              </svg>
                            ) : pattern.id === 'dots' ? (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <circle cx="9.5" cy="9.5" r="4" fill="currentColor" />
                                <circle cx="20.5" cy="9.5" r="4" fill="currentColor" />
                                <circle cx="31.5" cy="9.5" r="4" fill="currentColor" />
                                <circle cx="9.5" cy="20.5" r="4" fill="currentColor" />
                                <circle cx="20.5" cy="20.5" r="4" fill="currentColor" />
                                <circle cx="31.5" cy="20.5" r="4" fill="currentColor" />
                                <circle cx="9.5" cy="31.5" r="4" fill="currentColor" />
                                <circle cx="20.5" cy="31.5" r="4" fill="currentColor" />
                                <circle cx="31.5" cy="31.5" r="4" fill="currentColor" />
                              </svg>
                            ) : pattern.id === 'rounded' ? (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <rect x="6" y="6" width="7" height="7" rx="2" fill="currentColor" />
                                <rect x="17" y="6" width="7" height="7" rx="2" fill="currentColor" />
                                <rect x="28" y="6" width="7" height="7" rx="2" fill="currentColor" />
                                <rect x="6" y="17" width="7" height="7" rx="2" fill="currentColor" />
                                <rect x="17" y="17" width="7" height="7" rx="2" fill="currentColor" />
                                <rect x="28" y="17" width="7" height="7" rx="2" fill="currentColor" />
                                <rect x="6" y="28" width="7" height="7" rx="2" fill="currentColor" />
                                <rect x="17" y="28" width="7" height="7" rx="2" fill="currentColor" />
                                <rect x="28" y="28" width="7" height="7" rx="2" fill="currentColor" />
                              </svg>
                            ) : pattern.id === 'classy' ? (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <rect x="6" y="6" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="17" y="6" width="7" height="7" fill="currentColor" />
                                <rect x="28" y="6" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="6" y="17" width="7" height="7" fill="currentColor" />
                                <rect x="17" y="17" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="28" y="17" width="7" height="7" fill="currentColor" />
                                <rect x="6" y="28" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="17" y="28" width="7" height="7" fill="currentColor" />
                                <rect x="28" y="28" width="7" height="7" rx="3.5" fill="currentColor" />
                              </svg>
                            ) : pattern.id === 'classy-rounded' ? (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <rect x="6" y="6" width="7" height="7" rx="3" fill="currentColor" />
                                <circle cx="20.5" cy="9.5" r="3.5" fill="currentColor" />
                                <rect x="28" y="6" width="7" height="7" rx="3" fill="currentColor" />
                                <circle cx="9.5" cy="20.5" r="3.5" fill="currentColor" />
                                <rect x="17" y="17" width="7" height="7" rx="3" fill="currentColor" />
                                <circle cx="31.5" cy="20.5" r="3.5" fill="currentColor" />
                                <rect x="6" y="28" width="7" height="7" rx="3" fill="currentColor" />
                                <circle cx="20.5" cy="31.5" r="3.5" fill="currentColor" />
                                <rect x="28" y="28" width="7" height="7" rx="3" fill="currentColor" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <rect x="6" y="6" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="17" y="6" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="28" y="6" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="6" y="17" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="17" y="17" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="28" y="17" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="6" y="28" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="17" y="28" width="7" height="7" rx="3.5" fill="currentColor" />
                                <rect x="28" y="28" width="7" height="7" rx="3.5" fill="currentColor" />
                              </svg>
                            )}
                            <span className="text-[10px] font-medium">{pattern.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Background Color & Shape Color with Toggles */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Background Color */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-400">
                          Background color (رنگ پس‌زمینه):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            disabled={isTransparentBg}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none uppercase"
                          />
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            disabled={isTransparentBg}
                            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-slate-700 shrink-0"
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300 pt-1">
                          <input
                            type="checkbox"
                            checked={isTransparentBg}
                            onChange={(e) => setIsTransparentBg(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Transparent background (شفاف)</span>
                        </label>
                      </div>

                      {/* Shape Color */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-400">
                          Shape color (رنگ نقاط):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={singleColor}
                            onChange={(e) => {
                              setSingleColor(e.target.value);
                              setGradientColor1(e.target.value);
                            }}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none uppercase"
                          />
                          <input
                            type="color"
                            value={singleColor}
                            onChange={(e) => {
                              setSingleColor(e.target.value);
                              setGradientColor1(e.target.value);
                            }}
                            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-slate-700 shrink-0"
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300 pt-1">
                          <input
                            type="checkbox"
                            checked={colorMode === 'gradient'}
                            onChange={(e) => setColorMode(e.target.checked ? 'gradient' : 'single')}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Gradient (گرادیان دو رنگ)</span>
                        </label>
                      </div>
                    </div>

                    {/* Gradient Extra Settings */}
                    {colorMode === 'gradient' && (
                      <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            رنگ دوم گرادیان (End Color):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white uppercase"
                            />
                            <input
                              type="color"
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border border-slate-700"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            زاویه گرادیان: {gradientRotation}°
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={gradientRotation}
                            onChange={(e) => setGradientRotation(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Border Style (Corner Squares / Outer Eye) */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-medium text-slate-400">
                      Border style (فریم گوشه‌ها):
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                      {(
                        [
                          { id: 'square', label: 'Square' },
                          { id: 'extra-rounded', label: 'Rounded' },
                          { id: 'dot', label: 'Circle' },
                        ] as const
                      ).map((b) => {
                        const isSelected = cornerSquareStyle === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setCornerSquareStyle(b.id)}
                            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30 font-bold'
                                : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                            }`}
                            title={b.label}
                          >
                            {b.id === 'square' ? (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <rect x="7" y="7" width="26" height="26" stroke="currentColor" strokeWidth="4.5" fill="none" />
                              </svg>
                            ) : b.id === 'extra-rounded' ? (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <rect x="7" y="7" width="26" height="26" rx="8" stroke="currentColor" strokeWidth="4.5" fill="none" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="4.5" fill="none" />
                              </svg>
                            )}
                            <span className="text-[10px] font-medium">{b.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Border Color */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        Border color (رنگ فریم گوشه‌ها):
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customEyeColors ? eyeSquareColor : singleColor}
                          onChange={(e) => {
                            setEyeSquareColor(e.target.value);
                            setCustomEyeColors(true);
                          }}
                          className="w-24 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white uppercase"
                        />
                        <input
                          type="color"
                          value={customEyeColors ? eyeSquareColor : singleColor}
                          onChange={(e) => {
                            setEyeSquareColor(e.target.value);
                            setCustomEyeColors(true);
                          }}
                          className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border border-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Center Style (Corner Dots / Inner Eye) */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-medium text-slate-400">
                      Center style (نقطه مرکزی چشم‌ها):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                      {(
                        [
                          { id: 'square', label: 'Square' },
                          { id: 'dot', label: 'Circle' },
                        ] as const
                      ).map((c) => {
                        const isSelected = cornerDotStyle === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCornerDotStyle(c.id)}
                            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30 font-bold'
                                : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white'
                            }`}
                            title={c.label}
                          >
                            {c.id === 'square' ? (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 40 40" className="w-7 h-7">
                                <circle cx="20" cy="20" r="11" fill="currentColor" />
                              </svg>
                            )}
                            <span className="text-[10px] font-medium">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Center Color */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        Center color (رنگ نقطه مرکزی):
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customEyeColors ? eyeDotColor : singleColor}
                          onChange={(e) => {
                            setEyeDotColor(e.target.value);
                            setCustomEyeColors(true);
                          }}
                          className="w-24 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white uppercase"
                        />
                        <input
                          type="color"
                          value={customEyeColors ? eyeDotColor : singleColor}
                          onChange={(e) => {
                            setEyeDotColor(e.target.value);
                            setCustomEyeColors(true);
                          }}
                          className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border border-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LOGO (Exact match to Reference Screenshot 1) */}
              {designTab === 'logo' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Upload Logo Section */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Upload Logo (بارگذاری لوگو):
                    </label>
                    <label className="flex items-center justify-between p-3 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl bg-slate-950/50 cursor-pointer transition-colors group">
                      <span className="text-xs text-slate-400 group-hover:text-cyan-300">
                        {logoDataUrl ? 'فایل لوگو انتخاب شده است (کلیک برای تعویض)' : 'انتخاب فایل لوگو از سیستم (Choose file)...'}
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        Browse
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Or choose from here Section (Preset Icons & Badges) */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Or choose from here (یا انتخاب از آیکون‌های پرکاربرد):
                    </label>

                    {/* Circular Preset Icons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* X Button: Remove Logo */}
                      <button
                        type="button"
                        onClick={() => setLogoDataUrl(null)}
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                          !logoDataUrl
                            ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/30'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title="حذف لوگو"
                      >
                        <X className="w-5 h-5 stroke-[2.5]" />
                      </button>

                      {/* Presets: Link, Location, Email, WhatsApp, WiFi, Contact, PayPal, Bitcoin */}
                      {PRESET_LOGOS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setLogoDataUrl(toSvgDataUrl(item.svg));
                            setErrorCorrectionLevel('H');
                            toast.success(`آیکون ${item.label} به مرکز کیوآر کد اضافه شد.`);
                          }}
                          className="w-11 h-11 rounded-2xl border border-slate-800 bg-slate-950/60 hover:scale-110 hover:border-slate-600 transition-all p-1 flex items-center justify-center shadow-md"
                          title={item.label}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={toSvgDataUrl(item.svg)}
                            alt={item.label}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Preset Badges ([SCAN ME], etc.) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {PRESET_BADGES.map((badge) => (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => {
                            setLogoDataUrl(toSvgDataUrl(badge.svg));
                            setErrorCorrectionLevel('H');
                            toast.success(`بج ${badge.label} به مرکز کیوآر کد اضافه شد.`);
                          }}
                          className="h-12 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:scale-105 transition-all p-1.5 flex items-center justify-center"
                          title={badge.label}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={toSvgDataUrl(badge.svg)}
                            alt={badge.label}
                            className="h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Options (if logo selected) */}
                  {logoDataUrl && (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-medium">
                          اندازه لوگو در مرکز (Logo Size):
                        </span>
                        <span className="text-xs font-mono text-cyan-400">
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

                      <div className="pt-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={hideBehindLogo}
                            onChange={(e) => setHideBehindLogo(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>پنهان کردن نقاط زیر لوگو (Hide Dots)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setLogoDataUrl(null)}
                          className="text-xs text-rose-400 hover:text-rose-300"
                        >
                          حذف لوگو
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced General Settings (Error Correction & Margin) */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {language === 'en'
                      ? 'Error Correction Level'
                      : 'سطح تصحیح خطا (Error Correction)'}
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
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
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
                      {language === 'en' ? 'Outer Margin' : 'حاشیه بیرونی'}
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
        ) : (
          /* Scanner View (Stage 2, 3, 4) */
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <CodeScanner
              scannerType="qrcode"
              title={
                language === 'en'
                  ? 'QR Code Smart Scanner'
                  : language === 'ps'
                  ? 'ځیرک QR سکینر'
                  : 'اسکنر هوشمند کیوآر کد'
              }
              subtitle={
                language === 'en'
                  ? 'Scan QR codes instantly using your device camera or upload image files'
                  : language === 'ps'
                  ? 'د خپلې کمیرې له لارې سمدستي QR کوډونه سکین کړئ یا عکس پورته کړئ'
                  : 'اسکن سریع کدهای QR با وب‌کم، دوربین تلفن همراه یا بارگذاری مستقیم فایل عکس'
              }
              onRecreate={(decodedText) => {
                const trimmed = decodedText.trim();
                if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                  setUrl(trimmed);
                  setActiveTab('url');
                } else if (trimmed.startsWith('WIFI:')) {
                  const ssidMatch = trimmed.match(/S:([^;]+)/);
                  const passMatch = trimmed.match(/P:([^;]+)/);
                  const typeMatch = trimmed.match(/T:([^;]+)/);
                  setWifiData({
                    ssid: ssidMatch ? ssidMatch[1] : 'Network',
                    password: passMatch ? passMatch[1] : '',
                    encryption: (typeMatch ? typeMatch[1] : 'WPA') as any,
                    hidden: false,
                  });
                  setActiveTab('wifi');
                } else if (trimmed.startsWith('tel:') || /^\+?[0-9\- ]{7,16}$/.test(trimmed)) {
                  setPhoneNumber(trimmed.replace('tel:', ''));
                  setActiveTab('phone');
                } else if (trimmed.startsWith('mailto:')) {
                  setEmailData((prev) => ({
                    ...prev,
                    to: trimmed.replace('mailto:', ''),
                  }));
                  setActiveTab('email');
                } else {
                  setPlainText(trimmed);
                  setActiveTab('text');
                }
                setMainViewMode('generator');
                toast.success(
                  language === 'en'
                    ? 'Scanned content transferred to generator!'
                    : 'محتوای اسکن شده به بخش سازنده منتقل شد.'
                );
              }}
            />
          </div>
        )}

        {/* Global CTA Banner at bottom */}
        <ToolsCtaBanner />
      </div>
    </div>
  );
}
