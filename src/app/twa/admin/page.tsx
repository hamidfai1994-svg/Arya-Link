'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Clock,
  Sparkles,
  User,
  Eye,
  Inbox,
  ChevronDown,
} from 'lucide-react';
import { formatSmartDate } from '@/lib/utils/date';

interface AdminStats {
  totalProfiles: number;
  totalMessages: number;
}

interface RecentProfile {
  _id: string;
  displayName: string;
  alias: string;
  headline?: string;
  avatarUrl?: string;
  viewsCount?: number;
  leadsCount?: number;
  createdAt: string;
}

export default function AdminTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [limit, setLimit] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadDashboardData = async (initData: string, currentLimit: number = limit) => {
    try {
      const res = await fetch(`/api/twa/dashboard?limit=${currentLimit}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, type: 'admin', limit: currentLimit }),
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentProfiles(data.recentProfiles || []);
        setAuthStatus('success');
      } else {
        setAuthStatus('error');
      }
    } catch {
      setAuthStatus('error');
    }
  };

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      tg.ready();
      tg.expand();
      loadDashboardData(tg.initData, 5);
    } else {
      setAuthStatus('error');
    }
  }, []);

  const handleRefresh = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      setIsRefreshing(true);
      await loadDashboardData(tg.initData, limit);
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      setIsLoadingMore(true);
      const nextLimit = limit + 5;
      setLimit(nextLimit);
      await loadDashboardData(tg.initData, nextLimit);
      setIsLoadingMore(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 p-4 font-sans text-center">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--tg-theme-button-color, #0ea5e9)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
          در حال تایید هویت امن سوپر ادمین...
        </p>
        <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
          رمزنگاری نامرئی تلگرام (TWA)
        </span>
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 p-6 font-sans text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-rose-500">دسترسی غیرمجاز به مرکز فرماندهی</h2>
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
          این صفحه اختصاصی سوپر ادمین است و تنها از داخل ربات تلگرام تاییدشده قابل بازگشایی می‌باشد.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 font-sans select-none max-w-md mx-auto" dir="rtl">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
            style={{
              backgroundColor: 'var(--tg-theme-button-color, #0ea5e9)',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
            }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
              مرکز فرماندهی آریا لینک
            </h1>
            <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
              Super Admin Control Hub
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl transition-all active:scale-95 border cursor-pointer"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--tg-theme-hint-color, #94a3b8)',
          }}
          title="بروزرسانی داده‌ها"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Hero Welcome Card */}
      <div
        className="p-4 rounded-2xl border relative overflow-hidden"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-500">نشست امن احراز شد</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
          خوش آمدید! در این پنل آمار کلان پلتفرم و ثبت‌نام مینی‌سایت‌های جدید به صورت زنده نمایش داده می‌شوند.
        </p>
      </div>

      {/* Grid of Statistical Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Profiles */}
        <div
          className="p-3.5 rounded-2xl border space-y-2"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
              کل کارت‌ها و پروفایل‌ها
            </span>
            <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
            {(stats?.totalProfiles ?? 0).toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-emerald-500 font-bold block">مینی‌سایت‌های فعال</span>
        </div>

        {/* Total Messages & Leads */}
        <div
          className="p-3.5 rounded-2xl border space-y-2"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
              کل لیدها و پیام‌ها
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
            {(stats?.totalMessages ?? 0).toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-sky-400 font-bold block">پیام‌های فرم تماس</span>
        </div>
      </div>

      {/* Recent Profiles / Events Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
            پروفایل‌های اخیراً ثبت‌شده (رویدادها)
          </span>
          <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
            نمایش {recentProfiles.length} مورد
          </span>
        </div>

        {recentProfiles.length === 0 ? (
          <div
            className="p-6 rounded-2xl border text-center text-xs"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--tg-theme-hint-color, #94a3b8)',
            }}
          >
            هنوز پروفایلی در سامانه ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentProfiles.map((p) => (
              <div
                key={p._id}
                className="p-3.5 rounded-2xl border space-y-2.5 transition-all shadow-xs"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Header row: Avatar, Name & Smart Date */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center shrink-0 font-bold text-sm"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--tg-theme-text-color, #f8fafc)',
                      }}
                    >
                      {p.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatarUrl} alt={p.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{p.displayName?.trim().charAt(0) || <User className="w-4 h-4" />}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                        {p.displayName || p.alias}
                      </span>
                      {p.headline ? (
                        <span className="text-[11px] block truncate" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                          {p.headline}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono block truncate" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                          @{p.alias}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className="flex items-center gap-1 text-[10px] shrink-0"
                    style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatSmartDate(p.createdAt)}</span>
                  </span>
                </div>

                {/* Metrics & Action Row */}
                <div
                  className="pt-2 border-t flex items-center justify-between gap-2"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-sky-400" />
                      <span>{(p.viewsCount || 0).toLocaleString('en-US')}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Inbox className="w-3 h-3 text-emerald-400" />
                      <span>{(p.leadsCount || 0).toLocaleString('en-US')}</span>
                    </span>
                  </div>

                  <a
                    href={`/${p.alias}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
                    style={{
                      backgroundColor: 'rgba(14, 165, 233, 0.15)',
                      borderColor: 'rgba(14, 165, 233, 0.3)',
                      color: 'var(--tg-theme-button-color, #0ea5e9)',
                    }}
                  >
                    <span>مشاهده کارت</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {recentProfiles.length >= limit && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--tg-theme-button-color, #0ea5e9)',
                  }}
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>در حال دریافت پروفایل‌های بیشتر...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>بارگذاری بیشتر</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
