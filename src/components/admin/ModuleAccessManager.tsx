'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Crown,
  Lock,
  Unlock,
  Search,
  Save,
  RefreshCw,
  Loader2,
  Sparkles,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  MODULE_REGISTRY,
  MODULE_CATEGORIES,
  MODULE_CATEGORY_LABELS,
  ModuleRegistryItem,
} from '@/lib/constants/moduleRegistry';
import { getModuleIcon } from '@/components/icons/moduleRegistryIcons';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function ModuleAccessManager() {
  const [modules, setModules] = useState<ModuleRegistryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'vip'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/modules/access', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.modules)) {
        setModules(data.modules);
        setHasUnsavedChanges(false);
      } else {
        setModules(MODULE_REGISTRY);
      }
    } catch (err) {
      console.error('Error loading module access registry:', err);
      toast.error('خطا در دریافت لیست تنظیمات ماژول‌ها.');
      setModules(MODULE_REGISTRY);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const persistModules = async (nextModules: ModuleRegistryItem[], successMsg?: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/modules/access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: nextModules }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.modules)) {
          setModules(data.modules);
        }
        setHasUnsavedChanges(false);
        toast.success(successMsg || data.message || 'تنظیمات دسترسی ماژول‌ها با موفقیت ذخیره شد.');
      } else {
        toast.error(data.message || 'خطا در ذخیره‌سازی تغییرات.');
      }
    } catch (err) {
      console.error('Error saving module access config:', err);
      toast.error('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlanChange = (moduleType: string, nextPlan: 'free' | 'pro' | 'vip') => {
    const updated = modules.map((m) =>
      m.moduleType === moduleType
        ? { ...m, requiredPlan: nextPlan, isPremium: nextPlan !== 'free' }
        : m
    );
    setModules(updated);
    setHasUnsavedChanges(true);
  };

  const handleToggleProSwitch = (moduleType: string, checked: boolean) => {
    const nextPlan: 'free' | 'pro' = checked ? 'pro' : 'free';
    handlePlanChange(moduleType, nextPlan);
  };

  const handleResetDefaults = async () => {
    setModules(MODULE_REGISTRY);
    setCurrentPage(1);
    await persistModules(
      MODULE_REGISTRY,
      'سطح دسترسی تمام ماژول‌ها به حالت پیش‌فرض سیستم بازنشانی و ذخیره شد.'
    );
  };

  const stats = useMemo(() => {
    const total = modules.length;
    const freeCount = modules.filter((m) => m.requiredPlan === 'free').length;
    const proCount = modules.filter((m) => m.requiredPlan === 'pro').length;
    const vipCount = modules.filter((m) => m.requiredPlan === 'vip').length;
    return { total, freeCount, proCount, vipCount };
  }, [modules]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: modules.length };
    for (const mod of modules) {
      counts[mod.category] = (counts[mod.category] || 0) + 1;
    }
    return counts;
  }, [modules]);

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return modules.filter((mod) => {
      const matchesCat = categoryFilter === 'all' || mod.category === categoryFilter;
      const matchesPlan = planFilter === 'all' || mod.requiredPlan === planFilter;
      const matchesSearch =
        !q ||
        mod.title.toLowerCase().includes(q) ||
        (mod.categoryTitle || '').toLowerCase().includes(q);
      return matchesCat && matchesPlan && matchesSearch;
    });
  }, [modules, categoryFilter, planFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredModules.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedModules = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredModules.slice(start, start + itemsPerPage);
  }, [filteredModules, safeCurrentPage, itemsPerPage]);

  const startItemIndex = filteredModules.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItemIndex = Math.min(safeCurrentPage * itemsPerPage, filteredModules.length);

  return (
    <div className="space-y-5" dir="rtl">
      {/* Top-Left Operational Buttons Bar + Header */}
      <div className="space-y-3 pb-5 border-b border-border">
        <div className="w-full flex flex-wrap items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchModules}
            disabled={isLoading || isSaving}
            className="h-9 px-3.5 rounded-xl border-border bg-card flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs">بروزرسانی</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={isLoading || isSaving}
            className="h-9 px-3.5 rounded-xl border-border bg-card flex items-center gap-1.5 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-xs">بازنشانی پیش‌فرض</span>
          </Button>

          <Button
            type="button"
            onClick={() => persistModules(modules)}
            disabled={isSaving || isLoading}
            className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>ذخیره تغییرات در دیتابیس</span>
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              مدیریت دسترسی ماژول‌ها
            </h2>
            <Badge variant="gold" className="font-sans text-[11px]">
              داینامیک
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            به صورت داینامیک تعیین کنید کدام ماژول‌ها برای تمام کاربران رایگان (Free) و کدام ماژول‌ها نیازمند اشتراک حرفه‌ای (Pro) یا ویژه (VIP) باشند.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 rounded-2xl border-border bg-card/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">کل ماژول‌ها</span>
            <span className="text-2xl font-black font-sans text-foreground mt-0.5 block">
              {stats.total}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">رایگان (Free)</span>
            <span className="text-2xl font-black font-sans text-emerald-500 mt-0.5 block">
              {stats.freeCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Unlock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">حرفه‌ای (Pro)</span>
            <span className="text-2xl font-black font-sans text-amber-500 mt-0.5 block">
              {stats.proCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-border bg-card/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">ویژه (VIP)</span>
            <span className="text-2xl font-black font-sans text-purple-500 mt-0.5 block">
              {stats.vipCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Row 1: Search Bar & Plan Filter */}
      <Card className="p-4 rounded-2xl border-border bg-card/90">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="جستجوی نام ماژول..."
              className="w-full h-10 pr-9 pl-8 rounded-xl bg-background border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                aria-label="پاک کردن جستجو"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value as 'all' | 'free' | 'pro' | 'vip');
              setCurrentPage(1);
            }}
            className="h-10 sm:w-52 shrink-0 px-3 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">همه سطوح دسترسی</option>
            <option value="free">فقط رایگان (Free)</option>
            <option value="pro">فقط حرفه‌ای (Pro)</option>
            <option value="vip">فقط ویژه (VIP)</option>
          </select>
        </div>
      </Card>

      {/* Windows Properties-Style Multi-Row Category Tabs + Connected Module List */}
      <div className="w-full">
        {/* Multi-Row Tabs Container (Flex Wrap + Dynamic Grow, Zero Scroll) */}
        <div className="flex flex-wrap items-stretch gap-1 w-full bg-muted/30 p-1.5 pb-0 rounded-t-2xl border border-b-0 border-border">
          {MODULE_CATEGORIES.map((cat) => {
            const isActive = categoryFilter === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat.id);
                  setCurrentPage(1);
                }}
                className={`flex-[1_1_auto] min-w-[115px] inline-flex items-center justify-center gap-2 whitespace-nowrap px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-t-xl border ${
                  isActive
                    ? 'bg-card text-cyan-600 dark:text-cyan-400 border-border border-t-2 border-t-cyan-500 border-b-0 z-10 shadow-sm -mb-px'
                    : 'bg-muted/60 text-muted-foreground border-border/80 border-b hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{cat.title}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-extrabold'
                      : 'bg-background/70 text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Unified Vertical Table-like List View (Visually Connected to Active Tab) */}
        {isLoading ? (
          <Card className="py-20 rounded-t-none rounded-b-2xl border border-border bg-card shadow-sm flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-xs">در حال بارگذاری لیست ماژول‌های پلتفرم...</span>
          </Card>
        ) : filteredModules.length === 0 ? (
          <Card className="p-12 rounded-t-none rounded-b-2xl border border-border bg-card shadow-sm text-center space-y-2">
            <Layers className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
            <p className="text-sm font-bold text-foreground">هیچ ماژولی مطابق جستجو یا فیلتر شما پیدا نشد.</p>
          </Card>
        ) : (
          <Card className="rounded-t-none rounded-b-2xl border border-border bg-card overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 items-center gap-4 px-5 py-3 bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground">
            <div className="col-span-5">ماژول (آیکن و نام)</div>
            <div className="col-span-2 text-center">دسته‌بندی</div>
            <div className="col-span-2 text-center">وضعیت فعلی</div>
            <div className="col-span-3 text-left">تنظیم سطح دسترسی (رایگان / پولی)</div>
          </div>

          {/* Vertical Rows */}
          <div className="divide-y divide-border/70">
            {paginatedModules.map((mod, idx) => {
              const isPaid = mod.requiredPlan !== 'free';
              const isVip = mod.requiredPlan === 'vip';
              const rowNumber = (safeCurrentPage - 1) * itemsPerPage + idx + 1;

              return (
                <div
                  key={mod.moduleType}
                  className={`flex flex-col md:grid md:grid-cols-12 md:items-center gap-3 md:gap-4 px-4 sm:px-5 py-3.5 transition-colors hover:bg-muted/30 ${
                    isVip
                      ? 'bg-purple-500/[0.025]'
                      : isPaid
                      ? 'bg-amber-500/[0.02]'
                      : ''
                  }`}
                >
                  {/* Icon & Dari Title ONLY (no Type: metadata clutter) */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <span className="text-[11px] font-mono text-muted-foreground/70 w-6 text-center shrink-0">
                      {rowNumber}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-xs">
                      {getModuleIcon(mod.moduleType, 'w-5 h-5')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">{mod.title}</h3>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex md:justify-center items-center">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">
                      {mod.categoryTitle || MODULE_CATEGORY_LABELS[mod.category] || mod.category}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div className="col-span-2 flex md:justify-center items-center">
                    {isVip ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/30">
                        <Sparkles className="w-3 h-3" />
                        <span>ویژه (VIP)</span>
                      </span>
                    ) : isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Crown className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>حرفه‌ای (Pro)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Unlock className="w-3 h-3" />
                        <span>رایگان</span>
                      </span>
                    )}
                  </div>

                  {/* Access Toggle & Plan Select */}
                  <div className="col-span-3 flex flex-wrap items-center justify-between md:justify-end gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isPaid}
                        onCheckedChange={(checked) => handleToggleProSwitch(mod.moduleType, checked)}
                      />
                      <span className="text-[11px] font-semibold text-foreground inline-flex items-center gap-1 whitespace-nowrap">
                        {isPaid ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>پولی</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                            <span>رایگان</span>
                          </>
                        )}
                      </span>
                    </div>

                    <select
                      value={mod.requiredPlan}
                      onChange={(e) =>
                        handlePlanChange(mod.moduleType, e.target.value as 'free' | 'pro' | 'vip')
                      }
                      aria-label={`سطح پلن ${mod.title}`}
                      className="h-8 px-2.5 rounded-lg bg-background border border-border text-[11px] font-bold text-foreground focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="free">رایگان (Free)</option>
                      <option value="pro">حرفه‌ای (Pro)</option>
                      <option value="vip">ویژه (VIP)</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination & Page-Size Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-muted/30 border-t border-border">
            {/* Count & Items Per Page Dropdown */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                نمایش <strong className="text-foreground font-sans">{startItemIndex}</strong> تا{' '}
                <strong className="text-foreground font-sans">{endItemIndex}</strong> از{' '}
                <strong className="text-foreground font-sans">{filteredModules.length}</strong> ماژول
              </span>

              <div className="flex items-center gap-1.5">
                <label htmlFor="modules-per-page" className="text-[11px] text-muted-foreground">
                  تعداد نمایش:
                </label>
                <select
                  id="modules-per-page"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-background border border-border text-xs font-bold text-foreground focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} آیتم
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prev / Page Numbers / Next Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="h-8 px-2.5 rounded-lg border-border bg-background text-xs flex items-center gap-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>قبلی</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer border ${
                      pageNum === safeCurrentPage
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-xs'
                        : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 px-2.5 rounded-lg border-border bg-background text-xs flex items-center gap-1"
              >
                <span>بعدی</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}
