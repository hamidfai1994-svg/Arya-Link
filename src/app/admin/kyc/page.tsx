'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
  FileText,
  ExternalLink,
  Search,
  RefreshCw,
  Loader2,
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

export default function AdminKycPage() {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');

  // Inspection modal
  const [reviewingKyc, setReviewingKyc] = useState<KycRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const fetchKycRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/kyc');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      toast.error('خطا در دریافت درخواست‌های احراز هویت');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('احراز هویت کاربر تایید گردید! تیک آبی فعال شد.');
        setReviewingKyc(null);
        fetchKycRequests();
      } else {
        toast.error(data.message || 'خطا در تایید');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectReason.trim()) {
      toast.error('لطفاً دلیل رد درخواست را بنویسید');
      return;
    }

    setIsProcessing(true);
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
      const data = await res.json();
      if (data.success) {
        toast.info('درخواست احراز هویت رد شد و دلیل برای کاربر ثبت گردید.');
        setReviewingKyc(null);
        setShowRejectInput(false);
        setRejectReason('');
        fetchKycRequests();
      } else {
        toast.error(data.message || 'خطا در رد درخواست');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = requests.filter((r) => r.verificationStatus === 'pending').length;
  const verifiedCount = requests.filter((r) => r.verificationStatus === 'verified').length;

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.verificationStatus !== statusFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      req.name.toLowerCase().includes(q) ||
      req.email.toLowerCase().includes(q) ||
      (req.kycData?.nationalId && req.kycData.nationalId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              تایید احراز هویت مدارک (KYC Verification)
            </h1>
            <Badge variant="cyan" className="font-outfit text-xs">
              تیک آبی
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            بررسی تصاویر سلفی و تذکره/پاسپورت کاربران جهت فعال‌سازی نشان اعتماد (Verified Badge) و تسویه‌حساب
          </p>
        </div>

        <Button
          onClick={fetchKycRequests}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-border bg-card self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی داده‌ها</span>
        </Button>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            type="text"
            placeholder="جستجوی نام یا شماره مدرک..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border self-start sm:self-auto">
          {[
            { id: 'pending', label: `در انتظار بررسی (${pendingCount})` },
            { id: 'verified', label: `تایید شده (${verifiedCount})` },
            { id: 'rejected', label: 'رد شده‌ها' },
            { id: 'all', label: 'همه' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === f.id
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
        ) : filteredRequests.length === 0 ? (
          <div className="p-14 text-center flex flex-col items-center justify-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="text-sm font-bold text-foreground">هیچ موردی در این دسته یافت نشد</h3>
            <p className="text-xs text-muted-foreground mt-1">
              در حال حاضر درخواستی برای بررسی موجود نیست.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">کاربر متقاضی</TableHead>
                  <TableHead className="text-right font-bold text-xs">نوع مدرک</TableHead>
                  <TableHead className="text-right font-bold text-xs">شماره مدرک</TableHead>
                  <TableHead className="text-center font-bold text-xs">پیش‌نمایش سلفی و مدرک</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت</TableHead>
                  <TableHead className="text-center font-bold text-xs">عملیات بررسی</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
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
                            {req.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-outfit" dir="ltr">
                            {req.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Doc Type */}
                    <TableCell className="text-xs text-muted-foreground">
                      {req.kycData?.documentType === 'passport'
                        ? 'پاسپورت'
                        : req.kycData?.documentType === 'driving_license'
                        ? 'گواهینامه رانندگی'
                        : 'تذکره تابعیت'}
                    </TableCell>

                    {/* National ID */}
                    <TableCell className="font-outfit text-xs font-bold text-foreground" dir="ltr">
                      {req.kycData?.nationalId || '---'}
                    </TableCell>

                    {/* Previews */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {req.kycData?.selfieUrl ? (
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40" title="عکس سلفی">
                            <img src={req.kycData.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">ندارد</span>
                        )}
                        {req.kycData?.documentUrl ? (
                          <div className="w-11 h-9 rounded-xl overflow-hidden border border-blue-500/40" title="عکس مدرک">
                            <img src={req.kycData.documentUrl} alt="Document" className="w-full h-full object-cover" />
                          </div>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {req.verificationStatus === 'verified' && (
                        <Badge variant="success" className="text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تایید شده</span>
                        </Badge>
                      )}
                      {req.verificationStatus === 'pending' && (
                        <Badge variant="warning" className="text-[10px] flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          <span>در انتظار بررسی</span>
                        </Badge>
                      )}
                      {req.verificationStatus === 'rejected' && (
                        <Badge variant="destructive" className="text-[10px] flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          <span>رد شده</span>
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
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

      {/* KYC Inspection Modal */}
      <Dialog open={!!reviewingKyc} onOpenChange={() => setReviewingKyc(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
              <span>بررسی و احراز هویت «{reviewingKyc?.name}»</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              لطفاً تصویر سلفی و اطلاعات مدرک را تطبیق دهید. پس از تایید، تیک آبی احراز هویت برای کاربر فعال می‌گردد.
            </DialogDescription>
          </DialogHeader>

          {reviewingKyc && (
            <div className="space-y-4 py-2">
              {/* Meta Box */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">نام متقاضی:</span>
                  <span className="font-bold text-foreground">{reviewingKyc.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">شماره مدرک:</span>
                  <span className="font-outfit font-bold text-cyan-500" dir="ltr">
                    {reviewingKyc.kycData?.nationalId || '---'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">ایمیل:</span>
                  <span className="font-outfit text-muted-foreground truncate block" dir="ltr">
                    {reviewingKyc.email}
                  </span>
                </div>
              </div>

              {/* Photos Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selfie */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-500" />
                    <span>تصویر سلفی چهره</span>
                  </span>
                  <div className="h-56 rounded-2xl bg-slate-950 border border-border overflow-hidden flex items-center justify-center relative group">
                    {reviewingKyc.kycData?.selfieUrl ? (
                      <img
                        src={reviewingKyc.kycData.selfieUrl}
                        alt="Selfie"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">تصویر سلفی وجود ندارد</span>
                    )}
                    {reviewingKyc.kycData?.selfieUrl && (
                      <a
                        href={reviewingKyc.kycData.selfieUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="مشاهده اندازه کامل"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* ID Doc */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>تصویر مدرک هویتی</span>
                  </span>
                  <div className="h-56 rounded-2xl bg-slate-950 border border-border overflow-hidden flex items-center justify-center relative group">
                    {reviewingKyc.kycData?.documentUrl ? (
                      <img
                        src={reviewingKyc.kycData.documentUrl}
                        alt="Document"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">تصویر مدرک وجود ندارد</span>
                    )}
                    {reviewingKyc.kycData?.documentUrl && (
                      <a
                        href={reviewingKyc.kycData.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="مشاهده اندازه کامل"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection input */}
              {showRejectInput && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <label className="text-xs font-bold text-rose-500 block">
                    دلیل رد درخواست احراز هویت:
                  </label>
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="مثال: تار بودن عکس مدرک، عدم تطابق چهره با عکس شناسنامه..."
                    className="h-10 rounded-xl text-xs bg-background"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <DialogFooter className="flex items-center justify-between gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewingKyc(null)}
                  className="h-10 rounded-xl text-xs"
                >
                  بستن
                </Button>

                <div className="flex items-center gap-2">
                  {!showRejectInput ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRejectInput(true)}
                      className="h-10 rounded-xl text-rose-500 hover:text-rose-600 border-rose-500/30 text-xs font-bold"
                    >
                      رد مدارک
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReject(reviewingKyc.userId)}
                      className="h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
                    >
                      {isProcessing && <Loader2 className="w-4 h-4 animate-spin ml-1" />}
                      ثبت رد درخواست
                    </Button>
                  )}

                  <Button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleApprove(reviewingKyc.userId)}
                    className="h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>تایید هویت و اعطای تیک آبی</span>
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
