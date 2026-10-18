'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  UploadCloud,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  ArrowRight,
  Eye,
  Sliders,
  Palette,
  Layout,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import { useBranding } from '@/lib/branding/BrandingContext';
import { SiteLogo } from '@/components/SiteLogo';
import { toast } from 'sonner';

export default function AdminBrandingSettingsPage() {
  const { settings, refreshSettings, updateSettings } = useBranding();

  const [companyLogo, setCompanyLogo] = useState(settings?.companyLogo || '');
  const [favicon, setFavicon] = useState(settings?.favicon || '');
  const [siteName, setSiteName] = useState(settings?.siteName || 'Arya Link');
  const [siteDescription, setSiteDescription] = useState(
    settings?.siteDescription ||
      'پیشرفته‌ترین سامانه هویت دیجیتال، کارت ویزیت هوشمند NFC و درگاه لینک‌بایو در افغانستان'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile' | 'auth'>('desktop');

  // Synchronize state with context when loaded
  useEffect(() => {
    if (settings) {
      setCompanyLogo(settings.companyLogo || '');
      setFavicon(settings.favicon || '');
      setSiteName(settings.siteName || 'Arya Link');
      setSiteDescription(
        settings.siteDescription ||
          'پیشرفته‌ترین سامانه هویت دیجیتال، کارت ویزیت هوشمند NFC و درگاه لینک‌بایو در افغانستان'
      );
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSettings({
        companyLogo: companyLogo.trim(),
        favicon: favicon.trim(),
        siteName: siteName.trim(),
        siteDescription: siteDescription.trim(),
      });

      if (res.success) {
        toast.success('تنظیمات برندینگ با موفقیت ذخیره شد!', {
          description: 'تغییرات لوگو و فاوآیکون در سراسر وب‌سایت اعمال گردید.',
        });
        await refreshSettings();
      } else {
        toast.error('خطا در ذخیره‌سازی تنظیمات', {
          description: res.message || 'مشکلی در ثبت اطلاعات پیش آمد.',
        });
      }
    } catch (err: any) {
      console.error('Error saving branding settings:', err);
      toast.error('خطای سیستمی در برقراری ارتباط');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaultLogo = () => {
    setCompanyLogo('');
    toast.info('لوگوی اختصاصی حذف شد و به نشان پیش‌فرض بازگشت داده شد.');
  };

  const handleResetToDefaultFavicon = () => {
    setFavicon('');
    toast.info('فاوآیکون اختصاصی حذف شد و به فاوآیکون پیش‌فرض بازگشت داده شد.');
  };

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
            <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">
              پنل مدیریت
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">تنظیمات برند و هویت بصری</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                تنظیمات برندینگ و دارایی‌های بصری
                <Badge className="bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 text-[10px] font-sans">
                  مرحله ۲۴
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                آپلود، ذخیره و اعمال یکپارچه لوگو و فاوآیکون سایت در دیتابیس
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => refreshSettings()}
            className="h-10 text-xs font-semibold rounded-xl border-border hover:bg-muted"
          >
            <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
            بازخوانی
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره تمام تغییرات'}</span>
          </Button>
        </div>
      </div>

      {/* Real-time Interactive Mockup & Preview Banner */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-500" />
              <h2 className="text-sm font-bold text-foreground">پیش‌نمایش زنده در اجزای وب‌سایت</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              مشاهده نحوه نمایش همزمان لوگو و فاوآیکون در هدر، تبلت، موبایل و تب مرورگر
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-background/80 p-1 rounded-xl border border-border shadow-sm">
            <button
              type="button"
              onClick={() => setPreviewTab('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                previewTab === 'desktop'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>هدر ناوبار دسکتاپ</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                previewTab === 'mobile'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>هدر سایدبار موبایل</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('auth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                previewTab === 'auth'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>کارت ورود / ثبت‌نام</span>
            </button>
          </div>
        </div>

        {/* Browser Tab Simulated Preview */}
        <div className="mb-6 rounded-2xl bg-slate-900 border border-slate-800 p-3 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>پیش‌نمایش تب مرورگر (Browser Tab):</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Chrome / Edge / Firefox</span>
          </div>

          <div className="flex items-center gap-2 max-w-sm rounded-t-xl bg-slate-950 px-3 py-2 border-t-2 border-cyan-500 shadow-inner">
            <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center">
              {favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={favicon} alt="Favicon" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-sm" />
              )}
            </div>
            <span className="text-xs font-medium text-slate-200 truncate flex-1 font-sans">
              {siteName || 'Arya Link'} | پلتفرم کارت ویزیت دیجیتال
            </span>
            <span className="text-slate-400 hover:text-slate-300 text-xs cursor-pointer font-bold px-1">
              ×
            </span>
          </div>
        </div>

        {/* Dynamic Context Preview Area */}
        {previewTab === 'desktop' && (
          <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
            <span className="text-[11px] text-muted-foreground font-semibold block mb-3">
              شبیه‌ساز هدر ناوبار (Public Header):
            </span>
            <div className="h-16 px-4 rounded-xl border border-border/80 bg-background/90 flex items-center justify-between">
              <SiteLogo
                overrideLogo={companyLogo}
                siteName={siteName}
                showText={true}
                showBadge={true}
                badgeText="PRO"
                subtitle="کارت ویزیت هوشمند و لینک‌بایو"
                width={40}
                height={40}
              />
              <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                <span className="hover:text-cyan-500 cursor-pointer">صفحه اصلی</span>
                <span className="hover:text-cyan-500 cursor-pointer">خدمات سازمانی</span>
                <span className="hover:text-cyan-500 cursor-pointer">بلاگ</span>
                <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-500 font-bold border border-cyan-500/20">
                  ورود به حساب
                </span>
              </div>
            </div>
          </div>
        )}

        {previewTab === 'mobile' && (
          <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
            <span className="text-[11px] text-muted-foreground font-semibold block mb-3">
              شبیه‌ساز سایدبار داشبورد:
            </span>
            <div className="w-72 max-w-full rounded-2xl border border-border bg-card p-4 space-y-3">
              <SiteLogo
                overrideLogo={companyLogo}
                siteName={siteName}
                showText={true}
                showBadge={true}
                badgeText="PRO"
                subtitle="پنل مدیریت یکپارچه"
                width={38}
                height={38}
              />
              <div className="space-y-1 pt-2 border-t border-border/60">
                <div className="px-3 py-2 rounded-xl bg-cyan-500/10 text-cyan-500 font-bold text-xs">
                  لینک‌های شما
                </div>
                <div className="px-3 py-2 rounded-xl text-muted-foreground font-medium text-xs">
                  ویرایشگر کارت هوشمند
                </div>
              </div>
            </div>
          </div>
        )}

        {previewTab === 'auth' && (
          <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm flex justify-center">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-6 text-center space-y-3 shadow-xl">
              <div className="flex justify-center">
                <SiteLogo
                  overrideLogo={companyLogo}
                  siteName={siteName}
                  showText={false}
                  width={56}
                  height={56}
                />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                ورود به <span className="text-cyan-500">{siteName || 'Arya Link'}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                مدیریت کارت هوشمند، پروفایل بیو و تحلیل بازدیدها
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CARD 1: Company Logo Upload */}
        <Card className="p-6 rounded-3xl border-border bg-card shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  لوگوی اصلی شرکت (Company Logo)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  نمایش در هدر اصلی، فوتر، صفحات ورود و سایدبار
                </p>
              </div>
            </div>

            {companyLogo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetToDefaultLogo}
                className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8 px-2.5 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5 ml-1" />
                حذف و بازگشت به پیش‌فرض
              </Button>
            )}
          </div>

          {/* Current Logo Preview Checkerboard */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">وضعیت فعلی لوگو:</span>
              <span>{companyLogo ? 'لوگوی اختصاصی بارگذاری شده' : 'نشان پیش‌فرض سیستم (AL)'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">پس‌زمینه روشن</span>
                <SiteLogo overrideLogo={companyLogo} width={48} height={48} />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">پس‌زمینه تیره</span>
                <SiteLogo overrideLogo={companyLogo} width={48} height={48} />
              </div>
            </div>
          </div>

          {/* File Uploader Component */}
          <div className="space-y-2">
            <FileUploader
              value={companyLogo}
              onChange={(url) => setCompanyLogo(url)}
              folder="branding"
              fileType="image"
              label="آپلود تصویر لوگو"
              description="فرمت‌های پیشنهادی: PNG با پس‌زمینه شفاف، SVG یا WEBP"
              maxSizeMB={2.5}
            />
          </div>

          {/* Guidelines Box */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-muted-foreground space-y-1.5 leading-relaxed font-sans">
            <div className="flex items-center gap-1.5 font-bold text-cyan-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>نکات طراحی و ابعاد مناسب:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pr-1 text-[11px]">
              <li>برای بهترین وضوح، از فایل‌های با پس‌زمینه شفاف (Transparent PNG یا SVG) استفاده کنید.</li>
              <li>اندازه پیشنهادی: ۵۱۲×۵۱۲ پیکسل (مربعی) یا نسبت ۳:۱ (افقی).</li>
              <li>حداکثر حجم مجاز فایل: ۲.۵ مگابایت.</li>
            </ul>
          </div>
        </Card>

        {/* CARD 2: Favicon Upload */}
        <Card className="p-6 rounded-3xl border-border bg-card shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  فاوآیکون تب مرورگر (Browser Favicon)
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  نمایش در نوار تب مرورگر، بوک‌مارک‌ها و میانبرهای موبایل
                </p>
              </div>
            </div>

            {favicon && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetToDefaultFavicon}
                className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8 px-2.5 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5 ml-1" />
                حذف و بازگشت به پیش‌فرض
              </Button>
            )}
          </div>

          {/* Favicon Current Preview */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">وضعیت فعلی فاوآیکون:</span>
              <span>{favicon ? 'فاوآیکون اختصاصی بارگذاری شده' : 'فاوآیکون پیش‌فرض (Favicon.ico)'}</span>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 p-2 flex items-center justify-center shadow-inner">
                  {favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={favicon} alt="Favicon preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gradient-to-tr from-cyan-500 to-blue-600" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">۴۸×۴۸ px</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 p-1.5 flex items-center justify-center shadow-inner">
                  {favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={favicon} alt="Favicon preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-4 h-4 rounded-sm bg-gradient-to-tr from-cyan-500 to-blue-600" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">۳۲×۳۲ px</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shadow-inner">
                  {favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={favicon} alt="Favicon preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-gradient-to-tr from-cyan-500 to-blue-600" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">۱۶×۱۶ px</span>
              </div>
            </div>
          </div>

          {/* Favicon File Uploader */}
          <div className="space-y-2">
            <FileUploader
              value={favicon}
              onChange={(url) => setFavicon(url)}
              folder="branding"
              fileType="image"
              aspectRatio="square"
              label="آپلود فایل فاوآیکون"
              description="فرمت‌های پیشنهادی: ICO، PNG یا SVG مربعی"
              maxSizeMB={1.5}
            />
          </div>

          {/* Favicon Guidelines Box */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-muted-foreground space-y-1.5 leading-relaxed font-sans">
            <div className="flex items-center gap-1.5 font-bold text-amber-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>نکات مربوط به فاوآیکون:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pr-1 text-[11px]">
              <li>فاوآیکون باید مربعی باشد (مانند ۳۲×۳۲، ۴۸×۴۸، یا ۶۴×۶۴ پیکسل).</li>
              <li>از نمادهای ساده و خوانا با کنتراست بالا استفاده کنید تا در ابعاد کوچک تب مرورگر مشخص باشد.</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* CARD 3: Brand Metadata & Site Identity */}
      <Card className="p-6 rounded-3xl border-border bg-card shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-border/80">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              هویت متنی و متای عنوان سایت (Brand Metadata)
            </h3>
            <p className="text-[11px] text-muted-foreground">
              نام سایت در کنار لوگو، عنوان تب مرورگر و توضیحات سئو
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              نام تجاری سامانه (Site Name)
            </label>
            <Input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="مثلاً Arya Link یا آریا لینک"
              className="h-11 rounded-xl bg-background border-border text-xs focus:border-cyan-500"
            />
            <p className="text-[11px] text-muted-foreground font-sans">
              در صورت فعال بودن نمایش متن، این نام در کنار لوگو در تمام صفحات درج می‌شود.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              توضیحات و متای سئو (Meta Description)
            </label>
            <Input
              type="text"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="پیشرفته‌ترین سامانه هویت دیجیتال..."
              className="h-11 rounded-xl bg-background border-border text-xs focus:border-cyan-500"
            />
            <p className="text-[11px] text-muted-foreground font-sans">
              توضیحات در تگ متای توضیحات سئو برای موتورهای جستجو قرار می‌گیرد.
            </p>
          </div>
        </div>
      </Card>

      {/* Sticky Bottom Save Action Bar */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-4 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span className="hidden sm:inline">
            پس از ذخیره، تغییرات به سرعت در تمام صفحات فعال و در دسترس کاربران خواهد بود.
          </span>
          <span className="sm:hidden">تغییرات فوراً اعمال می‌شود.</span>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره نهایی تنظیمات'}</span>
        </Button>
      </div>
    </div>
  );
}
