'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import { motion } from 'framer-motion';
import {
  Sliders,
  Globe,
  Search,
  Sparkles,
  ExternalLink,
  Eye,
  Save,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useEditorStore } from '@/store/editor-store';
import { useActiveCard } from '@/context/ActiveCardContext';

export function CardSettingsPanel({ cardId }: { cardId?: string }) {
  const { language, dir, t } = useLanguage();
  const { activeCard } = useActiveCard();
  const { profile, updateProSettings, toggleDirectMode, updateBasicInfo, saveProfileData } = useEditorStore();

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [alias, setAlias] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [hideBranding, setHideBranding] = useState(false);
  const [directMode, setDirectMode] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync with current profile in editor store
  useEffect(() => {
    if (profile) {
      const safeName = getLocalizedText(profile.displayName, language, 'Arya Link');
      const safeBio = getLocalizedText(profile.bio, language, t('cardSettings.google_preview_default_desc'));
      setSeoTitle(profile.seoTitle || `${safeName} | Arya Link`);
      setSeoDescription(profile.seoDescription || safeBio);
      setAlias(profile.alias || '');
      setHideBranding(Boolean(profile.hideBranding));
      setDirectMode(Boolean(profile.directModeEnabled));
      setDirectUrl(profile.directModeUrl || '');
    }
  }, [profile, language, t]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      updateProSettings({
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        hideBranding,
      });

      toggleDirectMode(directMode, directUrl.trim());

      if (alias.trim() && alias !== profile?.alias) {
        updateBasicInfo({ alias: alias.trim() });
      }

      const res = await saveProfileData();
      if (res.success) {
        toast.success(t('cardSettings.save_toast_ok'));
      } else {
        toast.error(res.message || t('toast.save_error'));
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error(t('toast.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const currentHost = typeof window !== 'undefined' ? window.location.host : 'aryalink.af';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 select-none"
      dir={dir}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('cardSettings.title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t('cardSettings.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="h-11 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t('common.saving')}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t('common.save')}</span>
            </>
          )}
        </Button>
      </div>

      {/* Isolated Link Context Indicator Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-cyan-500/20 shrink-0 overflow-hidden">
            {profile?.avatarUrl || activeCard?.avatarUrl ? (
              <img src={profile?.avatarUrl || activeCard?.avatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Sliders className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {t('cardSettings.banner_prefix')} {getLocalizedText(profile?.displayName || activeCard?.displayName, language, 'Arya Link')}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-sans font-bold" dir="ltr">
                aryal.ink/{profile?.alias || activeCard?.alias || 'card'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t('cardSettings.banner_desc')}
            </p>
          </div>
        </div>

        {(profile?.alias || activeCard?.alias) && (
          <a
            href={`/${profile?.alias || activeCard?.alias}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-xl border border-cyan-500/20 transition-colors"
          >
            <span>{t('cardSettings.view_live')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Forms): 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: SEO & Metadata */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
              <Search className="w-4 h-4 text-cyan-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('cardSettings.seo_section')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('cardSettings.google_title_label')}
                </label>
                <Input
                  type="text"
                  placeholder={t('cardSettings.google_title_ph')}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={70}
                  className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-xs"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{t('cardSettings.google_title_hint')}</span>
                  <span className="font-sans">{seoTitle.length} / 70</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('cardSettings.meta_desc_label')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('cardSettings.meta_desc_ph')}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  maxLength={160}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{t('cardSettings.meta_desc_hint')}</span>
                  <span className="font-sans">{seoDescription.length} / 160</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: White-label & Branding Removal */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t('cardSettings.whitelabel_section')}
                </h2>
              </div>
              <Badge variant="cyan" className="text-[10px] font-sans uppercase">
                {t('cardSettings.pro_only')}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {t('cardSettings.hide_branding_title')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {t('cardSettings.hide_branding_desc')}
                  </span>
                </div>
                <Switch
                  checked={hideBranding}
                  onCheckedChange={setHideBranding}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Custom Domain & Alias */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
              <Globe className="w-4 h-4 text-cyan-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('cardSettings.domain_section')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('cardSettings.public_alias_label')}
                </label>
                <div className="flex items-center rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 overflow-hidden" dir="ltr">
                  <span className="px-3.5 text-xs text-slate-400 font-sans border-r border-slate-200 dark:border-white/10 select-none">
                    {currentHost}/
                  </span>
                  <Input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="border-0 bg-transparent rounded-none h-11 text-xs font-sans font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>{t('cardSettings.custom_domain_label')}</span>
                  <Badge variant="outline" className="text-[10px] font-sans">
                    {t('cardSettings.enterprise_badge')}
                  </Badge>
                </label>
                <Input
                  type="text"
                  placeholder={t('cardSettings.custom_domain_ph')}
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-xs font-sans"
                  dir="ltr"
                />
                <div className="p-3 rounded-xl bg-cyan-500/10 text-[11px] text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                  {t('cardSettings.cname_hint')}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Direct Mode */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-500" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t('cardSettings.direct_mode_section')}
                </h2>
              </div>
              <Switch
                checked={directMode}
                onCheckedChange={setDirectMode}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('cardSettings.direct_mode_desc')}
            </p>

            {directMode && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('cardSettings.direct_url_label')}
                </label>
                <Input
                  type="url"
                  placeholder="https://wa.me/93799123456"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-xs font-sans"
                  dir="ltr"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Live Google & Card Snippet Previews): 5 cols */}
        <div className="lg:col-span-5 space-y-6 sticky top-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-500" />
              <span>{t('cardSettings.google_preview_title')}</span>
            </h3>

            {/* Google Result Card Mockup */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 space-y-1.5 text-start font-sans" dir={dir}>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-sans" dir="ltr">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-500 text-[10px] font-bold flex items-center justify-center">
                  A
                </span>
                <span>https://{currentHost}/{alias || 'user'}</span>
              </div>

              <h4 className="text-sm font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer truncate">
                {seoTitle || t('cardSettings.google_preview_default_title')}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {seoDescription || t('cardSettings.google_preview_default_desc')}
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              {t('cardSettings.google_preview_hint')}
            </p>
          </div>

          {/* Social Share Preview Card */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>{t('cardSettings.social_preview_title')}</span>
            </h3>

            <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60">
              <div className="h-28 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black font-sans text-xl">
                {getLocalizedText(profile?.displayName, language, 'Arya Link Card')}
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] text-slate-400 font-sans block uppercase tracking-wider">
                  {currentHost}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {seoTitle || t('cardSettings.social_preview_default_title')}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {seoDescription || t('cardSettings.social_preview_default_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

