'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Wallet,
  Search,
  Truck,
} from 'lucide-react';
import { formatSmartDate } from '@/lib/utils/date';
import TelegramBottomNav from '@/components/navigation/TelegramBottomNav';

interface AdminStats {
  totalProfiles: number;
  totalMessages: number;
  totalRevenue?: number;
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
  paymentMethod?: 'online' | 'cod' | string;
  deliveryFee?: number;
  deliveryCompany?: string;
  isDeliverySettled?: boolean;
  createdAt: string;
}

interface AdminTransaction {
  _id: string;
  amount: number;
  type: string;
  status: 'pending' | 'successful' | 'failed' | string;
  currency?: string;
  description?: string;
  createdAt: string;
}


export default function AdminTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders' | 'finance'>('dashboard');
  const [slideDirection, setSlideDirection] = useState<number>(0);

  const TABS_ORDER: ('dashboard' | 'users' | 'orders' | 'finance')[] = [
    'finance',
    'orders',
    'users',
    'dashboard',
  ];

  const handleTabChange = (newTab: 'dashboard' | 'users' | 'orders' | 'finance') => {
    const oldIdx = TABS_ORDER.indexOf(activeTab);
    const newIdx = TABS_ORDER.indexOf(newTab);
    if (newIdx !== oldIdx) {
      setSlideDirection(newIdx > oldIdx ? 1 : -1);
      setActiveTab(newTab);
      if (typeof window !== 'undefined') {
        const tg = (window as any).Telegram?.WebApp;
        tg?.HapticFeedback?.selectionChanged();
      }
    }
  };

  const handleSwipeEnd = (
    offset: { x: number; y: number },
    velocity: { x: number; y: number }
  ) => {
    // If vertical gesture is dominant, do not trigger horizontal tab swipe
    if (Math.abs(offset.y) > Math.abs(offset.x) * 1.5) {
      return;
    }

    const swipeThreshold = 45;
    const velocityThreshold = 250;
    const currentIdx = TABS_ORDER.indexOf(activeTab);

    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      // Swiping to the Left -> move towards lower index in TABS_ORDER ('finance' side)
      if (currentIdx > 0) {
        setSlideDirection(-1);
        setActiveTab(TABS_ORDER[currentIdx - 1]);
        if (typeof window !== 'undefined') {
          const tg = (window as any).Telegram?.WebApp;
          tg?.HapticFeedback?.selectionChanged();
        }
      }
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      // Swiping to the Right -> move towards higher index in TABS_ORDER ('dashboard' side)
      if (currentIdx < TABS_ORDER.length - 1) {
        setSlideDirection(1);
        setActiveTab(TABS_ORDER[currentIdx + 1]);
        if (typeof window !== 'undefined') {
          const tg = (window as any).Telegram?.WebApp;
          tg?.HapticFeedback?.selectionChanged();
        }
      }
    }
  };
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<AdminTransaction[]>([]);
  const [limit, setLimit] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [updatingProfileId, setUpdatingProfileId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [settlingOrderId, setSettlingOrderId] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');

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
        setRecentTransactions(data.recentTransactions || []);
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
        setRecentProfiles((prev) =>
          prev.map((p) => (p._id === profileId ? { ...p, isActive: data.isActive } : p))
        );
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || !tg.initData) return;

    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/twa/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'updateOrderStatus',
          orderId,
          newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setRecentOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        if (tg.showAlert) {
          tg.showAlert(data.error || 'خطا در تغییر وضعیت سفارش');
        }
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      tg?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSettleDelivery = async (orderId: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || !tg.initData) return;

    setSettlingOrderId(orderId);
    try {
      const res = await fetch('/api/twa/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'settleDelivery',
          orderId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setRecentOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, isDeliverySettled: true } : o))
        );
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        if (tg.showAlert) {
          tg.showAlert(data.error || 'خطا در ثبت تسویه دلیوری');
        }
      }
    } catch (err) {
      console.error('Error settling delivery:', err);
      tg?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setSettlingOrderId(null);
    }
  };

  // Filter profiles for Users tab
  const filteredProfiles = recentProfiles.filter((p) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase().trim();
    return (
      (p.displayName || '').toLowerCase().includes(q) ||
      (p.alias || '').toLowerCase().includes(q) ||
      (p.headline || '').toLowerCase().includes(q)
    );
  });

  // Filter orders for delivery settlements in Finance tab
  const codSettlements = recentOrders.filter(
    (o) => (o.paymentMethod === 'cod' || o.paymentMethod === 'Cash on Delivery') && !o.isDeliverySettled
  );
  const onlineSettlements = recentOrders.filter(
    (o) => o.paymentMethod !== 'cod' && o.paymentMethod !== 'Cash on Delivery' && !o.isDeliverySettled
  );

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
    <div className="p-4 pb-32 space-y-4 font-sans select-none max-w-md mx-auto overflow-x-hidden" dir="rtl">
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

      {/* Animated Content Area with Swipe & Slide Transition */}
      <div className="overflow-hidden w-full">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={activeTab}
            custom={slideDirection}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 30 : dir < 0 ? -30 : 0,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                x: dir > 0 ? -30 : dir < 0 ? 30 : 0,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => handleSwipeEnd(info.offset, info.velocity)}
            className="w-full space-y-4 touch-pan-y"
          >
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
              خوش آمدید! آمار رشد پلتفرم، لیدها و وضعیت سامانه در این پیشخوان متمرکز گردیده‌اند.
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

          {/* 7-Day Growth Bar Chart */}
          <div
            className="p-4 rounded-2xl border space-y-3 shadow-xs"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                <span>ثبت‌نام‌های ۷ روز اخیر</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                روند صعودی
              </span>
            </div>

            <div className="flex items-end justify-between h-32 gap-2 pt-3">
              {[20, 50, 30, 80, 40, 90, 60].map((val, i) => (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <span className="text-[9px] mb-1 opacity-70 font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                    {val}
                  </span>
                  <div
                    className="w-full rounded-t-lg transition-all group-hover:brightness-125"
                    style={{
                      height: `${val}%`,
                      backgroundColor: 'var(--tg-theme-button-color, #0ea5e9)',
                      boxShadow: '0 0 10px rgba(14, 165, 233, 0.25)',
                    }}
                  />
                  <span className="text-[9px] mt-2 opacity-70 truncate font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                    {i + 1} روز پیش
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : activeTab === 'users' ? (
        /* Users Tab Content (Moved from dashboard with Live Search) */
        <div className="space-y-3 pt-1">
          {/* Header & Search Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                مدیریت کاربران و مینی‌سایت‌ها
              </span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                نمایش {filteredProfiles.length} از {recentProfiles.length} کاربر
              </span>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی نام، آیدی یا تخصص کاربر..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full border rounded-xl py-2 pr-9 pl-3 text-xs outline-none transition-all focus:border-cyan-500"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--tg-theme-text-color, #f8fafc)',
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                <Search className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* User List */}
          {filteredProfiles.length === 0 ? (
            <div
              className="p-6 rounded-2xl border text-center text-xs space-y-1"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--tg-theme-hint-color, #94a3b8)',
              }}
            >
              <Users className="w-8 h-8 mx-auto opacity-40 mb-1" />
              <p className="font-bold">کاربری یافت نشد</p>
              <p className="text-[11px] opacity-70">
                با عبارت جستجو شده هیچ پروفایلی مطابقت ندارد.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredProfiles.map((p) => (
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
                        className={`py-1.5 px-2.5 rounded-xl border flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                          p.isActive === false
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
                  className="p-3.5 rounded-2xl border space-y-2.5 transition-all shadow-xs"
                  style={{
                    backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-sm font-bold shrink-0">
                        🛒
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                          {ord.orderType || 'کارت NFC'}
                        </span>
                        {ord.customerName ? (
                          <span className="text-[10px] block truncate" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                            خریدار: {ord.customerName}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono block truncate opacity-70" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                            #{ord.orderNumber || ord._id.slice(-6)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative shrink-0">
                      <select
                        value={ord.status || 'pending'}
                        disabled={updatingOrderId === ord._id}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border appearance-none pr-7 pl-3 cursor-pointer outline-none transition-all ${
                          ord.status === 'shipped' || ord.status === 'completed'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : ord.status === 'processing'
                            ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        <option value="pending" className="bg-slate-900 text-amber-400">🟡 در انتظار</option>
                        <option value="processing" className="bg-slate-900 text-sky-400">🔵 در حال پردازش</option>
                        <option value="shipped" className="bg-slate-900 text-emerald-400">🟢 ارسال شده</option>
                      </select>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70">
                        {updatingOrderId === ord._id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </div>
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
        /* Finance Tab Content (with Delivery Settlement System) */
        <div className="space-y-4 pt-1">
          {/* Revenue Hero Card */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden space-y-2 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
              borderColor: 'rgba(14, 165, 233, 0.3)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                <span>مجموع درآمدهای کل پلتفرم</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                تسویه زنده
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-black font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                {(stats?.totalRevenue ?? 0).toLocaleString('en-US')}
              </span>
              <span className="text-xs font-bold text-sky-400">افغانی</span>
            </div>

            <p className="text-[11px] leading-relaxed opacity-80" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
              حاصل از فروش کارت‌های هوشمند NFC، تمدید اشتراک‌ها و تراکنش‌های موفق.
            </p>
          </div>

          {/* Section: Delivery Settlements (سیستم تسویه حساب دلیوری) */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                سیستم تسویه حساب شرکت دلیوری و پیک
              </h3>
            </div>

            {/* Sub-section 1: COD Settlements (بستانکاری از پیک) */}
            <div
              className="p-3.5 rounded-2xl border space-y-2.5"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>📥</span>
                  <span>بستانکاری از پیک (پرداخت در محل / COD)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                  {codSettlements.length} مورد
                </span>
              </div>
              <p className="text-[11px] opacity-75 leading-relaxed" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                مبالغی که پیک از خریدار دریافت کرده و پس از کسر هزینه دلیوری باید به شما بپردازد.
              </p>

              {codSettlements.length === 0 ? (
                <div className="py-3 text-center text-[11px] opacity-70">
                  سفارش تسویه‌نشده‌ای در این بخش وجود ندارد.
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {codSettlements.map((ord) => {
                    const fee = ord.deliveryFee || 150;
                    const netReceivable = Math.max(0, (ord.price || 0) - fee);
                    return (
                      <div
                        key={ord._id}
                        className="p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div className="min-w-0">
                          <span className="font-bold block truncate" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                            {ord.customerName || ord.orderType}
                          </span>
                          <span className="text-[10px] block opacity-70 font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                            طلب خالص: {netReceivable.toLocaleString('en-US')} AFN (کل: {ord.price.toLocaleString('en-US')} - پیک: {fee.toLocaleString('en-US')})
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={settlingOrderId === ord._id}
                          onClick={() => handleSettleDelivery(ord._id)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {settlingOrderId === ord._id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <span>✔ ثبت تسویه</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sub-section 2: Online Settlements (بدهکاری به پیک) */}
            <div
              className="p-3.5 rounded-2xl border space-y-2.5"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <span>📤</span>
                  <span>بدهکاری به پیک (پرداخت آنلاین)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400">
                  {onlineSettlements.length} مورد
                </span>
              </div>
              <p className="text-[11px] opacity-75 leading-relaxed" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                سفارشاتی که پول آن‌ها آنلاین پرداخت شده و شما باید فقط هزینه دلیوری را به پیک بپردازید.
              </p>

              {onlineSettlements.length === 0 ? (
                <div className="py-3 text-center text-[11px] opacity-70">
                  سفارش تسویه‌نشده‌ای در این بخش وجود ندارد.
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {onlineSettlements.map((ord) => {
                    const fee = ord.deliveryFee || 150;
                    return (
                      <div
                        key={ord._id}
                        className="p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          borderColor: 'rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div className="min-w-0">
                          <span className="font-bold block truncate" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                            {ord.customerName || ord.orderType}
                          </span>
                          <span className="text-[10px] block opacity-70 font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                            هزینه دلیوری بدهکار: {fee.toLocaleString('en-US')} AFN
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={settlingOrderId === ord._id}
                          onClick={() => handleSettleDelivery(ord._id)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {settlingOrderId === ord._id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <span>✔ ثبت تسویه</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Transactions Section */}
          <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                تراکنش‌های اخیر
              </span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                نمایش {recentTransactions.length} مورد
              </span>
            </div>

            {recentTransactions.length === 0 ? (
              <div
                className="p-8 rounded-2xl border text-center space-y-2 text-xs"
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--tg-theme-hint-color, #94a3b8)',
                }}
              >
                <CreditCard className="w-8 h-8 mx-auto opacity-40 mb-1" />
                <p className="font-bold">تراکنشی یافت نشد</p>
                <p className="text-[11px] opacity-70">
                  هنوز تراکنش مالی ثبت‌شده‌ای در سیستم وجود ندارد.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="p-3.5 rounded-2xl border space-y-2 transition-all shadow-xs"
                    style={{
                      backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            tx.status === 'successful'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : tx.status === 'failed'
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {tx.status === 'successful' ? '✓' : tx.status === 'failed' ? '✕' : '⏳'}
                        </div>
                        <div>
                          <span className="text-xs font-bold block" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                            {tx.type === 'subscription' ? 'اشتراک پریمیوم' : tx.type === 'nfc_card' ? 'خرید کارت NFC' : tx.type}
                          </span>
                          {tx.description && (
                            <span className="text-[10px] block truncate max-w-[170px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                              {tx.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          tx.status === 'successful'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : tx.status === 'failed'
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {tx.status === 'successful'
                          ? 'موفق'
                          : tx.status === 'failed'
                          ? 'ناموفق'
                          : 'در انتظار پرداخت'}
                      </span>
                    </div>

                    <div
                      className="pt-2 border-t flex items-center justify-between text-xs"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
                    >
                      <span className="font-bold font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                        {(tx.amount || 0).toLocaleString('en-US')} {tx.currency || 'AFN'}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatSmartDate(tx.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Liquid Glass Floating Telegram Bottom Navigation */}
      <TelegramBottomNav activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}
