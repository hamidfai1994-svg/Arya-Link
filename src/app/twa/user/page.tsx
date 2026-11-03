'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons';
import { formatSmartDate } from '@/lib/utils/date';

interface UserProfileSummary {
  displayName: string;
  alias: string;
  avatarUrl?: string;
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
  createdAt: string;
}

export default function UserTWA() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [profile, setProfile] = useState<UserProfileSummary | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentMessages, setRecentMessages] = useState<CustomerMessage[]>([]);
  const [limit, setLimit] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  return (
    <div className="p-4 space-y-4 font-sans select-none max-w-md mx-auto" dir="rtl">
      {/* Header Profile Bar */}
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
                {profile?.displayName || 'کارت من'}
              </h1>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            {profile?.alias && (
              <a
                href={`https://aryal.ink/${profile.alias}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono flex items-center gap-1 hover:underline"
                style={{ color: 'var(--tg-theme-button-color, #0ea5e9)' }}
              >
                <span>aryal.ink/{profile.alias}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
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
          title="بروزرسانی اطلاعات"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Title Badge */}
      <div
        className="p-3.5 rounded-2xl border"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
            داشبورد مدیریت کارت شما
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
            }}
          >
            آنلاین و متصل
          </span>
        </div>
      </div>

      {/* Section 1: Statistical Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Views Count Card */}
        <div
          className="p-3.5 rounded-2xl border space-y-2"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
              بازدیدهای کارت
            </span>
            <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
            {(stats?.viewsCount ?? 0).toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-sky-400 font-bold block">مجموع بازدیدها</span>
        </div>

        {/* Leads Count Card */}
        <div
          className="p-3.5 rounded-2xl border space-y-2"
          style={{
            backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
              پیام‌ها و لیدها
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Inbox className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-sans" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
            {(stats?.leadsCount ?? 0).toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-emerald-500 font-bold block">دریافتی از فرم تماس</span>
        </div>
      </div>

      {/* Section 2: CRM Inbox / Messages */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" style={{ color: 'var(--tg-theme-button-color, #0ea5e9)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
              صندوق ورودی پیام‌ها (CRM)
            </span>
          </div>
          <span className="text-[11px] font-mono" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
            نمایش {recentMessages.length} مورد
          </span>
        </div>

        {recentMessages.length === 0 ? (
          <div
            className="p-6 rounded-2xl border text-center text-xs space-y-1"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--tg-theme-hint-color, #94a3b8)',
            }}
          >
            <p className="font-semibold">هنوز پیامی از طریق فرم تماس دریافت نشده است.</p>
            <p className="text-[11px] opacity-80">
              پیام‌های بازدیدکنندگان مینی‌سایت شما بلافاصله در این قسمت نمایش داده می‌شوند.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentMessages.map((msg) => {
              const waNumber = cleanDigits(msg.phone);
              const hasPhone = Boolean(msg.phone && msg.phone.trim());
              const hasEmail = Boolean(msg.email && msg.email.trim());

              return (
                <div
                  key={msg._id}
                  className="p-3.5 rounded-2xl border space-y-2.5 transition-all shadow-xs"
                  style={{
                    backgroundColor: 'var(--tg-theme-secondary-bg-color, rgba(255, 255, 255, 0.05))',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {/* Header row: Sender & Smart Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}>
                      {msg.name || 'مخاطب ناشناس'}
                    </span>
                    <span
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{formatSmartDate(msg.createdAt)}</span>
                    </span>
                  </div>

                  {/* Message Body */}
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}
                  >
                    {msg.message}
                  </p>

                  {/* Contact Summary text */}
                  {(hasPhone || hasEmail) && (
                    <div
                      className="text-[10px] font-mono select-all"
                      style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}
                    >
                      {[msg.phone, msg.email].filter(Boolean).join(' • ')}
                    </div>
                  )}

                  {/* 3-Column Action Buttons Grid (Call, WhatsApp, Email) */}
                  {(hasPhone || hasEmail) && (
                    <div className="pt-2 border-t grid grid-cols-3 gap-2" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                      {/* 1. Phone Call Button */}
                      {hasPhone ? (
                        <a
                          href={`tel:${msg.phone}`}
                          className="py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 text-center"
                          style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            borderColor: 'rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                          }}
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>تماس</span>
                        </a>
                      ) : (
                        <div />
                      )}

                      {/* 2. WhatsApp Button */}
                      {hasPhone ? (
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 text-center"
                          style={{
                            backgroundColor: 'rgba(37, 211, 102, 0.15)',
                            borderColor: 'rgba(37, 211, 102, 0.3)',
                            color: '#25d366',
                          }}
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 shrink-0 fill-current" />
                          <span>واتساپ</span>
                        </a>
                      ) : (
                        <div />
                      )}

                      {/* 3. Email Button */}
                      {hasEmail ? (
                        <a
                          href={`mailto:${msg.email}`}
                          className="py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 text-center"
                          style={{
                            backgroundColor: 'rgba(14, 165, 233, 0.15)',
                            borderColor: 'rgba(14, 165, 233, 0.3)',
                            color: 'var(--tg-theme-button-color, #0ea5e9)',
                          }}
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>ایمیل</span>
                        </a>
                      ) : (
                        <div />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Load More Button */}
            {recentMessages.length >= limit && (
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
                      <span>در حال دریافت پیام‌های بیشتر...</span>
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
