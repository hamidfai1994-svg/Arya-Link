'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  History,
  QrCode,
  Barcode,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Sparkles,
  RefreshCw,
  LogIn,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ToolsCtaBanner } from '@/components/tools/ToolsCtaBanner';

interface ToolHistoryItem {
  _id: string;
  toolType: 'qr' | 'barcode';
  title: string;
  subtype: string;
  payload: string;
  previewDataUrl?: string;
  config?: Record<string, any>;
  createdAt: string;
}

export default function ToolHistoryPage() {
  const { dir, language } = useLanguage();
  const isRtl = dir === 'rtl';
  const { data: session, status } = useSession();

  const [items, setItems] = useState<ToolHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'qr' | 'barcode'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch History from API
  const fetchHistory = async () => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/tools/history');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      toast.error('خطا در دریافت لیست تاریخچه');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  // Copy Payload
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('محتوای کد در کلیپ‌بورد کپی شد.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete History Item
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/tools/history?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        toast.success('مورد از تاریخچه حذف شد.');
      } else {
        toast.error(data.message || 'خطا در حذف مورد');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور در حذف مورد');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    let result = items;
    if (filterType !== 'all') {
      result = result.filter((item) => item.toolType === filterType);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.payload.toLowerCase().includes(q) ||
          item.subtype.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, filterType, searchQuery]);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-6">
          <Link
            href="/"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            {language === 'en' ? 'Home' : 'صفحه اصلی'}
          </Link>
          {isRtl ? (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          ) : (
            <span className="text-slate-600">/</span>
          )}
          <span className="text-slate-200 font-medium">
            {language === 'en' ? 'Digital Tools' : 'امکانات جانبی'}
          </span>
          {isRtl ? (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          ) : (
            <span className="text-slate-600">/</span>
          )}
          <span className="text-cyan-400 font-semibold">
            {language === 'en' ? 'History' : 'تاریخچه ابزارها'}
          </span>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-3xl p-6 sm:p-10 mb-8 border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
                <History className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Personal Cloud Archive' : 'آرشیو ابری اختصاصی'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {language === 'en'
                  ? 'My Tools History'
                  : 'تاریخچه ابزارهای دیجیتال من'}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                {language === 'en'
                  ? 'Access, re-edit, download, or copy all barcodes and QR codes you have created.'
                  : 'مشاهده، ویرایش مجدد، کپی و دانلود تمام کدهای QR و بارکدهای تولید شده توسط حساب کاربری شما.'}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link href="/tools/qr-maker">
                <Button
                  size="sm"
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>ساخت QR جدید</span>
                </Button>
              </Link>
              <Link href="/tools/barcode-maker">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-1.5"
                >
                  <Barcode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ساخت بارکد جدید</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Unauthenticated State */}
        {status === 'unauthenticated' ? (
          <div className="p-8 sm:p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">
              برای مشاهده تاریخچه وارد حساب خود شوید
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              برای ذخیره‌سازی ابری کدهای ساخته‌شده و دسترسی همیشگی به تاریخچه در هر زمان و دستگاه، لطفاً وارد حساب کاربری خود شوید.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs px-6 py-2.5">
                  ورود به حساب کاربری
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === 'all'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  همه ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('qr')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    filterType === 'qr'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>کیوآر کد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('barcode')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    filterType === 'barcode'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>بارکد</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در عنوان یا متن کد..."
                  className="h-10 ps-9 bg-slate-950/80 border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl"
                />
              </div>
            </div>

            {/* List / Grid of History Items */}
            {isLoading ? (
              <div className="p-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto opacity-70" />
                <p className="text-xs text-slate-400">در حال فراخوانی تاریخچه کدهای شما...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 rounded-3xl border border-slate-800/80 bg-slate-900/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">
                  {searchQuery
                    ? 'هیچ موردی مطابق جستجوی شما پیدا نشد.'
                    : 'هنوز هیچ کدی در تاریخچه خود ذخیره نکرده‌اید.'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  هنگام ایجاد بارکد یا QR Code جدید، روی دکمه «ذخیره در تاریخچه» کلیک کنید تا در این بخش نگهداری شود.
                </p>
                {!searchQuery && (
                  <div className="pt-2 flex justify-center gap-3">
                    <Link href="/tools/qr-maker">
                      <Button size="sm" className="rounded-xl bg-cyan-500 text-white font-bold text-xs">
                        شروع ساخت QR Code
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const isQr = item.toolType === 'qr';
                  const isCopied = copiedId === item._id;
                  const isDeleting = deletingId === item._id;

                  return (
                    <div
                      key={item._id}
                      className="group rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 transition-all p-4 shadow-lg flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Meta: Type Badge + Subtype + Date */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isQr
                                ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {isQr ? (
                              <QrCode className="w-3 h-3" />
                            ) : (
                              <Barcode className="w-3 h-3" />
                            )}
                            <span>{isQr ? 'QR Code' : 'Barcode'}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>

                        {/* Middle: Preview Thumbnail & Title */}
                        <div className="flex items-start gap-3 mb-3">
                          {item.previewDataUrl ? (
                            <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-700 shrink-0 flex items-center justify-center overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.previewDataUrl}
                                alt={item.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0 flex items-center justify-center text-slate-400">
                              {isQr ? (
                                <QrCode className="w-8 h-8" />
                              ) : (
                                <Barcode className="w-8 h-8" />
                              )}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-white truncate">
                              {item.title}
                            </h3>
                            <span className="text-[10px] text-cyan-400 font-mono block mt-0.5 uppercase truncate">
                              {item.subtype}
                            </span>
                            <p className="text-[11px] font-mono text-slate-400 truncate mt-1 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                              {item.payload}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(item._id, item.payload)}
                          className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                          title="کپی محتوا"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span>{isCopied ? 'کپی شد' : 'کپی'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={
                              isQr
                                ? `/tools/qr-maker`
                                : `/tools/barcode-maker`
                            }
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="باز کردن در ادیتور"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="حذف از تاریخچه"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CTA Banner */}
        <ToolsCtaBanner />
      </div>
    </div>
  );
}

