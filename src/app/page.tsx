'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Modern Landing Page Components (Phase 28.1 Advanced Choreography & Realism)
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsAndMarqueeSection } from '@/components/landing/StatsAndMarqueeSection';
import { BentoGridFeatures } from '@/components/landing/BentoGridFeatures';
import { NfcShowcaseSection } from '@/components/landing/NfcShowcaseSection';
import { PricingSection } from '@/components/landing/PricingSection';

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;
const SPRING_FAST = { type: 'spring', stiffness: 250, damping: 25, mass: 0.5 } as const;

// Header Staggered Container & Items (Stage 28.3)
const headerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

const headerItemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_SNAPPY,
    },
  },
};

export default function LandingPage() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const steps = [
    {
      num: '01',
      badge: 'گام اول',
      color: 'from-cyan-500 to-blue-600',
      title: 'ثبت‌نام و انتخاب نام اختصاصی',
      desc: 'حساب کاربری خود را در کمتر از ۱ دقیقه رایگان ایجاد کنید و آدرس یکتا مانند aryal.ink/ali را برای برند شخصی یا تجاری خود رزرو نمایید.',
    },
    {
      num: '02',
      badge: 'گام دوم',
      color: 'from-blue-600 to-indigo-600',
      title: 'شخصی‌سازی با ویرایشگر زنده',
      desc: 'عکس پروفایل، تم‌های لوکس نئون، شبکه‌های اجتماعی، کاتالوگ‌های دانلودی و محصولات فروشگاهی را در پیش‌نمایش زنده موبایل بچینید.',
    },
    {
      num: '03',
      badge: 'گام سوم',
      color: 'from-purple-600 to-pink-600',
      title: 'اشتراک‌گذاری هوشمند و فروش',
      desc: 'لینک را در بیو اینستاگرام قرار دهید یا با کارت فیزیکی هوشمند NFC در جلسات، کنفرانس‌ها و نمایشگاه‌ها تنها با یک تماس اطلاعات را انتقال دهید.',
    },
  ];

  const faqs = [
    {
      q: 'آیا مخاطبان برای مشاهده صفحه کارت من نیاز به نصب هیچ برنامه‌ای دارند؟',
      a: 'خیر! یکی از بزرگ‌ترین مزیت‌های آریا لینک این است که مخاطب شما با هر گوشی موبایل (اندروید، آیفون یا کامپیوتر) و بدون نیاز به نصب هرگونه نرم‌افزار، تنها با لمس کارت یا اسکن کد، صفحه شما را مستقیماً در مرورگر مشاهده می‌کند.',
    },
    {
      q: 'کارت فیزیکی لمسی NFC چگونه کار می‌کند؟',
      a: 'کارت‌های NFC دارای چیپست هوشمند ایمن و بدون باتری هستند. کافی است کارت را به پشت گوشی طرف مقابل نزدیک کنید؛ در کسری از ثانیه لینک کارت دیجیتال شما روی صفحه گوشی او باز می‌شود.',
    },
    {
      q: 'تسویه حساب درآمدهای فروشگاه چگونه انجام می‌شود؟',
      a: 'پس از تایید هویت (KYC)، موجودی حاصل از فروش خدمات و محصولات شما از طریق پنل تسویه حساب، مستقیماً به ولت حساب‌پی (HesabPay) یا حساب‌های بانکی معتبر افغانستان واریز خواهد شد.',
    },
    {
      q: 'نشان رسمی تیک آبی (KYC) چیست و چگونه دریافت می‌شود؟',
      a: 'تیک آبی نشان‌دهنده اصالت هویت شماست. با ارسال تصویر تذکره الکترونیکی یا پاسپورت در پنل، کارشناسان ما مدارک را بررسی کرده و پس از تطبیق، نشان رسمی تیک آبی بر روی پروفایل و کارت شما فعال می‌شود.',
    },
    {
      q: 'آیا می‌توانم لینک کارت خود را در بیو اینستاگرام و شبکه‌ها قرار دهم؟',
      a: 'بله کاملاً! آدرس اختصاصی شما مانند aryal.ink/ali را می‌توانید در بیو اینستاگرام، تیک‌تاک، تلگرام، واتساپ یا امضای ایمیل‌های اداری خود قرار دهید تا تمامی کانال‌های شما در یک لینک در دسترس باشند.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans select-none overflow-x-hidden" dir={dir}>
      
      {/* =========================================
          ۱. هیرو سکشن (Link-in-Bio & 3D Interactive Phone)
      ========================================= */}
      <HeroSection />

      {/* =========================================
          ۲ و ۳. سکشن ادغام‌شده آمار و نوار متحرک (Merged Stats & Seamless Marquee)
      ========================================= */}
      <StatsAndMarqueeSection />

      {/* =========================================
          ۴. بخش امکانات (Bento Grid Features)
      ========================================= */}
      <BentoGridFeatures />

      {/* =========================================
          ۵. سکشن جذاب NFC Showcase (فقط با یک تماس)
      ========================================= */}
      <NfcShowcaseSection />

      {/* =========================================
          ۶. نحوه کارکرد (۳ گام تا کارت هوشمند)
      ========================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 border-t border-border/80 relative overflow-hidden">
        {/* Soft Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header (Staggered Children 0.15s Cascade) */}
          <motion.div
            variants={headerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <motion.div variants={headerItemVariants} className="inline-block">
              <Badge variant="cyan" className="font-sans text-xs">
                ساده، مدرن و سریع
              </Badge>
            </motion.div>
            <motion.h2
              variants={headerItemVariants}
              className="text-3xl sm:text-4xl font-black text-foreground tracking-tight"
            >
              در ۳ گام ساده کارت هوشمند خود را بسازید
            </motion.h2>
            <motion.p
              variants={headerItemVariants}
              className="text-xs sm:text-sm text-muted-foreground leading-relaxed"
            >
              کمتر از ۲ دقیقه زمان می‌برد تا کسب‌وکار یا صفحه شخصی خود را به دنیای فناوری NFC متصل کنید.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            transition={{ staggerChildren: 0.14 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {steps.map((st, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE_SNAPPY },
                  },
                }}
                className="group p-8 rounded-3xl bg-card/60 dark:bg-white/[0.03] border border-border/80 backdrop-blur-xl space-y-5 relative hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 transition-[border-color,box-shadow] duration-300 flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl font-black font-outfit text-2xl flex items-center justify-center bg-gradient-to-tr ${st.color} text-white shadow-lg group-hover:scale-105 transition-transform`}
                    >
                      {st.num}
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground px-2.5 py-1 rounded-full bg-muted/60 border border-border">
                      {st.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    {st.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center gap-2 text-[11px] text-cyan-500 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>انجام بدون نیاز به دانش فنی</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================
          ۷. بخش تعرفه‌ها (Shimmer Pro Pricing)
      ========================================= */}
      <PricingSection />

      {/* =========================================
          ۸. سوالات متداول (FAQ Section With Snappy Ease-Out & Spring)
      ========================================= */}
      <section id="faq" className="py-20 sm:py-28 border-t border-border/80 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* FAQ Header (Staggered Children 0.15s Cascade) */}
          <motion.div
            variants={headerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="text-center max-w-xl mx-auto space-y-3"
          >
            <motion.div variants={headerItemVariants} className="inline-block">
              <Badge variant="cyan" className="font-sans text-xs">
                پاسخ به ابهامات
              </Badge>
            </motion.div>
            <motion.h2
              variants={headerItemVariants}
              className="text-3xl sm:text-4xl font-black text-foreground tracking-tight"
            >
              سوالات متداول
            </motion.h2>
            <motion.p
              variants={headerItemVariants}
              className="text-xs sm:text-sm text-muted-foreground"
            >
              پاسخ پرسش‌های پرتکرار پیرامون کارت‌های هوشمند، فروشگاه و سرویس آریا لینک
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-3.5"
          >
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 25 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE_SNAPPY },
                  },
                }}
                className="rounded-2xl border border-border/80 bg-card/60 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-colors duration-200 hover:border-cyan-500/40"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-cyan-500 shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 transition-transform duration-300 shrink-0 ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-3 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border/40 font-normal">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================
          ۹. بنر نهایی دعوت به اقدام (Final Conversion CTA)
      ========================================= */}
      <section className="py-16 sm:py-24 border-t border-border/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: EASE_SNAPPY }}
            className="p-8 sm:p-12 rounded-[32px] bg-card/85 dark:bg-slate-950/85 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl shadow-cyan-500/15 text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" />
              <span>پیوستن به نسل جدید کارت‌های هوشمند</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.25]">
              آماده‌اید ارتباطات کاری خود را متحول کنید؟
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              همین حالا به صورت رایگان ثبت‌نام کنید، مینی‌وب‌سایت اختصاصی خود را بسازید یا کارت فیزیکی لوکس NFC را با ارسال رایگان سفارش دهید.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING_FAST}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm sm:text-base shadow-xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>شروع رایگان و ساخت کارت</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                  </Button>
                </motion.div>
              </Link>

              <Link href="/services" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING_FAST}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-14 px-7 rounded-2xl border-border bg-card/60 backdrop-blur-md text-foreground font-bold text-xs sm:text-sm hover:bg-muted"
                  >
                    <span>سفارش سازمانی و شرکتی</span>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
