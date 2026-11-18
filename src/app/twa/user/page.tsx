'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Inbox,
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
  Copy,
  Check,
  TrendingUp,
  Send,
  Layers,
  FileText,
  DollarSign,
  Globe,
  Radio,
  Search,
  Scan,
  Link2,
  Trash2,
  Save,
  MousePointerClick,
  Edit3,
  X,
} from 'lucide-react';
import { WhatsAppIcon, TelegramIcon } from '@/components/icons';
import { formatSmartDate } from '@/lib/utils/date';
import { getBaseUrl, getBaseDomain } from '@/lib/base-url';
import TelegramBottomNav, { NavItem } from '@/components/navigation/TelegramBottomNav';
import { CardOcrScannerModal, ScannedContactData } from '@/components/common/CardOcrScannerModal';
import { TwaAnalyticsCharts, TimelinePoint, DevicePoint } from '@/components/twa/TwaAnalyticsCharts';

interface ProfileLinkSummary {
  id: string;
  title: string;
  url: string;
  moduleType: string;
  isActive: boolean;
  clickCount: number;
}

interface UserProfileSummary {
  id?: string;
  displayName: string;
  alias: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  phone?: string;
  email?: string;
  location?: string;
  directModeEnabled?: boolean;
  directModeUrl?: string;
  planType?: string;
  isVerified?: boolean;
  links?: ProfileLinkSummary[];
}

interface UserStats {
  viewsCount: number;
  leadsCount: number;
  clicksCount?: number;
  ctr?: number;
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

export const USER_NAV_ITEMS: readonly NavItem[] = [
  { id: 'settings', label: 'تنظیمات', icon: Settings },
  { id: 'contacts', label: 'مخاطبین', icon: Users },
  { id: 'add', label: 'لینک‌ها', icon: Link2 },
  { id: 'stats', label: 'آمار و ارقام', icon: BarChart3 },
  { id: 'card', label: 'کارت من', icon: CreditCard },
] as const;

export default function UserTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [profile, setProfile] = useState<UserProfileSummary | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [viewsTimeline, setViewsTimeline] = useState<TimelinePoint[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DevicePoint[]>([]);
  const [recentMessages, setRecentMessages] = useState<CustomerMessage[]>([]);
  const [limit, setLimit] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Navigation & Swipe
  const [activeTab, setActiveTab] = useState<UserTabId>('card');
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const [crmStatusFilter, setCrmStatusFilter] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isOcrOpen, setIsOcrOpen] = useState(false);

  // Bio & Info Editor States
  const [bioForm, setBioForm] = useState({
    displayName: '',
    headline: '',
    bio: '',
    phone: '',
    email: '',
    location: '',
    directModeEnabled: false,
    directModeUrl: '',
  });
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [bioSuccessMsg, setBioSuccessMsg] = useState('');

