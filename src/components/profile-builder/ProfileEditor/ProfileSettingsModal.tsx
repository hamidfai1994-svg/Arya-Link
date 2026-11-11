'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { ProfileLanguage, ProfileType, ProfileData } from '@/types/profile.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { PhoneInput } from '@/components/ui/phone-input';
import { toast } from 'sonner';
import {
  Settings,
  Globe,
  Search,
  Lock,
  Copy,
  CheckCheck,
  ExternalLink,
  Building2,
  User,
  Loader2,
  Sparkles,
  Link2,
  X,
  ChevronDown,
  Send,
  Bot,
  Info,
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    profile,
    isDirty,
    updateBasicInfo,
    setProfileLanguage,
    toggleDirectMode,
    updateProSettings,
    updateCrmSettings,
    setProfileType,
    saveProfileData,
    resetState,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'access' | 'crm_integration'>('general');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Snapshot profile state on modal open so "انصراف" can revert changes
  const snapshotRef = useRef<ProfileData | null>(null);

  useEffect(() => {
    if (isOpen) {
      snapshotRef.current = JSON.parse(JSON.stringify(profile));
    }
  }, [isOpen]);

  const handleSaveAndConfirm = async () => {
    setIsSavingSettings(true);
    const toastId = toast.loading('در حال ذخیره و اعمال تنظیمات...');
    try {
      const res = await saveProfileData();
      if (res.success) {
        toast.success('تنظیمات پروفایل با موفقیت ذخیره و اعمال شد.', { id: toastId });
        onClose();
      } else {
        toast.error(res.message || 'خطا در ذخیره‌سازی تنظیمات.', { id: toastId });
      }
    } catch (err) {
      toast.error('خطای شبکه در ذخیره‌سازی تنظیمات.', { id: toastId });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCancel = () => {
    if (snapshotRef.current) {
      resetState(snapshotRef.current);
    }
    toast.info('تغییرات نادیده گرفته شد و فرم بسته شد.');
    onClose();
  };

  const handleCopyLink = () => {
    const url = `https://aryal.ink/${profile.alias}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('لینک پروفایل در کلیپ‌بورد کپی شد!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenBot = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDirty) {
      toast.error('لطفاً ابتدا تغییرات خود را با زدن دکمه ذخیره، ثبت کنید.');
      return;
    }
    window.open('https://t.me/AryaLinkBot?start=crm', '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card text-foreground border border-border shadow-2xl font-sans"
        dir="rtl"
      >
        {/* Modal Header */}
        <DialogHeader className="p-5 pb-3 border-b border-border text-right bg-muted/40">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                تنظیمات اختصاصی این لینک
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                مدیریت نام کاربری، زبان، سئو، وایت‌لیبل و امنیت دسترسی مختص همین کارت
              </DialogDescription>
            </div>
          </div>

          {/* Tabs Bar (RTL Orientation: عمومی و زبان on far right, اتصال تلگرام on far left) */}
          <div className="pt-3 w-full" dir="rtl">
            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} dir="rtl" className="w-full">
              <TabsList className="flex flex-row w-full bg-muted/80 p-1 rounded-xl" dir="rtl">
                <TabsTrigger value="general" className="flex-1 text-xs font-semibold gap-1.5 data-[state=active]:font-bold cursor-pointer">
                  <Globe className="w-3.5 h-3.5" />
                  <span>عمومی و زبان</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex-1 text-xs font-semibold gap-1.5 data-[state=active]:font-bold cursor-pointer">
                  <Search className="w-3.5 h-3.5" />
                  <span>سئو و متاتگ</span>
                </TabsTrigger>
                <TabsTrigger value="access" className="flex-1 text-xs font-semibold gap-1.5 data-[state=active]:font-bold cursor-pointer">
                  <Lock className="w-3.5 h-3.5" />
                  <span>دسترسی و هدایت</span>
                </TabsTrigger>
                <TabsTrigger value="crm_integration" className="flex-1 text-xs font-semibold gap-1.5 data-[state=active]:font-bold cursor-pointer">
                  <Send className="w-3.5 h-3.5 text-sky-500" />
                  <span>اتصال تلگرام</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Alias & Link */}
              <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      نام کاربری و نشانی اختصاصی کارت
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      آدرس عمومی کارت شما در وب
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                  >
                    {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-cyan-500" />}
                    <span>{copiedLink ? 'کپی شد' : 'کپی لینک'}</span>
                  </button>
                </div>

                <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden focus-within:border-cyan-500" dir="ltr">
                  <span className="px-3 py-2 text-xs font-sans text-muted-foreground border-r border-border bg-muted/50 select-none">
                    aryal.ink/
                  </span>
                  <input
                    type="text"
                    value={profile.alias}
                    onChange={(e) => updateBasicInfo({ alias: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    placeholder="username"
                    className="w-full bg-transparent border-0 py-2 px-3 text-xs font-sans text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Direct Contact: Phone & Email (Fully Editable) */}
              <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    اطلاعات تماس مستقیم و عمومی کارت
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">
                    شماره تماس و ایمیل رسمی شما جهت برقراری ارتباط سریع مخاطبان (قابل ویرایش)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      شماره تماس مستقیم (موبایل یا واتساپ)
                    </label>
                    <PhoneInput
                      value={profile.phone || ''}
                      onChange={(val) => updateBasicInfo({ phone: val })}
                      placeholder="799 123 456"
                      defaultCountry="AF"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      آدرس ایمیل مستقیم
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => updateBasicInfo({ email: e.target.value })}
                      placeholder="info@company.com"
                      dir="ltr"
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-sans text-foreground focus:outline-none focus:border-cyan-500 text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Type & Language Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Profile Type Selection */}
                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    نوع پروفایل کارت
                  </label>
                  <div className="relative">
                    <select
                      value={profile.profileType || 'personal'}
                      onChange={(e) => setProfileType(e.target.value as any)}
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 appearance-none font-sans font-medium cursor-pointer shadow-sm transition-colors"
                    >
                      <option value="personal">👤 شخصی / حقیقی (فردی، فریلنسر)</option>
                      <option value="business">🏢 تجاری / حقوقی (شرکت‌ها و برندها)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Language Selection */}
                <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    زبان پیش‌فرض کارت
                  </label>
                  <div className="relative">
                    <select
                      value={profile.profileLanguage || 'dari'}
                      onChange={(e) => setProfileLanguage(e.target.value as any)}
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 appearance-none font-sans font-medium cursor-pointer shadow-sm transition-colors"
                    >
                      <option value="dari">🇦🇫 دری (Dari)</option>
                      <option value="pashto">🇦🇫 پښتو (Pashto)</option>
                      <option value="en">🌐 English (انگلیسی)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Direct Mode / Fast NFC Redirect */}
              <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      هدایت مستقیم (Direct Mode / ریدایرکت آنی NFC)
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      هنگام لمس کارت هوشمند با گوشی، مخاطب بلافاصله به این لینک منتقل شود
                    </span>
                  </div>
                  <Switch
                    checked={Boolean(profile.directModeEnabled)}
                    onCheckedChange={(checked) => toggleDirectMode(checked, profile.directModeUrl)}
                  />
                </div>

                {profile.directModeEnabled && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      آدرس مقصد ریدایرکت (مثال: لینک وب‌سایت یا پیج اینستاگرام)
                    </label>
                    <input
                      type="text"
                      value={profile.directModeUrl || ''}
                      onChange={(e) => toggleDirectMode(true, e.target.value)}
                      placeholder="https://..."
                      dir="ltr"
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-sans text-foreground focus:outline-none focus:border-cyan-500 text-left"
                    />
                  </div>
                )}
              </div>

              {/* White-label Branding */}
              <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    پنهان‌سازی واترمارک آریا لینک (White-label)
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">
                    حذف عبارت "طراحی شده با آریا لینک" از پایین‌ترین قسمت کارت
                  </span>
                </div>
                <Switch
                  checked={Boolean(profile.hideBranding)}
                  onCheckedChange={(checked) => updateProSettings({ hideBranding: checked })}
                />
              </div>
            </div>
          )}

          {/* TAB 2: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                <span className="text-xs font-bold text-foreground block">
                  بهینه‌سازی متاتگ‌های جستجو (Google SEO Meta)
                </span>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    عنوان متاتگ سئو (Meta Title)
                  </label>
                  <input
                    type="text"
                    value={profile.seoTitle || ''}
                    onChange={(e) => updateProSettings({ seoTitle: e.target.value })}
                    placeholder={profile.displayName ? `${profile.displayName} | کارت ویزیت هوشمند` : 'عنوان در گوگل'}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    توضیحات متاتگ سئو (Meta Description)
                  </label>
                  <textarea
                    rows={3}
                    value={profile.seoDescription || ''}
                    onChange={(e) => updateProSettings({ seoDescription: e.target.value })}
                    placeholder="شرح کوتاه از خدمات و رزومه کاری جهت نمایش در نتایج گوگل و پیش‌نمایش شبکه‌های اجتماعی..."
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-sans resize-none"
                  />
                </div>

                {/* Google Snippet Live Preview */}
                <div className="pt-2">
                  <span className="block text-[11px] text-muted-foreground mb-1.5">
                    پیش‌نمایش در نتایج جستجوی گوگل (SERP):
                  </span>
                  <div className="p-3 bg-card border border-border rounded-xl text-left font-sans space-y-1" dir="ltr">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      https://aryal.ink/{profile.alias}
                    </div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                      {profile.seoTitle || `${profile.displayName || 'کارت هوشمند'} | Arya Link`}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {profile.seoDescription || profile.bio || 'مشاهده اطلاعات تماس و راه‌های ارتباطی در آریا لینک.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Noindex Switch */}
              <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    جلوگیری از ایندکس شدن در گوگل (Noindex)
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">
                    این کارت در نتایج عمومی موتورهای جستجو قرار نگیرد
                  </span>
                </div>
                <Switch
                  checked={Boolean((profile as any).noIndex)}
                  onCheckedChange={(checked) => updateProSettings({ noIndex: checked } as any)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: ACCESS & SECURITY */}
          {activeTab === 'access' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        محافظت از کارت با رمز عبور (Password Protection)
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block">
                        بازدیدکنندگان برای دیدن محتوای کارت باید رمز عبور را وارد کنند
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={Boolean((profile as any).passwordProtection?.enabled)}
                    onCheckedChange={(checked) => {
                      updateProSettings({
                        passwordProtection: {
                          ...((profile as any).passwordProtection || {}),
                          enabled: checked,
                        },
                      } as any);
                    }}
                  />
                </div>

                {(profile as any).passwordProtection?.enabled && (
                  <div className="pt-2 border-t border-border/80 space-y-3 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        رمز عبور دسترسی به کارت
                      </label>
                      <input
                        type="text"
                        value={(profile as any).passwordProtection?.password || ''}
                        onChange={(e) => {
                          updateProSettings({
                            passwordProtection: {
                              ...((profile as any).passwordProtection || {}),
                              password: e.target.value,
                            },
                          } as any);
                        }}
                        placeholder="یک رمز عبور امن وارد کنید"
                        dir="ltr"
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-sans text-foreground focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        راهنمای رمز عبور (جهت نمایش به مخاطب)
                      </label>
                      <input
                        type="text"
                        value={(profile as any).passwordProtection?.hint || ''}
                        onChange={(e) => {
                          updateProSettings({
                            passwordProtection: {
                              ...((profile as any).passwordProtection || {}),
                              hint: e.target.value,
                            },
                          } as any);
                        }}
                        placeholder="مثال: چهار رقم آخر شماره تماس من"
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CRM TELEGRAM INTEGRATION */}
          {activeTab === 'crm_integration' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Information Banner */}
              <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Send className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-foreground block">
                    اتصال پیام‌های مینی‌سایت به تلگرام شخصی شما
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed block">
                    هر پیامی که بازدیدکنندگان در فرم تماس مینی‌سایت شما ارسال کنند، بلافاصله و در لحظه به اکانت یا کانال تلگرام شما فرستاده خواهد شد.
                  </span>
                </div>
              </div>

              {/* Master Toggle & Chat ID */}
              <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      دریافت آنی پیام‌ها در تلگرام (crmTelegramEnable)
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      فعال‌سازی فوروارد پیام‌های دریافتی مینی‌سایت به تلگرام شما
                    </span>
                  </div>
                  <Switch
                    checked={Boolean(profile.crmTelegramEnable)}
                    onCheckedChange={(checked) => updateCrmSettings({ crmTelegramEnable: checked })}
                  />
                </div>

                {/* Chat ID Input */}
                <div className="pt-2 border-t border-border/70 space-y-2">
                  <label className="block text-xs font-semibold text-foreground">
                    آی دی تلگرام شما (crmTelegramChatId)
                  </label>
                  <input
                    type="text"
                    value={profile.crmTelegramChatId || ''}
                    onChange={(e) => updateCrmSettings({ crmTelegramChatId: e.target.value.trim() })}
                    placeholder="مثال: 123456789 یا @YourUsername"
                    dir="ltr"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-cyan-500 text-left"
                  />

                  <div className="p-2.5 rounded-xl bg-card/60 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                    <span className="font-bold text-cyan-500 block">💡 چگونه Chat ID تلگرام خود را پیدا کنم؟</span>
                    <p className="leading-relaxed">
                      کافیست در تلگرام به ربات رسمی <strong dir="ltr" className="text-foreground">@userinfobot</strong> یا بات پیام‌رسان سایت پیام بفرستید تا عدد <strong dir="ltr" className="text-foreground">Id</strong> شما نمایش داده شود. آن عدد را در کادر بالا وارد کنید.
                    </p>
                    <a
                      href="https://t.me/userinfobot?start=getid"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                    >
                      برای دریافت (Chat ID) کلیک کنید
                    </a>
                  </div>

                  {/* Warning Notice: Must start bot */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400 mt-2">
                    <span className="text-base leading-none">⚠️</span>
                    <p className="font-semibold leading-relaxed">
                      بسیار مهم: برای دریافت پیام‌ها، باید ربات را استارت بزنید.
                    </p>
                  </div>

                  {/* Open Bot & Start Button */}
                  <button
                    type="button"
                    onClick={handleOpenBot}
                    className="w-full mt-3 p-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>باز کردن ربات و Start</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {isDirty ? 'تغییرات ذخیره‌نشده دارید.' : 'تنظیمات با سرور هماهنگ است.'}
          </span>
          <div className="flex items-center gap-2 mr-auto w-full sm:w-auto justify-end">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSavingSettings}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>انصراف</span>
            </button>

            {/* Save & Confirm Button */}
            <button
              type="button"
              onClick={handleSaveAndConfirm}
              disabled={!isDirty || isSavingSettings}
              className={`px-5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${isDirty && !isSavingSettings
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/25 cursor-pointer active:scale-95'
                : 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50'
                }`}
            >
              {isSavingSettings ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>ذخیره و تایید</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
