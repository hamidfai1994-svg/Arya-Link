'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  CheckCircle2,
  Search,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Mail,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OrganizationItem {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  totalLicenses: number;
  usedLicenses: number;
  membersCount?: number;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    companySlogan?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export default function AdminCompaniesPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Organization Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [totalLicenses, setTotalLicenses] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Organization Modal State
  const [editingOrg, setEditingOrg] = useState<OrganizationItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editTotalLicenses, setEditTotalLicenses] = useState('50');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirmation Modal State
  const [deletingOrg, setDeletingOrg] = useState<OrganizationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/organizations', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.organizations)) {
        setOrganizations(data.organizations);
      } else {
        toast.error(data.message || 'خطا در دریافت لیست سازمان‌ها');
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName.trim()) {
      toast.error('لطفاً نام سازمان را وارد نمایید.');
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes('@')) {
      toast.error('لطفاً یک ایمیل معتبر برای مدیر سازمان وارد نمایید.');
      return;
    }
    const parsedLicenses = Number(totalLicenses);
    if (!Number.isFinite(parsedLicenses) || parsedLicenses < 1) {
      toast.error('تعداد لایسنس خریداری شده باید حداقل ۱ عدد باشد.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName.trim(),
          ownerEmail: ownerEmail.trim().toLowerCase(),
          totalLicenses: Math.floor(parsedLicenses),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'سازمان جدید با موفقیت ثبت شد.');
        setIsCreateOpen(false);
        setOrgName('');
        setOwnerEmail('');
        setTotalLicenses('50');
        await loadOrganizations();
      } else {
        toast.error(data.message || 'خطا در ثبت سازمان جدید');
      }
    } catch (error) {
      console.error('Create organization error:', error);
      toast.error('خطای شبکه هنگام ثبت سازمان جدید');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (org: OrganizationItem) => {
    setEditingOrg(org);
    setEditName(org.name);
    setEditTotalLicenses(String(org.totalLicenses));
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    const parsedLicenses = Number(editTotalLicenses);
    if (!editName.trim()) {
      toast.error('لطفاً نام سازمان را وارد نمایید.');
      return;
    }
    if (!Number.isFinite(parsedLicenses) || parsedLicenses < 1) {
      toast.error('تعداد لایسنس باید حداقل ۱ عدد باشد.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: editingOrg.id,
          name: editName.trim(),
          totalLicenses: Math.floor(parsedLicenses),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'اطلاعات سازمان بروزرسانی شد.');
        setEditingOrg(null);
        await loadOrganizations();
      } else {
        toast.error(data.message || 'خطا در بروزرسانی سازمان');
      }
    } catch (error) {
      console.error('Update organization error:', error);
      toast.error('خطای شبکه هنگام بروزرسانی سازمان');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!deletingOrg) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/organizations?id=${encodeURIComponent(deletingOrg.id)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'سازمان با موفقیت حذف شد.');
        setDeletingOrg(null);
        await loadOrganizations();
      } else {
        toast.error(data.message || 'خطا در حذف سازمان');
      }
    } catch (error) {
      console.error('Delete organization error:', error);
      toast.error('خطای شبکه هنگام حذف سازمان');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = organizations.filter((org) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      org.name.toLowerCase().includes(q) ||
      org.ownerName.toLowerCase().includes(q) ||
      org.ownerEmail.toLowerCase().includes(q)
    );
  });

  const totalOrgsCount = organizations.length;
  const sumTotalLicenses = organizations.reduce((sum, o) => sum + (o.totalLicenses || 0), 0);
  const sumUsedLicenses = organizations.reduce((sum, o) => sum + (o.usedLicenses || 0), 0);
  const sumRemainingLicenses = Math.max(0, sumTotalLicenses - sumUsedLicenses);

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('fa-AF', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(isoString));
    } catch {
      return isoString.slice(0, 10);
    }
  };

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              مدیریت سازمان‌ها (B2B)
            </h1>
            <Badge variant="purple" className="font-sans text-xs">
              Enterprise Teams
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            ثبت سازمان‌ها و شرکت‌ها، تعیین مدیر حساب کاربری (Owner) و مدیریت ظرفیت لایسنس‌های پرسنلی در سراسر پلتفرم
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={loadOrganizations}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="h-10 px-3.5 rounded-xl border-border flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>بروزرسانی</span>
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت سازمان جدید</span>
          </Button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border-border bg-card/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">کل سازمان‌های ثبت‌شده</p>
            <p className="text-2xl font-extrabold text-foreground mt-1 font-sans">
              {totalOrgsCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
            <Building2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">مجموع لایسنس‌های صادرشده</p>
            <p className="text-2xl font-extrabold text-foreground mt-1 font-sans">
              {sumTotalLicenses}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">لایسنس‌های در حال استفاده</p>
            <p className="text-2xl font-extrabold text-emerald-500 mt-1 font-sans">
              {sumUsedLicenses}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">ظرفیت باقی‌مانده</p>
            <p className="text-2xl font-extrabold text-amber-500 mt-1 font-sans">
              {sumRemainingLicenses}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Search & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="جستجوی نام سازمان، نام یا ایمیل مدیر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <span className="text-xs text-muted-foreground">
          نمایش {filtered.length} از {organizations.length} سازمان ثبت‌شده
        </span>
      </div>

      {/* Organizations Table */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-xs">در حال بارگذاری لیست سازمان‌ها...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                {searchQuery ? 'هیچ سازمانی با این مشخصات یافت نشد' : 'هنوز هیچ سازمانی ثبت نشده است'}
              </p>
              <p className="text-xs text-muted-foreground max-w-md">
                {searchQuery
                  ? 'عبارت جستجو را تغییر دهید یا فیلتر را پاک کنید.'
                  : 'برای شروع، از دکمه «ثبت سازمان جدید» استفاده کنید و یک کاربر ثبت‌نام‌شده را به عنوان مدیر سازمان انتخاب نمایید.'}
              </p>
            </div>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                size="sm"
                className="mt-2 h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت اولین سازمان</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">نام سازمان</TableHead>
                  <TableHead className="text-right font-bold text-xs">مدیر سازمان (Owner)</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت لایسنس‌ها</TableHead>
                  <TableHead className="text-right font-bold text-xs">تاریخ ثبت</TableHead>
                  <TableHead className="text-left font-bold text-xs">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((org) => {
                  const pct =
                    org.totalLicenses > 0
                      ? Math.min(100, Math.round((org.usedLicenses / org.totalLicenses) * 100))
                      : 0;
                  const brandColor = org.branding?.primaryColor || '#8b5cf6';

                  return (
                    <TableRow
                      key={org.id}
                      className="border-border hover:bg-muted/40 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border overflow-hidden"
                            style={{
                              backgroundColor: `${brandColor}1a`,
                              borderColor: `${brandColor}40`,
                              color: brandColor,
                            }}
                          >
                            {org.branding?.logoUrl ? (
                              <img
                                src={org.branding.logoUrl}
                                alt={org.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-foreground">
                              {org.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="purple" className="text-[9px] py-0 px-1.5">
                                حساب سازمانی فعال
                              </Badge>
                              {org.branding?.companySlogan && (
                                <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                                  {org.branding.companySlogan}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{org.ownerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-sans">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span dir="ltr">{org.ownerEmail}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="min-w-[170px] space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-sans font-bold text-foreground">
                              {org.usedLicenses} / {org.totalLicenses}
                            </span>
                            <Badge
                              variant={pct >= 90 ? 'warning' : 'emerald'}
                              className="text-[10px] py-0 px-1.5 font-sans"
                            >
                              {pct}% تکمیل
                            </Badge>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(org.createdAt)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => openEditModal(org)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 rounded-lg text-xs border-border hover:bg-muted flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>ویرایش</span>
                          </Button>

                          <Button
                            onClick={() => setDeletingOrg(org)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 rounded-lg text-xs border-destructive/30 text-destructive hover:bg-destructive/10 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create Organization Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center border border-purple-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span>ثبت سازمان جدید</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              با ثبت سازمان، حساب کاربری مدیر به حالت سازمانی (Owner) ارتقا یافته و پنل مدیریت تیم و برندینگ شرکتی برای وی فعال می‌شود.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrganization} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                نام سازمان یا شرکت
              </label>
              <Input
                type="text"
                placeholder="مثلاً: شفاخانه مرکزی"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="h-10 rounded-xl bg-background border-border text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                ایمیل کاربری که مدیر این سازمان می‌شود
              </label>
              <Input
                type="email"
                dir="ltr"
                placeholder="manager@company.af"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
                className="h-10 rounded-xl bg-background border-border text-sm font-sans text-left"
              />
              <p className="text-[11px] text-muted-foreground">
                این کاربر باید قبلاً با همین ایمیل در پلتفرم ثبت‌نام کرده باشد.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                تعداد لایسنس خریداری شده
              </label>
              <Input
                type="number"
                min={1}
                step={1}
                placeholder="50"
                value={totalLicenses}
                onChange={(e) => setTotalLicenses(e.target.value)}
                required
                className="h-10 rounded-xl bg-background border-border text-sm font-sans"
              />
            </div>

            <DialogFooter className="pt-2 flex items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ثبت و فعال‌سازی سازمان</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={Boolean(editingOrg)} onOpenChange={(open) => !open && setEditingOrg(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
              <Edit3 className="w-5 h-5 text-purple-500" />
              <span>ویرایش اطلاعات سازمان</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              تغییر نام یا افزایش ظرفیت لایسنس‌های سازمان «{editingOrg?.name}»
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateOrganization} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">نام سازمان</label>
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="h-10 rounded-xl bg-background border-border text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                تعداد کل لایسنس‌ها
              </label>
              <Input
                type="number"
                min={Math.max(1, editingOrg?.usedLicenses || 1)}
                step={1}
                value={editTotalLicenses}
                onChange={(e) => setEditTotalLicenses(e.target.value)}
                required
                className="h-10 rounded-xl bg-background border-border text-sm font-sans"
              />
              {editingOrg && (
                <p className="text-[11px] text-muted-foreground">
                  تعداد لایسنس‌های فعال فعلی: {editingOrg.usedLicenses}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2 flex items-center gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingOrg(null)}
                disabled={isUpdating}
                className="rounded-xl"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <span>ذخیره تغییرات</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deletingOrg)} onOpenChange={(open) => !open && setDeletingOrg(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>تایید حذف سازمان</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1 leading-relaxed">
              آیا از حذف سازمان <strong className="text-foreground">«{deletingOrg?.name}»</strong> مطمئن هستید؟ با انجام این کار، اتصال سازمانی مدیر و کارمندان مرتبط آزاد شده و کارت‌های آنان به حالت شخصی بازمی‌گردد.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 flex items-center gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingOrg(null)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              انصراف
            </Button>
            <Button
              type="button"
              onClick={handleDeleteOrganization}
              disabled={isDeleting}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال حذف...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>بله، سازمان حذف شود</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
