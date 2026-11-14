'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Copy,
  Check,
  CreditCard,
  Building2,
  Wallet,
  Coins,
  Truck,
  CalendarClock,
  Phone,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Upload,
  FileImage,
  RefreshCw,
  X,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProfileLinkItem, PaymentMethodItem } from '@/types/profile.types';
import {
  PAYMENT_PROVIDERS,
  AFGHAN_WALLETS,
  AFGHAN_BANKS,
  CRYPTO_NETWORKS,
  PaymentProviderType,
} from '@/lib/constants/paymentProviders';
import { PaymentCustomSelect, PaymentSelectOption } from './PaymentCustomSelect';
import { PaymentLogoBadge } from './PaymentLogos';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  link?: ProfileLinkItem | null;
  profileName?: string;
  recipientPhone?: string;
  profileId?: string;
  profileAlias?: string;
  profileFinancialSettings?: {
    hesabPay?: {
      isActive?: boolean;
      isApiEnabled?: boolean;
      merchantId?: string;
      accountNumber?: string;
      accountName?: string;
      qrCodeImage?: string;
      instructions?: string;
    };
    [key: string]: any;
  } | null;
  customDetails?: {
    title?: string;
    amount?: number;
    currency?: string;
    providerType?: PaymentProviderType;
  };
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  link,
  profileName = 'صاحب پروفایل',
  recipientPhone,
  profileId,
  profileAlias,
  profileFinancialSettings,
  customDetails,
}) => {
  const meta = link?.metadata || {};

  // Extract multi-methods from metadata or fallback to single legacy method
  const rawMethods: PaymentMethodItem[] =
    Array.isArray(meta.supportedMethods) && meta.supportedMethods.length > 0
      ? meta.supportedMethods
      : [
        {
          id: 'pm_primary',
          providerType: customDetails?.providerType || meta.paymentProviderType || 'wallet',
          walletService: meta.paymentWalletService || meta.walletService || 'HesabPay',
          walletAccount: meta.paymentWalletAccount || meta.walletAccount || '',
          bankName: meta.paymentBankName || meta.bankName || 'AIB',
          bankAccountHolder: meta.paymentAccountHolder || meta.bankAccountHolder || '',
          bankAccountNumber: meta.paymentAccountNumber || meta.bankAccountNumber || '',
          hawalaExchangeName: meta.paymentHawalaSarafiName || meta.hawalaExchangeName || '',
          hawalaReceiverName: meta.paymentHawalaReceiverName || meta.hawalaReceiverName || '',
          hawalaReceiverPhone: meta.paymentHawalaReceiverPhone || meta.hawalaReceiverPhone || '',
          hawalaCityBranch: meta.paymentHawalaBranchCity || meta.hawalaCityBranch || '',
          cryptoNetwork: meta.paymentCryptoNetwork || meta.cryptoNetwork || 'TRC20',
          cryptoWalletAddress: meta.paymentCryptoAddress || meta.cryptoWalletAddress || '',
        },
      ];

  const [selectedMethodId, setSelectedMethodId] = useState<string>(rawMethods[0]?.id || 'pm_primary');

  // Fetch store payment settings to pick up Super Admin uploaded logos
  const [storePaymentSettings, setStorePaymentSettings] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/store/payment-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.success && data?.settings) {
          setStorePaymentSettings(data.settings);
        }
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync selected method if link updates
  useEffect(() => {
    if (rawMethods.length > 0 && !rawMethods.some((m) => m.id === selectedMethodId)) {
      setSelectedMethodId(rawMethods[0].id);
    }
  }, [link]);

  const activeMethod = rawMethods.find((m) => m?.id === selectedMethodId) || rawMethods[0] || {
    id: 'pm_primary',
    providerType: 'wallet',
    walletService: 'HesabPay',
  };
  const activeProviderType: PaymentProviderType =
    (activeMethod?.providerType as PaymentProviderType) || 'wallet';
  const providerDef = PAYMENT_PROVIDERS[activeProviderType] || PAYMENT_PROVIDERS.wallet;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Offline Receipt Upload, Payer Name & Tracking States
  const [payerName, setPayerName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [receiptSubmitted, setReceiptSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayTitle = customDetails?.title || link?.title || providerDef.title;
  const amount = customDetails?.amount ?? meta.paymentAmount;
  const currency = customDetails?.currency ?? meta.paymentCurrency ?? 'AFN';
  const currencyLabel = currency === 'AFN' ? 'افغانی' : 'دالر';

  const copyToClipboard = (text: string, key: string, label: string) => {
    if (!text) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} با موفقیت کاپی شد`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Receipt File Upload Handler
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
        throw new Error(data.message || 'خطا در بارگذاری فیش رسید.');
      }

      setReceiptImageUrl(data.url);
      toast.success('تصویر فیش رسید با موفقیت بارگذاری گردید.');
    } catch (err: any) {
      console.error('Receipt upload error:', err);
      toast.error(err.message || 'خطا در آپلود رسید.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Build Options for Top Method Switcher
  const methodSelectOptions: PaymentSelectOption[] = rawMethods.map((m, idx) => {
    let title = '';
    let subtitle = '';
    let logoId = '';
    let customLogoUrl: string | undefined = undefined;

    if (m.providerType === 'wallet') {
      const w = AFGHAN_WALLETS.find((wal) => wal.id === m.walletService) || AFGHAN_WALLETS[0];
      title = `${w.nameFa}`;
      subtitle = m.walletAccount ? `شماره: ${m.walletAccount}` : w.providerCompany;
      logoId = w.id;
      const sMatch = storePaymentSettings?.wallets?.find(
        (sw: any) => (sw.id || '').toLowerCase() === (m.walletService || '').toLowerCase()
      );
      customLogoUrl = sMatch?.logoUrl || undefined;
    } else if (m.providerType === 'bank') {
      const b = AFGHAN_BANKS.find((bnk) => bnk.id === m.bankName) || AFGHAN_BANKS[1];
      title = `${b.nameFa}`;
      subtitle = m.bankAccountHolder || b.name;
      logoId = b.id;
      const sMatch = storePaymentSettings?.banks?.find(
        (sb: any) =>
          (sb.id || '').toLowerCase() === (m.bankName || '').toLowerCase() ||
          (sb.bankName || '').toLowerCase() === (m.bankName || '').toLowerCase()
      );
      customLogoUrl = sMatch?.logoUrl || undefined;
    } else if (m.providerType === 'hawala') {
      title = m.hawalaExchangeName || 'حواله صرافی معتبر';
      subtitle = m.hawalaReceiverName ? `گیرنده: ${m.hawalaReceiverName}` : (m.hawalaCityBranch || 'سرای شهزاده');
      logoId = 'hawala';
      customLogoUrl = storePaymentSettings?.hawalas?.[0]?.logoUrl || undefined;
    } else if (m.providerType === 'crypto') {
      title = `تتر USDT (${m.cryptoNetwork || 'TRC20'})`;
      subtitle = m.cryptoWalletAddress ? `${m.cryptoWalletAddress.slice(0, 10)}...` : 'کیف پول بلاکچین';
      logoId = 'usdt';
      const sMatch = storePaymentSettings?.cryptos?.find(
        (sc: any) =>
          (sc.id || '').toLowerCase() === (m.cryptoNetwork || '').toLowerCase() ||
          (sc.network || '').toLowerCase() === (m.cryptoNetwork || '').toLowerCase()
      );
      customLogoUrl = sMatch?.logoUrl || undefined;
    }

    return {
      id: m.id,
      title,
      subtitle,
      badge: `روش ${idx + 1}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      type: m.providerType as PaymentProviderType,
      logoId,
      customLogoUrl,
    };
  });

  // WhatsApp Message Preparation
  const resolvedPhone =
    recipientPhone || activeMethod.hawalaReceiverPhone || meta.paymentHawalaReceiverPhone || meta.hawalaReceiverPhone || '';
  const cleanPhone = resolvedPhone.replace(/[^0-9]/g, '');

  const generateWhatsAppUrl = () => {
    const lines = [
      `سلام و احترام به ${profileName}،`,
      `درخواست واریز وجه بابت: ${displayTitle}`,
    ];
    if (payerName.trim()) {
      lines.push(`نام پرداخت‌کننده: ${payerName.trim()}`);
    }
    if (amount) {
      lines.push(`مبلغ: ${Number(amount).toLocaleString('fa-IR')} ${currencyLabel}`);
    }
    lines.push(`روش پرداخت انتخابی: ${providerDef.title}`);
    if (trackingNumber) {
      lines.push(`شماره پیگیری / کد تراکنش: ${trackingNumber}`);
    }
    if (receiptImageUrl) {
      lines.push(`تصویر رسید واریزی: ${typeof window !== 'undefined' ? window.location.origin : ''}${receiptImageUrl}`);
    } else {
      lines.push('تصویر فیش / رسید واریزی خدمت شما پیوست گردید.');
    }

    const msg = encodeURIComponent(lines.join('\n'));
    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${msg}`;
    }
    return `https://wa.me/?text=${msg}`;
  };

  const handleFinalReceiptSubmit = async () => {
    if (!payerName.trim()) {
      toast.error('لطفاً نام پرداخت‌کننده را وارد فرمایید.');
      return;
    }

    if (!receiptImageUrl) {
      toast.error('لطفاً تصویر فیش یا رسید واریزی را بارگذاری فرمایید.');
      fileInputRef.current?.click();
      return;
    }

    const isHesabPay =
      activeProviderType === 'wallet' &&
      ((activeMethod.walletService || '').toLowerCase().includes('hesabpay') ||
        activeMethod.walletService === 'HesabPay');

    setIsSubmittingReceipt(true);
    try {
      const res = await fetch('/api/payments/record-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          profileAlias,
          payerName: payerName.trim(),
          amount: amount || 0,
          currency: currency || 'AFN',
          description: displayTitle,
          trackingNumber: trackingNumber.trim(),
          receiptImageUrl,
          paymentGateway: isHesabPay ? 'hesabpay' : activeProviderType,
          paymentMode: 'manual',
          status: 'pending_verification',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'خطا در ثبت فیش واریزی.');
      }

      setReceiptSubmitted(true);
      toast.success('رسید واریزی شما با وضعیت «در انتظار بررسی» ثبت گردید.');
    } catch (recErr: any) {
      console.error('Could not record receipt in database:', recErr);
      toast.error(recErr?.message || 'خطا در ثبت مشخصات رسید در سیستم.');
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  // Values from active method (Strictly Offline for Mini-Site)
  const userWalletService = activeMethod.walletService || 'HesabPay';
  const userWalletAccount = activeMethod.walletAccount || '';

  const isHesabPay =
    activeProviderType === 'wallet' &&
    ((userWalletService || '').toLowerCase().includes('hesabpay') ||
      userWalletService === 'HesabPay');

  const hpOwner = profileFinancialSettings?.hesabPay;
  const rawUserPhone = (
    activeMethod.walletAccount ||
    (isHesabPay ? hpOwner?.accountNumber : '') ||
    userWalletAccount ||
    ''
  ).trim();
  const rawUserName = (
    activeMethod.walletAccountName ||
    (isHesabPay ? hpOwner?.accountName : '') ||
    profileName ||
    ''
  ).trim();
  const ownerCustomQrImage = (
    activeMethod.qrCodeImage ||
    meta.qrCodeImage ||
    (isHesabPay ? hpOwner?.qrCodeImage : '') ||
    ''
  ).trim();
  const depositInstructions = (
    activeMethod.instructions ||
    meta.paymentDescription ||
    meta.paymentInstructions ||
    (isHesabPay ? hpOwner?.instructions : '') ||
    ''
  ).trim();

  const userBankName = activeMethod.bankName || 'AIB';
  const userAccountHolder = activeMethod.bankAccountHolder || '';
  const userAccountNumber = activeMethod.bankAccountNumber || '';

  const userSarafiName = activeMethod.hawalaExchangeName || 'صرافی و خدمات پولی';
  const userHawalaReceiver = activeMethod.hawalaReceiverName || '';
  const userHawalaPhone = activeMethod.hawalaReceiverPhone || '';
  const userHawalaCity = activeMethod.hawalaCityBranch || '';

  const userCryptoNetwork = activeMethod.cryptoNetwork || 'TRC20';
  const userCryptoAddress = activeMethod.cryptoWalletAddress || '';

  const activeCustomLogoUrl = useMemo(() => {
    if (!storePaymentSettings) return undefined;
    if (activeProviderType === 'wallet') {
      const match = storePaymentSettings.wallets?.find(
        (w: any) => (w.id || '').toLowerCase() === (userWalletService || '').toLowerCase()
      );
      return match?.logoUrl || undefined;
    }
    if (activeProviderType === 'bank') {
      const match = storePaymentSettings.banks?.find(
        (b: any) =>
          (b.id || '').toLowerCase() === (userBankName || '').toLowerCase() ||
          (b.bankName || '').toLowerCase() === (userBankName || '').toLowerCase()
      );
      return match?.logoUrl || undefined;
    }
    if (activeProviderType === 'hawala') {
      return storePaymentSettings.hawalas?.[0]?.logoUrl || undefined;
    }
    if (activeProviderType === 'crypto') {
      const match = storePaymentSettings.cryptos?.find(
        (c: any) =>
          (c.id || '').toLowerCase() === (userCryptoNetwork || '').toLowerCase() ||
          (c.network || '').toLowerCase() === (userCryptoNetwork || '').toLowerCase()
      );
      return match?.logoUrl || undefined;
    }
    return undefined;
  }, [storePaymentSettings, activeProviderType, userWalletService, userBankName, userCryptoNetwork]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        id="payment-modal"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-2xl z-[100] bg-slate-900 border border-white/15 backdrop-blur-2xl p-0 text-white shadow-2xl box-border flex flex-col isolate"
        dir="rtl"
        showCloseButton={true}
      >
        {/* Fixed Background Layer with continuous gradients - isolated from scrolling */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit] z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/98 via-slate-900/95 to-slate-950/98 rounded-[inherit]" />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 relative z-10">
          {/* Modal Header */}
          <DialogHeader className="space-y-2 pb-3 border-b border-white/10 text-center relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-inner">
              <PaymentLogoBadge
                type={activeProviderType}
                id={
                  activeProviderType === 'wallet'
                    ? userWalletService
                    : activeProviderType === 'bank'
                      ? userBankName
                      : activeProviderType
                }
                customLogoUrl={activeCustomLogoUrl}
                size={28}
              />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-white truncate">
              {displayTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              {providerDef.title} ({providerDef.badge})
            </DialogDescription>
            {amount && (
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mx-auto mt-1">
                <span>مبلغ:</span>
                <span>{Number(amount).toLocaleString('fa-IR')} {currencyLabel}</span>
              </div>
            )}
          </DialogHeader>

          {/* Modal Body */}
          <div className="space-y-4 py-2 relative z-10 text-xs text-slate-200 overflow-x-hidden">
            {/* MULTI-METHOD SELECTOR: If Profile Owner Configured Multiple Methods */}
            {rawMethods.length > 1 && (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>شیوه پرداخت مورد نظر خود را انتخاب فرمایید:</span>
                  </label>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                    {rawMethods.length} روش پرداخت
                  </span>
                </div>
                <PaymentCustomSelect
                  value={selectedMethodId}
                  onChange={(val) => setSelectedMethodId(val)}
                  options={methodSelectOptions}
                />
              </div>
            )}

            {/* 1. WALLET PROVIDER (STRICTLY OFFLINE ACCOUNT + QR CODE) */}
            {activeProviderType === 'wallet' && (() => {
              const walletOpt = AFGHAN_WALLETS.find((w) => w.id === userWalletService) || AFGHAN_WALLETS[0];
              const isWalletConfigured = Boolean(rawUserPhone || ownerCustomQrImage);
              const formattedPhone = rawUserPhone.replace(/^0+/, '');
              const formattedName = rawUserName.toUpperCase();
              const qrPayload = `1:01*2:p*3:93.${formattedPhone}*4:general*5:${formattedName}*6:971*7:1307100`;

              if (!isWalletConfigured) {
                return (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-white">اطلاعات حساب کیف پول تنظیم نشده است</div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      صاحب این کارت هنوز شماره حساب یا تصویر QR Code خود را برای این روش ثبت نکرده است.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block">کیف پول دیجیتال مقصد:</span>
                      <span className="text-sm font-bold text-white block truncate">{walletOpt.nameFa}</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5 truncate">{walletOpt.providerCompany}</span>
                    </div>
                    <PaymentLogoBadge type="wallet" id={walletOpt.id} customLogoUrl={activeCustomLogoUrl} size={36} />
                  </div>

                  {/* نام صاحب حساب */}
                  {rawUserName && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-300 block font-medium">نام صاحب حساب:</span>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-white/15 gap-2">
                        <span className="text-xs font-bold text-white truncate">{rawUserName}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(rawUserName, 'wallet_name', 'نام صاحب حساب')}
                          className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          {copiedKey === 'wallet_name' ? (
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
                  )}

                  {/* شماره حساب / مبایل کیف پول */}
                  {rawUserPhone && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-300 block font-medium">
                        شماره حساب یا شماره مبایل کیف پول:
                      </span>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-white/15 gap-2">
                        <span className="font-mono text-sm tracking-wider text-emerald-400 font-bold truncate" dir="ltr">
                          {rawUserPhone}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(rawUserPhone, 'wallet_acc', 'شماره حساب')}
                          className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          {copiedKey === 'wallet_acc' ? (
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
                  )}

                  {/* تصویر QR Code اختصاصی کاربر یا تولید خودکار */}
                  {(ownerCustomQrImage || rawUserPhone) && (
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                      <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20">
                        {ownerCustomQrImage ? (
                          <img
                            src={ownerCustomQrImage}
                            alt="QR Code حساب"
                            className="w-40 h-40 object-contain rounded-lg"
                          />
                        ) : (
                          <QRCodeSVG
                            value={isHesabPay ? qrPayload : rawUserPhone}
                            size={150}
                            level="M"
                          />
                        )}
                      </div>
                      <span className="text-xs font-bold text-emerald-400 block mt-1">
                        {isHesabPay
                          ? 'بارکد را اسکن کنید یا توسط صراف/دکاندار واریز نمایید'
                          : `اسکن بارکد در اپلیکیشن ${walletOpt.nameFa} جهت واریز وجه`}
                      </span>
                      <span className="text-[10px] text-slate-300 block">
                        پس از انتقال وجه، نام پرداخت‌کننده و تصویر فیش رسید را در فرم زیر ثبت کنید.
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. BANK TRANSFER */}
            {activeProviderType === 'bank' && (() => {
              const bankOpt = AFGHAN_BANKS.find((b) => b.id === userBankName) || AFGHAN_BANKS[1];

              return (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block">بانک مقصد در افغانستان:</span>
                      <span className="text-sm font-bold text-white block truncate">{bankOpt.nameFa}</span>
                      <span className="text-[11px] text-cyan-400 block mt-0.5 truncate">{bankOpt.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">سویفت کد: {bankOpt.swiftCode}</span>
                    </div>
                    <PaymentLogoBadge type="bank" id={bankOpt.id} customLogoUrl={activeCustomLogoUrl} size={36} />
                  </div>

                  {userAccountHolder && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-medium">نام صاحب حساب:</span>
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/15 flex items-center justify-between gap-2">
                        <span className="font-semibold text-white text-xs truncate">{userAccountHolder}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(userAccountHolder, 'bank_holder', 'نام صاحب حساب')}
                          className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedKey === 'bank_holder' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>کاپی</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {userAccountNumber ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-medium">شماره حساب بانکی یا آی‌بن (IBAN):</span>
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/15 flex items-center justify-between gap-2">
                        <span className="font-mono text-sm tracking-wider text-emerald-400 font-bold truncate" dir="ltr">
                          {userAccountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(userAccountNumber, 'bank_acc', 'شماره حساب')}
                          className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          {copiedKey === 'bank_acc' ? (
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
                  ) : (
                    <p className="text-amber-400 text-center text-xs p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      شماره حساب بانکی توسط صاحب پروفایل ثبت نشده است.
                    </p>
                  )}

                  {userAccountNumber && (
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="p-2 bg-white rounded-xl shadow-md">
                        <QRCodeSVG value={userAccountNumber} size={125} level="M" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 text-center">
                        اسکن بارکد حساب در اپلیکیشن بانکی جهت واریز آسان
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. HAWALA / SARAFI */}
            {activeProviderType === 'hawala' && (() => (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-amber-300 block">صرافی و شرکت خدمات پولی:</span>
                    <span className="text-sm font-bold text-white block mt-0.5 truncate">{userSarafiName}</span>
                    {userHawalaCity && <span className="text-xs text-amber-200 block mt-0.5 truncate">شهر و شعبه: {userHawalaCity}</span>}
                  </div>
                  <PaymentLogoBadge type="hawala" customLogoUrl={activeCustomLogoUrl} size={36} />
                </div>

                <div className="space-y-2">
                  {userHawalaReceiver && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/15 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block">نام و ولد گیرنده حواله:</span>
                        <span className="text-xs font-bold text-white truncate block">{userHawalaReceiver}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(userHawalaReceiver, 'hawala_rec', 'نام گیرنده')}
                        className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedKey === 'hawala_rec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>کاپی</span>
                      </button>
                    </div>
                  )}

                  {userHawalaPhone && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/15 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block">شماره تماس گیرنده:</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 truncate block" dir="ltr">
                          {userHawalaPhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${userHawalaPhone}`}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                          title="تماس مستقیم"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(userHawalaPhone, 'hawala_phone', 'شماره تماس')}
                          className="py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === 'hawala_phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>کاپی</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))()}

            {/* 4. CRYPTO (USDT) */}
            {activeProviderType === 'crypto' && (() => {
              const netOpt = CRYPTO_NETWORKS.find((n) => n.id === userCryptoNetwork) || CRYPTO_NETWORKS[0];

              return (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] text-cyan-300 block">ارز دیجیتال:</span>
                      <span className="text-sm font-bold text-white truncate block">USDT تتر ({userCryptoNetwork})</span>
                      <span className="text-[10px] text-cyan-200 block mt-0.5 truncate">{netOpt.blockchain}</span>
                    </div>
                    <PaymentLogoBadge type="crypto" customLogoUrl={activeCustomLogoUrl} size={36} />
                  </div>

                  {userCryptoAddress ? (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-300 block font-medium">
                        آدرس کیف پول تتر کاربر:
                      </span>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-white/15 gap-2">
                        <span className="font-mono text-[11px] text-emerald-400 break-all select-all leading-tight" dir="ltr">
                          {userCryptoAddress}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(userCryptoAddress, 'crypto_addr', 'آدرس کیف پول')}
                          className="py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer"
                        >
                          {copiedKey === 'crypto_addr' ? (
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
                  ) : (
                    <p className="text-amber-400 text-center text-xs p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      آدرس کیف پول تتر توسط صاحب پروفایل ثبت نشده است.
                    </p>
                  )}

                  {userCryptoAddress && (
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="p-2 bg-white rounded-xl shadow-md">
                        <QRCodeSVG value={userCryptoAddress} size={135} level="M" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 text-center">
                        اسکن بارکد در کیف پول کریپتو (Trust Wallet, Binance, TronLink)
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* توضیحات و راهنمای واریز صاحب پروفایل */}
            {depositInstructions && (
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">راهنمای صاحب پروفایل:</span>
                {depositInstructions}
              </div>
            )}

            {/* فرم ثبت نام پرداخت‌کننده و آپلود فیش/رسید واریزی */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Upload className="w-4 h-4 shrink-0" />
                  <span>ثبت مشخصات واریز و آپلود فیش / رسید:</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                  الزامی
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                لطفاً پس از واریز وجه به حساب فوق، نام پرداخت‌کننده و تصویر فیش/رسید را وارد کنید تا تراکنش شما در وضعیت در انتظار بررسی ثبت گردد.
              </p>

              {/* فیلد نام پرداخت‌کننده */}
              <div>
                <label className="text-[10px] text-slate-300 mb-1 font-medium flex items-center gap-1">
                  <User className="w-3 h-3 text-emerald-400" />
                  <span>نام و تخلص پرداخت‌کننده (الزامی):</span>
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="مثلاً: فرهاد احمدی"
                  className="w-full h-9 px-3 rounded-xl bg-slate-950/80 border border-white/20 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* فیلد شماره پیگیری */}
              <div>
                <label className="text-[10px] text-slate-300 block mb-1 font-medium">
                  کد پیگیری تراکنش یا شماره فیش (اختیاری):
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="مثلاً: 981240 یا هش تراکنش"
                  className="w-full h-9 px-3 rounded-xl bg-slate-950/80 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
              </div>

              {/* آپلود فیش */}
              <div className="space-y-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />

                {receiptImageUrl ? (
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={receiptImageUrl}
                        alt="فیش رسید"
                        className="w-10 h-10 object-cover rounded-lg border border-white/15 shrink-0"
                      />
                      <div className="truncate text-right">
                        <span className="text-[11px] font-bold text-emerald-400 block">فیش با موفقیت آپلود شد</span>
                        <span className="text-[9px] text-slate-400 block truncate font-mono" dir="ltr">
                          {receiptImageUrl}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptImageUrl('')}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                      title="حذف و آپلود مجدد"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isUploadingReceipt}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-200 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isUploadingReceipt ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>در حال بارگذاری فیش رسید...</span>
                      </>
                    ) : (
                      <>
                        <FileImage className="w-4 h-4 text-emerald-400" />
                        <span>انتخاب و بارگذاری تصویر فیش رسید (JPG / PNG)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* نتیجه ثبت رسید */}
              {receiptSubmitted ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">
                    رسید شما با وضعیت «در انتظار بررسی» ثبت گردید
                  </span>
                  <span className="text-[10px] text-emerald-300 block">
                    جهت اطلاع‌رسانی مستقیم به صاحب پروفایل، دکمه ارسال در واتساپ را بزنید.
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isSubmittingReceipt || isUploadingReceipt}
                  onClick={handleFinalReceiptSubmit}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isSubmittingReceipt ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال ثبت فیش در سیستم...</span>
                    </>
                  ) : (
                    <span>تأیید و ثبت نهایی فیش واریزی</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2 relative z-10">
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>ارسال فیش / رسید در واتساپ</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default PaymentCheckoutModal;
