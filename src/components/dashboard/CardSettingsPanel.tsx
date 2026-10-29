'use client';

import React, { useState, useEffect } from 'react';
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
      setSeoTitle(profile.seoTitle || `${profile.displayName || 'کارت هوشمند'} | آریا لینک`);
      setSeoDescription(profile.seoDescription || profile.bio || 'صفحه ارتباطی هوشمند و کارت ویزیت NFC');
      setAlias(profile.alias || '');
      setHideBranding(Boolean(profile.hideBranding));
      setDirectMode(Boolean(profile.directModeEnabled));
      setDirectUrl(profile.directModeUrl || '');
    }
  }, [profile]);

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
        toast.success('تنظیمات، سئو و وایت‌لیبل این لینک با موفقیت ذخیره شد.');
      } else {
        toast.error(res.message || 'خطا در ذخیره‌سازی تنظیمات.');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('خطا در ذخیره‌سازی تنظیمات.');
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
      dir="rtl"
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
                تنظیمات، سئو و وایت‌لیبل
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                مدیریت نحوه نمایش کارت در موتورهای جستجو، شناسه دامنه اختصاصی و برندینگ شخصی
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
              <span>در حال ذخیره...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات</span>
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
                تنظیمات سئو و دامنه مختص لینک: {profile?.displayName || activeCard?.displayName || 'کارت هوشمند'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-outfit font-bold" dir="ltr">
                aryal.ink/{profile?.alias || activeCard?.alias || 'card'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              عنوان سئو، توضیحات متا و تنظیمات وایت‌لیبل مستقیماً بر روی همین لینک اعمال می‌گردند.
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
            <span>مشاهده نسخه زنده</span>
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
                سئو و بهینه‌سازی موتورهای جستجو (SEO & Meta Tags)
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  عنوان صفحه در گوگل (SEO Title)
                </label>
                <Input
                  type="text"
                  placeholder="مثال: انجینیر احمد فیاض | مدیر ارشد فناوری"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  maxLength={70}
                  className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-xs"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>تعداد کاراکتر پیشنهادی بین 40 تا 60 کاراکتر است.</span>
                  <span className="font-outfit">{seoTitle.length} / 70</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  توضیحات متا در گوگل و شبکه‌های اجتماعی (Meta Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="خلاصه‌ای جذاب درباره تخصص، شرکت و راه‌های ارتباطی خود بنویسید..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  maxLength={160}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>حداکثر 160 کاراکتر جهت نمایش بهینه در گوگل.</span>
                  <span className="font-outfit">{seoDescription.length} / 160</span>
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
                  وایت‌لیبل و حذف برندینگ (White-label)
                </h2>
              </div>
              <Badge variant="cyan" className="text-[10px] font-outfit uppercase">
                ویژه Pro
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    حذف نشان تجاری «Powered by Arya Link»
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    لوگو و واترمارک آریا لینک را از پایین کارت هوشمند شما به طور کامل حذف می‌کند.
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
                شناسه آدرس و دامنه اختصاصی (Custom Domain & Alias)
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  شناسه عمومی کارت شما (Alias)
                </label>
                <div className="flex items-center rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 overflow-hidden" dir="ltr">
                  <span className="px-3.5 text-xs text-slate-400 font-outfit border-r border-slate-200 dark:border-white/10 select-none">
                    {currentHost}/
                  </span>
                  <Input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="border-0 bg-transparent rounded-none h-11 text-xs font-outfit font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>اتصال دامنه اختصاصی (Custom Domain)</span>
                  <Badge variant="outline" className="text-[10px] font-outfit">
                    سازمانی
                  </Badge>
                </label>
                <Input
                  type="text"
                  placeholder="مثال: card.mycompany.af"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-xs font-outfit"
                  dir="ltr"
                />
                <div className="p-3 rounded-xl bg-cyan-500/10 text-[11px] text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                  برای فعال‌سازی دامنه، رکورد <code className="font-outfit font-bold">CNAME</code> دامنه خود را روی <code className="font-outfit font-bold">cname.aryalink.af</code> تنظیم کنید.
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
                  حالت هدایت مستقیم (Direct Redirect Mode)
                </h2>
              </div>
              <Switch
                checked={directMode}
                onCheckedChange={setDirectMode}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              با فعال بودن این قابلیت، با اسکن کارت NFC یا باز کردن لینک، کاربر به جای مشاهده پروفایل به صورت خودکار به لینک مقصد (مثلاً واتساپ یا وب‌سایت) هدایت خواهد شد.
            </p>

            {directMode && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  آدرس اینترنتی مقصد مستقیم (Destination URL)
                </label>
                <Input
                  type="url"
                  placeholder="https://wa.me/93799123456"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-xs font-outfit"
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
              <span>پیش‌نمایش در نتایج جستجوی گوگل (Google SERP)</span>
            </h3>

            {/* Google Result Card Mockup */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 space-y-1.5 text-right font-sans" dir="rtl">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-outfit" dir="ltr">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-500 text-[10px] font-bold flex items-center justify-center">
                  A
                </span>
                <span>https://{currentHost}/{alias || 'user'}</span>
              </div>

              <h4 className="text-sm font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer truncate">
                {seoTitle || 'عنوان کارت هوشمند شما در آریا لینک'}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {seoDescription || 'توضیحات کوتاه درباره زمینه کاری، خدمات و اطلاعات تماس شما برای نمایش در موتورهای جستجو.'}
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              این پیش‌نمایش نحوه ظاهر شدن کارت هوشمند شما را هنگامی که اشخاص نام شما را در گوگل جستجو می‌کنند شبیه‌سازی می‌کند.
            </p>
          </div>

          {/* Social Share Preview Card */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>پیش‌نمایش اشتراک‌گذاری در واتساپ و تلگرام</span>
            </h3>

            <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-800/60">
              <div className="h-28 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black font-outfit text-xl">
                {profile?.displayName || 'Arya Link Card'}
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] text-slate-400 font-outfit block uppercase tracking-wider">
                  {currentHost}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {seoTitle || 'کارت هوشمند دیجیتال'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {seoDescription || 'برای مشاهده راه‌های ارتباطی کلیک کنید.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

