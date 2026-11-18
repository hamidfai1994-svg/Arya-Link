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
  LayoutDashboard,
  FileEdit,
  Bell,
  Save,
  Send,
  Crown,
  BadgeCheck,
} from 'lucide-react';
import { formatSmartDate } from '@/lib/utils/date';
import TelegramBottomNav, { NavItem } from '@/components/navigation/TelegramBottomNav';
import { TwaAnalyticsCharts, TimelinePoint, DevicePoint } from '@/components/twa/TwaAnalyticsCharts';

interface AdminStats {
  totalProfiles: number;
  totalUsers?: number;
  totalMessages: number;
  totalOrders?: number;
  totalRevenue?: number;
  platformTotalViews?: number;
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
  isVerified?: boolean;
  planType?: string;
  createdAt: string;
}

interface AdminOrder {
  _id: string;
  orderNumber?: string;
  orderType: string;
  price: number;
  currency?: string;
  status: string;
  paymentStatus?: string;
  customerName?: string;
  paymentMethod?: string;
  deliveryFee?: number;
  deliveryCompany?: string;
  isDeliverySettled?: boolean;
  createdAt: string;
}

interface AdminTransaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  currency?: string;
  description?: string;
  createdAt: string;
}

interface CmsSummary {
  heroTitlePart1?: string;
  heroTitleHighlight?: string;
  heroTitlePart2?: string;
  heroSubtitle?: string;
  faqsCount?: number;
  slidersCount?: number;
  blogPostsCount?: number;
}

export type AdminTabId = 'finance' | 'orders' | 'cms' | 'users' | 'dashboard';

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { id: 'finance', label: 'مالی', icon: Wallet },
  { id: 'orders', label: 'سفارشات', icon: ShoppingCart },
  { id: 'cms', label: 'محتوا', icon: FileEdit },
  { id: 'users', label: 'کاربران', icon: Users },
  { id: 'dashboard', label: 'پیشخوان', icon: LayoutDashboard },
] as const;

