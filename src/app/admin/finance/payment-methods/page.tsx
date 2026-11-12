'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Building,
  Coins,
  ArrowRight,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  CalendarDays,
  ExternalLink,
  Info,
  Upload,
  RotateCcw,
  QrCode,
  Copy,
  Check,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  Layers,
  Lock,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PaymentLogoBadge } from '@/components/payment/PaymentLogos';
import {
  IStoreWalletItem,
  IStoreBankItem,
  IStoreHawalaItem,
  IStoreCryptoItem,
  DEFAULT_DETAILED_WALLETS,
  DEFAULT_DETAILED_BANKS,
  DEFAULT_DETAILED_HAWALAS,
  DEFAULT_DETAILED_CRYPTOS,
} from '@/models/StorePaymentSettings.model';

interface CodSettings {
  isActive: boolean;
  deliveryFee: number;
  deliveryCompany: string;
  terms: string;
  logoUrl?: string;
}

interface InstallmentSettings {
  isActive: boolean;
  minOrderAmount: number;
  downPaymentPercent: number;
  installmentCount: number;
  corporateOnly: boolean;
  terms: string;
  logoUrl?: string;
}

// =========================================================================
// SECURITY PASSWORD INPUT COMPONENT WITH EYE TOGGLE (STRICT RTL SUPPORT)
// =========================================================================
const PasswordInputField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}> = ({ label, value, onChange, placeholder, dir = 'ltr' }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1 text-right" dir="rtl">
      <label className="text-[11px] font-bold text-foreground block text-right">{label}:</label>
      <div className="relative flex items-center">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 rounded-xl font-mono text-xs pe-9 ps-3 text-start"
          dir={dir}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute end-2.5 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={show ? 'پنهان کردن' : 'نمایش دادن'}
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// REUSABLE LOGO UPLOAD & PREVIEW COMPONENT (STRICT RTL SUPPORT)
// =========================================================================
const LogoUploadField: React.FC<{
  logoUrl?: string;
  defaultLogoId: string;
  defaultType?: any;
  onChange: (url: string) => void;
  title?: string;
}> = ({ logoUrl, defaultLogoId, defaultType, onChange, title = 'تصویر لوگوی برند' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً صرفاً فایل تصویری (PNG, JPG, SVG, WebP) انتخاب فرمایید.');
      return;
    }

    setIsUploading(true);

    const convertToBase64 = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
          toast.success('لوگو به صورت تصویر ذخیره شد. لطفاً دکمه «ذخیره تغییرات سراسری» را بزنید.');
        }
      };
      reader.readAsDataURL(file);
    };

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logos');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onChange(data.url);
        toast.success('لوگوی جدید با موفقیت بارگذاری شد. لطفاً دکمه «ذخیره تغییرات سراسری» را بزنید.');
      } else {
        convertToBase64();
      }
    } catch (err) {
      convertToBase64();
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/60 overflow-hidden text-right" dir="rtl">
      <div className="relative shrink-0">
        <PaymentLogoBadge
          id={defaultLogoId}
          type={defaultType}
          customLogoUrl={logoUrl}
          size={36}
          className="rounded-xl shadow-sm"
        />
      </div>

      <div className="flex-1 min-w-0 text-right">
        <span className="text-[11px] font-semibold text-foreground block truncate text-right">{title}:</span>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-7 px-2.5 text-[10px] rounded-lg border-border flex items-center gap-1.5"
          >
            {isUploading ? <RefreshCw className="w-3 h-3 animate-spin me-1" /> : <Upload className="w-3 h-3 me-1" />}
            <span>{logoUrl ? 'تغییر لوگو' : 'آپلود لوگوی اختصاصی'}</span>
          </Button>

          {logoUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange('')}
              className="h-7 px-2 text-[10px] rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 flex items-center gap-1"
              title="بازنشانی به لوگوی پیش‌فرض"
            >
              <RotateCcw className="w-3 h-3 me-1" />
              <span>پیش‌فرض</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MASTER GROUP CONTROL CARD (HIGHLY DISTINCTIVE PARENT CONTROLLER UI - STRICT RTL)
// =========================================================================
interface MasterGroupControlCardProps {
  title: string;
  subtitle: string;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  activeCount: number;
  countLabel: string;
  colorTheme: 'emerald' | 'blue' | 'amber' | 'cyan';
  icon: React.ComponentType<{ className?: string }>;
  alertMessage: string;
}

const MasterGroupControlCard: React.FC<MasterGroupControlCardProps> = ({
  title,
  subtitle,
  isActive,
  onToggle,
  activeCount,
  countLabel,
  colorTheme,
  icon: Icon,
  alertMessage,
}) => {
  const styles = {
    emerald: {
      border: 'border-2 border-emerald-500/35 dark:border-emerald-500/25',
      bg: 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-card dark:from-emerald-950/40 dark:via-emerald-900/15 dark:to-card',
      shadow: 'shadow-lg shadow-emerald-500/5',
      iconBox: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500',
      pillBorder: 'border-emerald-500/30',
      tagBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    blue: {
      border: 'border-2 border-blue-500/35 dark:border-blue-500/25',
      bg: 'bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-card dark:from-blue-950/40 dark:via-blue-900/15 dark:to-card',
      shadow: 'shadow-lg shadow-blue-500/5',
      iconBox: 'bg-blue-500/15 border-blue-500/30 text-blue-500',
      pillBorder: 'border-blue-500/30',
      tagBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    amber: {
      border: 'border-2 border-amber-500/35 dark:border-amber-500/25',
      bg: 'bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-card dark:from-amber-950/40 dark:via-amber-900/15 dark:to-card',
      shadow: 'shadow-lg shadow-amber-500/5',
      iconBox: 'bg-amber-500/15 border-amber-500/30 text-amber-500',
      pillBorder: 'border-amber-500/30',
      tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    cyan: {
      border: 'border-2 border-cyan-500/35 dark:border-cyan-500/25',
      bg: 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/5 to-card dark:from-cyan-950/40 dark:via-cyan-900/15 dark:to-card',
      shadow: 'shadow-lg shadow-cyan-500/5',
      iconBox: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-500',
      pillBorder: 'border-cyan-500/30',
      tagBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  }[colorTheme];

  return (
    <Card className={`rounded-3xl p-5 sm:p-6 mb-6 sm:mb-8 overflow-hidden transition-all text-right ${styles.border} ${styles.bg} ${styles.shadow}`} dir="rtl">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <Badge variant={isActive ? 'emerald' : 'secondary'} className="text-xs">
          {isActive ? `${activeCount} ${countLabel} فعال` : 'کل دسته غیرفعال'}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and Icon */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${styles.iconBox}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-right">
            <h3 className="text-sm sm:text-base font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>
          </div>
        </div>

        {/* Highlighted Master Switch Box */}
        <div className={`flex items-center justify-between sm:justify-end gap-3.5 p-2 ps-3.5 pe-2.5 rounded-2xl bg-card/90 border ${styles.pillBorder} shadow-sm shrink-0`}>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-foreground">
              {isActive ? 'وضعیت گروه: فعال' : 'وضعیت گروه: خاموش'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isActive ? 'در دسترس کاربران و خریداران' : 'پنهان در سراسر پلتفرم'}
            </span>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>

      {!isActive && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-center gap-2.5 animate-in fade-in-0 duration-150 text-right">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium leading-relaxed">{alertMessage}</span>
        </div>
      )}
    </Card>
  );
};

// =========================================================================
// MODERN SORTABLE ACCORDION CARD COMPONENT (ZERO-LAG DRAG & STRICT RTL)
// =========================================================================
interface SortableAccordionCardProps {
  id: string;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
  colorTheme?: 'emerald' | 'blue' | 'amber' | 'cyan';
  logo: React.ReactNode;
  title: string;
  englishSubtitle?: string;
  companySubtitle?: string;
  children: React.ReactNode;
}

const SortableAccordionCard: React.FC<SortableAccordionCardProps> = ({
  id,
  isActive,
  isExpanded,
  onToggleExpand,
  onToggleActive,
  onDelete,
  colorTheme = 'emerald',
  logo,
  title,
  englishSubtitle,
  companySubtitle,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // ZERO-LAG FIX: When actively dragged, transition is strictly 'none' (0ms instant tracking to mouse cursor)
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : transition,
    zIndex: isDragging ? 999 : undefined,
  };

  const themeGlowMap = {
    emerald: 'ring-emerald-500/80 shadow-emerald-500/25',
    blue: 'ring-blue-500/80 shadow-blue-500/25',
    amber: 'ring-amber-500/80 shadow-amber-500/25',
    cyan: 'ring-cyan-500/80 shadow-cyan-500/25',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`provider-item-${id}`}
      dir="rtl"
      className={`rounded-3xl border overflow-hidden text-right ${isDragging
        ? `!transition-none scale-[1.02] ring-2 ${themeGlowMap[colorTheme]} shadow-2xl z-[999] bg-card relative cursor-grabbing opacity-95`
        : isActive
          ? 'transition-colors duration-200 border-border bg-card shadow-sm hover:border-border/80'
          : 'transition-colors duration-200 border-border/50 bg-muted/20 opacity-75'
        }`}
    >
      {/* Accordion Row Header: Strict RTL layout */}
      <div
        onClick={onToggleExpand}
        dir="rtl"
        className="p-3.5 sm:p-4 flex flex-row items-center justify-between gap-3 cursor-pointer hover:bg-muted/40 transition-colors select-none text-right"
      >
        {/* Right / Start Side (منتهی‌الیه سمت راست): Drag Handle + Logo + Titles */}
        <div className="flex flex-row items-center gap-2.5 sm:gap-3 min-w-0 text-right">
          {/* 1. Fluid Drag Grip Handle with dnd-kit attributes & listeners */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted touch-none transition-colors shrink-0"
            title="جهت تغییر ترتیب، بکشید و رها کنید"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* 2. Logo */}
          <div className="shrink-0">{logo}</div>

          {/* 4. Bank / Wallet Name (Right aligned) */}
          <div className="min-w-0 text-right">
            <div className="flex items-center gap-2 text-right">
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">{title}</span>
              {englishSubtitle && (
                <span className="text-[10px] font-mono text-muted-foreground font-semibold hidden sm:inline" dir="ltr">
                  ({englishSubtitle})
                </span>
              )}
            </div>
            {companySubtitle && (
              <span className="text-[10px] text-muted-foreground block truncate text-right">{companySubtitle}</span>
            )}
          </div>
        </div>

        {/* Left / End Side (منتهی‌الیه سمت چپ): Active Status Switch, Delete Button, and Expand Chevron */}
        <div
          className="flex flex-row items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Active Switch */}
          <Switch
            checked={isActive}
            onCheckedChange={onToggleActive}
          />

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/20 transition-colors"
            title="حذف درگاه"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Accordion Expand/Collapse Indicator */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="p-1 text-muted-foreground hover:text-foreground ms-1 transition-colors"
            title={isExpanded ? 'بستن تنظیمات' : 'مشاهده تنظیمات'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                }`}
            />
          </button>
        </div>
      </div>

      {/* Accordion Body Form (Exclusive Expansion) */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-border/80 space-y-4 bg-muted/10 animate-in fade-in-0 duration-150 text-right" dir="rtl">
          {children}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================
export default function AdminPaymentMethodsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('wallets');

  // EXCLUSIVE EXPANSION STATE: Holds the single currently expanded item ID (or null when all collapsed)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Group Master Toggles (Category Switches)
  const [activeProfileCategories, setActiveProfileCategories] = useState({
    wallet: true,
    bank: true,
    hawala: true,
    crypto: true,
  });

  // Providers lists
  const [wallets, setWallets] = useState<IStoreWalletItem[]>(DEFAULT_DETAILED_WALLETS);
  const [banks, setBanks] = useState<IStoreBankItem[]>(DEFAULT_DETAILED_BANKS);
  const [hawalas, setHawalas] = useState<IStoreHawalaItem[]>(DEFAULT_DETAILED_HAWALAS);
  const [cryptos, setCryptos] = useState<IStoreCryptoItem[]>(DEFAULT_DETAILED_CRYPTOS);

  // COD & Installments
  const [codSettings, setCodSettings] = useState<CodSettings>({
    isActive: true,
    deliveryFee: 150,
    deliveryCompany: 'پیک اکسپرس کابل و ترانسپورت پستی ولایات',
    terms: 'مبلغ پس از دریافت فیزیکی کارت هوشمند NFC و تایید بسته پرداخت خواهد شد.',
    logoUrl: '',
  });

  const [installmentSettings, setInstallmentSettings] = useState<InstallmentSettings>({
    isActive: true,
    minOrderAmount: 5000,
    downPaymentPercent: 30,
    installmentCount: 3,
    corporateOnly: true,
    terms: 'خرید اقساطی صرفاً ویژه شرکت‌ها، سازمان‌ها و مشتریان سازمانی با عقد قرارداد رسمی امکان‌پذیر می‌باشد.',
    logoUrl: '',
  });

  // Setup dnd-kit sensors with 4px distance activation constraint
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/store-payment-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        if (s.activeProfileCategories) setActiveProfileCategories(s.activeProfileCategories);
        if (s.wallets && s.wallets.length > 0) setWallets(s.wallets);
        if (s.banks && s.banks.length > 0) setBanks(s.banks);
        if (s.hawalas && s.hawalas.length > 0) setHawalas(s.hawalas);
        if (s.cryptos && s.cryptos.length > 0) setCryptos(s.cryptos);
        if (s.codSettings) setCodSettings(s.codSettings);
        if (s.installmentSettings) setInstallmentSettings(s.installmentSettings);
      }
    } catch (err) {
      toast.error('خطا در فراخوانی تنظیمات مالی از سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const activeMethods = {
        hesabpay: Boolean(activeProfileCategories.wallet && wallets.find((w) => w.id === 'hesabpay')?.isActive),
        bank: activeProfileCategories.bank && banks.some((b) => b.isActive),
        hawala: activeProfileCategories.hawala && hawalas.some((h) => h.isActive),
        crypto: activeProfileCategories.crypto && cryptos.some((c) => c.isActive),
        cod: Boolean(codSettings.isActive),
        installment: Boolean(installmentSettings.isActive),
      };

      const payload = {
        activeMethods,
        activeProfileCategories,
        wallets,
        banks,
        hawalas,
        cryptos,
        codSettings,
        installmentSettings,
      };

      const res = await fetch('/api/admin/store-payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('تمامی تنظیمات مالی، ترتیب درگاه‌ها و وضعیت‌ها با موفقیت ذخیره شد.');
      } else {
        toast.error(data.message || 'خطا در ذخیره تنظیمات.');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور هنگام ذخیره اطلاعات.');
    } finally {
      setIsSaving(false);
    }
  };

  // Exclusive Toggle: Opens only clicked item, closes all other items immediately
  const toggleAccordion = (id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  // Modern dnd-kit DragEnd handler
  const handleDragEnd = (event: DragEndEvent, group: 'wallets' | 'banks' | 'hawalas' | 'cryptos') => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (group === 'wallets') {
      setWallets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    } else if (group === 'banks') {
      setBanks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    } else if (group === 'hawalas') {
      setHawalas((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    } else if (group === 'cryptos') {
      setCryptos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    toast.success('ترتیب نمایش با موفقیت تغییر یافت.');
  };

  // =========================================================================
  // WALLET HANDLERS
  // =========================================================================
  const updateWallet = (id: string, patch: Partial<IStoreWalletItem>) => {
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };

  const handleAddWallet = () => {
    const newId = `wallet-custom-${Date.now()}`;
    setWallets((prev) => [
      ...prev,
      {
        id: newId,
        name: 'Custom Wallet',
        nameFa: 'کیف پول جدید افغانستان',
        providerCompany: 'شرکت خدمات تادیاتی',
        accountNumber: '',
        accountHolder: '',
        instructions: 'انتقال وجه به شماره حساب فوق.',
        logoUrl: '',
        isActive: true,
      },
    ]);
    setExpandedItemId(newId);
    toast.success('کیف پول جدید به لیست اضافه شد.');
  };

  const handleRemoveWallet = (id: string) => {
    if (wallets.length <= 1) {
      toast.error('حداقل یک کیف پول باید در سیستم باقی بماند.');
      return;
    }
    setWallets((prev) => prev.filter((w) => w.id !== id));
    if (expandedItemId === id) setExpandedItemId(null);
    toast.info('کیف پول از لیست حذف شد.');
  };

  // =========================================================================
  // BANK HANDLERS
  // =========================================================================
  const updateBank = (id: string, patch: Partial<IStoreBankItem>) => {
    setBanks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const handleAddBank = () => {
    const newId = `bank-custom-${Date.now()}`;
    setBanks((prev) => [
      ...prev,
      {
        id: newId,
        bankName: 'Custom Afghan Commercial Bank',
        bankNameFa: 'بانک تجارتی جدید افغانستان',
        accountHolder: 'Aryalink LLC',
        accountNumber: '',
        iban: '',
        swiftCode: '',
        branchName: 'شعبه مرکزی',
        logoUrl: '',
        isActive: true,
      },
    ]);
    setExpandedItemId(newId);
    toast.success('بانک جدید به لیست اضافه شد.');
  };

  const handleRemoveBank = (id: string) => {
    if (banks.length <= 1) {
      toast.error('حداقل یک حساب بانکی باید در سیستم باقی بماند.');
      return;
    }
    setBanks((prev) => prev.filter((b) => b.id !== id));
    if (expandedItemId === id) setExpandedItemId(null);
    toast.info('بانک از لیست حذف شد.');
  };

  // =========================================================================
  // HAWALA HANDLERS
  // =========================================================================
  const updateHawala = (id: string, patch: Partial<IStoreHawalaItem>) => {
    setHawalas((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const handleAddHawala = () => {
    const newId = `hawala-${Date.now()}`;
    setHawalas((prev) => [
      ...prev,
      {
        id: newId,
        exchangeName: 'صرافی معتبر افغانستان',
        cityBranch: 'سرای شهزاده کابل',
        receiverName: 'احمد رسولی',
        receiverPhone: '0799000000',
        instructions: 'واریز از طریق صرافی معتبر و تحویل فیش به پشتیبانی.',
        logoUrl: '',
        isActive: true,
      },
    ]);
    setExpandedItemId(newId);
    toast.success('صرافی جدید به لیست اضافه شد.');
  };

  const handleRemoveHawala = (id: string) => {
    if (hawalas.length <= 1) {
      toast.error('حداقل یک صرافی باید در لیست باقی بماند.');
      return;
    }
    setHawalas((prev) => prev.filter((h) => h.id !== id));
    if (expandedItemId === id) setExpandedItemId(null);
    toast.info('صرافی از لیست حذف شد.');
  };

  // =========================================================================
  // CRYPTO HANDLERS
  // =========================================================================
  const updateCrypto = (id: string, patch: Partial<IStoreCryptoItem>) => {
    setCryptos((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleAddCrypto = () => {
    const newId = `crypto-${Date.now()}`;
    setCryptos((prev) => [
      ...prev,
      {
        id: newId,
        network: 'POLYGON',
        currency: 'USDT',
        walletAddress: '',
        instructions: 'واریز تتر صرفاً روی همین شبکه.',
        logoUrl: '',
        isActive: true,
      },
    ]);
    setExpandedItemId(newId);
    toast.success('شبکه رمزارز جدید به لیست اضافه شد.');
  };

  const handleRemoveCrypto = (id: string) => {
    if (cryptos.length <= 1) {
      toast.error('حداقل یک شبکه رمزارز باید در لیست باقی بماند.');
      return;
    }
    setCryptos((prev) => prev.filter((c) => c.id !== id));
    if (expandedItemId === id) setExpandedItemId(null);
    toast.info('شبکه رمزارز حذف شد.');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3" dir="rtl">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-muted-foreground">در حال بارگذاری تنظیمات درگاه‌های مالی...</p>
      </div>
    );
  }

  // Active counts for badges
  const activeWalletsCount = activeProfileCategories.wallet ? wallets.filter((w) => w.isActive).length : 0;
  const activeBanksCount = activeProfileCategories.bank ? banks.filter((b) => b.isActive).length : 0;
  const activeHawalasCount = activeProfileCategories.hawala ? hawalas.filter((h) => h.isActive).length : 0;
  const activeCryptosCount = activeProfileCategories.crypto ? cryptos.filter((c) => c.isActive).length : 0;
  const activeOtherCount = (codSettings.isActive ? 1 : 0) + (installmentSettings.isActive ? 1 : 0);

  return (
    <div className="space-y-6 select-none text-right" dir="rtl">
      {/* Top Banner & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border" dir="rtl">
        <div className="text-right">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 text-right">
            <Link href="/admin/finance" className="hover:text-foreground transition-colors">
              امور مالی و تراکنش‌ها
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">تنظیمات داینامیک درگاه‌های پرداخت</span>
          </div>
          <div className="flex items-center gap-2.5 text-right">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              مدیریت داینامیک درگاه‌ها و روش‌های پرداخت
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-right">
            کنترل گروهی، مرتب‌سازی سیال با درگ و دراپ آنی و بدون تاخیر، آکاردئون انحصاری و ساختار کاملاً راست‌چین
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={fetchSettings}
            variant="outline"
            size="sm"
            disabled={isSaving}
            className="h-10 px-3.5 rounded-xl border-border bg-card flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 me-1" />
            <span>بازنشانی داده‌ها</span>
          </Button>

          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
            <span>ذخیره تغییرات سراسری</span>
          </Button>
        </div>
      </div>

      {/* TABS CONTAINER */}
      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setExpandedItemId(null); }} className="space-y-6 text-right" dir="rtl">
        {/* TAB NAVIGATION HEADER */}
        <div className="w-full overflow-x-auto pb-1" dir="rtl">
          <TabsList className="h-12 p-1.5 bg-muted/60 border border-border/80 rounded-2xl flex items-center gap-1 min-w-max" dir="rtl">
            {/* Tab 1: Wallets */}
            <TabsTrigger
              value="wallets"
              className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Wallet className="w-4 h-4 text-emerald-500 me-1" />
              <span>کیف پول‌های الکترونیک</span>
              <Badge variant={activeWalletsCount > 0 ? 'emerald' : 'secondary'} className="text-[10px] px-1.5 py-0 ms-1">
                {activeWalletsCount} فعال
              </Badge>
            </TabsTrigger>

            {/* Tab 2: Banks */}
            <TabsTrigger
              value="banks"
              className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Building className="w-4 h-4 text-blue-500 me-1" />
              <span>درگاه‌های بانکی و واریز</span>
              <Badge variant={activeBanksCount > 0 ? 'emerald' : 'secondary'} className="text-[10px] px-1.5 py-0 ms-1">
                {activeBanksCount} فعال
              </Badge>
            </TabsTrigger>

            {/* Tab 3: Hawala */}
            <TabsTrigger
              value="hawala"
              className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <PaymentLogoBadge id="hawala" type="hawala" size={16} className="me-1" />
              <span>حواله صرافی</span>
              <Badge variant={activeHawalasCount > 0 ? 'emerald' : 'secondary'} className="text-[10px] px-1.5 py-0 ms-1">
                {activeHawalasCount} صرافی
              </Badge>
            </TabsTrigger>

            {/* Tab 4: Crypto */}
            <TabsTrigger
              value="crypto"
              className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Coins className="w-4 h-4 text-cyan-500 me-1" />
              <span>ارز دیجیتال (تتر USDT)</span>
              <Badge variant={activeCryptosCount > 0 ? 'emerald' : 'secondary'} className="text-[10px] px-1.5 py-0 ms-1">
                {activeCryptosCount} شبکه
              </Badge>
            </TabsTrigger>

            {/* Tab 5: Other */}
            <TabsTrigger
              value="other"
              className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Truck className="w-4 h-4 text-purple-500 me-1" />
              <span>سایر روش‌ها (اقساط و COD)</span>
              <Badge variant={activeOtherCount > 0 ? 'emerald' : 'secondary'} className="text-[10px] px-1.5 py-0 ms-1">
                {activeOtherCount} متد
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: WALLETS (GROUP TOGGLE + ZERO-LAG DRAG & DROP + EXCLUSIVE ACCORDION) */}
        {/* ========================================================================= */}
        <TabsContent value="wallets" className="space-y-4 focus-visible:outline-none text-right" dir="rtl">
          {/* Distinct Master Group Control Card */}
          <MasterGroupControlCard
            title="کنترل گروهی: فعال‌سازی سراسری کیف پول‌های الکترونیک"
            subtitle="سوئیچ اصلی مدیریت دسته‌ای. در صورت خاموش بودن، کلیه کیف پول‌ها در کل پلتفرم (فروشگاه مرکزی و کارت‌های هوشمند کاربران) مخفی و غیرفعال می‌شوند."
            isActive={activeProfileCategories.wallet}
            onToggle={(checked) => setActiveProfileCategories((prev) => ({ ...prev, wallet: checked }))}
            activeCount={activeWalletsCount}
            countLabel="کیف‌پول"
            colorTheme="emerald"
            icon={Layers}
            alertMessage="توجه: گروه کیف‌پول‌ها در سراسر سیستم خاموش است و هیچ کاربری امکان مشاهده یا انتخاب آن را ندارد."
          />

          {/* Action Row: Add Custom Wallet */}
          <div className="flex items-center justify-between px-1" dir="rtl">
            <span className="text-xs font-bold text-muted-foreground text-right">
              لیست داینامیک کیف پول‌ها ({wallets.length} مورد - جابه‌جایی سریع با Drag & Drop):
            </span>
            <Button
              type="button"
              onClick={handleAddWallet}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-dashed border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 me-1" />
              <span>افزودن کیف‌پول جدید</span>
            </Button>
          </div>

          {/* Modern dnd-kit Sortable Accordion List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, 'wallets')}
          >
            <SortableContext
              items={wallets.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3" dir="rtl">
                {wallets.map((wallet, index) => {
                  const isExpanded = expandedItemId === wallet.id;
                  const isHesabPay = wallet.id === 'hesabpay';

                  return (
                    <SortableAccordionCard
                      key={wallet.id}
                      id={wallet.id}
                      isActive={wallet.isActive}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleAccordion(wallet.id)}
                      onToggleActive={(checked) => updateWallet(wallet.id, { isActive: checked })}
                      onDelete={() => handleRemoveWallet(wallet.id)}
                      colorTheme="emerald"
                      logo={
                        <PaymentLogoBadge
                          id={wallet.id}
                          type="wallet"
                          customLogoUrl={wallet.logoUrl}
                          size={28}
                        />
                      }
                      title={wallet.nameFa}
                      englishSubtitle={wallet.name}
                      companySubtitle={wallet.providerCompany}
                    >
                      {/* Logo Settings */}
                      <LogoUploadField
                        logoUrl={wallet.logoUrl}
                        defaultLogoId={wallet.id}
                        defaultType="wallet"
                        onChange={(url) => updateWallet(wallet.id, { logoUrl: url })}
                        title={`لوگوی اختصاصی ${wallet.nameFa}`}
                      />

                      {/* Technology-Specific Fields */}
                      {isHesabPay ? (
                        /* Smart Gateway Technology (HesabPay) */
                        <div className="p-4 rounded-2xl bg-card border border-border space-y-3 text-right" dir="rtl">
                          <div className="flex items-center justify-between pb-2 border-b border-border/60">
                            <div className="text-right">
                              <span className="text-xs font-bold text-foreground block">تنظیمات درگاه هوشمند حساب‌پی:</span>
                              <span className="text-[10px] text-muted-foreground">کلیدهای دسترسی امن و محیط درگاه</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground">حالت آزمایشی:</span>
                              <Switch
                                checked={wallet.hesabPayConfig?.isSandbox ?? true}
                                onCheckedChange={(checked) =>
                                  updateWallet(wallet.id, {
                                    hesabPayConfig: {
                                      ...(wallet.hesabPayConfig || {
                                        merchantId: '',
                                        apiKey: '',
                                        endpointUrl: 'https://api.hesabpay.af',
                                      }),
                                      isSandbox: checked,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-1 text-right">
                            <label className="text-[11px] font-bold text-foreground block text-right">شناسه پذیرنده:</label>
                            <Input
                              value={wallet.hesabPayConfig?.merchantId || ''}
                              onChange={(e) =>
                                updateWallet(wallet.id, {
                                  hesabPayConfig: {
                                    ...(wallet.hesabPayConfig || {
                                      isSandbox: true,
                                      apiKey: '',
                                      endpointUrl: 'https://api.hesabpay.af',
                                    }),
                                    merchantId: e.target.value,
                                  },
                                })
                              }
                              className="h-9 rounded-xl font-mono text-xs text-start"
                              dir="ltr"
                              placeholder="ARYALINK_MERCHANT_01"
                            />
                          </div>

                          {/* API Key with Password Eye Toggle */}
                          <PasswordInputField
                            label="کلید عمومی API"
                            value={wallet.hesabPayConfig?.apiKey || ''}
                            onChange={(val) =>
                              updateWallet(wallet.id, {
                                hesabPayConfig: {
                                  ...(wallet.hesabPayConfig || {
                                    isSandbox: true,
                                    merchantId: '',
                                    endpointUrl: 'https://api.hesabpay.af',
                                  }),
                                  apiKey: val,
                                },
                              })
                            }
                            placeholder="hp_live_key_..."
                          />

                          {/* Secret Key with Password Eye Toggle */}
                          <PasswordInputField
                            label="کلید امنیتی محرمانه"
                            value={wallet.hesabPayConfig?.apiSecret || ''}
                            onChange={(val) =>
                              updateWallet(wallet.id, {
                                hesabPayConfig: {
                                  ...(wallet.hesabPayConfig || {
                                    isSandbox: true,
                                    merchantId: '',
                                    apiKey: '',
                                    endpointUrl: 'https://api.hesabpay.af',
                                  }),
                                  apiSecret: val,
                                },
                              })
                            }
                            placeholder="hp_secret_key_..."
                          />

                          <div className="space-y-1 text-right">
                            <label className="text-[11px] font-bold text-foreground block text-right">آدرس سرور API:</label>
                            <Input
                              value={wallet.hesabPayConfig?.endpointUrl || 'https://api.hesabpay.af'}
                              onChange={(e) =>
                                updateWallet(wallet.id, {
                                  hesabPayConfig: {
                                    ...(wallet.hesabPayConfig || {
                                      isSandbox: true,
                                      merchantId: '',
                                      apiKey: '',
                                    }),
                                    endpointUrl: e.target.value,
                                  },
                                })
                              }
                              className="h-9 rounded-xl font-mono text-xs text-start"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* General Mobile Wallet Technology Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">
                            شماره موبایل / حساب در {wallet.name}:
                          </label>
                          <Input
                            value={wallet.accountNumber || ''}
                            onChange={(e) => updateWallet(wallet.id, { accountNumber: e.target.value })}
                            className="h-9 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                            placeholder="0799001122"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">نام صاحب حساب:</label>
                          <Input
                            value={wallet.accountHolder || ''}
                            onChange={(e) => updateWallet(wallet.id, { accountHolder: e.target.value })}
                            className="h-9 rounded-xl text-xs text-right"
                            placeholder="Aryalink LLC یا نام شخص"
                          />
                        </div>
                      </div>

                      {/* Wallet Name, English Name, and Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <label className="text-[10px] font-semibold text-muted-foreground block text-right">نام نمایشی (فارسی دری):</label>
                          <Input
                            value={wallet.nameFa}
                            onChange={(e) => updateWallet(wallet.id, { nameFa: e.target.value })}
                            className="h-8 rounded-xl text-xs text-right"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[10px] font-semibold text-muted-foreground block text-right">نام انگلیسی / شناسه:</label>
                          <Input
                            value={wallet.name}
                            onChange={(e) => updateWallet(wallet.id, { name: e.target.value })}
                            className="h-8 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[10px] font-semibold text-muted-foreground block text-right">شرکت ارائه‌دهنده سرویس:</label>
                          <Input
                            value={wallet.providerCompany}
                            onChange={(e) => updateWallet(wallet.id, { providerCompany: e.target.value })}
                            className="h-8 rounded-xl text-xs text-right"
                          />
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-1 text-right" dir="rtl">
                        <label className="text-[11px] font-bold text-foreground block text-right">توضیحات و راهنمای واریز برای مشتری:</label>
                        <Input
                          value={wallet.instructions || ''}
                          onChange={(e) => updateWallet(wallet.id, { instructions: e.target.value })}
                          className="h-9 rounded-xl text-xs text-right"
                          placeholder="مثال: لطفاً پس از انتقال وجه از طریق کد USSD، شماره رسید را در بخش زیر ثبت فرمایید."
                        />
                      </div>

                      {/* QR Code Preview for Wallets */}
                      {wallet.accountNumber && (
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4" dir="rtl">
                          <div className="text-right">
                            <span className="text-xs font-bold text-foreground block">بارکد سریع واریز (QR Code):</span>
                            <span className="text-[10px] text-muted-foreground">اسکن بارکد در اپلیکیشن‌های پرداخت الکترونیک</span>
                          </div>
                          <div className="p-1.5 rounded-xl bg-white shadow-sm shrink-0">
                            <QRCodeSVG
                              value={wallet.accountNumber}
                              size={52}
                              level="M"
                              includeMargin={false}
                            />
                          </div>
                        </div>
                      )}
                    </SortableAccordionCard>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: BANKS (GROUP TOGGLE + ZERO-LAG DRAG & DROP + EXCLUSIVE ACCORDION) */}
        {/* ========================================================================= */}
        <TabsContent value="banks" className="space-y-4 focus-visible:outline-none text-right" dir="rtl">
          {/* Distinct Master Group Control Card */}
          <MasterGroupControlCard
            title="کنترل گروهی: فعال‌سازی سراسری حساب‌ها و درگاه‌های بانکی"
            subtitle="سوئیچ اصلی مدیریت دسته‌ای بانک‌ها. با خاموش کردن این سوئیچ، کلیه بانک‌های تجارتی در سراسر پلتفرم مخفی و غیرفعال می‌شوند."
            isActive={activeProfileCategories.bank}
            onToggle={(checked) => setActiveProfileCategories((prev) => ({ ...prev, bank: checked }))}
            activeCount={activeBanksCount}
            countLabel="بانک"
            colorTheme="blue"
            icon={Building}
            alertMessage="توجه: گروه بانک‌ها به صورت سراسری غیرفعال است و هیچ بانکی در سیستم نمایش داده نخواهد شد."
          />

          {/* Action Row */}
          <div className="flex items-center justify-between px-1" dir="rtl">
            <span className="text-xs font-bold text-muted-foreground text-right">
              لیست داینامیک بانک‌ها ({banks.length} بانک - جابه‌جایی سریع با Drag & Drop):
            </span>
            <Button
              type="button"
              onClick={handleAddBank}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-dashed border-blue-500/50 text-blue-500 hover:bg-blue-500/10 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 me-1" />
              <span>افزودن بانک جدید</span>
            </Button>
          </div>

          {/* Modern dnd-kit Sortable Accordion List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, 'banks')}
          >
            <SortableContext
              items={banks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3" dir="rtl">
                {banks.map((bank, index) => {
                  const isExpanded = expandedItemId === bank.id;

                  return (
                    <SortableAccordionCard
                      key={bank.id}
                      id={bank.id}
                      isActive={bank.isActive}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleAccordion(bank.id)}
                      onToggleActive={(checked) => updateBank(bank.id, { isActive: checked })}
                      onDelete={() => handleRemoveBank(bank.id)}
                      colorTheme="blue"
                      logo={
                        <PaymentLogoBadge
                          id={bank.id}
                          type="bank"
                          customLogoUrl={bank.logoUrl}
                          size={28}
                        />
                      }
                      title={bank.bankNameFa}
                      englishSubtitle={bank.bankName}
                      companySubtitle={`سویفت: ${bank.swiftCode || '---'} | شماره حساب: ${bank.accountNumber || '---'}`}
                    >
                      {/* Logo Settings */}
                      <LogoUploadField
                        logoUrl={bank.logoUrl}
                        defaultLogoId={bank.id}
                        defaultType="bank"
                        onChange={(url) => updateBank(bank.id, { logoUrl: url })}
                        title={`لوگوی اختصاصی ${bank.bankNameFa}`}
                      />

                      {/* Bank Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">نام بانک (فارسی دری):</label>
                          <Input
                            value={bank.bankNameFa}
                            onChange={(e) => updateBank(bank.id, { bankNameFa: e.target.value })}
                            className="h-9 rounded-xl text-xs text-right"
                            placeholder="د افغانستان نړيوال بانک"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">نام بین‌المللی بانک (انگلیسی):</label>
                          <Input
                            value={bank.bankName}
                            onChange={(e) => updateBank(bank.id, { bankName: e.target.value })}
                            className="h-9 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                            placeholder="Afghanistan International Bank"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">نام کامل دارنده حساب:</label>
                          <Input
                            value={bank.accountHolder}
                            onChange={(e) => updateBank(bank.id, { accountHolder: e.target.value })}
                            className="h-9 rounded-xl text-xs text-right"
                            placeholder="Aryalink Smart Technologies LLC"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">شماره حساب بانکی:</label>
                          <Input
                            value={bank.accountNumber}
                            onChange={(e) => updateBank(bank.id, { accountNumber: e.target.value })}
                            className="h-9 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                            placeholder="0101-2345678-001"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">شماره شبا (IBAN):</label>
                          <Input
                            value={bank.iban || ''}
                            onChange={(e) => updateBank(bank.id, { iban: e.target.value })}
                            className="h-9 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                            placeholder="AF01AIB00000001012345678001"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">کد بین‌المللی سویفت (SWIFT):</label>
                          <Input
                            value={bank.swiftCode}
                            onChange={(e) => updateBank(bank.id, { swiftCode: e.target.value })}
                            className="h-9 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                            placeholder="AFINAFKA"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">شعبه / شهر بانک:</label>
                          <Input
                            value={bank.branchName || ''}
                            onChange={(e) => updateBank(bank.id, { branchName: e.target.value })}
                            className="h-9 rounded-xl text-xs text-right"
                            placeholder="شعبه مرکزی - شهر نو کابل"
                          />
                        </div>
                      </div>
                    </SortableAccordionCard>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: HAWALA (GROUP TOGGLE + ZERO-LAG DRAG & DROP + EXCLUSIVE ACCORDION) */}
        {/* ========================================================================= */}
        <TabsContent value="hawala" className="space-y-4 focus-visible:outline-none text-right" dir="rtl">
          {/* Distinct Master Group Control Card */}
          <MasterGroupControlCard
            title="کنترل گروهی: فعال‌سازی سراسری حواله صرافی و نقدی"
            subtitle="سوئیچ اصلی مدیریت دسته‌ای صرافی‌ها. با غیرفعال کردن این سوئیچ، تب حواله صرافی در کل پلتفرم پنهان خواهد شد."
            isActive={activeProfileCategories.hawala}
            onToggle={(checked) => setActiveProfileCategories((prev) => ({ ...prev, hawala: checked }))}
            activeCount={activeHawalasCount}
            countLabel="صرافی"
            colorTheme="amber"
            icon={PaymentLogoBadge as any}
            alertMessage="توجه: گروه حواله صرافی خاموش است و هیچ صرافی‌ای به کاربران و خریداران نشان داده نمی‌شود."
          />

          {/* Action Row */}
          <div className="flex items-center justify-between px-1" dir="rtl">
            <span className="text-xs font-bold text-muted-foreground text-right">
              لیست داینامیک صرافی‌ها ({hawalas.length} صرافی - جابه‌جایی سریع با Drag & Drop):
            </span>
            <Button
              type="button"
              onClick={handleAddHawala}
              className="h-8 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 me-1" />
              <span>افزودن صرافی جدید</span>
            </Button>
          </div>

          {/* Modern dnd-kit Sortable Accordion List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, 'hawalas')}
          >
            <SortableContext
              items={hawalas.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3" dir="rtl">
                {hawalas.map((hawala, index) => {
                  const isExpanded = expandedItemId === hawala.id;

                  return (
                    <SortableAccordionCard
                      key={hawala.id}
                      id={hawala.id}
                      isActive={hawala.isActive}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleAccordion(hawala.id)}
                      onToggleActive={(checked) => updateHawala(hawala.id, { isActive: checked })}
                      onDelete={() => handleRemoveHawala(hawala.id)}
                      colorTheme="amber"
                      logo={
                        <PaymentLogoBadge
                          id={hawala.id}
                          type="hawala"
                          customLogoUrl={hawala.logoUrl}
                          size={28}
                        />
                      }
                      title={hawala.exchangeName}
                      englishSubtitle={hawala.cityBranch}
                      companySubtitle={`تحویل‌گیرنده: ${hawala.receiverName} (${hawala.receiverPhone})`}
                    >
                      {/* Logo Settings */}
                      <LogoUploadField
                        logoUrl={hawala.logoUrl}
                        defaultLogoId="hawala"
                        defaultType="hawala"
                        onChange={(url) => updateHawala(hawala.id, { logoUrl: url })}
                        title={`لوگوی صرافی ${hawala.exchangeName}`}
                      />

                      {/* Hawala Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">نام صرافی یا شرکت خدمات پولی:</label>
                          <Input
                            value={hawala.exchangeName}
                            onChange={(e) => updateHawala(hawala.id, { exchangeName: e.target.value })}
                            className="h-9 rounded-xl text-xs text-right"
                            placeholder="صرافی برادران عزیزی"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">شهر، موقعیت و شماره دکان:</label>
                          <Input
                            value={hawala.cityBranch}
                            onChange={(e) => updateHawala(hawala.id, { cityBranch: e.target.value })}
                            className="h-9 rounded-xl text-xs text-right"
                            placeholder="سرای شهزاده کابل - دکان شماره ۴۲"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">نام و تخلص شخص تحویل‌گیرنده (همراه با ولد):</label>
                          <Input
                            value={hawala.receiverName}
                            onChange={(e) => updateHawala(hawala.id, { receiverName: e.target.value })}
                            className="h-9 rounded-xl text-xs text-right"
                            placeholder="حاجی احمد ولی رسولی (ولد محمد شریف)"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">شماره تماس هماهنگی و واتساپ صرافی:</label>
                          <Input
                            value={hawala.receiverPhone}
                            onChange={(e) => updateHawala(hawala.id, { receiverPhone: e.target.value })}
                            className="h-9 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                            placeholder="0799123456"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-right" dir="rtl">
                        <label className="text-[11px] font-bold text-foreground block text-right">دستورالعمل و ضوابط دریافت حواله:</label>
                        <Input
                          value={hawala.instructions}
                          onChange={(e) => updateHawala(hawala.id, { instructions: e.target.value })}
                          className="h-9 rounded-xl text-xs text-right"
                          placeholder="مثال: پس از واریز به صرافی فوق، لطفاً تصویر فیش حواله یا کد توکن را در سیستم ثبت فرمایید."
                        />
                      </div>
                    </SortableAccordionCard>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: CRYPTO (GROUP TOGGLE + ZERO-LAG DRAG & DROP + EXCLUSIVE ACCORDION) */}
        {/* ========================================================================= */}
        <TabsContent value="crypto" className="space-y-4 focus-visible:outline-none text-right" dir="rtl">
          {/* Distinct Master Group Control Card */}
          <MasterGroupControlCard
            title="کنترل گروهی: فعال‌سازی سراسری ارز دیجیتال (تتر USDT)"
            subtitle="سوئیچ اصلی مدیریت دسته‌ای رمزارزها. با خاموش کردن این سوئیچ، کلیه آدرس‌های رمزارز از سراسر پلتفرم مخفی می‌شوند."
            isActive={activeProfileCategories.crypto}
            onToggle={(checked) => setActiveProfileCategories((prev) => ({ ...prev, crypto: checked }))}
            activeCount={activeCryptosCount}
            countLabel="شبکه"
            colorTheme="cyan"
            icon={Coins}
            alertMessage="توجه: گروه ارز دیجیتال غیرفعال است و هیچ رمزارزی در سیستم نمایش داده نخواهد شد."
          />

          {/* Action Row */}
          <div className="flex items-center justify-between px-1" dir="rtl">
            <Button
              type="button"
              onClick={handleAddCrypto}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-dashed border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 me-1" />
              <span>افزودن شبکه جدید</span>
            </Button>
          </div>

          {/* Modern dnd-kit Sortable Accordion List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, 'cryptos')}
          >
            <SortableContext
              items={cryptos.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3" dir="rtl">
                {cryptos.map((crypto, index) => {
                  const isExpanded = expandedItemId === crypto.id;

                  return (
                    <SortableAccordionCard
                      key={crypto.id}
                      id={crypto.id}
                      isActive={crypto.isActive}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleAccordion(crypto.id)}
                      onToggleActive={(checked) => updateCrypto(crypto.id, { isActive: checked })}
                      onDelete={() => handleRemoveCrypto(crypto.id)}
                      colorTheme="cyan"
                      logo={
                        <PaymentLogoBadge
                          id={crypto.id}
                          type="crypto"
                          customLogoUrl={crypto.logoUrl}
                          size={28}
                        />
                      }
                      title={`تتر USDT - شبکه ${crypto.network}`}
                      englishSubtitle={`ارز: ${crypto.currency || 'USDT'}`}
                      companySubtitle={crypto.walletAddress ? `آدرس: ${crypto.walletAddress.slice(0, 14)}...` : 'بدون آدرس ثبت شده'}
                    >
                      {/* Logo Settings */}
                      <LogoUploadField
                        logoUrl={crypto.logoUrl}
                        defaultLogoId="usdt"
                        defaultType="crypto"
                        onChange={(url) => updateCrypto(crypto.id, { logoUrl: url })}
                        title={`لوگوی شبکه ${crypto.network}`}
                      />

                      {/* Crypto Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">شبکه بلاکچین:</label>
                          <Input
                            value={crypto.network}
                            onChange={(e) => updateCrypto(crypto.id, { network: e.target.value.toUpperCase() })}
                            className="h-9 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                            placeholder="TRC20, ERC20, BEP20, POLYGON"
                          />
                        </div>

                        <div className="space-y-1 text-right">
                          <label className="text-[11px] font-bold text-foreground block text-right">واحد ارز دیجیتال:</label>
                          <Input
                            value={crypto.currency || 'USDT'}
                            onChange={(e) => updateCrypto(crypto.id, { currency: e.target.value.toUpperCase() })}
                            className="h-9 rounded-xl font-mono text-xs text-start"
                            dir="ltr"
                            placeholder="USDT"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-right" dir="rtl">
                        <label className="text-[11px] font-bold text-foreground block text-right">آدرس ولت کریپتو:</label>
                        <Input
                          value={crypto.walletAddress}
                          onChange={(e) => updateCrypto(crypto.id, { walletAddress: e.target.value })}
                          className="h-9 rounded-xl font-mono text-xs text-start"
                          dir="ltr"
                          placeholder="TYDzsYUEpvnYmQk4zGP9sWWcTEd3G4Vtrc"
                        />
                      </div>

                      {/* QR Code and Instructions */}
                      {crypto.walletAddress && (
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-4" dir="rtl">
                          <div className="space-y-1 min-w-0 text-right">
                            <span className="text-xs font-bold text-foreground block">بارکد آدرس ولت:</span>
                            <span className="font-mono text-[10px] text-emerald-500 block truncate" dir="ltr">
                              {crypto.walletAddress}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              اسکن خودکار در کیف پول‌های تراست ولت، بایننس و متامسک
                            </span>
                          </div>
                          <div className="p-1.5 rounded-xl bg-white shadow-sm shrink-0">
                            <QRCodeSVG
                              value={crypto.walletAddress}
                              size={60}
                              level="M"
                              includeMargin={false}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 text-right" dir="rtl">
                        <label className="text-[11px] font-bold text-foreground block text-right">توضیحات و هشدارهای شبکه:</label>
                        <Input
                          value={crypto.instructions || ''}
                          onChange={(e) => updateCrypto(crypto.id, { instructions: e.target.value })}
                          className="h-9 rounded-xl text-xs text-right"
                          placeholder="مثال: انتقال تتر را منحصراً روی شبکه اعلام شده انجام دهید. مسئولیت خطای شبکه بر عهده فرستنده است."
                        />
                      </div>
                    </SortableAccordionCard>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 5: OTHER (COD & INSTALLMENTS) */}
        {/* ========================================================================= */}
        <TabsContent value="other" className="space-y-4 focus-visible:outline-none text-right" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
            {/* 1. Cash on Delivery (COD) */}
            <Card className="rounded-3xl border border-border bg-card p-5 space-y-4 shadow-sm overflow-hidden text-right" dir="rtl">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-3">
                  <PaymentLogoBadge
                    id="cod"
                    type="cod"
                    customLogoUrl={codSettings.logoUrl}
                    size={32}
                  />
                  <div className="text-right">
                    <h3 className="text-sm font-bold text-foreground">پرداخت هنگام تحویل (COD)</h3>
                    <p className="text-[11px] text-muted-foreground">تسویه نقدی همزمان با دریافت بسته از پیک</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={codSettings.isActive ? 'emerald' : 'secondary'} className="text-[10px]">
                    {codSettings.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                  <Switch
                    checked={codSettings.isActive}
                    onCheckedChange={(checked) => setCodSettings((prev) => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </div>

              <LogoUploadField
                logoUrl={codSettings.logoUrl}
                defaultLogoId="cod"
                defaultType="cod"
                onChange={(url) => setCodSettings((prev) => ({ ...prev, logoUrl: url }))}
                title="لوگوی سرویس پرداخت در محل"
              />

              {codSettings.isActive && (
                <div className="space-y-3 pt-1 text-xs text-right" dir="rtl">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1 text-right">
                      <label className="text-[11px] font-bold text-foreground block text-right">کرایه تحویل (افغانی):</label>
                      <Input
                        type="number"
                        value={codSettings.deliveryFee}
                        onChange={(e) =>
                          setCodSettings((prev) => ({ ...prev, deliveryFee: Number(e.target.value) }))
                        }
                        className="h-9 rounded-xl font-mono text-xs text-start"
                      />
                    </div>

                    <div className="space-y-1 text-right">
                      <label className="text-[11px] font-bold text-foreground block text-right">شرکت پیک / ترانسپورت:</label>
                      <Input
                        value={codSettings.deliveryCompany}
                        onChange={(e) => setCodSettings((prev) => ({ ...prev, deliveryCompany: e.target.value }))}
                        className="h-9 rounded-xl text-xs text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-foreground block text-right">شرایط و تعهدات تحویل نقدی:</label>
                    <Input
                      value={codSettings.terms}
                      onChange={(e) => setCodSettings((prev) => ({ ...prev, terms: e.target.value }))}
                      className="h-9 rounded-xl text-xs text-right"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* 2. Installments */}
            <Card className="rounded-3xl border border-border bg-card p-5 space-y-4 shadow-sm overflow-hidden text-right" dir="rtl">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-3">
                  <PaymentLogoBadge
                    id="installment"
                    type="installment"
                    customLogoUrl={installmentSettings.logoUrl}
                    size={32}
                  />
                  <div className="text-right">
                    <h3 className="text-sm font-bold text-foreground">خرید اقساطی و قراردادی</h3>
                    <p className="text-[11px] text-muted-foreground">پرداخت مرحله‌ای ویژه سازمان‌ها با عقد قرارداد رسمی</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={installmentSettings.isActive ? 'emerald' : 'secondary'} className="text-[10px]">
                    {installmentSettings.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                  <Switch
                    checked={installmentSettings.isActive}
                    onCheckedChange={(checked) =>
                      setInstallmentSettings((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>
              </div>

              <LogoUploadField
                logoUrl={installmentSettings.logoUrl}
                defaultLogoId="installment"
                defaultType="installment"
                onChange={(url) => setInstallmentSettings((prev) => ({ ...prev, logoUrl: url }))}
                title="لوگوی سیستم اقساط"
              />

              {installmentSettings.isActive && (
                <div className="space-y-3 pt-1 text-xs text-right" dir="rtl">
                  <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border/60">
                    <div className="text-right">
                      <span className="font-semibold text-foreground block">محدود به حساب‌های سازمانی:</span>
                      <span className="text-[10px] text-muted-foreground">صرفاً برای سازمان‌ها و شرکت‌های تایید شده</span>
                    </div>
                    <Switch
                      checked={installmentSettings.corporateOnly}
                      onCheckedChange={(checked) =>
                        setInstallmentSettings((prev) => ({ ...prev, corporateOnly: checked }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-right">
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] font-bold text-foreground block text-right">حداقل سفارش (افغانی):</label>
                      <Input
                        type="number"
                        value={installmentSettings.minOrderAmount}
                        onChange={(e) =>
                          setInstallmentSettings((prev) => ({ ...prev, minOrderAmount: Number(e.target.value) }))
                        }
                        className="h-8 rounded-xl font-mono text-xs text-start"
                      />
                    </div>

                    <div className="space-y-1 text-right">
                      <label className="text-[10px] font-bold text-foreground block text-right">پیش‌پرداخت (%):</label>
                      <Input
                        type="number"
                        value={installmentSettings.downPaymentPercent}
                        onChange={(e) =>
                          setInstallmentSettings((prev) => ({ ...prev, downPaymentPercent: Number(e.target.value) }))
                        }
                        className="h-8 rounded-xl font-mono text-xs text-start"
                      />
                    </div>

                    <div className="space-y-1 text-right">
                      <label className="text-[10px] font-bold text-foreground block text-right">تعداد اقساط:</label>
                      <Input
                        type="number"
                        value={installmentSettings.installmentCount}
                        onChange={(e) =>
                          setInstallmentSettings((prev) => ({ ...prev, installmentCount: Number(e.target.value) }))
                        }
                        className="h-8 rounded-xl font-mono text-xs text-start"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-foreground block text-right">شرایط و مدارک قرارداد:</label>
                    <Input
                      value={installmentSettings.terms}
                      onChange={(e) => setInstallmentSettings((prev) => ({ ...prev, terms: e.target.value }))}
                      className="h-9 rounded-xl text-xs text-right"
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky Bottom Action Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-between" dir="rtl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground text-right">
          <ShieldCheck className="w-4 h-4 text-emerald-500 me-1" />
          <span>تغییرات شما به صورت آنی در صفحه پرداخت فروشگاه و ویرایشگر پروفایل کاربران اعمال خواهد شد.</span>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
          <span>ذخیره تغییرات کلیه تب‌ها</span>
        </Button>
      </div>
    </div>
  );
}