  // Link Management States
  const [linksList, setLinksList] = useState<ProfileLinkSummary[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState('standard_link');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState<ProfileLinkSummary | null>(null);
  const [busyLinkId, setBusyLinkId] = useState<string | null>(null);

  const getTgWebApp = () => (typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null);

  const handleOcrComplete = (scanned: ScannedContactData) => {
    const newMsg: CustomerMessage = {
      _id: `ocr_${Date.now()}`,
      name: scanned.name || 'مخاطب کارت ویزیت',
      phone: scanned.phone || '0000',
      email: scanned.email,
      message: scanned.notes || 'مخاطب اسکن‌شده از کارت ویزیت کاغذی',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setRecentMessages((prev) => [newMsg, ...prev]);
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: scanned.name || 'مخاطب کارت ویزیت',
        phone: scanned.phone || '0000',
        email: scanned.email,
        message: scanned.notes || 'مخاطب اسکن‌شده از کارت ویزیت کاغذی',
        profileAlias: profile?.alias,
      }),
    }).catch(() => {});
  };

  const TABS_ORDER: UserTabId[] = ['settings', 'contacts', 'add', 'stats', 'card'];

  const handleTabChange = (newTab: UserTabId) => {
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
        setViewsTimeline(data.viewsTimeline || []);
        setDeviceBreakdown(data.deviceBreakdown || []);
        setRecentMessages(data.recentMessages || []);
        setLinksList(data.profile?.links || []);
        setBioForm({
          displayName: data.profile?.displayName || '',
          headline: data.profile?.headline || '',
          bio: data.profile?.bio || '',
          phone: data.profile?.phone || '',
          email: data.profile?.email || '',
          location: data.profile?.location || '',
          directModeEnabled: Boolean(data.profile?.directModeEnabled),
          directModeUrl: data.profile?.directModeUrl || '',
        });
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
      loadUserData(tg.initData, 5);
    } else {
      setAuthStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    const tg = getTgWebApp();
    if (tg && tg.initData) {
      setIsRefreshing(true);
      await loadUserData(tg.initData, limit);
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    const tg = getTgWebApp();
    if (tg && tg.initData) {
      setIsLoadingMore(true);
      const nextLimit = limit + 5;
      setLimit(nextLimit);
      await loadUserData(tg.initData, nextLimit);
      setIsLoadingMore(false);
    }
  };

  const handleSaveBioAndInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const tg = getTgWebApp();
    if (!tg || !tg.initData) return;

    setIsSavingBio(true);
    setBioSuccessMsg('');
    try {
      const res = await fetch('/api/twa/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'updateBioAndInfo',
          payload: bioForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                displayName: bioForm.displayName,
                headline: bioForm.headline,
                bio: bioForm.bio,
                phone: bioForm.phone,
                email: bioForm.email,
                location: bioForm.location,
                directModeEnabled: bioForm.directModeEnabled,
                directModeUrl: bioForm.directModeUrl,
              }
            : prev
        );
        setBioSuccessMsg('تغییرات با موفقیت ثبت گردید.');
        setTimeout(() => setBioSuccessMsg(''), 3000);
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        tg.showAlert?.(data.error || 'خطا در ذخیره معلومات');
      }
    } catch {
      tg.HapticFeedback?.notificationOccurred('error');
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const tg = getTgWebApp();
    if (!tg || !tg.initData) return;

    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      tg.showAlert?.('لطفاً عنوان لینک و آدرس اینترنتی یا نمبر تماس را درج نمایید.');
      return;
    }

    setIsAddingLink(true);
    try {
      const res = await fetch('/api/twa/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'addLink',
          payload: {
            title: newLinkTitle.trim(),
            url: newLinkUrl.trim(),
            moduleType: newLinkType,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.link) {
        tg.HapticFeedback?.notificationOccurred('success');
        setLinksList((prev) => [...prev, data.link]);
        setNewLinkTitle('');
        setNewLinkUrl('');
      } else {
        tg.HapticFeedback?.notificationOccurred('error');
        tg.showAlert?.(data.error || 'خطا در افزودن لینک جدید');
      }
    } catch {
      tg.HapticFeedback?.notificationOccurred('error');
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleToggleLinkActive = async (link: ProfileLinkSummary) => {
    const tg = getTgWebApp();
    if (!tg || !tg.initData) return;

    setBusyLinkId(link.id);
    try {
      const nextActive = !link.isActive;
      const res = await fetch('/api/twa/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'updateLink',
          payload: { id: link.id, isActive: nextActive },
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.selectionChanged();
        setLinksList((prev) =>
          prev.map((l) => (l.id === link.id ? { ...l, isActive: nextActive } : l))
        );
      }
    } finally {
      setBusyLinkId(null);
    }
  };

  const handleSaveEditedLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const tg = getTgWebApp();
    if (!tg || !tg.initData || !editingLink) return;

    setBusyLinkId(editingLink.id);
    try {
      const res = await fetch('/api/twa/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'updateLink',
          payload: {
            id: editingLink.id,
            title: editingLink.title,
            url: editingLink.url,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setLinksList((prev) =>
          prev.map((l) => (l.id === editingLink.id ? editingLink : l))
        );
        setEditingLink(null);
      }
    } finally {
      setBusyLinkId(null);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    const tg = getTgWebApp();
    if (!tg || !tg.initData) return;

    setBusyLinkId(linkId);
    try {
      const res = await fetch('/api/twa/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg.initData,
          actionType: 'deleteLink',
          payload: { id: linkId },
        }),
      });
      const data = await res.json();
      if (data.success) {
        tg.HapticFeedback?.notificationOccurred('success');
        setLinksList((prev) => prev.filter((l) => l.id !== linkId));
      }
    } finally {
      setBusyLinkId(null);
    }
  };

  const handleUpdateStatus = async (
    messageId: string,
    newStatus: 'new' | 'contacted' | 'resolved'
  ) => {
    const tg = getTgWebApp();
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
        tg.showAlert?.(data.error || 'خطا در تغییر وضعیت مخاطب');
      }
    } catch {
      tg?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setUpdatingMessageId(null);
    }
  };

  const handleUpdateNote = async (messageId: string) => {
    const tg = getTgWebApp();
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
        tg.showAlert?.(data.error || 'خطا در ذخیره یادداشت');
      }
    } catch {
      tg?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setSavingNoteId(null);
    }
  };

  const copyCardLink = () => {
    if (!profile?.alias) return;
    const url = `${getBaseUrl()}/${profile.alias}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      getTgWebApp()?.HapticFeedback?.notificationOccurred('success');
    }
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
          در حال بارگذاری مینی‌اپ پروفایل شما...
        </p>
        <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
          راستی‌آزمایی امن و همگام‌سازی ابری با تلگرام
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
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-amber-500">پروفایل یافت نشد یا دسترسی نامعتبر است</h2>
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
          لطفاً ابتدا از طریق داشبورد وب سایت آریا لینک بالای گزینه <b>«اتصال به تلگرام»</b> کلیک نموده و ربات را استارت نمایید، سپس مینی‌اپ را از داخل تلگرام باز کنید.
        </p>
      </motion.div>
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

  const MODULE_PRESETS = [
    { id: 'phone_call', title: 'نمبر تماس', icon: Phone, color: 'from-emerald-500 to-teal-600', placeholder: 'tel:+93700000000' },
    { id: 'whatsapp_direct', title: 'واتساپ', icon: WhatsAppIcon, color: 'from-green-500 to-emerald-600', placeholder: 'https://wa.me/93700000000' },
    { id: 'telegram', title: 'تلگرام', icon: TelegramIcon, color: 'from-sky-500 to-blue-600', placeholder: 'https://t.me/username' },
    { id: 'email_direct', title: 'ایمیل', icon: Mail, color: 'from-rose-500 to-pink-600', placeholder: 'mailto:info@domain.af' },
    { id: 'standard_link', title: 'وب‌سایت', icon: Globe, color: 'from-indigo-500 to-purple-600', placeholder: 'https://yourwebsite.com' },
    { id: 'catalog', title: 'کاتالوگ PDF', icon: Layers, color: 'from-violet-500 to-fuchsia-600', placeholder: 'https://...' },
  ];

  const cardSurfaceStyle = {
    backgroundColor: 'var(--tg-card-bg, rgba(15, 23, 42, 0.72))',
    borderColor: 'var(--tg-card-border, rgba(255, 255, 255, 0.09))',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="p-4 pb-32 space-y-4 font-sans select-none max-w-md mx-auto overflow-x-hidden"
      dir="rtl"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl overflow-hidden border flex items-center justify-center shrink-0 font-bold text-base shadow-xs"
            style={{
              ...cardSurfaceStyle,
              color: 'var(--tg-theme-text-color, #f8fafc)',
            }}
          >
            {profile?.avatarUrl ? (
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
              <span className="text-[11px] font-mono text-cyan-500 flex items-center gap-1">
                <span>{getBaseDomain()}/{profile.alias}</span>
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
                TAB 1: کارت من و مدیریت سریع بیوگرافی
               ========================================================= */}
            {activeTab === 'card' && (
              <div className="space-y-4">
                <div className="relative rounded-3xl p-5 border overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/60 border-cyan-500/25 shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between relative z-10 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl border-2 border-cyan-400/30 overflow-hidden shadow-md">
                        {profile?.avatarUrl ? (
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
                          {profile?.isVerified && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <p className="text-xs text-slate-300">{profile?.headline || 'کارت هوشمند NFC آریا لینک'}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-400/15 text-cyan-300 border border-cyan-400/25">
                      NFC فعال
                    </span>
                  </div>

                  {profile?.bio && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10">
                      {profile.bio}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 relative z-10 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={copyCardLink}
                      className="h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-100 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'کپی شد!' : 'کپی لینک کارت'}</span>
                    </button>

                    {profile?.alias && (
                      <a
                        href={`${getBaseUrl()}/${profile.alias}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <span>مشاهده مینی‌سایت</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* فرم مدیریت بیوگرافی و معلومات کارت */}
                <form
                  onSubmit={handleSaveBioAndInfo}
                  className="p-4 rounded-2xl border space-y-3"
                  style={cardSurfaceStyle}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                        ویرایش بیوگرافی و مشخصات پروفایل
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                        نام نمایشی روی کارت
                      </label>
                      <input
                        type="text"
                        value={bioForm.displayName}
                        onChange={(e) => setBioForm((p) => ({ ...p, displayName: e.target.value }))}
                        className="w-full h-10 rounded-xl border px-3 text-xs bg-transparent focus:outline-none focus:border-cyan-500"
                        style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                        عنوان شغلی / تخصص
                      </label>
                      <input
                        type="text"
                        value={bioForm.headline}
                        onChange={(e) => setBioForm((p) => ({ ...p, headline: e.target.value }))}
                        className="w-full h-10 rounded-xl border px-3 text-xs bg-transparent focus:outline-none focus:border-cyan-500"
                        style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                        بیوگرافی و معرفی کوتاه
                      </label>
                      <textarea
                        rows={3}
                        value={bioForm.bio}
                        onChange={(e) => setBioForm((p) => ({ ...p, bio: e.target.value }))}
                        placeholder="درباره تخصص و خدمات خود بنویسید..."
                        className="w-full rounded-xl border p-3 text-xs bg-transparent focus:outline-none focus:border-cyan-500 resize-none"
                        style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                          نمبر تماس
                        </label>
                        <input
                          type="text"
                          value={bioForm.phone}
                          onChange={(e) => setBioForm((p) => ({ ...p, phone: e.target.value }))}
                          dir="ltr"
                          className="w-full h-10 rounded-xl border px-3 text-xs font-mono bg-transparent focus:outline-none focus:border-cyan-500 text-left"
                          style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                          آدرس ایمیل
                        </label>
                        <input
                          type="email"
                          value={bioForm.email}
                          onChange={(e) => setBioForm((p) => ({ ...p, email: e.target.value }))}
                          dir="ltr"
                          className="w-full h-10 rounded-xl border px-3 text-xs font-mono bg-transparent focus:outline-none focus:border-cyan-500 text-left"
                          style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                        />
                      </div>
                    </div>

                    {bioSuccessMsg && (
                      <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{bioSuccessMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingBio}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isSavingBio ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{isSavingBio ? 'در حال ذخیره...' : 'ذخیره تغییرات بیوگرافی'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* =========================================================
                TAB 2: آمار و ارقام (Recharts Line + Donut Charts)
               ========================================================= */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl border space-y-1.5"
                    style={cardSurfaceStyle}
                  >
                    <div className="flex items-center gap-2 text-cyan-500">
                      <Eye className="w-4 h-4" />
                      <span className="text-[11px] font-bold">بازدیدهای پروفایل</span>
                    </div>
                    <div className="text-2xl font-black font-mono" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      {(stats?.viewsCount ?? 0).toLocaleString('en-US')}
                    </div>
                    <span className="text-[10px] text-emerald-500 font-semibold block">کل بازدید ثبت‌شده</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="p-3.5 rounded-2xl border space-y-1.5"
                    style={cardSurfaceStyle}
                  >
                    <div className="flex items-center gap-2 text-emerald-500">
                      <MousePointerClick className="w-4 h-4" />
                      <span className="text-[11px] font-bold">کلیک روی لینک‌ها</span>
                    </div>
                    <div className="text-2xl font-black font-mono" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      {(stats?.clicksCount ?? 0).toLocaleString('en-US')}
                    </div>
                    <span className="text-[10px] text-cyan-500 font-semibold block">
                      نرخ تعامل (CTR): {stats?.ctr ?? 0}%
                    </span>
                  </motion.div>
                </div>

                {/* Recharts Line & Donut Charts */}
                <TwaAnalyticsCharts
                  viewsTimeline={viewsTimeline}
                  deviceBreakdown={deviceBreakdown}
                  timelineTitle="بازدید پروفایل و کلیک‌ها در ۷ روز گذشته"
                  primaryLabel="بازدید پروفایل"
                  secondaryLabel="کلیک لینک‌ها"
                  secondaryKey="clicks"
                />

                <div className="p-3.5 rounded-2xl border flex items-center justify-between" style={cardSurfaceStyle}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                        پیام‌ها و مخاطبین جذب‌شده
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                        ارسال‌شده از طریق فرم تماس مینی‌سایت
                      </span>
                    </div>
                  </div>
                  <span className="text-xl font-black font-mono text-amber-500">
                    {(stats?.leadsCount ?? 0).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 3: مدیریت لینک‌ها و ماژول‌ها
               ========================================================= */}
            {activeTab === 'add' && (
              <div className="space-y-4">
                {/* فرم افزودن لینک جدید */}
                <form
                  onSubmit={handleAddLink}
                  className="p-4 rounded-2xl border space-y-3"
                  style={cardSurfaceStyle}
                >
                  <div className="flex items-center gap-2 text-cyan-500">
                    <Plus className="w-4 h-4" />
                    <h2 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      افزودن لینک یا دکمه جدید به کارت
                    </h2>
                  </div>

                  {/* Quick Module Preset Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {MODULE_PRESETS.map((preset) => {
                      const PresetIcon = preset.icon;
                      const isSelected = newLinkType === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setNewLinkType(preset.id);
                            if (!newLinkTitle.trim()) setNewLinkTitle(preset.title);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500 text-white border-cyan-400 shadow-sm'
                              : 'bg-white/5 border-white/10'
                          }`}
                          style={!isSelected ? { color: 'var(--tg-theme-hint-color, #94a3b8)' } : undefined}
                        >
                          <PresetIcon className="w-3.5 h-3.5" />
                          <span>{preset.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      placeholder="عنوان دکمه (مثال: کانال تلگرام من)"
                      className="w-full h-10 rounded-xl border px-3 text-xs bg-transparent focus:outline-none focus:border-cyan-500"
                      style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                    />
                    <input
                      type="text"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder={
                        MODULE_PRESETS.find((p) => p.id === newLinkType)?.placeholder || 'https://...'
                      }
                      dir="ltr"
                      className="w-full h-10 rounded-xl border px-3 text-xs font-mono bg-transparent focus:outline-none focus:border-cyan-500 text-left"
                      style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingLink}
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAddingLink ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{isAddingLink ? 'در حال ثبت...' : 'افزودن لینک به پروفایل'}</span>
                  </button>
                </form>

                {/* ویرایش لینک انتخاب‌شده */}
                {editingLink && (
                  <motion.form
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSaveEditedLink}
                    className="p-4 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400">ویرایش لینک</span>
                      <button
                        type="button"
                        onClick={() => setEditingLink(null)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editingLink.title}
                      onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                      className="w-full h-9 rounded-xl border border-white/15 bg-black/20 px-3 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={editingLink.url}
                      onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                      dir="ltr"
                      className="w-full h-9 rounded-xl border border-white/15 bg-black/20 px-3 text-xs font-mono text-white text-left"
                    />
                    <button
                      type="submit"
                      disabled={busyLinkId === editingLink.id}
                      className="w-full h-9 rounded-xl bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                    >
                      ذخیره تغییرات لینک
                    </button>
                  </motion.form>
                )}

                {/* لیست لینک‌های فعلی کارت */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      لینک‌های فعلی کارت شما
                    </h3>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                      {linksList.length} مورد
                    </span>
                  </div>

                  {linksList.length === 0 ? (
                    <div className="p-6 rounded-2xl border text-center text-xs" style={cardSurfaceStyle}>
                      هنوز هیچ لینکی در پروفایل شما ثبت نشده است.
                    </div>
                  ) : (
                    linksList.map((link) => (
                      <div
                        key={link.id}
                        className="p-3.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all"
                        style={cardSurfaceStyle}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold truncate ${!link.isActive ? 'opacity-50 line-through' : ''}`}
                              style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}
                            >
                              {link.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">
                              {link.clickCount || 0} کلیک
                            </span>
                          </div>
                          <span
                            className="text-[10px] font-mono truncate block mt-0.5"
                            dir="ltr"
                            style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}
                          >
                            {link.url}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={busyLinkId === link.id}
                            onClick={() => handleToggleLinkActive(link)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                              link.isActive
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                : 'bg-slate-700/30 border-white/10 text-slate-400'
                            }`}
                          >
                            {link.isActive ? 'فعال' : 'مخفی'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingLink(link)}
                            className="p-1.5 rounded-lg border border-white/10 text-sky-400 hover:bg-sky-500/15 cursor-pointer"
                            title="ویرایش"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={busyLinkId === link.id}
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1.5 rounded-lg border border-white/10 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                TAB 4: مخاطبین و پیام‌های فرم تماس (CRM)
               ========================================================= */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                    پیام‌های فرم تماس و مخاطبین
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsOcrOpen(true)}
                    className="h-8 px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>اسکن کارت ویزیت</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      placeholder="جستجو در نام، نمبر یا پیام..."
                      className="w-full h-10 rounded-xl border text-xs px-9 bg-transparent focus:outline-none focus:border-cyan-500"
                      style={{ borderColor: 'var(--tg-card-border, rgba(255,255,255,0.1))', color: 'var(--tg-theme-text-color, #f8fafc)' }}
                    />
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-60" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {[
                      { id: 'all', label: 'همه پیام‌ها' },
                      { id: 'new', label: 'جدید' },
                      { id: 'contacted', label: 'تماس گرفته' },
                      { id: 'resolved', label: 'تکمیل‌شده' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCrmStatusFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          crmStatusFilter === tab.id
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'border border-white/10 opacity-75'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="p-8 rounded-2xl border text-center space-y-2" style={cardSurfaceStyle}>
                    <Inbox className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs opacity-70">هیچ پیامی با این مشخصات یافت نگردید.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredContacts.map((msg) => (
                      <div key={msg._id} className="p-4 rounded-2xl border space-y-3" style={cardSurfaceStyle}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                                {msg.name}
                              </h3>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  msg.status === 'resolved'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : msg.status === 'contacted'
                                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {msg.status === 'resolved' ? 'تکمیل‌شده' : msg.status === 'contacted' ? 'تماس گرفته' : 'جدید'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono opacity-60 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatSmartDate(msg.createdAt)}</span>
                            </span>
                          </div>

                          <select
                            value={msg.status || 'new'}
                            onChange={(e) =>
                              handleUpdateStatus(msg._id, e.target.value as 'new' | 'contacted' | 'resolved')
                            }
                            disabled={updatingMessageId === msg._id}
                            className="text-xs bg-slate-800/70 border border-white/10 rounded-xl px-2 py-1 text-slate-200 cursor-pointer"
                          >
                            <option value="new">جدید</option>
                            <option value="contacted">تماس گرفته</option>
                            <option value="resolved">تکمیل‌شده</option>
                          </select>
                        </div>

                        <p className="text-xs leading-relaxed bg-black/15 p-2.5 rounded-xl border border-white/5">
                          {msg.message}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          {msg.phone && (
                            <>
                              <a
                                href={`tel:${cleanDigits(msg.phone)}`}
                                className="h-8 px-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>تماس</span>
                              </a>
                              <a
                                href={`https://wa.me/${cleanDigits(msg.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 px-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                                <span>واتساپ</span>
                              </a>
                            </>
                          )}
                          {msg.email && (
                            <a
                              href={`mailto:${msg.email}`}
                              className="h-8 px-2.5 rounded-xl bg-slate-700/40 border border-white/10 text-xs font-bold flex items-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>ایمیل</span>
                            </a>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/5 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={noteDrafts[msg._id] !== undefined ? noteDrafts[msg._id] : msg.privateNote || ''}
                              onChange={(e) =>
                                setNoteDrafts((prev) => ({ ...prev, [msg._id]: e.target.value }))
                              }
                              placeholder="یادداشت خصوصی درباره مخاطب..."
                              className="flex-1 h-9 rounded-xl border border-white/10 bg-transparent text-xs px-3 focus:outline-none focus:border-cyan-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateNote(msg._id)}
                              disabled={savingNoteId === msg._id}
                              className="h-9 px-3 rounded-xl bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                            >
                              {savingNoteId === msg._id ? '...' : 'ذخیره'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="h-10 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 mx-auto cursor-pointer"
                        style={cardSurfaceStyle}
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
                TAB 5: تنظیمات حساب و حالت هدایت مستقیم
               ========================================================= */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border space-y-3" style={cardSurfaceStyle}>
                  <div className="flex items-center gap-2 mb-1 text-cyan-500">
                    <Settings className="w-4 h-4" />
                    <h3 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      تنظیمات کارت و همگام‌سازی
                    </h3>
                  </div>

                  <div className="divide-y divide-white/10 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <span style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>نشانی اینترنتی کارت:</span>
                      <span className="font-mono text-cyan-500 font-bold">{getBaseDomain()}/{profile?.alias || '—'}</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>طرح اشتراک:</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-400 border border-amber-400/25 uppercase">
                        {profile?.planType || 'FREE'}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>همگام‌سازی اعلان‌های تلگرام:</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>فعال و متصل</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold block" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                          هدایت مستقیم (Direct Mode)
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                          انتقال خودکار هنگام لمس کارت NFC به لینک دلخواه
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setBioForm((p) => ({ ...p, directModeEnabled: !p.directModeEnabled }))
                        }
                        className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
                          bioForm.directModeEnabled
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {bioForm.directModeEnabled ? 'فعال' : 'غیرفعال'}
                      </button>
                    </div>

                    {bioForm.directModeEnabled && (
                      <input
                        type="url"
                        value={bioForm.directModeUrl}
                        onChange={(e) =>
                          setBioForm((p) => ({ ...p, directModeUrl: e.target.value }))
                        }
                        placeholder="https://instagram.com/..."
                        dir="ltr"
                        className="w-full h-9 rounded-xl border border-white/15 px-3 text-xs font-mono bg-transparent text-left"
                      />
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleSaveBioAndInfo(e as any)}
                      disabled={isSavingBio}
                      className="w-full h-9 rounded-xl bg-cyan-500 text-white font-bold text-xs cursor-pointer"
                    >
                      {isSavingBio ? 'در حال ثبت...' : 'ذخیره تنظیمات هدایت'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border text-center space-y-2" style={cardSurfaceStyle}>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                    نیاز به رهنمایی یا سفارش کارت فزیکی دارید؟
                  </h4>
                  <p className="text-[11px]" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
                    تیم پشتیبانی فنی آریا لینک در تلگرام همه‌روزه آماده همکاری با شماست.
                  </p>
                  <a
                    href={`${getBaseUrl()}/dashboard/account`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-500 font-bold hover:underline pt-1"
                  >
                    <span>باز کردن نسخه کامل وب</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Liquid Glass Nav */}
      <TelegramBottomNav
        items={USER_NAV_ITEMS}
        activeTab={activeTab}
        onChange={handleTabChange}
        defaultIndex={4}
      />

      {/* OCR Modal */}
      <CardOcrScannerModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onScanComplete={handleOcrComplete}
      />
    </motion.div>
  );
}
