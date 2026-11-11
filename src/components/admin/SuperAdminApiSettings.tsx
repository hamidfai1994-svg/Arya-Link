'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellRing,
  Send,
  Bot,
  ShieldAlert,
  ShoppingCart,
  UserCheck,
  MessageSquare,
  Smartphone,
  Save,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface SystemSettingsState {
  telegramSupportChatId: string;
  telegramInsightsChatId: string;
  telegramBotsActive: boolean;
  notifyNewUsers: boolean;
  notifyOrders: boolean;
  notifySupportTickets: boolean;
  notifySystemAlerts: boolean;
  appPushEnabled: boolean;
}

const defaultSettings: SystemSettingsState = {
  telegramSupportChatId: '',
  telegramInsightsChatId: '',
  telegramBotsActive: false,
  notifyNewUsers: true,
  notifyOrders: true,
  notifySupportTickets: true,
  notifySystemAlerts: false,
  appPushEnabled: false,
};

export function SuperAdminApiSettings() {
  const [settings, setSettings] = useState<SystemSettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings/system', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setSettings({
          telegramSupportChatId: json.data.telegramSupportChatId || '',
          telegramInsightsChatId: json.data.telegramInsightsChatId || '',
          telegramBotsActive: Boolean(json.data.telegramBotsActive),
          notifyNewUsers: json.data.notifyNewUsers ?? true,
          notifyOrders: json.data.notifyOrders ?? true,
          notifySupportTickets: json.data.notifySupportTickets ?? true,
          notifySystemAlerts: json.data.notifySystemAlerts ?? false,
          appPushEnabled: false,
        });
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Error loading system settings:', err);
      toast.error('خطا در دریافت تنظیمات اعلان‌های سیستم.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('در حال ذخیره‌سازی تنظیمات...');
    try {
      const res = await fetch('/api/admin/settings/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (json.success) {
        setIsDirty(false);
        toast.success(json.message || 'تنظیمات کلان API و تلگرام با موفقیت ذخیره شد.', {
          id: toastId,
        });
      } else {
        toast.error(json.message || 'خطا در ذخیره‌سازی تنظیمات.', { id: toastId });
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('خطای ارتباط با سرور در هنگام ذخیره تنظیمات.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <Card className="p-8 border-border bg-card/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-muted-foreground min-h-[300px]">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
        <span className="text-xs font-medium">در حال بارگذاری تنظیمات API و اعلان‌ها...</span>
      </Card>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans" dir="rtl">
      {/* Header Banner */}
      <Card className="p-5 border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-slate-950/60 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-cyan-500/10">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  مدیریت API و اعلان‌های کلان سیستم (Super Admin)
                </h2>
                <Badge variant="cyan" className="text-[10px] font-bold">
                  سیستمی و امنیتی
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                تنظیم ارتباط دوگانه ربات‌های تلگرام (پشتیبانی و آمار/فروش) و رخدادهای سیستمی کل پلتفرم آریا لینک
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`h-10 px-5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto ${isDirty && !isSaving
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 cursor-pointer active:scale-95'
              : 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50 shadow-none'
              }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>ذخیره تغییرات API</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Telegram Bots Configuration Section */}
      <Card className="p-5 sm:p-6 border-border bg-card/80 rounded-3xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block">
                اتصال و وضعیت ربات‌های تلگرام (Telegram Bots Hub)
              </span>
              <span className="text-xs text-muted-foreground">
                فعال‌سازی سراسری ارسال رخدادها به تلگرام مدیران
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
              {settings.telegramBotsActive ? 'فعال و متصل' : 'غیرفعال'}
            </span>
            <Switch
              checked={settings.telegramBotsActive}
              onCheckedChange={(checked) => updateField('telegramBotsActive', checked)}
            />
          </div>
        </div>

        {/* Telegram Chat IDs Dual Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Support Bot Chat ID */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <label className="text-xs font-bold text-foreground block">
                آی دی ربات پشتیبانی و تیکت‌ها (Support Bot Chat ID)
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              آی دی چت یا کانال تلگرام برای دریافت تیکت‌های پشتیبانی و ارتباطات کاربران
            </p>
            <Input
              type="text"
              value={settings.telegramSupportChatId}
              onChange={(e) => updateField('telegramSupportChatId', e.target.value)}
              placeholder="-100123456789 یا @ChannelId"
              dir="ltr"
              className="font-mono text-xs text-left bg-card rounded-xl border-border"
            />
          </div>

          {/* Insights & Orders Bot Chat ID */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2.5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-sky-500" />
              <label className="text-xs font-bold text-foreground block">
                آی دی ربات آمار و سفارشات (Insights & Orders Chat ID)
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              آی دی چت یا کانال تلگرام جهت تفکیک اعلان‌های خرید کارت و آمار رشد پلتفرم
            </p>
            <Input
              type="text"
              value={settings.telegramInsightsChatId}
              onChange={(e) => updateField('telegramInsightsChatId', e.target.value)}
              placeholder="-100987654321 یا @ChannelId"
              dir="ltr"
              className="font-mono text-xs text-left bg-card rounded-xl border-border"
            />
          </div>
        </div>
      </Card>

      {/* Global Notification Switches Control Panel */}
      <Card className="p-5 sm:p-6 border-border bg-card/80 rounded-3xl space-y-4">
        <div className="border-b border-border/70 pb-3">
          <span className="text-sm font-bold text-foreground block">
            رویدادهای خودکار اعلان (System Events Dispatcher)
          </span>
          <span className="text-xs text-muted-foreground">
            مشخص کنید کدام رخدادهای حیاتی پلتفرم بلافاصله اعلان فوری ایجاد کنند
          </span>
        </div>

        {/* notifyNewUsers */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                اعلان ثبت‌نام کاربر جدید (notifyNewUsers)
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                ارسال پیام خوش‌آمد و مشخصات ثبت‌نام هنگام ایجاد حساب جدید در سیستم
              </span>
            </div>
          </div>
          <Switch
            checked={settings.notifyNewUsers}
            onCheckedChange={(checked) => updateField('notifyNewUsers', checked)}
          />
        </div>

        <div className="border-t border-border/50" />

        {/* notifyOrders */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                اعلان ثبت سفارشات خرید و کارت NFC (notifyOrders)
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                هشدار فوری هنگام ثبت سفارش کارت فیزیکی یا خرید اشتراک همراه با فاکتور
              </span>
            </div>
          </div>
          <Switch
            checked={settings.notifyOrders}
            onCheckedChange={(checked) => updateField('notifyOrders', checked)}
          />
        </div>

        <div className="border-t border-border/50" />

        {/* notifySupportTickets */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                اعلان تیکت‌ها و پیام‌های پشتیبانی (notifySupportTickets)
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                ارسال فوری درخواست‌های پشتیبانی کاربران به ربات پشتیبانی تلگرام
              </span>
            </div>
          </div>
          <Switch
            checked={settings.notifySupportTickets}
            onCheckedChange={(checked) => updateField('notifySupportTickets', checked)}
          />
        </div>

        <div className="border-t border-border/50" />

        {/* notifySystemAlerts */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                هشدارهای امنیتی و سیستمی پلتفرم (notifySystemAlerts)
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                اطلاع‌رسانی خطاهای سیستمی، حملات احتمالی و هشدارهای سرور
              </span>
            </div>
          </div>
          <Switch
            checked={settings.notifySystemAlerts}
            onCheckedChange={(checked) => updateField('notifySystemAlerts', checked)}
          />
        </div>

        <div className="border-t border-border/50" />

        {/* appPushEnabled - Disabled with Badge */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-muted/20 opacity-70">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  پوش‌نوتیفیکیشن اپلیکیشن موبایل (appPushEnabled)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  اپلیکیشن (به زودی)
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                ارسال اعلان‌های سیستمی بر روی اپلیکیشن اختصاصی موبایل در نسخه‌های آتی
              </span>
            </div>
          </div>
          <Switch
            checked={false}
            disabled={true}
            className="cursor-not-allowed opacity-50"
          />
        </div>
      </Card>
    </div>
  );
}

export default SuperAdminApiSettings;

