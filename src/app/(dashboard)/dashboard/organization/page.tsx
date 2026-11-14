'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  UserPlus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Palette,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  Lock,
  AlertCircle,
  CheckCircle2,
  Crown,
  Link2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OrgBranding {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  companySlogan?: string;
  enforceBranding?: boolean;
}

interface OrganizationData {
  _id: string;
  name: string;
  ownerId: string;
  totalLicenses: number;
  usedLicenses: number;
  branding: OrgBranding;
  createdAt?: string;
}

interface OrgMemberProfile {
  _id: string;
  alias: string;
  displayName: string;
  headline: string;
  avatarUrl: string;
  isActive: boolean;
}

interface OrgMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  orgRole: 'owner' | 'member' | string;
  isActive: boolean;
  createdAt?: string;
  profile: OrgMemberProfile | null;
}

function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

function formatDariDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('fa-AF', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return '—';
  }
}

export default function OrganizationDashboardPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAlias, setCopiedAlias] = useState<string | null>(null);

  // Onboarding state (if organization is not initialized yet)
  const [setupCompanyName, setSetupCompanyName] = useState('');
  const [setupLicenses, setSetupLicenses] = useState(50);
  const [setupSlogan, setSetupSlogan] = useState('');
  const [isInitializingOrg, setIsInitializingOrg] = useState(false);

  // Add Employee Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empHeadline, setEmpHeadline] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Corporate Branding Modal state
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#0ea5e9');
  const [brandAccentColor, setBrandAccentColor] = useState('#10b981');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [brandSlogan, setBrandSlogan] = useState('');
  const [brandEnforce, setBrandEnforce] = useState(true);
  const [applyToAllMembers, setApplyToAllMembers] = useState(true);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const fetchOrganizationData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/organization', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در بارگذاری اطلاعات سازمان.');
        setIsLoading(false);
        return;
      }

      setIsOwner(Boolean(data.isOwner));
      setOrganization(data.organization || null);
      setMembers(Array.isArray(data.members) ? data.members : []);

      if (data.organization) {
        setBrandName(data.organization.name || '');
        setBrandPrimaryColor(data.organization.branding?.primaryColor || '#0ea5e9');
        setBrandAccentColor(data.organization.branding?.accentColor || '#10b981');
        setBrandLogoUrl(data.organization.branding?.logoUrl || '');
        setBrandSlogan(data.organization.branding?.companySlogan || '');
        setBrandEnforce(data.organization.branding?.enforceBranding ?? true);
      }
    } catch {
      toast.error('ارتباط با سرور جهت دریافت اطلاعات سازمان برقرار نشد.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone || '').toLowerCase().includes(q) ||
        (m.occupation || '').toLowerCase().includes(q) ||
        (m.profile?.alias || '').toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const handleCopyLink = (alias: string) => {
    if (!alias) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/${alias}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedAlias(alias);
    toast.success('لینک مینی‌سایت کارمند در حافظه کاپی شد.');
    setTimeout(() => setCopiedAlias(null), 2200);
  };

  const handleInitializeOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupCompanyName.trim()) {
      toast.error('لطفاً نام شرکت یا سازمان را وارد نمایید.');
      return;
    }

    setIsInitializingOrg(true);
    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: setupCompanyName.trim(),
          totalLicenses: Number(setupLicenses) || 50,
          branding: {
            companySlogan: setupSlogan.trim(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در راه‌اندازی پنل سازمانی.');
        return;
      }
      toast.success('پنل سازمانی (B2B) با موفقیت فعال شد.');
      await fetchOrganizationData();
      router.refresh();
    } catch {
      toast.error('خطای شبکه در راه‌اندازی سازمان.');
    } finally {
      setIsInitializingOrg(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      toast.error('وارد کردن نام و تخلص کارمند الزامی است.');
      return;
    }
    if (!empEmail.trim() && !empPhone.trim()) {
      toast.error('لطفاً حداقل ایمیل آدرس یا شماره تماس کارمند را وارد کنید.');
      return;
    }

    setIsSubmittingMember(true);
    try {
      const res = await fetch('/api/organization/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: empName.trim(),
          email: empEmail.trim(),
          phone: empPhone.trim(),
          headline: empHeadline.trim(),
          password: empPassword.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'خطا در ثبت کارمند جدید.');
        return;
      }

      toast.success(data.message || 'کارمند جدید و پروفایل مینی‌سایت وی با موفقیت ساخته شد.');
      if (data.member) {
        setMembers((prev) => [data.member, ...prev]);
      }
      if (organization) {
        setOrganization({
          ...organization,
          usedLicenses:
            typeof data.usedLicenses === 'number'
              ? data.usedLicenses
              : organization.usedLicenses + 1,
        });
      }

      setEmpName('');
      setEmpEmail('');
      setEmpPhone('');
      setEmpHeadline('');
      setEmpPassword('');
      setIsAddModalOpen(false);
    } catch {
      toast.error('خطا در برقراری ارتباط با سرور برای افزودن کارمند.');
    } finally {
      setIsSubmittingMember(false);
    }
  };

  const handleRemoveMember = async (member: OrgMember) => {
    const confirmed = window.confirm(
      `آیا مطمئن هستید که می‌خواهید «${member.name}» را از لیست کارمندان سازمان خارج کنید؟ جواز مربوطه آزاد خواهد شد.`
    );
    if (!confirmed) return;

    setRemovingMemberId(member._id);
    try {
      const res = await fetch(`/api/organization/members?memberId=${member._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در حذف کارمند.');
        return;
      }

      toast.success(data.message || 'کارمند با موفقیت از سازمان حذف شد.');
      setMembers((prev) => prev.filter((m) => m._id !== member._id));
      if (organization) {
        setOrganization({
          ...organization,
          usedLicenses:
            typeof data.usedLicenses === 'number'
              ? data.usedLicenses
              : Math.max(0, organization.usedLicenses - 1),
        });
      }
    } catch {
      toast.error('خطای سرور هنگام حذف کارمند.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    try {
      const res = await fetch('/api/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandName.trim(),
          branding: {
            primaryColor: brandPrimaryColor,
            accentColor: brandAccentColor,
            logoUrl: brandLogoUrl.trim(),
            companySlogan: brandSlogan.trim(),
            enforceBranding: brandEnforce,
          },
          applyToAllMembers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'خطا در ذخیره تنظیمات برندینگ.');
        return;
      }

      toast.success(data.message || 'تنظیمات برندینگ سازمان ذخیره شد.');
      if (data.organization) {
        setOrganization(data.organization);
      }
      setIsBrandingModalOpen(false);
    } catch {
      toast.error('خطای شبکه هنگام ذخیره برندینگ.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <RefreshCw className="w-7 h-7 animate-spin text-cyan-500" />
        <p className="text-sm font-medium">در حال دریافت اطلاعات سازمان و لیست کارمندان...</p>
      </div>
    );
  }

  // Fallback onboarding / B2B initialization if user is not yet owner of an organization
  if (!isOwner || !organization) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card className="p-6 md:p-8 border-border bg-card/80 backdrop-blur-xl rounded-3xl shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <Badge variant="outline" className="mb-2 border-cyan-500/30 text-cyan-500 text-[11px]">
                پنل فروش سازمانی (B2B)
              </Badge>
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                راه‌اندازی پنل مدیریت سازمان و کارمندان
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                این بخش مخصوص مدیران شرکت‌ها و نهادهاست تا جوازهای (لایسنس‌های) خریداری‌شده را به کارمندان خود تخصیص دهند و رنگ‌بندی و هویت بصری واحد روی تمام کارت‌های پرسنل اعمال گردد.
              </p>
            </div>
          </div>

          <form onSubmit={handleInitializeOrganization} className="space-y-4 border-t border-border pt-6">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نام شرکت یا نهاد (الزامی)
              </label>
              <Input
                value={setupCompanyName}
                onChange={(e) => setSetupCompanyName(e.target.value)}
                placeholder="مثلاً: شرکت تجارتی آریا گروپ"
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  تعداد جوازهای (لایسنس‌های) پکیج
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5000}
                  value={setupLicenses}
                  onChange={(e) => setSetupLicenses(Number(e.target.value))}
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شعار سازمانی کارت‌ها (اختیاری)
                </label>
                <Input
                  value={setupSlogan}
                  onChange={(e) => setSetupSlogan(e.target.value)}
                  placeholder="مثلاً: پیشرو در خدمات دیجیتال افغانستان"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isInitializingOrg}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 gap-2"
              >
                {isInitializingOrg ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                فعال‌سازی پنل مدیریت سازمان
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  const totalLicenses = Math.max(1, organization.totalLicenses || 50);
  const usedLicenses = Math.max(0, organization.usedLicenses || 0);
  const remainingLicenses = Math.max(0, totalLicenses - usedLicenses);
  const usagePercent = Math.min(100, Math.round((usedLicenses / totalLicenses) * 100));
  const isQuotaFull = usedLicenses >= totalLicenses;

  const progressBarColor =
    usagePercent >= 95
      ? 'bg-rose-500'
      : usagePercent >= 75
        ? 'bg-amber-500'
        : 'bg-cyan-500';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 shadow-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${organization.branding?.primaryColor || '#0ea5e9'}22, ${organization.branding?.accentColor || '#10b981'}22)`,
            }}
          >
            {organization.branding?.logoUrl ? (
              <img
                src={organization.branding.logoUrl}
                alt={organization.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2
                className="w-7 h-7"
                style={{ color: organization.branding?.primaryColor || '#0ea5e9' }}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-foreground">
                {organization.name}
              </h1>
              <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
                پنل منابع بشری (HR)
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              مدیریت کارمندان، صدور خودکار کارت هوشمند و کنترل جوازهای سازمانی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsBrandingModalOpen(true)}
            className="rounded-xl gap-2 text-xs font-bold h-10"
          >
            <Palette className="w-4 h-4 text-cyan-500" />
            تنظیمات برندینگ سازمان
          </Button>
          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            disabled={isQuotaFull}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold gap-2 text-xs h-10 px-4 shadow-lg shadow-cyan-500/20"
          >
            <UserPlus className="w-4 h-4" />
            افزودن کارمند جدید
          </Button>
        </div>
      </div>

      {/* License Quota & Corporate Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* License Quota Widget */}
        <Card className="p-5 rounded-3xl border-border bg-card/80 backdrop-blur-md md:col-span-2 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold text-muted-foreground block mb-1">
                وضعیت جوازها (لایسنس‌های سازمانی)
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-black text-foreground">
                  مصرف شده: {toPersianDigits(usedLicenses)} از {toPersianDigits(totalLicenses)}
                </span>
                <Badge
                  variant="outline"
                  className={
                    isQuotaFull
                      ? 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                      : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                  }
                >
                  {isQuotaFull
                    ? 'ظرفیت تکمیل است'
                    : `${toPersianDigits(remainingLicenses)} جواز باقی‌مانده`}
                </Badge>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden border border-border/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>میزان استفاده از بسته شرکتی</span>
              <span className="font-bold text-foreground">{toPersianDigits(usagePercent)}٪</span>
            </div>
          </div>
        </Card>

        {/* Corporate Branding Summary Card */}
        <Card className="p-5 rounded-3xl border-border bg-card/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-muted-foreground block mb-1">
                هویت بصری و برندینگ واحد
              </span>
              <p className="text-sm font-bold text-foreground">
                {organization.branding?.enforceBranding
                  ? 'برندینگ خودکار فعال است'
                  : 'برندینگ اختیاری'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                style={{ backgroundColor: organization.branding?.primaryColor || '#0ea5e9' }}
                title="رنگ اصلی سازمانی"
              />
              <span
                className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                style={{ backgroundColor: organization.branding?.accentColor || '#10b981' }}
                title="رنگ دوم سازمانی"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate max-w-[180px]">
              {organization.branding?.companySlogan || 'بدون شعار ثبت شده'}
            </span>
            <button
              type="button"
              onClick={() => setIsBrandingModalOpen(true)}
              className="text-cyan-500 hover:text-cyan-400 font-bold shrink-0"
            >
              ویرایش رنگ و لوگو
            </button>
          </div>
        </Card>
      </div>

      {/* Quota Warning Banner when full */}
      {isQuotaFull && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs md:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            سقف جوازهای سازمان شما پر شده است ({toPersianDigits(totalLicenses)} از{' '}
            {toPersianDigits(totalLicenses)}). برای افزودن کارمند جدید، لطفاً بسته سازمانی خود را ارتقا دهید یا یک عضو غیرفعال را حذف کنید.
          </span>
        </div>
      )}

      {/* Employees Table Section */}
      <Card className="rounded-3xl border-border bg-card/80 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-black text-foreground">
              لیست کارمندان و پروفایل‌های سازمانی ({toPersianDigits(members.length)})
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، ایمیل یا شماره تماس..."
              className="pr-9 rounded-xl h-9 text-xs"
            />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="py-14 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {searchQuery
                ? 'هیچ کارمندی مطابق جستجوی شما یافت نشد.'
                : 'هنوز هیچ کارمندی به سازمان اضافه نشده است.'}
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              با کلیک بر روی دکمه «افزودن کارمند جدید»، می‌توانید در چند ثانیه برای کارمندان خود حساب کاربری و کارت ویزیت دیجیتال یکپارچه بسازید.
            </p>
            {!searchQuery && !isQuotaFull && (
              <Button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                افزودن اولین کارمند
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <th className="py-3.5 px-4">کارمند و سمت شغلی</th>
                  <th className="py-3.5 px-4">اطلاعات تماس (ایمیل / موبایل)</th>
                  <th className="py-3.5 px-4">لینک مینی‌سایت سازمانی</th>
                  <th className="py-3.5 px-4">نقش و تاریخ ثبت</th>
                  <th className="py-3.5 px-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70 text-xs">
                {filteredMembers.map((member) => {
                  const alias = member.profile?.alias || '';
                  const isOwnerRow = member.orgRole === 'owner';

                  return (
                    <tr
                      key={member._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0 overflow-hidden"
                            style={{
                              background:
                                organization.branding?.primaryColor || '#0ea5e9',
                            }}
                          >
                            {member.profile?.avatarUrl ? (
                              <img
                                src={member.profile.avatarUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              member.name.slice(0, 2)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">
                              {member.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {member.occupation || member.profile?.headline || 'عضو تیم'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-foreground" dir="ltr">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[190px]">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground" dir="ltr">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {alias ? (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/${alias}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold transition-colors"
                              dir="ltr"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span>/{alias}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(alias)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="کاپی لینک کارت کارمند"
                            >
                              {copiedAlias === alias ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            بدون مینی‌سایت متصل
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          {isOwnerRow ? (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] gap-1">
                              <Crown className="w-3 h-3" />
                              مدیر سازمان
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]"
                            >
                              عضو تیم (فعال)
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            ثبت: {formatDariDate(member.createdAt)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-left">
                        {!isOwnerRow ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={removingMemberId === member._id}
                            onClick={() => handleRemoveMember(member)}
                            className="h-8 px-2.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs gap-1.5"
                            title="حذف از سازمان و آزادسازی جواز"
                          >
                            {removingMemberId === member._id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">حذف</span>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal 1: Add New Employee */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <UserPlus className="w-5 h-5 text-cyan-500" />
              افزودن کارمند جدید به سازمان
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              اطلاعات کارمند را وارد کنید تا حساب کاربری عضو و کارت ویزیت هوشمند وی با رنگ‌بندی سازمان به صورت خودکار ایجاد شود.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddEmployee} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نام و تخلص کارمند (الزامی)
              </label>
              <Input
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="مثلاً: احمد فرهاد نوری"
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ایمیل آدرس کارمند
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="name@company.af"
                    className="pr-9 rounded-xl"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شماره تماس / واتساپ
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="+93799000000"
                    className="pr-9 rounded-xl"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  وظیفه / عنوان شغلی
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={empHeadline}
                    onChange={(e) => setEmpHeadline(e.target.value)}
                    placeholder="مثلاً: مدیر فروشات"
                    className="pr-9 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  رمز عبور اولیه (اختیاری)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="پیش‌فرض: AryaCorp123!"
                    className="pr-9 rounded-xl"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5 text-[11px] text-cyan-700 dark:text-cyan-300 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-cyan-500" />
              <span>
                با ثبت این کارمند، ۱ عدد از جوازهای باقی‌مانده ({toPersianDigits(remainingLicenses)} عدد موجود) مصرف شده و رنگ‌بندی/لوگوی سازمان به صورت خودکار روی کارت دیجیتال وی اعمال می‌گردد.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingMember}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs gap-2 px-5"
              >
                {isSubmittingMember ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                ثبت کارمند و ساخت کارت
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Corporate Branding Configuration */}
      <Dialog open={isBrandingModalOpen} onOpenChange={setIsBrandingModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <Palette className="w-5 h-5 text-cyan-500" />
              تنظیمات برندینگ و هویت بصری سازمان
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              رنگ‌ها و لوگوی سازمانی را مشخص کنید تا تمام کارت‌های دیجیتال کارمندان ظاهر یکسان و حرفه‌ای داشته باشند.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBranding} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                نام رسمی سازمان
              </label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  رنگ اصلی (Primary Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandPrimaryColor}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <Input
                    value={brandPrimaryColor}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    className="rounded-xl text-xs"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  رنگ مکمل (Accent Color)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandAccentColor}
                    onChange={(e) => setBrandAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5"
                  />
                  <Input
                    value={brandAccentColor}
                    onChange={(e) => setBrandAccentColor(e.target.value)}
                    className="rounded-xl text-xs"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                لینک لوگوی شرکت (Logo URL)
              </label>
              <Input
                value={brandLogoUrl}
                onChange={(e) => setBrandLogoUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-xl text-xs"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                شعار سازمانی پیش‌فرض کارت‌ها
              </label>
              <Input
                value={brandSlogan}
                onChange={(e) => setBrandSlogan(e.target.value)}
                placeholder="مثلاً: خدمات معیاری و مدرن برای مشتریان عزیز"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={brandEnforce}
                  onChange={(e) => setBrandEnforce(e.target.checked)}
                  className="rounded border-border text-cyan-500 focus:ring-cyan-500"
                />
                <span>اعمال خودکار برندینگ سازمان برای کارمندان جدید</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAllMembers}
                  onChange={(e) => setApplyToAllMembers(e.target.checked)}
                  className="rounded border-border text-cyan-500 focus:ring-cyan-500"
                />
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                  بروزرسانی فوری رنگ‌بندی روی تمام کارت‌های فعلی کارمندان
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBrandingModalOpen(false)}
                className="rounded-xl text-xs"
              >
                بستن
              </Button>
              <Button
                type="submit"
                disabled={isSavingBranding}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs gap-2 px-5"
              >
                {isSavingBranding ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                ذخیره تنظیمات برندینگ
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
