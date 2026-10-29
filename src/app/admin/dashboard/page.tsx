'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Loader2,
  ExternalLink,
  UserCheck,
  UserX,
  Sparkles,
  Layers,
  FileText,
  Camera,
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

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: string;
  subscriptionPlan: string;
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: string;
  kycData?: any;
  profilesCount: number;
  createdAt: string;
}

interface KycRequest {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  verificationStatus: string;
  kycData: {
    fullName?: string;
    nationalId?: string;
    documentType?: string;
    selfieUrl?: string;
    documentUrl?: string;
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  };
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'kyc' | 'users'>('kyc');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [pendingKycCount, setPendingKycCount] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');

  // Review Modal State
  const [reviewingKyc, setReviewingKyc] = useState<KycRequest | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, kycRes] = await Promise.all([
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/kyc', { cache: 'no-store' }),
      ]);

      const usersJson = await usersRes.json();
      const kycJson = await kycRes.json();

      if (usersJson.success) {
        setUsers(usersJson.users || []);
        setTotalUsers(usersJson.totalUsers || 0);
        setVerifiedCount(usersJson.verifiedUsersCount || 0);
        setPendingKycCount(usersJson.pendingKycCount || 0);
      }

      if (kycJson.success) {
        setKycRequests(kycJson.requests || []);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      toast.error('خطا در بارگذاری اطلاعات پنل مدیریت');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveKyc = async (userId: string) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'approve',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error('خطا در تایید هویت', { description: json.message });
        setIsProcessingAction(false);
        return;
      }

      toast.success('احراز هویت کاربر تایید شد!', {
        description: 'تیک آبی فعال شد و قفل تسویه حساب و فروشگاه برای این کاربر باز شد.',
      });

      setReviewingKyc(null);
      fetchAdminData();
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('خطای ارتباط با سرور.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectKyc = async (userId: string) => {
    if (!rejectReason.trim()) {
      toast.error('لطفاً دلیل رد درخواست را وارد نمایید.');
      return;
    }

    setIsProcessingAction(true);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'reject',
          rejectionReason: rejectReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error('خطا در رد درخواست', { description: json.message });
        setIsProcessingAction(false);
        return;
      }

      toast.info('درخواست احراز هویت رد شد.', {
        description: 'دلیل رد درخواست برای کاربر ثبت گردید.',
      });

      setReviewingKyc(null);
      setShowRejectInput(false);
      setRejectReason('');
      fetchAdminData();
    } catch (err) {
      console.error('Reject error:', err);
      toast.error('خطای ارتباط با سرور.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isActive: !user.isActive,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`وضعیت کاربر «${user.name}» تغییر کرد.`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('خطا در تغییر وضعیت کاربر');
    }
  };

  const handleToggleUserRole = async (user: AdminUser) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: nextRole,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`نقش کاربر «${user.name}» به ${nextRole === 'admin' ? 'مدیر' : 'کاربر عادی'} تغییر کرد.`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('خطا در تغییر نقش کاربر');
    }
  };

  const filteredKycList = kycRequests.filter((req) => {
    if (kycFilter !== 'all' && req.verificationStatus !== kycFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      req.name?.toLowerCase().includes(q) ||
      req.email?.toLowerCase().includes(q) ||
      req.kycData?.nationalId?.toLowerCase().includes(q)
    );
  });

  const filteredUsersList = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              داشبورد مدیریت کل (Super Admin)
            </h1>
            <Badge variant="cyan" className="font-outfit text-xs">
              کنترل سراسری
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            بررسی و تایید احراز هویت مدارک (KYC)، مدیریت کاربران، نقش‌ها و نظارت بر کارت‌های دیجیتال
          </p>
        </div>

        <Button
          onClick={fetchAdminData}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-border bg-card self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی داده‌ها</span>
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold">کل کاربران ثبت‌نامی</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
            {totalUsers.toLocaleString('en-US')}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">تعداد کل حساب‌های ایجاد شده</p>
        </Card>

        {/* Card 2: Pending KYC */}
        <Card className="rounded-3xl border-amber-500/30 bg-amber-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold text-amber-500">در انتظار تایید هویت (KYC)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-amber-500 tracking-tight">
            {pendingKycCount.toLocaleString('en-US')}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">نیازمند بررسی سلفی و مدارک</p>
        </Card>

        {/* Card 3: Verified Users */}
        <Card className="rounded-3xl border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold text-emerald-500">کاربران دارای تیک آبی</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-emerald-500 tracking-tight">
            {verifiedCount.toLocaleString('en-US')}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">احراز هویت شده و تایید شده</p>
        </Card>

        {/* Card 4: Active accounts */}
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold">حساب‌های فعال</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
            {users.filter((u) => u.isActive).length.toLocaleString('en-US')}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">دسترسی مجاز به سیستم</p>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'kyc'
              ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>تایید احراز هویت (KYC)</span>
          {pendingKycCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-rose-600 font-black text-[10px] flex items-center justify-center">
              {pendingKycCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>جدول تمام کاربران سایت ({totalUsers})</span>
        </button>
      </div>

      {/* TAB 1: KYC VERIFICATION SECTION */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          {/* KYC Sub-filter & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="جستجوی نام یا شماره مدرک کاربر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border self-start sm:self-auto">
              {[
                { id: 'pending', label: 'در انتظار تایید' },
                { id: 'verified', label: 'تایید شده‌ها' },
                { id: 'rejected', label: 'رد شده‌ها' },
                { id: 'all', label: 'همه درخواست‌ها' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setKycFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    kycFilter === f.id
                      ? 'bg-background text-foreground shadow-sm font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* KYC Table */}
          <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="text-xs">در حال بارگذاری درخواست‌های احراز هویت...</span>
              </div>
            ) : filteredKycList.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-3">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-foreground">موردی برای نمایش وجود ندارد</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  در حال حاضر در این دسته درخواستی ثبت نشده است.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-right font-bold text-xs">کاربر متقاضی</TableHead>
                      <TableHead className="text-right font-bold text-xs">شماره مدرک</TableHead>
                      <TableHead className="text-right font-bold text-xs">نوع مدرک</TableHead>
                      <TableHead className="text-center font-bold text-xs">پیش‌نمایش مدارک</TableHead>
                      <TableHead className="text-right font-bold text-xs">وضعیت</TableHead>
                      <TableHead className="text-center font-bold text-xs">عملیات بررسی</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKycList.map((req) => (
                      <TableRow key={req.userId} className="border-border hover:bg-muted/40 transition-colors">
                        {/* User */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                              {req.avatar ? (
                                <img src={req.avatar} alt={req.name} className="w-full h-full object-cover" />
                              ) : (
                                req.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <span>{req.name}</span>
                                {req.isVerified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-outfit" dir="ltr">
                                {req.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* National ID */}
                        <TableCell className="font-outfit text-xs font-bold text-foreground" dir="ltr">
                          {req.kycData?.nationalId || '---'}
                        </TableCell>

                        {/* Doc Type */}
                        <TableCell className="text-xs text-muted-foreground">
                          {req.kycData?.documentType === 'passport'
                            ? 'پاسپورت معتبر'
                            : req.kycData?.documentType === 'driving_license'
                            ? 'گواهینامه رانندگی'
                            : 'تذکره الکترونیکی'}
                        </TableCell>

                        {/* Thumbnails preview */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {req.kycData?.selfieUrl ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/40" title="عکس سلفی">
                                <img src={req.kycData.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">ندارد</span>
                            )}
                            {req.kycData?.documentUrl ? (
                              <div className="w-10 h-8 rounded-lg overflow-hidden border border-blue-500/40" title="عکس مدرک">
                                <img src={req.kycData.documentUrl} alt="Document" className="w-full h-full object-cover" />
                              </div>
                            ) : null}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {req.verificationStatus === 'verified' && (
                            <Badge variant="success" className="text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تایید شده</span>
                            </Badge>
                          )}
                          {req.verificationStatus === 'pending' && (
                            <Badge variant="warning" className="text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>در انتظار بررسی</span>
                            </Badge>
                          )}
                          {req.verificationStatus === 'rejected' && (
                            <Badge variant="destructive" className="text-[11px] flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>رد شده</span>
                            </Badge>
                          )}
                          {req.verificationStatus === 'unverified' && (
                            <Badge variant="outline" className="text-[11px]">
                              ثبت‌نشده
                            </Badge>
                          )}
                        </TableCell>

                        {/* Action: Open Inspection Modal */}
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              setReviewingKyc(req);
                              setShowRejectInput(false);
                              setRejectReason('');
                            }}
                            className="h-8 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs border border-cyan-500/20"
                          >
                            <Eye className="w-3.5 h-3.5 ml-1" />
                            <span>بررسی مدارک</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY SECTION */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Search */}
          <div className="relative w-full sm:w-80">
            <Input
              type="text"
              placeholder="جستجوی نام یا ایمیل کاربر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Users Table */}
          <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-right font-bold text-xs">نام کاربر</TableHead>
                    <TableHead className="text-right font-bold text-xs">ایمیل</TableHead>
                    <TableHead className="text-right font-bold text-xs">نقش</TableHead>
                    <TableHead className="text-right font-bold text-xs">پلن</TableHead>
                    <TableHead className="text-right font-bold text-xs">احراز هویت</TableHead>
                    <TableHead className="text-right font-bold text-xs">تعداد کارت‌ها</TableHead>
                    <TableHead className="text-right font-bold text-xs">وضعیت</TableHead>
                    <TableHead className="text-center font-bold text-xs">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsersList.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-muted/40 transition-colors">
                      {/* Name & Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground flex items-center gap-1">
                              <span>{user.name}</span>
                              {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />}
                            </div>
                            {user.phone && (
                              <div className="text-[10px] text-muted-foreground font-outfit">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="font-outfit text-xs text-muted-foreground" dir="ltr">
                        {user.email}
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        {user.role === 'admin' || user.role === 'superadmin' ? (
                          <Badge variant="destructive" className="text-[10px] py-0 px-2">
                            مدیر کل
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-2">
                            کاربر عادی
                          </Badge>
                        )}
                      </TableCell>

                      {/* Plan */}
                      <TableCell className="font-outfit text-xs uppercase font-bold text-cyan-500">
                        {user.subscriptionPlan || 'FREE'}
                      </TableCell>

                      {/* Verification */}
                      <TableCell>
                        {user.isVerified ? (
                          <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تایید شده</span>
                          </span>
                        ) : user.verificationStatus === 'pending' ? (
                          <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>در انتظار</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">عادی</span>
                        )}
                      </TableCell>

                      {/* Profiles Count */}
                      <TableCell className="font-outfit text-xs font-bold text-foreground">
                        {user.profilesCount} کارت
                      </TableCell>

                      {/* Active Status */}
                      <TableCell>
                        {user.isActive ? (
                          <span className="text-[11px] text-emerald-500 font-bold">فعال</span>
                        ) : (
                          <span className="text-[11px] text-rose-500 font-bold">مسدود</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleUserRole(user)}
                            className="h-8 px-2 text-[11px] rounded-lg"
                            title="تغییر نقش بین مدیر و کاربر"
                          >
                            {user.role === 'admin' ? 'عادی‌سازی' : 'ترفیع به ادمین'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleUserStatus(user)}
                            className={`h-8 px-2 text-[11px] rounded-lg ${
                              user.isActive ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'
                            }`}
                          >
                            {user.isActive ? 'مسدودسازی' : 'فعال‌سازی'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* KYC Inspection & Approval Modal */}
      <Dialog open={!!reviewingKyc} onOpenChange={() => setReviewingKyc(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
              <span>بررسی و تایید احراز هویت «{reviewingKyc?.name}»</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              لطفاً چهره سلفی را با عکس مندرج بر روی مدرک هویتی تطبیق دهید. پس از تایید، تیک آبی برای پروفایل‌های کاربر فعال و قفل فروشگاه باز می‌شود.
            </DialogDescription>
          </DialogHeader>

          {reviewingKyc && (
            <div className="space-y-4 py-2">
              {/* User meta bar */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">نام کامل:</span>
                  <span className="font-bold text-foreground">{reviewingKyc.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">شماره مدرک:</span>
                  <span className="font-outfit font-bold text-cyan-500" dir="ltr">{reviewingKyc.kycData?.nationalId || '---'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">ایمیل کاربر:</span>
                  <span className="font-outfit text-muted-foreground truncate block" dir="ltr">{reviewingKyc.email}</span>
                </div>
              </div>

              {/* Side-by-side Photo Inspection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selfie */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-500" />
                    <span>تصویر سلفی چهره کاربر</span>
                  </span>
                  <div className="h-56 rounded-2xl bg-slate-900 border border-border overflow-hidden flex items-center justify-center relative group">
                    {reviewingKyc.kycData?.selfieUrl ? (
                      <img
                        src={reviewingKyc.kycData.selfieUrl}
                        alt="Selfie"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">تصویر سلفی ثبت نشده</span>
                    )}
                    {reviewingKyc.kycData?.selfieUrl && (
                      <a
                        href={reviewingKyc.kycData.selfieUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="مشاهده اندازه اصلی"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* ID Document */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>تصویر مدرک شناسایی (تذکره / پاسپورت)</span>
                  </span>
                  <div className="h-56 rounded-2xl bg-slate-900 border border-border overflow-hidden flex items-center justify-center relative group">
                    {reviewingKyc.kycData?.documentUrl ? (
                      <img
                        src={reviewingKyc.kycData.documentUrl}
                        alt="Document"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">تصویر مدرک ثبت نشده</span>
                    )}
                    {reviewingKyc.kycData?.documentUrl && (
                      <a
                        href={reviewingKyc.kycData.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="مشاهده اندازه اصلی"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection input area if toggled */}
              {showRejectInput && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 animate-in fade-in duration-150">
                  <label className="text-xs font-bold text-rose-500 block">
                    دلیل رد مدارک هویتی را وارد کنید:
                  </label>
                  <Input
                    type="text"
                    placeholder="مثلاً: تصویر تذکره تار است یا نام با مشخصات سلفی همخوانی ندارد."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRejectInput(false)}
                      className="text-xs h-8"
                    >
                      انصراف
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isProcessingAction}
                      onClick={() => handleRejectKyc(reviewingKyc.userId)}
                      className="text-xs h-8 font-bold"
                    >
                      {isProcessingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'تایید رد مدارک'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!showRejectInput && (
                <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReviewingKyc(null)}
                    className="rounded-xl text-xs"
                  >
                    بستن
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRejectInput(true)}
                      className="rounded-xl border-rose-500/40 text-rose-500 hover:bg-rose-500/10 text-xs font-bold"
                    >
                      <XCircle className="w-3.5 h-3.5 ml-1" />
                      <span>رد درخواست</span>
                    </Button>

                    <Button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => handleApproveKyc(reviewingKyc.userId)}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
                    >
                      {isProcessingAction ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
                          <span>در حال تایید...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                          <span>تایید هویت (تیک آبی + بازگشایی فروشگاه)</span>
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
