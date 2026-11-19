'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  Info,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  PLATFORM_CENTRAL_PAYMENT_DEFAULTS,
  PaymentProviderType,
  calculateInstallmentSchedule,
} from '@/lib/constants/paymentProviders';
import {
  PaymentCustomSelect,
  PaymentSelectOption,
} from '@/components/payment/PaymentCustomSelect';
import { PaymentLogoBadge } from '@/components/payment/PaymentLogos';
import {
  AFGHANISTAN_PROVINCES,
  DEFAULT_QTY_TIERS,
  MaterialOption,
  QtyTier,
  ShippingFormState,
} from './types';

interface CheckoutPaymentPanelProps {
  material: MaterialOption;
  qtyTiers?: QtyTier[];
  quantity: number;
  discountPercent: number;
  unitPrice: number;
  subtotalAfterDiscount: number;
  discountAmount: number;
  deliveryFee: number;
  totalPrice: number;
  shipping: ShippingFormState;
  onShippingChange: (patch: Partial<ShippingFormState>) => void;
  onQuantityChange: (nextQty: number) => void;
  storeSettings: any;
  isCorporateUser: boolean;
  paymentMethod: PaymentProviderType;
  onPaymentMethodChange: (method: PaymentProviderType) => void;
  orderHesabPayMode: 'direct' | 'agent';
  onHesabPayModeChange: (mode: 'direct' | 'agent') => void;
  transactionRef: string;
  onTransactionRefChange: (val: string) => void;
  receiptFile: File | null;
  receiptPreview: string | null;
  isUploadingReceipt: boolean;
  onReceiptFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearReceipt: () => void;
  fullNameInputRef: React.RefObject<HTMLInputElement | null>;
  phoneInputRef: React.RefObject<HTMLInputElement | null>;
  addressInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function CheckoutPaymentPanel({
  material,
  qtyTiers = DEFAULT_QTY_TIERS,
  quantity,
  discountPercent,
  unitPrice,
  subtotalAfterDiscount,
  discountAmount,
  deliveryFee,
  totalPrice,
  shipping,
  onShippingChange,
  onQuantityChange,
  storeSettings,
  isCorporateUser,
  paymentMethod,
  onPaymentMethodChange,
  orderHesabPayMode,
  onHesabPayModeChange,
  transactionRef,
  onTransactionRefChange,
  receiptFile,
  receiptPreview,
  isUploadingReceipt,
  onReceiptFileChange,
  onClearReceipt,
  fullNameInputRef,
  phoneInputRef,
  addressInputRef,
}: CheckoutPaymentPanelProps) {
  const { language, t } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currencyLabel = t('orderStudio.currency', 'افغانی');

  const copyText = (txt: string, key: string, label: string) => {
    if (!txt || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    toast.success(`${label} ${t('orderStudio.copied', 'کاپی شد')}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Build available Afghan payment methods based on central StorePaymentSettings
  const activeHesabPay = storeSettings?.wallets?.find((w: any) => w.id === 'hesabpay');
  const activeFirstBank =
    storeSettings?.banks?.find((b: any) => b.isActive) || storeSettings?.bankAccounts?.[0];
  const activeFirstHawala =
    storeSettings?.hawalas?.find((h: any) => h.isActive) || storeSettings?.hawalaInfo;
  const activeFirstCrypto =
    storeSettings?.cryptos?.find((c: any) => c.isActive) || storeSettings?.cryptoAddresses?.[0];

  const allOptions: PaymentSelectOption[] = [
    {
      id: 'wallet',
      title: t('orderStudio.payWalletTitle', 'حساب‌پی (HesabPay - درگاه پرداخت آنلاین)'),
      subtitle: t(
        'orderStudio.payWalletSub',
        'پرداخت آنی الکترونیک دارای مجوز د افغانستان بانک'
      ),
      badge: t('orderStudio.payWalletBadge', 'فوری و آنلاین'),
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      type: 'wallet',
      logoId: 'hesabpay',
      customLogoUrl: activeHesabPay?.logoUrl || undefined,
    },
    {
      id: 'bank',
      title: t('orderStudio.payBankTitle', 'واریز به حساب بانکی (Bank Transfer)'),
      subtitle: activeFirstBank
        ? `${activeFirstBank.bankNameFa || activeFirstBank.bankName}`
        : t('orderStudio.payBankSub', 'د افغانستان نړيوال بانک (AIB) و عزیزی بانک'),
      badge: t('orderStudio.payBankBadge', 'رسمی و شرکتی'),
      badgeColor: 'bg-blue-500/20 text-blue-300',
      type: 'bank',
      logoId: activeFirstBank?.id || 'aib',
      customLogoUrl: activeFirstBank?.logoUrl || undefined,
    },
    {
      id: 'hawala',
      title: t('orderStudio.payHawalaTitle', 'حواله صرافی و نقدی (Hawala)'),
      subtitle:
        activeFirstHawala?.exchangeName ||
        t('orderStudio.payHawalaSub', 'صرافی‌های معتبر کابل و ولایات'),
      badge: t('orderStudio.payHawalaBadge', 'صرافی و نقد'),
      badgeColor: 'bg-amber-500/20 text-amber-300',
      type: 'hawala',
      logoId: 'hawala',
      customLogoUrl: activeFirstHawala?.logoUrl || undefined,
    },
    {
      id: 'crypto',
      title: t('orderStudio.payCryptoTitle', 'ارز دیجیتال تتر (USDT - TRC20 / ERC20)'),
      subtitle: t('orderStudio.payCryptoSub', 'انتقال سریع بین‌المللی با کمترین کارمزد'),
      badge: t('orderStudio.payCryptoBadge', 'بین‌المللی'),
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
      type: 'crypto',
      logoId: 'usdt',
      customLogoUrl: activeFirstCrypto?.logoUrl || undefined,
    },
    {
      id: 'cod',
      title: t('orderStudio.payCodTitle', 'پرداخت در محل (Cash on Delivery)'),
      subtitle: t(
        'orderStudio.payCodSub',
        'تسویه نقدی با مأمور پیک همزمان با تحویل فیزیکی کارت'
      ),
      badge: t('orderStudio.payCodBadge', 'تحویل و تسویه'),
      badgeColor: 'bg-purple-500/20 text-purple-300',
      type: 'cod',
      logoId: 'cod',
      customLogoUrl: storeSettings?.codSettings?.logoUrl || undefined,
    },
    {
      id: 'installment',
      title: t('orderStudio.payInstTitle', 'خرید اقساطی / قراردادی (3 قسط ماهانه)'),
      subtitle: t('orderStudio.payInstSub', 'عقد قرارداد رسمی ویژه شرکت‌ها و سازمان‌ها'),
      badge: isCorporateUser
        ? t('orderStudio.payInstActive', 'سازمانی فعال')
        : t('orderStudio.payInstLocked', 'ویژه سازمانی (B2B)'),
      badgeColor: isCorporateUser
        ? 'bg-rose-500/20 text-rose-300'
        : 'bg-amber-500/20 text-amber-300',
      type: 'installment',
      logoId: 'installment',
      customLogoUrl: storeSettings?.installmentSettings?.logoUrl || undefined,
      locked: !isCorporateUser,
    },
  ];

  const checkoutPaymentOptions = allOptions.filter((opt) => {
    if (!storeSettings) return true;
    if (opt.id === 'wallet') {
      const hpActive = activeHesabPay
        ? activeHesabPay.isActive
        : storeSettings.hesabPay?.isActive !== false;
      return storeSettings.activeMethods?.hesabpay !== false && hpActive;
    }
    if (opt.id === 'bank') {
      const hasActiveBank = storeSettings.banks
        ? storeSettings.banks.some((b: any) => b.isActive)
        : (storeSettings.bankAccounts?.some((b: any) => b.isActive) ?? true);
      return storeSettings.activeMethods?.bank !== false && hasActiveBank;
    }
    if (opt.id === 'hawala') {
      const hasActiveHawala = storeSettings.hawalas
        ? storeSettings.hawalas.some((h: any) => h.isActive)
        : storeSettings.hawalaInfo?.isActive !== false;
      return storeSettings.activeMethods?.hawala !== false && hasActiveHawala;
    }
    if (opt.id === 'crypto') {
      const hasActiveCrypto = storeSettings.cryptos
        ? storeSettings.cryptos.some((c: any) => c.isActive)
        : (storeSettings.cryptoAddresses?.some((c: any) => c.isActive) ?? true);
      return storeSettings.activeMethods?.crypto !== false && hasActiveCrypto;
    }
    if (opt.id === 'cod') {
      return (
        storeSettings.activeMethods?.cod !== false &&
        storeSettings.codSettings?.isActive !== false
      );
    }
    if (opt.id === 'installment') {
      return (
        storeSettings.activeMethods?.installment !== false &&
        storeSettings.installmentSettings?.isActive !== false
      );
    }
    return true;
  });

  const needsManualReceipt =
    paymentMethod === 'bank' ||
    paymentMethod === 'hawala' ||
    paymentMethod === 'crypto' ||
    (paymentMethod === 'wallet' && orderHesabPayMode === 'agent');

  return (
    <div className="space-y-4">
      {/* Quantity & Bulk Discount Tiers */}
      <div className="field">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="studio-qty-custom">{t('orderStudio.lblQty', 'تعداد کارت')}</label>
          <div className="inline-flex items-center gap-1.5 text-xs">
            <button
              type="button"
              aria-label={t('orderStudio.qtyDecrease', 'کاهش تعداد')}
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <input
              id="studio-qty-custom"
              name="quantity"
              type="text"
              inputMode="numeric"
              aria-label={t('orderStudio.lblQty', 'تعداد کارت')}
              value={String(quantity)}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^\d]/g, '');
                const parsed = parseInt(digits, 10);
                if (!Number.isNaN(parsed) && parsed > 0) {
                  onQuantityChange(Math.min(500, parsed));
                }
              }}
              className="w-12 h-7 text-center rounded-lg bg-black/40 border border-white/15 text-sky-300 font-mono text-xs font-bold"
              dir="ltr"
            />
            <button
              type="button"
              aria-label={t('orderStudio.qtyIncrease', 'افزایش تعداد')}
              onClick={() => onQuantityChange(Math.min(500, quantity + 1))}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
        <div className="qty-grid">
          {qtyTiers.map((tier) => {
            const isActive = quantity === tier.qty;
            return (
              <button
                key={tier.qty}
                type="button"
                aria-pressed={isActive}
                className={`qty-card ${isActive ? 'active' : ''}`}
                onClick={() => onQuantityChange(tier.qty)}
              >
                <span className="qty-num">{tier.qty}</span>
                <span className="qty-tag">
                  {tier.disc === 0 ? t('orderStudio.qSingle', 'تکی') : `${tier.disc}%-`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient & Delivery Address Form (Autofill & Accessible) */}
      <fieldset className="sub-box border-0">
        <legend className="sub-box-head w-full pb-1">
          {t('orderStudio.shippingLegend', 'مشخصات گیرنده و آدرس ارسال')}
        </legend>

        <div className="input-row">
          <div className="field">
            <label htmlFor="studio-ship-fullname">
              {t('orderStudio.lblFullName', 'نام و تخلص گیرنده')} <span aria-hidden="true" className="text-rose-400">*</span>
            </label>
            <input
              ref={fullNameInputRef}
              id="studio-ship-fullname"
              name="full_name"
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              required
              value={shipping.fullName}
              onChange={(e) => onShippingChange({ fullName: e.target.value })}
              placeholder={t('orderStudio.phFullName', 'مثال: احمد فرید رسولی')}
              className="studio-input"
            />
          </div>

          <div className="field">
            <label htmlFor="studio-ship-phone">
              {t('orderStudio.lblPhone', 'نمبر تماس / واتساپ')} <span aria-hidden="true" className="text-rose-400">*</span>
            </label>
            <input
              ref={phoneInputRef}
              id="studio-ship-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              required
              value={shipping.phone}
              onChange={(e) => onShippingChange({ phone: e.target.value })}
              placeholder="079XXXXXXX"
              className="studio-input"
              dir="ltr"
            />
          </div>
        </div>

        <div className="input-row">
          <div className="field">
            <label htmlFor="studio-ship-province">
              {t('orderStudio.lblCity', 'ولایت')} <span aria-hidden="true" className="text-rose-400">*</span>
            </label>
            <select
              id="studio-ship-province"
              name="province"
              autoComplete="address-level1"
              value={shipping.province}
              onChange={(e) => onShippingChange({ province: e.target.value })}
              className="studio-select"
            >
              {AFGHANISTAN_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="studio-ship-city">
              {t('orderStudio.lblDistrictCity', 'شهر / ناحیه')}
            </label>
            <input
              id="studio-ship-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              enterKeyHint="next"
              value={shipping.city}
              onChange={(e) => onShippingChange({ city: e.target.value })}
              placeholder={t('orderStudio.phDistrictCity', 'مثال: شهر نو، ناحیه 4')}
              className="studio-input"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="studio-ship-address">
            {t('orderStudio.lblAddr', 'آدرس دقیق تحویل')} <span aria-hidden="true" className="text-rose-400">*</span>
          </label>
          <textarea
            ref={addressInputRef}
            id="studio-ship-address"
            name="street_address"
            autoComplete="street-address"
            required
            rows={2}
            value={shipping.streetAddress}
            onChange={(e) => onShippingChange({ streetAddress: e.target.value })}
            placeholder={t('orderStudio.phAddr', 'سرک، کوچه، نمبر ساختمان یا نام دفتر...')}
            className="studio-textarea"
          />
        </div>

        <div className="input-row">
          <div className="field">
            <label htmlFor="studio-ship-email">
              {t('orderStudio.lblEmailOpt', 'ایمیل جهت صدور بل (اختیاری)')}
            </label>
            <input
              id="studio-ship-email"
              name="email"
              type="email"
              autoComplete="email"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              value={shipping.email}
              onChange={(e) => onShippingChange({ email: e.target.value })}
              placeholder="name@example.com"
              className="studio-input"
              dir="ltr"
            />
          </div>

          <div className="field">
            <label htmlFor="studio-ship-notes">
              {t('orderStudio.lblNotesOpt', 'یادداشت برای پیک (اختیاری)')}
            </label>
            <input
              id="studio-ship-notes"
              name="notes"
              type="text"
              enterKeyHint="done"
              value={shipping.notes}
              onChange={(e) => onShippingChange({ notes: e.target.value })}
              placeholder={t('orderStudio.phNotesOpt', 'زمان مناسب تحویل یا نمبر دوم')}
              className="studio-input"
            />
          </div>
        </div>
      </fieldset>

      {/* Transparent Invoice Breakdown */}
      <div className="sub-box text-xs space-y-2">
        <div className="flex justify-between items-center text-slate-300">
          <span>
            {material.name[language] || material.name.da} × {quantity}
          </span>
          <span className="font-mono">{(unitPrice * quantity).toLocaleString('en-US')} {currencyLabel}</span>
        </div>
        {discountPercent > 0 && (
          <div className="flex justify-between items-center text-emerald-400">
            <span>
              {t('orderStudio.bulkDiscount', 'تخفیف تعداد')} ({discountPercent}%)
            </span>
            <span className="font-mono">-{discountAmount.toLocaleString('en-US')} {currencyLabel}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-slate-300">
          <span>{t('orderStudio.nfcEncoding', 'پروگرام چیپ NFC و بسته‌بندی لوکس')}</span>
          <span className="font-bold text-emerald-400">{t('orderStudio.freeLabel', 'رایگان')}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>{t('orderStudio.deliveryFeeLabel', 'کرایه پست اکسپرس سراسر افغانستان')}</span>
          <span className="font-mono">{deliveryFee.toLocaleString('en-US')} {currencyLabel}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold text-sm">
          <span className="text-white">{t('orderStudio.grandTotal', 'مجموع کل قابل پرداخت')}:</span>
          <span className="font-mono text-sky-400">
            {totalPrice.toLocaleString('en-US')} AFN
          </span>
        </div>

        {/* Respectful Delivery Cost Responsibility Notice */}
        <div
          role="note"
          className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-[11px] leading-relaxed flex items-center gap-2"
        >
          <Truck className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
          <span className="font-semibold">
            {t('orderStudio.deliveryCustomerNotice', 'توجه: هزینه ارسال (پست/پیک) بر عهده مشتری است.')}
          </span>
        </div>
      </div>

      {/* Modular Payment Methods Selector */}
      <div className="sub-box space-y-3">
        <div className="sub-box-head">
          <span>{t('orderStudio.paymentMethodTitle', 'شیوه پرداخت و تسویه وجه')}</span>
          <span className="text-[10px] text-emerald-400 font-medium">
            {t('orderStudio.allAfghanistan', 'سراسر افغانستان')}
          </span>
        </div>

        <PaymentCustomSelect
          value={paymentMethod}
          onChange={(val) => onPaymentMethodChange(val as PaymentProviderType)}
          options={checkoutPaymentOptions.length > 0 ? checkoutPaymentOptions : allOptions}
          onLockedClick={() => {
            toast.error(
              t(
                'orderStudio.installmentLockedToast',
                'خرید اقساطی منحصراً ویژه شرکت‌ها، نهادها و مشتریان با حساب سازمانی (B2B) می‌باشد.'
              )
            );
          }}
        />

        {/* Provider Details Box */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs">
          {/* 1. HesabPay Wallet */}
          {paymentMethod === 'wallet' && (() => {
            const hesabPayWallet = storeSettings?.wallets?.find(
              (w: any) => w.id === 'hesabpay' || w.name?.toLowerCase().includes('hesabpay')
            );
            const rawPhone =
              hesabPayWallet?.accountNumber ||
              storeSettings?.hesabPay?.accountNumber ||
              storeSettings?.walletAccount ||
              '0729736813';
            const rawName =
              hesabPayWallet?.accountName ||
              storeSettings?.hesabPay?.accountName ||
              'Farhad Arya';
            const formattedPhone = rawPhone.replace(/^0+/, '');
            const formattedName = rawName.toUpperCase();
            const qrPayload = `1:01*2:p*3:93.${formattedPhone}*4:general*5:${formattedName}*6:971*7:1307100`;

            return (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={orderHesabPayMode === 'direct'}
                    onClick={() => onHesabPayModeChange('direct')}
                    className={`p-2.5 rounded-xl border text-start transition-all flex items-start gap-2 cursor-pointer ${orderHesabPayMode === 'direct'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : 'bg-black/20 border-white/10 hover:border-white/25 text-slate-400'
                      }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="text-xs font-bold block text-white">
                        {t('orderStudio.hpDirectTitle', 'خودم اپلیکیشن دارم')}
                      </span>
                      <span className="text-[10px] text-slate-300 leading-tight block mt-0.5">
                        {t('orderStudio.hpDirectSub', 'اتصال مستقیم به درگاه حساب‌پی بدون آپلود رسید')}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-pressed={orderHesabPayMode === 'agent'}
                    onClick={() => onHesabPayModeChange('agent')}
                    className={`p-2.5 rounded-xl border text-start transition-all flex items-start gap-2 cursor-pointer ${orderHesabPayMode === 'agent'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : 'bg-black/20 border-white/10 hover:border-white/25 text-slate-400'
                      }`}
                  >
                    <Store className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="text-xs font-bold block text-white">
                        {t('orderStudio.hpAgentTitle', 'از طریق صراف / دکاندار')}
                      </span>
                      <span className="text-[10px] text-slate-300 leading-tight block mt-0.5">
                        {t('orderStudio.hpAgentSub', 'اسکن QR توسط صراف + آپلود عکس رسید')}
                      </span>
                    </div>
                  </button>
                </div>

                {orderHesabPayMode === 'direct' ? (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {t(
                        'orderStudio.hpDirectInfo',
                        'پس از تایید سفارش، مستقیماً به درگاه رسمی حساب‌پی هدایت می‌شوید تا پرداخت را به‌صورت آنلاین تکمیل کنید.'
                      )}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                      <span className="text-slate-400">{t('orderStudio.merchantId', 'شناسه پذیرنده:')}</span>
                      <span className="font-mono text-emerald-400 font-bold" dir="ltr">
                        {hesabPayWallet?.merchantId ||
                          storeSettings?.hesabPay?.merchantId ||
                          'ARYALINK_MERCHANT_01'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2.5">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="p-2 rounded-xl bg-white shrink-0">
                        <QRCodeSVG value={qrPayload} size={86} level="M" />
                      </div>
                      <div className="space-y-1 w-full">
                        <span className="text-[10px] text-emerald-400 font-bold block">
                          {t('orderStudio.hpAgentQrTitle', 'بارکد اسکن اختصاصی حساب‌پی:')}
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">
                            {t('orderStudio.accountNumber', 'نمبر حساب / مبایل:')}
                          </span>
                          <span className="font-mono text-white text-xs font-bold" dir="ltr">
                            {rawPhone}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">
                            {t('orderStudio.accountHolder', 'صاحب حساب:')}
                          </span>
                          <span className="text-slate-200 text-[11px]" dir="ltr">
                            {rawName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. Afghan Banks */}
          {paymentMethod === 'bank' && (() => {
            const rawBanks = storeSettings?.banks?.filter((b: any) => b.isActive) || [];
            const banksToRender =
              rawBanks.length > 0
                ? rawBanks
                : storeSettings?.bankAccounts?.filter((b: any) => b.isActive) || [];
            const list =
              banksToRender.length > 0 ? banksToRender : [PLATFORM_CENTRAL_PAYMENT_DEFAULTS.bank];

            return (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {list.map((bank: any, bIdx: number) => {
                  const bTitle = bank.bankNameFa || bank.bankName || 'AIB';
                  const bHolder = bank.accountHolder || 'Aryalink LLC';
                  const bAcc = bank.accountNumber || '0101-2345678-001';
                  const bIban = bank.iban || '';
                  return (
                    <div
                      key={bIdx}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 pb-1 border-b border-white/5">
                        <div className="flex items-center gap-2 min-w-0">
                          <PaymentLogoBadge
                            id={bank.id || bank.bankName}
                            type="bank"
                            customLogoUrl={bank.logoUrl}
                            size={18}
                          />
                          <span className="text-xs font-bold text-white truncate">{bTitle}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {bHolder}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-emerald-400 font-bold text-xs" dir="ltr">
                          {bAcc}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyText(
                              bAcc,
                              `bank_acc_${bIdx}`,
                              t('orderStudio.accountNumber', 'نمبر حساب')
                            )
                          }
                          className="py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `bank_acc_${bIdx}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{t('orderStudio.copyBtn', 'کاپی')}</span>
                        </button>
                      </div>
                      {bIban && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                          <span className="font-mono text-emerald-300 text-[10px] truncate" dir="ltr">
                            {bIban}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(bIban, `bank_iban_${bIdx}`, 'IBAN')}
                            className="py-0.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[9px] inline-flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {copiedKey === `bank_iban_${bIdx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{t('orderStudio.copyBtn', 'کاپی')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* 3. Hawala Sarafi */}
          {paymentMethod === 'hawala' && (() => {
            const rawHawalas = storeSettings?.hawalas?.filter((h: any) => h.isActive) || [];
            const list =
              rawHawalas.length > 0
                ? rawHawalas
                : storeSettings?.hawalaInfo
                  ? [storeSettings.hawalaInfo]
                  : [PLATFORM_CENTRAL_PAYMENT_DEFAULTS.hawala];

            return (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {list.map((h: any, hIdx: number) => (
                  <div
                    key={hIdx}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <PaymentLogoBadge id="hawala" type="hawala" customLogoUrl={h.logoUrl} size={18} />
                      <span className="text-xs font-bold text-white">{h.exchangeName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{h.cityBranch}</span>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 gap-2">
                      <span className="font-bold text-white text-xs">{h.receiverName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-emerald-400 text-xs" dir="ltr">
                          {h.receiverPhone}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyText(
                              h.receiverPhone,
                              `hawala_${hIdx}`,
                              t('orderStudio.lblPhone', 'نمبر تماس')
                            )
                          }
                          className="py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `hawala_${hIdx}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{t('orderStudio.copyBtn', 'کاپی')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* 4. Crypto USDT */}
          {paymentMethod === 'crypto' && (() => {
            const rawCryptos = storeSettings?.cryptos?.filter((c: any) => c.isActive) || [];
            const list =
              rawCryptos.length > 0
                ? rawCryptos
                : storeSettings?.cryptoAddresses?.filter((c: any) => c.isActive) || [
                  PLATFORM_CENTRAL_PAYMENT_DEFAULTS.crypto,
                ];

            return (
              <div className="space-y-2.5">
                {list.map((c: any, cIdx: number) => {
                  const net = c.network || 'TRC20';
                  const addr =
                    c.walletAddress || PLATFORM_CENTRAL_PAYMENT_DEFAULTS.crypto.walletAddress;
                  return (
                    <div
                      key={cIdx}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PaymentLogoBadge id="usdt" type="crypto" customLogoUrl={c.logoUrl} size={18} />
                          <span className="text-xs font-bold text-white">USDT Tether</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          {net}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-emerald-400 break-all" dir="ltr">
                          {addr}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(addr, `crypto_${cIdx}`, 'USDT')}
                          className="py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedKey === `crypto_${cIdx}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{t('orderStudio.copyBtn', 'کاپی')}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 bg-white rounded-lg shrink-0">
                          <QRCodeSVG value={addr} size={50} level="M" />
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          {c.instructions || `USDT (${net})`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* 5. COD */}
          {paymentMethod === 'cod' && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">
                {t('orderStudio.codHeading', 'پرداخت نقدی به مأمور تحویل')}
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {storeSettings?.codSettings?.terms || PLATFORM_CENTRAL_PAYMENT_DEFAULTS.cod.terms}
              </p>
            </div>
          )}

          {/* 6. Corporate Installment */}
          {paymentMethod === 'installment' && (() => {
            const instConfig = storeSettings?.installmentSettings;
            const downPct = instConfig?.downPaymentPercent || 30;
            const count = instConfig?.installmentCount || 3;
            const down = Math.round(totalPrice * (downPct / 100));
            const sched = calculateInstallmentSchedule(totalPrice, down, count, 'monthly');
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">
                    {t('orderStudio.instHeading', 'خرید اقساطی سازمانی')} ({count})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                    B2B
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>
                    {t('orderStudio.downPayment', 'پیش‌پرداخت')} ({downPct}%):
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {down.toLocaleString('en-US')} AFN
                  </span>
                </div>
                <div className="space-y-1 pt-1 border-t border-white/10">
                  {sched.map((item) => (
                    <div
                      key={item.installmentNumber}
                      className="flex justify-between text-[10px] text-slate-400"
                    >
                      <span>{item.dueDateLabel}</span>
                      <span className="font-mono text-white">
                        {item.amount.toLocaleString('en-US')} AFN
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Manual Receipt Upload & Transaction Reference */}
          {needsManualReceipt && (
            <div className="pt-2.5 border-t border-white/10 space-y-2.5">
              <div className="field">
                <label htmlFor="studio-tx-ref">
                  {t('orderStudio.txRefLabel', 'کد پیگیری، رفرنس تراکنش یا نمبر حواله:')}
                </label>
                <input
                  id="studio-tx-ref"
                  name="transaction_ref"
                  type="text"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={transactionRef}
                  onChange={(e) => onTransactionRefChange(e.target.value)}
                  placeholder={t('orderStudio.txRefPh', 'مثال: 9812450 یا هش تراکنش')}
                  className="studio-input font-mono text-xs"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-300 font-semibold block">
                  {t('orderStudio.receiptLabel', 'آپلود عکس یا اسکرین‌شات رسید پرداخت (حداکثر 3.5 مگابایت):')}
                </span>
                {receiptPreview ? (
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={receiptPreview}
                        alt={t('orderStudio.receiptAlt', 'رسید واریز')}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs text-emerald-400 font-bold block truncate">
                          {receiptFile?.name || t('orderStudio.receiptUploaded', 'رسید آپلود شد')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isUploadingReceipt
                            ? t('orderStudio.uploadingReceipt', 'در حال آپلود...')
                            : t('orderStudio.receiptSaved', 'با موفقیت ذخیره شد')}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={t('orderStudio.btnRemove', 'حذف')}
                      onClick={onClearReceipt}
                      className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <label className="p-3 rounded-xl border border-dashed border-white/20 hover:border-sky-400/50 bg-slate-950/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    <span className="text-[11px] text-slate-200 font-medium">
                      {isUploadingReceipt
                        ? t('orderStudio.uploadingReceipt', 'در حال آپلود...')
                        : t('orderStudio.pickReceipt', 'ارسال عکس رسید پرداخت')}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingReceipt}
                      onChange={onReceiptFileChange}
                      className="visually-hidden-input"
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warranty Notice */}
      <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-[11px] text-sky-200 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" aria-hidden="true" />
        <span>
          {t(
            'orderStudio.warrantyNotice',
            'تضمین سلامت فیزیکی 100% چیپست و گارانتی تعویض 1 ساله آریا لینک.'
          )}
        </span>
      </div>
    </div>
  );
}

export default CheckoutPaymentPanel;
