'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Sparkles,
  Link2,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  RotateCw,
  QrCode,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Radio,
  FileText,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  PackageCheck,
  Printer,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  X,
  Palette,
  Layers,
  Zap,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CARD_MATERIALS_DATA, CardMaterialItem } from '@/components/landing/LuxuryMaterialsShowcase';

// =========================================================================
// 1. DATA & CONSTANTS (Strictly English numbers, Formal Afghan Dari vocabulary)
// =========================================================================

const AFGHANISTAN_PROVINCES = [
  'کابل (Kabul)',
  'هرات (Herat)',
  'بلخ (Mazar-i-Sharif)',
  'ننگرهار (Jalalabad)',
  'قندهار (Kandahar)',
  'بامیان (Bamyan)',
  'بدخشان (Badakhshan)',
  'کندز (Kunduz)',
  'تخار (Takhar)',
  'بغلان (Baghlan)',
  'غزنی (Ghazni)',
  'پروان (Parwan)',
  'پنجشیر (Panjshir)',
  'کاپیسا (Kapisa)',
  'میدان وردک (Wardak)',
  'لوگر (Logar)',
  'خوست (Khost)',
  'پکتیا (Paktia)',
  'پکتیکا (Paktika)',
  'فاریاب (Faryab)',
  'جوزجان (Jawzjan)',
  'سرپل (Sar-e Pol)',
  'سمنگان (Samangan)',
  'غور (Ghor)',
  'بادغیس (Badghis)',
  'فراه (Farah)',
  'نیمروز (Nimruz)',
  'هلمند (Helmand)',
  'زابل (Zabul)',
  'ارزگان (Uruzgan)',
  'دایکندی (Daykundi)',
  'لغمان (Laghman)',
  'کنر (Kunar)',
  'نورستان (Nuristan)',
];

interface CardTemplate {
  id: string;
  name: string;
  subtitle: string;
  orientation: 'horizontal' | 'vertical';
  materialId: string;
  materialName: string;
  basePrice: number;
  badge: string;
  category: 'executive' | 'modern' | 'minimal' | 'eco';
  bgGradient: string;
  accentColor: string;
  textColor: string;
  chipColor: string;
  finishType: 'matte' | 'brushed_metal' | 'gold_embossed' | 'wood_laser' | 'custom';
  description: string;
}

