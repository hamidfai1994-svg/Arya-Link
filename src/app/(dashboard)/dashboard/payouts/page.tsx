'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Lock,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  CreditCard,
  Plus,
  Loader2,
  RefreshCw,
  ExternalLink,
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface PayoutItem {
  id: string;
  amount: number;
  currency: string;
  bankOrProvider: string;
  accountTitle: string;
  accountNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  referenceId?: string;
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
}

interface PayoutsResponse {
  isVerified: boolean;
  verificationStatus: string;
  balance: {
    totalEarned: number;
    totalWithdrawn: number;
    pendingPayoutAmount: number;
    availableBalance: number;
    currency: string;
  };
  payouts: PayoutItem[];
}

export default function PayoutsPage() {
  const [data, setData] = useState<PayoutsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Request Payout Modal State
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankOrProvider, setBankOrProvider] = useState('حساب‌پی (HesabPay)');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payouts', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching payouts:', err);
      toast.error('خطا در بارگذاری اطلاعات تسویه');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      toast.error('حداقل مبلغ تسویه حساب ۱۰۰ افغانی است.');
      return;
    }

    if (data?.balance && numAmount > data.balance.availableBalance) {
      toast.error('مبلغ درخواستی بیشتر از موجودی قابل تسویه است.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          bankOrProvider,
          accountTitle,
          accountNumber,
          currency: 'AFN',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error('خطا در ثبت درخواست', {
          description: json.message || 'مشکلی رخ داد.',
        });
        setIsSubmitting(false);
        return;
      }

      toast.success('درخواست تسویه با موفقیت ثبت شد!', {
        description: 'امور مالی پس از بررسی، مبلغ را به حساب شما واریز خواهد کرد.',
      });

      setIsRequestOpen(false);
      setAmount('');
      setAccountTitle('');
      setAccountNumber('');
      fetchPayouts();
    } catch (err) {
      console.error('Submit payout error:', err);
      toast.error('خطای ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-xs">در حال بررسی وضعیت حساب و موجودی...</span>
      </div>
    );
  }

  // LOCKED STATE: User is NOT verified
  if (!data?.isVerified) {
    return (
      <div className="space-y-6 select-none" dir="rtl">
        {/* Header */}
        <div className="pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              تسویه حساب مالی
            </h1>
            <Badge variant="destructive" className="font-outfit text-xs">
              نیازمند احراز هویت
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            برداشت درآمدها و واریز مستقیم به حساب بانکی یا کیف پول
          </p>
        </div>

        {/* Lock Screen Container */}
        <div className="p-8 sm:p-14 rounded-3xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Big Lock Icon with Shield */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
              <Lock className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              ابتدا احراز هویت کنید
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              بخش تسویه حساب مالی و فروشگاه شما در حالت قفل قرار دارد. به منظور رعایت مقررات ضد پولشویی و حفاظت از درآمدهای کاربران، ثبت درخواست واریز وجه تنها پس از تایید هویت امکان‌پذیر است.
            </p>
          </div>

          {data?.verificationStatus === 'pending' ? (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs flex items-center justify-center gap-2 font-medium">
              <Clock className="w-4 h-4 shrink-0" />
              <span>مدارک شما قبلاً ارسال شده و در حال بررسی توسط ادمین است. پس از تایید هویت، این صفحه به صورت خودکار باز خواهد شد.</span>
            </div>
          ) : (
            <div className="pt-2">
              <Link href="/dashboard/kyc">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>شروع فرایند تایید هویت (KYC)</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // UNLOCKED STATE: User is Verified
  const balance = data.balance || {
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingPayoutAmount: 0,
    availableBalance: 0,
    currency: 'AFN',
  };

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              تسویه حساب مالی
            </h1>
            <Badge variant="success" className="font-outfit text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>احراز هویت شده</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            برداشت درآمدها و واریز به حساب بانکی یا صرافی معتبر
          </p>
        </div>

        <Button
          onClick={() => setIsRequestOpen(true)}
          disabled={balance.availableBalance < 100}
          className="h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>درخواست تسویه حساب</span>
        </Button>
      </div>

      {/* Balance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Available Balance */}
        <Card className="rounded-3xl border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold text-foreground">موجودی قابل برداشت</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-outfit text-emerald-500 tracking-tight">
            {balance.availableBalance.toLocaleString('fa-IR')}{' '}
            <span className="text-xs text-muted-foreground font-sans">افغانی</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            آماده انتقال به حساب بانکی یا صرافی
          </p>
        </Card>

        {/* Card 2: Pending Payouts */}
        <Card className="rounded-3xl border-border bg-card/80 p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold text-foreground">در حال بررسی و واریز</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-outfit text-amber-500 tracking-tight">
            {balance.pendingPayoutAmount.toLocaleString('fa-IR')}{' '}
            <span className="text-xs text-muted-foreground font-sans">افغانی</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            درخواست‌های تسویه در صف امور مالی
          </p>
        </Card>

        {/* Card 3: Total Withdrawn */}
        <Card className="rounded-3xl border-border bg-card/80 p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold text-foreground">مجموع کل واریز شده</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-outfit text-foreground tracking-tight">
            {balance.totalWithdrawn.toLocaleString('fa-IR')}{' '}
            <span className="text-xs text-muted-foreground font-sans">افغانی</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            تسویه‌های موفقیت‌آمیز گذشته
          </p>
        </Card>
      </div>

      {/* Payout History Table */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden p-6">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-500" />
          <span>تاریخچه درخواست‌های تسویه حساب</span>
        </h2>

        {data.payouts && data.payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">مبلغ</TableHead>
                  <TableHead className="text-right font-bold text-xs">بانک / صرافی</TableHead>
                  <TableHead className="text-right font-bold text-xs">صاحب حساب</TableHead>
                  <TableHead className="text-right font-bold text-xs">شماره حساب / ولت</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت</TableHead>
                  <TableHead className="text-right font-bold text-xs">تاریخ درخواست</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payouts.map((p) => {
                  const reqDate = new Date(p.requestedAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <TableRow key={p.id} className="border-border">
                      <TableCell className="font-outfit font-black text-xs text-foreground">
                        {p.amount.toLocaleString('fa-IR')} {p.currency}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{p.bankOrProvider}</TableCell>
                      <TableCell className="text-xs">{p.accountTitle}</TableCell>
                      <TableCell className="font-outfit text-xs text-muted-foreground" dir="ltr">
                        {p.accountNumber}
                      </TableCell>
                      <TableCell>
                        {p.status === 'completed' && (
                          <Badge variant="success" className="text-[11px]">
                            واریز شده
                          </Badge>
                        )}
                        {p.status === 'pending' && (
                          <Badge variant="warning" className="text-[11px]">
                            در انتظار بررسی
                          </Badge>
                        )}
                        {p.status === 'processing' && (
                          <Badge variant="cyan" className="text-[11px]">
                            در حال انتقال
                          </Badge>
                        )}
                        {p.status === 'rejected' && (
                          <Badge variant="destructive" className="text-[11px]">
                            رد شده
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{reqDate}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">
            تاکنون درخواست تسویه حسابی ثبت نکرده‌اید.
          </p>
        )}
      </Card>

      {/* Modal: Request Payout */}
      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <span>درخواست تسویه حساب و واریز درآمد</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              مبلغ مورد نظر و مشخصات حساب خود را جهت انتقال وجه وارد کنید.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePayout} className="space-y-4 py-2 text-xs">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">
                مبلغ تسویه (افغانی) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  dir="ltr"
                  placeholder="1000"
                  min="100"
                  max={balance.availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="h-11 rounded-xl font-outfit text-sm text-left pl-3 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  AFN
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>حداکثر قابل تسویه:</span>
                <span className="font-bold text-emerald-500">
                  {balance.availableBalance.toLocaleString('fa-IR')} افغانی
                </span>
              </div>
            </div>

            {/* Provider / Bank */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">
                روش یا بانک واریزی <span className="text-rose-500">*</span>
              </label>
              <select
                value={bankOrProvider}
                onChange={(e) => setBankOrProvider(e.target.value)}
                className="w-full h-11 rounded-xl bg-background border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="حساب‌پی (HesabPay)">حساب‌پی (HesabPay - واریز آنی)</option>
                <option value="عزیزی بانک (Azizi Bank)">عزیزی بانک (Azizi Bank)</option>
                <option value="کابل بانک نو (New Kabul Bank)">کابل بانک نو (New Kabul Bank)</option>
                <option value="افغان یونایتد بانک (AUB)">افغان یونایتد بانک (AUB)</option>
                <option value="حواله صرافی سرای شهزاده">حواله صرافی سرای شهزاده کابل</option>
              </select>
            </div>

            {/* Account Title */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">
                نام و نام خانوادگی صاحب حساب <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="مثلاً: احمد رضایی"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                required
                className="h-11 rounded-xl text-xs"
              />
            </div>

            {/* Account Number / Phone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground block">
                شماره حساب / شماره موبایل متصل به ولت <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                dir="ltr"
                placeholder="0799xxxxxx یا شماره حساب بانکی"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                className="h-11 rounded-xl font-outfit text-xs text-left"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRequestOpen(false)}
                className="rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <span>ثبت و ارسال درخواست تسویه</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
