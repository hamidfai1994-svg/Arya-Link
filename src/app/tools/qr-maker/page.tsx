'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Bookmark,
  Scan,
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
  | 'square'
  | 'rounded'
  | 'stripes'
  | 'diamond'
  | 'cross'
  | 'classy'
  | 'classy-rounded'
  | 'dots';

type CornerSquareStyle =
  | 'square'
  | 'rounded-square'
  | 'circle'
  | 'leaf-left'
  | 'leaf-right'
  | 'leaf-both'
  | 'square-cutout'
  | 'teardrop';

type CornerDotStyle =
  | 'square'
  | 'rounded-square'
  | 'circle'
  | 'leaf'
  | 'sunburst'
  | 'star'
  | 'diamond'
  | 'cross';

export type FrameStyle =
  | 'none'
  | 'bottom-banner'
  | 'black-banner'
  | 'hanging-tab'
  | 'circle'
  | 'phone'
  | 'clipboard'
  | 'screen'
  | 'bag';

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
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#ef4444"/><path d="M50 24a18 18 0 0 0-18 18c0 14 18 36 18 36s18-22 18-36a18 18 0 0 0-18-18zm0 25a7 7 0 1 1 7-7 7 7 0 0 1-7 7z" fill="#ffffff"/></svg>`,
  },
  {
    id: 'email',
    label: 'Email',
    bg: '#f59e0b',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#f59e0b"/><rect x="25" y="32" width="50" height="36" rx="6" fill="#ffffff"/><path d="M28 36l22 17 22-17" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`,
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
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#3b82f6"/><path d="M28 38a32 32 0 0 1 44 0M35 48a21 21 0 0 1 30 0M43 58a10 10 0 0 1 14 0" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="50" cy="69" r="4" fill="#ffffff"/></svg>`,
  },
  {
    id: 'vcard',
    label: 'Contact',
    bg: '#1d4ed8',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#1d4ed8"/><rect x="25" y="31" width="50" height="38" rx="6" fill="#ffffff"/><circle cx="41" cy="45" r="6" fill="#1d4ed8"/><rect x="52" y="42" width="16" height="3" rx="1.5" fill="#1d4ed8"/><rect x="52" y="48" width="12" height="3" rx="1.5" fill="#1d4ed8"/><path d="M33 58c0-4 4-6 8-6s8 2 8 6" fill="#1d4ed8"/></svg>`,
  },
  {
    id: 'paypal',
    label: 'PayPal',
    bg: '#003087',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="16" fill="#ffffff"/><path d="M34 76l6-42h16c8 0 12 3.5 11 10.5-1 6-5.5 9.5-11 9.5h-5.5l-3.5 22H34z" fill="#003087"/><path d="M43 67l4-27h13c7 0 11 3 10 9-1 5.5-4.5 8.5-9.5 8.5h-5l-3 18.5h-9.5z" fill="#0079C1"/><text x="64" y="74" font-family="sans-serif" font-weight="900" font-size="11" fill="#003087">PayPal</text></svg>`,
  },
  {
    id: 'bitcoin',
    label: 'Bitcoin',
    bg: '#f7931a',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="46" fill="#f7931a"/><path d="M58 44c4-1 6-4 5-8-1-5-6-7-11-7h-11v38h13c6 0 11-2 11-8 0-4-3-7-7-8zm-11-9h5c3 0 5 1 5 4s-2 4-5 4h-5v-8zm6 24h-6v-9h6c3 0 6 1 6 4.5s-3 4.5-6 4.5z" fill="#ffffff"/><path d="M47 23v4M53 23v4M47 70v4M53 70v4" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  },
];

const PRESET_BADGES = [
  {
    id: 'scanme_bracket',
    label: '[SCAN ME]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" width="100" height="60"><path d="M22 20V12h14M78 20V12H64M22 40v8h14M78 40v8H64" stroke="#000000" stroke-width="4.5" stroke-linecap="round" fill="none"/><text x="50" y="27" font-family="sans-serif" font-weight="900" font-size="14" fill="#000000" text-anchor="middle">SCAN</text><text x="50" y="47" font-family="sans-serif" font-weight="900" font-size="17" fill="#000000" text-anchor="middle">ME</text></svg>`,
  },
  {
    id: 'scanme_badge',
    label: 'SCAN ME',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" width="100" height="60"><text x="50" y="28" font-family="sans-serif" font-weight="900" font-size="18" fill="#000000" text-anchor="middle" letter-spacing="1">SCAN</text><text x="50" y="48" font-family="sans-serif" font-weight="900" font-size="18" fill="#000000" text-anchor="middle" letter-spacing="1">ME</text></svg>`,
  },
  {
    id: 'table_stand',
    label: 'Menu Stand',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" width="100" height="60"><path d="M30 46h40M25 50h50" stroke="#000000" stroke-width="3" stroke-linecap="round"/><rect x="34" y="10" width="32" height="32" rx="3" stroke="#000000" stroke-width="2.5" fill="#ffffff"/><rect x="39" y="15" width="7" height="7" fill="#000000"/><rect x="54" y="15" width="7" height="7" fill="#000000"/><rect x="39" y="30" width="7" height="7" fill="#000000"/><rect x="54" y="30" width="7" height="7" fill="#000000"/><line x1="28" y1="26" x2="72" y2="26" stroke="#ef4444" stroke-width="2" stroke-dasharray="2 2"/></svg>`,
  },
  {
    id: 'viewfinder',
    label: 'Viewfinder',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" width="100" height="60"><path d="M28 20V12h12M72 20V12H60M28 40v8h12M72 40v8H60" stroke="#000000" stroke-width="3.5" stroke-linecap="round" fill="none"/><line x1="22" y1="30" x2="78" y2="30" stroke="#000000" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="30" r="2.5" fill="#000000"/></svg>`,
  },
  {
    id: 'dining',
    label: 'Dining',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" width="100" height="60"><path d="M22 14v12a5 5 0 0 0 5 5v15M25 14v10M29 14v10" stroke="#000000" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M78 14v14a4 4 0 0 1-4 4v17" stroke="#000000" stroke-width="2.5" stroke-linecap="round" fill="none"/><rect x="36" y="16" width="28" height="28" rx="2" stroke="#000000" stroke-width="2" fill="none"/><rect x="41" y="21" width="6" height="6" fill="#000000"/><rect x="53" y="21" width="6" height="6" fill="#000000"/><rect x="41" y="33" width="6" height="6" fill="#000000"/><rect x="53" y="33" width="6" height="6" fill="#000000"/></svg>`,
  },
];

