'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Layers,
  ShoppingBag,
  ShieldCheck,
  Users,
  Smartphone,
  BarChart3,
  Zap,
  ChevronDown,
  X,
  Check,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ScrollAnimate } from '@/components/ui/ScrollAnimate';
import { HeroPhoneMockup } from '@/components/landing/HeroPhoneMockup';

export default function LandingPage() {
  const { t, dir } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const features = [
    {
      icon: Layers,
      colorClass: 'bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20',
      title: 'ده‌ها ماژول هوشمند و متنوع',
      desc: 'ارتباط در شبکه‌های اجتماعی، گفتگوی مستقیم واتساپ، اسلایدر تصاویر، کاتالوگ‌های PDF دانلودی، نقشه آدرس، شمارشگر معکوس و ویدیوهای آپارات.',
    },
    {
      icon: ShoppingBag,
      colorClass: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20',
      title: 'فروشگاه آنلاین و پرداخت مستقیم',
      desc: 'محصولات فیزیکی یا خدمات مشاوره‌ای خود را مستقیماً در صفحه لینک‌بایو بفروشید و مبالغ را از طریق حساب‌پی یا حواله بانکی تسویه کنید.',
    },
    {
      icon: ShieldCheck,
      colorClass: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20',
      title: 'احراز هویت امن و تیک آبی (KYC)',
      desc: 'با ارسال تذکره و سلفی تایید هویت، نشان رسمی تیک آبی دریافت کنید تا مشتریان با خیالی آسوده از شما خرید و خدمات دریافت نمایند.',
    },
    {
      icon: Users,
      colorClass: 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20',
      title: 'مینی CRM و مدیریت سرنخ‌ها',
      desc: 'اطلاعات تماس، شماره موبایل و پیام‌های مشتریان علاقه‌مند را در پنل اختصاصی جمع‌آوری و برای کمپین‌های بعدی مدیریت کنید.',
    },
    {
      icon: Zap,
      colorClass: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20',
      title: 'کارت فیزیکی لمسی NFC',
      desc: 'کارت شیک فلزی یا PVC اختصاصی شما تنها با نزدیک شدن به گوشی مخاطب صفحه را باز می‌کند؛ خداحافظی کامل با هزینه‌های چاپ کارت ویزیت کاغذی!',
    },
    {
      icon: BarChart3,
      colorClass: 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20',
      title: 'آمار و تحلیل تحلیلی زنده',
      desc: 'نمودارهای خطی بازدید روزانه، نرخ کلیک روی هر لینک، تفکیک دستگاه‌ها و آمار فروش محصولات به صورت دقیق در داشبورد شما ثبت می‌شوند.',
    },
  ];

  const steps = [
    {
      num: '01',
      color: 'bg-cyan-500/15 text-cyan-500',
      title: 'ثبت‌نام و انتخاب نام اختصاصی',
      desc: 'حساب کاربری خود را رایگان ایجاد کنید و آدرس یکتا مثل aryal.ink/ali را برای خود رزرو نمایید.',
    },
    {
      num: '02',
      color: 'bg-blue-500/15 text-blue-500',
      title: 'شخصی‌سازی با ویرایشگر زنده',
      desc: 'عکس پروفایل، تم‌های لوکس دارک نئون، ماژول‌های شبکه‌های اجتماعی، کاتالوگ و محصولات فروشگاهی را با چند کلیک اضافه کنید.',
    },
    {
      num: '03',
      color: 'bg-purple-500/15 text-purple-500',
      title: 'اشتراک‌گذاری و فروش',
      desc: 'لینک را در بیو اینستاگرام قرار دهید یا با کارت هوشمند NFC در جلسات کاری و نمایشگاه‌ها تنها با یک لمس اطلاعات را انتقال دهید.',
    },
  ];

  const faqs = [
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
      a: 'بله کاملاً! آدرس اختصاصی شما مانند aryal.ink/ali را می‌توانید در بیو اینستاگرام، تیک‌تاک، تلگرام، واتساپ یا امضای ایمیل‌های اداری خود قرار دهید.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans select-none overflow-x-hidden" dir={dir}>
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-1000" />
      <div className="fixed top-1/3 left-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* =========================================
          ۱. هیرو سکشن (Hero Section)
      ========================================= */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Right Column: Hero Texts & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              {/* Badge */}
              <ScrollAnimate delay={0.1} direction="up">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-xs font-semibold shadow-inner">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span>اولین پلتفرم کارت ویزیت هوشمند NFC و فروشگاه بیو در افغانستان</span>
                </div>
              </ScrollAnimate>

              {/* Catchy Headline */}
              <ScrollAnimate delay={0.2} direction="up">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.25] text-foreground">
                  نسل جدید{' '}
                  <span className="bg-gradient-to-l from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    کارت ویزیت هوشمند
                  </span>{' '}
                  و لینک‌بایو
                </h1>
              </ScrollAnimate>

              {/* Subtitle */}
              <ScrollAnimate delay={0.3} direction="up">
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  تمام راه‌های ارتباطی، شبکه‌های اجتماعی، کاتالوگ‌ها و محصولات خود را در یک لینک یکپارچه و زیبا با مشتریان به اشتراک بگذارید. فقط با یک لمس روی موبایل مخاطب!
                </p>
              </ScrollAnimate>

              {/* CTA Buttons */}
              <ScrollAnimate delay={0.4} direction="up">
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
              </ScrollAnimate>

              {/* Trust Indicators Row */}
              <ScrollAnimate delay={0.5} direction="up">
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
              </ScrollAnimate>
            </div>

            {/* Left Column: Realistic Interactive Mobile Mockup */}
            <div className="lg:col-span-5 flex justify-center relative">
              <HeroPhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          ۲. بخش امکانات (Features Section)
      ========================================= */}
      <section id="features" className="py-20 sm:py-28 border-t border-border/80 bg-muted/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <ScrollAnimate delay={0.1} direction="up" className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="cyan" className="font-sans text-xs">
              امکانات نسل آینده
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              ابزارهای پیشرفته برای رشد و توسعه برند شما
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              پلتفرم آریا لینک با تلفیق کارت هوشمند، هویت دیجیتال و ابزارهای تجاری، شما را در معرفی خدمات و ارتباط با مخاطبان متمایز می‌کند.
            </p>
          </ScrollAnimate>

          {/* Features Grid with Staggered ScrollAnimation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <ScrollAnimate key={idx} delay={idx * 0.1} direction="up" className="h-full">
                  <Card className="rounded-3xl border-border bg-card/80 p-7 shadow-sm hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col justify-between">
                    <div>
                      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${feature.colorClass}`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </Card>
                </ScrollAnimate>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================
          ۳. نحوه کارکرد (How it works)
      ========================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 border-t border-border/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <ScrollAnimate delay={0.1} direction="up" className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="cyan" className="font-sans text-xs">
              ساده و سریع
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              در ۳ گام کارت هوشمند خود را بسازید
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              کمتر از ۲ دقیقه زمان می‌برد تا کسب‌وکار یا صفحه شخصی خود را به دنیای دیجیتال متصل کنید.
            </p>
          </ScrollAnimate>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, idx) => (
              <ScrollAnimate key={idx} delay={idx * 0.15} direction="up" className="h-full">
                <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-4 relative hover:border-cyan-500/40 hover:shadow-lg transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-2xl font-black font-outfit text-2xl flex items-center justify-center mx-auto ${st.color}`}>
                    {st.num}
                  </div>
                  <h3 className="text-base font-bold text-foreground">{st.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          ۴. بخش تعرفه‌ها (Pricing Section)
      ========================================= */}
      <section id="pricing" className="py-20 sm:py-28 border-t border-border/80 bg-muted/20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Pricing Header */}
          <ScrollAnimate delay={0.1} direction="up" className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="cyan" className="font-sans text-xs">
              شفاف و اقتصادی
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              پلن‌های قیمت‌گذاری متناسب با نیاز شما
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              از نسخه رایگان شروع کنید و هر زمان که نیاز داشتید به پلن تجاری ارتقا دهید.
            </p>
          </ScrollAnimate>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* 1. Free Card */}
            <ScrollAnimate delay={0.15} direction="up" className="h-full">
              <Card className="rounded-3xl border-border bg-card p-8 flex flex-col justify-between shadow-sm relative hover:border-border/80 hover:-translate-y-1 transition-all duration-300 h-full">
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
            </ScrollAnimate>

            {/* 2. PRO Card (Highlighted) */}
            <ScrollAnimate delay={0.25} direction="up" className="h-full">
              <Card className="rounded-3xl border-2 border-cyan-500 bg-gradient-to-b from-card via-card to-cyan-500/5 p-8 flex flex-col justify-between shadow-2xl shadow-cyan-500/15 relative overflow-hidden hover:-translate-y-1 transition-all duration-300 h-full">
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
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* =========================================
          ۵. سوالات متداول (FAQ Section)
      ========================================= */}
      <section id="faq" className="py-20 sm:py-28 border-t border-border/80 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <ScrollAnimate delay={0.1} direction="up" className="text-center max-w-xl mx-auto space-y-3">
            <Badge variant="cyan" className="font-sans text-xs">
              پاسخ به ابهامات
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              سوالات متداول
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              پاسخ پرسش‌های پرتکرار کاربران پیرامون کارت‌های هوشمند و سرویس آریا لینک
            </p>
          </ScrollAnimate>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <ScrollAnimate key={idx} delay={idx * 0.08} direction="up">
                <div
                  className="rounded-2xl border border-border bg-card/70 overflow-hidden transition-all hover:border-cyan-500/30"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-cyan-500 transition-transform duration-200 shrink-0 ${activeFaq === idx ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
