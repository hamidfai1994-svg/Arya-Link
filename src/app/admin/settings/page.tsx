'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Globe,
  Layout,
  DollarSign,
  Package,
  Save,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Share2,
  FileText,
  Sparkles,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Trash2,
  Plus,
  CreditCard,
  Truck,
  ExternalLink,
  BellRing,
  Palette,
  RotateCcw,
  Image as ImageIcon,
  HardDrive,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FileUploader } from '@/components/ui/file-uploader';
import { SiteLogo } from '@/components/SiteLogo';
import { useBranding } from '@/lib/branding/BrandingContext';
import { toast } from 'sonner';
import { INITIAL_LANDING_CMS } from '@/models/LandingCms.model';
import { SuperAdminApiSettings } from '@/components/admin/SuperAdminApiSettings';
import { MultilingualInput } from '@/components/admin/MultilingualInput';
import { MultilingualTextarea } from '@/components/admin/MultilingualTextarea';
import { getLocalizedText } from '@/lib/i18n/multilingual';

type SettingsTab = 'general' | 'branding' | 'landing' | 'plans' | 'products' | 'api_notifications';

export default function AdminSettingsPage() {
  const { settings: brandingSettings, refreshSettings: refreshBranding, updateSettings: updateBrandingSettings } = useBranding();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);

  // Visual Identity State
  const [platformMainLogo, setPlatformMainLogo] = useState('');
  const [platformFavicon, setPlatformFavicon] = useState('');

  // CMS State
  const [general, setGeneral] = useState(INITIAL_LANDING_CMS.general);
  const [hero, setHero] = useState(INITIAL_LANDING_CMS.hero);
  const [plans, setPlans] = useState(INITIAL_LANDING_CMS.plans);
  const [materials, setMaterials] = useState(INITIAL_LANDING_CMS.materials);
  const [testimonials, setTestimonials] = useState(INITIAL_LANDING_CMS.testimonials);

  useEffect(() => {
    fetchCmsSettings();
  }, []);

  useEffect(() => {
    if (brandingSettings) {
      setPlatformMainLogo(brandingSettings.platformMainLogo || brandingSettings.companyLogo || '');
      setPlatformFavicon(brandingSettings.platformFavicon || brandingSettings.favicon || '');
    }
  }, [brandingSettings]);

  const fetchCmsSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings/cms', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.general) setGeneral(data.data.general);
        if (data.data.hero) setHero(data.data.hero);
        if (data.data.plans && data.data.plans.length > 0) setPlans(data.data.plans);
        if (data.data.materials && data.data.materials.length > 0) setMaterials(data.data.materials);
        if (data.data.testimonials && data.data.testimonials.length > 0) setTestimonials(data.data.testimonials);
      }
    } catch (err) {
      console.error('Error fetching CMS settings:', err);
      toast.error('خطا در بارگذاری تنظیمات محتوا.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBranding = async (silent = false) => {
    setIsSavingBranding(true);
    try {
      const cleanLogo = platformMainLogo.trim();
      const cleanFavicon = platformFavicon.trim();
      const res = await updateBrandingSettings({
        platformMainLogo: cleanLogo,
        platformFavicon: cleanFavicon,
        companyLogo: cleanLogo,
        favicon: cleanFavicon,
      });

      if (res.success) {
        await refreshBranding();
        if (!silent) {
          toast.success('هویت بصری و لوگوهای پلتفرم با موفقیت ذخیره شد.');
        }
        return true;
      } else {
        if (!silent) {
          toast.error(res.message || 'خطا در ذخیره‌سازی هویت بصری.');
        }
        return false;
      }
    } catch (err) {
      console.error('Branding save error:', err);
      if (!silent) {
        toast.error('خطای ارتباط با سرور هنگام ذخیره هویت بصری.');
      }
      return false;
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        general,
        hero,
        plans,
        materials,
        testimonials,
      };

      const [cmsRes, brandingOk] = await Promise.all([
        fetch('/api/admin/settings/cms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        handleSaveBranding(true),
      ]);

      const data = await cmsRes.json();
      if (data.success && brandingOk) {
        toast.success(data.message || 'تمام تنظیمات پلتفرم و هویت بصری با موفقیت ذخیره شد.');
      } else if (data.success) {
        toast.warning('تنظیمات محتوا ذخیره شد، اما در ذخیره هویت بصری مشکلی رخ داد.');
      } else {
        toast.error(data.message || 'خطا در ذخیره تنظیمات.');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('خطای ارتباط با سرور در هنگام ذخیره تنظیمات.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCleanupUploads = async () => {
    setIsCleaningStorage(true);
    const toastId = toast.loading('در حال اسکن دیتابیس و پاکسازی فایل‌های اضافی هاست...');
    try {
      const res = await fetch('/api/admin/cleanup-uploads', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.freedMB} مگابایت فضای هاست آزاد شد`, {
          id: toastId,
          description: `${data.deletedCount} فایل بلااستفاده حذف گردید (${data.keptCount} فایل فعال حفظ شد).`,
        });
      } else {
        toast.error(data.message || 'خطا در پاکسازی فایل‌های اضافی.', { id: toastId });
      }
    } catch (err) {
      console.error('Cleanup error:', err);
      toast.error('خطای ارتباط با سرور در هنگام پاکسازی فایل‌ها.', { id: toastId });
    } finally {
      setIsCleaningStorage(false);
    }
  };

  // Helper for Plan editing
  const updatePlan = (planId: string, field: string, value: any) => {
    setPlans((prev) =>
      prev.map((p) => (p.planId === planId ? { ...p, [field]: value } : p))
    );
  };

  // Helper for Material editing
  const updateMaterial = (id: string, field: string, value: any) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 select-none font-sans"
      dir="rtl"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  تنظیمات کلان پلتفرم و مدیریت محتوا
                </h1>
                <Badge variant="cyan" className="text-xs">
                  داینامیک زنده
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                مدیریت اطلاعات عمومی، متون لندینگ‌پیج، تعرفه پلن‌های اشتراک و محصولات کارت هوشمند NFC
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCleanupUploads}
            disabled={isCleaningStorage}
            className="h-11 px-4 rounded-2xl border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center gap-1.5"
          >
            {isCleaningStorage ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>در حال پاکسازی...</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5" />
                <span>پاکسازی فایل‌های اضافی (آزادسازی هاست)</span>
              </>
            )}
          </Button>

          <Link href="/" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-11 px-4 rounded-2xl border-border bg-card text-xs flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
              <span>مشاهده لندینگ‌پیج</span>
            </Button>
          </Link>

          <Button
            onClick={handleSaveAll}
            disabled={isSaving || isLoading}
            className="h-11 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ذخیره کلیه تنظیمات</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Inner Tabs Navigation (6 Equal-Width Tabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 w-full gap-1.5 p-1.5 rounded-2xl bg-card border border-border">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`w-full flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'general'
            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span className="truncate">1. تنظیمات عمومی</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`w-full flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'branding'
            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
        >
          <Palette className="w-4 h-4 shrink-0" />
          <span className="truncate">2. هویت بصری و برندینگ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('landing')}
          className={`w-full flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'landing'
            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
        >
          <Layout className="w-4 h-4 shrink-0" />
          <span className="truncate">3. محتوای صفحه اصلی</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`w-full flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'plans'
            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
        >
          <DollarSign className="w-4 h-4 shrink-0" />
          <span className="truncate">4. تعرفه‌ها و اشتراک‌ها</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`w-full flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'products'
            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span className="truncate">5. محصولات فیزیکی</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('api_notifications')}
          className={`w-full flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'api_notifications'
            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
        >
          <BellRing className="w-4 h-4 shrink-0" />
          <span className="truncate">6. مدیریت API و اعلان‌ها</span>
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {/* =========================================================
            TAB 1: GENERAL SETTINGS (اطلاعات تماس، شبکه‌ها، قوانین)
        ========================================================= */}
        {activeTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="rounded-3xl border-border bg-card/90 p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <Phone className="w-4 h-4 text-cyan-500" />
                  <h2 className="text-sm font-bold text-foreground">اطلاعات تماس و نشانی رسمی</h2>
                </div>

                <div className="space-y-4">
                  <MultilingualInput
                    compact
                    label="نام تجاری پلتفرم:"
                    value={general.platformName}
                    onChange={(val) => setGeneral({ ...general, platformName: val })}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">شماره تماس پشتیبانی مشتریان:</label>
                    <Input
                      value={general.supportPhone}
                      onChange={(e) => setGeneral({ ...general, supportPhone: e.target.value })}
                      className="h-11 rounded-2xl text-xs font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">ایمیل رسمی پشتیبانی:</label>
                    <Input
                      value={general.supportEmail}
                      onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                      className="h-11 rounded-2xl text-xs font-sans"
                      dir="ltr"
                    />
                  </div>

                  <MultilingualInput
                    compact
                    label="نشانی دفتر مرکزی کابل:"
                    value={general.address}
                    onChange={(val) => setGeneral({ ...general, address: val })}
                  />
                </div>
              </Card>

              {/* Footer Social Networks */}
              <Card className="rounded-3xl border-border bg-card/90 p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <Share2 className="w-4 h-4 text-cyan-500" />
                  <h2 className="text-sm font-bold text-foreground">شبکه‌های اجتماعی فوتر</h2>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">لینک اینستاگرام:</label>
                    <Input
                      value={general.socialLinks.instagram}
                      onChange={(e) =>
                        setGeneral({
                          ...general,
                          socialLinks: { ...general.socialLinks, instagram: e.target.value },
                        })
                      }
                      className="h-10 rounded-xl text-xs font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">کانال تلگرام:</label>
                    <Input
                      value={general.socialLinks.telegram}
                      onChange={(e) =>
                        setGeneral({
                          ...general,
                          socialLinks: { ...general.socialLinks, telegram: e.target.value },
                        })
                      }
                      className="h-10 rounded-xl text-xs font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">شماره یا لینک واتساپ:</label>
                    <Input
                      value={general.socialLinks.whatsapp}
                      onChange={(e) =>
                        setGeneral({
                          ...general,
                          socialLinks: { ...general.socialLinks, whatsapp: e.target.value },
                        })
                      }
                      className="h-10 rounded-xl text-xs font-sans"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">صفحه لینکدین:</label>
                    <Input
                      value={general.socialLinks.linkedin}
                      onChange={(e) =>
                        setGeneral({
                          ...general,
                          socialLinks: { ...general.socialLinks, linkedin: e.target.value },
                        })
                      }
                      className="h-10 rounded-xl text-xs font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Rules and Legal Terms */}
            <Card className="rounded-3xl border-border bg-card/90 p-6 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <FileText className="w-4 h-4 text-cyan-500" />
                <h2 className="text-sm font-bold text-foreground">قوانین و شرایط استفاده پلتفرم</h2>
              </div>
              <MultilingualTextarea
                hideLabel
                value={general.rulesTerms}
                onChange={(val) => setGeneral({ ...general, rulesTerms: val })}
                rows={4}
              />
            </Card>
          </motion.div>
        )}

        {/* =========================================================
            TAB 2: LANDING PAGE CONTENT (متون هیرو، تیترها و نظرات)
        ========================================================= */}
        {activeTab === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Hero Section Headlines */}
            <Card className="rounded-3xl border-border bg-card/90 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Layout className="w-4 h-4 text-cyan-500" />
                <h2 className="text-sm font-bold text-foreground">بخش هیرو</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <MultilingualInput
                    label="بج بالای عنوان هیرو:"
                    value={hero.badge}
                    onChange={(val) => setHero({ ...hero, badge: val })}
                  />
                </div>

                <div>
                  <MultilingualInput
                    label="پیش‌تیتر اصلی:"
                    value={hero.titlePart1}
                    onChange={(val) => setHero({ ...hero, titlePart1: val })}
                  />
                </div>

                <div>
                  <MultilingualInput
                    label="کلمه یا عبارت درخشان نئونی:"
                    value={hero.titleHighlight}
                    onChange={(val) => setHero({ ...hero, titleHighlight: val })}
                    inputClassName="font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <MultilingualInput
                    label="پس‌تیتر عنوان هیرو:"
                    value={hero.titlePart2}
                    onChange={(val) => setHero({ ...hero, titlePart2: val })}
                  />
                </div>

                <div className="md:col-span-2">
                  <MultilingualTextarea
                    label="توضیح تفصیلی هیرو:"
                    value={hero.subtitle}
                    onChange={(val) => setHero({ ...hero, subtitle: val })}
                    rows={3}
                  />
                </div>

                <div>
                  <MultilingualInput
                    label="متن دکمه اصلی:"
                    value={hero.primaryCta}
                    onChange={(val) => setHero({ ...hero, primaryCta: val })}
                  />
                </div>

                <div>
                  <MultilingualInput
                    label="متن دکمه فرعی:"
                    value={hero.secondaryCta}
                    onChange={(val) => setHero({ ...hero, secondaryCta: val })}
                  />
                </div>
              </div>
            </Card>

            {/* Testimonials Review Manager */}
            <Card className="rounded-3xl border-border bg-card/90 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-foreground">نظرات مشتریان و شخصیت‌های برجسته</h2>
                </div>
                <span className="text-xs text-muted-foreground">{testimonials.length.toLocaleString('en-US')} نظر ثبت‌شده</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t, idx) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">نظر #{idx + 1}:</span>
                      <span className="text-[10px] text-cyan-500 font-bold">
                        {getLocalizedText(t.cardMaterialUsed, 'da')}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <MultilingualInput
                        compact
                        label="نام و تخلص:"
                        value={t.name}
                        onChange={(val) =>
                          setTestimonials((prev) =>
                            prev.map((item) => (item.id === t.id ? { ...item, name: val } : item))
                          )
                        }
                        placeholder="نام و تخلص"
                      />
                      <MultilingualInput
                        compact
                        label="سمت و تخصص:"
                        value={t.title}
                        onChange={(val) =>
                          setTestimonials((prev) =>
                            prev.map((item) => (item.id === t.id ? { ...item, title: val } : item))
                          )
                        }
                        placeholder="سمت و تخصص"
                      />
                    </div>

                    <MultilingualTextarea
                      compact
                      label="متن نظر:"
                      value={t.reviewText}
                      onChange={(val) =>
                        setTestimonials((prev) =>
                          prev.map((item) => (item.id === t.id ? { ...item, reviewText: val } : item))
                        )
                      }
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* =========================================================
            TAB 3: SUBSCRIPTION PLANS (تعرفه‌ها و امکانات پلن‌ها)
        ========================================================= */}
        {activeTab === 'plans' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.planId}
                  className={`rounded-3xl border p-6 space-y-5 flex flex-col justify-between ${plan.isPopular
                    ? 'border-cyan-500/50 bg-cyan-500/[0.03] shadow-lg shadow-cyan-500/10'
                    : 'border-border bg-card/90'
                    }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {getLocalizedText(plan.name, 'da')}
                        </h3>
                        <span className="text-[11px] text-muted-foreground">
                          {getLocalizedText(plan.badge, 'da')}
                        </span>
                      </div>
                      {plan.isPopular && (
                        <Badge variant="cyan" className="text-[10px] py-0.5 px-2 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-cyan-400" />
                          <span>ویژه</span>
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <MultilingualInput
                        compact
                        label="نام پلن:"
                        value={plan.name}
                        onChange={(val) => updatePlan(plan.planId, 'name', val)}
                      />
                      <MultilingualInput
                        compact
                        label="بج پلن:"
                        value={plan.badge}
                        onChange={(val) => updatePlan(plan.planId, 'badge', val)}
                      />
                    </div>

                    {/* Pricing Inputs */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">قیمت ماهانه:</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={plan.priceMonthly}
                            onChange={(e) => updatePlan(plan.planId, 'priceMonthly', Number(e.target.value))}
                            className="h-10 rounded-xl text-xs font-bold text-cyan-500"
                          />
                          <span className="text-xs text-muted-foreground">افغانی</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">قیمت ماهانه در پرداخت سالانه:</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={plan.priceYearlyMonthly}
                            onChange={(e) => updatePlan(plan.planId, 'priceYearlyMonthly', Number(e.target.value))}
                            className="h-10 rounded-xl text-xs font-bold text-emerald-500"
                          />
                          <span className="text-xs text-muted-foreground">افغانی</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <MultilingualTextarea
                      compact
                      label="توضیح پلن:"
                      value={plan.description}
                      onChange={(val) => updatePlan(plan.planId, 'description', val)}
                      rows={2}
                    />

                    {/* Features List */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted-foreground">امکانات پلن (هر سطر یک ویژگی):</label>
                      <textarea
                        value={plan.features.map((f) => getLocalizedText(f, 'da')).join('\n')}
                        onChange={(e) =>
                          updatePlan(
                            plan.planId,
                            'features',
                            e.target.value.split('\n').filter((line) => line.trim())
                          )
                        }
                        rows={6}
                        className="w-full rounded-xl bg-background border border-border p-2.5 text-xs text-foreground leading-relaxed focus:outline-none focus:border-cyan-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <MultilingualInput
                      compact
                      label="متن دکمه خرید:"
                      value={plan.ctaText}
                      onChange={(val) => updatePlan(plan.planId, 'ctaText', val)}
                      placeholder="متن دکمه خرید"
                      inputClassName="font-semibold"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* =========================================================
            TAB 4: PHYSICAL NFC PRODUCTS (محصولات، قیمت و موجودی)
        ========================================================= */}
        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((mat) => (
                <Card key={mat.id} className="rounded-3xl border-border bg-card/90 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {getLocalizedText(mat.name, 'da')}
                      </h3>
                      {mat.subtitle ? (
                        <span className="text-[11px] text-muted-foreground font-sans">
                          {getLocalizedText(mat.subtitle, 'da')}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {mat.inStock ? 'موجود' : 'ناموجود'}
                      </span>
                      <Switch
                        checked={mat.inStock}
                        onCheckedChange={(checked) => updateMaterial(mat.id, 'inStock', checked)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="md:col-span-2">
                      <MultilingualInput
                        compact
                        label="نام محصول / کارت:"
                        value={mat.name}
                        onChange={(val) => updateMaterial(mat.id, 'name', val)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <MultilingualInput
                        compact
                        label="زیرعنوان محصول:"
                        value={mat.subtitle}
                        onChange={(val) => updateMaterial(mat.id, 'subtitle', val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">قیمت نهایی فروش (افغانی):</label>
                      <Input
                        type="number"
                        value={mat.price}
                        onChange={(e) => updateMaterial(mat.id, 'price', Number(e.target.value))}
                        className="h-10 rounded-xl text-xs font-bold text-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">تعداد موجودی انبار:</label>
                      <Input
                        type="number"
                        value={mat.stockCount}
                        onChange={(e) => updateMaterial(mat.id, 'stockCount', Number(e.target.value))}
                        className="h-10 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">ضخامت کارت:</label>
                      <Input
                        value={getLocalizedText(mat.thickness, 'da', '')}
                        onChange={(e) => updateMaterial(mat.id, 'thickness', e.target.value)}
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">وزن کارت:</label>
                      <Input
                        value={getLocalizedText(mat.weight, 'da', '')}
                        onChange={(e) => updateMaterial(mat.id, 'weight', e.target.value)}
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-muted-foreground">مدل چیپست NFC تعبیه‌شده:</label>
                      <Input
                        value={getLocalizedText(mat.chipset, 'da', '')}
                        onChange={(e) => updateMaterial(mat.id, 'chipset', e.target.value)}
                        className="h-10 rounded-xl text-xs font-sans"
                        dir="ltr"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <MultilingualTextarea
                        compact
                        label="توضیحات و متریال ساخت:"
                        value={mat.description}
                        onChange={(val) => updateMaterial(mat.id, 'description', val)}
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* =========================================================
            TAB 2: VISUAL IDENTITY & BRANDING (هویت بصری و برندینگ)
        ========================================================= */}
        {activeTab === 'branding' && (
          <motion.div
            key="branding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card className="rounded-3xl border-border bg-card/90 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      هویت بصری و برندینگ پلتفرم
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      مدیریت داینامیک لوگوی اصلی و فاوآیکن مرورگر در سراسر وب‌سایت. در صورت خالی ماندن، از نشان پیش‌فرض سورس‌کد استفاده می‌شود.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => handleSaveBranding(false)}
                  disabled={isSavingBranding}
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 shrink-0"
                >
                  {isSavingBranding ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSavingBranding ? 'در حال ذخیره...' : 'ذخیره هویت بصری'}</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Logo Control */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <ImageIcon className="w-4 h-4 text-cyan-500 shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-foreground">لوگوی اصلی سایت (Main Logo)</h3>
                        <p className="text-[11px] text-muted-foreground">
                          نمایش در هدر، سایدبارها و صفحات ورود
                        </p>
                      </div>
                    </div>

                    {platformMainLogo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPlatformMainLogo('');
                          toast.info('لوگوی اصلی به حالت پیش‌فرض سورس‌کد بازگردانده شد. برای ثبت نهایی ذخیره کنید.');
                        }}
                        className="h-8 px-2.5 text-[11px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                      >
                        <RotateCcw className="w-3.5 h-3.5 ml-1" />
                        بازگشت به پیش‌فرض
                      </Button>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-1.5">
                      <span className="text-[10px] text-slate-500">پیش‌نمایش روشن</span>
                      <SiteLogo overrideLogo={platformMainLogo} width={44} height={44} showText={false} />
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-1.5">
                      <span className="text-[10px] text-slate-400">پیش‌نمایش تیره</span>
                      <SiteLogo overrideLogo={platformMainLogo} width={44} height={44} showText={false} />
                    </div>
                  </div>

                  <FileUploader
                    value={platformMainLogo}
                    onChange={(url) => setPlatformMainLogo(url)}
                    folder="branding"
                    fileType="image"
                    label="آپلود تصویر لوگوی اصلی"
                    description="PNG شفاف، WEBP یا SVG"
                    maxSizeMB={2.5}
                  />

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground">
                      یا آدرس مستقیم تصویر لوگوی اصلی (URL):
                    </label>
                    <Input
                      type="url"
                      dir="ltr"
                      value={platformMainLogo}
                      onChange={(e) => setPlatformMainLogo(e.target.value)}
                      placeholder="https://example.com/logo.png (خالی = لوگوی پیش‌فرض)"
                      className="h-10 rounded-xl text-xs font-sans text-left"
                    />
                  </div>
                </div>

                {/* Favicon Control */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-foreground">فاوآیکن سایت (Favicon)</h3>
                        <p className="text-[11px] text-muted-foreground">
                          آیکن تب مرورگر و بوک‌مارک‌ها
                        </p>
                      </div>
                    </div>

                    {platformFavicon && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPlatformFavicon('');
                          toast.info('فاوآیکن به حالت پیش‌فرض سورس‌کد بازگردانده شد. برای ثبت نهایی ذخیره کنید.');
                        }}
                        className="h-8 px-2.5 text-[11px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                      >
                        <RotateCcw className="w-3.5 h-3.5 ml-1" />
                        بازگشت به پیش‌فرض
                      </Button>
                    )}
                  </div>

                  {/* Simulated Browser Tab Preview */}
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {platformFavicon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={platformFavicon} alt="Favicon preview" className="w-5 h-5 object-contain" />
                        ) : (
                          <div className="w-4 h-4 rounded bg-gradient-to-tr from-cyan-500 to-blue-600" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-200 truncate font-sans">
                        Arya Link | تب مرورگر
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300 shrink-0">
                      {platformFavicon ? 'فاوآیکن اختصاصی' : 'پیش‌فرض سیستم'}
                    </Badge>
                  </div>

                  <FileUploader
                    value={platformFavicon}
                    onChange={(url) => setPlatformFavicon(url)}
                    folder="branding"
                    fileType="image"
                    aspectRatio="square"
                    label="آپلود تصویر فاوآیکن"
                    description="PNG، ICO یا SVG مربعی (مثلاً 64×64)"
                    maxSizeMB={1.5}
                  />

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground">
                      یا آدرس مستقیم فاوآیکن (URL):
                    </label>
                    <Input
                      type="url"
                      dir="ltr"
                      value={platformFavicon}
                      onChange={(e) => setPlatformFavicon(e.target.value)}
                      placeholder="https://example.com/favicon.png (خالی = فاوآیکن پیش‌فرض)"
                      className="h-10 rounded-xl text-xs font-sans text-left"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* =========================================================
            TAB 5: API & NOTIFICATIONS (ربات‌های تلگرام و وب‌هوک)
        ========================================================= */}
        {activeTab === 'api_notifications' && (
          <motion.div
            key="api_notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SuperAdminApiSettings />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
