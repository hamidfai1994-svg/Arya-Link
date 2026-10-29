'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  Check,
  AlertCircle,
  Building,
  Sparkles,
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

interface FinanceMetrics {
  totalGrossRevenue: number;
  nfcCardRevenue: number;
  subscriptionRevenue: number;
  storeSalesRevenue: number;
  totalPayoutsPaid: number;
  pendingPayoutsTotal: number;
  proSubscribersCount: number;
  enterpriseSubscribersCount: number;
  currency: string;
}

interface OrderItem {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  createdAt: string;
}

interface PayoutItem {
  _id: string;
  userId: string;
  userName?: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  requestedAt: string;
  referenceId?: string;
}

export default function AdminFinancePage() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PayoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Payout action modal
  const [selectedPayout, setSelectedPayout] = useState<PayoutItem | null>(null);
  const [payoutAction, setPayoutAction] = useState<'pay' | 'reject'>('pay');
  const [referenceId, setReferenceId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/finance');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics || null);
        setOrders(data.recentOrders || []);
        setPayouts(data.recentPayouts || []);
        setPendingPayouts(data.pendingPayouts || []);
      } else {
        setOrders([]);
        setPayouts([]);
        setPendingPayouts([]);
      }
    } catch (err) {
      toast.error('خطا در دریافت اطلاعات مالی');
      setOrders([]);
      setPayouts([]);
      setPendingPayouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Structured fetchOrders function for future API integration
  const fetchOrders = fetchFinanceData;

  const handleOpenPayoutModal = (payout: PayoutItem, action: 'pay' | 'reject') => {
    setSelectedPayout(payout);
    setPayoutAction(action);
    setReferenceId(`TX-${Date.now().toString().slice(-6)}`);
    setAdminNote(action === 'pay' ? 'واریز انجام شد' : '');
  };

  const handleExecutePayout = async () => {
    if (!selectedPayout) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutId: selectedPayout._id,
          action: payoutAction,
          referenceId,
          adminNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedPayout(null);
        fetchFinanceData();
      } else {
        toast.error(data.message || 'خطا در انجام عملیات');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              مدیریت مالی و حسابداری (Enterprise Finance)
            </h1>
            <Badge variant="emerald" className="font-outfit text-xs">
              AFN Cashflow
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            مشاهده درآمدهای فروش کارت‌های هوشمند NFC، اشتراک‌های PRO، فروش خدمات و مدیریت صف تسویه‌حساب‌ها
          </p>
        </div>

        <Button
          onClick={fetchFinanceData}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-border bg-card self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی داده‌ها</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="rounded-3xl border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold text-emerald-500">مجموع درآمد ناخالص</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-emerald-500 tracking-tight">
            {(metrics?.totalGrossRevenue ?? 0).toLocaleString('en-US')} <span className="text-sm font-normal">افغانی</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">NFC + اشتراک‌ها + فروشگاه</p>
        </Card>

        {/* NFC Card Revenue */}
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold">فروش کارت‌های فیزیکی NFC</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
            {(metrics?.nfcCardRevenue ?? 0).toLocaleString('en-US')} <span className="text-sm font-normal">افغانی</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">سفارشات کارت PVC و چوبی</p>
        </Card>

        {/* Subscriptions Revenue */}
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold">فروش اشتراک‌های PRO و سازمان</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
            {(metrics?.subscriptionRevenue ?? 0).toLocaleString('en-US')} <span className="text-sm font-normal">افغانی</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {(metrics?.proSubscribersCount ?? 0).toLocaleString('en-US')} مشترک PRO و {(metrics?.enterpriseSubscribersCount ?? 0).toLocaleString('en-US')} سازمانی
          </p>
        </Card>

        {/* Pending Payouts */}
        <Card className="rounded-3xl border-rose-500/30 bg-rose-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold text-rose-500">در انتظار تسویه‌حساب</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-rose-500 tracking-tight">
            {(metrics?.pendingPayoutsTotal ?? 0).toLocaleString('en-US')} <span className="text-sm font-normal">افغانی</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {pendingPayouts.length.toLocaleString('en-US')} درخواست در صف پرداخت
          </p>
        </Card>
      </div>

      {/* Payout Requests Queue Section */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-rose-500" />
              <span>صف تسویه‌حساب‌های کاربران و فروشندگان ({pendingPayouts.length.toLocaleString('en-US')} مورد)</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              مبالغ قابل پرداخت حاصل از فروش خدمات و محصولات کاربران در پلتفرم آریا لینک
            </p>
          </div>
        </div>

        {pendingPayouts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-muted/10 border border-dashed border-border/80 flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              هیچ درخواست تسویه‌حساب معلقی در صف پرداخت وجود ندارد.
            </p>
            <p className="text-[11px] text-muted-foreground">
              تمامی مبالغ و مطالبات کاربران و فروشندگان در پلتفرم تسویه شده است.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">مبلغ تسویه</TableHead>
                  <TableHead className="text-right font-bold text-xs">صاحب حساب</TableHead>
                  <TableHead className="text-right font-bold text-xs">نام بانک / صرافی</TableHead>
                  <TableHead className="text-right font-bold text-xs">شماره حساب / شبا</TableHead>
                  <TableHead className="text-right font-bold text-xs">تاریخ درخواست</TableHead>
                  <TableHead className="text-center font-bold text-xs">اقدام</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayouts.map((p) => (
                  <TableRow key={p._id} className="border-border hover:bg-muted/40 transition-colors">
                    <TableCell className="font-outfit text-xs font-bold text-emerald-500">
                      {p.amount.toLocaleString('en-US')} افغانی
                    </TableCell>

                    <TableCell className="text-xs font-bold text-foreground">
                      {p.accountHolderName}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {p.bankName}
                    </TableCell>

                    <TableCell className="font-outfit text-xs text-foreground" dir="ltr">
                      {p.accountNumber}
                    </TableCell>

                    <TableCell className="text-[11px] text-muted-foreground font-outfit">
                      {new Date(p.requestedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleOpenPayoutModal(p, 'pay')}
                          className="h-8 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold"
                        >
                          <Check className="w-3.5 h-3.5 ml-1" />
                          <span>تایید واریز</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenPayoutModal(p, 'reject')}
                          className="h-8 px-2 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-[11px]"
                        >
                          <span>رد</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Recent Orders and Transactions */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-500" />
              <span>آخرین سفارشات و تراکنش‌های دریافتی</span>
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              تراکنش‌های ثبت‌شده از طریق حواله بانکی، صرافی و درگاه‌های پرداخت آنلاین
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-muted/10 border border-dashed border-border/80 flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <CreditCard className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              هنوز هیچ سفارشی در سیستم ثبت نگردیده است.
            </p>
            <p className="text-[11px] text-muted-foreground">
              تراکنش‌های ثبت‌شده از طریق درگاه‌های پرداخت آنلاین یا حواله‌های بانکی در این بخش نمایش داده می‌شوند.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">شماره سفارش</TableHead>
                  <TableHead className="text-right font-bold text-xs">مشتری</TableHead>
                  <TableHead className="text-right font-bold text-xs">مبلغ کل</TableHead>
                  <TableHead className="text-right font-bold text-xs">روش پرداخت</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت پرداخت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o._id} className="border-border hover:bg-muted/40 transition-colors">
                    <TableCell className="font-outfit text-xs font-bold text-cyan-500" dir="ltr">
                      #{o.orderNumber}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-bold text-foreground">{o.customerName}</div>
                      <div className="text-[10px] text-muted-foreground font-outfit" dir="ltr">
                        {o.customerPhone}
                      </div>
                    </TableCell>

                    <TableCell className="font-outfit text-xs font-bold text-emerald-500">
                      {o.totalPrice.toLocaleString('en-US')} افغانی
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {o.paymentMethod === 'bank_transfer' ? 'حواله بانکی / صرافی' : 'آنلاین'}
                    </TableCell>

                    <TableCell>
                      {o.paymentStatus === 'paid' ? (
                        <Badge variant="success" className="text-[10px] py-0 px-2 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>پرداخت موفق</span>
                        </Badge>
                      ) : o.paymentStatus === 'pending' ? (
                        <Badge variant="warning" className="text-[10px] py-0 px-2 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          <span>در انتظار تایید</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] py-0 px-2 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          <span>ناموفق</span>
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Payout Action Modal */}
      <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <span>
                {payoutAction === 'pay' ? 'ثبت پرداخت تسویه‌حساب' : 'رد درخواست تسویه‌حساب'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              مبلغ: {selectedPayout?.amount.toLocaleString('en-US')} افغانی برای «
              {selectedPayout?.accountHolderName}»
            </DialogDescription>
          </DialogHeader>

          {selectedPayout && (
            <div className="space-y-4 py-2">
              {payoutAction === 'pay' ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">کد پیگیری تراکنش بانکی / فیش:</label>
                    <Input
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      className="h-10 rounded-xl text-xs font-outfit"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">یادداشت مدیر:</label>
                    <Input
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rose-500">دلیل رد درخواست تسویه:</label>
                  <Input
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="مثال: شماره حساب به نام متقاضی نیست..."
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              )}

              <DialogFooter className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedPayout(null)}
                  className="h-10 rounded-xl text-xs"
                >
                  انصراف
                </Button>
                <Button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecutePayout}
                  className={`h-10 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 ${
                    payoutAction === 'pay'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{payoutAction === 'pay' ? 'ثبت و تایید نهایی واریز' : 'رد درخواست'}</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
