'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Send,
  Link2,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Unlink,
  Bot,
  Webhook,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface TelegramConnectCardProps {
  mode: 'user' | 'admin';
  onBoundSuccess?: (chatId: string) => void;
}

export function TelegramConnectCard({ mode, onBoundSuccess }: TelegramConnectCardProps) {
  const { t, dir, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [isSettingWebhooks, setIsSettingWebhooks] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [manualChatId, setManualChatId] = useState('');
  const [botInfo, setBotInfo] = useState({
    userBotUsername: 'AryaLinkBot',
    adminBotUsername: 'AryaLinkAdminBot',
    miniAppUserUrl: '/twa/user',
    miniAppAdminUrl: '/twa/admin',
  });

  const [generatedBind, setGeneratedBind] = useState<{
    token: string;
    deepLink: string;
    startCommand: string;
    botUsername: string;
  } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const fetchStatus = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/telegram/connect', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setIsConnected(Boolean(data.isConnected));
        const resolvedId = data.telegramChatId || data.adminChatIdConfigured || '';
        setTelegramChatId(resolvedId);
        if (resolvedId && !manualChatId) setManualChatId(resolvedId);
        setTelegramUsername(data.telegramUsername || '');
        setBotInfo({
          userBotUsername: data.userBotUsername || 'AryaLinkBot',
          adminBotUsername: data.adminBotUsername || 'AryaLinkAdminBot',
          miniAppUserUrl: data.miniAppUserUrl || '/twa/user',
          miniAppAdminUrl: data.miniAppAdminUrl || '/twa/admin',
        });
      }
    } catch {
      // ignore silent fetch failures
    } finally {
      if (!silent) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStatus(false);
  }, [fetchStatus]);

  const handleGenerateBindLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_token',
          targetBot: mode,
          locale: language,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedBind({
          token: data.token,
          deepLink: data.deepLink,
          startCommand: data.startCommand,
          botUsername: data.botUsername,
        });
        toast.success(t('toast.telegram_token_ready'));
      } else {
        toast.error(data.message || t('toast.save_error'));
      }
    } catch {
      toast.error(t('toast.network_error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualBind = async () => {
    if (!manualChatId.trim()) {
      toast.error(t('validation.chat_id_required'));
      return;
    }
    setIsManualSaving(true);
    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_bind',
          chatId: manualChatId.trim(),
          targetBot: mode,
          locale: language,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsConnected(true);
        setTelegramChatId(data.telegramChatId);
        toast.success(data.message || t('toast.telegram_bound'));
        if (onBoundSuccess) onBoundSuccess(data.telegramChatId);
      } else {
        toast.error(data.message || t('toast.save_error'));
      }
    } catch {
      toast.error(t('toast.network_error'));
    } finally {
      setIsManualSaving(false);
    }
  };

  const handleSetWebhooks = async () => {
    setIsSettingWebhooks(true);
    const toastId = toast.loading(t('common.loading'));
    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_webhooks', locale: language }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || t('toast.save_success'), { id: toastId });
      } else {
        toast.warning(data.message || t('toast.save_error'), {
          id: toastId,
        });
      }
    } catch {
      toast.error(t('toast.network_error'), { id: toastId });
    } finally {
      setIsSettingWebhooks(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const res = await fetch('/api/telegram/connect', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setIsConnected(false);
        setTelegramChatId('');
        setTelegramUsername('');
        setGeneratedBind(null);
        toast.success(t('toast.telegram_disconnected'));
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  const copyCommand = () => {
    if (!generatedBind?.startCommand) return;
    navigator.clipboard?.writeText(generatedBind.startCommand);
    setCopiedCmd(true);
    toast.success(t('toast.command_copied'));
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <Card className="p-5 sm:p-6 rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.06] via-card to-cyan-500/[0.04] shadow-sm space-y-5" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-500 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-foreground">
                {mode === 'admin'
                  ? t('telegram.admin_title')
                  : t('telegram.user_title')}
              </h3>
              {isLoading ? (
                <Badge variant="outline" className="text-[10px]">{t('telegram.checking')}</Badge>
              ) : isConnected ? (
                <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 me-1" />
                  {t('telegram.connected')}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 text-[10px] font-bold">
                  {t('telegram.not_connected')}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {mode === 'admin'
                ? t('telegram.admin_desc')
                : t('telegram.user_desc')}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGenerateBindLink}
          disabled={isGenerating}
          className="h-10 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-md shadow-sky-500/20 cursor-pointer"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          <span>{t('telegram.connect_btn')}</span>
        </Button>
      </div>

      {/* Connected Summary Banner */}
      {isConnected && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <Bot className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-foreground block">
                {t('telegram.sync_active')} {telegramUsername ? `(${telegramUsername})` : ''}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                Chat ID: {telegramChatId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={mode === 'admin' ? botInfo.miniAppAdminUrl : botInfo.miniAppUserUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/25 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('telegram.preview_miniapp')}</span>
            </a>

            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-[11px] font-bold flex items-center gap-1 hover:bg-rose-500/20 cursor-pointer"
            >
              <Unlink className="w-3 h-3" />
              <span>{t('telegram.disconnect')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Generated One-Time Deep Link Box */}
      {generatedBind && (
        <div className="p-4 rounded-2xl bg-muted/40 border border-sky-500/30 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-8 space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-sky-500 block">
                {t('telegram.link_ready')}
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed" dir="ltr">
                @{generatedBind.botUsername}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={generatedBind.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('telegram.start_bot_btn')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={copyCommand}
                className="h-9 px-3 rounded-xl bg-card border border-border text-xs font-mono flex items-center gap-1.5 hover:bg-muted cursor-pointer"
                dir="ltr"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{generatedBind.startCommand}</span>
              </button>

              <button
                type="button"
                onClick={() => fetchStatus(false)}
                className="h-9 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('telegram.check_status')}</span>
              </button>
            </div>
          </div>

          <div className="sm:col-span-4 flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl border border-border mx-auto">
            <QRCodeSVG value={generatedBind.deepLink} size={108} level="M" />
            <span className="text-[10px] text-slate-600 font-semibold mt-1">{t('telegram.scan_qr')}</span>
          </div>
        </div>
      )}

      {/* Manual Chat ID Binding & Admin Webhook Registration */}
      <div className="pt-2 border-t border-border/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className={mode === 'admin' ? 'md:col-span-7 space-y-1' : 'md:col-span-12 space-y-1'}>
          <label className="text-[11px] font-bold text-muted-foreground block">
            {t('telegram.manual_label')}
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={manualChatId}
              onChange={(e) => setManualChatId(e.target.value)}
              placeholder="123456789"
              dir="ltr"
              className="h-9 rounded-xl font-mono text-xs text-left"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleManualBind}
              disabled={isManualSaving}
              className="h-9 px-4 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            >
              {isManualSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : t('telegram.manual_btn')}
            </Button>
          </div>
        </div>

        {mode === 'admin' && (
          <div className="md:col-span-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleSetWebhooks}
              disabled={isSettingWebhooks}
              className="w-full h-9 rounded-xl border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSettingWebhooks ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Webhook className="w-3.5 h-3.5" />
              )}
              <span>{t('telegram.set_webhooks')}</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
export default TelegramConnectCard;
