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
  BarChart3,
  ShoppingCart,
  CreditCard,
  Ban,
  CheckCircle2,
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
  isActive?: boolean;
  createdAt: string;
}

interface AdminOrder {
  _id: string;
  orderNumber?: string;
  orderType: string;
  price: number;
  currency?: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | string;
  customerName?: string;
  createdAt: string;
}

const navItems = [
  { id: 'dashboard' as const, label: 'پیشخوان', icon: BarChart3, emoji: '📊' },
  { id: 'users' as const, label: 'کاربران', icon: Users, emoji: '👥' },
  { id: 'orders' as const, label: 'سفارشات', icon: ShoppingCart, emoji: '🛒' },
  { id: 'finance' as const, label: 'مالی', icon: CreditCard, emoji: '💳' },
];

export default function AdminTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders' | 'finance'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [limit, setLimit] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [updatingProfileId, setUpdatingProfileId] = useState<string | null>(null);

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
        setRecentOrders(data.recentOrders || []);
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

  const handleToggleUserStatus = async (profileId: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || !tg.initData) return;

    setUpdatingProfileId(profileId);
    try {
      const res = await fetch('/api/twa/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'toggleUserStatus',
          profileId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        // Optimistically update local profile state
        setRecentProfiles((prev) =>
          prev.map((p) => (p._id === profileId ? { ...p, isActive: data.isActive } : p))
        );
        // Refresh with server data
        await loadDashboardData(tg.initData, limit);
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        if (tg.showAlert) {
          tg.showAlert(data.error || 'خطا در تغییر وضعیت کاربر');
        }
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      tg.HapticFeedback?.notificationOccurred('error');
    } finally {
      setUpdatingProfileId(null);
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
    <div className="p-4 pb-24 space-y-4 font-sans select-none max-w-md mx-auto" dir="rtl">
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

      {/* Content Area Based on Active Tab */}
      {activeTab === 'dashboard' ? (
        <>
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
              <span className="text-[10px] text-emerald-500 font-bold block">مینی‌سایت‌های پلتفرم</span>
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
                    {/* Header row: Avatar, Name, Status & Smart Date */}
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold truncate" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                              {p.displayName || p.alias}
                            </span>
                            {p.isActive === false ? (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                مسدود
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                فعال
                              </span>
                            )}
                          </div>
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

                    {/* Metrics & Executive Actions Row */}
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

                      <div className="flex items-center gap-1.5">
                        {/* Executive Action: Toggle User Status */}
                        <button
                          type="button"
                          disabled={updatingProfileId === p._id}
                          onClick={() => handleToggleUserStatus(p._id)}
                          className={`py-1.5 px-2.5 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${p.isActive === false
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                            }`}
                          title="تغییر وضعیت فعال یا مسدود بودن کاربر"
                        >
                          {updatingProfileId === p._id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : p.isActive === false ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Ban className="w-3 h-3" />
                          )}
                          <span>تغییر وضعیت</span>
                        </button>

                        {/* View Card Link */}
                        <a
                          href={`/${p.alias}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95"
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
        </>
      ) : activeTab === 'orders' ? (
        /* Orders Tab Content */
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
              لیست سفارشات کارت و اقلام
            </span>
            <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
              نمایش {recentOrders.length} مورد
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2 text-xs"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--tg-theme-hint-color, #94a3b8)',
              }}
            >
              <ShoppingCart className="w-8 h-8 mx-auto opacity-40 mb-1" />
              <p className="font-bold">سفارشی یافت نشد</p>
              <p className="text-[11px] opacity-70">
                تاکنون سفارشی برای کارت هوشمند NFC در سامانه ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-3.5 rounded-2xl border space-y-2 transition-all shadow-xs"
                  style={{
                    backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xs font-bold">
                        🛒
                      </div>
                      <div>
                        <span className="text-xs font-bold block" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                          {ord.orderType || 'کارت NFC'}
                        </span>
                        {ord.customerName && (
                          <span className="text-[10px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                            {ord.customerName}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ord.status === 'shipped' || ord.status === 'completed'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : ord.status === 'processing'
                          ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {ord.status === 'shipped'
                        ? 'ارسال شده'
                        : ord.status === 'processing'
                        ? 'در حال پردازش'
                        : ord.status === 'completed'
                        ? 'تکمیل شده'
                        : 'در انتظار بررسی'}
                    </span>
                  </div>

                  <div
                    className="pt-2 border-t flex items-center justify-between text-xs"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
                  >
                    <span className="font-bold font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      {(ord.price || 0).toLocaleString('en-US')} {ord.currency || 'AFN'}
                    </span>
                    <span
                      className="flex items-center gap-1 text-[10px]"
                      style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatSmartDate(ord.createdAt)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Placeholder for other tabs (Users, Finance) */
        <div
          className="p-8 rounded-2xl border text-center space-y-4 my-8"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl border shadow-inner"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {activeTab === 'users' && '👥'}
            {activeTab === 'finance' && '💳'}
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
              {activeTab === 'users' && 'مدیریت کاربران و دسترسی‌ها'}
              {activeTab === 'finance' && 'گزارش‌های مالی و تراکنش‌ها'}
            </h2>
            <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
              در حال بارگذاری زیرساخت...
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              color: 'var(--tg-theme-button-color, #0ea5e9)',
            }}
          >
            <span>به‌زودی در فاز بعدی فعال می‌شود</span>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(15, 23, 42, 0.95))',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-2">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  const tg = (window as any).Telegram?.WebApp;
                  tg?.HapticFeedback?.selectionChanged();
                }}
                className="flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95"
                style={{
                  color: isActive
                    ? 'var(--tg-theme-button-color, #0ea5e9)'
                    : 'var(--tg-theme-hint-color, #94a3b8)',
                }}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] flex items-center gap-1 ${isActive ? 'font-black' : 'font-medium'}`}>
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
