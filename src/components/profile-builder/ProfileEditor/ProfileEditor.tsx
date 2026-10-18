'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { ProfileThemeConfig, HeaderLayoutType, ProfileLanguage, ProfileType, VerificationData } from '@/types/profile.types';
import { ModuleSelectorModal } from './ModuleSelectorModal';
import { SectionModulesList } from './SectionModulesList';
import { ProfileSwitcher } from './ProfileSwitcher';
import { CrmLeadsTable } from './CrmLeadsTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileUploader } from '@/components/ui/file-uploader';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';
import {
  Plus,
  Check,
  Loader2,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  Globe,
  EyeOff,
  Crown,
  Link2,
  Copy,
  CheckCheck,
  ExternalLink,
  Search,
  LogOut,
  LayoutTemplate,
  BadgeCheck,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Building2,
  User,
  Users,
  Mail,
  Settings,
  X,
} from 'lucide-react';

export const ProfileEditor: React.FC = () => {
  const { data: session } = useSession();
  const {
    profile,
    isDirty,
    isSaving,
    isLoading,
    lastSavedAt,
    updateBasicInfo,
    setHeaderLayout,
    setProfileLanguage,
    updateTheme,
    setThemePreset,
    toggleDirectMode,
    updateProSettings,
    saveProfileData,
    fetchProfileData,
    fetchProfilesList,
    // KYC & Verification
    setProfileType,
    updateVerificationData,
    submitVerification,
    toggleVerifiedBadge,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'content' | 'appearance' | 'settings' | 'crm'>('content');
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);

  // Smart Language Detection Warning (warns once per session)
  const hasWarnedRef = useRef(false);

  const checkLanguageMismatch = (text: string) => {
    if (!text || text.trim().length < 3 || hasWarnedRef.current) return;

    const currentLang = profile.profileLanguage || 'dari';
    const hasLatin = /[a-zA-Z]/.test(text);
    const hasPersoArabic = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);

    let isMismatch = false;
    let selectedLangName = 'دری';

    if (currentLang === 'dari') {
      selectedLangName = 'دری';
      if (hasLatin && !hasPersoArabic) {
        isMismatch = true;
      }
    } else if (currentLang === 'pashto') {
      selectedLangName = 'پښتو';
      if (hasLatin && !hasPersoArabic) {
        isMismatch = true;
      }
    } else if (currentLang === 'en') {
      selectedLangName = 'English';
      if (hasPersoArabic && !hasLatin) {
        isMismatch = true;
      }
    }

    if (isMismatch) {
      hasWarnedRef.current = true;
      toast.warning(`زبان پروفایل شما ${selectedLangName} است، اما به نظر می‌رسد اطلاعات را به زبان دیگری وارد کرده‌اید.`, {
        description: 'این صرفاً یک هشدار است و مانعی برای ذخیره یا تایپ اطلاعات شما نیست.',
        duration: 6000,
      });
    }
  };

  const handleSubmitKYCDocuments = async () => {
    setIsSubmittingKYC(true);
    const toastId = toast.loading('در حال بارگذاری و ثبت مدارک احراز هویت در دیتابیس...');
    try {
      await submitVerification();
      toast.success('مدارک شما با موفقیت ثبت شد و در صف بررسی ضدجعل قرار گرفت.', {
        id: toastId,
        description: 'نتیجه تایید تیک آبی پس از تطبیق تصویر با مدرک هویتی اعلام خواهد شد.',
        duration: 5000,
      });
    } catch (err) {
      toast.error('خطا در ثبت مدارک', { id: toastId });
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const profileLang = profile.profileLanguage || 'dari';
  const isLangEn = profileLang === 'en';
  const isLangPs = profileLang === 'pashto';

  const t = {
    contentTab: isLangEn ? 'Content & Modules' : isLangPs ? 'منځپانګه او ماډلونه' : 'محتوا و ماژول‌ها',
    appearanceTab: isLangEn ? 'Design & Theme' : isLangPs ? 'ډیزاین او بڼه' : 'طراحی و تم',
    settingsTab: isLangEn ? 'Settings & SEO' : isLangPs ? 'تنظیمات او SEO' : 'تنظیمات، سئو و وایت‌لیبل',
    basicInfo: isLangEn ? 'Profile Identity' : isLangPs ? 'د پروفایل پیژندنه' : 'اطلاعات شناسنامه‌ای پروفایل',
    displayName: isLangEn ? 'Full Name' : isLangPs ? 'بشپړ نوم' : 'نام و تخلص',
    displayNamePlaceholder: isLangEn ? 'e.g. Ahmad Niazi' : isLangPs ? 'مثال: احمد نیازی' : 'مثال: احمد نیازی',
    headline: isLangEn ? 'Job Title / Profession' : isLangPs ? 'دندې سرلیک / مسلک' : 'عنوان شغلی / تخصص',
    headlinePlaceholder: isLangEn ? 'e.g. Senior Marketing Director' : isLangPs ? 'مثال: د بازارموندنې مشر' : 'مثال: مدیر ارشد بازاریابی',
    bio: isLangEn ? 'Short Bio / About' : isLangPs ? 'لنډه پیژندنه' : 'بیوگرافی و معرفی کوتاه',
    bioPlaceholder: isLangEn ? 'Write about your background, company or services...' : isLangPs ? 'د خپلو خدماتو او تجربې په اړه ولیکئ...' : 'درباره خدمات، شرکت یا سوابق کاری خود بنویسید...',
    headerLayout: isLangEn ? 'Header Layout' : isLangPs ? 'د سرپاڼې بڼه' : 'حالت نمایش هدر و چیدمان پروفایل',
    profileSettingsBtn: isLangEn ? 'Profile Settings' : isLangPs ? 'د پروفایل تنظیمات' : 'تنظیمات پروفایل',
    crmTab: isLangEn ? 'Messages' : isLangPs ? 'پیغامونه' : 'پیام‌ها',
  };

  // Auto-fetch profile data & profiles list from MongoDB on mount
  useEffect(() => {
    fetchProfilesList();
  }, [fetchProfilesList]);

  const handleCopyLink = () => {
    const fullUrl = `https://aryal.ink/${profile.alias}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedAlias(true);
    toast.success('لینک پروفایل در کلیپ‌بورد کپی شد!', {
      description: fullUrl,
      duration: 2500,
    });
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  const handlePublish = async () => {
    if (isSaving) return;

    const toastId = toast.loading('در حال انتشار و ذخیره در پایگاه داده...');
    const result = await saveProfileData();

    if (result.success) {
      toast.success(result.message || 'تغییرات با موفقیت در پایگاه داده منتشر شد!', {
        id: toastId,
        description: `کارت هوشمند aryal.ink/${profile.alias} ذخیره و فعال است.`,
        duration: 4000,
      });
    } else {
      toast.error('خطا در انتشار تغییرات', {
        id: toastId,
        description: result.message || 'مشکلی در ارتباط با دیتابیس MongoDB رخ داده است.',
        duration: 5000,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card text-foreground border-l border-border w-full max-w-2xl mx-auto shadow-2xl overflow-hidden font-sans transition-colors duration-200" dir="rtl">
      {/* Editor Header */}
      <header className="p-4 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 font-outfit shrink-0">
            AL
          </div>
          <ProfileSwitcher />

          {/* Profile Settings Gear Icon Button */}
          <button
            type="button"
            onClick={() => setIsProfileSettingsOpen(true)}
            className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-cyan-500 transition-colors flex items-center justify-center shrink-0 shadow-sm"
            title="تنظیمات پروفایل، زبان و احراز هویت تیک آبی"
            aria-label="تنظیمات پروفایل"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Dashboard Dark/Light Theme Switcher */}
          <ThemeToggle />

          {/* User Sign Out */}
          {session?.user && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors flex items-center justify-center shrink-0"
              title={`خروج از حساب (${session.user.name || session.user.email})`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Save / Publish Button */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${isSaving
              ? 'bg-muted text-muted-foreground cursor-wait'
              : isDirty
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95 ring-2 ring-cyan-500/30'
                : 'bg-cyan-600/15 hover:bg-cyan-600/25 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
              }`}
            title="انتشار تغییرات در پایگاه داده MongoDB"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                <span>در حال انتشار...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                <span>انتشار</span>
                {isDirty && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Navigation Tabs - 3 Main Tabs */}
      <div className="flex border-b border-border bg-muted/40 p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'content'
            ? 'bg-card text-foreground shadow-sm font-bold border border-border'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t.contentTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'appearance'
            ? 'bg-card text-foreground shadow-sm font-bold border border-border'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{t.appearanceTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'settings'
            ? 'bg-card text-foreground shadow-sm font-bold border border-border'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t.settingsTab}</span>
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'crm'
            ? 'bg-card text-foreground shadow-sm font-bold border border-border text-cyan-600 dark:text-cyan-400'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span className="truncate">{t.crmTab}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
        </button>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {/* TAB 1: CONTENT & MODULES */}
        {activeTab === 'content' && (
          <>
            {/* Basic Info Section */}
            <section className="bg-muted/30 border border-border rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>{t.basicInfo}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t.displayName}</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => updateBasicInfo({ displayName: e.target.value })}
                    onBlur={(e) => checkLanguageMismatch(e.target.value)}
                    placeholder={t.displayNamePlaceholder}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t.headline}</label>
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => updateBasicInfo({ headline: e.target.value })}
                    onBlur={(e) => checkLanguageMismatch(e.target.value)}
                    placeholder={t.headlinePlaceholder}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t.bio}</label>
                <textarea
                  rows={2}
                  value={profile.bio}
                  onChange={(e) => updateBasicInfo({ bio: e.target.value })}
                  onBlur={(e) => checkLanguageMismatch(e.target.value)}
                  placeholder={t.bioPlaceholder}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none font-sans"
                />
              </div>

              {/* Header Layout Selector */}
              <div className="pt-2 border-t border-border/80">
                <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{t.headerLayout}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mode 1: Curve */}
                  <button
                    type="button"
                    onClick={() => setHeaderLayout('curve')}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${(profile.headerLayout || 'curve') === 'curve'
                      ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/30'
                      : 'bg-card border-border hover:border-cyan-500/40'
                      }`}
                  >
                    <div className="w-full h-12 rounded-xl bg-slate-900/40 mb-2 relative overflow-hidden flex items-end justify-center">
                      <div
                        className="w-full h-9 bg-gradient-to-r from-blue-600 to-cyan-500 absolute top-0 left-0"
                        style={{ clipPath: 'ellipse(85% 100% at 50% 0%)' }}
                      />
                      <div className="w-6 h-6 rounded-full bg-cyan-400 border-2 border-background relative z-10 -bottom-1 shadow-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">۱. منحنی</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        کاور بالا با لبه قوسی و آواتار دایره‌ای در مرکز روی خط تقاطع
                      </p>
                    </div>
                    {(profile.headerLayout || 'curve') === 'curve' && (
                      <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                  </button>

                  {/* Mode 2: Gradient Mask */}
                  <button
                    type="button"
                    onClick={() => setHeaderLayout('gradient_mask')}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${profile.headerLayout === 'gradient_mask'
                      ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/30'
                      : 'bg-card border-border hover:border-cyan-500/40'
                      }`}
                  >
                    <div className="w-full h-12 rounded-xl bg-gradient-to-l from-indigo-600 via-cyan-600 to-transparent mb-2 relative p-1.5 flex items-center justify-end">
                      <div className="w-7 h-7 rounded-lg bg-cyan-400 border border-white/50 shadow-sm" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">۲. ماسک گرادیانت</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        کاور مستطیلی محو شونده با آواتار گوشه‌گرد و نام در کنار آن
                      </p>
                    </div>
                    {profile.headerLayout === 'gradient_mask' && (
                      <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                  </button>

                  {/* Mode 3: Minimal */}
                  <button
                    type="button"
                    onClick={() => setHeaderLayout('minimal')}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${profile.headerLayout === 'minimal'
                      ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/30'
                      : 'bg-card border-border hover:border-cyan-500/40'
                      }`}
                  >
                    <div className="w-full h-12 rounded-xl bg-muted/40 mb-2 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md ring-2 ring-cyan-400/40" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">۳. مینیمال</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        بدون تصویر کاور، فقط عکس پروفایل بزرگ در مرکز
                      </p>
                    </div>
                    {profile.headerLayout === 'minimal' && (
                      <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              {/* Uploaders for Avatar & Cover */}
              <div className={`pt-2 ${profile.headerLayout === 'minimal' ? 'w-full' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                <FileUploader
                  value={profile.avatarUrl}
                  onChange={(url) => updateBasicInfo({ avatarUrl: url })}
                  fileType="image"
                  folder="avatars"
                  label="تصویر پروفایل / آواتار"
                  description="فرمت‌های JPG، PNG، WEBP (فشرده‌سازی خودکار تا ۲ مگابایت)"
                  maxSizeMB={2}
                  aspectRatio="square"
                  className="w-full"
                />

                {profile.headerLayout !== 'minimal' && (
                  <FileUploader
                    value={profile.coverUrl || ''}
                    onChange={(url) => updateBasicInfo({ coverUrl: url })}
                    fileType="image"
                    folder="covers"
                    label="تصویر کاور هدر"
                    description="تصویر بنر بالای پروفایل (حداکثر ۲ مگابایت با بهینه‌سازی خودکار)"
                    maxSizeMB={2}
                    aspectRatio="banner"
                    className="w-full"
                  />
                )}
              </div>
            </section>

            {/* Modules List & Add Button */}
            <section className="bg-muted/30 border border-border rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    ماژول‌ها و دکمه‌های کارت ({profile.links.length})
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    هر تغییری در لحظه روی موبایل شبیه‌ساز سمت راست نمایش داده می‌شود.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(true)}
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  افزودن ماژول هوشمند
                </button>
              </div>

              {/* Dynamic Section Modules List */}
              <SectionModulesList />

              {profile.links.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs space-y-2">
                  <p>هنوز ماژولی به کارت خود اضافه نکرده‌اید.</p>
                  <button
                    type="button"
                    onClick={() => setIsModuleModalOpen(true)}
                    className="inline-flex items-center gap-1 text-cyan-500 font-bold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    انتخاب اولین ماژول از کاتالوگ
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* TAB 2: APPEARANCE & CUSTOMIZATION (ACCORDION) */}
        {activeTab === 'appearance' && (
          <section className="space-y-4">
            <Accordion type="single" collapsible defaultValue="templates" className="space-y-3">
              {/* 1. قالب‌ها (Templates) */}
              <AccordionItem value="templates" className="border border-border rounded-2xl bg-card overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">قالب‌های از پیش آماده (Templates)</span>
                      <span className="text-[10px] text-muted-foreground block">انتخاب طرح‌های رنگی آماده و مدرن</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {[
                      { id: 'dark_neon', title: 'نئون تاریک', tag: 'رایگان', bg: 'from-slate-950 via-slate-900 to-indigo-950', ring: 'ring-cyan-500', isLight: false },
                      { id: 'glass_morphism', title: 'شیشه‌ای لوکس', tag: 'PRO', bg: 'from-purple-950 via-violet-900 to-slate-950', ring: 'ring-violet-500', isLight: false },
                      { id: 'emerald_luxury', title: 'زمردی شاهانه', tag: 'PRO', bg: 'from-emerald-950 via-teal-900 to-slate-950', ring: 'ring-emerald-500', isLight: false },
                      { id: 'royal_gold', title: 'طلایی لوکس', tag: 'PRO', bg: 'from-amber-950 via-stone-900 to-black', ring: 'ring-amber-500', isLight: false },
                      { id: 'minimal_light', title: 'مینیمال روشن', tag: 'رایگان', bg: 'from-slate-100 via-white to-slate-200', ring: 'ring-sky-500', isLight: true },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setThemePreset(theme.id as ProfileThemeConfig['preset'])}
                        className={`p-3 rounded-2xl border text-right transition-all bg-gradient-to-br ${theme.bg} ${profile.themeConfig.preset === theme.id
                          ? `border-cyan-400 ring-2 ${theme.ring} shadow-lg shadow-cyan-500/10`
                          : 'border-border/80 hover:border-border opacity-70 hover:opacity-100'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold block ${theme.isLight ? 'text-slate-900' : 'text-white'}`}>
                            {theme.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${theme.tag === 'PRO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {theme.tag}
                          </span>
                        </div>
                        <span className={`text-[10px] block mt-1 ${theme.isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {profile.themeConfig.preset === theme.id ? '✓ قالب فعال' : 'انتخاب'}
                        </span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. پس‌زمینه (Background) */}
              <AccordionItem value="background" className="border border-border rounded-2xl bg-card overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">پس‌زمینه کارت (Background)</span>
                      <span className="text-[10px] text-muted-foreground block">نوع پس‌زمینه (توپر، گرادیانت، پترن)</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      حالت پس‌زمینه
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'solid', label: 'توپر (Solid)' },
                        { id: 'gradient', label: 'گرادیانت (Gradient)' },
                        { id: 'pattern', label: 'پترن (Pattern)' },
                      ].map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => updateTheme({ backgroundType: bg.id as any })}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${(profile.themeConfig.backgroundType || 'gradient') === bg.id
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                            }`}
                        >
                          {bg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-2">
                    <span className="text-[11px] text-muted-foreground block">
                      {(profile.themeConfig.backgroundType || 'gradient') === 'solid' && 'رنگ یکدست پس‌زمینه برای داشتن ظاهری مینیمال و تمیز.'}
                      {(profile.themeConfig.backgroundType || 'gradient') === 'gradient' && 'ترکیب نرم چند طیف رنگی بر اساس تم فعال شده.'}
                      {(profile.themeConfig.backgroundType || 'gradient') === 'pattern' && 'طرح نئونی شبکه مویرگی مدرن در پس‌زمینه کارت.'}
                    </span>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. دکمه‌ها (Buttons) */}
              <AccordionItem value="buttons" className="border border-border rounded-2xl bg-card overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">دکمه‌ها و عناصر تعاملی (Buttons)</span>
                      <span className="text-[10px] text-muted-foreground block">تنظیم نوع حاشیه، گوشه‌ها و سایه‌ها</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1 space-y-4">
                  {/* Border Style */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      نوع حاشیه دکمه‌ها (Border Style)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'solid', label: 'پیوسته (Solid)' },
                        { id: 'dashed', label: 'خط‌چین (Dashed)' },
                        { id: 'none', label: 'بدون حاشیه' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => updateTheme({ buttonBorderStyle: b.id as any })}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${(profile.themeConfig.buttonBorderStyle || 'solid') === b.id
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                            }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shadow Style */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      نوع سایه دکمه‌ها (Button Shadow)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'none', label: 'بدون سایه' },
                        { id: 'sm', label: 'ملایم' },
                        { id: 'md', label: 'عمیق' },
                        { id: 'glow', label: 'نئونی' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateTheme({ buttonShadowStyle: s.id as any })}
                          className={`py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${(profile.themeConfig.buttonShadowStyle || 'sm') === s.id
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                            }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corner Radius (Visual Graphic Selectors) */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      شکل و گردی گوشه دکمه‌ها (Corner Radius)
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        {
                          id: 'rounded-none',
                          label: 'مربع کامل',
                          sub: 'تیز (Sharp)',
                          shapeClass: 'rounded-none',
                        },
                        {
                          id: 'rounded-md',
                          label: 'لبه‌گرد ملایم',
                          sub: 'نرم (Soft)',
                          shapeClass: 'rounded-md',
                          isMatch: (val?: string) => val === 'rounded-md' || val === 'rounded-lg' || val === 'rounded-2xl' || !val,
                        },
                        {
                          id: 'rounded-full',
                          label: 'کاملاً گرد',
                          sub: 'کپسولی (Pill)',
                          shapeClass: 'rounded-full',
                        },
                      ].map((r) => {
                        const isSelected = r.isMatch
                          ? r.isMatch(profile.themeConfig.borderRadius) && profile.themeConfig.borderRadius !== 'rounded-none' && profile.themeConfig.borderRadius !== 'rounded-full'
                          : profile.themeConfig.borderRadius === r.id;

                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => updateTheme({ borderRadius: r.id })}
                            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${isSelected
                              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-500 ring-2 ring-cyan-500/30 shadow-md shadow-cyan-500/10 font-bold'
                              : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                              }`}
                          >
                            <div className="w-12 h-6 flex items-center justify-center">
                              <div
                                className={`w-10 h-5 border-2 ${isSelected ? 'border-cyan-500 bg-cyan-500/20' : 'border-current bg-foreground/5'
                                  } ${r.shapeClass} transition-all`}
                              />
                            </div>
                            <div>
                              <span className={`text-xs font-bold block ${isSelected ? 'text-foreground' : ''}`}>
                                {r.label}
                              </span>
                              <span className="text-[10px] opacity-70 block font-outfit mt-0.5" dir="ltr">
                                {r.id}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. رنگ‌ها (Color Pickers) */}
              <AccordionItem value="colors" className="border border-border rounded-2xl bg-card overflow-hidden">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">رنگ‌ها و گرادیانت (Color Pickers)</span>
                      <span className="text-[10px] text-muted-foreground block">انتخاب پالت رنگی اصلی و متون</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Primary Color */}
                    <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={profile.themeConfig.primaryColor || '#06b6d4'}
                          onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                          className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                        />
                        <div>
                          <span className="text-xs font-medium text-foreground block">رنگ شروع گرادیانت</span>
                          <span className="font-outfit font-semibold text-[11px] text-muted-foreground uppercase">
                            {profile.themeConfig.primaryColor || '#06b6d4'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={profile.themeConfig.accentColor || '#3b82f6'}
                          onChange={(e) => updateTheme({ accentColor: e.target.value })}
                          className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                        />
                        <div>
                          <span className="text-xs font-medium text-foreground block">رنگ پایان گرادیانت</span>
                          <span className="font-outfit font-semibold text-[11px] text-muted-foreground uppercase">
                            {profile.themeConfig.accentColor || '#3b82f6'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gradient Preview Bar */}
                  <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium">پیش‌نمایش گرادیانت دکمه:</span>
                    <div
                      className="h-8 flex-1 max-w-xs rounded-xl shadow-sm border border-white/20 flex items-center justify-center text-xs font-bold text-white transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${profile.themeConfig.primaryColor || '#06b6d4'}, ${profile.themeConfig.accentColor || '#3b82f6'})`,
                      }}
                    >
                      نمونه دکمه
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        )}

        {/* TAB 3: SETTINGS, SEO & WHITE-LABEL */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 1. PROFILE ALIAS & UNIQUE URL */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-cyan-500" />
                    آدرس یکتا و نام کاربری
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    نشانی اینترنتی اختصاصی کارت هوشمند و لینک‌بایوی شما
                  </p>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                  دامنه aryal.ink
                </span>
              </div>

              <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    نام کاربری (لینک پروفایل)
                  </label>
                  <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:border-cyan-500" dir="ltr">
                    <span className="px-3 py-2 text-xs font-outfit text-muted-foreground border-r border-border select-none bg-muted/50" dir="ltr">
                      aryal.ink/
                    </span>
                    <input
                      type="text"
                      value={profile.alias}
                      onChange={(e) => {
                        const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                        updateBasicInfo({ alias: clean });
                      }}
                      placeholder="username"
                      className="w-full bg-transparent border-0 py-2 px-3 text-xs font-outfit text-foreground focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    این نام به عنوان آدرس QR Code و تپ NFC شما استفاده می‌شود.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 border border-border transition-all active:scale-95"
                  >
                    {copiedAlias ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">آدرس کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی لینک اختصاصی</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://aryal.ink/${profile.alias}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-colors"
                    title="مشاهده آدرس"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </section>

            {/* 2. WHITE-LABEL BRANDING */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    حذف برندینگ آریا لینک
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    سفارشی‌سازی کامل هویت بصری بدون نام آریا لینک
                  </p>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  ویژگی PRO
                </span>
              </div>

              <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">
                    پنهان کردن لوگوی آریا لینک در صفحه (ویژه کاربران Pro)
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    با فعال‌سازی این گزینه، فوتر «طراحی شده با Arya Link» از پایین کارت حذف خواهد شد.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={profile.hideBranding || false}
                    onChange={(e) => updateProSettings({ hideBranding: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </section>

            {/* 3. SEO & SOCIAL SHARING */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  تنظیمات سئو و پیش‌نمایش اشتراک‌گذاری
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                متن‌هایی که در هنگام اشتراک‌گذاری کارت در واتساپ، تلگرام یا موتورهای جستجو دیده می‌شوند:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">عنوان سئو</label>
                  <input
                    type="text"
                    value={profile.seoTitle || ''}
                    onChange={(e) => updateProSettings({ seoTitle: e.target.value })}
                    placeholder="مثال: احمد نیازی | کارت ویزیت دیجیتال و بیو هوشمند"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">توضیحات سئو</label>
                  <textarea
                    rows={2}
                    value={profile.seoDescription || ''}
                    onChange={(e) => updateProSettings({ seoDescription: e.target.value })}
                    placeholder="توضیحات کوتاه درباره خدمات و راه ارتباطی با شما..."
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-500 font-sans resize-none"
                  />
                </div>

                {/* Google Search Result Preview Card */}
                <div className="p-3.5 rounded-2xl border border-border bg-card/60 space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                    <Search className="w-3 h-3 text-blue-500" />
                    <span>پیش‌نمایش در نتایج گوگل</span>
                  </div>
                  <div className="space-y-0.5 text-right font-sans pt-1">
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-outfit" dir="ltr">
                      https://aryal.ink › {profile.alias}
                    </div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                      {profile.seoTitle || `${profile.displayName} | کارت ویزیت هوشمند آریا لینک`}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {profile.seoDescription || profile.bio || 'صفحه اختصاصی ارتباط، شبکه‌های اجتماعی و سفارش خدمات با کارت هوشمند مبتنی بر NFC در سراسر افغانستان.'}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. DIRECT MODE */}
            <section className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  حالت مستقیم
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  با تپ کردن کارت NFC یا اسکن کد QR، صفحه پروفایل باز نشده و بازدیدکننده فوراً به آدرس مشخص‌شده هدایت می‌شود.
                </p>
              </div>

              <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground block">فعال‌سازی حالت مستقیم</span>
                  <span className="text-xs text-muted-foreground">
                    {profile.directModeEnabled ? 'فعال (هدایت سریع)' : 'غیرفعال (نمایش کارت دیجیتال)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDirectMode()}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${profile.directModeEnabled ? 'bg-cyan-500' : 'bg-muted'
                    }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${profile.directModeEnabled ? '-translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {profile.directModeEnabled && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-medium text-cyan-500">نشانی مقصد هدایت مستقیم</label>
                  <input
                    type="url"
                    value={profile.directModeUrl || ''}
                    onChange={(e) => toggleDirectMode(true, e.target.value)}
                    placeholder="https://instagram.com/your_id یا https://wa.me/..."
                    className="w-full bg-background border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-foreground placeholder:font-sans placeholder-muted-foreground focus:outline-none focus:border-cyan-400 font-outfit text-left"
                    dir="ltr"
                  />
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 4: MINI CRM & LEADS TABLE */}
        {activeTab === 'crm' && (
          <CrmLeadsTable profileAlias={profile.alias} />
        )}
      </div>

      {/* Profile Settings Modal (4 Tabs: عمومی، سئو، دسترسی، احراز هویت) */}
      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
      />

      {/* Module Selector Dialog Modal */}
      <ModuleSelectorModal
        open={isModuleModalOpen}
        onOpenChange={setIsModuleModalOpen}
      />
    </div>
  );
};

export default ProfileEditor;