const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'tpl-obsidian-cyan',
    name: 'سایبر نئون (Cyber Cyan)',
    subtitle: 'Matte Obsidian & Neon Line',
    orientation: 'horizontal',
    materialId: 'mat-pvc',
    materialName: 'پی‌وی‌سی مات مخملی',
    basePrice: 1500,
    badge: 'پرفروش‌ترین (Popular)',
    category: 'modern',
    bgGradient: 'from-zinc-950 via-slate-900 to-black',
    accentColor: '#06b6d4',
    textColor: '#ffffff',
    chipColor: '#06b6d4',
    finishType: 'matte',
    description: 'مشکی مات مخملی با حاشیه‌های نئونی سایان و هایلایت درخشان مدرن.',
  },
  {
    id: 'tpl-titanium-silver',
    name: 'تیتانیوم نقره‌ای (Brushed Titanium)',
    subtitle: 'Aero-Grade Brushed Metal',
    orientation: 'horizontal',
    materialId: 'mat-black-metal',
    materialName: 'فلز مشکی تیتانیوم',
    basePrice: 2800,
    badge: 'ویژه مدیران (Executive)',
    category: 'executive',
    bgGradient: 'from-zinc-800 via-slate-700 to-zinc-900',
    accentColor: '#e2e8f0',
    textColor: '#ffffff',
    chipColor: '#cbd5e1',
    finishType: 'brushed_metal',
    description: 'بافت برس‌خورده فلزی متالیک با خطوط صیقلی نقره‌ای و حکاکی لیزری عمیق.',
  },
  {
    id: 'tpl-royal-gold',
    name: 'طلای سلطنتی (Royal 24K Gold)',
    subtitle: 'Luxury Mirror Gold Steel',
    orientation: 'horizontal',
    materialId: 'mat-gold-steel',
    materialName: 'استیل طلایی مات و براق',
    basePrice: 3400,
    badge: 'لوکس و ممتاز (VIP)',
    category: 'executive',
    bgGradient: 'from-amber-950 via-yellow-900 to-amber-950',
    accentColor: '#f59e0b',
    textColor: '#fef3c7',
    chipColor: '#fbbf24',
    finishType: 'gold_embossed',
    description: 'روکش آینه‌ای طلای 24 عیار با انعکاس نور خیره‌کننده و وقار تشریفاتی.',
  },
  {
    id: 'tpl-carbon-stealth',
    name: 'فیبر کربن استیلث (Carbon Fiber)',
    subtitle: 'Ultra-Dense Carbon Fiber',
    orientation: 'horizontal',
    materialId: 'mat-pvc',
    materialName: 'پی‌وی‌سی بافت کربن',
    basePrice: 1700,
    badge: 'اسپورت و مقاوم (Tough)',
    category: 'modern',
    bgGradient: 'from-neutral-950 via-zinc-900 to-neutral-900',
    accentColor: '#38bdf8',
    textColor: '#ffffff',
    chipColor: '#0ea5e9',
    finishType: 'matte',
    description: 'بافت فیبر کربن سه‌بعدی با مقاومت فوق‌العاده در برابر خط و خش.',
  },
  {
    id: 'tpl-silk-marble',
    name: 'مرمر سفید ابریشمی (Silk Marble)',
    subtitle: 'Carrara White & Gold Veins',
    orientation: 'horizontal',
    materialId: 'mat-pvc',
    materialName: 'پی‌وی‌سی سرامیکی سفید',
    basePrice: 1600,
    badge: 'مینیمال و پاک (Clean)',
    category: 'minimal',
    bgGradient: 'from-zinc-100 via-slate-50 to-zinc-200',
    accentColor: '#d97706',
    textColor: '#0f172a',
    chipColor: '#b45309',
    finishType: 'matte',
    description: 'سنگ مرمر سرامیکی سفید با رگه‌های ظریف طلایی و طراحی نئوکلاسیک.',
  },
  {
    id: 'tpl-exec-vertical',
    name: 'مدیریتی پرستیژ (Executive Midnight)',
    subtitle: 'Vertical Gold Stripe Edition',
    orientation: 'vertical',
    materialId: 'mat-black-metal',
    materialName: 'فلز تیتانیوم عمودی',
    basePrice: 2900,
    badge: 'طرح عمودی (Vertical VIP)',
    category: 'executive',
    bgGradient: 'from-zinc-950 via-neutral-900 to-stone-950',
    accentColor: '#f59e0b',
    textColor: '#ffffff',
    chipColor: '#fbbf24',
    finishType: 'gold_embossed',
    description: 'کارت عمودی لوکس با نوار طلایی عمودی، مناسب مدیران عامل و مشاوران ارشد.',
  },
  {
    id: 'tpl-cyber-vertical',
    name: 'سایبر عمودی (Cyber Neon Vertical)',
    subtitle: 'Holographic Vertical Grid',
    orientation: 'vertical',
    materialId: 'mat-pvc',
    materialName: 'پی‌وی‌سی عمودی مدرن',
    basePrice: 1650,
    badge: 'طرح عمودی (Vertical Neo)',
    category: 'modern',
    bgGradient: 'from-slate-950 via-cyan-950/60 to-black',
    accentColor: '#22d3ee',
    textColor: '#ffffff',
    chipColor: '#06b6d4',
    finishType: 'matte',
    description: 'کارت عمودی با تم سایبرپانک و خطوط نئونی داینامیک با خوانایی عالی.',
  },
  {
    id: 'tpl-walnut-eco',
    name: 'چوب گردوی طبیعی (Natural Walnut)',
    subtitle: 'Organic Handcrafted Walnut',
    orientation: 'horizontal',
    materialId: 'mat-wood',
    materialName: 'چوب طبیعی دست‌ساز',
    basePrice: 2200,
    badge: 'ارگانیک و اکو (Eco-Friendly)',
    category: 'eco',
    bgGradient: 'from-amber-950 via-stone-900 to-amber-900',
    accentColor: '#fde68a',
    textColor: '#fef3c7',
    chipColor: '#d97706',
    finishType: 'wood_laser',
    description: 'چوب گردوی طبیعی با رگه‌های اصیل و تراشه NFC مخفی‌شده درون چوب.',
  },
  {
    id: 'tpl-bamboo-vertical',
    name: 'بامبوی ارگانیک (Bamboo Eco Vertical)',
    subtitle: 'Vertical Sustainable Bamboo',
    orientation: 'vertical',
    materialId: 'mat-wood',
    materialName: 'چوب بامبو عمودی',
    basePrice: 2100,
    badge: 'طرح عمودی (Vertical Eco)',
    category: 'eco',
    bgGradient: 'from-stone-800 via-yellow-950/80 to-stone-900',
    accentColor: '#fed7aa',
    textColor: '#fef3c7',
    chipColor: '#ea580c',
    finishType: 'wood_laser',
    description: 'کارت عمودی اکولوژیک از ساقه فشرده بامبو با رایحه ملایم و ماندگاری ابدی.',
  },
  {
    id: 'tpl-rose-gold',
    name: 'رزگلد متالیک (Metallic Rose Gold)',
    subtitle: 'Rose Gold Satin Shimmer',
    orientation: 'horizontal',
    materialId: 'mat-gold-steel',
    materialName: 'استیل رزگلد اختصاصی',
    basePrice: 3100,
    badge: 'شیک و خاص (Special Edition)',
    category: 'executive',
    bgGradient: 'from-rose-950 via-pink-900 to-zinc-950',
    accentColor: '#fb7185',
    textColor: '#ffe4e6',
    chipColor: '#f43f5e',
    finishType: 'gold_embossed',
    description: 'استیل براق رزگلد با درخشش ملایم و ظاهری بسیار شیک برای برندهای پرمیوم.',
  },
  {
    id: 'tpl-emerald-prestige',
    name: 'زمردی سلطنتی (Imperial Emerald)',
    subtitle: 'Deep Emerald & Platinum Vertical',
    orientation: 'vertical',
    materialId: 'mat-black-metal',
    materialName: 'فلز مشکی زمردی عمودی',
    basePrice: 3200,
    badge: 'طرح عمودی (Vertical Rare)',
    category: 'executive',
    bgGradient: 'from-emerald-950 via-zinc-950 to-teal-950',
    accentColor: '#34d399',
    textColor: '#ffffff',
    chipColor: '#10b981',
    finishType: 'brushed_metal',
    description: 'ترکیب رنگ سبز زمردی تیره، فویل پلاتین و فلز مشکی در ابعاد پرستیژ عمودی.',
  },
  {
    id: 'tpl-custom-artwork',
    name: 'آپلود طرح کاملاً اختصاصی',
    subtitle: 'Custom Print On-Demand',
    orientation: 'horizontal',
    materialId: 'mat-pvc',
    materialName: 'چاپ باکیفیت UV اختصاصی',
    basePrice: 1800,
    badge: 'طرح شما (Upload Custom)',
    category: 'modern',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-950',
    accentColor: '#818cf8',
    textColor: '#ffffff',
    chipColor: '#6366f1',
    finishType: 'custom',
    description: 'طرح، رنگ و لوگوی سازمانی اختصاصی خود را در قالب فایل باکیفیت آپلود نمایید.',
  },
];

const WIZARD_STORAGE_KEY = 'aryalink_order_state';

interface UserProfileSummary {
  _id: string;
  alias: string;
  displayName: string;
  headline: string;
  avatarUrl: string;
}

// =========================================================================
// 2. MAIN WIZARD COMPONENT WITH SUSPENSE
// =========================================================================

function OrderWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Wizard Step (1: Link, 2: Template, 3: Personalization, 4: Shipping/Checkout)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User Profiles list (fetched from /api/profile/list)
  const [userProfiles, setUserProfiles] = useState<UserProfileSummary[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);

  // Step 1: Selected or Custom Link
  const [selectedLinkType, setSelectedLinkType] = useState<'profile' | 'custom'>('profile');
  const [selectedProfileAlias, setSelectedProfileAlias] = useState<string>('');
  const [customLinkAlias, setCustomLinkAlias] = useState<string>('');

  // Step 2: Selected Template & Filters
  const [templateFilter, setTemplateFilter] = useState<'all' | 'horizontal' | 'vertical' | 'custom'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-obsidian-cyan');
  const [customArtworkFront, setCustomArtworkFront] = useState<string>('');
  const [customArtworkBack, setCustomArtworkBack] = useState<string>('');
  const [customOrientation, setCustomOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Step 3: Live Personalization
  const [personalization, setPersonalization] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    companyName: '',
    logoUrl: '',
    finishAccent: 'gold', // 'gold', 'silver', 'cyan', 'minimal'
    qrPosition: 'back', // 'back' | 'front'
  });
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  // Step 4: Shipping Details
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: 'کابل (Kabul)',
    city: '',
    streetAddress: '',
    notes: '',
  });

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);

  // Submission / Checkout States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderNumber: string;
    totalPrice: number;
    customerName: string;
    province: string;
  } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Get current active template object
  const activeTemplate = CARD_TEMPLATES.find((t) => t.id === selectedTemplateId) || CARD_TEMPLATES[0];

  // Effective orientation
  const effectiveOrientation =
    activeTemplate.id === 'tpl-custom-artwork' ? customOrientation : activeTemplate.orientation;

  // Compute resolved target URL for NFC chip and QR code
  const resolvedAlias =
    selectedLinkType === 'profile'
      ? selectedProfileAlias || 'username'
      : customLinkAlias.trim().replace(/^https?:\/\/(www\.)?aryal(ink)?\.(me|ink)\//i, '') || 'username';
  const resolvedCardUrl = `https://aryal.ink/${resolvedAlias}`;

  // =========================================================================
  // 3. HYDRATION & STATE PERSISTENCE (localStorage & Query params)
  // =========================================================================

  // Restore draft state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (parsed.selectedLinkType) setSelectedLinkType(parsed.selectedLinkType);
        if (parsed.selectedProfileAlias) setSelectedProfileAlias(parsed.selectedProfileAlias);
        if (parsed.customLinkAlias) setCustomLinkAlias(parsed.customLinkAlias);
        if (parsed.selectedTemplateId) setSelectedTemplateId(parsed.selectedTemplateId);
        if (parsed.customArtworkFront) setCustomArtworkFront(parsed.customArtworkFront);
        if (parsed.customArtworkBack) setCustomArtworkBack(parsed.customArtworkBack);
        if (parsed.customOrientation) setCustomOrientation(parsed.customOrientation);
        if (parsed.personalization) setPersonalization((prev) => ({ ...prev, ...parsed.personalization }));
        if (parsed.shipping) setShipping((prev) => ({ ...prev, ...parsed.shipping }));
        if (parsed.quantity) setQuantity(parsed.quantity);
      }
    } catch (err) {
      console.warn('Failed to restore order draft from localStorage:', err);
    }
  }, []);

  // Handle URL parameters (e.g. ?step=2 or ?material=mat-black-metal or ?resume=true)
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const stepNum = parseInt(stepParam, 10);
      if (stepNum >= 1 && stepNum <= 4) {
        setCurrentStep(stepNum);
      }
    }

    const materialParam = searchParams.get('material');
    if (materialParam) {
      const matchingTpl = CARD_TEMPLATES.find((t) => t.materialId === materialParam);
      if (matchingTpl) {
        setSelectedTemplateId(matchingTpl.id);
      }
    }

    const resumeParam = searchParams.get('resume');
    if (resumeParam === 'true') {
      // Returned from login: if shipping is already filled, keep them at step 4
      setCurrentStep(4);
    }
  }, [searchParams]);

  // Persist current state whenever inputs change
  useEffect(() => {
    try {
      const stateToSave = {
        currentStep,
        selectedLinkType,
        selectedProfileAlias,
        customLinkAlias,
        selectedTemplateId,
        customArtworkFront,
        customArtworkBack,
        customOrientation,
        personalization,
        shipping,
        quantity,
      };
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.warn('Failed to save order state to localStorage:', err);
    }
  }, [
    currentStep,
    selectedLinkType,
    selectedProfileAlias,
    customLinkAlias,
    selectedTemplateId,
    customArtworkFront,
    customArtworkBack,
    customOrientation,
    personalization,
    shipping,
    quantity,
  ]);

  // Fetch profiles if user is logged in
  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoadingProfiles(true);
      fetch('/api/profile/list')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.profiles) && data.profiles.length > 0) {
            setUserProfiles(data.profiles);
            // Default select primary or first profile if not already selected
            if (!selectedProfileAlias) {
              const primary = data.profiles.find((p: any) => p.isPrimary) || data.profiles[0];
              setSelectedProfileAlias(primary.alias);
              // Pre-fill personalization if blank
              setPersonalization((prev) => ({
                ...prev,
                firstName: prev.firstName || (session?.user?.name ? session.user.name.split(' ')[0] : primary.displayName),
                lastName: prev.lastName || (session?.user?.name ? session.user.name.split(' ').slice(1).join(' ') : ''),
                jobTitle: prev.jobTitle || primary.headline || '',
              }));
            }
          }
        })
        .catch((err) => console.error('Error fetching profiles:', err))
        .finally(() => setIsLoadingProfiles(false));

      // Pre-fill shipping email and recipient name from session
      if (session?.user) {
        setShipping((prev) => ({
          ...prev,
          fullName: prev.fullName || session.user?.name || '',
          email: prev.email || session.user?.email || '',
        }));
      }
    }
  }, [status, session]);

  // Price Calculation
  const baseCardPrice = activeTemplate.basePrice;
  const shippingFee = 150; // Standard Afghanistan delivery fee (English numbers)
  const subtotal = baseCardPrice * quantity;
  const totalPrice = subtotal + shippingFee;

  // =========================================================================
  // 4. STEP NAVIGATION & ACTION HANDLERS
  // =========================================================================

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (selectedLinkType === 'profile' && !selectedProfileAlias && userProfiles.length > 0) {
        setSelectedProfileAlias(userProfiles[0].alias);
      }
      if (selectedLinkType === 'custom' && !customLinkAlias.trim()) {
        alert('لطفاً نام یا آدرس لینک مورد نظر خود را وارد نمایید.');
        return;
      }
    }
    if (currentStep === 2) {
      if (selectedTemplateId === 'tpl-custom-artwork' && !customArtworkFront) {
        alert('لطفاً فایل طرح اختصاصی روی کارت را آپلود نمایید یا یکی از طرح‌های آماده را انتخاب کنید.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!personalization.firstName.trim()) {
        alert('لطفاً نام درج‌شده روی کارت را مشخص نمایید.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // "ساخت لینک جدید" card handler -> saves state and goes to editor
  const handleCreateNewLink = () => {
    try {
      const stateToSave = {
        currentStep: 2,
        selectedLinkType: 'profile',
        selectedProfileAlias,
        customLinkAlias,
        selectedTemplateId,
        customArtworkFront,
        customArtworkBack,
        customOrientation,
        personalization,
        shipping,
        quantity,
      };
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn(e);
    }
    router.push('/dashboard/editor?returnTo=/order?step=2');
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم فایل لوگو نباید بیشتر از 5 مگابایت باشد.');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPersonalization((prev) => ({
        ...prev,
        logoUrl: reader.result as string,
      }));
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      alert('خطا در خواندن فایل لوگو.');
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  // Custom artwork upload handler (front or back)
  const handleArtworkUpload = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از 15 مگابایت باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (side === 'front') {
        setCustomArtworkFront(reader.result as string);
      } else {
        setCustomArtworkBack(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Final Order Checkout & Payment
  const handleFinalCheckout = async () => {
    if (!shipping.fullName.trim() || !shipping.phone.trim() || !shipping.streetAddress.trim()) {
      alert('لطفاً مشخصات گیرنده شامل نام، شماره مبایل و آدرس دقیق را تکمیل نمایید.');
      return;
    }

    // AUTH CHECK: If not logged in, save state and redirect to login
    if (status !== 'authenticated' || !session?.user?.id) {
      try {
        localStorage.setItem(
          WIZARD_STORAGE_KEY,
          JSON.stringify({
            currentStep: 4,
            selectedLinkType,
            selectedProfileAlias,
            customLinkAlias,
            selectedTemplateId,
            customArtworkFront,
            customArtworkBack,
            customOrientation,
            personalization,
            shipping,
            quantity,
          })
        );
      } catch (e) {
        console.warn(e);
      }
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: shipping.fullName,
        customerEmail: shipping.email || session.user.email || 'customer@example.com',
        customerPhone: shipping.phone,
        productTitle: `کارت فیزیکی هوشمند NFC - مدل ${activeTemplate.name} (${activeTemplate.materialName})`,
        quantity: quantity,
        unitPrice: baseCardPrice,
        totalPrice: totalPrice,
        currency: 'AFN',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        paymentMethod: 'HesabPay / Cash on Delivery',
        cardSpecs: {
          material: activeTemplate.materialName,
          templateId: activeTemplate.id,
          templateName: activeTemplate.name,
          orientation: effectiveOrientation,
          firstName: personalization.firstName,
          lastName: personalization.lastName,
          jobTitle: personalization.jobTitle,
          companyName: personalization.companyName,
          logoUrl: personalization.logoUrl,
          finishAccent: personalization.finishAccent,
          cardUrl: resolvedCardUrl,
          customArtworkFront: customArtworkFront,
          customArtworkBack: customArtworkBack,
        },
        notes: `ولایت: ${shipping.province} | شهر: ${shipping.city} | آدرس: ${shipping.streetAddress} | لینک کارت: ${resolvedCardUrl} | نام درج‌شده: ${personalization.firstName} ${personalization.lastName} | سمت: ${personalization.jobTitle} | تم فینیش: ${personalization.finishAccent} | یادداشت: ${shipping.notes}`,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'خطا در ثبت سفارش.');
      }

      // Success! Clear draft and show confirmation
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      setOrderSuccessData({
        orderNumber: data.order?.orderNumber || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        totalPrice: totalPrice,
        customerName: shipping.fullName,
        province: shipping.province,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter templates
  const filteredTemplates = CARD_TEMPLATES.filter((tpl) => {
    if (templateFilter === 'horizontal') return tpl.orientation === 'horizontal';
    if (templateFilter === 'vertical') return tpl.orientation === 'vertical';
    if (templateFilter === 'custom') return tpl.id === 'tpl-custom-artwork';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-foreground py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/20" dir="rtl">
      {/* Background Ambience Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* ===================================================================
            HEADER & USER PROFILE GREETING
            =================================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مرحله 42: سفارش رسمی کارت فیزیکی هوشمند NFC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              درخواست و شخصیسازی کارت فیزیکی
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              مراحل 4گانه زیر را تکمیل کنید تا کارت اختصاصی شما با تکنولوژی NFC آماده و ارسال گردد.
            </p>
          </div>

          {/* User Profile Badge if Logged In */}
          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20 text-sm">
                {session.user.name ? session.user.name.charAt(0) : 'U'}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{session.user.name || 'کاربر گرامی'}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                  {session.user.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/login?callbackUrl=/order?resume=true`}>
                <Button variant="outline" size="sm" className="rounded-xl border-white/15 text-xs text-white hover:bg-white/10">
                  ورود به حساب
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* If Order Already Completed */}
        {orderSuccessData ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-10 text-center max-w-2xl mx-auto backdrop-blur-xl shadow-2xl space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                سفارش با موفقیت ثبت شد
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                تبریک! سفارش شما وارد صف چاپ گردید
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                کارت هوشمند شما پس از بررسی طراحی و کدگذاری چیپست NFC، طی 2 الی 4 روز کاری به آدرس شما ارسال خواهد شد.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-right space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">شماره رهگیری سفارش:</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{orderSuccessData.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">تحویل‌گیرنده:</span>
                <span className="font-semibold text-white">{orderSuccessData.customerName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">ولایت مقصد:</span>
                <span className="font-semibold text-white">{orderSuccessData.province}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">مبلغ نهایی پرداختی:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {orderSuccessData.totalPrice.toLocaleString()} AFN
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/dashboard/orders">
                <Button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25">
                  مشاهده در داشبورد سفارشات
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="w-full sm:w-auto h-11 px-6 rounded-xl border-white/15 text-white text-xs hover:bg-white/10 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ فاکتور رسمی</span>
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ===================================================================
                STEPPER PROGRESS BAR
                =================================================================== */}
            <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative">
                {[
                  { step: 1, title: 'انتخاب یا ساخت لینک', desc: 'اتصال به پروفایل هوشمند' },
                  { step: 2, title: 'انتخاب طرح کارت', desc: 'بیش از 10 ماکاپ پرمیوم' },
                  { step: 3, title: 'شخصیسازی زنده', desc: 'نام، تخصص، لوگو و QR' },
                  { step: 4, title: 'اطلاعات ارسال و پرداخت', desc: 'آدرس و صدور فاکتور' },
                ].map((item) => {
                  const isCurrent = currentStep === item.step;
                  const isCompleted = currentStep > item.step;
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => {
                        if (isCompleted) setCurrentStep(item.step);
                      }}
                      disabled={!isCompleted && !isCurrent}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl transition-all text-right relative',
                        isCurrent
                          ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10'
                          : isCompleted
                          ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 cursor-pointer'
                          : 'bg-transparent border border-transparent text-slate-500 opacity-60 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                          isCurrent
                            ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/40'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-white/10 text-slate-400'
                        )}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : item.step}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===================================================================
                STEP 1: LINK SELECTION OR CREATION
                =================================================================== */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-cyan-400" />
                      <span>مرحله 1: کدام لینک به کارت NFC متصل شود؟</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      وقتی مشتریان گوشی خود را به کارت شما نزدیک میکنند یا QR کد را اسکن میکنند، این صفحه برایشان باز میشود.
                    </p>
                  </div>

                  {/* Option A: User's Existing Saved Profiles */}
                  {userProfiles.length > 0 ? (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-300 block">
                        لینک‌های ساخته‌شده در حساب کاربری شما:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {userProfiles.map((p) => {
                          const isSelected = selectedLinkType === 'profile' && selectedProfileAlias === p.alias;
                          return (
                            <div
                              key={p._id}
                              onClick={() => {
                                setSelectedLinkType('profile');
                                setSelectedProfileAlias(p.alias);
                              }}
                              className={cn(
                                'p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                                isSelected
                                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/15'
                                  : 'bg-white/5 border-white/10 hover:border-white/20'
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                                  {p.avatarUrl ? (
                                    <img src={p.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                                  ) : (
                                    p.displayName.charAt(0)
                                  )}
                                </div>
                                <div className="min-w-0 text-right">
                                  <div className="text-xs font-bold text-white truncate">{p.displayName}</div>
                                  <div className="text-[11px] font-mono text-cyan-400 truncate" dir="ltr">
                                    aryal.ink/{p.alias}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  'w-5 h-5 rounded-full border flex items-center justify-center shrink-0',
                                  isSelected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/20'
                                )}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Option B: Enter Custom Alias or Handle */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      یا تعیین شناسه لینک اختصاصی:
                    </label>
                    <div
                      onClick={() => setSelectedLinkType('custom')}
                      className={cn(
                        'p-4 rounded-2xl border transition-all',
                        selectedLinkType === 'custom'
                          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/15'
                          : 'bg-white/5 border-white/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border flex items-center justify-center shrink-0',
                            selectedLinkType === 'custom' ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/20'
                          )}
                        >
                          {selectedLinkType === 'custom' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-bold text-white">شناسه دلخواه (Handle)</span>
                          <p className="text-[11px] text-slate-400">
                            میتوانید نام تجاری یا نام انگلیسی خود را وارد نمایید.
                          </p>
                        </div>
                      </div>

                      {selectedLinkType === 'custom' && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="relative flex items-center" dir="ltr">
                            <span className="absolute left-3 text-xs font-mono text-slate-400 select-none">
                              https://aryal.ink/
                            </span>
                            <Input
                              type="text"
                              value={customLinkAlias}
                              onChange={(e) => setCustomLinkAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                              placeholder="yourname"
                              className="pl-36 pr-4 h-11 bg-black/50 border-white/20 text-white font-mono text-xs rounded-xl focus:border-cyan-400"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1.5 text-right">
                            پیش‌نمایش آدرس نهایی: <span className="font-mono text-cyan-400" dir="ltr">{resolvedCardUrl}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option C: Prominent Card for Creating New Link in Editor */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1 text-center sm:text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>هنوز لینکی نساخته‌اید؟</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        ساخت یک پروفایل دیجیتال هوشمند در سازنده لینک
                      </h3>
                      <p className="text-xs text-slate-300 max-w-lg">
                        میتوانید ابتدا در ویرایشگر حرفهای لینک خود را بسازید؛ استیت سفارش ذخیره شده و پس از ذخیره، مستقیماً به مرحله انتخاب کارت بازمیگردید.
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={handleCreateNewLink}
                      className="h-11 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>ورود به ویرایشگر پروفایل</span>
                    </Button>
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="h-12 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/25 flex items-center gap-2"
                  >
                    <span>تأیید لینک و مرحله بعد (انتخاب طرح)</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ===================================================================
                STEP 2: TEMPLATE GALLERY (10+ MOCKUPS, HORIZONTAL & VERTICAL)
                =================================================================== */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-cyan-400" />
                        <span>مرحله 2: انتخاب طرح و متریال کارت (گالری ماکاپ‌ها)</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        طرح مد نظر خود را از میان ماکاپ‌های لوکس افقی و عمودی انتخاب فرمایید.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl overflow-x-auto">
                      {[
                        { id: 'all', label: 'همه طرح‌ها (12)' },
                        { id: 'horizontal', label: 'کارت‌های افقی' },
                        { id: 'vertical', label: 'کارت‌های عمودی' },
                        { id: 'custom', label: 'طرح اختصاصی' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setTemplateFilter(tab.id as any)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                            templateFilter === tab.id
                              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                              : 'text-slate-400 hover:text-white'
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Templates Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredTemplates.map((tpl) => {
                      const isSelected = selectedTemplateId === tpl.id;
                      const isVertical = tpl.orientation === 'vertical';

                      return (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={cn(
                            'p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden',
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-500 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                          )}
                        >
                          {/* Mini Realistic Card Mockup Preview */}
                          <div className="w-full flex items-center justify-center py-4 bg-black/40 rounded-xl border border-white/5 mb-4 relative overflow-hidden">
                            <div
                              className={cn(
                                'rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-105 relative flex flex-col justify-between p-3 border border-white/15 overflow-hidden',
                                isVertical ? 'w-28 h-44' : 'w-48 h-28',
                                `bg-gradient-to-br ${tpl.bgGradient}`
                              )}
                            >
                              {/* Shimmer overlay */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-40 pointer-events-none" />

                              {/* Card Top */}
                              <div className="flex items-center justify-between relative z-10">
                                <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
                                  <Zap className="w-2.5 h-2.5" style={{ color: tpl.accentColor }} />
                                </div>
                                <span className="font-mono text-[8px] font-bold tracking-widest text-white/70">
                                  ARYA LINK
                                </span>
                              </div>

                              {/* Card Middle Chip */}
                              <div className="relative z-10 flex items-center gap-1.5">
                                <div className="w-6 h-4 rounded-sm bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 shadow-xs border border-amber-300/50" />
                                <div className="w-2 h-2 rounded-full border border-white/30 animate-pulse" />
                              </div>

                              {/* Card Bottom */}
                              <div className="relative z-10 text-right">
                                <div className="text-[9px] font-bold text-white truncate">
                                  {personalization.firstName || 'نام و تخلص'}
                                </div>
                                <div className="text-[7px] text-white/70 truncate">
                                  {tpl.materialName}
                                </div>
                              </div>
                            </div>

                            {/* Badge */}
                            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 border border-white/10 text-cyan-400">
                              {isVertical ? 'عمودی (Vertical)' : 'افقی (Horizontal)'}
                            </span>
                          </div>

                          {/* Card Details */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {tpl.name}
                              </h3>
                              <div
                                className={cn(
                                  'w-5 h-5 rounded-full border flex items-center justify-center shrink-0',
                                  isSelected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/20'
                                )}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2">
                              {tpl.description}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                              <span className="text-slate-400 text-[11px]">{tpl.materialName}</span>
                              <span className="font-bold text-cyan-400 font-mono">
                                {tpl.basePrice.toLocaleString()} AFN
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* If Custom Artwork Selected -> Show Dedicated Upload Panel */}
                  {selectedTemplateId === 'tpl-custom-artwork' && (
                    <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/40 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                        <Upload className="w-4 h-4" />
                        <span>آپلود فایل‌های طراحی اختصاصی (چاپ دو رو UV)</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        ابعاد استاندارد کارت ویزیت هوشمند: 85.6mm × 54mm با رزولوشن 300 DPI و پالت CMYK یا RGB.
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                        <span>جهت کارت سفارشی:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="customOrientation"
                            checked={customOrientation === 'horizontal'}
                            onChange={() => setCustomOrientation('horizontal')}
                            className="accent-cyan-500"
                          />
                          <span>افقی (85.6 × 54 mm)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="customOrientation"
                            checked={customOrientation === 'vertical'}
                            onChange={() => setCustomOrientation('vertical')}
                            className="accent-cyan-500"
                          />
                          <span>عمودی (54 × 85.6 mm)</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Front File Upload */}
                        <div className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-5 text-center hover:border-indigo-400 transition-colors bg-black/30">
                          {customArtworkFront ? (
                            <div className="space-y-3">
                              <img src={customArtworkFront} alt="Front preview" className="max-h-36 mx-auto rounded-lg shadow-md" />
                              <button
                                type="button"
                                onClick={() => setCustomArtworkFront('')}
                                className="text-xs text-rose-400 hover:underline"
                              >
                                حذف و تغییر فایل روی کارت
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer block space-y-2">
                              <ImageIcon className="w-8 h-8 text-indigo-400 mx-auto" />
                              <div className="text-xs font-bold text-white">آپلود طرح روی کارت (Front)</div>
                              <div className="text-[10px] text-slate-400">فایل PNG, JPG, PDF یا SVG (حداکثر 15MB)</div>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleArtworkUpload('front', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Back File Upload */}
                        <div className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-5 text-center hover:border-indigo-400 transition-colors bg-black/30">
                          {customArtworkBack ? (
                            <div className="space-y-3">
                              <img src={customArtworkBack} alt="Back preview" className="max-h-36 mx-auto rounded-lg shadow-md" />
                              <button
                                type="button"
                                onClick={() => setCustomArtworkBack('')}
                                className="text-xs text-rose-400 hover:underline"
                              >
                                حذف و تغییر فایل پشت کارت
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer block space-y-2">
                              <QrCode className="w-8 h-8 text-indigo-400 mx-auto" />
                              <div className="text-xs font-bold text-white">آپلود طرح پشت کارت (Back - اختیاری)</div>
                              <div className="text-[10px] text-slate-400">کد QR به شکل خودکار توسط تیم ما تطبیق داده میشود</div>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleArtworkUpload('back', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2 Actions */}
                <div className="flex justify-between items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="h-12 px-6 rounded-2xl border-white/15 text-white text-xs hover:bg-white/10 flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>مرحله قبل</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="h-12 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/25 flex items-center gap-2"
                  >
                    <span>تأیید طرح و شخصی‌سازی زنده</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ===================================================================
                STEP 3: LIVE PERSONALIZATION & REAL-TIME 3D CARD PREVIEW
                =================================================================== */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* LEFT COLUMN: LIVE REAL-TIME 3D CARD SIMULATOR (Sticky on Desktop) */}
                  <div className="lg:col-span-6 sticky top-24 space-y-4">
                    <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col items-center">
                      <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">پیش‌نمایش زنده کارت فیزیکی</span>
                          <span className="text-[11px] text-cyan-400 font-mono">مدل: {activeTemplate.name}</span>
                        </div>

                        {/* Flip Card Toggle Button */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCardSide((prev) => (prev === 'front' ? 'back' : 'front'))}
                          className="rounded-xl border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs flex items-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>{cardSide === 'front' ? 'مشاهده پشت کارت' : 'مشاهده روی کارت'}</span>
                        </Button>
                      </div>

                      {/* 3D Card Simulator Box */}
                      <div className="w-full py-6 flex items-center justify-center min-h-[380px] perspective-1000">
                        <motion.div
                          animate={{ rotateY: cardSide === 'back' ? 180 : 0 }}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                          className={cn(
                            'rounded-2xl shadow-2xl relative border border-white/20 overflow-hidden transform-style-3d select-none transition-all duration-300',
                            effectiveOrientation === 'vertical' ? 'w-[230px] h-[364px]' : 'w-[360px] h-[228px]',
                            `bg-gradient-to-br ${activeTemplate.bgGradient}`
                          )}
                          style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.15)',
                          }}
                        >
                          {/* ================= FRONT SIDE ================= */}
                          <div
                            className={cn(
                              'absolute inset-0 p-5 flex flex-col justify-between backface-hidden',
                              cardSide === 'back' ? 'pointer-events-none' : ''
                            )}
                          >
                            {/* Card Header: Contactless NFC & Brand */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                                  <Zap className="w-4 h-4" style={{ color: activeTemplate.accentColor }} />
                                </div>
                                <span className="font-mono text-[9px] font-black tracking-widest text-white/80">
                                  NFC ENABLED
                                </span>
                              </div>

                              {/* Logo / Company Mark if Uploaded */}
                              {personalization.logoUrl ? (
                                <img
                                  src={personalization.logoUrl}
                                  alt="Brand Logo"
                                  className="h-7 max-w-[80px] object-contain filter drop-shadow-md"
                                />
                              ) : (
                                <div className="font-mono text-[10px] font-bold text-white/50 tracking-wider">
                                  {personalization.companyName || 'ARYA LINK'}
                                </div>
                              )}
                            </div>

                            {/* Middle Chip Simulating Gold / Silver Contactless Smart Chip */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 shadow-md border border-amber-300/60 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10 grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5 opacity-40">
                                  <div className="border border-black/20" />
                                  <div className="border border-black/20" />
                                  <div className="border border-black/20" />
                                  <div className="border border-black/20" />
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <div className="w-3 h-0.5 bg-white/40 rounded-full" />
                                <div className="w-2 h-0.5 bg-white/40 rounded-full" />
                              </div>
                            </div>

                            {/* Card Holder Name & Job Title */}
                            <div className="space-y-1 text-right">
                              <div
                                className="text-base sm:text-lg font-black tracking-tight drop-shadow-md truncate"
                                style={{ color: activeTemplate.textColor }}
                              >
                                {personalization.firstName || personalization.lastName
                                  ? `${personalization.firstName} ${personalization.lastName}`.trim()
                                  : 'نام و تخلص شما'}
                              </div>
                              <div className="text-[11px] font-medium text-white/70 truncate">
                                {personalization.jobTitle || 'موقعیت شغلی یا عنوان سازمان'}
                              </div>
                              <div className="text-[9px] font-mono text-cyan-400/90 tracking-wider pt-0.5" dir="ltr">
                                {resolvedCardUrl}
                              </div>
                            </div>
                          </div>

                          {/* ================= BACK SIDE ================= */}
                          <div
                            className={cn(
                              'absolute inset-0 p-5 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950/95',
                              cardSide === 'front' ? 'pointer-events-none' : ''
                            )}
                          >
                            {/* Magnetic Stripe / Tech Bar */}
                            <div className="w-full h-8 bg-zinc-900 border-y border-white/10 -mx-5 px-5 flex items-center justify-end">
                              <span className="font-mono text-[8px] text-white/30 tracking-widest">
                                ARYA-NFC-SECURE-CHIP-V4
                              </span>
                            </div>

                            {/* Live Automated QR Code Rendering */}
                            <div className="flex items-center justify-between gap-4">
                              <div className="bg-white p-2.5 rounded-xl shadow-xl shrink-0">
                                <QRCodeSVG
                                  value={resolvedCardUrl}
                                  size={effectiveOrientation === 'vertical' ? 84 : 76}
                                  level="M"
                                  includeMargin={false}
                                />
                              </div>

                              <div className="text-right space-y-1 min-w-0">
                                <div className="text-[11px] font-bold text-white">اسکن یا لمس کارت</div>
                                <p className="text-[9px] text-slate-400 leading-relaxed">
                                  گوشی خود را به این کارت نزدیک کنید یا با دوربین کد QR را اسکن فرمایید.
                                </p>
                                <div className="font-mono text-[9px] text-cyan-400 truncate" dir="ltr">
                                  {resolvedCardUrl}
                                </div>
                              </div>
                            </div>

                            {/* Footer Signature */}
                            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[8px] text-slate-500 font-mono">
                              <span>MADE WITH ARYA LINK</span>
                              <span>TAG: NTAG216</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="text-center text-[11px] text-slate-400">
                        <span>روی دکمه «مشاهده پشت کارت» کلیک کنید تا کد QR زنده را مشاهده نمایید.</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: PERSONALIZATION INPUT FORM */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-5">
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <User className="w-5 h-5 text-cyan-400" />
                          <span>اطلاعات مندرج روی کارت فیزیکی</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          هر متنی که در اینجا وارد کنید، بلافاصله روی پیش‌نمایش زنده کارت نمایش داده می‌شود.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">نام (First Name) *</label>
                          <Input
                            type="text"
                            value={personalization.firstName}
                            onChange={(e) => setPersonalization((prev) => ({ ...prev, firstName: e.target.value }))}
                            placeholder="مثال: حامد"
                            className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">تخلص / نام خانوادگی (Last Name)</label>
                          <Input
                            type="text"
                            value={personalization.lastName}
                            onChange={(e) => setPersonalization((prev) => ({ ...prev, lastName: e.target.value }))}
                            placeholder="مثال: فصیحی"
                            className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">موقعیت شغلی یا عنوان سازمان</label>
                        <Input
                          type="text"
                          value={personalization.jobTitle}
                          onChange={(e) => setPersonalization((prev) => ({ ...prev, jobTitle: e.target.value }))}
                          placeholder="مثال: مدیر ارشد فناوری (CTO) - شرکت آریاتک"
                          className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">نام شرکت / برند (Company Name)</label>
                        <Input
                          type="text"
                          value={personalization.companyName}
                          onChange={(e) => setPersonalization((prev) => ({ ...prev, companyName: e.target.value }))}
                          placeholder="مثال: آریاتک هولدینگ"
                          className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs"
                        />
                      </div>

                      {/* Logo Upload */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>آپلود لوگوی شرکت یا برند (اختیاری)</span>
                          {personalization.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setPersonalization((prev) => ({ ...prev, logoUrl: '' }))}
                              className="text-xs text-rose-400 hover:underline"
                            >
                              حذف لوگو
                            </button>
                          )}
                        </label>

                        {personalization.logoUrl ? (
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
                            <img
                              src={personalization.logoUrl}
                              alt="Logo preview"
                              className="w-12 h-12 object-contain bg-white/5 rounded-lg p-1 border border-white/10"
                            />
                            <div className="flex-1 text-right">
                              <div className="text-xs font-bold text-white">لوگو بارگذاری شد</div>
                              <div className="text-[10px] text-slate-400">لوگو در گوشه بالای کارت درج گردید.</div>
                            </div>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center cursor-pointer hover:border-cyan-400 transition-colors block bg-black/30">
                            <Upload className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                            <span className="text-xs font-bold text-white block">انتخاب فایل لوگو (PNG یا SVG شفاف)</span>
                            <span className="text-[10px] text-slate-400">حداکثر 5 مگابایت</span>
                            <input
                              type="file"
                              accept="image/png,image/svg+xml,image/jpeg"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Finish Accent Selection */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <label className="text-xs font-semibold text-slate-300 block">
                          افکت متالیک نوشته‌ها و خطوط:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'gold', name: 'طلای متالیک', color: 'bg-amber-400' },
                            { id: 'silver', name: 'نقره‌ای صیقلی', color: 'bg-slate-300' },
                            { id: 'cyan', name: 'سایان نئون', color: 'bg-cyan-400' },
                            { id: 'minimal', name: 'سفید خالص', color: 'bg-white' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setPersonalization((prev) => ({ ...prev, finishAccent: f.id }))}
                              className={cn(
                                'p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all',
                                personalization.finishAccent === f.id
                                  ? 'bg-cyan-500/10 border-cyan-400 text-white font-bold'
                                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                              )}
                            >
                              <div className={cn('w-2.5 h-2.5 rounded-full', f.color)} />
                              <span>{f.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step 3 Actions */}
                    <div className="flex justify-between items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="h-12 px-6 rounded-2xl border-white/15 text-white text-xs hover:bg-white/10 flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>مرحله قبل</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="h-12 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/25 flex items-center gap-2"
                      >
                        <span>تأیید شخصیسازی و ثبت آدرس ارسال</span>
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===================================================================
                STEP 4: SHIPPING ADDRESS & CHECKOUT INVOICE
                =================================================================== */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* LEFT COLUMN: SHIPPING ADDRESS FORM */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-5">
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Truck className="w-5 h-5 text-cyan-400" />
                          <span>مشخصات تحویل‌گیرنده و آدرس ارسال</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          سفارش شما از طریق پست اکسپرس به سراسر 34 ولایت افغانستان ارسال خواهد شد.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">نام و تخلص کامل تحویل‌گیرنده *</label>
                          <Input
                            type="text"
                            value={shipping.fullName}
                            onChange={(e) => setShipping((prev) => ({ ...prev, fullName: e.target.value }))}
                            placeholder="نام و تخلص شخص تحویل‌گیرنده"
                            className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">شماره مبایل گیرنده (WhatsApp) *</label>
                          <Input
                            type="tel"
                            value={shipping.phone}
                            onChange={(e) => setShipping((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="+93 79 123 4567"
                            dir="ltr"
                            className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">ولایت مقصد (Province) *</label>
                          <select
                            value={shipping.province}
                            onChange={(e) => setShipping((prev) => ({ ...prev, province: e.target.value }))}
                            className="w-full h-11 bg-black/40 border border-white/15 text-white rounded-xl text-xs px-3 focus:border-cyan-400 focus:outline-none"
                          >
                            {AFGHANISTAN_PROVINCES.map((p) => (
                              <option key={p} value={p} className="bg-zinc-900 text-white">
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">شهر یا ولسوالی (City/District) *</label>
                          <Input
                            type="text"
                            value={shipping.city}
                            onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))}
                            placeholder="مثال: کابل، شهر نو / هرات، درب ملک"
                            className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">آدرس دقیق پستی و محله *</label>
                        <Input
                          type="text"
                          value={shipping.streetAddress}
                          onChange={(e) => setShipping((prev) => ({ ...prev, streetAddress: e.target.value }))}
                          placeholder="کوچه، نمبر پلاک یا نام شرکت / ساختمان"
                          className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">یادداشت برای پیک یا توزیع‌کننده (اختیاری)</label>
                        <Input
                          type="text"
                          value={shipping.notes}
                          onChange={(e) => setShipping((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="توضیحات تکمیلی زمان تحویل یا شماره دوم"
                          className="h-11 bg-black/40 border-white/15 text-white rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: TRANSPARENT INVOICE BREAKDOWN & CHECKOUT BUTTON */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-5">
                      <div className="border-b border-white/10 pb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-cyan-400" />
                          <span>فاکتور نهایی و خلاصه سفارش</span>
                        </h3>
                      </div>

                      {/* Chosen Card Summary */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
                        <div
                          className={cn(
                            'w-14 h-10 rounded-lg flex items-center justify-center font-bold text-white text-[10px] shrink-0 border border-white/20',
                            `bg-gradient-to-br ${activeTemplate.bgGradient}`
                          )}
                        >
                          <Zap className="w-3.5 h-3.5" style={{ color: activeTemplate.accentColor }} />
                        </div>
                        <div className="min-w-0 text-right flex-1">
                          <div className="text-xs font-bold text-white truncate">{activeTemplate.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{activeTemplate.materialName}</div>
                          <div className="text-[10px] text-cyan-400 font-mono truncate" dir="ltr">
                            {resolvedCardUrl}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <span className="text-slate-300 font-semibold">تعداد کارت فیزیکی:</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                            className="w-7 h-7 rounded-lg bg-black/40 border border-white/20 text-white flex items-center justify-center hover:bg-white/10"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-sm text-cyan-400 w-4 text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((prev) => prev + 1)}
                            className="w-7 h-7 rounded-lg bg-black/40 border border-white/20 text-white flex items-center justify-center hover:bg-white/10"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="space-y-2.5 text-xs border-y border-white/10 py-4">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>قیمت واحد کارت ({activeTemplate.name}):</span>
                          <span className="font-mono">{baseCardPrice.toLocaleString()} AFN</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>کدگذاری و هماهنگ‌سازی تراشه NFC:</span>
                          <span className="font-bold text-emerald-400">رایگان (0 AFN)</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>جعبه هدیه و بسته‌بندی لوکس:</span>
                          <span className="font-bold text-emerald-400">رایگان (0 AFN)</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>هزینه پست اکسپرس در سراسر افغانستان:</span>
                          <span className="font-mono">{shippingFee.toLocaleString()} AFN</span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center text-sm font-bold pt-1">
                        <span className="text-white">مجموع کل قابل پرداخت:</span>
                        <span className="font-mono text-cyan-400 text-lg">
                          {totalPrice.toLocaleString()} AFN
                        </span>
                      </div>

                      {/* Guarantee Notice */}
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
                        <span>تضمین سلامت فیزیکی 100% چیپست و گارانتی تعویض 1 ساله آریا لینک.</span>
                      </div>

                      {/* Submit / Checkout Button */}
                      <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleFinalCheckout}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>در حال ثبت نهایی سفارش...</span>
                          </>
                        ) : (
                          <>
                            <PackageCheck className="w-5 h-5" />
                            <span>پرداخت و ثبت نهایی سفارش ({totalPrice.toLocaleString()} AFN)</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="h-11 px-6 rounded-2xl border-white/15 text-white text-xs hover:bg-white/10 flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>بازگشت به شخصی‌سازی</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ===================================================================
          AUTHENTICATION PROMPT MODAL (If user clicks checkout while logged out)
          =================================================================== */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">ورود جهت تکمیل سفارش و صدور فاکتور</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  اطلاعات فرم، طرح انتخابی و آدرس شما به طور کامل در مرورگر ذخیره شده است. برای اتصال کارت به حسابتان و صدور فاکتور، لطفاً وارد شوید یا ثبت‌نام کنید.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  type="button"
                  onClick={() => router.push('/login?callbackUrl=/order?resume=true')}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25"
                >
                  ورود یا ثبت‌نام (و بازگشت خودکار به همین مرحله)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full h-11 rounded-xl border-white/15 text-slate-400 hover:text-white text-xs"
                >
                  انصراف و ادامه مشاهده
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderWizardInner />
    </Suspense>
  );
}
