'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Crown,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Smartphone,
  Store,
  Copy,
  Check,
  Upload,
  FileImage,
  RefreshCw,
  ArrowRight,
  Calendar,
  CreditCard,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface StoreHesabPaySettings {
  isActive: boolean;
  isApiEnabled: boolean;
  isSandbox: boolean;
  merchantId: string;
  accountName: string;
  accountNumber: string;
  qrCodeImage?: string;
  instructions?: string;
}

const FREE_PLAN_FEATURES = [
  { text: 'ساخت ۱ مینی‌سایت و کارت دیجیتال شخصی', included: true },
  { text: 'ماژول‌های پایه شبکه‌های اجتماعی، تلفن و ایمیل', included: true },
  { text: 'کد QR استاندارد و لینک اختصاصی aryal.ink', included: true },
  { text: 'فعال‌سازی درگاه پرداخت شخصی (حساب‌پی، بانک و حواله)', included: false },
  { text: 'آمار پیشرفته کلیک ماژول‌ها و ردیاب کارت فیزیکی NFC', included: false },
  { text: 'حذف برندینگ و کپی‌رایت آریا لینک از پایین پروفایل', included: false },
];

const PRO_PLAN_FEATURES = [
  'فعال‌سازی درگاه پرداخت دوگانه حساب‌پی، بانک‌های افغانستان و حواله صرافی',
  'دسترسی نامحدود به تمام ماژول‌های حرفه‌ای (فروشگاه، کاتالوگ PDF، گالری، فرم تماس، ساعات کاری)',
  'آمار و تحلیل پیشرفته بازدیدها، تفکیک کلیک ماژول‌ها و ردیاب کارت‌های NFC',
  'حذف کامل کپی‌رایت و برندینگ آریا لینک از مینی‌سایت',
  'امکان ساخت تا ۵ کارت دیجیتال مجزا و اتصال دامنه اختصاصی',
  'اولویت در بررسی و دریافت نشان تیک آبی رسمی تایید هویت (KYC)',
];