export default function AdminTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');
  const [slideDirection, setSlideDirection] = useState<number>(0);

  const TABS_ORDER: AdminTabId[] = ['finance', 'orders', 'cms', 'users', 'dashboard'];

  const getTgWebApp = () => (typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null);

  const handleTabChange = (newTab: AdminTabId) => {
    const oldIdx = TABS_ORDER.indexOf(activeTab);
    const newIdx = TABS_ORDER.indexOf(newTab);
    if (newIdx !== oldIdx) {
      setSlideDirection(newIdx > oldIdx ? 1 : -1);
      setActiveTab(newTab);
      getTgWebApp()?.HapticFeedback?.selectionChanged();
    }
  };

  const handleSwipeEnd = (
    offset: { x: number; y: number },
    velocity: { x: number; y: number }
  ) => {
    if (Math.abs(offset.y) > Math.abs(offset.x) * 1.5) return;

    const swipeThreshold = 55;
    const velocityThreshold = 280;
    const currentIdx = TABS_ORDER.indexOf(activeTab);

    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      if (currentIdx > 0) {
        setSlideDirection(-1);
        setActiveTab(TABS_ORDER[currentIdx - 1]);
        getTgWebApp()?.HapticFeedback?.selectionChanged();
      }
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      if (currentIdx < TABS_ORDER.length - 1) {
        setSlideDirection(1);
        setActiveTab(TABS_ORDER[currentIdx + 1]);
        getTgWebApp()?.HapticFeedback?.selectionChanged();
      }
    }
  };

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [viewsTimeline, setViewsTimeline] = useState<TimelinePoint[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DevicePoint[]>([]);
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<AdminTransaction[]>([]);
  const [cmsSummary, setCmsSummary] = useState<CmsSummary>({});
  const [limit, setLimit] = useState(8);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [updatingProfileId, setUpdatingProfileId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [settlingOrderId, setSettlingOrderId] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // CMS & Broadcast form states
  const [heroTitleHighlight, setHeroTitleHighlight] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [cmsSavedMsg, setCmsSavedMsg] = useState('');

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastToTelegram, setBroadcastToTelegram] = useState(true);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState('');

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
        setViewsTimeline(data.viewsTimeline || []);
        setDeviceBreakdown(data.deviceBreakdown || []);
        setRecentProfiles(data.recentProfiles || []);
        setRecentOrders(data.recentOrders || []);
        setRecentTransactions(data.recentTransactions || []);
        if (data.cmsSummary) {
          setCmsSummary(data.cmsSummary);
          setHeroTitleHighlight(data.cmsSummary.heroTitleHighlight || '');
          setHeroSubtitle(data.cmsSummary.heroSubtitle || '');
        }
        setAuthStatus('success');
      } else {
        setAuthStatus('error');
      }
    } catch {
      setAuthStatus('error');
    }
  };

  useEffect(() => {
    const tg = getTgWebApp();
    if (tg && tg.initData) {
      tg.ready();
      tg.expand();
      loadDashboardData(tg.initData, 8);
    } else {
      setAuthStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    const tg = getTgWebApp();
    if (tg && tg.initData) {
      setIsRefreshing(true);
      await loadDashboardData(tg.initData, limit);
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    const tg = getTgWebApp();
    if (tg && tg.initData) {
      setIsLoadingMore(true);
      const nextLimit = limit + 6;
      setLimit(nextLimit);
      await loadDashboardData(tg.initData, nextLimit);
      setIsLoadingMore(false);
    }
  };

  const handleToggleUserStatus = async (profileId: string) => {
    const tg = getTgWebApp();
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
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        tg.showAlert?.(data.error || 'خطا در تغییر وضعیت کاربر');
      }
    } finally {
      setUpdatingProfileId(null);
    }
  };

  const handleToggleUserVerify = async (profileId: string) => {
    const tg = getTgWebApp();
    if (!tg || !tg.initData) return;

    setUpdatingProfileId(profileId);
    try {
      const res = await fetch('/api/twa/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'toggleUserVerify',
          profileId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setRecentProfiles((prev) =>
          prev.map((p) => (p._id === profileId ? { ...p, isVerified: data.isVerified } : p))
        );
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        tg.showAlert?.(data.error || 'خطا در تغییر وضعیت تایید هویت');
      }
    } finally {
      setUpdatingProfileId(null);
    }
  };

  const handleChangeUserPlan = async (profileId: string, planType: string) => {
    const tg = getTgWebApp();
    if (!tg || !tg.initData) return;

    setUpdatingProfileId(profileId);
    try {
      const res = await fetch('/api/twa/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'updateUserPlan',
          profileId,
          payload: { planType },
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setRecentProfiles((prev) =>
          prev.map((p) => (p._id === profileId ? { ...p, planType: data.planType } : p))
        );
      }
    } finally {
      setUpdatingProfileId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const tg = getTgWebApp();
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
        tg.showAlert?.(data.error || 'خطا در تغییر وضعیت سفارش');
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSettleDelivery = async (orderId: string) => {
    const tg = getTgWebApp();
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
        tg.showAlert?.(data.error || 'خطا در ثبت تسویه');
      }
    } finally {
      setSettlingOrderId(null);
    }
  };

  const handleSaveCmsHero = async (e: React.FormEvent) => {
    e.preventDefault();
    const tg = getTgWebApp();
    if (!tg || !tg.initData) return;

    setIsSavingCms(true);
    setCmsSavedMsg('');
    try {
      const res = await fetch('/api/twa/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'updateCmsHero',
          payload: { heroTitleHighlight, heroSubtitle },
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setCmsSavedMsg(data.message || 'تغییرات محتوا ثبت گردید.');
        setTimeout(() => setCmsSavedMsg(''), 3000);
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        tg.showAlert?.(data.error || 'خطا در ذخیره محتوا');
      }
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const tg = getTgWebApp();
    if (!tg || !tg.initData) return;

    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      tg.showAlert?.('لطفاً عنوان و متن اطلاعیه همگانی را بنویسید.');
      return;
    }

    setIsSendingBroadcast(true);
    setBroadcastResult('');
    try {
      const res = await fetch('/api/twa/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'broadcastNotification',
          payload: {
            title: broadcastTitle.trim(),
            message: broadcastMessage.trim(),
            sendToTelegram: broadcastToTelegram,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setBroadcastResult(data.message);
        setBroadcastTitle('');
        setBroadcastMessage('');
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        tg.showAlert?.(data.error || 'خطا در ارسال اعلان همگانی');
      }
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const filteredProfiles = recentProfiles.filter((p) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase().trim();
    return (
      (p.displayName || '').toLowerCase().includes(q) ||
      (p.alias || '').toLowerCase().includes(q) ||
      (p.headline || '').toLowerCase().includes(q)
    );
  });

  const codSettlements = recentOrders.filter(
    (o) => (o.paymentMethod === 'cod' || o.paymentMethod === 'Cash on Delivery') && !o.isDeliverySettled
  );
  const onlineSettlements = recentOrders.filter(
    (o) => o.paymentMethod !== 'cod' && o.paymentMethod !== 'Cash on Delivery' && !o.isDeliverySettled
  );

  const cardSurfaceStyle = {
    backgroundColor: 'var(--tg-card-bg, rgba(15, 23, 42, 0.72))',
    borderColor: 'var(--tg-card-border, rgba(255, 255, 255, 0.09))',
  };

  if (authStatus === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[75vh] gap-3 p-4 font-sans text-center"
      >
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--tg-theme-button-color, #0ea5e9)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
          در حال راستی‌آزمایی امن سوپر ادمین...
        </p>
        <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
          احراز هویت رمزنگاری‌شده تلگرام (TMA)
        </span>
      </motion.div>
    );
  }

  if (authStatus === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[75vh] gap-3 p-6 font-sans text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-rose-500">دسترسی غیرمجاز به مرکز فرماندهی</h2>
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
          این مینی‌اپ اختصاصی مدیران پلتفرم است و باید پس از اتصال حساب مدیریت در پنل وب، از داخل ربات ادمین بازگشایی گردد.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-4 pb-32 space-y-4 font-sans select-none max-w-md mx-auto overflow-x-hidden"
      dir="rtl"
    >
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
              Super Admin Mini App
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl transition-all active:scale-95 border cursor-pointer"
          style={{
            ...cardSurfaceStyle,
            color: 'var(--tg-theme-hint-color, #94a3b8)',
          }}
          title="تازه‌سازی معلومات"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Animated Content Area */}
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
              center: { x: 0, opacity: 1 },
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
            dragElastic={0.18}
            onDragEnd={(e, info) => handleSwipeEnd(info.offset, info.velocity)}
            className="w-full space-y-4 touch-pan-y"
          >
            {/* =========================================================
                TAB 1: پیشخوان آمار و نمودارهای گرافیکی Recharts
               ========================================================= */}
            {activeTab === 'dashboard' && (
              <>
                <div className="p-4 rounded-2xl border relative overflow-hidden" style={cardSurfaceStyle}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500">نشست امن مدیریت تایید شد</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                    آمار زنده پلتفرم، مدیریت کاربران، ویرایش محتوا و سفارشات بدون نیاز به نسخه وب در دسترس شماست.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border space-y-1.5" style={cardSurfaceStyle}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                        کاربران و کارت‌ها
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      {(stats?.totalProfiles ?? 0).toLocaleString('en-US')}
                    </div>
                    <span className="text-[10px] text-emerald-500 font-bold block">
                      {stats?.totalUsers ?? stats?.totalProfiles ?? 0} حساب ثبت‌شده
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl border space-y-1.5" style={cardSurfaceStyle}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                        سفارشات و پیام‌ها
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      {(stats?.totalMessages ?? 0).toLocaleString('en-US')}
                    </div>
                    <span className="text-[10px] text-sky-400 font-bold block">
                      {stats?.totalOrders ?? 0} سفارش ثبت‌شده
                    </span>
                  </div>
                </div>

                {/* Recharts Line + Donut Charts */}
                <TwaAnalyticsCharts
                  viewsTimeline={viewsTimeline}
                  deviceBreakdown={deviceBreakdown}
                  timelineTitle="بازدید کل پلتفرم و ثبت‌نام‌ها (۷ روز اخیر)"
                  primaryLabel="بازدید کارت‌ها"
                  secondaryLabel="ثبت‌نام‌ها"
                  secondaryKey="registrations"
                />
              </>
            )}

            {/* =========================================================
                TAB 2: مدیریت کاربران (وضعیت، تیک آبی و اشتراک)
               ========================================================= */}
            {activeTab === 'users' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      مدیریت کاربران و پروفایل‌ها
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                      {filteredProfiles.length} مورد
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="جستجوی نام، آیدی یا تخصص کاربر..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full border rounded-xl py-2 pr-9 pl-3 text-xs outline-none focus:border-cyan-500 bg-transparent"
                      style={{
                        borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))',
                        color: 'var(--tg-theme-text-color, #f8fafc)',
                      }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {filteredProfiles.length === 0 ? (
                  <div className="p-6 rounded-2xl border text-center text-xs" style={cardSurfaceStyle}>
                    کاربری با این مشخصات یافت نگردید.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredProfiles.map((p) => (
                      <div key={p._id} className="p-3.5 rounded-2xl border space-y-2.5 shadow-xs" style={cardSurfaceStyle}>
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0 font-bold text-sm bg-white/5">
                              {p.avatarUrl ? (
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
                                {p.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
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
                              <span className="text-[10px] font-mono block truncate" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                                @{p.alias} • {p.headline || 'کارت هوشمند'}
                              </span>
                            </div>
                          </div>

                          <span className="flex items-center gap-1 text-[10px] shrink-0" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatSmartDate(p.createdAt)}</span>
                          </span>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
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

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Plan Selector */}
                            <select
                              value={p.planType || 'free'}
                              disabled={updatingProfileId === p._id}
                              onChange={(e) => handleChangeUserPlan(p._id, e.target.value)}
                              className="py-1 px-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold cursor-pointer"
                            >
                              <option value="free" className="bg-slate-900">FREE</option>
                              <option value="pro" className="bg-slate-900">PRO</option>
                              <option value="vip" className="bg-slate-900">VIP</option>
                            </select>

                            {/* Verify Toggle */}
                            <button
                              type="button"
                              disabled={updatingProfileId === p._id}
                              onClick={() => handleToggleUserVerify(p._id)}
                              className={`py-1 px-2 rounded-xl border flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                                p.isVerified
                                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                                  : 'bg-white/5 border-white/10 text-slate-400'
                              }`}
                              title="اعطا یا لغو تیک آبی"
                            >
                              <BadgeCheck className="w-3 h-3" />
                              <span>تیک</span>
                            </button>

                            {/* Block / Activate Toggle */}
                            <button
                              type="button"
                              disabled={updatingProfileId === p._id}
                              onClick={() => handleToggleUserStatus(p._id)}
                              className={`py-1 px-2 rounded-xl border flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
                                p.isActive === false
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                              }`}
                            >
                              {p.isActive === false ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                              <span>{p.isActive === false ? 'فعال‌سازی' : 'مسدود'}</span>
                            </button>

                            <a
                              href={`/${p.alias}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl border border-sky-500/30 bg-sky-500/15 text-sky-400"
                              title="مشاهده کارت"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}

                    {recentProfiles.length >= limit && (
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        style={cardSurfaceStyle}
                      >
                        {isLoadingMore ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                        <span>بارگذاری کاربران بیشتر</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =========================================================
                TAB 3: مدیریت محتوا و اعلان همگانی (CMS & Broadcast)
               ========================================================= */}
            {activeTab === 'cms' && (
              <div className="space-y-4 pt-1">
                {/* Summary Strip */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-2xl border text-center" style={cardSurfaceStyle}>
                    <span className="text-lg font-black font-mono text-cyan-400 block">
                      {cmsSummary.slidersCount ?? 0}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                      اسلایدرها
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl border text-center" style={cardSurfaceStyle}>
                    <span className="text-lg font-black font-mono text-emerald-400 block">
                      {cmsSummary.faqsCount ?? 0}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                      سوالات FAQ
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl border text-center" style={cardSurfaceStyle}>
                    <span className="text-lg font-black font-mono text-amber-400 block">
                      {cmsSummary.blogPostsCount ?? 0}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                      مقالات بلاگ
                    </span>
                  </div>
                </div>

                {/* Edit Landing Hero Content */}
                <form onSubmit={handleSaveCmsHero} className="p-4 rounded-2xl border space-y-3" style={cardSurfaceStyle}>
                  <div className="flex items-center gap-2 text-cyan-500">
                    <FileEdit className="w-4 h-4" />
                    <h3 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      ویرایش سریع محتوای صفحه نخست (Hero CMS)
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                        تیتر برجسته لندینگ پیج
                      </label>
                      <input
                        type="text"
                        value={heroTitleHighlight}
                        onChange={(e) => setHeroTitleHighlight(e.target.value)}
                        className="w-full h-10 rounded-xl border px-3 text-xs bg-transparent focus:outline-none focus:border-cyan-500"
                        style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                        توضیحات زیرتیتر صفحه نخست
                      </label>
                      <textarea
                        rows={3}
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        className="w-full rounded-xl border p-3 text-xs bg-transparent focus:outline-none focus:border-cyan-500 resize-none"
                        style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                      />
                    </div>

                    {cmsSavedMsg && (
                      <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                        {cmsSavedMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingCms}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSavingCms ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>ذخیره محتوای صفحه نخست</span>
                    </button>
                  </div>
                </form>

                {/* Broadcast Notification Form */}
                <form onSubmit={handleSendBroadcast} className="p-4 rounded-2xl border space-y-3" style={cardSurfaceStyle}>
                  <div className="flex items-center gap-2 text-amber-400">
                    <Bell className="w-4 h-4" />
                    <h3 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      ارسال اعلان همگانی به کاربران
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="عنوان اطلاعیه (مثال: تخفیف ویژه کارت‌های فلزی)"
                      className="w-full h-10 rounded-xl border px-3 text-xs bg-transparent focus:outline-none focus:border-amber-500"
                      style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                    />
                    <textarea
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="متن کامل اعلان برای زنگوله داشبورد و تلگرام..."
                      className="w-full rounded-xl border p-3 text-xs bg-transparent focus:outline-none focus:border-amber-500 resize-none"
                      style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                    />

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                      <span className="text-[11px] font-semibold">ارسال همزمان در ربات تلگرام کاربران</span>
                      <input
                        type="checkbox"
                        checked={broadcastToTelegram}
                        onChange={(e) => setBroadcastToTelegram(e.target.checked)}
                        className="accent-cyan-500 w-4 h-4"
                      />
                    </label>

                    {broadcastResult && (
                      <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                        {broadcastResult}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSendingBroadcast}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSendingBroadcast ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>ارسال اطلاعیه همگانی</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =========================================================
                TAB 4: مدیریت سفارشات
               ========================================================= */}
            {activeTab === 'orders' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                    لیست سفارشات کارت و اشتراک‌ها
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                    {recentOrders.length} مورد
                  </span>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="p-8 rounded-2xl border text-center space-y-2 text-xs" style={cardSurfaceStyle}>
                    <ShoppingCart className="w-8 h-8 mx-auto opacity-40" />
                    <p className="font-bold">سفارشی یافت نگردید</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentOrders.map((ord) => (
                      <div key={ord._id} className="p-3.5 rounded-2xl border space-y-2.5 shadow-xs" style={cardSurfaceStyle}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                              {ord.orderType} #{ord.orderNumber}
                            </span>
                            <span className="text-[10px] block truncate" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                              خریدار: {ord.customerName || 'مشتری'}
                            </span>
                          </div>

                          <select
                            value={ord.status || 'pending'}
                            disabled={updatingOrderId === ord._id}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-white/15 bg-slate-900/70 text-white cursor-pointer"
                          >
                            <option value="pending_payment">در انتظار پرداخت</option>
                            <option value="processing">در حال پردازش</option>
                            <option value="nfc_writing">کدنویسی NFC</option>
                            <option value="shipped">ارسال‌شده</option>
                            <option value="completed">تکمیل‌شده</option>
                            <option value="cancelled">لغو / رد شده</option>
                          </select>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="font-bold font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                            {(ord.price || 0).toLocaleString('en-US')} {ord.currency || 'AFN'}
                          </span>
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatSmartDate(ord.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =========================================================
                TAB 5: امور مالی و تسویه پیک
               ========================================================= */}
            {activeTab === 'finance' && (
              <div className="space-y-4 pt-1">
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
                      <span>مجموع عواید کل پلتفرم</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      زنده
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-3xl font-black font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      {(stats?.totalRevenue ?? 0).toLocaleString('en-US')}
                    </span>
                    <span className="text-xs font-bold text-sky-400">افغانی</span>
                  </div>
                </div>

                {/* Delivery Settlements */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      تسویه حساب شرکت دلیوری ({codSettlements.length + onlineSettlements.length})
                    </h3>
                  </div>

                  {[...codSettlements, ...onlineSettlements].length === 0 ? (
                    <div className="p-4 rounded-2xl border text-center text-[11px]" style={cardSurfaceStyle}>
                      سفارش تسویه‌نشده‌ای وجود ندارد.
                    </div>
                  ) : (
                    [...codSettlements, ...onlineSettlements].map((ord) => (
                      <div key={ord._id} className="p-3 rounded-2xl border flex items-center justify-between gap-2 text-xs" style={cardSurfaceStyle}>
                        <div className="min-w-0">
                          <span className="font-bold block truncate">{ord.customerName || ord.orderType}</span>
                          <span className="text-[10px] font-mono opacity-70">
                            {(ord.price || 0).toLocaleString('en-US')} AFN
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={settlingOrderId === ord._id}
                          onClick={() => handleSettleDelivery(ord._id)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                        >
                          {settlingOrderId === ord._id ? '...' : '✔ ثبت تسویه'}
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent Transactions */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold block" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                    تراکنش‌های اخیر ({recentTransactions.length})
                  </span>
                  {recentTransactions.length === 0 ? (
                    <div className="p-6 rounded-2xl border text-center text-xs" style={cardSurfaceStyle}>
                      تراکنشی ثبت نگردیده است.
                    </div>
                  ) : (
                    recentTransactions.map((tx) => (
                      <div key={tx._id} className="p-3 rounded-2xl border flex items-center justify-between text-xs" style={cardSurfaceStyle}>
                        <div>
                          <span className="font-bold block">{tx.type}</span>
                          <span className="text-[10px] opacity-70">{formatSmartDate(tx.createdAt)}</span>
                        </div>
                        <span className="font-bold font-mono text-emerald-400">
                          {(tx.amount || 0).toLocaleString('en-US')} {tx.currency || 'AFN'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <TelegramBottomNav
        items={ADMIN_NAV_ITEMS}
        activeTab={activeTab}
        onChange={handleTabChange}
        defaultIndex={4}
      />
    </motion.div>
  );
}
