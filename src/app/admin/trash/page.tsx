'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2,
  RotateCcw,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Wallet,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
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

interface TrashAuditItem {
  id: string;
  recordType: 'order' | 'transaction' | 'payout';
  recordId: string;
  referenceNumber: string;
  title: string;
  amount: number;
  currency: string;
  deletedByAdminName: string;
  deletedByAdminEmail: string;
  deletedAt: string;
  deletedReason: string;
  isRestored: boolean;
}

export default function SystemTrashPage() {
  const [logs, setLogs] = useState<TrashAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'order' | 'transaction' | 'payout'>('all');

  // Restore Modal State
  const [selectedItemToRestore, setSelectedItemToRestore] = useState<TrashAuditItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    fetchTrashLogs();
  }, []);

  const fetchTrashLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/trash', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else {
        toast.error(data.message || 'خطا در بارگذاری زباله‌دان');
      }
    } catch (err) {
      console.error('Error fetching trash logs:', err);
      toast.error('خطای ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedItemToRestore) return;
    setIsRestoring(true);
    try {
      const res = await fetch('/api/admin/trash/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: selectedItemToRestore.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedItemToRestore(null);
        fetchTrashLogs();
      } else {
        toast.error(data.message || 'خطا در بازیابی رکورد.');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور در هنگام بازیابی.');
    } finally {
      setIsRestoring(false);
    }
  };

  const filteredLogs = logs.filter((item) => {
    if (typeFilter !== 'all' && item.recordType !== typeFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.referenceNumber.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.deletedByAdminName.toLowerCase().includes(q) ||
      item.deletedReason.toLowerCase().includes(q)
    );
  });

  const ordersCount = logs.filter((l) => l.recordType === 'order').length;
  const financeCount = logs.filter((l) => l.recordType === 'transaction' || l.recordType === 'payout').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 select-none font-sans"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  زباله‌دان سیستم و لاگ حسابرسی (Audit Log)
                </h1>
                <Badge variant="destructive" className="text-xs">
                  سطح امنیتی ارشد
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                فهرست رکوردهای حذف‌شده (سفارشات و تراکنش‌ها)، نام ادمین اقدام‌کننده، زمان حذف و دلیل اجباری ثبت‌شده
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={fetchTrashLogs}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-slate-800 bg-slate-900 text-slate-200 self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی زباله‌دان</span>
        </Button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-3xl border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-300">کل رکوردهای حذف‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {logs.length.toLocaleString('en-US')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">حفظ شده در لاگ امنیتی با امکان بازیابی</p>
        </Card>

        <Card className="rounded-3xl border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-300">سفارشات حذف‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-400 tracking-tight">
            {ordersCount.toLocaleString('en-US')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">سفارشات کارت NFC یا مینی‌سایت</p>
        </Card>

        <Card className="rounded-3xl border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-300">تراکنش‌ها و تسویه‌ها</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 tracking-tight">
            {financeCount.toLocaleString('en-US')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">تراکنش‌های بانکی و تسویه‌حساب‌ها</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس شماره پیگیری، نام یا دلیل حذف..."
            className="h-10 pr-10 pl-3 rounded-2xl bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              typeFilter === 'all'
                ? 'bg-rose-500 text-white'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            همه موارد ({logs.length.toLocaleString('en-US')})
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('order')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              typeFilter === 'order'
                ? 'bg-cyan-500 text-white'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            سفارشات ({ordersCount.toLocaleString('en-US')})
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('payout')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              typeFilter === 'payout'
                ? 'bg-amber-500 text-white'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            تسویه‌حساب‌ها ({logs.filter((l) => l.recordType === 'payout').length.toLocaleString('en-US')})
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="rounded-3xl border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-sm font-bold text-white">زباله‌دان سیستم خالی است</p>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              هیچ رکورد سفارش یا تراکنش حذف‌شده‌ای یافت نشد. تمام عملیات حذف در جداول ادمین در این مکان ثبت می‌شوند.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs text-slate-300">نوع رکورد</TableHead>
                  <TableHead className="text-right font-bold text-xs text-slate-300">شماره و عنوان رکورد</TableHead>
                  <TableHead className="text-right font-bold text-xs text-slate-300">مبلغ</TableHead>
                  <TableHead className="text-right font-bold text-xs text-slate-300">ادمین اقدام‌کننده</TableHead>
                  <TableHead className="text-right font-bold text-xs text-slate-300">زمان دقیق حذف</TableHead>
                  <TableHead className="text-right font-bold text-xs text-slate-300">دلیل اجباری ثبت‌شده</TableHead>
                  <TableHead className="text-center font-bold text-xs text-slate-300">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-slate-800/80 hover:bg-slate-800/40 transition-colors"
                  >
                    <TableCell>
                      {log.recordType === 'order' ? (
                        <Badge variant="cyan" className="text-[10px] py-0.5 px-2">
                          سفارش کارت
                        </Badge>
                      ) : log.recordType === 'payout' ? (
                        <Badge variant="warning" className="text-[10px] py-0.5 px-2">
                          تسویه حساب
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0.5 px-2">
                          تراکنش مالی
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-xs text-white" dir="ltr">
                        {log.referenceNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {log.title}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-bold text-emerald-400">
                      {log.amount.toLocaleString('en-US')} {log.currency}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.deletedByAdminName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5" dir="ltr">
                        {log.deletedByAdminEmail}
                      </div>
                    </TableCell>

                    <TableCell className="text-[11px] text-slate-400 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>
                          {new Date(log.deletedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          {new Date(log.deletedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold max-w-xs">
                        {log.deletedReason}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() => setSelectedItemToRestore(log)}
                        className="h-8 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 mx-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>بازیابی</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Restore Confirmation Modal */}
      <Dialog open={!!selectedItemToRestore} onOpenChange={() => setSelectedItemToRestore(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md rounded-3xl bg-slate-950 border-slate-800 text-white" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
              <span>تایید بازیابی رکورد از زباله‌دان</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              آیا مطمئن هستید که می‌خواهید رکورد «{selectedItemToRestore?.title}» را به حالت فعال بازگردانید؟
            </DialogDescription>
          </DialogHeader>

          {selectedItemToRestore && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>شماره پیگیری:</span>
                  <span className="text-white font-bold" dir="ltr">{selectedItemToRestore.referenceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>مبلغ:</span>
                  <span className="text-emerald-400 font-bold">{selectedItemToRestore.amount.toLocaleString('en-US')} {selectedItemToRestore.currency}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>دلیل ثبت‌شده در زمان حذف:</span>
                  <span className="text-rose-300 font-medium">{selectedItemToRestore.deletedReason}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={isRestoring}
              onClick={() => setSelectedItemToRestore(null)}
              className="h-10 rounded-xl text-xs border-slate-800 bg-slate-900 text-slate-300"
            >
              انصراف
            </Button>
            <Button
              type="button"
              disabled={isRestoring}
              onClick={handleRestore}
              className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              {isRestoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              <span>تایید و بازگردانی رکورد</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

