'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  UserPlus,
  Eye,
  MessageSquare,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { formatSmartDate } from '@/lib/utils/date';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type:
    | 'new_user'
    | 'profile_view'
    | 'new_lead'
    | 'new_order'
    | 'order_update'
    | 'kyc_update'
    | 'ticket'
    | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellDropdownProps {
  mode: 'admin' | 'user';
}

export function NotificationBellDropdown({ mode }: NotificationBellDropdownProps) {
  const router = useRouter();
  const { dir, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?scope=${mode}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(Number(data.unreadCount || 0));
      }
    } catch {
      // ignore silent polling errors
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: item.id, scope: mode }),
        });
      } catch {
        // ignore
      }
    }
    if (item.link) {
      setIsOpen(false);
      router.push(item.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setIsMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, scope: mode }),
      });
    } catch {
      // ignore
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleClearRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    try {
      await fetch(`/api/notifications?scope=${mode}`, {
        method: 'DELETE',
      });
    } catch {
      // ignore
    }
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'new_user':
        return { icon: UserPlus, color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25' };
      case 'profile_view':
        return { icon: Eye, color: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/25' };
      case 'new_lead':
      case 'ticket':
        return { icon: MessageSquare, color: 'bg-sky-500/15 text-sky-500 border-sky-500/25' };
      case 'new_order':
      case 'order_update':
        return { icon: ShoppingBag, color: 'bg-amber-500/15 text-amber-500 border-amber-500/25' };
      case 'kyc_update':
        return { icon: ShieldCheck, color: 'bg-violet-500/15 text-violet-500 border-violet-500/25' };
      default:
        return { icon: Sparkles, color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' };
    }
  };

  return (
    <div ref={containerRef} className="relative" dir={dir}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) fetchNotifications(true);
        }}
        className="relative p-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground transition-colors cursor-pointer"
        aria-label={t('notifications.title', 'اعلانات و رخدادهای اخیر')}
        title={t('notifications.title', 'اعلانات و رخدادهای اخیر')}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold font-sans flex items-center justify-center shadow-sm shadow-rose-500/50 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute left-0 rtl:left-0 ltr:right-0 ltr:left-auto mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-border bg-muted/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-bold text-foreground">{t('notifications.title')}</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 text-[10px] font-bold font-sans">
                    {unreadCount} {t('notifications.unread_suffix')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAll}
                    className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title={t('notifications.mark_all')}
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>{t('notifications.mark_all')}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearRead}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title={t('notifications.clear_read')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {isLoading && notifications.length === 0 ? (
                <div className="py-10 text-center space-y-2 text-muted-foreground">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin text-cyan-500" />
                  <p className="text-xs">{t('notifications.loading')}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center space-y-2 text-muted-foreground px-4">
                  <Bell className="w-7 h-7 mx-auto opacity-30" />
                  <p className="text-xs font-semibold">{t('notifications.empty_title')}</p>
                  <p className="text-[11px] opacity-75">
                    {t('notifications.empty_desc')}
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  const meta = getTypeIcon(item.type);
                  const Icon = meta.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMarkAsRead(item)}
                      className={`w-full text-right p-3.5 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                        !item.isRead ? 'bg-cyan-500/[0.04]' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs truncate ${
                              !item.isRead
                                ? 'font-bold text-foreground'
                                : 'font-semibold text-muted-foreground'
                            }`}
                          >
                            {item.title}
                          </span>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground/70 block font-sans">
                          {formatSmartDate(item.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default NotificationBellDropdown;
