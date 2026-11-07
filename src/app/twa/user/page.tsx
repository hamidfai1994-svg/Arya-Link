'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Inbox,
  MessageSquare,
  Phone,
  Mail,
  User,
  RefreshCw,
  ExternalLink,
  Clock,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  Settings,
  Users,
  Plus,
  BarChart3,
  CreditCard,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  TrendingUp,
  Sliders,
  Send,
  Layers,
  FileText,
  DollarSign,
  Globe,
  Radio,
  Search,
} from 'lucide-react';
import { WhatsAppIcon, TelegramIcon } from '@/components/icons';
import { formatSmartDate } from '@/lib/utils/date';
import { getTelegramLink } from '@/lib/utils/phone';
import TelegramBottomNav, { NavItem } from '@/components/navigation/TelegramBottomNav';

interface UserProfileSummary {
  displayName: string;
  alias: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
}

interface UserStats {
  viewsCount: number;
  leadsCount: number;
}

interface CustomerMessage {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  status?: 'new' | 'contacted' | 'resolved';
  privateNote?: string;
  createdAt: string;
}

export type UserTabId = 'settings' | 'contacts' | 'add' | 'stats' | 'card';

// تعریف آرایه ۵ تایی منوی زیرین کاربران (چیدمان از چپ به راست در کانتینر LTR)
// ایندکس ۰: تنظیمات (سمت چپ)
// ایندکس ۱: مخاطبین
// ایندکس ۲: افزودن (دقیقاً در وسط - دکمه شناور)
// ایندکس ۳: آمار
// ایندکس ۴: کارت من (سمت راست در چیدمان فارسی)
export const USER_NAV_ITEMS: readonly NavItem[] = [
  { id: 'settings', label: 'تنظیمات', icon: Settings },
  { id: 'contacts', label: 'مخاطبین', icon: Users },
  { id: 'add', label: 'افزودن', icon: Plus },
  { id: 'stats', label: 'آمار', icon: BarChart3 },
  { id: 'card', label: 'کارت من', icon: CreditCard },
] as const;

