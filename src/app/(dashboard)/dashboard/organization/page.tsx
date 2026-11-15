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
  BadgeCheck,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/ui/file-uploader';
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
  secondaryColor?: string;
  accentColor?: string;
  coverImage?: string;
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
  const [activeTab, setActiveTab] = useState<'members' | 'branding'>('members');
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

  // Corporate Branding state
  const [brandName, setBrandName] = useState('');
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#0ea5e9');
  const [brandSecondaryColor, setBrandSecondaryColor] = useState('#10b981');
  const [brandCoverImage, setBrandCoverImage] = useState('');
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
        setBrandSecondaryColor(
          data.organization.branding?.secondaryColor ||
            data.organization.branding?.accentColor ||
            '#10b981'
        );
        setBrandCoverImage(data.organization.branding?.coverImage || '');
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
            secondaryColor: brandSecondaryColor,
            accentColor: brandSecondaryColor,
            coverImage: brandCoverImage.trim(),
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

      toast.success(data.message || 'تنظیمات برندینگ و قالب تیم با موفقیت ذخیره و اعمال شد.');
      if (data.organization) {
        setOrganization(data.organization);
      }
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
            variant={activeTab === 'branding' ? 'default' : 'outline'}
            onClick={() =>
              setActiveTab(activeTab === 'branding' ? 'members' : 'branding')
            }
            className="rounded-xl gap-2 text-xs font-bold h-10"
          >
            <Palette className="w-4 h-4 text-cyan-500" />
            تنظیمات برندینگ و قالب تیم
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card/80 border border-border w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>اعضای تیم و جوازها</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>تنظیمات برندینگ و قالب تیم</span>
        </button>
      </div>

      {activeTab === 'members' && (
        <>
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
                style={{
                  backgroundColor:
                    organization.branding?.secondaryColor ||
                    organization.branding?.accentColor ||
                    '#10b981',
                }}
                title="رنگ ثانویه سازمانی"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate max-w-[180px]">
              {organization.branding?.companySlogan || 'بدون شعار ثبت شده'}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className="text-cyan-500 hover:text-cyan-400 font-bold shrink-0 cursor-pointer"
            >
              تنظیم برندینگ و کاور
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
        </>
      )}

      {/* TAB 2: Corporate Branding & Team Template Settings */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Branding Settings Form */}
          <Card className="lg:col-span-7 p-5 md:p-6 rounded-3xl border-border bg-card/85 backdrop-blur-md shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h2 className="text-base md:text-lg font-black text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cyan-500" />
                  تنظیمات برندینگ و قالب تیم
                </h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  هویت بصری، لوگو، تصویر کاور و رنگ‌های تم شرکت را تعیین نمایید تا ظاهر مینی‌سایت تمام کارمندان به صورت یکپارچه و قفل‌شده نمایش داده شود.
                </p>
              </div>
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold gap-1 shrink-0">
                <Lock className="w-3 h-3" />
                یکپارچه‌سازی سازمانی
              </Badge>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  نام رسمی شرکت / سازمان
                </label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="نام رسمی سازمان"
                  className="rounded-xl"
                  required
                />
              </div>

              {/* 1. Corporate Logo Uploader */}
              <FileUploader
                value={brandLogoUrl}
                onChange={(url) => setBrandLogoUrl(url)}
                fileType="image"
                folder="branding"
                label="۱. لوگوی سازمانی (آپلود تصویر)"
                description="این لوگو به عنوان نشان تایید و وابستگی سازمانی در هدر و فوتر مینی‌سایت تمام کارمندان نمایش داده می‌شود."
                maxSizeMB={2}
                aspectRatio="square"
              />

              {/* 2. Primary & Secondary Theme Colors */}
              <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    ۲. رنگ اصلی و رنگ ثانویه تم (Primary & Secondary Colors)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { p: '#0ea5e9', s: '#10b981', name: 'فیروزه‌ای و زمردی' },
                      { p: '#2563eb', s: '#06b6d4', name: 'آبی رسمی' },
                      { p: '#7c3aed', s: '#ec4899', name: 'بنفش مدرن' },
                      { p: '#d97706', s: '#f59e0b', name: 'طلایی لوکس' },
                    ].map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        title={pal.name}
                        onClick={() => {
                          setBrandPrimaryColor(pal.p);
                          setBrandSecondaryColor(pal.s);
                        }}
                        className="w-6 h-6 rounded-full border border-white/30 shadow-xs cursor-pointer transition-transform hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${pal.p}, ${pal.s})`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      رنگ اصلی تم (Primary Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandPrimaryColor}
                        onChange={(e) => setBrandPrimaryColor(e.target.value)}
                        className="w-11 h-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
                      />
                      <Input
                        value={brandPrimaryColor}
                        onChange={(e) => setBrandPrimaryColor(e.target.value)}
                        className="rounded-xl text-xs font-sans uppercase"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      رنگ ثانویه تم (Secondary Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={brandSecondaryColor}
                        onChange={(e) => setBrandSecondaryColor(e.target.value)}
                        className="w-11 h-10 rounded-xl border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
                      />
                      <Input
                        value={brandSecondaryColor}
                        onChange={(e) => setBrandSecondaryColor(e.target.value)}
                        className="rounded-xl text-xs font-sans uppercase"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Fixed Corporate Cover Image Uploader */}
              <FileUploader
                value={brandCoverImage}
                onChange={(url) => setBrandCoverImage(url)}
                fileType="image"
                folder="covers"
                label="۳. تصویر کاور پس‌زمینه ثابت تیم (Cover Image)"
                description="این تصویر به عنوان کاور هدر ثابت روی مینی‌سایت تمام کارمندان اعمال شده و کارمندان امکان تغییر آن را نخواهند داشت."
                maxSizeMB={2}
                aspectRatio="banner"
              />

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  شعار سازمانی پیش‌فرض کارت‌ها (اختیاری)
                </label>
                <Input
                  value={brandSlogan}
                  onChange={(e) => setBrandSlogan(e.target.value)}
                  placeholder="مثلاً: خدمات معیاری و نوین برای مشتریان عزیز"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-muted/25 border border-border">
                <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brandEnforce}
                    onChange={(e) => setBrandEnforce(e.target.checked)}
                    className="rounded border-border text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="font-semibold text-foreground">
                    قفل کردن ابزارهای رنگ و کاور در ویرایشگر کارمندان (کارمند فقط عکس پروفایل شخصی را تغییر دهد)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToAllMembers}
                    onChange={(e) => setApplyToAllMembers(e.target.checked)}
                    className="rounded border-border text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    بروزرسانی و اعمال فوری روی پروفایل تمام کارمندان فعلی
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSavingBranding}
                  className="w-full sm:w-auto rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs gap-2 px-6 h-11 shadow-lg shadow-cyan-500/20"
                >
                  {isSavingBranding ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  ذخیره و اعمال برندینگ روی تمام کارت‌های تیم
                </Button>
              </div>
            </form>
          </Card>

          {/* Live Corporate Mini-Site Preview Column */}
          <Card className="lg:col-span-5 p-5 rounded-3xl border-border bg-card/85 backdrop-blur-md shadow-sm space-y-4 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-black text-foreground">
                  پیش‌نمایش زنده قالب یکپارچه کارمندان
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-500">
                نمای عمومی کارت
              </Badge>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/15 bg-slate-950 text-white shadow-2xl">
              {/* Cover Area */}
              <div className="relative h-36 w-full overflow-hidden">
                {brandCoverImage ? (
                  <img
                    src={brandCoverImage}
                    alt="Corporate Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(135deg, ${brandPrimaryColor}, ${brandSecondaryColor})`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

                {/* Floating Corporate Affiliation Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/15 text-[10px] font-bold shadow-lg">
                  {brandLogoUrl ? (
                    <img
                      src={brandLogoUrl}
                      alt={brandName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-3.5 h-3.5" style={{ color: brandPrimaryColor }} />
                  )}
                  <span className="truncate max-w-[130px]">{brandName || 'نام سازمان'}</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                </div>
              </div>

              {/* Avatar & Employee Sample Body */}
              <div className="px-5 pb-6 -mt-10 relative z-10 text-center space-y-3">
                <div className="w-20 h-20 rounded-full mx-auto border-4 border-slate-950 shadow-xl flex items-center justify-center text-lg font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${brandPrimaryColor}, ${brandSecondaryColor})`,
                  }}
                >
                  اف
                </div>

                <div>
                  <h3 className="text-base font-black text-white">احمد فرهاد نوری</h3>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: brandSecondaryColor }}>
                    مسئول ارتباطات — {brandName || 'سازمان شما'}
                  </p>
                  {brandSlogan && (
                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                      {brandSlogan}
                    </p>
                  )}
                </div>

                {/* Sample Corporate Action Buttons */}
                <div className="space-y-2 pt-2">
                  <div
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-between border"
                    style={{
                      backgroundColor: `${brandPrimaryColor}26`,
                      borderColor: brandPrimaryColor,
                    }}
                  >
                    <span>تماس مستقیم و واتساپ کاری</span>
                    <span className="text-[10px] opacity-80">←</span>
                  </div>
                  <div
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-white shadow-md flex items-center justify-between border"
                    style={{
                      background: `linear-gradient(135deg, ${brandPrimaryColor}, ${brandSecondaryColor})`,
                      borderColor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <span>ذخیره در مخاطبان موبایل (vCard)</span>
                    <span className="text-[10px]">+</span>
                  </div>
                </div>

                {/* Footer Affiliation Badge */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-slate-300">
                  {brandLogoUrl && (
                    <img
                      src={brandLogoUrl}
                      alt={brandName}
                      className="w-4 h-4 rounded object-cover"
                    />
                  )}
                  <span>تایید شده توسط {brandName || 'سازمان شما'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <span>
                تمام کارمندان تیم این کاور و رنگ‌بندی را روی کارت عمومی خود دریافت می‌کنند و در داشبورد خودشان فقط اجازه تغییر عکس پروفایل شخصی را خواهند داشت.
              </span>
            </div>
          </Card>
        </div>
      )}

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
    </div>
  );
}
