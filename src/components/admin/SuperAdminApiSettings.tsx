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
  HardDrive,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { TelegramConnectCard } from '@/components/common/TelegramConnectCard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
  const { dir, t } = useLanguage();
  const [settings, setSettings] = useState<SystemSettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);
  const [lastCleanupResult, setLastCleanupResult] = useState<{
    freedMB: number;
    deletedCount: number;
    keptCount: number;
  } | null>(null);

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
      toast.error(t('apiSettings.load_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading(t('common.saving'));
    try {
      const res = await fetch('/api/admin/settings/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (json.success) {
        setIsDirty(false);
        toast.success(json.message || t('apiSettings.save_ok'), {
          id: toastId,
        });
      } else {
        toast.error(json.message || t('toast.save_error'), { id: toastId });
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(t('toast.network_error'), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof SystemSettingsState>(key: K, value: SystemSettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleCleanupStorage = async () => {
    setIsCleaningStorage(true);
    const toastId = toast.loading(t('apiSettings.storage_cleaning'));
    try {
      const res = await fetch('/api/admin/cleanup-uploads', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLastCleanupResult({
          freedMB: data.freedMB ?? 0,
          deletedCount: data.deletedCount ?? 0,
          keptCount: data.keptCount ?? 0,
        });
        toast.success(`${data.freedMB} MB freed (${data.deletedCount} files)`, {
          id: toastId,
        });
      } else {
        toast.error(data.message || t('apiSettings.storage_error'), { id: toastId });
      }
    } catch (err) {
      console.error('Storage cleanup error:', err);
      toast.error(t('toast.network_error'), { id: toastId });
    } finally {
      setIsCleaningStorage(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 border-border bg-card/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-muted-foreground min-h-[300px]">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
        <span className="text-xs font-medium">{t('apiSettings.loading')}</span>
      </Card>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans" dir={dir}>
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
                  {t('apiSettings.title')}
                </h2>
                <Badge variant="cyan" className="text-[10px] font-bold">
                  {t('apiSettings.badge')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t('apiSettings.subtitle')}
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
                <span>{t('common.saving')}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{t('apiSettings.save_btn')}</span>
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
                {t('apiSettings.bots_section')}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('apiSettings.bots_section_sub')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
              {settings.telegramBotsActive ? t('apiSettings.active_status') : t('apiSettings.inactive_status')}
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
                {t('apiSettings.support_chat_label')}
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              {t('apiSettings.support_chat_desc')}
            </p>
            <Input
              type="text"
              value={settings.telegramSupportChatId}
              onChange={(e) => updateField('telegramSupportChatId', e.target.value)}
              placeholder="-100123456789 / @ChannelId"
              dir="ltr"
              className="font-mono text-xs text-left bg-card rounded-xl border-border"
            />
          </div>

          {/* Insights & Orders Bot Chat ID */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2.5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-sky-500" />
              <label className="text-xs font-bold text-foreground block">
                {t('apiSettings.insights_chat_label')}
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              {t('apiSettings.insights_chat_desc')}
            </p>
            <Input
              type="text"
              value={settings.telegramInsightsChatId}
              onChange={(e) => updateField('telegramInsightsChatId', e.target.value)}
              placeholder="-100987654321 / @ChannelId"
              dir="ltr"
              className="font-mono text-xs text-left bg-card rounded-xl border-border"
            />
          </div>
        </div>
      </Card>

      {/* One-Click Admin Telegram Binding & Webhook Registration */}
      <TelegramConnectCard
        mode="admin"
        onBoundSuccess={(chatId) => {
          updateField('telegramInsightsChatId', chatId);
          updateField('telegramBotsActive', true);
        }}
      />

      {/* Global Notification Switches Control Panel */}
      <Card className="p-5 sm:p-6 border-border bg-card/80 rounded-3xl space-y-4">
        <div className="border-b border-border/70 pb-3">
          <span className="text-sm font-bold text-foreground block">
            {t('apiSettings.events_section')}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('apiSettings.events_section_sub')}
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
                {t('apiSettings.event_new_user')}
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {t('apiSettings.event_new_user_desc')}
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
                {t('apiSettings.event_orders')}
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {t('apiSettings.event_orders_desc')}
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
                {t('apiSettings.event_tickets')}
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {t('apiSettings.event_tickets_desc')}
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
                {t('apiSettings.event_alerts')}
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {t('apiSettings.event_alerts_desc')}
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
                  {t('apiSettings.push_title')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  {t('apiSettings.push_soon')}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {t('apiSettings.push_desc')}
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

      {/* Storage Garbage Collector Panel */}
      <Card className="p-5 sm:p-6 border-rose-500/20 bg-card/80 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t('apiSettings.storage_title')}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t('apiSettings.storage_desc')}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCleanupStorage}
            disabled={isCleaningStorage}
            className="h-10 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            {isCleaningStorage ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t('apiSettings.storage_cleaning')}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('apiSettings.storage_btn')}</span>
              </>
            )}
          </Button>
        </div>

        {lastCleanupResult && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {lastCleanupResult.freedMB} MB freed — {lastCleanupResult.deletedCount} deleted / {lastCleanupResult.keptCount} kept
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

export default SuperAdminApiSettings;