export default function UserTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [profile, setProfile] = useState<UserProfileSummary | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentMessages, setRecentMessages] = useState<CustomerMessage[]>([]);
  const [limit, setLimit] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // استیت‌های ناوبری ۵ تایی و انیمیشن سوایپ
  // تب پیش‌فرض روی تب وسط (افزودن) یا کارت من
  const [activeTab, setActiveTab] = useState<UserTabId>('add');
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const [crmStatusFilter, setCrmStatusFilter] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const TABS_ORDER: UserTabId[] = ['settings', 'contacts', 'add', 'stats', 'card'];

  const handleTabChange = (newTab: UserTabId) => {
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
    // جلوگیری از تغییر تب در صورت غلبه اسکرول عمودی
    if (Math.abs(offset.y) > Math.abs(offset.x) * 1.5) {
      return;
    }

    const swipeThreshold = 45;
    const velocityThreshold = 250;
    const currentIdx = TABS_ORDER.indexOf(activeTab);

    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      // کشیدن به سمت چپ -> حرکت به سمت تب‌های سمت چپ (کاهش ایندکس)
      if (currentIdx > 0) {
        setSlideDirection(-1);
        setActiveTab(TABS_ORDER[currentIdx - 1]);
        if (typeof window !== 'undefined') {
          const tg = (window as any).Telegram?.WebApp;
          tg?.HapticFeedback?.selectionChanged();
        }
      }
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      // کشیدن به سمت راست -> حرکت به سمت تب‌های سمت راست (افزایش ایندکس)
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

  const handleUpdateStatus = async (
    messageId: string,
    newStatus: 'new' | 'contacted' | 'resolved'
  ) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || !tg.initData) return;

    setUpdatingMessageId(messageId);
    try {
      const res = await fetch('/api/twa/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          messageId,
          actionType: 'updateStatus',
          payload: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setRecentMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, status: newStatus } : m))
        );
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        if (tg.showAlert) tg.showAlert(data.error || 'خطا در تغییر وضعیت لید');
      }
    } catch {
      tg?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setUpdatingMessageId(null);
    }
  };

  const handleUpdateNote = async (messageId: string) => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg || !tg.initData) return;

    const currentMsg = recentMessages.find((m) => m._id === messageId);
    const noteValue =
      noteDrafts[messageId] !== undefined
        ? noteDrafts[messageId]
        : currentMsg?.privateNote || '';

    setSavingNoteId(messageId);
    try {
      const res = await fetch('/api/twa/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          messageId,
          actionType: 'updateNote',
          payload: noteValue.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setRecentMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, privateNote: noteValue.trim() } : m
          )
        );
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        if (tg.showAlert) tg.showAlert(data.error || 'خطا در ذخیره یادداشت');
      }
    } catch {
      tg?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setSavingNoteId(null);
    }
  };

  const loadUserData = async (initData: string, currentLimit: number = limit) => {
    try {
      const res = await fetch(`/api/twa/dashboard?limit=${currentLimit}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, type: 'user', limit: currentLimit }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setStats(data.stats);
        setRecentMessages(data.recentMessages || []);
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
      loadUserData(tg.initData, 5);
    } else {
      setAuthStatus('error');
    }
  }, []);

  const handleRefresh = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      setIsRefreshing(true);
      await loadUserData(tg.initData, limit);
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      setIsLoadingMore(true);
      const nextLimit = limit + 5;
      setLimit(nextLimit);
      await loadUserData(tg.initData, nextLimit);
      setIsLoadingMore(false);
    }
  };

  const copyCardLink = () => {
    if (!profile?.alias) return;
    const url = `https://aryal.ink/${profile.alias}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      const tg = (window as any).Telegram?.WebApp;
      tg?.HapticFeedback?.notificationOccurred('success');
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 p-4 font-sans text-center">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--tg-theme-button-color, #0ea5e9)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
          در حال بارگذاری داشبورد کارت شما...
        </p>
        <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
          همگام‌سازی ابری با ربات تلگرام
        </span>
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 p-6 font-sans text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-amber-500">پروفایل یافت نشد یا دسترسی نامعتبر است</h2>
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
          لطفاً مطمئن شوید که شناسه تلگرام خود را در تنظیمات کارت خود در سایت آریا لینک ثبت کرده‌اید و مینی‌اپ را از طریق ربات باز نموده‌اید.
        </p>
      </div>
    );
  }

  const cleanDigits = (phoneStr?: string) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/[^0-9]/g, '');
  };

  const filteredContacts = recentMessages.filter((msg) => {
    const matchesStatus = crmStatusFilter === 'all' || msg.status === crmStatusFilter;
    const matchesSearch =
      !contactSearchQuery ||
      msg.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      (msg.phone && msg.phone.includes(contactSearchQuery)) ||
      msg.message.toLowerCase().includes(contactSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // کاتالوگ ماژول‌های کارت ویزیت هوشمند (برای تب افزودن)
  const MODULE_CATALOG = [
    {
      id: 'phone',
      title: 'تماس مستقیم',
      category: 'تماس و ارتباطات',
      icon: Phone,
      color: 'from-emerald-500 to-teal-600',
      desc: 'شماره همراه برای تماس با یک کلیک',
    },
    {
      id: 'whatsapp',
      title: 'پیام واتساپ',
      category: 'تماس و ارتباطات',
      icon: WhatsAppIcon,
      color: 'from-green-500 to-emerald-600',
      desc: 'لینک مستقیم شروع چت در واتساپ',
    },
    {
      id: 'telegram',
      title: 'آیدی تلگرام',
      category: 'شبکه‌های اجتماعی',
      icon: TelegramIcon,
      color: 'from-sky-500 to-blue-600',
      desc: 'لینک مستقیم کانال، گروه یا پیوی',
    },
    {
      id: 'email',
      title: 'پست الکترونیک',
      category: 'تماس و ارتباطات',
      icon: Mail,
      color: 'from-rose-500 to-pink-600',
      desc: 'آدرس ایمیل کاری و ارسال مستقیم',
    },
    {
      id: 'lead_form',
      title: 'فرم جذب لید',
      category: 'فرم و تعامل',
      icon: FileText,
      color: 'from-cyan-500 to-blue-600',
      desc: 'دریافت مشخصات و پیام بازدیدکنندگان',
    },
    {
      id: 'payment',
      title: 'شماره کارت / پرداخت',
      category: 'مالی و فروش',
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
      desc: 'کپی آسان شماره کارت یا درگاه پرداخت',
    },
    {
      id: 'website',
      title: 'وبسایت شخصی',
      category: 'شبکه‌های اجتماعی',
      icon: Globe,
      color: 'from-indigo-500 to-purple-600',
      desc: 'لینک اختصاصی به سایت یا پورتفولیو',
    },
    {
      id: 'catalog',
      title: 'کاتالوگ و فایل PDF',
      category: 'مالی و فروش',
      icon: Layers,
      color: 'from-violet-500 to-fuchsia-600',
      desc: 'دانلود مستقیم رزومه، بروشور یا منو',
    },
  ];

  return (
    <div className="p-4 pb-32 space-y-4 font-sans select-none max-w-md mx-auto overflow-x-hidden" dir="rtl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl overflow-hidden border flex items-center justify-center shrink-0 font-bold text-base shadow-xs"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--tg-theme-text-color, #f8fafc)',
            }}
          >
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.displayName?.trim().charAt(0) || <User className="w-5 h-5" />}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold truncate max-w-[180px]" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                {profile?.displayName || 'کارت هوشمند من'}
              </h1>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            {profile?.alias && (
              <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                <span>aryal.ink/{profile.alias}</span>
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl transition-all active:scale-95 border cursor-pointer"
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

      {/* کانتینر اصلی دارای انیمیشن انتقال اسلاید و قابلیت لمسی Swipe */}
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
            {/* =========================================================
                تب ۱: کارت من (نمای پیشرفته کارت و اشتراک‌گذاری)
               ========================================================= */}
            {activeTab === 'card' && (
              <div className="space-y-4">
                {/* کارت شیشه‌ای دیجیتال */}
                <div className="relative rounded-3xl p-5 border overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-cyan-950/40 border-cyan-500/20 shadow-xl shadow-cyan-950/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between relative z-10 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl border-2 border-cyan-400/30 overflow-hidden shadow-md">
                        {profile?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-lg text-cyan-400">
                            {profile?.displayName?.charAt(0) || 'A'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-base font-bold text-white">{profile?.displayName || 'نام شما'}</h2>
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <p className="text-xs text-slate-400">{profile?.headline || 'کارت هوشمند NFC آریا لینک'}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                      NFC فعال
                    </span>
                  </div>

                  {profile?.bio && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10">
                      {profile.bio}
                    </p>
                  )}

                  {/* دکمه‌های سریع عملیات کارت */}
                  <div className="grid grid-cols-2 gap-2 relative z-10 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={copyCardLink}
                      className="h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'کپی شد!' : 'کپی لینک کارت'}</span>
                    </button>

                    {profile?.alias && (
                      <a
                        href={`https://aryal.ink/${profile.alias}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                      >
                        <span>مشاهده صفحه</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* وضعیت NFC و تعامل */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Radio className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">انتقال آنی NFC</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      کافیست کارت یا چیپ را به پشت هر گوشی لمس دهید تا این صفحه فوراً باز شود.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">بازدید امروز</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      +{Math.round((stats?.viewsCount || 0) * 0.15)}
                    </div>
                    <span className="text-[10px] text-slate-400">نرخ رشد بازدیدهای هفتگی</span>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                تب ۲: آمار و تحلیل (چارت‌ها و ویوها)
               ========================================================= */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {/* کارت‌های شاخص کلیدی (KPIs) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-cyan-500/20 bg-slate-900/60 shadow-md">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-medium">کل بازدیدهای کارت</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-white">
                      {stats?.viewsCount !== undefined ? stats.viewsCount : '0'}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">↑ ۱۸٪ افزایش در ۷ روز اخیر</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-emerald-500/20 bg-slate-900/60 shadow-md">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                      <Inbox className="w-4 h-4" />
                      <span className="text-xs font-medium">مخاطبین و لیدها</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-white">
                      {stats?.leadsCount !== undefined ? stats.leadsCount : '0'}
                    </div>
                    <span className="text-[10px] text-slate-400">پیام‌های دریافتی CRM</span>
                  </div>
                </div>

                {/* نمودار میله‌ای ترافیک و تعامل هفتگی */}
                <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold text-white">نمودار بازدید روزانه (۷ روز اخیر)</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">میانگین روزانه</span>
                  </div>

                  {/* شبیه‌ساز چارت میله‌ای با انیمیشن SVG/CSS */}
                  <div className="pt-4 pb-2 flex items-end justify-between gap-2 h-36 px-1">
                    {[
                      { day: 'ش', value: 45 },
                      { day: 'ی', value: 70 },
                      { day: 'د', value: 55 },
                      { day: 'س', value: 90 },
                      { day: 'چ', value: 65 },
                      { day: 'پ', value: 100 },
                      { day: 'ج', value: 80 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {Math.round((item.value / 100) * Math.max(10, (stats?.viewsCount || 50) * 0.3))}
                        </span>
                        <div
                          className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-500 group-hover:from-cyan-400 group-hover:to-teal-300"
                          style={{ height: `${item.value}%` }}
                        />
                        <span className="text-[10px] font-medium text-slate-400">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* منابع ورودی ترافیک */}
                <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-3">
                  <h3 className="text-xs font-bold text-white mb-2">کانال‌های اتصال به کارت</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'لمس مستقیم چیپ NFC', pct: '62%', count: 'NFC Tap', color: 'bg-cyan-500' },
                      { name: 'اسکن کد QR روی کارت', pct: '24%', count: 'QR Code', color: 'bg-blue-500' },
                      { name: 'شبکه‌های اجتماعی و لینک مستقیم', pct: '14%', count: 'Direct Link', color: 'bg-teal-500' },
                    ].map((ch, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">{ch.name}</span>
                          <span className="font-mono font-bold text-cyan-400">{ch.pct}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className={`h-full rounded-full ${ch.color}`} style={{ width: ch.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                تب ۳: افزودن ماژول (تب وسط - کاتالوگ ماژول‌ها)
               ========================================================= */}
            {activeTab === 'add' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-slate-900/60 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-1 text-cyan-400">
                    <Plus className="w-4 h-4" />
                    <h2 className="text-sm font-bold text-white">کاتالوگ ماژول‌های کارت</h2>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    با افزودن هر ماژول، کارت ویزیت هوشمند شما مجهزتر شده و تعامل مخاطبان افزایش می‌یابد.
                  </p>
                </div>

                {/* لیست ماژول‌ها برای اضافه کردن */}
                <div className="grid grid-cols-1 gap-2.5">
                  {MODULE_CATALOG.map((mod) => {
                    const ModIcon = mod.icon;
                    return (
                      <div
                        key={mod.id}
                        className="p-3.5 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                            <ModIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-white">{mod.title}</h3>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                                {mod.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{mod.desc}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModule(mod.title);
                            const tg = (window as any).Telegram?.WebApp;
                            tg?.HapticFeedback?.notificationOccurred('success');
                            if (tg?.showAlert) {
                              tg.showAlert(`ماژول "${mod.title}" در نسخه وب در دسترس است و به زودی به مینی‌اپ متصل می‌شود.`);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>افزودن</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================
                تب ۴: مخاطبین و CRM (لیست لیدها، تماس و یادداشت‌گذاری)
               ========================================================= */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {/* نوار جستجو و فیلتر وضعیت */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      placeholder="جستجو در نام، شماره یا پیام..."
                      className="w-full h-10 rounded-xl bg-slate-900/60 border border-white/10 text-xs px-9 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {[
                      { id: 'all', label: 'همه لیدها' },
                      { id: 'new', label: 'جدید' },
                      { id: 'contacted', label: 'تماس گرفته' },
                      { id: 'resolved', label: 'تکمیل شده' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCrmStatusFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          crmStatusFilter === tab.id
                            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                            : 'bg-slate-900/40 text-slate-400 border border-white/5 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* لیست لیدها */}
                {filteredContacts.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-white/10 bg-slate-900/40 text-center space-y-2">
                    <Inbox className="w-8 h-8 mx-auto text-slate-500" />
                    <p className="text-xs text-slate-400">هیچ پیامی با این مشخصات یافت نشد.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredContacts.map((msg) => (
                      <div
                        key={msg._id}
                        className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 space-y-3"
                      >
                        {/* هدر لید */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">{msg.name}</h3>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  msg.status === 'resolved'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : msg.status === 'contacted'
                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {msg.status === 'resolved'
                                  ? 'تکمیل شده'
                                  : msg.status === 'contacted'
                                  ? 'تماس گرفته'
                                  : 'جدید'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatSmartDate(msg.createdAt)}</span>
                            </span>
                          </div>

                          {/* تغییر وضعیت لید */}
                          <select
                            value={msg.status || 'new'}
                            onChange={(e) =>
                              handleUpdateStatus(
                                msg._id,
                                e.target.value as 'new' | 'contacted' | 'resolved'
                              )
                            }
                            disabled={updatingMessageId === msg._id}
                            className="text-xs bg-slate-800 border border-white/10 rounded-xl px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="new">جدید</option>
                            <option value="contacted">تماس گرفته</option>
                            <option value="resolved">تکمیل شده</option>
                          </select>
                        </div>

                        {/* متن پیام */}
                        <p className="text-xs text-slate-200 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                          {msg.message}
                        </p>

                        {/* دکمه‌های اقدام سریع (تماس، واتساپ، تلگرام) */}
                        <div className="flex items-center gap-2 pt-1">
                          {msg.phone && (
                            <>
                              <a
                                href={`tel:${cleanDigits(msg.phone)}`}
                                className="h-8 px-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 hover:bg-cyan-500/25 transition-all"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>تماس</span>
                              </a>

                              <a
                                href={`https://wa.me/${cleanDigits(msg.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 px-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/25 transition-all"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                                <span>واتساپ</span>
                              </a>
                            </>
                          )}

                          {msg.email && (
                            <a
                              href={`mailto:${msg.email}`}
                              className="h-8 px-2.5 rounded-xl bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-1 hover:bg-slate-700 transition-all"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>ایمیل</span>
                            </a>
                          )}
                        </div>

                        {/* بخش یادداشت اختصاصی مدیر */}
                        <div className="pt-2 border-t border-white/5 space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 block">یادداشت خصوصی:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={
                                noteDrafts[msg._id] !== undefined
                                  ? noteDrafts[msg._id]
                                  : msg.privateNote || ''
                              }
                              onChange={(e) =>
                                setNoteDrafts((prev) => ({
                                  ...prev,
                                  [msg._id]: e.target.value,
                                }))
                              }
                              placeholder="افزودن یادداشت درباره این مخاطب..."
                              className="flex-1 h-9 rounded-xl bg-slate-800/80 border border-white/10 text-xs px-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateNote(msg._id)}
                              disabled={savingNoteId === msg._id}
                              className="h-9 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {savingNoteId === msg._id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <span>ذخیره</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* دکمه بارگذاری بیشتر */}
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="h-10 px-4 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all cursor-pointer"
                      >
                        {isLoadingMore ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>بارگذاری پیام‌های قدیمی‌تر</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================
                تب ۵: تنظیمات حساب و کارت
               ========================================================= */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 space-y-3">
                  <div className="flex items-center gap-2 mb-1 text-cyan-400">
                    <Settings className="w-4 h-4" />
                    <h3 className="text-xs font-bold text-white">تنظیمات کارت و اشتراک</h3>
                  </div>

                  <div className="divide-y divide-white/5 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-400">شناسه کارت (آدرس اینترنتی):</span>
                      <span className="font-mono text-cyan-400 font-bold">aryal.ink/{profile?.alias || '—'}</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-400">طرح اشتراک:</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        طرح پیشرفته (PRO)
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-400">حالت هدایت مستقیم (Direct Mode):</span>
                      <span className="text-slate-500 font-mono text-[11px]">غیرفعال</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-400">همگام‌سازی اعلان‌های تلگرام:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>فعال و متصل</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* پشتیبانی و راهنما */}
                <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/40 text-center space-y-2">
                  <h4 className="text-xs font-bold text-white">نیاز به راهنمایی یا سفارشی‌سازی کارت دارید؟</h4>
                  <p className="text-[11px] text-slate-400">
                    تیم پشتیبانی فنی آریا لینک ۲۴ ساعته در تلگرام پاسخگوی شماست.
                  </p>
                  <a
                    href="https://t.me/aryalink_support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:underline pt-1"
                  >
                    <span>ارتباط با پشتیبانی تلگرام</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* منوی زیرین شیشه‌ای داینامیک ۵ تایی با دکمه شناور روی تب وسط */}
      <TelegramBottomNav
        items={USER_NAV_ITEMS}
        activeTab={activeTab}
        onChange={handleTabChange}
        defaultIndex={2}
      />
    </div>
  );
}