function AdvancedQrMakerContent() {
  const { dir, language } = useLanguage();
  const isRtl = dir === 'rtl';
  const { loadProfile, isLoading: isProfileLoading } = useProfileLoader();
  const searchParams = useSearchParams();

  // Top-Level Mode Tab: Generator vs Scanner
  const [mainViewMode, setMainViewMode] = useState<'generator' | 'scanner'>('generator');

  // Handle URL query parameter ?tab=scanner
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'scanner') {
      setMainViewMode('scanner');
    } else if (tabParam === 'generator') {
      setMainViewMode('generator');
    }
  }, [searchParams]);

  const [isSavingToHistory, setIsSavingToHistory] = useState(false);

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
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('none');
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mappers from visual shapes to standard qr-code-styling figures
  const mapDotStyle = (style: DotStyle): 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded' => {
    switch (style) {
      case 'square':
        return 'square';
      case 'rounded':
        return 'rounded';
      case 'stripes':
      case 'diamond':
        return 'classy';
      case 'cross':
      case 'classy-rounded':
        return 'classy-rounded';
      case 'classy':
        return 'classy';
      case 'dots':
        return 'dots';
      default:
        return 'square';
    }
  };

  const mapCornerSquareStyle = (style: CornerSquareStyle): 'square' | 'extra-rounded' | 'dot' => {
    switch (style) {
      case 'square':
        return 'square';
      case 'circle':
        return 'dot';
      case 'rounded-square':
      case 'leaf-left':
      case 'leaf-right':
      case 'leaf-both':
      case 'square-cutout':
      case 'teardrop':
        return 'extra-rounded';
      default:
        return 'square';
    }
  };

  const mapCornerDotStyle = (style: CornerDotStyle): 'square' | 'dot' => {
    switch (style) {
      case 'square':
      case 'diamond':
      case 'cross':
        return 'square';
      case 'rounded-square':
      case 'circle':
      case 'leaf':
      case 'sunburst':
      case 'star':
        return 'dot';
      default:
        return 'square';
    }
  };

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
        type: mapDotStyle(dotStyle),
        color: !isGrad ? singleColor : undefined,
        gradient: dotsGradient,
      },
      backgroundOptions: {
        color: isTransparentBg ? 'transparent' : bgColor,
      },
      cornersSquareOptions: {
        type: mapCornerSquareStyle(cornerSquareStyle),
        color: customEyeColors
          ? eyeSquareColor
          : !isGrad
          ? singleColor
          : gradientColor1,
      },
      cornersDotOptions: {
        type: mapCornerDotStyle(cornerDotStyle),
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

      if (frameStyle === 'none' || ext === 'svg') {
        await exportInstance.download({
          name: `aryalink-qr-${activeTab}-${Date.now()}`,
          extension: ext,
        });
      } else {
        // Frame compositing on canvas for PNG and JPEG
        try {
          const rawBlob = await exportInstance.getRawData(ext === 'jpeg' ? 'jpeg' : 'png') as Blob | null;
          if (!rawBlob) {
            await exportInstance.download({
              name: `aryalink-qr-${activeTab}-${Date.now()}`,
              extension: ext,
            });
            return;
          }

          const img = new Image();
          const url = URL.createObjectURL(rawBlob);
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get 2d canvas context');

          const qrW = downloadSize;
          const qrH = downloadSize;
          const bannerH = Math.round(downloadSize * 0.16);
          const pad = Math.round(downloadSize * 0.06);

          if (
            frameStyle === 'bottom-banner' ||
            frameStyle === 'black-banner' ||
            frameStyle === 'screen' ||
            frameStyle === 'hanging-tab'
          ) {
            canvas.width = qrW + pad * 2;
            canvas.height = qrH + pad + bannerH;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, pad, pad, qrW, qrH);
            ctx.fillStyle = frameColor;
            ctx.fillRect(0, qrH + pad, canvas.width, bannerH);
            ctx.lineWidth = Math.round(downloadSize * 0.02);
            ctx.strokeStyle = frameColor;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(bannerH * 0.48)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((frameText || 'SCAN ME').toUpperCase(), canvas.width / 2, qrH + pad + bannerH / 2);
          } else {
            // phone, clipboard, circle, bag
            canvas.width = qrW + pad * 2;
            canvas.height = qrH + pad * 2 + bannerH;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, pad, pad, qrW, qrH);
            ctx.fillStyle = frameColor;
            ctx.fillRect(pad, qrH + pad, qrW, bannerH);
            ctx.lineWidth = Math.round(downloadSize * 0.02);
            ctx.strokeStyle = frameColor;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(bannerH * 0.45)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((frameText || 'SCAN ME').toUpperCase(), canvas.width / 2, qrH + pad + bannerH / 2);
          }

          canvas.toBlob((blob) => {
            if (!blob) return;
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `aryalink-qr-${activeTab}-${Date.now()}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            URL.revokeObjectURL(url);
          }, ext === 'jpeg' ? 'image/jpeg' : 'image/png');
        } catch (frameErr) {
          console.warn('Frame compositing fallback:', frameErr);
          await exportInstance.download({
            name: `aryalink-qr-${activeTab}-${Date.now()}`,
            extension: ext,
          });
        }
      }

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

  // Stage 5: Save QR Code to Cloud History
  const handleSaveToHistory = async () => {
    try {
      setIsSavingToHistory(true);
      let previewUrl = '';
      if (qrContainerRef.current) {
        const canvas = qrContainerRef.current.querySelector('canvas');
        if (canvas) {
          previewUrl = canvas.toDataURL('image/png');
        }
      }

      const res = await fetch('/api/tools/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'qr',
          title: `QR Code: ${activeTab.toUpperCase()}`,
          subtype: activeTab,
          payload: computedPayload,
          previewDataUrl: previewUrl,
          config: {
            dotStyle,
            cornerSquareStyle,
            cornerDotStyle,
            frameStyle,
            frameText,
            frameColor,
            singleColor,
            colorMode,
            bgColor,
          },
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        toast.error('برای ذخیره در تاریخچه، ابتدا وارد حساب کاربری خود شوید.');
        return;
      }

      if (data.success) {
        toast.success('کد QR با موفقیت در تاریخچه ابزارهای شما ذخیره شد.');
      } else {
        toast.error(data.message || 'خطا در ذخیره تاریخچه.');
      }
    } catch {
      toast.error('خطای شبکه در ذخیره تاریخچه.');
    } finally {
      setIsSavingToHistory(false);
    }
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

            {/* Step 2: Visual Styling & Design System - Exact Match to Screenshots */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden text-slate-800">
              {/* Tabs Bar: Frame | Shape | Logo */}
              <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 pt-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDesignTab('frame')}
                  className={`px-6 py-2.5 rounded-t-xl font-medium text-sm transition-all border border-b-0 relative ${
                    designTab === 'frame'
                      ? 'bg-white text-teal-600 font-semibold border-slate-200 shadow-xs -mb-px z-10'
                      : 'bg-transparent text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  Frame
                </button>
                <button
                  type="button"
                  onClick={() => setDesignTab('shape')}
                  className={`px-6 py-2.5 rounded-t-xl font-medium text-sm transition-all border border-b-0 relative ${
                    designTab === 'shape'
                      ? 'bg-white text-teal-600 font-semibold border-slate-200 shadow-xs -mb-px z-10'
                      : 'bg-transparent text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  Shape
                </button>
                <button
                  type="button"
                  onClick={() => setDesignTab('logo')}
                  className={`px-6 py-2.5 rounded-t-xl font-medium text-sm transition-all border border-b-0 relative ${
                    designTab === 'logo'
                      ? 'bg-white text-teal-600 font-semibold border-slate-200 shadow-xs -mb-px z-10'
                      : 'bg-transparent text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  Logo
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-6">

              {/* TAB 1: FRAME */}
              {designTab === 'frame' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="relative">
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                      {/* Frame 1: None (X) */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('none')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          frameStyle === 'none'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700 shadow-2xs'
                        }`}
                        title="No Frame"
                      >
                        <X className="w-7 h-7 stroke-[2.5]" />
                      </button>

                      {/* Frame 2: Bottom Banner (scan me pill) */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('bottom-banner')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all ${
                          frameStyle === 'bottom-banner'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Bottom Banner"
                      >
                        <svg viewBox="0 0 50 60" className="w-12 h-14">
                          <rect x="4" y="4" width="42" height="52" rx="4" stroke="#000000" strokeWidth="2.5" fill="none" />
                          <rect x="10" y="8" width="30" height="30" rx="1" fill="#000000" fillOpacity="0.85" />
                          <rect x="8" y="42" width="34" height="10" rx="5" fill="#000000" />
                          <circle cx="14" cy="47" r="2.5" fill="#ffffff" />
                          <text x="28" y="49.5" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN ME</text>
                        </svg>
                      </button>

                      {/* Frame 3: Black Banner */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('black-banner')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all ${
                          frameStyle === 'black-banner'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Solid Black Banner"
                      >
                        <svg viewBox="0 0 50 60" className="w-12 h-14">
                          <rect x="4" y="4" width="42" height="52" rx="4" stroke="#000000" strokeWidth="2.5" fill="none" />
                          <rect x="10" y="8" width="30" height="30" rx="1" fill="#000000" fillOpacity="0.85" />
                          <rect x="4" y="42" width="42" height="14" rx="2" fill="#000000" />
                          <text x="25" y="51" fontSize="5.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN ME</text>
                        </svg>
                      </button>

                      {/* Frame 4: Hanging Tab */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('hanging-tab')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all ${
                          frameStyle === 'hanging-tab'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Hanging Tab"
                      >
                        <svg viewBox="0 0 50 60" className="w-12 h-14">
                          <rect x="4" y="4" width="42" height="42" rx="3" stroke="#000000" strokeWidth="2.5" fill="none" />
                          <rect x="10" y="8" width="30" height="30" rx="1" fill="#000000" fillOpacity="0.85" />
                          <path d="M10 46h30v10a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V46z" fill="#000000" />
                          <text x="25" y="53.5" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN ME</text>
                        </svg>
                      </button>

                      {/* Frame 5: Circle */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('circle')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all ${
                          frameStyle === 'circle'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Circle Frame"
                      >
                        <svg viewBox="0 0 50 60" className="w-12 h-14">
                          <circle cx="25" cy="24" r="20" stroke="#000000" strokeWidth="2" fill="none" />
                          <rect x="13" y="12" width="24" height="24" rx="1" fill="#000000" fillOpacity="0.85" />
                          <text x="25" y="52" fontSize="5.5" fill="#000000" fontWeight="bold" textAnchor="middle">SCAN ME</text>
                        </svg>
                      </button>

                      {/* Frame 6: Phone */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('phone')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all ${
                          frameStyle === 'phone'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Phone Mockup"
                      >
                        <svg viewBox="0 0 50 60" className="w-12 h-14">
                          <rect x="8" y="3" width="34" height="54" rx="7" stroke="#000000" strokeWidth="2" fill="none" />
                          <rect x="20" y="6" width="10" height="2" rx="1" fill="#000000" />
                          <circle cx="25" cy="10" r="0.8" fill="#000000" />
                          <rect x="12" y="13" width="26" height="26" rx="1" fill="#000000" fillOpacity="0.85" />
                          <rect x="10" y="42" width="30" height="10" rx="2" fill="#000000" />
                          <text x="25" y="49" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN ME</text>
                        </svg>
                      </button>

                      {/* Frame 7: Clipboard */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('clipboard')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all ${
                          frameStyle === 'clipboard'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Clipboard Mockup"
                      >
                        <svg viewBox="0 0 50 60" className="w-12 h-14">
                          <rect x="7" y="8" width="36" height="48" rx="4" stroke="#000000" strokeWidth="2" fill="none" />
                          <rect x="17" y="4" width="16" height="6" rx="2" fill="#000000" />
                          <rect x="12" y="14" width="26" height="26" rx="1" fill="#000000" fillOpacity="0.85" />
                          <rect x="9" y="43" width="32" height="9" rx="2" fill="#000000" />
                          <text x="25" y="50" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN ME</text>
                        </svg>
                      </button>

                      {/* Frame 8: Screen / Monitor */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('screen')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all ${
                          frameStyle === 'screen'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Screen / Monitor"
                      >
                        <svg viewBox="0 0 50 60" className="w-12 h-14">
                          <rect x="5" y="6" width="40" height="44" rx="4" stroke="#000000" strokeWidth="2" fill="none" />
                          <rect x="11" y="10" width="28" height="28" rx="1" fill="#000000" fillOpacity="0.85" />
                          <rect x="10" y="41" width="30" height="8" rx="4" fill="#000000" />
                          <text x="25" y="47" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN ME</text>
                        </svg>
                      </button>

                      {/* Frame 9: Shopping Bag */}
                      <button
                        type="button"
                        onClick={() => setFrameStyle('bag')}
                        className={`shrink-0 w-20 h-20 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all ${
                          frameStyle === 'bag'
                            ? 'border-blue-500 bg-sky-50 text-slate-800 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Shopping Bag"
                      >
                        <svg viewBox="0 0 50 60" className="w-12 h-14">
                          <path d="M19 14V8a6 6 0 0 1 12 0v6" stroke="#000000" strokeWidth="2" fill="none" />
                          <rect x="6" y="14" width="38" height="42" rx="4" stroke="#000000" strokeWidth="2" fill="none" />
                          <rect x="12" y="18" width="26" height="26" fill="#000000" fillOpacity="0.85" />
                          <rect x="9" y="46" width="32" height="7" rx="1" fill="#000000" />
                          <text x="25" y="51.5" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">SCAN ME</text>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Frame Customization when active */}
                  {frameStyle !== 'none' && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-600 font-medium mb-1.5">
                          Frame Text:
                        </label>
                        <input
                          type="text"
                          value={frameText}
                          onChange={(e) => setFrameText(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase text-slate-800 focus:outline-none focus:border-cyan-500 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 font-medium mb-1.5">
                          Frame Color:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={frameColor}
                            onChange={(e) => setFrameColor(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-cyan-500 shadow-xs"
                          />
                          <div className="relative w-9 h-9 rounded-lg border border-slate-200 shadow-xs overflow-hidden shrink-0 cursor-pointer">
                            <input
                              type="color"
                              value={frameColor}
                              onChange={(e) => setFrameColor(e.target.value)}
                              className="absolute -inset-2 w-14 h-14 cursor-pointer opacity-0"
                            />
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: frameColor }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SHAPE (Exact match to Reference Screenshot 2) */}
              {designTab === 'shape' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="text-sm font-bold text-slate-800">
                    Shape & Color
                  </div>

                  {/* 1. Shape Style (Dots) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Shape style
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {(
                        [
                          { id: 'square', label: 'Square' },
                          { id: 'rounded', label: 'Rounded' },
                          { id: 'stripes', label: 'Stripes' },
                          { id: 'diamond', label: 'Diamond' },
                          { id: 'cross', label: 'Cross' },
                          { id: 'classy', label: 'Classy' },
                          { id: 'classy-rounded', label: 'Classy-R' },
                          { id: 'dots', label: 'Dots' },
                        ] as const
                      ).map((pattern) => {
                        const isSelected = dotStyle === pattern.id;
                        return (
                          <button
                            key={pattern.id}
                            type="button"
                            onClick={() => setDotStyle(pattern.id)}
                            className={`h-14 rounded-xl border flex items-center justify-center p-1.5 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-sky-50 text-slate-900 ring-2 ring-blue-300/60 shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                            }`}
                            title={pattern.label}
                          >
                            {pattern.id === 'square' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <rect x="5" y="5" width="8" height="8" fill="#000000" />
                                <rect x="16" y="5" width="8" height="8" fill="#000000" />
                                <rect x="27" y="5" width="8" height="8" fill="#000000" />
                                <rect x="5" y="16" width="8" height="8" fill="#000000" />
                                <rect x="16" y="16" width="8" height="8" fill="#000000" />
                                <rect x="27" y="16" width="8" height="8" fill="#000000" />
                                <rect x="5" y="27" width="8" height="8" fill="#000000" />
                                <rect x="16" y="27" width="8" height="8" fill="#000000" />
                                <rect x="27" y="27" width="8" height="8" fill="#000000" />
                              </svg>
                            ) : pattern.id === 'rounded' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <rect x="5" y="5" width="8" height="8" rx="2.5" fill="#000000" />
                                <rect x="16" y="5" width="8" height="8" rx="2.5" fill="#000000" />
                                <rect x="27" y="5" width="8" height="8" rx="2.5" fill="#000000" />
                                <rect x="5" y="16" width="8" height="8" rx="2.5" fill="#000000" />
                                <rect x="16" y="16" width="8" height="8" rx="2.5" fill="#000000" />
                                <rect x="27" y="16" width="8" height="8" rx="2.5" fill="#000000" />
                                <rect x="5" y="27" width="8" height="8" rx="2.5" fill="#000000" />
                                <rect x="16" y="27" width="8" height="8" rx="2.5" fill="#000000" />
                                <rect x="27" y="27" width="8" height="8" rx="2.5" fill="#000000" />
                              </svg>
                            ) : pattern.id === 'stripes' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <rect x="5" y="7" width="12" height="4" rx="1.5" fill="#000000" />
                                <rect x="21" y="7" width="14" height="4" rx="1.5" fill="#000000" />
                                <rect x="5" y="14" width="18" height="4" rx="1.5" fill="#000000" />
                                <rect x="27" y="14" width="8" height="4" rx="1.5" fill="#000000" />
                                <rect x="8" y="21" width="10" height="4" rx="1.5" fill="#000000" />
                                <rect x="22" y="21" width="13" height="4" rx="1.5" fill="#000000" />
                                <rect x="5" y="28" width="16" height="4" rx="1.5" fill="#000000" />
                                <rect x="25" y="28" width="10" height="4" rx="1.5" fill="#000000" />
                              </svg>
                            ) : pattern.id === 'diamond' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <polygon points="10,6 14,10 10,14 6,10" fill="#000000" />
                                <polygon points="20,6 24,10 20,14 16,10" fill="#000000" />
                                <polygon points="30,6 34,10 30,14 26,10" fill="#000000" />
                                <polygon points="10,16 14,20 10,24 6,20" fill="#000000" />
                                <polygon points="20,16 24,20 20,24 16,20" fill="#000000" />
                                <polygon points="30,16 34,20 30,24 26,20" fill="#000000" />
                                <polygon points="10,26 14,30 10,34 6,30" fill="#000000" />
                                <polygon points="20,26 24,30 20,34 16,30" fill="#000000" />
                                <polygon points="30,26 34,30 30,34 26,30" fill="#000000" />
                              </svg>
                            ) : pattern.id === 'cross' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <path d="M 8 7 h 4 v 2 h 2 v 4 h -2 v 2 h -4 v -2 h -2 v -4 h 2 z" fill="#000000" />
                                <path d="M 26 7 h 4 v 2 h 2 v 4 h -2 v 2 h -4 v -2 h -2 v -4 h 2 z" fill="#000000" />
                                <path d="M 17 16 h 4 v 2 h 2 v 4 h -2 v 2 h -4 v -2 h -2 v -4 h 2 z" fill="#000000" />
                                <path d="M 8 25 h 4 v 2 h 2 v 4 h -2 v 2 h -4 v -2 h -2 v -4 h 2 z" fill="#000000" />
                                <path d="M 26 25 h 4 v 2 h 2 v 4 h -2 v 2 h -4 v -2 h -2 v -4 h 2 z" fill="#000000" />
                              </svg>
                            ) : pattern.id === 'classy' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
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
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
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
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <circle cx="7" cy="7" r="2" fill="#000000" />
                                <circle cx="15" cy="7" r="2" fill="#000000" />
                                <circle cx="23" cy="7" r="2" fill="#000000" />
                                <circle cx="31" cy="7" r="2" fill="#000000" />
                                <circle cx="7" cy="15" r="2" fill="#000000" />
                                <circle cx="15" cy="15" r="2" fill="#000000" />
                                <circle cx="23" cy="15" r="2" fill="#000000" />
                                <circle cx="31" cy="15" r="2" fill="#000000" />
                                <circle cx="7" cy="23" r="2" fill="#000000" />
                                <circle cx="15" cy="23" r="2" fill="#000000" />
                                <circle cx="23" cy="23" r="2" fill="#000000" />
                                <circle cx="31" cy="23" r="2" fill="#000000" />
                                <circle cx="7" cy="31" r="2" fill="#000000" />
                                <circle cx="15" cy="31" r="2" fill="#000000" />
                                <circle cx="23" cy="31" r="2" fill="#000000" />
                                <circle cx="31" cy="31" r="2" fill="#000000" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Colors Box (2 columns) */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Left: Background color */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-medium text-slate-600">
                          Background color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={isTransparentBg ? 'TRANSPARENT' : bgColor.toUpperCase()}
                            onChange={(e) => {
                              if (!isTransparentBg) setBgColor(e.target.value);
                            }}
                            disabled={isTransparentBg}
                            className="w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-cyan-500 uppercase shadow-2xs"
                          />
                          <div className="relative w-8 h-8 rounded-lg border border-slate-300 shadow-2xs overflow-hidden shrink-0 cursor-pointer">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => {
                                setBgColor(e.target.value);
                                setIsTransparentBg(false);
                              }}
                              disabled={isTransparentBg}
                              className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                            />
                            <div
                              className="w-full h-full"
                              style={{
                                backgroundColor: isTransparentBg ? 'transparent' : bgColor,
                                backgroundImage: isTransparentBg
                                  ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)'
                                  : undefined,
                                backgroundSize: '8px 8px',
                                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                              }}
                            />
                          </div>
                        </div>
                        {/* Toggle: Transparent background */}
                        <div className="pt-1">
                          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isTransparentBg}
                                onChange={(e) => setIsTransparentBg(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-600"></div>
                            </div>
                            <span className="text-xs text-slate-600 font-medium">Transparent background</span>
                          </label>
                        </div>
                      </div>

                      {/* Right: Shape color */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-medium text-slate-600">
                          Shape color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={singleColor.toUpperCase()}
                            onChange={(e) => {
                              setSingleColor(e.target.value);
                              setGradientColor1(e.target.value);
                            }}
                            className="w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-cyan-500 uppercase shadow-2xs"
                          />
                          <div className="relative w-8 h-8 rounded-lg border border-slate-300 shadow-2xs overflow-hidden shrink-0 cursor-pointer">
                            <input
                              type="color"
                              value={singleColor}
                              onChange={(e) => {
                                setSingleColor(e.target.value);
                                setGradientColor1(e.target.value);
                              }}
                              className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                            />
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: singleColor }}
                            />
                          </div>
                        </div>
                        {/* Toggle: Gradient */}
                        <div className="pt-1">
                          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={colorMode === 'gradient'}
                                onChange={(e) => setColorMode(e.target.checked ? 'gradient' : 'single')}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-600"></div>
                            </div>
                            <span className="text-xs text-slate-600 font-medium">Gradient</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Gradient Extra Settings */}
                    {colorMode === 'gradient' && (
                      <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">
                            End Color (رنگ دوم گرادیان):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={gradientColor2.toUpperCase()}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 uppercase shadow-2xs"
                            />
                            <div className="relative w-8 h-8 rounded-lg border border-slate-300 shadow-2xs overflow-hidden shrink-0 cursor-pointer">
                              <input
                                type="color"
                                value={gradientColor2}
                                onChange={(e) => setGradientColor2(e.target.value)}
                                className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                              />
                              <div className="w-full h-full" style={{ backgroundColor: gradientColor2 }} />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                            <span>Gradient Angle</span>
                            <span className="font-mono text-cyan-600">{gradientRotation}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={gradientRotation}
                            onChange={(e) => setGradientRotation(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 mt-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Border style (Corner Squares) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Border style
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {(
                        [
                          { id: 'square', label: 'Square' },
                          { id: 'rounded-square', label: 'Rounded Square' },
                          { id: 'circle', label: 'Circle' },
                          { id: 'leaf-left', label: 'Leaf Left' },
                          { id: 'leaf-right', label: 'Leaf Right' },
                          { id: 'leaf-both', label: 'Leaf Both' },
                          { id: 'square-cutout', label: 'Square Cutout' },
                          { id: 'teardrop', label: 'Teardrop' },
                        ] as const
                      ).map((b) => {
                        const isSelected = cornerSquareStyle === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setCornerSquareStyle(b.id)}
                            className={`h-14 rounded-xl border flex items-center justify-center p-1.5 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-sky-50 text-slate-900 ring-2 ring-blue-300/60 shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                            }`}
                            title={b.label}
                          >
                            {b.id === 'square' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <rect x="6" y="6" width="28" height="28" stroke="#1e293b" strokeWidth="4.5" fill="none" />
                              </svg>
                            ) : b.id === 'rounded-square' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <rect x="6" y="6" width="28" height="28" rx="8" stroke="#1e293b" strokeWidth="4.5" fill="none" />
                              </svg>
                            ) : b.id === 'circle' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <circle cx="20" cy="20" r="14" stroke="#1e293b" strokeWidth="4.5" fill="none" />
                              </svg>
                            ) : b.id === 'leaf-left' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <path d="M 20 6 C 12 6 6 12 6 20 L 6 34 L 20 34 C 28 34 34 28 34 20 L 34 6 Z" stroke="#1e293b" strokeWidth="4" fill="none" />
                              </svg>
                            ) : b.id === 'leaf-right' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <path d="M 6 6 L 20 6 C 28 6 34 12 34 20 L 34 34 L 20 34 C 12 34 6 28 6 20 Z" stroke="#1e293b" strokeWidth="4" fill="none" />
                              </svg>
                            ) : b.id === 'leaf-both' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <path d="M 20 6 C 12 6 6 12 6 20 L 6 20 C 6 28 12 34 20 34 C 28 34 34 28 34 20 C 34 12 28 6 20 6 Z" stroke="#1e293b" strokeWidth="4" fill="none" />
                              </svg>
                            ) : b.id === 'square-cutout' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <rect x="6" y="6" width="28" height="28" rx="4" fill="#1e293b" />
                                <circle cx="20" cy="20" r="8" fill="#ffffff" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <path d="M 20 6 L 33 20 C 33 27.2 27.2 33 20 33 C 12.8 33 7 27.2 7 20 Z" stroke="#1e293b" strokeWidth="4" fill="none" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Border Color */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Border color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={(customEyeColors ? eyeSquareColor : singleColor).toUpperCase()}
                          onChange={(e) => {
                            setEyeSquareColor(e.target.value);
                            setCustomEyeColors(true);
                          }}
                          className="flex-1 max-w-[280px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 uppercase shadow-2xs"
                        />
                        <div className="relative w-14 h-8 rounded-lg border border-slate-300 shadow-2xs overflow-hidden shrink-0 cursor-pointer">
                          <input
                            type="color"
                            value={customEyeColors ? eyeSquareColor : singleColor}
                            onChange={(e) => {
                              setEyeSquareColor(e.target.value);
                              setCustomEyeColors(true);
                            }}
                            className="absolute -inset-2 w-20 h-14 cursor-pointer opacity-0"
                          />
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: customEyeColors ? eyeSquareColor : singleColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Center style (Corner Dots) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">
                      Center style
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {(
                        [
                          { id: 'square', label: 'Square' },
                          { id: 'rounded-square', label: 'Rounded Square' },
                          { id: 'circle', label: 'Circle' },
                          { id: 'leaf', label: 'Leaf' },
                          { id: 'sunburst', label: 'Sunburst' },
                          { id: 'star', label: 'Star' },
                          { id: 'diamond', label: 'Diamond' },
                          { id: 'cross', label: 'Cross' },
                        ] as const
                      ).map((c) => {
                        const isSelected = cornerDotStyle === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCornerDotStyle(c.id)}
                            className={`h-14 rounded-xl border flex items-center justify-center p-1.5 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-sky-50 text-slate-900 ring-2 ring-blue-300/60 shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-2xs'
                            }`}
                            title={c.label}
                          >
                            {c.id === 'square' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <rect x="9" y="9" width="22" height="22" fill="#1e293b" />
                              </svg>
                            ) : c.id === 'rounded-square' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <rect x="9" y="9" width="22" height="22" rx="6" fill="#1e293b" />
                              </svg>
                            ) : c.id === 'circle' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <circle cx="20" cy="20" r="11" fill="#1e293b" />
                              </svg>
                            ) : c.id === 'leaf' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <path d="M 20 8 C 27 8 32 13 32 20 C 32 27 27 32 20 32 L 8 32 L 8 20 C 8 13 13 8 20 8 Z" fill="#1e293b" />
                              </svg>
                            ) : c.id === 'sunburst' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <path d="M 20 8 l 3 2 l 3.5 -1 l 1.5 3.5 l 3.5 1 l -0.5 3.5 l 3 2 l -2 3 l 2 3 l -3 2 l 0.5 3.5 l -3.5 1 l -1.5 3.5 l -3.5 -1 l -3 2 l -3 -2 l -3.5 1 l -1.5 -3.5 l -3.5 -1 l 0.5 -3.5 l -3 -2 l 2 -3 l -2 -3 l 3 -2 l -0.5 -3.5 l 3.5 -1 l 1.5 -3.5 l 3.5 1 z" fill="#1e293b" />
                              </svg>
                            ) : c.id === 'star' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <polygon points="20,7 23.8,15.2 32.8,16.2 26.2,22.2 28,31 20,26.4 12,31 13.8,22.2 7.2,16.2 16.2,15.2" fill="#1e293b" />
                              </svg>
                            ) : c.id === 'diamond' ? (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <polygon points="20,7 33,20 20,33 7,20" fill="#1e293b" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 40 40" className="w-8 h-8">
                                <path d="M 16 8 h 8 v 8 h 8 v 8 h -8 v 8 h -8 v -8 h -8 v -8 h 8 z" fill="#1e293b" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Center Color */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Center color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={(customEyeColors ? eyeDotColor : singleColor).toUpperCase()}
                          onChange={(e) => {
                            setEyeDotColor(e.target.value);
                            setCustomEyeColors(true);
                          }}
                          className="flex-1 max-w-[280px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 uppercase shadow-2xs"
                        />
                        <div className="relative w-14 h-8 rounded-lg border border-slate-300 shadow-2xs overflow-hidden shrink-0 cursor-pointer">
                          <input
                            type="color"
                            value={customEyeColors ? eyeDotColor : singleColor}
                            onChange={(e) => {
                              setEyeDotColor(e.target.value);
                              setCustomEyeColors(true);
                            }}
                            className="absolute -inset-2 w-20 h-14 cursor-pointer opacity-0"
                          />
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: customEyeColors ? eyeDotColor : singleColor }}
                          />
                        </div>
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
                    <label className="block text-sm font-semibold text-slate-700">
                      Upload Logo
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-between px-4 py-2.5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 cursor-pointer transition-colors shadow-2xs group"
                    >
                      <span className="text-xs text-slate-400 group-hover:text-slate-600 truncate">
                        {logoDataUrl ? 'فایل لوگو انتخاب شده است (کلیک برای تغییر)' : 'Choose file'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-cyan-600 transition-colors">
                        Browse
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFile}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Or choose from here Section (Preset Icons & Badges) */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Or choose from here
                    </label>

                    {/* Row 1: 9 preset circular / branded logos */}
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                      {/* X Clear Button */}
                      <button
                        type="button"
                        onClick={() => setLogoDataUrl(null)}
                        className={`w-12 h-12 rounded-xl border shrink-0 flex items-center justify-center transition-all ${
                          !logoDataUrl
                            ? 'border-blue-500 bg-sky-50 text-slate-900 ring-2 ring-blue-300/60 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 shadow-2xs'
                        }`}
                        title="Clear Logo"
                      >
                        <X className="w-5 h-5 stroke-[2.5]" />
                      </button>

                      {/* 8 preset logos */}
                      {PRESET_LOGOS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setLogoDataUrl(toSvgDataUrl(item.svg));
                            setErrorCorrectionLevel('H');
                            toast.success(`Logo ${item.label} selected.`);
                          }}
                          className="w-12 h-12 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:scale-105 transition-all p-1.5 flex items-center justify-center shadow-2xs shrink-0"
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

                    {/* Row 2: 5 preset badges */}
                    <div className="grid grid-cols-5 gap-2.5 pt-1">
                      {PRESET_BADGES.map((badge) => (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => {
                            setLogoDataUrl(toSvgDataUrl(badge.svg));
                            setErrorCorrectionLevel('H');
                            toast.success(`Badge ${badge.label} selected.`);
                          }}
                          className="h-12 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:scale-105 transition-all p-1.5 flex items-center justify-center shadow-2xs"
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
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-700 font-medium">
                          Logo Size (اندازه لوگو در مرکز):
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-600">
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
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                      />

                      <div className="pt-1 flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hideBehindLogo}
                            onChange={(e) => setHideBehindLogo(e.target.checked)}
                            className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="text-xs text-slate-600 font-medium">Hide dots behind logo (پنهان کردن نقاط زیر لوگو)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setLogoDataUrl(null)}
                          className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                        >
                          حذف لوگو
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced General Settings (Error Correction & Margin) */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
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
                        className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                          errorCorrectionLevel === lvl.id
                            ? 'bg-sky-50 border-blue-500 text-slate-900 font-bold ring-1 ring-blue-300'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                    <span>
                      {language === 'en' ? 'Outer Margin' : 'حاشیه بیرونی'}
                    </span>
                    <span className="font-mono text-cyan-600">{margin}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="2"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 mt-2"
                  />
                </div>
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

              {/* QR Render Box with Live Frame Preview */}
              <div className="relative flex items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner min-h-[360px] overflow-hidden">
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

                {/* Single outer card containing qrContainerRef (prevents unmount / canvas detachment) */}
                <div
                  className={`relative flex flex-col items-center justify-center transition-all ${
                    frameStyle === 'none'
                      ? 'hover:scale-105'
                      : frameStyle === 'bottom-banner' || frameStyle === 'black-banner'
                      ? 'rounded-2xl overflow-hidden shadow-2xl bg-white p-3 pb-0'
                      : frameStyle === 'hanging-tab'
                      ? 'rounded-2xl shadow-2xl bg-white p-3 pb-2'
                      : frameStyle === 'screen'
                      ? 'rounded-2xl shadow-2xl bg-white p-3 pb-0'
                      : frameStyle === 'circle'
                      ? 'rounded-full shadow-2xl bg-white p-7'
                      : frameStyle === 'phone'
                      ? 'rounded-[32px] shadow-2xl bg-white p-3 pt-4 min-w-[260px]'
                      : frameStyle === 'clipboard'
                      ? 'rounded-2xl shadow-2xl bg-white p-4 pt-6'
                      : 'rounded-2xl shadow-2xl bg-white p-4 pt-7'
                  }`}
                  style={
                    frameStyle !== 'none'
                      ? {
                          border: `${frameStyle === 'phone' ? '6px' : '4px'} solid ${frameColor}`,
                        }
                      : undefined
                  }
                >
                  {/* Top Frame Elements */}
                  {frameStyle === 'phone' && (
                    <div
                      className="w-16 h-1.5 rounded-full mb-2.5"
                      style={{ backgroundColor: frameColor }}
                    />
                  )}

                  {frameStyle === 'clipboard' && (
                    <div
                      className="absolute -top-3.5 px-6 py-1 rounded-md font-bold text-[9px] uppercase tracking-wider text-white shadow-md"
                      style={{ backgroundColor: frameColor }}
                    >
                      AryaLink
                    </div>
                  )}

                  {frameStyle === 'bag' && (
                    <div
                      className="absolute -top-5 w-14 h-8 rounded-t-full border-4 border-b-0"
                      style={{ borderColor: frameColor }}
                    />
                  )}

                  {/* QR Canvas Container (Always Mounted) */}
                  <div
                    ref={qrContainerRef}
                    className="flex items-center justify-center"
                  />

                  {/* Bottom Frame Elements */}
                  {(frameStyle === 'bottom-banner' || frameStyle === 'black-banner') && (
                    <div
                      className="w-[calc(100%+24px)] -mx-3 py-2 px-6 text-center font-black text-xs uppercase tracking-widest text-white shadow-sm mt-2 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: frameColor }}
                    >
                      {frameStyle === 'bottom-banner' && (
                        <Scan className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>{frameText || 'SCAN ME'}</span>
                    </div>
                  )}

                  {frameStyle === 'hanging-tab' && (
                    <div
                      className="w-[calc(100%-20px)] mx-auto py-1.5 px-4 text-center font-black text-[11px] uppercase tracking-wider text-white shadow-md rounded-b-xl mt-1 -mb-2"
                      style={{ backgroundColor: frameColor }}
                    >
                      {frameText || 'SCAN ME'}
                    </div>
                  )}

                  {frameStyle === 'screen' && (
                    <div
                      className="w-[calc(100%+24px)] -mx-3 py-2 px-4 text-center font-black text-[11px] uppercase tracking-wider text-white shadow-sm mt-2"
                      style={{ backgroundColor: frameColor }}
                    >
                      {frameText || 'SCAN ME'}
                    </div>
                  )}

                  {frameStyle === 'circle' && (
                    <div
                      className="absolute -bottom-3 px-5 py-0.5 rounded-full font-black text-[11px] uppercase tracking-widest text-white shadow-md border-2 border-white"
                      style={{ backgroundColor: frameColor }}
                    >
                      {frameText || 'SCAN ME'}
                    </div>
                  )}

                  {frameStyle === 'phone' && (
                    <>
                      <div className="mt-2 text-center font-black text-[10px] tracking-wider uppercase text-slate-800">
                        {frameText || 'SCAN ME'}
                      </div>
                      <div
                        className="w-10 h-1 rounded-full mt-1 mb-0.5"
                        style={{ backgroundColor: frameColor }}
                      />
                    </>
                  )}

                  {(frameStyle === 'clipboard' || frameStyle === 'bag') && (
                    <div
                      className="w-full mt-2 py-1.5 px-4 rounded-lg text-center font-black text-xs uppercase tracking-wider text-white"
                      style={{ backgroundColor: frameColor }}
                    >
                      {frameText || 'SCAN ME'}
                    </div>
                  )}
                </div>
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

                {/* Save to History Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveToHistory}
                  disabled={isSavingToHistory}
                  className="w-full py-2.5 rounded-xl border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-cyan-400" />
                  <span>
                    {isSavingToHistory
                      ? 'در حال ذخیره...'
                      : 'ذخیره در تاریخچه ابزارهای من'}
                  </span>
                </Button>
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

export default function AdvancedQrMakerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <AdvancedQrMakerContent />
    </Suspense>
  );
}
