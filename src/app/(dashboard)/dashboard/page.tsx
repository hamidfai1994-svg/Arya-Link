'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Plus,
  Edit3,
  MoreVertical,
  Copy,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Sparkles,
  Layers,
  Search,
  Globe,
  Loader2,
  Share2,
  ShieldCheck,
  Building2,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/editor-store';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { CreditCard } from 'lucide-react';

interface ProfileItem {
  id: string;
  alias: string;
  displayName: string;
  headline?: string;
  avatarUrl?: string;
  roleType?: string;
  isActive?: boolean;
  isVerified?: boolean;
  viewsCount?: number;
  leadsCount?: number;
  linksCount?: number;
  createdAt?: string;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { switchProfile } = useEditorStore();

  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Create Profile Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newHeadline, setNewHeadline] = useState('');
  const [newRoleType, setNewRoleType] = useState<'personal' | 'business'>('personal');
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirmation State
  const [profileToDelete, setProfileToDelete] = useState<ProfileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hostname for preview
  const [domainHost, setDomainHost] = useState('aryal.ink');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomainHost(window.location.host || 'aryal.ink');
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'unauthorized_admin' || params.get('error') === 'admin_only') {
        toast.error('خطای 403: عدم دسترسی به پنل مدیریت ارشد. این بخش مخصوص مدیران کل است.');
      }
    }
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/list', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProfiles(data.data);
      }
    } catch (err) {
      console.error('Error loading profiles:', err);
      toast.error('خطا در بارگذاری لینک‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) {
      toast.error('لطفاً نام نمایشی کارت را وارد کنید.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/profile/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: newDisplayName.trim(),
          alias: newAlias.trim(),
          headline: newHeadline.trim(),
          roleType: newRoleType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error('خطا در ایجاد کارت جدید', {
          description: data.message || 'مشکلی رخ داده است.',
        });
        setIsCreating(false);
        return;
      }

      toast.success('کارت هوشمند جدید ساخته شد!', {
        description: `آدرس: ${domainHost}/${data.data.alias}`,
      });

      setIsCreateOpen(false);
      setNewDisplayName('');
      setNewAlias('');
      setNewHeadline('');
      loadProfiles();

      // Switch to this profile and direct to isolated editor
      if (data.data?.id) {
        await switchProfile(data.data.id);
        router.push(`/dashboard/editor/${data.data.id}`);
      }
    } catch (err) {
      console.error('Create profile error:', err);
      toast.error('خطای شبکه در ساخت کارت.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/profile/list?id=${encodeURIComponent(profileToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`کارت «${profileToDelete.displayName}» با موفقیت حذف شد.`);
        setProfileToDelete(null);
        loadProfiles();
      } else {
        toast.error('خطا در حذف کارت', { description: data.message });
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('خطای شبکه در حذف کارت.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (alias: string) => {
    const fullUrl = `${window.location.origin}/${alias}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('آدرس لینک کپی شد!', {
      description: fullUrl,
    });
  };

  const handleEditProfile = async (profile: ProfileItem) => {
    await switchProfile(profile.id);
    router.push(`/dashboard/editor/${profile.id}`);
  };

  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleDuplicateProfile = async (profile: ProfileItem) => {
    setDuplicatingId(profile.id);
    try {
      const res = await fetch('/api/profile/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate',
          sourceProfileId: profile.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`یک نسخه کپی از کارت «${profile.displayName}» با موفقیت ساخته شد.`);
        loadProfiles();
      } else {
        toast.error('خطا در کپی کارت', { description: data.message });
      }
    } catch (err) {
      console.error('Duplicate error:', err);
      toast.error('خطای شبکه در کپی کارت.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.displayName?.toLowerCase().includes(q) ||
      p.alias?.toLowerCase().includes(q) ||
      p.headline?.toLowerCase().includes(q)
    );
  });

  const totalViews = profiles.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
  const totalLinks = profiles.reduce((sum, p) => sum + (p.linksCount || 0), 0);
  const totalLeads = profiles.reduce((sum, p) => sum + (p.leadsCount || 0), 0);

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / itemsPerPage));
  const paginatedProfiles = filteredProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              داشبورد و لینک‌های من
            </h1>
            <Badge variant="cyan" className="text-xs font-bold font-sans">
              {profiles.length} Active Cards
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            فهرست کارت‌های هوشمند NFC، صفحات اختصاصی بیو و آمار کلی عملکرد حساب کاربری شما
          </p>
        </div>

        {/* Big Prominent Action Button: + ساخت کارت/لینک جدید */}
        <Button
          onClick={() => setIsCreateOpen(true)}
          size="lg"
          className="h-12 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 active:scale-95 transition-all self-start md:self-auto shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>+ ساخت کارت/لینک جدید</span>
        </Button>
      </div>

      {/* Aggregated Overview Section (مجموع آمار کل لینک‌های این کاربر - Strictly English Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Views */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card/70 backdrop-blur-md border border-border shadow-xs hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-muted-foreground">
              مجموع کل بازدیدها
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-foreground font-sans tracking-tight block">
              {totalViews.toLocaleString('en-US')}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              تعداد دفعات دیده شدن تمام لینک‌های شما
            </span>
          </div>
        </div>

        {/* Metric 2: Total Clicks & Leads */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card/70 backdrop-blur-md border border-border shadow-xs hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-muted-foreground">
              کلیک‌ها و تعاملات
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-foreground font-sans tracking-tight block">
              {(totalLinks + totalLeads).toLocaleString('en-US')}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              مجموع کلیک روی لینک‌ها و تماس‌ها
            </span>
          </div>
        </div>

        {/* Metric 3: Active Links & Profiles Count */}
        <div className="p-4 sm:p-5 rounded-3xl bg-card/70 backdrop-blur-md border border-border shadow-xs hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-muted-foreground">
              کارت‌ها و لینک‌های فعال
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-foreground font-sans tracking-tight block">
              {profiles.length.toLocaleString('en-US')}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              تعداد صفحات و کارت‌های هوشمند فعال
            </span>
          </div>
        </div>

        {/* Metric 4: My Physical Cards Shortcut */}
        <Link
          href="/dashboard/orders"
          className="p-4 sm:p-5 rounded-3xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/25 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400">
              سفارشات کارت NFC
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <span>پیگیری سفارشات من</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              مشاهده وضعیت چاپ، بسته‌بندی و ارسال
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Input
            type="text"
            placeholder="جستجو در بین کارت‌ها و لینک‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs placeholder:text-muted-foreground"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground">
          <span>دامنه پیش‌فرض:</span>
          <span className="font-sans font-semibold text-cyan-500 dark:text-cyan-400">
            {domainHost}
          </span>
        </div>
      </div>

      {/* Horizontal Cards List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <span className="text-xs">در حال بارگذاری کارت‌های شما...</span>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-3xl border border-dashed border-border text-center bg-card/40 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-foreground">کارتی یافت نشد</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'موردی مطابق با جستجوی شما پیدا نشد.'
              : 'شما هنوز لینکی ایجاد نکرده‌اید. با کلیک روی دکمه زیر اولین کارت خود را بسازید.'}
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="mt-5 rounded-xl bg-cyan-500 text-white text-xs font-bold"
          >
            + ساخت کارت/لینک جدید
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedProfiles.map((profile) => {
            const fullUrl = `${domainHost}/${profile.alias}`;

            return (
              <div
                key={profile.id}
                className="group relative rounded-2xl sm:rounded-3xl border border-border hover:border-cyan-500/40 bg-card/90 p-4 sm:p-5 transition-all shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Area: Avatar + Details */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Profile Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-xl shadow-inner">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{profile.displayName?.charAt(0) || 'A'}</span>
                      )}
                    </div>
                    {profile.isVerified && (
                      <div
                        className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/40"
                        title="تایید هویت شده (دارای تیک آبی)"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                        {profile.displayName}
                      </h2>
                      {profile.isVerified && (
                        <Badge variant="cyan" className="text-[10px] py-0 px-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>تایید شده</span>
                        </Badge>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {profile.roleType === 'business' ? 'کارت تجاری' : 'کارت شخصی'}
                      </span>
                    </div>

                    {profile.headline && (
                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {profile.headline}
                      </p>
                    )}

                    {/* Link URL Tag */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(profile.alias)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold font-sans transition-colors group/link border border-cyan-500/20"
                        title="برای کپی آدرس کلیک کنید"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{fullUrl}</span>
                        <Copy className="w-3 h-3 opacity-60 group-hover/link:opacity-100" />
                      </button>

                      <span className="text-xs text-muted-foreground hidden sm:inline">•</span>

                      <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground font-sans">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-cyan-500" />
                          <span>{(profile.viewsCount || 0).toLocaleString('en-US')} Views</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3 text-blue-500" />
                          <span>{(profile.linksCount || 0).toLocaleString('en-US')} Links</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Area: Action Buttons (ویرایش، کپی، مشاهده و منوی بیشتر) */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/50 w-full md:w-auto justify-end">
                  {/* دکمه اصلی ویرایش (ورود به محیط ایزوله ویرایشگر لینک) */}
                  <Button
                    onClick={() => handleEditProfile(profile)}
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                    title="ورود به محیط ویرایشگر اختصاصی این لینک"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-white" />
                    <span>ویرایش</span>
                  </Button>

                  {/* دکمه کپی (Duplicate) */}
                  <Button
                    onClick={() => handleDuplicateProfile(profile)}
                    disabled={duplicatingId === profile.id}
                    variant="outline"
                    className="h-9 px-3.5 rounded-xl border-border bg-background hover:bg-blue-500/10 text-foreground hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    title="ساخت نسخه کپی (Duplicate) از این کارت"
                  >
                    {duplicatingId === profile.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>کپی (Duplicate)</span>
                  </Button>

                  {/* دکمه مشاهده خروجی زنده */}
                  <Link
                    href={`/${profile.alias}`}
                    target="_blank"
                    className="h-9 w-9 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-xs"
                    title="مشاهده صفحه عمومی کارت"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {/* منوی سه‌نقطه (الگوبرداری از تکلینک: مشاهده، تنظیمات، آمار، حذف) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                        title="گزینه‌های بیشتر"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border border-border text-right">
                      <DropdownMenuItem
                        onClick={() => window.open(`/${profile.alias}`, '_blank')}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer"
                      >
                        <span>مشاهده نسخه زنده</span>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          await switchProfile(profile.id);
                          router.push(`/dashboard/editor/${profile.id}?tab=settings`);
                        }}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer"
                      >
                        <span>تنظیمات و سئو</span>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          await switchProfile(profile.id);
                          router.push(`/dashboard/editor/${profile.id}?tab=analytics`);
                        }}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer"
                      >
                        <span>آمار و تحلیل</span>
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                      </DropdownMenuItem>
                      {profiles.length > 1 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setProfileToDelete(profile)}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer font-bold"
                          >
                            <span>حذف لینک</span>
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="pt-2">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProfiles.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              itemLabel="کارت"
            />
          </div>
        </div>
      )}

      {/* Modal: + ساخت کارت/لینک جدید */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <span>ساخت کارت هوشمند یا لینک جدید</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              برای ساخت کارت شخصی، ویزیت بیزینس یا پورتفولیو، مشخصات اولیه را وارد نمایید.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProfile} className="space-y-4 py-2">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                نام نمایشی کارت <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="مثلاً: احمد رضایی یا شرکت بازرگانی آریا"
                value={newDisplayName}
                onChange={(e) => {
                  setNewDisplayName(e.target.value);
                  if (!newAlias) {
                    const autoAlias = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '')
                      .replace(/[^a-z0-9_]/g, '');
                    setNewAlias(autoAlias);
                  }
                }}
                required
                className="h-11 rounded-xl text-xs"
              />
            </div>

            {/* Alias / URL Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                شناسه آدرس اینترنتی (Alias) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  dir="ltr"
                  placeholder="ahmad_rezaei"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  required
                  className="h-11 rounded-xl font-sans text-xs pl-3 pr-24 text-left"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-muted-foreground pointer-events-none">
                  {domainHost}/
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                آدرس صفحه شما: <span className="font-sans text-cyan-500">{domainHost}/{newAlias || 'your-alias'}</span>
              </p>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                عنوان شغلی یا تیتر کارت
              </label>
              <Input
                type="text"
                placeholder="مثلاً: توسعه‌دهنده وب و مشاور فناوری"
                value={newHeadline}
                onChange={(e) => setNewHeadline(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            {/* Profile Type: Personal vs Business */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                نوع کارت
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRoleType('personal')}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 ${newRoleType === 'personal'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 font-bold'
                    : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    }`}
                >
                  <UserIcon className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="text-xs block font-bold">کارت شخصی</span>
                    <span className="text-[10px] opacity-75 block">شبکه‌های اجتماعی و بیو</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewRoleType('business')}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2.5 ${newRoleType === 'business'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 font-bold'
                    : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="text-xs block font-bold">کارت تجاری</span>
                    <span className="text-[10px] opacity-75 block">فروشگاه و خدمات شرکتی</span>
                  </div>
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ایجاد کارت...</span>
                  </>
                ) : (
                  <span>تایید و ساخت کارت</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-base font-bold text-rose-500 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>حذف لینک</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2">
              آیا از حذف کارت هوشمند «{profileToDelete?.displayName}» اطمینان دارید؟ تمامی ماژول‌ها و اطلاعات این کارت حذف خواهد شد و این عملیات قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="outline"
              onClick={() => setProfileToDelete(null)}
              className="rounded-xl text-xs"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteProfile}
              className="rounded-xl text-xs font-bold"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بله، حذف کن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
