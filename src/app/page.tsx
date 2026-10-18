'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  ShoppingBag,
  ShieldCheck,
  Users,
  Smartphone,
  BarChart3,
  CreditCard,
  Zap,
  Globe,
  Lock,
  ChevronDown,
  Menu,
  X,
  Share2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  Check,
  Star,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LandingPage() {
  const { t, dir } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans select-none overflow-x-hidden" dir={dir}>
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 left-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />



      {/* =========================================
          ۲. هیرو سکشن (Hero Section)
      ========================================= */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Right Column: Hero Texts & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-xs font-semibold shadow-inner">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>اولین پلتفرم کارت ویزیت هوشمند NFC و فروشگاه بیو در افغانستان</span>
              </div>

              {/* Catchy Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.25] text-foreground">
                نسل جدید{' '}
                <span className="bg-gradient-to-l from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  کارت ویزیت هوشمند
                </span>{' '}
                و لینک‌بایو
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                تمام راه‌های ارتباطی، شبکه‌های اجتماعی، کاتالوگ‌ها و محصولات خود را در یک لینک یکپارچه و زیبا با مشتریان به اشتراک بگذارید. فقط با یک لمس روی موبایل مخاطب!
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
                  >
                    <span>رایگان شروع کنید</span>
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <a href="#features" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-13 px-6 rounded-2xl border-border bg-card/60 backdrop-blur-md text-foreground hover:bg-muted font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-cyan-500" />
                    <span>مشاهده امکانات و ماژول‌ها</span>
                  </Button>
                </a>
              </div>

              {/* Trust Indicators Row */}
              <div className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>بدون نیاز به نصب اپلیکیشن</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>پشتیبانی از فناوری لمسی NFC</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>فروشگاه و درگاه بانکی محلی</span>
                </div>
              </div>
            </div>

            {/* Left Column: Interactive Mobile Mockup */}
            <div className="lg:col-span-5 flex justify-center relative">
              {/* Floating Element 1: NFC Tap Indicator */}
              <div className="absolute -top-4 right-0 sm:right-6 z-20 p-3 sm:p-3.5 rounded-2xl bg-card/90 backdrop-blur-xl border border-cyan-500/40 shadow-xl shadow-cyan-500/10 flex items-center gap-2.5 animate-bounce duration-1000">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground block">اشتراک با لمس NFC</span>
                  <span className="text-[10px] text-muted-foreground block">بدون نیاز به اسکن یا بارکد</span>
                </div>
              </div>

              {/* Floating Element 2: Direct Sale Checkout */}
              <div className="absolute -bottom-6 left-0 sm:left-4 z-20 p-3 sm:p-3.5 rounded-2xl bg-card/90 backdrop-blur-xl border border-emerald-500/40 shadow-xl shadow-emerald-500/10 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">فروشگاه فعال</span>
                  <span className="text-[10px] text-muted-foreground block">دریافت آنی وجه به حساب‌پی</span>
                </div>
              </div>

              {/* Floating Element 3: Verified Badge */}
              <div className="absolute top-1/2 -left-4 z-20 p-2.5 rounded-2xl bg-card/90 backdrop-blur-xl border border-blue-500/40 shadow-lg hidden sm:flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px] font-bold text-foreground">دارای تیک آبی اصالت</span>
              </div>

              {/* Phone Device Mockup Frame */}
              <div className="relative w-[290px] sm:w-[320px] rounded-[48px] bg-slate-950 p-3 shadow-2xl shadow-cyan-500/20 border-4 border-slate-800">
                {/* Speaker Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-950" />
                </div>

                {/* Inner Screen */}
                <div className="w-full rounded-[40px] overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-[#0b132b] text-white p-4 pt-10 space-y-4 border border-white/10 relative">
                  {/* Card Header & Avatar */}
                  <div className="text-center space-y-2 relative">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-400 shadow-lg shadow-cyan-500/30">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          alt="احمد رضایی"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center border-2 border-slate-900">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-extrabold text-sm text-white">احمد رضایی</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <span className="text-[11px] text-cyan-300 font-medium block">
                        مشاور توسعه کسب‌وکار و فناوری
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-relaxed px-2">
                      همکاری و مشاوره در زمینه تحول دیجیتال، استارتاپ‌ها و بازاریابی مدرن
                    </p>
                  </div>

                  {/* Quick Contact Action Pill */}
                  <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center gap-2 text-cyan-300 text-xs font-bold cursor-pointer hover:bg-cyan-500/30 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    <span>ذخیره در مخاطبین گوشی (vCard)</span>
                  </div>

                  {/* Mockup Profile Modules */}
                  <div className="space-y-2 text-xs">
                    {/* Module 1: WhatsApp */}
                    <div className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-[11px]">گفتگوی مستقیم در واتساپ</span>
                      </div>
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Module 2: Online Booking/Product */}
                    <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-cyan-400" />
                        <div>
                          <span className="font-bold text-[11px] block">رزرو جلسه مشاوره تخصصی</span>
                          <span className="text-[9px] text-cyan-300">۵۰۰ افغانی (پرداخت با حساب‌پی)</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-500 text-white font-bold text-[9px]">
                        رزرو
                      </span>
                    </div>

                    {/* Module 3: Portfolio / Catalog */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-[11px]">دانلود کاتالوگ خدمات و پروژه‌ها</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Branding Footer */}
                  <div className="pt-2 text-center text-[10px] text-slate-400 font-outfit">
                    Powered by <span className="font-bold text-cyan-400">Arya Link</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          ۳. بخش امکانات (Features Section)
      ========================================= */}
      <section id="features" className="py-20 sm:py-28 border-t border-border/80 bg-muted/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="cyan" className="font-sans text-xs">
              امکانات نسل آینده
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              ابزارهای پیشرفته برای رشد و توسعه برند شما
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              پلتفرم آریا لینک با تلفیق کارت هوشمند، هویت دیجیتال و ابزارهای تجاری، شما را در معرفی خدمات و ارتباط با مخاطبان متمایز می‌کند.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="rounded-3xl border-border bg-card/80 p-7 shadow-sm hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-13 h-13 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">ده‌ها ماژول هوشمند و متنوع</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ارتباط در شبکه‌های اجتماعی، گفتگوی مستقیم واتساپ، اسلایدر تصاویر، کاتالوگ‌های PDF دانلودی، نقشه آدرس، شمارشگر معکوس و ویدیوهای آپارات.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="rounded-3xl border-border bg-card/80 p-7 shadow-sm hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">فروشگاه آنلاین و پرداخت مستقیم</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                محصولات فیزیکی یا خدمات مشاوره‌ای خود را مستقیماً در صفحه لینک‌بایو بفروشید و مبالغ را از طریق حساب‌پی یا حواله بانکی تسویه کنید.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="rounded-3xl border-border bg-card/80 p-7 shadow-sm hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-13 h-13 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">احراز هویت امن و تیک آبی (KYC)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                با ارسال تذکره و سلفی تایید هویت، نشان رسمی تیک آبی دریافت کنید تا مشتریان با خیالی آسوده از شما خرید و خدمات دریافت نمایند.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="rounded-3xl border-border bg-card/80 p-7 shadow-sm hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-13 h-13 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">مینی CRM و مدیریت سرنخ‌ها</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                اطلاعات تماس، شماره موبایل و پیام‌های مشتریان علاقه‌مند را در پنل اختصاصی جمع‌آوری و برای کمپین‌های بعدی مدیریت کنید.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="rounded-3xl border-border bg-card/80 p-7 shadow-sm hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">کارت فیزیکی لمسی NFC</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                کارت شیک فلزی یا PVC اختصاصی شما تنها با نزدیک شدن به گوشی مخاطب صفحه را باز می‌کند؛ خداحافظی کامل با هزینه‌های چاپ کارت ویزیت کاغذی!
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="rounded-3xl border-border bg-card/80 p-7 shadow-sm hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group">
              <div className="w-13 h-13 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">آمار و تحلیل تحلیلی زنده</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                نمودارهای خطی بازدید روزانه، نرخ کلیک روی هر لینک، تفکیک دستگاه‌ها و آمار فروش محصولات به صورت دقیق در داشبورد شما ثبت می‌شوند.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================
          نحوه کارکرد (How it works)
      ========================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 border-t border-border/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="cyan" className="font-sans text-xs">
              ساده و سریع
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              در ۳ گام کارت هوشمند خود را بسازید
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              کمتر از ۲ دقیقه زمان می‌برد تا کسب‌وکار یا صفحه شخصی خود را به دنیای دیجیتال متصل کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 relative">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-cyan-500 font-black font-outfit text-2xl flex items-center justify-center mx-auto">
                01
              </div>
              <h3 className="text-base font-bold text-foreground">ثبت‌نام و انتخاب نام اختصاصی</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                حساب کاربری خود را رایگان ایجاد کنید و آدرس یکتا مثل <span className="font-outfit text-cyan-500">aryalink.af/ali</span> را برای خود رزرو نمایید.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-500 font-black font-outfit text-2xl flex items-center justify-center mx-auto">
                02
              </div>
              <h3 className="text-base font-bold text-foreground">شخصی‌سازی با ویرایشگر زنده</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                عکس پروفایل، تم‌های لوکس دارک نئون، ماژول‌های شبکه‌های اجتماعی، کاتالوگ و محصولات فروشگاهی را با چند کلیک اضافه کنید.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 relative">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-500 font-black font-outfit text-2xl flex items-center justify-center mx-auto">
                03
              </div>
              <h3 className="text-base font-bold text-foreground">اشتراک‌گذاری و فروش</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                لینک را در بیو اینستاگرام قرار دهید یا با کارت هوشمند NFC در جلسات کاری و نمایشگاه‌ها تنها با یک لمس اطلاعات را انتقال دهید.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          ۴. بخش تعرفه‌ها (Pricing Section)
      ========================================= */}
      <section id="pricing" className="py-20 sm:py-28 border-t border-border/80 bg-muted/20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Pricing Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="cyan" className="font-sans text-xs">
              شفاف و اقتصادی
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              پلن‌های قیمت‌گذاری متناسب با نیاز شما
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              از نسخه رایگان شروع کنید و هر زمان که نیاز داشتید به پلن تجاری ارتقا دهید.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* 1. Free Card */}
            <Card className="rounded-3xl border-border bg-card p-8 flex flex-col justify-between shadow-sm relative hover:border-border/80 transition-all">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">پلن رایگان (پایه)</h3>
                  <p className="text-xs text-muted-foreground">
                    مناسب برای استفاده‌های شخصی و شروع فعالیت در شبکه‌های اجتماعی
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-black font-outfit text-foreground">
                    رایگان
                  </div>
                  <span className="text-xs text-muted-foreground font-sans">برای همیشه بدون انقضا</span>
                </div>

                <div className="pt-4 border-t border-border space-y-3 text-xs">
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>۱ عدد کارت هوشمند دیجیتال</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>ماژول‌های پایه شبکه‌های اجتماعی و تماس</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>پیش‌نمایش آنلاین در تلفن همراه</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                    <span>دارای نشان و برندینگ آریا لینک</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <X className="w-4 h-4 text-rose-500/70 shrink-0" />
                    <span className="line-through">فروشگاه آنلاین و دریافت وجه</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <X className="w-4 h-4 text-rose-500/70 shrink-0" />
                    <span className="line-through">اتصال دامنه اختصاصی</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <X className="w-4 h-4 text-rose-500/70 shrink-0" />
                    <span className="line-through">تیک آبی احراز هویت</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-border bg-background hover:bg-muted font-bold text-xs"
                  >
                    شروع رایگان
                  </Button>
                </Link>
              </div>
            </Card>

            {/* 2. PRO Card (Highlighted) */}
            <Card className="rounded-3xl border-2 border-cyan-500 bg-gradient-to-b from-card via-card to-cyan-500/5 p-8 flex flex-col justify-between shadow-2xl shadow-cyan-500/15 relative overflow-hidden">
              {/* Highlight Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[11px] py-1 px-3 border-0 flex items-center gap-1 shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-white text-white" />
                  <span>پیشنهاد ویژه و پرفروش</span>
                </Badge>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">پلن حرفه‌ای (PRO)</h3>
                    <ShieldCheck className="w-5 h-5 text-cyan-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    برای بیزینس‌ها، فروشگاه‌ها، فریلنسرها و شرکت‌های معتبر
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-outfit text-cyan-500">
                      ۵۹۰
                    </span>
                    <span className="text-xs text-foreground font-bold">افغانی / ماهانه</span>
                  </div>
                  <span className="text-[11px] text-emerald-500 font-semibold block">
                    یا سالانه با تخفیف ۳۵٪ ویژه
                  </span>
                </div>

                <div className="pt-4 border-t border-border space-y-3.5 text-xs">
                  <div className="flex items-center gap-2.5 text-foreground font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>تک‌لینک‌های نامحدود شخصی و تجاری</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                      بدون هیچ‌گونه واترمارک و برندینگ سایت
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>فروشگاه آنلاین و اتصال به درگاه حساب‌پی</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>امکان اتصال دامنه اختصاصی (yourname.com)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span className="text-cyan-500 font-bold">
                      دریافت تیک آبی اصالت و احراز هویت سریع
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>دسترسی به تمام ماژول‌های پیشرفته (رزرو، کاتالوگ و...)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>پنل تسویه حساب مالی و واریز بانکی</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/register">
                  <Button
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
                  >
                    خرید و فعال‌سازی اشتراک PRO
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================
          سوالات متداول (FAQ Section)
      ========================================= */}
      <section id="faq" className="py-20 sm:py-28 border-t border-border/80 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <Badge variant="cyan" className="font-sans text-xs">
              پاسخ به ابهامات
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              سوالات متداول
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              پاسخ پرسش‌های پرتکرار کاربران پیرامون کارت‌های هوشمند و سرویس آریا لینک
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'آیا مخاطبان برای مشاهده صفحه کارت من نیاز به نصب هیچ برنامه‌ای دارند؟',
                a: 'خیر! یکی از بزرگ‌ترین مزیت‌های آریا لینک این است که مخاطب شما با هر گوشی موبایل (اندروید، آیفون یا کامپیوتر) و بدون نیاز به نصب هرگونه نرم‌افزار، تنها با لمس کارت یا اسکن کد، صفحه شما را در مرورگر مشاهده می‌کند.',
              },
              {
                q: 'کارت فیزیکی لمسی NFC چگونه کار می‌کند؟',
                a: 'کارت‌های NFC دارای چیپست هوشمند بدون باتری هستند. کافی است کارت را به پشت گوشی طرف مقابل نزدیک کنید؛ در کسری از ثانیه صفحه پروفایل دیجیتال شما بر روی گوشی او باز می‌شود.',
              },
              {
                q: 'تسویه حساب درآمدهای فروشگاه چگونه انجام می‌شود؟',
                a: 'پس از تایید هویت (KYC)، شما می‌توانید موجودی حاصل از فروش خدمات و محصولات خود را از طریق بخش تسویه حساب مستقیماً به حساب‌های بانکی معتبر یا ولت حساب‌پی (HesabPay) واریز کنید.',
              },
              {
                q: 'آیا می‌توانم لینک کارت خود را در بیو اینستاگرام قرار دهم؟',
                a: 'بله کاملاً! آدرس اختصاصی شما مانند aryalink.af/ali را می‌توانید در بیو اینستاگرام، تیک‌تاک، تلگرام، واتساپ یا امضای ایمیل‌های اداری خود قرار دهید.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card/70 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-foreground hover:bg-muted/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-500 transition-transform shrink-0 ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
