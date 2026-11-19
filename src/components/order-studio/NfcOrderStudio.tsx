'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Check,
  CheckCircle2,
  Info,
  Loader2,
  MessageSquare,
  PackageCheck,
  Printer,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Upload,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useBranding } from '@/lib/branding/BrandingContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import {
  PLATFORM_CENTRAL_PAYMENT_DEFAULTS,
  PaymentProviderType,
} from '@/lib/constants/paymentProviders';
import {
  AFGHANISTAN_PROVINCES,
  BadgeMode,
  BgConfig,
  CardDesignState,
  CardMaterialId,
  CardOrientation,
  CardSide,
  DEFAULT_MATERIALS,
  DEFAULT_QTY_TIERS,
  LoadedCardImages,
  MaterialOption,
  OrderConfirmationState,
  QtyTier,
  STUDIO_DRAFT_STORAGE_KEY,
  ShippingFormState,
  TEMPLATES,
  TipShape,
  UserProfileOption,
  buildOrderCardDesignPayload,
  computeSmartPaletteForSide,
  createInitialCardDesignState,
  getDiscountPercentForQty,
  normalizeApiMaterials,
  resolveQrTargetUrl,
} from './types';
import { loadCorsSafeImage, renderPrintReadyDataUrls } from './CardCanvasRenderer';
import { ColorStudioPicker } from './ColorStudioPicker';
import { ProfileLinkBinder } from './ProfileLinkBinder';
import { CheckoutPaymentPanel } from './CheckoutPaymentPanel';
import './studio.css';

const Card3DStage = dynamic(() => import('./Card3DStage'), {
  ssr: false,
  loading: () => (
    <section className="stage" aria-busy="true">
      <div className="rings" aria-hidden="true" />
      <div className="stage-glow" aria-hidden="true" />
      <div className="flex flex-col items-center gap-3 z-10 text-slate-300">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        <span className="text-xs font-semibold">3D NFC Studio...</span>
      </div>
    </section>
  ),
});

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const mime = blob.type || 'image/png';
  return new File([blob], fileName, { type: mime });
}

async function uploadStudioAsset(
  source: string | null | undefined,
  fileName: string,
  preserveOriginal = true
): Promise<string> {
  if (!source) return '';
  if (/^https?:\/\//i.test(source)) return source;
  if (!source.startsWith('data:')) return '';

  try {
    const file = await dataUrlToFile(source, fileName);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'nfc-orders');
    if (preserveOriginal) fd.append('preserveOriginal', 'true');

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.url) {
      return String(data.url);
    }
  } catch (err) {
    console.warn(`Non-critical: failed uploading studio asset ${fileName}:`, err);
  }
  return '';
}

