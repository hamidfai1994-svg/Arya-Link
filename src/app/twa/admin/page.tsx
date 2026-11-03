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
} from 'lucide-react';

interface AdminStats {
  totalProfiles: number;
  totalMessages: number;
}

interface RecentMessage {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  profileAlias?: string;
  createdAt: string;
}

export default function AdminTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async (initData: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/twa/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, type: 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentMessages(data.recentMessages || []);
        setAuthStatus('success');
      } else {
        setAuthStatus('error');
      }
    } catch {
      setAuthStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      tg.ready();
      tg.expand();
      loadDashboardData(tg.initData);
    } else {
      setAuthStatus('error');
    }
  }, []);

  const handleRefresh = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      loadDashboardData(tg.initData);
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
          خوش آمدید! در این پنل آمار کلان و آخرین پیام‌های سراسری آریا لینک به صورت زنده نمایش داده می‌شوند.
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

      {/* Recent Messages Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
            آخرین پیام‌ها و رخدادهای سیستم
          </span>
          <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
            5 مورد اخیر
          </span>
        </div>

        {recentMessages.length === 0 ? (
          <div
            className="p-6 rounded-2xl border text-center text-xs"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--tg-theme-hint-color, #94a3b8)',
            }}
          >
            هنوز پیامی در سامانه ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-2">
            {recentMessages.map((msg) => (
              <div
                key={msg._id}
                className="p-3 rounded-2xl border space-y-1.5 transition-all"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                    {msg.name || 'مخاطب ناشناس'}
                  </span>
                  {msg.profileAlias && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1"
                      style={{
                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                        color: 'var(--tg-theme-button-color, #0ea5e9)',
                      }}
                    >
                      <span>aryal.ink/{msg.profileAlias}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <p
                  className="text-xs leading-relaxed line-clamp-2"
                  style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}
                >
                  {msg.message}
                </p>

                <div
                  className="pt-1 border-t flex items-center justify-between text-[10px]"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--tg-theme-hint-color, #94a3b8)',
                  }}
                >
                  <span>{msg.phone || msg.email || 'بدون اطلاعات تماس'}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(msg.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