function UpgradePageContent() {
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const {
    effectivePlan,
    isPro,
    isVip,
    daysRemaining,
    planExpiresAt,
    refreshSubscription,
  } = useSubscription();

  const paymentSuccess = searchParams.get('paymentSuccess') === 'true';
  const paymentFailed = searchParams.get('paymentFailed') === 'true';
  const callbackOrderNumber = searchParams.get('orderNumber') || '';

  const [annualPriceAfn, setAnnualPriceAfn] = useState<number>(4500);
  const [storeHesabPay, setStoreHesabPay] = useState<StoreHesabPaySettings>({
    isActive: true,
    isApiEnabled: true,
    isSandbox: true,
    merchantId: 'ARYALINK_MERCHANT_01',
    accountName: 'HAMID FASIHI',
    accountNumber: '0729736813',
    qrCodeImage: '',
    instructions: '',
  });
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [payerName, setPayerName] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [hesabPayMode, setHesabPayMode] = useState<'direct' | 'agent'>('direct');

  // Direct API checkout state
  const [isProcessingDirect, setIsProcessingDirect] = useState<boolean>(false);

  // Manual (Sarraf / Shopkeeper) state
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [receiptImageUrl, setReceiptImageUrl] = useState<string>('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<boolean>(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState<boolean>(false);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load CMS annual price for Pro plan if customized by Super Admin
    fetch('/api/cms/landing')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        const plans = resData?.data?.plans;
        if (Array.isArray(plans)) {
          const pro = plans.find((p: any) => p.planId === 'pro');
          if (pro?.priceYearlyMonthly && Number(pro.priceYearlyMonthly) > 0) {
            setAnnualPriceAfn(Math.round(Number(pro.priceYearlyMonthly) * 12));
          }
        }
      })
      .catch(() => {});

    // Load Super Admin StorePaymentSettings for platform HesabPay QR & API
    fetch('/api/store/payment-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        const hp = resData?.settings?.hesabPay;
        const hpWallet = Array.isArray(resData?.settings?.wallets)
          ? resData.settings.wallets.find((w: any) => w.id === 'hesabpay')
          : null;
        if (hp || hpWallet) {
          setStoreHesabPay({
            isActive: hp?.isActive !== false,
            isApiEnabled: hp?.isApiEnabled !== false,
            isSandbox: hp?.isSandbox ?? true,
            merchantId: hp?.merchantId || hpWallet?.hesabPayConfig?.merchantId || 'ARYALINK_MERCHANT_01',
            accountName: hp?.accountName || hpWallet?.accountName || 'HAMID FASIHI',
            accountNumber: hp?.accountNumber || hpWallet?.accountNumber || '0729736813',
            qrCodeImage: hp?.qrCodeImage || hpWallet?.qrCodeImage || hpWallet?.qrCodeUrl || '',
            instructions: hpWallet?.instructions || '',
          });
          if (hp?.isApiEnabled === false) {
            setHesabPayMode('agent');
          }
        }
      })
      .catch(() => {});
  }, []);

  // When redirected back from HesabPay callback with success, sync subscription & session immediately
  useEffect(() => {
    if (paymentSuccess) {
      refreshSubscription();
      updateSession().catch(() => {});
      toast.success('اشتراک سالانه پروفایل حرفه‌ای شما با موفقیت فعال شد!');
    } else if (paymentFailed) {
      toast.error('پرداخت تکمیل نشد. در صورت کسر وجه با پشتیبانی در تماس شوید یا مجدداً تلاش کنید.');
    }
  }, [paymentSuccess, paymentFailed, refreshSubscription]);

  // Pre-compute HesabPay QR payload using StorePaymentSettings (Super Admin account)
  const rawAdminPhone = (storeHesabPay.accountNumber || '0729736813').trim();
  const formattedPhone = rawAdminPhone.replace(/^0+/, '');
  const formattedName = (storeHesabPay.accountName || 'ARYALINK PLATFORM').trim().toUpperCase();
  const hesabPayQrPayload = `1:01*2:p*3:93.${formattedPhone}*4:general*5:${formattedName}*6:971*7:1307100`;

  const copyToClipboard = (text: string, key: string, label: string) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} کاپی شد`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleOpenCheckout = () => {
    setSubmittedOrderNumber(null);
    setTrackingNumber('');
    setReceiptImageUrl('');
    setPayerName(session?.user?.name || '');
    setHesabPayMode(storeHesabPay.isApiEnabled ? 'direct' : 'agent');
    setIsCheckoutOpen(true);
  };

  // Upload payment receipt image
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً صرفاً فایل تصویری (JPG یا PNG) انتخاب فرمایید.');
      return;
    }

    if (file.size > 3.5 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از 3.5 مگابایت باشد.');
      return;
    }

    setIsUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/receipt/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'خطا در آپلود تصویر فیش.');
      }

      setReceiptImageUrl(data.url);
      toast.success('تصویر فیش واریزی با موفقیت آپلود شد.');
    } catch (err: any) {
      toast.error(err.message || 'خطا در آپلود رسید.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Flow A: Direct HesabPay API Payment
  const handleDirectApiCheckout = async () => {
    setIsProcessingDirect(true);
    try {
      // 1. Create Subscription Order in MongoDB
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: 'subscription',
          productTitle: 'اشتراک سالانه پروفایل حرفه‌ای (Pro)',
          quantity: 1,
          unitPrice: annualPriceAfn,
          totalPrice: annualPriceAfn,
          currency: 'AFN',
          customerName: session?.user?.name || 'کاربر آریا لینک',
          customerEmail: session?.user?.email || '',
          customerPhone: customerPhone.trim(),
          paymentMethod: 'wallet',
          paymentGateway: 'hesabpay',
          paymentMode: 'api',
          paymentStatus: 'pending',
          orderStatus: 'pending_payment',
          notes: 'خرید اشتراک سالانه پروفایل حرفه‌ای از طریق درگاه مستقیم حساب‌پی',
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success || !orderData.order?._id) {
        throw new Error(orderData.message || 'خطا در ثبت سفارش اشتراک.');
      }

      const createdOrderId = orderData.order._id;

      // 2. Initiate HesabPay Checkout Session using Super Admin StorePaymentSettings
      const payRes = await fetch('/api/checkout/hesabpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: createdOrderId }),
      });
      const payData = await payRes.json();
      if (!payRes.ok || !payData.success || !payData.checkoutUrl) {
        throw new Error(payData.message || 'خطا در اتصال به درگاه حساب‌پی.');
      }

      toast.success('در حال انتقال به درگاه پرداخت حساب‌پی...');
      window.location.href = payData.checkoutUrl;
    } catch (err: any) {
      console.error('Subscription direct API checkout error:', err);
      toast.error(err.message || 'خطا در راه‌اندازی پرداخت مستقیم حساب‌پی.');
      setIsProcessingDirect(false);
    }
  };

  // Flow B: Manual HesabPay QR + Receipt Upload (Sarraf / Shopkeeper - stays pending until Super Admin verifies)
  const handleManualReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImageUrl) {
      toast.error('لطفاً تصویر فیش واریزی را آپلود نمایید.');
      return;
    }

    setIsSubmittingManual(true);
    try {
      const effectiveCustomerName = (payerName || session?.user?.name || 'کاربر آریا لینک').trim();
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: 'subscription',
          productTitle: 'اشتراک سالانه پروفایل حرفه‌ای (Pro)',
          quantity: 1,
          unitPrice: annualPriceAfn,
          totalPrice: annualPriceAfn,
          currency: 'AFN',
          customerName: effectiveCustomerName,
          customerEmail: session?.user?.email || '',
          customerPhone: customerPhone.trim(),
          paymentMethod: 'wallet',
          paymentGateway: 'hesabpay',
          paymentMode: 'manual',
          paymentStatus: 'pending',
          orderStatus: 'pending_payment',
          trackingNumber: trackingNumber.trim(),
          paymentProviderDetails: {
            providerType: 'wallet',
            walletService: 'حساب‌پی (HesabPay)',
            walletAccount: rawAdminPhone,
            receiptUrl: receiptImageUrl,
            transactionRef: trackingNumber.trim(),
          },
          notes: `پرداخت اشتراک سالانه Pro با فیش واریزی (${effectiveCustomerName})${
            trackingNumber.trim() ? ` - کد پیگیری: ${trackingNumber.trim()}` : ''
          }`,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'خطا در ثبت سفارش و ارسال فیش.');
      }

      setSubmittedOrderNumber(orderData.order?.orderNumber || 'SUB-ORDER');
      toast.success('سفارش اشتراک و فیش واریزی شما با موفقیت ثبت شد و پس از تایید مدیر فعال می‌گردد.');
    } catch (err: any) {
      console.error('Subscription manual receipt submit error:', err);
      toast.error(err.message || 'خطا در ثبت فیش واریزی.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const formattedMonthlyEquivalent = Math.round(annualPriceAfn / 12).toLocaleString('en-US');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8" dir="rtl">
      {/* Top Breadcrumb / Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به داشبورد کاربری</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs">
          <span className="text-muted-foreground">وضعیت فعلی حساب:</span>
          {isVip ? (
            <Badge className="bg-purple-500/15 text-purple-500 border-purple-500/30 text-[11px]">
              ویژه (VIP)
            </Badge>
          ) : isPro ? (
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px]">
              حرفه‌ای (Pro) — {daysRemaining} روز باقیمانده
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px]">
              پروفایل پایه (رایگان)
            </Badge>
          )}
        </div>
      </div>

      {/* Callback Success / Failure Banner */}
      {paymentSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                پرداخت موفق! حساب شما به پروفایل حرفه‌ای (Pro) ارتقا یافت
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                سفارش اشتراک شما {callbackOrderNumber ? `(شماره #${callbackOrderNumber})` : ''} با موفقیت تایید شد و تمامی ماژول‌های حرفه‌ای به مدت ۱ سال کامل (۳۶۵ روز) برای شما فعال گردید.
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold h-10 px-5 shrink-0">
              شروع استفاده از امکانات Pro
            </Button>
          </Link>
        </div>
      )}

      {paymentFailed && (
        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-extrabold text-rose-500">
              تراکنش در درگاه حساب‌پی تکمیل نشد
            </h2>
            <p className="text-xs text-muted-foreground">
              سفارش شما {callbackOrderNumber ? `(#${callbackOrderNumber})` : ''} در وضعیت ناموفق ثبت شد. می‌توانید دوباره روی دکمه خرید کلیک کرده یا از روش پرداخت صراف/دکاندار استفاده کنید.
            </p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>ارتقای حساب کاربری آریا لینک</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
          کارت دیجیتال خود را به یک{' '}
          <span className="bg-gradient-to-l from-amber-500 via-orange-500 to-emerald-500 bg-clip-text text-transparent">
            فروشگاه و برند حرفه‌ای
          </span>{' '}
          تبدیل کنید
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          با فعال‌سازی اشتراک سالانه پروفایل حرفه‌ای، درگاه پرداخت حساب‌پی شخصی خود را متصل کنید، کپی‌رایت را حذف نمایید و از تمام ماژول‌های ویژه استفاده ببرید.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Basic Profile (Free) */}
        <Card className="rounded-3xl border border-border bg-card/80 p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-foreground">پروفایل پایه</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  مناسب برای شروع فعالیت و معرفی شبکه‌های اجتماعی شخصی
                </p>
              </div>
              <Badge variant="outline" className="text-[11px] font-bold px-2.5 py-1">
                رایگان همیشگی
              </Badge>
            </div>

            <div className="py-4 border-y border-border/70 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-sans text-foreground">0</span>
              <span className="text-xs font-bold text-muted-foreground">افغانی / ماهانه</span>
            </div>

            <ul className="space-y-3">
              {FREE_PLAN_FEATURES.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs">
                  {feat.included ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      feat.included
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground/70 line-through'
                    }
                  >
                    {feat.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled
            className="w-full h-12 rounded-2xl border-border text-xs font-bold"
          >
            {effectivePlan === 'free' ? 'پلن فعلی شما (رایگان)' : 'شامل پلن فعلی شما است'}
          </Button>
        </Card>

        {/* Card 2: Pro Profile (Annual Subscription) */}
        <Card className="relative rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-500/[0.06] via-card to-card p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-2xl shadow-emerald-500/10 overflow-hidden">
          {/* Decorative Corner Badge */}
          <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-br-2xl flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" />
            <span>پیشنهاد ویژه • اشتراک سالانه</span>
          </div>

          <div className="space-y-5 pt-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h2 className="text-xl font-black text-foreground">پروفایل حرفه‌ای</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  مخصوص کسب‌وکارها، فروشگاه‌ها، متخصصان، پزشکان و شرکت‌های افغانستان
                </p>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold">
                ۱ سال کامل (۳۶۵ روز)
              </Badge>
            </div>

            <div className="py-4 border-y border-emerald-500/20 flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-sans text-emerald-600 dark:text-emerald-400">
                  {annualPriceAfn.toLocaleString('en-US')}
                </span>
                <span className="text-xs font-bold text-foreground">افغانی / سالانه</span>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                فقط {formattedMonthlyEquivalent} افغانی در ماه
              </span>
            </div>

            <ul className="space-y-3">
              {PRO_PLAN_FEATURES.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground font-semibold leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            {isPro && planExpiresAt ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>اشتراک حرفه‌ای شما فعال است ({daysRemaining} روز باقیمانده)</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-sans">
                  تاریخ انقضا: {new Date(planExpiresAt).toLocaleDateString('fa-AF')}
                </div>
              </div>
            ) : null}

            <Button
              type="button"
              onClick={handleOpenCheckout}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25 transition-all active:scale-[0.99] cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>{isPro ? 'تمدید ۱ ساله پروفایل حرفه‌ای' : 'خرید پروفایل حرفه‌ای'}</span>
            </Button>

            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>پرداخت امن از طریق درگاه دوگانه حساب‌پی (پرداخت مستقیم اپلیکیشن یا صراف / دکاندار)</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Dual-Mode HesabPay Subscription Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent
          className="max-w-lg w-[94vw] max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-950 border border-slate-800 text-white p-5 sm:p-6 shadow-2xl [&>button]:left-4 [&>button]:right-auto"
          overlayClassName="backdrop-blur-md bg-black/70"
          dir="rtl"
        >
          <DialogHeader className="text-right space-y-1.5 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CreditCard className="w-4 h-4" />
              <span>درگاه پرداخت دوگانه پلتفرم آریا لینک</span>
            </div>
            <DialogTitle className="text-base sm:text-lg font-black text-white">
              تکمیل خرید اشتراک سالانه پروفایل حرفه‌ای
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              مبلغ قابل پرداخت: <strong className="text-emerald-400 font-sans">{annualPriceAfn.toLocaleString('en-US')} افغانی</strong> برای ۱ سال (۳۶۵ روز)
            </DialogDescription>
          </DialogHeader>

          {submittedOrderNumber ? (
            /* Manual Submission Confirmation View */
            <div className="py-6 space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-white">
                  سفارش اشتراک و فیش واریزی شما ثبت شد
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  شماره پیگیری سفارش: <strong className="text-cyan-400 font-mono" dir="ltr">{submittedOrderNumber}</strong>
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تیم مالی آریا لینک فیش ارسالی شما را بررسی می‌کند و بلافاصله پس از تایید، پروفایل حرفه‌ای (Pro) به مدت ۳۶۵ روز به صورت خودکار روی حساب شما فعال می‌گردد.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  متوجه شدم
                </Button>
                <Link href="/dashboard/orders" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 rounded-xl border-slate-700 bg-slate-900 text-slate-200 font-bold text-xs"
                  >
                    مشاهده در سفارشات من
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Optional Contact Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  شماره مبایل جهت پیامک تاییدیه (اختیاری):
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="مثلاً 0799123456"
                  dir="ltr"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Dual-Mode HesabPay Selector */}
              <div className="space-y-2 p-2.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-[11px] font-bold text-slate-300 block px-1">
                  نحوه پرداخت با حساب‌پی را انتخاب فرمایید:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!storeHesabPay.isApiEnabled}
                    onClick={() => setHesabPayMode('direct')}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      hesabPayMode === 'direct'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        hesabPayMode === 'direct'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">خودم اپلیکیشن حساب‌پی دارم</span>
                      <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                        (پرداخت مستقیم و فعال‌سازی آنی)
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHesabPayMode('agent')}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer ${
                      hesabPayMode === 'agent'
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        hesabPayMode === 'agent'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">توسط صراف / دکاندار</span>
                      <span className="text-[10px] text-cyan-300/80 block mt-0.5">
                        (اسکن کیوآر کد + آپلود فیش)
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* MODE A: Direct API Checkout */}
              {hesabPayMode === 'direct' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3.5">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">پرداخت آنلاین مستقیم حساب‌پی (فعال‌سازی خودکار)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    با کلیک روی دکمه زیر، سفارش اشتراک ثبت شده و به درگاه رسمی حساب‌پی پلتفرم منتقل می‌شوید. پس از تکمیل پرداخت، اشتراک ۱ ساله Pro فوراً و به‌صورت خودکار روی حساب شما فعال می‌شود.
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">شناسه پذیرنده رسمی پلتفرم:</span>
                    <span className="font-mono text-emerald-400 font-bold" dir="ltr">
                      {storeHesabPay.merchantId}
                    </span>
                  </div>

                  <Button
                    type="button"
                    disabled={isProcessingDirect}
                    onClick={handleDirectApiCheckout}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] cursor-pointer"
                  >
                    {isProcessingDirect ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>در حال ثبت سفارش و اتصال به حساب‌پی...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>ثبت سفارش و ورود به درگاه حساب‌پی ({annualPriceAfn.toLocaleString('en-US')} AFN)</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* MODE B: Manual QR Code + Receipt Upload */}
              {hesabPayMode === 'agent' && (
                <form onSubmit={handleManualReceiptSubmit} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-2.5">
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                      {storeHesabPay.qrCodeImage ? (
                        <img
                          src={storeHesabPay.qrCodeImage}
                          alt="QR Code حساب‌پی آریا لینک"
                          className="w-[156px] h-[156px] object-contain rounded-lg"
                        />
                      ) : (
                        <QRCodeSVG value={hesabPayQrPayload} size={156} level="M" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      این کیوآر کد را به صراف یا دکاندار نشان دهید تا مبلغ {annualPriceAfn.toLocaleString('en-US')} افغانی را واریز نماید
                    </span>
                    <span className="text-[10px] text-slate-400">
                      نام صاحب حساب پلتفرم: <strong className="text-white">{storeHesabPay.accountName}</strong>
                    </span>
                    {storeHesabPay.instructions && (
                      <p className="text-[11px] text-slate-300 bg-slate-900/70 border border-white/10 rounded-xl p-2.5 w-full text-right leading-relaxed">
                        {storeHesabPay.instructions}
                      </p>
                    )}
                  </div>

                  {/* Platform Account Number Copy Box */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-300 font-medium block">
                      شماره مبایل / حساب رسمی حساب‌پی آریا لینک:
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/15 gap-2">
                      <span className="font-mono text-sm text-emerald-400 font-bold" dir="ltr">
                        {rawAdminPhone}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(rawAdminPhone, 'admin_hp', 'شماره حساب')}
                        className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'admin_hp' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>کاپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کاپی</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Receipt Upload & Tracking Reference */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        نام پرداخت‌کننده:
                      </label>
                      <input
                        type="text"
                        value={payerName}
                        onChange={(e) => setPayerName(e.target.value)}
                        placeholder="نام و تخلص واریزکننده"
                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        شماره پیگیری / کد تراکنش فیش (اختیاری):
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="مثلاً TX-849201"
                        dir="ltr"
                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        آپلود عکس فیش واریزی:
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                      {receiptImageUrl ? (
                        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileImage className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs text-emerald-300 font-semibold truncate">
                              تصویر فیش آپلود شد
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[11px] text-cyan-400 hover:underline shrink-0 cursor-pointer"
                          >
                            تغییر عکس
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isUploadingReceipt}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/60 text-xs text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          {isUploadingReceipt ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                              <span>در حال آپلود تصویر فیش...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-cyan-400" />
                              <span>انتخاب و آپلود تصویر فیش واریزی</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingManual || isUploadingReceipt}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    {isSubmittingManual ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>در حال ثبت سفارش و ارسال فیش...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ثبت سفارش اشتراک و ارسال فیش واریزی</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <UpgradePageContent />
    </Suspense>
  );
}