export function NfcOrderStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { language, dir, t } = useLanguage();
  const { settings: brandingSettings } = useBranding();

  // Studio Core States
  const [step, setStep] = useState<number>(0); // 0..3
  const [activeSide, setActiveSide] = useState<CardSide>('front');
  const [sideFlipNonce, setSideFlipNonce] = useState<number>(0);
  const [tintNonce, setTintNonce] = useState<number>(0);
  const [stageVars, setStageVars] = useState<{ bg: string; accent: string }>({
    bg: '#080d19',
    accent: '#eeb61e',
  });

  const [design, setDesign] = useState<CardDesignState>(() => createInitialCardDesignState());
  const [materials, setMaterials] = useState<MaterialOption[]>(DEFAULT_MATERIALS);
  const [qtyTiers, setQtyTiers] = useState<QtyTier[]>(DEFAULT_QTY_TIERS);
  const [supportWhatsapp, setSupportWhatsapp] = useState<string>('93799123456');

  // Loaded HTMLImageElements for Canvas2D renderer
  const [loadedImages, setLoadedImages] = useState<LoadedCardImages>({
    siteLogoImg: null,
    customLogoImg: null,
    fullFrontImg: null,
    fullBackImg: null,
  });

  // User Profiles & Smart Link Binding
  const [userProfiles, setUserProfiles] = useState<UserProfileOption[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const hasAutoBoundProfileRef = useRef<boolean>(false);
  const hasRestoredDraftRef = useRef<boolean>(false);

  // Quantity, Shipping & Payment States
  const [quantity, setQuantity] = useState<number>(1);
  const [shipping, setShipping] = useState<ShippingFormState>({
    fullName: '',
    phone: '',
    email: '',
    province: AFGHANISTAN_PROVINCES[0],
    city: '',
    streetAddress: '',
    notes: '',
  });
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProviderType>('wallet');
  const [orderHesabPayMode, setOrderHesabPayMode] = useState<'direct' | 'agent'>('direct');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<boolean>(false);

  // Submission, Confirmation & Auth Modal
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatusText, setSubmitStatusText] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<OrderConfirmationState | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Refs for accessible focus management & inert editor sections
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const frontEditorRef = useRef<HTMLDivElement | null>(null);
  const backEditorRef = useRef<HTMLDivElement | null>(null);
  const fullNameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLTextAreaElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const fullFrontInputRef = useRef<HTMLInputElement | null>(null);
  const fullBackInputRef = useRef<HTMLInputElement | null>(null);

  const isCorporateUser = Boolean(
    (session?.user as any)?.accountType === 'corporate' ||
      session?.user?.subscriptionPlan === 'enterprise' ||
      session?.user?.role === 'admin' ||
      session?.user?.role === 'superadmin' ||
      userProfiles.some((p) => p.isCorporate)
  );

  // Active material object (prefers selected available material, else first available)
  const firstAvailableMaterial = useMemo(
    () => materials.find((m) => m.isAvailable) || null,
    [materials]
  );
  const hasAvailableMaterial = Boolean(firstAvailableMaterial);

  const activeMaterial = useMemo(() => {
    const matched = materials.find((m) => m.id === design.materialId);
    if (matched && matched.isAvailable) return matched;
    return firstAvailableMaterial || materials[0] || DEFAULT_MATERIALS[0];
  }, [materials, design.materialId, firstAvailableMaterial]);

  // Pricing calculation (unitPrice * qty - bulk discount + deliveryFee)
  const unitPrice = activeMaterial.price;
  const discountPercent = useMemo(() => getDiscountPercentForQty(quantity, qtyTiers), [quantity, qtyTiers]);
  const rawCardsTotal = unitPrice * quantity;
  const discountAmount = Math.round(rawCardsTotal * (discountPercent / 100));
  const subtotalAfterDiscount = rawCardsTotal - discountAmount;
  const deliveryFee = Number(storeSettings?.codSettings?.deliveryFee ?? 150);
  const totalPrice = subtotalAfterDiscount + deliveryFee;
  const currencyLabel = t('orderStudio.currency', 'افغانی');

  // Auto-select first available material whenever materials list updates or selected becomes unavailable
  useEffect(() => {
    if (!firstAvailableMaterial) return;
    const current = materials.find((m) => m.id === design.materialId);
    if (!current || !current.isAvailable) {
      setDesign((prev) => ({ ...prev, materialId: firstAvailableMaterial.id }));
    }
  }, [materials, design.materialId, firstAvailableMaterial]);

  // Keep native HTML `inert` attribute synchronized on disabled editor panels
  useEffect(() => {
    const el = frontEditorRef.current as (HTMLDivElement & { inert?: boolean }) | null;
    if (el) el.inert = Boolean(design.fullFrontDataUrl);
  }, [design.fullFrontDataUrl, step]);

  useEffect(() => {
    const el = backEditorRef.current as (HTMLDivElement & { inert?: boolean }) | null;
    if (el) el.inert = Boolean(design.fullBackDataUrl);
  }, [design.fullBackDataUrl, step]);

  // Load dynamic Site Logo from Branding Context (CORS-safe)
  useEffect(() => {
    let active = true;
    const brandLogoUrl =
      brandingSettings?.platformMainLogo?.trim() ||
      brandingSettings?.platformFavicon?.trim() ||
      brandingSettings?.companyLogo?.trim() ||
      brandingSettings?.favicon?.trim() ||
      '';

    loadCorsSafeImage(brandLogoUrl).then((img) => {
      if (active) {
        setLoadedImages((prev) => ({ ...prev, siteLogoImg: img }));
      }
    });
    return () => {
      active = false;
    };
  }, [
    brandingSettings?.platformMainLogo,
    brandingSettings?.platformFavicon,
    brandingSettings?.companyLogo,
    brandingSettings?.favicon,
  ]);

  // Sync customLogoDataUrl -> HTMLImageElement
  useEffect(() => {
    let active = true;
    loadCorsSafeImage(design.customLogoDataUrl).then((img) => {
      if (active) setLoadedImages((prev) => ({ ...prev, customLogoImg: img }));
    });
    return () => {
      active = false;
    };
  }, [design.customLogoDataUrl]);

  // Sync fullFrontDataUrl -> HTMLImageElement
  useEffect(() => {
    let active = true;
    loadCorsSafeImage(design.fullFrontDataUrl).then((img) => {
      if (active) setLoadedImages((prev) => ({ ...prev, fullFrontImg: img }));
    });
    return () => {
      active = false;
    };
  }, [design.fullFrontDataUrl]);

  // Sync fullBackDataUrl -> HTMLImageElement
  useEffect(() => {
    let active = true;
    loadCorsSafeImage(design.fullBackDataUrl).then((img) => {
      if (active) setLoadedImages((prev) => ({ ...prev, fullBackImg: img }));
    });
    return () => {
      active = false;
    };
  }, [design.fullBackDataUrl]);

  // Fetch dynamic NFC card materials, availability & quantity discounts from SystemSettings API
  useEffect(() => {
    let active = true;
    fetch('/api/settings/nfc-materials', { cache: 'no-store' })
      .then((res) => res.json())
      .then((resData) => {
        if (!active || !resData?.success) return;
        if (Array.isArray(resData.materials) && resData.materials.length > 0) {
          setMaterials(normalizeApiMaterials(resData.materials));
        }
        if (Array.isArray(resData.qtyDiscounts) && resData.qtyDiscounts.length > 0) {
          setQtyTiers(resData.qtyDiscounts);
        }
      })
      .catch(() => {
        // Fallback safely to DEFAULT_MATERIALS & DEFAULT_QTY_TIERS
      });

    // Fetch dynamic WhatsApp support number from CMS
    fetch('/api/cms/landing')
      .then((res) => res.json())
      .then((resData) => {
        if (!active || !resData?.success || !resData?.data) return;
        const rawWa = resData.data.general?.socialLinks?.whatsapp;
        if (typeof rawWa === 'string' && rawWa.trim()) {
          const digits = rawWa.replace(/[^\d]/g, '');
          if (digits.length >= 8) setSupportWhatsapp(digits);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Fetch central Store Payment Settings
  useEffect(() => {
    let active = true;
    fetch('/api/store/payment-settings')
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data?.success || !data?.settings) return;
        const s = data.settings;
        setStoreSettings(s);

        setPaymentMethod((prevMethod) => {
          const isCurrentActive =
            (prevMethod === 'wallet' &&
              s.activeMethods?.hesabpay !== false &&
              s.hesabPay?.isActive !== false) ||
            (prevMethod === 'bank' &&
              s.activeMethods?.bank !== false &&
              (!s.bankAccounts || s.bankAccounts.length > 0)) ||
            (prevMethod === 'hawala' &&
              s.activeMethods?.hawala !== false &&
              s.hawalaInfo?.isActive !== false) ||
            (prevMethod === 'crypto' &&
              s.activeMethods?.crypto !== false &&
              (!s.cryptoAddresses || s.cryptoAddresses.length > 0)) ||
            (prevMethod === 'cod' &&
              s.activeMethods?.cod !== false &&
              s.codSettings?.isActive !== false) ||
            (prevMethod === 'installment' &&
              s.activeMethods?.installment !== false &&
              s.installmentSettings?.isActive !== false);

          if (isCurrentActive) return prevMethod;
          if (s.activeMethods?.hesabpay !== false && s.hesabPay?.isActive !== false) return 'wallet';
          if (s.activeMethods?.bank !== false && (!s.bankAccounts || s.bankAccounts.length > 0)) return 'bank';
          if (s.activeMethods?.hawala !== false && s.hawalaInfo?.isActive !== false) return 'hawala';
          if (s.activeMethods?.crypto !== false && (!s.cryptoAddresses || s.cryptoAddresses.length > 0)) return 'crypto';
          if (s.activeMethods?.cod !== false && s.codSettings?.isActive !== false) return 'cod';
          if (s.activeMethods?.installment !== false && s.installmentSettings?.isActive !== false) return 'installment';
          return prevMethod;
        });
      })
      .catch((err) => console.warn('Failed to fetch store payment settings:', err));
    return () => {
      active = false;
    };
  }, []);

  // Restore saved draft from localStorage once on mount
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STUDIO_DRAFT_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed.design) {
          setDesign((prev) => ({
            ...prev,
            ...parsed.design,
            frontBg: { ...prev.frontBg, ...(parsed.design.frontBg || {}) },
            backBg: { ...prev.backBg, ...(parsed.design.backBg || {}) },
            colors: { ...prev.colors, ...(parsed.design.colors || {}) },
          }));
          hasRestoredDraftRef.current = true;
        }
        if (typeof parsed.step === 'number' && parsed.step >= 0 && parsed.step <= 3) {
          setStep(parsed.step);
        }
        if (typeof parsed.quantity === 'number' && parsed.quantity >= 1) {
          setQuantity(parsed.quantity);
        }
        if (parsed.shipping) {
          setShipping((prev) => ({ ...prev, ...parsed.shipping }));
        }
        if (parsed.paymentMethod) {
          setPaymentMethod(parsed.paymentMethod);
        }
      }
    } catch {
      // Ignore corrupt draft
    }
  }, []);

  // Save draft helper
  const persistDraft = useCallback(
    (overrideStep?: number) => {
      const payload = {
        step: overrideStep !== undefined ? overrideStep : step,
        design,
        quantity,
        shipping,
        paymentMethod,
      };
      try {
        localStorage.setItem(STUDIO_DRAFT_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Fallback slim save without large base64 images if localStorage quota exceeded
        try {
          localStorage.setItem(
            STUDIO_DRAFT_STORAGE_KEY,
            JSON.stringify({
              ...payload,
              design: {
                ...design,
                fullFrontDataUrl: null,
                fullBackDataUrl: null,
                customLogoDataUrl:
                  design.customLogoDataUrl?.startsWith('http') ? design.customLogoDataUrl : null,
              },
            })
          );
        } catch {
          // Ignore storage error
        }
      }
    },
    [step, design, quantity, shipping, paymentMethod]
  );

  useEffect(() => {
    persistDraft();
  }, [persistDraft]);

  // Handle URL Query Parameters (?step=, ?material=, ?resume=true, ?paymentSuccess=true, ?paymentFailed=true)
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const n = parseInt(stepParam, 10);
      if (n >= 1 && n <= 4) setStep(n - 1);
    }

    const materialParam = searchParams.get('material');
    if (materialParam) {
      let targetMat: CardMaterialId | null = null;
      if (materialParam === 'pvc-matte' || materialParam === 'mat-pvc') targetMat = 'pvc-matte';
      else if (materialParam === 'pvc-gloss') targetMat = 'pvc-gloss';
      else if (
        materialParam === 'metal' ||
        materialParam === 'mat-black-metal' ||
        materialParam === 'mat-gold-steel'
      ) {
        targetMat = 'metal';
      }
      if (targetMat) {
        setDesign((prev) => ({ ...prev, materialId: targetMat! }));
      }
    }

    if (searchParams.get('resume') === 'true') {
      setStep(3);
    }

    const paymentSuccess = searchParams.get('paymentSuccess');
    const orderNumberParam = searchParams.get('orderNumber');
    if (paymentSuccess === 'true' && orderNumberParam) {
      setOrderSuccess({
        orderNumber: orderNumberParam,
        totalPrice: totalPrice || 0,
        customerName: session?.user?.name || shipping.fullName || t('orderStudio.valuedCustomer', 'مشتری گرامی آریا لینک'),
        province: shipping.province || AFGHANISTAN_PROVINCES[0],
        quantity,
        paymentMethod: 'wallet',
      });
      toast.success(
        `${t('orderStudio.hesabPaySuccessToast', 'پرداخت سفارش از طریق حساب‌پی با موفقیت انجام شد:')} ${orderNumberParam}`
      );
    }

    if (searchParams.get('paymentFailed') === 'true') {
      setStep(3);
      toast.error(
        t('orderStudio.paymentFailedToast', 'پرداخت آنلاین ناموفق بود یا لغو گردید. لطفاً دوباره تلاش کنید.')
      );
    }
  }, [searchParams]);

  // Apply selected profile to card design: strictly text & links ONLY (never overrides card logo with profile avatar)
  const applyProfileToDesign = useCallback(
    (profile: UserProfileOption) => {
      const locName =
        getLocalizedText(profile.translations?.[language]?.displayName, language) ||
        profile.displayName ||
        '';
      const locRole =
        getLocalizedText(profile.translations?.[language]?.headline, language) ||
        profile.headline ||
        profile.occupation ||
        '';
      const locBio =
        getLocalizedText(profile.translations?.[language]?.bio, language) ||
        profile.bio ||
        '';
      const cleanSlogan = locBio ? locBio.trim().slice(0, 32) : '';

      setDesign((prev) => ({
        ...prev,
        bindingMode: 'profile',
        linkedProfileId: profile.id,
        linkedProfileAlias: profile.alias,
        // Automatically select Main Profile Page (Recommended) as default QR/NFC target
        linkedLinkId: null,
        linkedLinkTitle: null,
        username: profile.alias || prev.username,
        customQrUrl: '',
        name: locName || prev.name,
        role: locRole || prev.role,
        company: profile.companyName?.trim() || (profile.isCorporate ? locName : prev.company),
        slogan: cleanSlogan || prev.slogan,
      }));
    },
    [language]
  );

  // Fetch authenticated user's profiles from /api/profile/list
  useEffect(() => {
    if (status !== 'authenticated') return;
    let active = true;
    setIsLoadingProfiles(true);

    fetch('/api/profile/list')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const list: UserProfileOption[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.profiles)
          ? data.profiles
          : [];
        setUserProfiles(list);

        if (list.length > 0 && !hasAutoBoundProfileRef.current && !hasRestoredDraftRef.current) {
          hasAutoBoundProfileRef.current = true;
          applyProfileToDesign(list[0]);
        }
      })
      .catch((err) => console.warn('Failed to fetch user profiles:', err))
      .finally(() => {
        if (active) setIsLoadingProfiles(false);
      });

    if (session?.user) {
      setShipping((prev) => ({
        ...prev,
        fullName: prev.fullName || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }));
    }

    return () => {
      active = false;
    };
  }, [status, session, applyProfileToDesign]);

  // Step Navigation
  const goStep = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(3, idx));
      setStep(clamped);
      if (clamped === 0 || clamped === 1) {
        setActiveSide('front');
        setTintNonce((n) => n + 1);
      } else if (clamped === 2) {
        setActiveSide('back');
        setTintNonce((n) => n + 1);
      }
      // Route keyboard focus to new step heading after paint
      requestAnimationFrame(() => {
        stepHeadingRef.current?.focus({ preventScroll: true });
      });
    },
    []
  );

  const handleSideChange = useCallback((side: CardSide, fromDrag = false) => {
    setActiveSide(side);
    if (!fromDrag) {
      setSideFlipNonce((n) => n + 1);
    }
  }, []);

  const handleToggleOrientation = useCallback(() => {
    setDesign((prev) => ({
      ...prev,
      orientation: prev.orientation === 'vertical' ? 'horizontal' : 'vertical',
    }));
  }, []);

  const handleBgChange = useCallback(
    (
      side: 'front' | 'back',
      nextBg: BgConfig,
      options?: { animateStage?: boolean; smartAccentHex?: string }
    ) => {
      setDesign((prev) => {
        const updated: CardDesignState =
          side === 'front' ? { ...prev, frontBg: nextBg } : { ...prev, backBg: nextBg };
        if (options?.smartAccentHex) {
          updated.colors = computeSmartPaletteForSide(
            updated,
            side,
            nextBg,
            options.smartAccentHex
          );
        }
        return updated;
      });
      if (options?.animateStage) {
        setTintNonce((n) => n + 1);
      }
    },
    []
  );

  // Image file readers (Custom Logo, Full Front Artwork, Full Back Artwork)
  const readImageFile = (file: File, maxMb: number, onLoaded: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('orderStudio.errImageOnly', 'لطفاً فقط فایل تصویری انتخاب کنید.'));
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`${t('orderStudio.errMaxSize', 'حداکثر حجم مجاز فایل')}: ${maxMb}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Payment Receipt Upload (/api/receipt/upload)
  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('orderStudio.errReceiptImage', 'لطفاً عکس یا اسکرین‌شات رسید را انتخاب کنید.'));
      return;
    }
    if (file.size > 3.5 * 1024 * 1024) {
      toast.error(t('orderStudio.errReceiptSize', 'حجم عکس رسید نباید بیشتر از 3.5 مگابایت باشد.'));
      return;
    }

    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setIsUploadingReceipt(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/receipt/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setReceiptUrl(data.url);
        toast.success(t('orderStudio.receiptUploadedToast', 'تصویر رسید با موفقیت آپلود شد.'));
      } else {
        throw new Error(data.message || t('orderStudio.receiptUploadFail', 'خطا در آپلود رسید.'));
      }
    } catch (err: any) {
      toast.error(err.message || t('orderStudio.receiptUploadFail', 'خطا در آپلود رسید.'));
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Profile & Link Binding Handlers
  const handleSelectProfile = (profile: UserProfileOption) => {
    applyProfileToDesign(profile);
    toast.success(
      `${t('orderStudio.profileConnectedToast', 'پروفایل متصل شد:')} aryal.ink/${profile.alias}`
    );
  };

  const handleSelectProfileLink = (profile: UserProfileOption, linkId: string | null) => {
    if (!linkId) {
      setDesign((prev) => ({
        ...prev,
        linkedLinkId: null,
        linkedLinkTitle: null,
        customQrUrl: '',
        username: profile.alias,
      }));
      return;
    }
    const found = profile.links?.find((l) => l.id === linkId);
    if (found) {
      setDesign((prev) => ({
        ...prev,
        linkedLinkId: found.id,
        linkedLinkTitle: found.title,
        customQrUrl: found.url,
      }));
    }
  };

  const handleSelectManual = () => {
    setDesign((prev) => ({
      ...prev,
      bindingMode: 'manual',
      linkedProfileId: null,
      linkedProfileAlias: null,
      linkedLinkId: null,
      linkedLinkTitle: null,
      customQrUrl: '',
    }));
  };

  const handleCreateNewLink = () => {
    persistDraft(step);
    router.push('/dashboard/editor?returnTo=/order?step=2');
  };

  const handleSignInForProfiles = () => {
    persistDraft(step);
    router.push('/login?callbackUrl=/order');
  };

  // Final Checkout Submission (Preserves ALL Gateways & Uploads Print-Ready PNGs)
  const handleFinalCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (step < 3) {
      goStep(step + 1);
      return;
    }

    // Accessible validation with focus routing to first invalid field
    if (!shipping.fullName.trim()) {
      toast.error(t('orderStudio.valFullName', 'لطفاً نام و تخلص گیرنده را وارد نمایید.'));
      fullNameInputRef.current?.focus();
      return;
    }
    if (!shipping.phone.trim()) {
      toast.error(t('orderStudio.valPhone', 'لطفاً نمبر تماس یا واتساپ گیرنده را وارد نمایید.'));
      phoneInputRef.current?.focus();
      return;
    }
    if (!shipping.streetAddress.trim()) {
      toast.error(t('orderStudio.valAddr', 'لطفاً آدرس دقیق تحویل را وارد نمایید.'));
      addressInputRef.current?.focus();
      return;
    }

    if (
      paymentMethod === 'wallet' &&
      orderHesabPayMode === 'agent' &&
      !receiptUrl &&
      !receiptFile &&
      !transactionRef.trim()
    ) {
      toast.error(
        t(
          'orderStudio.valAgentReceipt',
          'لطفاً عکس رسید صراف / دکاندار یا کد پیگیری تراکنش را ثبت نمایید.'
        )
      );
      return;
    }

    // Guest Auth Check: persist draft & show auth modal
    if (status !== 'authenticated' || !session?.user?.id) {
      persistDraft(3);
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatusText(t('orderStudio.statusGeneratingPrint', 'در حال آماده‌سازی فایل‌های چاپ سه‌بعدی...'));

    try {
      // 1. Render crisp print-ready PNGs (front & back) at native resolution
      const { frontDataUrl, backDataUrl } = renderPrintReadyDataUrls(
        design,
        activeMaterial,
        loadedImages,
        dir
      );

      setSubmitStatusText(t('orderStudio.statusUploadingAssets', 'در حال آپلود فایل‌های چاپ در سرور ابری...'));

      // 2. Upload print PNGs + custom user images in parallel to /api/upload (Cloudinary/ImageKit)
      const stamp = Date.now();
      const [
        frontPrintImageUrl,
        backPrintImageUrl,
        customLogoUrl,
        customFrontArtworkUrl,
        customBackArtworkUrl,
      ] = await Promise.all([
        uploadStudioAsset(frontDataUrl, `card-front-print-${stamp}.png`, true),
        uploadStudioAsset(backDataUrl, `card-back-print-${stamp}.png`, true),
        uploadStudioAsset(design.customLogoDataUrl, `card-logo-${stamp}.png`, false),
        uploadStudioAsset(design.fullFrontDataUrl, `card-raw-front-${stamp}.png`, true),
        uploadStudioAsset(design.fullBackDataUrl, `card-raw-back-${stamp}.png`, true),
      ]);

      setSubmitStatusText(t('orderStudio.statusCreatingOrder', 'در حال ثبت نهایی سفارش...'));

      const activeBank =
        storeSettings?.banks?.find((b: any) => b.isActive) || storeSettings?.bankAccounts?.[0];
      const activeCrypto =
        storeSettings?.cryptos?.find((c: any) => c.isActive) || storeSettings?.cryptoAddresses?.[0];
      const hawalaData =
        storeSettings?.hawalas?.find((h: any) => h.isActive) || storeSettings?.hawalaInfo;
      const installmentData = storeSettings?.installmentSettings;
      const hesabPayWallet = storeSettings?.wallets?.find(
        (w: any) => w.id === 'hesabpay' || w.name?.toLowerCase().includes('hesabpay')
      );

      const resolvedQrUrl = resolveQrTargetUrl(design);
      const activeTemplateObj = TEMPLATES.find((tpl) => tpl.id === design.template) || TEMPLATES[0];
      const nameParts = (design.name || shipping.fullName).trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ');

      const initialOrderStatus =
        paymentMethod === 'wallet' && orderHesabPayMode === 'direct'
          ? 'pending_payment'
          : 'processing';

      const cardDesignPayload = buildOrderCardDesignPayload(
        design,
        activeMaterial,
        discountPercent,
        language,
        {
          frontPrintImageUrl,
          backPrintImageUrl,
          customLogoUrl,
          customFrontArtworkUrl,
          customBackArtworkUrl,
        }
      );

      const fullShippingAddress = [
        shipping.province,
        shipping.city.trim(),
        shipping.streetAddress.trim(),
      ]
        .filter(Boolean)
        .join(' - ');

      const orderPayload = {
        userId: session.user.id,
        profileId: design.linkedProfileId || null,
        customerName: shipping.fullName.trim(),
        customerEmail: shipping.email.trim() || session.user.email || 'customer@example.com',
        customerPhone: shipping.phone.trim(),
        productTitle: `کارت هوشمند NFC استودیو سه‌بعدی - ${activeTemplateObj.name.da} (${activeMaterial.name.da})`,
        quantity,
        unitPrice,
        totalPrice,
        currency: 'AFN',
        paymentStatus:
          paymentMethod === 'wallet' && orderHesabPayMode === 'direct'
            ? 'pending'
            : paymentMethod === 'cod' ||
              paymentMethod === 'installment' ||
              paymentMethod === 'bank' ||
              paymentMethod === 'hawala' ||
              paymentMethod === 'crypto' ||
              (paymentMethod === 'wallet' && orderHesabPayMode === 'agent')
            ? 'pending'
            : 'paid',
        orderStatus: initialOrderStatus,
        paymentMethod,
        paymentGateway: paymentMethod === 'wallet' ? 'hesabpay' : paymentMethod,
        paymentMode:
          paymentMethod === 'wallet' && orderHesabPayMode === 'direct' ? 'api' : 'manual',
        orderHesabPayMode,
        shippingAddress: fullShippingAddress,
        paymentProviderDetails: {
          providerType: paymentMethod,
          walletService:
            paymentMethod === 'wallet'
              ? orderHesabPayMode === 'direct'
                ? 'حساب‌پی (درگاه مستقیم آنلاین)'
                : 'حساب‌پی (صراف / دکاندار)'
              : undefined,
          walletAccount:
            paymentMethod === 'wallet'
              ? hesabPayWallet?.accountNumber ||
                storeSettings?.hesabPay?.accountNumber ||
                storeSettings?.walletAccount ||
                PLATFORM_CENTRAL_PAYMENT_DEFAULTS.wallet.account
              : undefined,
          bankName:
            paymentMethod === 'bank'
              ? activeBank?.bankNameFa || PLATFORM_CENTRAL_PAYMENT_DEFAULTS.bank.bank
              : undefined,
          bankAccountNumber:
            paymentMethod === 'bank'
              ? activeBank?.accountNumber || PLATFORM_CENTRAL_PAYMENT_DEFAULTS.bank.accountNumber
              : undefined,
          bankAccountHolder:
            paymentMethod === 'bank'
              ? activeBank?.accountHolder || PLATFORM_CENTRAL_PAYMENT_DEFAULTS.bank.accountHolder
              : undefined,
          hawalaExchangeName:
            paymentMethod === 'hawala'
              ? hawalaData?.exchangeName || PLATFORM_CENTRAL_PAYMENT_DEFAULTS.hawala.exchangeName
              : undefined,
          cryptoNetwork:
            paymentMethod === 'crypto'
              ? activeCrypto?.network || PLATFORM_CENTRAL_PAYMENT_DEFAULTS.crypto.network
              : undefined,
          cryptoWalletAddress:
            paymentMethod === 'crypto'
              ? activeCrypto?.walletAddress || PLATFORM_CENTRAL_PAYMENT_DEFAULTS.crypto.walletAddress
              : undefined,
          installmentTotalAmount: paymentMethod === 'installment' ? totalPrice : undefined,
          installmentDownPayment:
            paymentMethod === 'installment'
              ? Math.round(totalPrice * ((installmentData?.downPaymentPercent || 30) / 100))
              : undefined,
          installmentCount:
            paymentMethod === 'installment'
              ? installmentData?.installmentCount || 3
              : undefined,
          receiptUrl: receiptUrl || undefined,
          transactionRef: transactionRef.trim() || undefined,
        },
        deliveryFee,
        deliveryCompany: storeSettings?.codSettings?.deliveryCompany || 'پست اکسپرس افغانستان',
        isDeliverySettled: false,
        // Keep cardSpecs populated for 100% backward compatibility across existing views
        cardSpecs: {
          material: activeMaterial.name.da,
          templateId: activeTemplateObj.id,
          templateName: activeTemplateObj.name.da,
          orientation: design.orientation,
          firstName,
          lastName,
          jobTitle: design.role,
          companyName: design.company,
          logoUrl: customLogoUrl || '',
          finishAccent: design.colors.tipShape,
          cardUrl: resolvedQrUrl,
          customArtworkFront: frontPrintImageUrl || customFrontArtworkUrl || '',
          customArtworkBack: backPrintImageUrl || customBackArtworkUrl || '',
        },
        cardDesign: cardDesignPayload,
        notes: [
          `ولایت: ${shipping.province}`,
          shipping.city ? `شهر/ناحیه: ${shipping.city}` : '',
          `آدرس: ${shipping.streetAddress}`,
          `لینک QR/NFC: ${resolvedQrUrl}`,
          `جهت: ${design.orientation === 'vertical' ? 'عمودی' : 'افقی'}`,
          `تعداد: ${quantity}${discountPercent > 0 ? ` (تخفیف ${discountPercent}%)` : ''}`,
          shipping.notes ? `یادداشت: ${shipping.notes}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(
          data.message || `${t('orderStudio.errOrderSubmit', 'خطا در ثبت سفارش')} (${res.status})`
        );
      }

      // 3. HesabPay Direct Online Gateway Redirect
      if (paymentMethod === 'wallet' && orderHesabPayMode === 'direct' && data.order?._id) {
        toast.info(t('orderStudio.redirectingHesabPay', 'در حال اتصال به درگاه پرداخت آنلاین حساب‌پی...'));
        try {
          const hpRes = await fetch('/api/checkout/hesabpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.order._id }),
          });
          const hpData = await hpRes.json();
          if (hpRes.ok && hpData.success && hpData.checkoutUrl) {
            localStorage.removeItem(STUDIO_DRAFT_STORAGE_KEY);
            window.location.href = hpData.checkoutUrl;
            return;
          }
        } catch (hpErr) {
          console.warn('HesabPay redirect fallback:', hpErr);
        }
      }

      // 4. Success! Clear saved draft & show confirmation screen
      localStorage.removeItem(STUDIO_DRAFT_STORAGE_KEY);
      setOrderSuccess({
        orderNumber: data.order?.orderNumber || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        totalPrice,
        customerName: shipping.fullName.trim(),
        province: shipping.province,
        quantity,
        frontPreviewUrl: frontPrintImageUrl || frontDataUrl,
        backPreviewUrl: backPrintImageUrl || backDataUrl,
        paymentMethod,
      });
      toast.success(t('orderStudio.orderSuccessToast', 'سفارش کارت هوشمند شما با موفقیت ثبت شد!'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('NFC Studio checkout error:', err);
      toast.error(err?.message || t('orderStudio.errServer', 'خطا در برقراری ارتباط با سرور.'));
    } finally {
      setIsSubmitting(false);
      setSubmitStatusText('');
    }
  };

  // =========================================================================
  // ORDER CONFIRMATION VIEW
  // =========================================================================
  if (orderSuccess) {
    const waText = encodeURIComponent(
      `سلام، سفارش کارت NFC با شماره پیگیری ${orderSuccess.orderNumber} به نام ${orderSuccess.customerName} (${orderSuccess.quantity} عدد) به مبلغ ${orderSuccess.totalPrice.toLocaleString('en-US')} AFN ثبت شد.`
    );

    return (
      <div
        className="min-h-[calc(100svh-80px)] bg-[#080d19] text-slate-100 py-10 px-4 flex items-center justify-center"
        dir={dir}
      >
        <div className="max-w-2xl w-full rounded-3xl bg-slate-900/90 border border-sky-500/30 p-6 sm:p-9 shadow-2xl space-y-6 text-center backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Check className="w-8 h-8 stroke-[3]" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('orderStudio.confirmedBadge', 'سفارش با موفقیت ثبت شد')}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {t('orderStudio.confirmedTitle', 'تبریک! سفارش شما وارد صف چاپ و پروگرام شد')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t(
                'orderStudio.confirmedSub',
                'فایل‌های چاپی باکیفیت روی و پشت کارت شما ذخیره شد و پس از تایید، طی 2 الی 4 روز کاری به آدرس شما ارسال می‌گردد.'
              )}
            </p>
          </div>

          {/* Rendered Front & Back Print Thumbnails */}
          {(orderSuccess.frontPreviewUrl || orderSuccess.backPreviewUrl) && (
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {orderSuccess.frontPreviewUrl && (
                <div className="p-2 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <img
                    src={orderSuccess.frontPreviewUrl}
                    alt={t('orderStudio.frontSide', 'روی کارت')}
                    className="w-full h-36 object-contain rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {t('orderStudio.frontSide', 'روی کارت')}
                  </span>
                </div>
              )}
              {orderSuccess.backPreviewUrl && (
                <div className="p-2 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <img
                    src={orderSuccess.backPreviewUrl}
                    alt={t('orderStudio.backSide', 'پشت کارت')}
                    className="w-full h-36 object-contain rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    {t('orderStudio.backSide', 'پشت کارت')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Invoice Summary */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-start space-y-2.5 text-xs">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-400">{t('orderStudio.orderNumLabel', 'شماره سفارش:')}</span>
              <span className="font-mono font-bold text-sky-400 text-sm" dir="ltr">
                {orderSuccess.orderNumber}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-400">{t('orderStudio.recipientLabel', 'تحویل‌گیرنده:')}</span>
              <span className="font-semibold text-white">{orderSuccess.customerName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-400">{t('orderStudio.provinceLabel', 'ولایت مقصد:')}</span>
              <span className="font-semibold text-white">{orderSuccess.province}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t('orderStudio.finalTotalLabel', 'مبلغ نهایی:')}</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {orderSuccess.totalPrice.toLocaleString('en-US')} AFN
              </span>
            </div>
          </div>

          {/* WhatsApp Support Notice */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-start space-y-2 text-xs">
            <p className="text-slate-200 leading-relaxed text-[11px]">
              {t(
                'orderStudio.whatsappHint',
                'برای پیگیری سریع‌تر چاپ یا ارسال رسید پرداخت، می‌توانید مستقیماً با پشتیبانی واتساپ آریا لینک در ارتباط شوید:'
              )}
            </p>
            <a
              href={`https://wa.me/${supportWhatsapp}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('orderStudio.whatsappCta', 'ارسال به واتساپ پشتیبانی آریا لینک')}</span>
            </a>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center pt-1">
            <Link
              href="/dashboard/orders"
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2"
            >
              <span>{t('orderStudio.viewDashboardOrders', 'مشاهده در داشبورد سفارشات')}</span>
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="h-11 px-5 rounded-xl border border-white/15 hover:bg-white/10 text-white font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>{t('orderStudio.printInvoice', 'چاپ بل رسمی')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderSuccess(null);
                setStep(0);
              }}
              className="h-11 px-5 rounded-xl border border-white/15 hover:bg-white/10 text-slate-300 font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('orderStudio.newDesign', 'طراحی کارت جدید')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN 3D NFC CARD STUDIO LAYOUT
  // =========================================================================
  const hasFullFront = Boolean(design.fullFrontDataUrl);
  const hasFullBack = Boolean(design.fullBackDataUrl);

  const stepsMeta = [
    { idx: 0, num: '01', label: t('orderStudio.st1', 'فرم و جنس') },
    { idx: 1, num: '02', label: t('orderStudio.st2', 'روی کارت') },
    { idx: 2, num: '03', label: t('orderStudio.st3', 'پشت و QR') },
    { idx: 3, num: '04', label: t('orderStudio.st4', 'ثبت سفارش') },
  ];

  const badgeOptions: Array<{ val: BadgeMode; label: string }> = [
    { val: 'none', label: t('orderStudio.boxNone', 'بدون کادر') },
    { val: 'filled', label: t('orderStudio.boxFilled', 'توپر') },
    { val: 'outline', label: t('orderStudio.boxOutline', 'توخالی') },
  ];

  const tipShapes: Array<{ shape: TipShape; ico: string; label: string }> = [
    { shape: 'slash', ico: '／', label: t('orderStudio.shSlash', 'مورب') },
    { shape: 'square', ico: '■', label: t('orderStudio.shSquare', 'مربع') },
    { shape: 'diamond', ico: '◆', label: t('orderStudio.shDiamond', 'لوزی') },
    { shape: 'triangle', ico: '▲', label: t('orderStudio.shTri', 'مثلث') },
    { shape: 'circle', ico: '●', label: t('orderStudio.shCircle', 'دایره') },
  ];

  const isHesabPayDirect = paymentMethod === 'wallet' && orderHesabPayMode === 'direct';

  return (
    <div
      className="arya-nfc-studio"
      dir={dir}
      style={
        {
          '--stage-bg': stageVars.bg,
          '--stage-accent': stageVars.accent,
        } as React.CSSProperties
      }
    >
      {/* LEFT/START STICKY 3D STAGE */}
      <Card3DStage
        design={design}
        material={activeMaterial}
        images={loadedImages}
        step={step}
        activeSide={activeSide}
        sideFlipNonce={sideFlipNonce}
        tintNonce={tintNonce}
        dir={dir}
        onSideChange={handleSideChange}
        onToggleOrientation={handleToggleOrientation}
        onStageThemeVars={setStageVars}
      />

      {/* RIGHT/END 4-STEP CONFIGURATOR PANEL */}
      <section className="configurator" aria-label={t('orderStudio.configuratorAria', 'تنظیمات طراحی و سفارش کارت NFC')}>
        <form
          className="panel-inner"
          method="POST"
          noValidate
          onSubmit={handleFinalCheckout}
        >
          {/* 4-Step Progress Stepper */}
          <nav className="stepper" aria-label={t('orderStudio.progressLabel', 'مراحل طراحی و سفارش')}>
            {stepsMeta.map((s) => (
              <button
                key={s.idx}
                type="button"
                aria-current={step === s.idx ? 'step' : undefined}
                className={`step-pill ${step === s.idx ? 'active' : ''} ${step > s.idx ? 'done' : ''}`}
                onClick={() => goStep(s.idx)}
              >
                <span className="num">{s.num}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>

          {/* ================= STEP 1: ORIENTATION, TEMPLATE, MATERIAL & PROFILE BINDING ================= */}
          {step === 0 && (
            <div className="step-pane">
              <h1 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                {t('orderStudio.p1Title', 'جهت، قالب طراحی و جنس کارت')}
              </h1>
              <p className="step-sub">
                {t(
                  'orderStudio.p1Sub',
                  'عمودی یا افقی بودن، الگوی چاپی و جنس کارت را انتخاب کنید. با کشیدن کارت می‌توانید هر دو طرف را ببینید.'
                )}
              </p>

              {/* Smart Profile & Link Binding (Phase 2) */}
              <ProfileLinkBinder
                isAuthenticated={status === 'authenticated'}
                isLoadingProfiles={isLoadingProfiles}
                profiles={userProfiles}
                bindingMode={design.bindingMode}
                linkedProfileId={design.linkedProfileId}
                linkedLinkId={design.linkedLinkId}
                onSelectProfile={handleSelectProfile}
                onSelectProfileLink={handleSelectProfileLink}
                onSelectManual={handleSelectManual}
                onCreateNewLink={handleCreateNewLink}
                onSignInForProfiles={handleSignInForProfiles}
              />

              {/* Card Orientation */}
              <div className="field">
                <label>{t('orderStudio.lblOrient', 'جهت کارت')}</label>
                <div className="orient-grid" role="group" aria-label={t('orderStudio.lblOrient', 'جهت کارت')}>
                  {(['vertical', 'horizontal'] as CardOrientation[]).map((orient) => {
                    const isActive = design.orientation === orient;
                    return (
                      <button
                        key={orient}
                        type="button"
                        aria-pressed={isActive}
                        className={`orient-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setDesign((prev) => ({ ...prev, orientation: orient }))}
                      >
                        <span className={`mini-card-icon ${orient === 'vertical' ? 'v' : 'h'}`} aria-hidden="true" />
                        <span>
                          {orient === 'vertical'
                            ? t('orderStudio.vert', 'عمودی (مدرن)')
                            : t('orderStudio.horiz', 'افقی (کلاسیک)')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Print Templates */}
              <div className="field">
                <label>{t('orderStudio.lblTpl', 'الگوی طراحی (فرم ثابت با عناصر متغیر)')}</label>
                <div className="tpl-grid">
                  {TEMPLATES.map((tpl) => {
                    const isActive = design.template === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        aria-pressed={isActive}
                        className={`tpl-card ${isActive ? 'active' : ''}`}
                        onClick={() => setDesign((prev) => ({ ...prev, template: tpl.id }))}
                      >
                        <span className="tpl-name">{tpl.name[language] || tpl.name.da}</span>
                        <span className="tpl-desc">{tpl.desc[language] || tpl.desc.da}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Card Materials from Admin CMS (with priceWithPrint & availability status) */}
              <div className="field">
                <label>{t('orderStudio.lblMat', 'جنس و روکش کارت')}</label>
                <div className="mat-grid">
                  {materials.map((mat) => {
                    const isAvailable = mat.isAvailable !== false;
                    const isActive = isAvailable && activeMaterial.id === mat.id;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        disabled={!isAvailable}
                        aria-pressed={isActive}
                        aria-disabled={!isAvailable}
                        className={`mat-card ${isActive ? 'active' : ''} ${!isAvailable ? 'is-unavailable' : ''}`}
                        onClick={() => {
                          if (!isAvailable) return;
                          setDesign((prev) => ({ ...prev, materialId: mat.id }));
                        }}
                      >
                        <span className="mat-title">{mat.name[language] || mat.name.da}</span>
                        <span className="mat-price">
                          {mat.price.toLocaleString('en-US')} {currencyLabel}
                        </span>
                        {isAvailable ? (
                          <span className="mat-sub-badge print">
                            {t('orderStudio.withPrint', 'با چاپ')}
                          </span>
                        ) : (
                          <span className="mat-sub-badge oos">
                            {t('orderStudio.outOfStock', 'ناموجود')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {!hasAvailableMaterial && (
                  <p className="text-[11px] text-rose-400 pt-1">
                    {t('orderStudio.noMaterialsAvailable', 'در حال حاضر هیچ متریالی موجود نیست. لطفاً بعداً بررسی نمایید.')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: FRONT SIDE DESIGN ================= */}
          {step === 1 && (
            <div className="step-pane">
              <h2 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                {t('orderStudio.p2Title', 'طراحی، رنگ‌ها و عناصر روی کارت')}
              </h2>

              {/* Ready-Made Full-Bleed Front Artwork Upload */}
              <div className={`ready-upload-box ${hasFullFront ? 'has-image' : ''}`}>
                <div className="ready-head">
                  <span>{t('orderStudio.readyFrontTitle', 'طرح آماده برای روی کارت دارید؟')}</span>
                  {hasFullFront && (
                    <span className="text-[10.5px] text-emerald-400">
                      {t('orderStudio.uploadedBadge', 'طرح آماده فعال شد ✓')}
                    </span>
                  )}
                </div>
                <p className="ready-sub">
                  {t(
                    'orderStudio.readyFrontSub',
                    'با آپلود عکس طرح آماده، سایر گزینه‌های این تب غیرفعال می‌شوند و طرح شما با افکت و نورپردازی سه‌بعدی روی کارت چاپ می‌شود.'
                  )}
                </p>
                <div className="ready-actions">
                  <label className="ready-btn">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <input
                      ref={fullFrontInputRef}
                      type="file"
                      accept="image/*"
                      className="visually-hidden-input"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        readImageFile(f, 10, (url) =>
                          setDesign((prev) => ({ ...prev, fullFrontDataUrl: url }))
                        );
                      }}
                    />
                    <span>{t('orderStudio.btnUploadFull', 'آپلود طرح آماده روی کارت')}</span>
                  </label>
                  {hasFullFront && (
                    <>
                      <button
                        type="button"
                        className="fit-btn"
                        onClick={() =>
                          setDesign((prev) => ({
                            ...prev,
                            fullFrontFit: prev.fullFrontFit === 'cover' ? 'contain' : 'cover',
                          }))
                        }
                      >
                        {design.fullFrontFit === 'cover'
                          ? t('orderStudio.fitCover', 'پر کردن کامل')
                          : t('orderStudio.fitContain', 'نمایش کامل')}
                      </button>
                      <button
                        type="button"
                        className="clear-logo"
                        onClick={() => {
                          setDesign((prev) => ({ ...prev, fullFrontDataUrl: null }));
                          if (fullFrontInputRef.current) fullFrontInputRef.current.value = '';
                        }}
                      >
                        {t('orderStudio.btnClearFull', 'حذف و ویرایش')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Front Editor Controls (Disabled & inert when full artwork is active) */}
              <div
                ref={frontEditorRef}
                className={`editor-controls ${hasFullFront ? 'is-disabled' : ''}`}
                aria-disabled={hasFullFront}
              >
                <div className="field">
                  <label>{t('orderStudio.lblFrontBg', 'رنگ و گرادیانت پس‌زمینه روی کارت')}</label>
                  <ColorStudioPicker
                    idPrefix="front-bg"
                    bg={design.frontBg}
                    onChange={(nextBg, opts) => handleBgChange('front', nextBg, opts)}
                  />
                </div>

                {/* Company / Brand + Color */}
                <div className="field">
                  <label htmlFor="studio-inp-company">
                    {t('orderStudio.lblCompany', 'نام نهاد / فروشگاه / برند و رنگ متن')}
                  </label>
                  <div className="input-with-color">
                    <input
                      id="studio-inp-company"
                      name="card_company"
                      type="text"
                      maxLength={28}
                      value={design.company}
                      onChange={(e) => setDesign((prev) => ({ ...prev, company: e.target.value }))}
                      className="studio-input"
                    />
                    <label
                      className="swatch-input"
                      title={t('orderStudio.lblCompanyColor', 'رنگ نام برند')}
                    >
                      <input
                        aria-label={t('orderStudio.lblCompanyColor', 'رنگ نام برند')}
                        type="color"
                        value={design.colors.company}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, company: e.target.value },
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* Slogan + Frame Mode + Colors */}
                <div className="sub-box">
                  <div className="field">
                    <label htmlFor="studio-inp-slogan">
                      {t('orderStudio.lblSlogan', 'شعار شرکت / زیرعنوان و رنگ متن')}
                    </label>
                    <div className="input-with-color">
                      <input
                        id="studio-inp-slogan"
                        name="card_slogan"
                        type="text"
                        maxLength={32}
                        value={design.slogan}
                        onChange={(e) => setDesign((prev) => ({ ...prev, slogan: e.target.value }))}
                        className="studio-input"
                      />
                      <label
                        className="swatch-input"
                        title={t('orderStudio.lblSloganColor', 'رنگ متن شعار')}
                      >
                        <input
                          aria-label={t('orderStudio.lblSloganColor', 'رنگ متن شعار')}
                          type="color"
                          value={design.colors.slogan}
                          onChange={(e) =>
                            setDesign((prev) => ({
                              ...prev,
                              colors: { ...prev.colors, slogan: e.target.value },
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="field">
                    <label>{t('orderStudio.lblSloganBox', 'کادر زیر شعار شرکت')}</label>
                    <div className="badge-ctrl">
                      <div className="seg-mini" role="group" aria-label={t('orderStudio.lblSloganBox', 'کادر زیر شعار شرکت')}>
                        {badgeOptions.map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            aria-pressed={design.sloganBadgeMode === opt.val}
                            className={design.sloganBadgeMode === opt.val ? 'active' : ''}
                            onClick={() =>
                              setDesign((prev) => ({ ...prev, sloganBadgeMode: opt.val }))
                            }
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <label
                        className="swatch-input"
                        style={{ width: 36, height: 34 }}
                        title={t('orderStudio.lblSloganBoxColor', 'رنگ کادر شعار')}
                      >
                        <input
                          aria-label={t('orderStudio.lblSloganBoxColor', 'رنگ کادر شعار')}
                          type="color"
                          value={design.colors.sloganBadge}
                          onChange={(e) =>
                            setDesign((prev) => ({
                              ...prev,
                              colors: { ...prev.colors, sloganBadge: e.target.value },
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Front Lines & Tip Ornament */}
                <div className="sub-box">
                  <div className="sub-box-head">
                    {t('orderStudio.lblFrontLines', 'خطوط روی کارت و شکل نوک خط')}
                  </div>
                  <div className="shape-strip" role="group" aria-label={t('orderStudio.tipCol', 'شکل نوک')}>
                    {tipShapes.map((item) => (
                      <button
                        key={item.shape}
                        type="button"
                        aria-pressed={design.tipShape === item.shape}
                        className={`shape-btn ${design.tipShape === item.shape ? 'active' : ''}`}
                        onClick={() => setDesign((prev) => ({ ...prev, tipShape: item.shape }))}
                      >
                        <span className="ico" aria-hidden="true">
                          {item.ico}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="color-chips-row">
                    <label className="picker-pill">
                      <span>{t('orderStudio.lineTop', 'خط بالا / اول')}</span>
                      <input
                        type="color"
                        value={design.colors.frontLine1}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, frontLine1: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="picker-pill">
                      <span>{t('orderStudio.lineBot', 'خط پایین / دوم')}</span>
                      <input
                        type="color"
                        value={design.colors.frontLine2}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, frontLine2: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="picker-pill">
                      <span>{t('orderStudio.tipCol', 'رنگ شکل نوک')}</span>
                      <input
                        type="color"
                        value={design.colors.tipShape}
                        onChange={(e) => {
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, tipShape: e.target.value },
                          }));
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Custom Logo Upload */}
                <div className="field">
                  <label>
                    {t(
                      'orderStudio.lblLogo',
                      'لوگوی اختصاصی (در صورت خالی بودن، لوگوی سایت نمایش داده می‌شود)'
                    )}
                  </label>
                  <div className="upload-row">
                    <label className="upload-btn">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="visually-hidden-input"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          readImageFile(f, 5, (url) =>
                            setDesign((prev) => ({ ...prev, customLogoDataUrl: url }))
                          );
                        }}
                      />
                      <span>{t('orderStudio.btnUpload', 'آپلود لوگو برای چاپ روی کارت')}</span>
                    </label>
                    {design.customLogoDataUrl && (
                      <button
                        type="button"
                        className="clear-logo"
                        onClick={() => {
                          setDesign((prev) => ({ ...prev, customLogoDataUrl: null }));
                          if (logoInputRef.current) logoInputRef.current.value = '';
                        }}
                      >
                        {t('orderStudio.btnRemove', 'حذف')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: BACK SIDE & SCANNABLE QR ================= */}
          {step === 2 && (
            <div className="step-pane">
              <h2 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                {t('orderStudio.p3Title', 'پشت کارت، مشخصات و کیوآر کد')}
              </h2>

              {/* Ready-Made Full-Bleed Back Artwork Upload */}
              <div className={`ready-upload-box ${hasFullBack ? 'has-image' : ''}`}>
                <div className="ready-head">
                  <span>{t('orderStudio.readyBackTitle', 'طرح آماده برای پشت کارت دارید؟')}</span>
                  {hasFullBack && (
                    <span className="text-[10.5px] text-emerald-400">
                      {t('orderStudio.uploadedBadge', 'طرح آماده فعال شد ✓')}
                    </span>
                  )}
                </div>
                <p className="ready-sub">
                  {t(
                    'orderStudio.readyBackSub',
                    'با آپلود عکس طرح آماده، سایر گزینه‌های پشت کارت غیرفعال می‌شوند و فقط عکس شما با افکت سه‌بعدی نمایش داده می‌شود.'
                  )}
                </p>
                <div className="ready-actions">
                  <label className="ready-btn">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <input
                      ref={fullBackInputRef}
                      type="file"
                      accept="image/*"
                      className="visually-hidden-input"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        readImageFile(f, 10, (url) =>
                          setDesign((prev) => ({ ...prev, fullBackDataUrl: url }))
                        );
                      }}
                    />
                    <span>{t('orderStudio.btnUploadFullBack', 'آپلود طرح آماده پشت کارت')}</span>
                  </label>
                  {hasFullBack && (
                    <>
                      <button
                        type="button"
                        className="fit-btn"
                        onClick={() =>
                          setDesign((prev) => ({
                            ...prev,
                            fullBackFit: prev.fullBackFit === 'cover' ? 'contain' : 'cover',
                          }))
                        }
                      >
                        {design.fullBackFit === 'cover'
                          ? t('orderStudio.fitCover', 'پر کردن کامل')
                          : t('orderStudio.fitContain', 'نمایش کامل')}
                      </button>
                      <button
                        type="button"
                        className="clear-logo"
                        onClick={() => {
                          setDesign((prev) => ({ ...prev, fullBackDataUrl: null }));
                          if (fullBackInputRef.current) fullBackInputRef.current.value = '';
                        }}
                      >
                        {t('orderStudio.btnClearFull', 'حذف و ویرایش')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Back Editor Controls (Disabled & inert when full back artwork is active) */}
              <div
                ref={backEditorRef}
                className={`editor-controls ${hasFullBack ? 'is-disabled' : ''}`}
                aria-disabled={hasFullBack}
              >
                {/* Full Name + Color */}
                <div className="field">
                  <label htmlFor="studio-inp-name">
                    {t('orderStudio.lblName', 'نام و تخلص و رنگ متن')}
                  </label>
                  <div className="input-with-color">
                    <input
                      id="studio-inp-name"
                      name="card_name"
                      type="text"
                      maxLength={30}
                      value={design.name}
                      onChange={(e) => setDesign((prev) => ({ ...prev, name: e.target.value }))}
                      className="studio-input"
                    />
                    <label className="swatch-input" title={t('orderStudio.lblNameColor', 'رنگ نام')}>
                      <input
                        aria-label={t('orderStudio.lblNameColor', 'رنگ نام')}
                        type="color"
                        value={design.colors.name}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, name: e.target.value },
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* Role / Job Title + Frame Mode + Colors */}
                <div className="sub-box">
                  <div className="field">
                    <label htmlFor="studio-inp-role">
                      {t('orderStudio.lblRole', 'عنوان وظیفوی و رنگ متن')}
                    </label>
                    <div className="input-with-color">
                      <input
                        id="studio-inp-role"
                        name="card_role"
                        type="text"
                        maxLength={30}
                        value={design.role}
                        onChange={(e) => setDesign((prev) => ({ ...prev, role: e.target.value }))}
                        className="studio-input"
                      />
                      <label
                        className="swatch-input"
                        title={t('orderStudio.lblRoleColor', 'رنگ عنوان وظیفوی')}
                      >
                        <input
                          aria-label={t('orderStudio.lblRoleColor', 'رنگ عنوان وظیفوی')}
                          type="color"
                          value={design.colors.role}
                          onChange={(e) =>
                            setDesign((prev) => ({
                              ...prev,
                              colors: { ...prev.colors, role: e.target.value },
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="field">
                    <label>{t('orderStudio.lblRoleBox', 'کادر زیر عنوان وظیفوی')}</label>
                    <div className="badge-ctrl">
                      <div className="seg-mini" role="group" aria-label={t('orderStudio.lblRoleBox', 'کادر زیر عنوان وظیفوی')}>
                        {badgeOptions.map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            aria-pressed={design.roleBadgeMode === opt.val}
                            className={design.roleBadgeMode === opt.val ? 'active' : ''}
                            onClick={() =>
                              setDesign((prev) => ({ ...prev, roleBadgeMode: opt.val }))
                            }
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <label
                        className="swatch-input"
                        style={{ width: 36, height: 34 }}
                        title={t('orderStudio.lblRoleBoxColor', 'رنگ کادر عنوان وظیفوی')}
                      >
                        <input
                          aria-label={t('orderStudio.lblRoleBoxColor', 'رنگ کادر عنوان وظیفوی')}
                          type="color"
                          value={design.colors.roleBadge}
                          onChange={(e) =>
                            setDesign((prev) => ({
                              ...prev,
                              colors: { ...prev.colors, roleBadge: e.target.value },
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Profile URL (Encoded inside QR ONLY — NEVER drawn as text on card) */}
                <div className="field">
                  <label htmlFor="studio-inp-user">
                    {t('orderStudio.lblUser', 'لینک پروفایل (فقط داخل کیوآر کد ذخیره می‌شود)')}
                  </label>
                  {design.linkedLinkId && design.customQrUrl ? (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-sky-500/10 border border-sky-400/30 text-xs">
                      <div className="min-w-0">
                        <span className="text-[10px] text-sky-300 block">
                          {design.linkedLinkTitle}
                        </span>
                        <span className="font-mono text-white text-[11px] truncate block" dir="ltr">
                          {design.customQrUrl}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDesign((prev) => ({
                            ...prev,
                            linkedLinkId: null,
                            linkedLinkTitle: null,
                            customQrUrl: '',
                          }))
                        }
                        className="text-[10px] text-rose-300 hover:underline shrink-0 cursor-pointer"
                      >
                        {t('orderStudio.btnRemove', 'حذف')}
                      </button>
                    </div>
                  ) : (
                    <div className="prefix-wrap">
                      <span className="prefix-tag">aryal.ink/</span>
                      <input
                        id="studio-inp-user"
                        name="card_username"
                        type="text"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        maxLength={32}
                        value={design.username}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            username: e.target.value,
                            customQrUrl: '',
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Sync Back Background Toggle */}
                <div
                  className="toggle-row"
                  onClick={() => {
                    setDesign((prev) => ({ ...prev, syncBackBg: !prev.syncBackBg }));
                    setTintNonce((n) => n + 1);
                  }}
                >
                  <span>{t('orderStudio.lblSyncBg', 'رنگ پشت کارت مثل روی کارت باشد')}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={design.syncBackBg}
                    aria-label={t('orderStudio.lblSyncBg', 'رنگ پشت کارت مثل روی کارت باشد')}
                    className="studio-switch"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDesign((prev) => ({ ...prev, syncBackBg: !prev.syncBackBg }));
                      setTintNonce((n) => n + 1);
                    }}
                  />
                </div>

                {!design.syncBackBg && (
                  <div className="field">
                    <label>{t('orderStudio.lblBackBg', 'رنگ و گرادیانت اختصاصی پشت کارت')}</label>
                    <ColorStudioPicker
                      idPrefix="back-bg"
                      bg={design.backBg}
                      onChange={(nextBg, opts) => handleBgChange('back', nextBg, opts)}
                    />
                  </div>
                )}

                {/* Back Lines, NFC Icon & QR Colors + Visibility Toggles */}
                <div className="sub-box">
                  <div className="sub-box-head">
                    {t('orderStudio.lblBackLines', 'رنگ خطوط پشت کارت، آیکون NFC و QR')}
                  </div>
                  <div className="color-chips-row">
                    <label className="picker-pill">
                      <span>{t('orderStudio.backLine1', 'خط بالایی')}</span>
                      <input
                        type="color"
                        value={design.colors.backLine1}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, backLine1: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="picker-pill">
                      <span>{t('orderStudio.backLine2', 'خط پایینی')}</span>
                      <input
                        type="color"
                        value={design.colors.backLine2}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, backLine2: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="picker-pill">
                      <span>{t('orderStudio.nfcCol', 'آیکون NFC')}</span>
                      <input
                        type="color"
                        value={design.colors.nfc}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, nfc: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="picker-pill">
                      <span>{t('orderStudio.qrCol', 'رنگ QR')}</span>
                      <input
                        type="color"
                        value={design.colors.qr}
                        onChange={(e) =>
                          setDesign((prev) => ({
                            ...prev,
                            colors: { ...prev.colors, qr: e.target.value },
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="input-row">
                    <div
                      className="toggle-row"
                      onClick={() => setDesign((prev) => ({ ...prev, showQr: !prev.showQr }))}
                    >
                      <span>{t('orderStudio.lblShowQr', 'نمایش QR Code')}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={design.showQr}
                        aria-label={t('orderStudio.lblShowQr', 'نمایش QR Code')}
                        className="studio-switch"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDesign((prev) => ({ ...prev, showQr: !prev.showQr }));
                        }}
                      />
                    </div>
                    <div
                      className="toggle-row"
                      onClick={() => setDesign((prev) => ({ ...prev, showNfc: !prev.showNfc }))}
                    >
                      <span>{t('orderStudio.lblNfc', 'آیکون NFC')}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={design.showNfc}
                        aria-label={t('orderStudio.lblNfc', 'آیکون NFC')}
                        className="studio-switch"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDesign((prev) => ({ ...prev, showNfc: !prev.showNfc }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: QUANTITY, DELIVERY & PAYMENT GATEWAYS ================= */}
          {step === 3 && (
            <div className="step-pane">
              <h2 ref={stepHeadingRef} tabIndex={-1} className="step-title">
                {t('orderStudio.p4Title', 'تعداد، مشخصات تحویل و پرداخت')}
              </h2>
              <p className="step-sub">
                {t(
                  'orderStudio.p4Sub',
                  'هر کارت با طراحی اختصاصی شما چاپ، روی لینک پروفایل پروگرام و به تمام ولایات افغانستان ارسال می‌شود.'
                )}
              </p>

              <CheckoutPaymentPanel
                material={activeMaterial}
                qtyTiers={qtyTiers}
                quantity={quantity}
                discountPercent={discountPercent}
                unitPrice={unitPrice}
                subtotalAfterDiscount={subtotalAfterDiscount}
                discountAmount={discountAmount}
                deliveryFee={deliveryFee}
                totalPrice={totalPrice}
                shipping={shipping}
                onShippingChange={(patch) => setShipping((prev) => ({ ...prev, ...patch }))}
                onQuantityChange={setQuantity}
                storeSettings={storeSettings}
                isCorporateUser={isCorporateUser}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                orderHesabPayMode={orderHesabPayMode}
                onHesabPayModeChange={setOrderHesabPayMode}
                transactionRef={transactionRef}
                onTransactionRefChange={setTransactionRef}
                receiptFile={receiptFile}
                receiptPreview={receiptPreview}
                isUploadingReceipt={isUploadingReceipt}
                onReceiptFileChange={handleReceiptFileChange}
                onClearReceipt={() => {
                  setReceiptFile(null);
                  setReceiptPreview(null);
                  setReceiptUrl(null);
                }}
                fullNameInputRef={fullNameInputRef}
                phoneInputRef={phoneInputRef}
                addressInputRef={addressInputRef}
              />
            </div>
          )}

          {/* ================= STICKY ACTION BAR (PRICE & NAVIGATION) ================= */}
          <div className="action-bar">
            <div className="price-box">
              <span className="price-label">
                {step === 3
                  ? t('orderStudio.grandTotal', 'مجموع کل قابل پرداخت')
                  : t('orderStudio.totalLbl', 'مبلغ کارت‌ها')}
              </span>
              <span className="price-val font-mono">
                {(step === 3 ? totalPrice : subtotalAfterDiscount).toLocaleString('en-US')}{' '}
                {currencyLabel}
              </span>
              {step === 3 && (
                <span className="text-[10.5px] text-amber-300/95 mt-0.5 inline-flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>
                    {t('orderStudio.deliveryCustomerNotice', 'توجه: هزینه ارسال (پست/پیک) بر عهده مشتری است.')}
                  </span>
                </span>
              )}
            </div>

            <div className="nav-btns">
              {step > 0 && (
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={isSubmitting}
                  onClick={() => goStep(step - 1)}
                >
                  {t('orderStudio.prev', 'قبلی')}
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!hasAvailableMaterial}
                  onClick={() => goStep(step + 1)}
                >
                  {t('orderStudio.next', 'مرحله بعد')}
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || isUploadingReceipt || !hasAvailableMaterial}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>{submitStatusText || t('orderStudio.submitting', 'در حال ثبت سفارش...')}</span>
                    </>
                  ) : isHesabPayDirect ? (
                    <>
                      <Smartphone className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                      <span>
                        {t('orderStudio.payWithHesabPay', 'پرداخت با حساب‌پی')} ({totalPrice.toLocaleString('en-US')} AFN)
                      </span>
                    </>
                  ) : (
                    <>
                      <PackageCheck className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {t('orderStudio.submit', 'ثبت سفارش نهایی')} ({totalPrice.toLocaleString('en-US')} AFN)
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </section>

      {/* ================= GUEST AUTHENTICATION MODAL ================= */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-auth-modal-title"
        >
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
              <User className="w-7 h-7" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h3 id="studio-auth-modal-title" className="text-lg font-bold text-white">
                {t('orderStudio.authModalTitle', 'ورود جهت تکمیل سفارش و صدور بل')}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t(
                  'orderStudio.authModalSub',
                  'طراحی سه‌بعدی، رنگ‌ها، متن‌ها و آدرس شما به‌صورت کامل در مرورگر ذخیره شده است. برای ثبت سفارش و اتصال کارت به حساب‌تان لطفاً وارد شوید یا ثبت‌نام کنید.'
                )}
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  persistDraft(3);
                  router.push('/login?callbackUrl=/order?resume=true');
                }}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 cursor-pointer"
              >
                {t('orderStudio.authModalLoginBtn', 'ورود یا ثبت‌نام (بازگشت خودکار به همین مرحله)')}
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full h-11 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 text-xs cursor-pointer"
              >
                {t('orderStudio.authModalCancel', 'انصراف و ادامه ویرایش')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NfcOrderStudio;
