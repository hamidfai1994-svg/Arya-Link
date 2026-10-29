'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { ProfileLanguage, ProfileType, ProfileData } from '@/types/profile.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
    updateBasicInfo,
    setProfileLanguage,
    toggleDirectMode,
    updateProSettings,
    setProfileType,
    saveProfileData,
    resetState,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'access'>('general');
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

          {/* 3 Tabs Bar (Strictly Link-Specific) */}
          <div className="pt-3">
            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <TabsList className="grid grid-cols-3 w-full bg-muted/80 p-1 rounded-xl">
                <TabsTrigger value="general" className="text-xs font-semibold gap-1.5 data-[state=active]:font-bold">
                  <Globe className="w-3.5 h-3.5" />
                  <span>عمومی و زبان</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs font-semibold gap-1.5 data-[state=active]:font-bold">
                  <Search className="w-3.5 h-3.5" />
                  <span>سئو و متاتگ</span>
                </TabsTrigger>
                <TabsTrigger value="access" className="text-xs font-semibold gap-1.5 data-[state=active]:font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>دسترسی و هدایت</span>
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
                  <span className="px-3 py-2 text-xs font-outfit text-muted-foreground border-r border-border bg-muted/50 select-none">
                    aryal.ink/
                  </span>
                  <input
                    type="text"
                    value={profile.alias}
                    onChange={(e) => updateBasicInfo({ alias: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    placeholder="username"
                    className="w-full bg-transparent border-0 py-2 px-3 text-xs font-outfit text-foreground focus:outline-none"
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
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => updateBasicInfo({ phone: e.target.value })}
                      placeholder="+93 79 123 4567"
                      dir="ltr"
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-sans text-foreground focus:outline-none focus:border-cyan-500 text-left"
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
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-outfit text-foreground focus:outline-none focus:border-cyan-500 text-left"
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
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-outfit text-foreground focus:outline-none focus:border-cyan-500"
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
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            تغییرات شما پس از تایید به صورت زنده ذخیره می‌شوند.
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
              disabled={isSavingSettings}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
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
