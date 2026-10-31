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
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { INITIAL_LANDING_CMS } from '@/models/LandingCms.model';

type SettingsTab = 'general' | 'landing' | 'plans' | 'products';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // CMS State
  const [general, setGeneral] = useState(INITIAL_LANDING_CMS.general);
  const [hero, setHero] = useState(INITIAL_LANDING_CMS.hero);
  const [plans, setPlans] = useState(INITIAL_LANDING_CMS.plans);
  const [materials, setMaterials] = useState(INITIAL_LANDING_CMS.materials);
  const [testimonials, setTestimonials] = useState(INITIAL_LANDING_CMS.testimonials);

  useEffect(() => {
    fetchCmsSettings();
  }, []);

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

      const res = await fetch('/api/admin/settings/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'تنظیمات با موفقیت ذخیره شد.');
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
                  تنظیمات کلان پلتفرم و مدیریت محتوا (CMS)
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

        <div className="flex items-center gap-3 self-start sm:self-auto">
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

      {/* Inner Tabs Navigation (Strictly 4 Tabs as Requested) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>1. تنظیمات عمومی (General)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('landing')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'landing'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>2. محتوای صفحه اصلی (Landing Page)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'plans'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>3. تعرفه‌ها و اشتراک‌ها (Plans)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>4. محصولات فیزیکی (Products)</span>
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">نام تجاری پلتفرم:</label>
                    <Input
                      value={general.platformName}
                      onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                      className="h-11 rounded-2xl text-xs"
                    />
                  </div>

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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">نشانی دفتر مرکزی کابل:</label>
                    <Input
                      value={general.address}
                      onChange={(e) => setGeneral({ ...general, address: e.target.value })}
                      className="h-11 rounded-2xl text-xs"
                    />
                  </div>
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
                    <label className="text-[11px] font-bold text-muted-foreground">لینک اینستاگرام (Instagram):</label>
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
                    <label className="text-[11px] font-bold text-muted-foreground">کانال تلگرام (Telegram):</label>
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
                    <label className="text-[11px] font-bold text-muted-foreground">شماره یا لینک واتساپ (WhatsApp):</label>
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
                    <label className="text-[11px] font-bold text-muted-foreground">صفحه لینکدین (LinkedIn):</label>
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
                <h2 className="text-sm font-bold text-foreground">قوانین و شرایط استفاده پلتفرم (Legal Terms)</h2>
              </div>
              <textarea
                value={general.rulesTerms}
                onChange={(e) => setGeneral({ ...general, rulesTerms: e.target.value })}
                rows={4}
                className="w-full rounded-2xl bg-background border border-border p-4 text-xs text-foreground leading-relaxed focus:outline-none focus:border-cyan-500"
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
                <h2 className="text-sm font-bold text-foreground">بخش هیرو (Hero Section Texts)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground">بج بالای عنوان هیرو:</label>
                  <Input
                    value={hero.badge}
                    onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                    className="h-11 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">پیش‌تیتر اصلی:</label>
                  <Input
                    value={hero.titlePart1}
                    onChange={(e) => setHero({ ...hero, titlePart1: e.target.value })}
                    className="h-11 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-cyan-500">کلمه یا عبارت درخشان نئونی:</label>
                  <Input
                    value={hero.titleHighlight}
                    onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })}
                    className="h-11 rounded-2xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground">پس‌تیتر عنوان هیرو:</label>
                  <Input
                    value={hero.titlePart2}
                    onChange={(e) => setHero({ ...hero, titlePart2: e.target.value })}
                    className="h-11 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground">توضیح تفصیلی هیرو (Subtitle):</label>
                  <textarea
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl bg-background border border-border p-3.5 text-xs text-foreground leading-relaxed focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">متن دکمه اصلی (Primary CTA):</label>
                  <Input
                    value={hero.primaryCta}
                    onChange={(e) => setHero({ ...hero, primaryCta: e.target.value })}
                    className="h-11 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">متن دکمه فرعی (Secondary CTA):</label>
                  <Input
                    value={hero.secondaryCta}
                    onChange={(e) => setHero({ ...hero, secondaryCta: e.target.value })}
                    className="h-11 rounded-2xl text-xs"
                  />
                </div>
              </div>
            </Card>

            {/* Testimonials Review Manager */}
            <Card className="rounded-3xl border-border bg-card/90 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-foreground">نظرات مشتریان و شخصیت‌های برجسته (Testimonials)</h2>
                </div>
                <span className="text-xs text-muted-foreground">{testimonials.length.toLocaleString('en-US')} نظر ثبت‌شده</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t, idx) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">نظر #{idx + 1}:</span>
                      <span className="text-[10px] text-cyan-500 font-bold">{t.cardMaterialUsed}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={t.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestimonials((prev) =>
                            prev.map((item) => (item.id === t.id ? { ...item, name: val } : item))
                          );
                        }}
                        placeholder="نام و تخلص"
                        className="h-9 rounded-xl text-xs"
                      />
                      <Input
                        value={t.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestimonials((prev) =>
                            prev.map((item) => (item.id === t.id ? { ...item, title: val } : item))
                          );
                        }}
                        placeholder="سمت و تخصص"
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>

                    <textarea
                      value={t.reviewText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTestimonials((prev) =>
                          prev.map((item) => (item.id === t.id ? { ...item, reviewText: val } : item))
                        );
                      }}
                      rows={3}
                      className="w-full rounded-xl bg-background border border-border p-2.5 text-xs text-foreground leading-relaxed focus:outline-none focus:border-cyan-500"
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
                  className={`rounded-3xl border p-6 space-y-5 flex flex-col justify-between ${
                    plan.isPopular
                      ? 'border-cyan-500/50 bg-cyan-500/[0.03] shadow-lg shadow-cyan-500/10'
                      : 'border-border bg-card/90'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div>
                        <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                        <span className="text-[11px] text-muted-foreground">{plan.badge}</span>
                      </div>
                      {plan.isPopular && (
                        <Badge variant="cyan" className="text-[10px] py-0.5 px-2 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-cyan-400" />
                          <span>ویژه</span>
                        </Badge>
                      )}
                    </div>

                    {/* Pricing Inputs */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground">قیمت ماهانه (AFN):</label>
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
                        <label className="text-[11px] font-bold text-muted-foreground">قیمت ماهانه در پرداخت سالانه (AFN):</label>
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
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">توضیح پلن:</label>
                      <textarea
                        value={plan.description}
                        onChange={(e) => updatePlan(plan.planId, 'description', e.target.value)}
                        rows={2}
                        className="w-full rounded-xl bg-background border border-border p-2.5 text-xs text-foreground focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted-foreground">امکانات پلن (هر سطر یک ویژگی):</label>
                      <textarea
                        value={plan.features.join('\n')}
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
                    <Input
                      value={plan.ctaText}
                      onChange={(e) => updatePlan(plan.planId, 'ctaText', e.target.value)}
                      placeholder="متن دکمه خرید"
                      className="h-9 rounded-xl text-xs font-semibold"
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
                      <h3 className="text-base font-bold text-foreground">{mat.name}</h3>
                      <span className="text-[11px] text-muted-foreground font-sans">{mat.subtitle}</span>
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

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">قیمت نهایی فروش (AFN):</label>
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
                        value={mat.thickness}
                        onChange={(e) => updateMaterial(mat.id, 'thickness', e.target.value)}
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">وزن کارت:</label>
                      <Input
                        value={mat.weight}
                        onChange={(e) => updateMaterial(mat.id, 'weight', e.target.value)}
                        className="h-10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-muted-foreground">مدل چیپست NFC تعبیه‌شده:</label>
                      <Input
                        value={mat.chipset}
                        onChange={(e) => updateMaterial(mat.id, 'chipset', e.target.value)}
                        className="h-10 rounded-xl text-xs font-sans"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-muted-foreground">توضیحات و متریال ساخت:</label>
                      <textarea
                        value={mat.description}
                        onChange={(e) => updateMaterial(mat.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full rounded-xl bg-background border border-border p-2.5 text-xs text-foreground focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
