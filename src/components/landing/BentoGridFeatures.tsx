'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Share2,
  QrCode,
  BarChart3,
  Sparkles,
  Zap,
  Check,
  TrendingUp,
  MessageCircle,
  Instagram,
  Send,
  UserCheck,
  ArrowUpRight,
  Activity,
  Layers,
  PhoneCall,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;
const SPRING_FAST = { type: 'spring', stiffness: 250, damping: 25, mass: 0.5 } as const;

// Header Staggered Container & Items
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

// Staggered Container for Bento Cards
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

// Card Entrance Variant
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: EASE_SNAPPY,
    },
  },
};

export function BentoGridFeatures() {
  const { dir } = useLanguage();

  return (
    <section id="features" className="py-24 sm:py-36 relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[170px] pointer-events-none -z-10" />
      <div className="absolute bottom-16 left-12 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[170px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">

        {/* ========================================================
            SECTION HEADER: GENEROUS NEGATIVE SPACE & EDITORIAL SCALE
        ======================================================== */}
        <motion.div
          variants={headerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <motion.div variants={headerItemVariants} className="inline-block">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-xs font-semibold shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span>معماری ماژولار و نوآورانه (Bento Architecture)</span>
            </div>
          </motion.div>

          <motion.h2
            variants={headerItemVariants}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.15]"
          >
            همه چیز برای درخشش هویت حرفه‌ای در{' '}
            <span className="bg-gradient-to-l from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
              یک اکوسیستم یکپارچه
            </span>
          </motion.h2>

          <motion.p
            variants={headerItemVariants}
            className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal"
          >
            ساختار انعطاف‌پذیر آریا لینک به شما اجازه می‌دهد بدون نیاز به دانش برنامه‌نویسی، یک مرکز فرماندهی شخصی و تجاری لوکس برای خود بسازید.
          </motion.p>
        </motion.div>

        {/* ========================================================
            ASYMMETRIC BENTO GRID CONTAINER
        ======================================================== */}
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch"
        >

          {/* ========================================================
              TILE 1 (MASTER FEATURED - SPAN 8): E-Commerce & HesabPay
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-12 lg:col-span-8 group relative rounded-[2rem] p-7 sm:p-10 bg-card/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_50px_rgba(6,182,212,0.18)] transition-all duration-500 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Right Ambient Glint */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold shadow-md shadow-cyan-500/10 border border-cyan-500/25 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <Badge variant="cyan" className="font-outfit text-xs px-3 py-1">
                  HesabPay & Direct Cash
                </Badge>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  فروشگاه آنلاین و دریافت مستقیم وجه
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                  محصولات فیزیکی، فایل‌های دیجیتال یا خدمات مشاوره‌ای خود را مستقیماً در صفحه مینی‌ویب‌سایت بفروشید. مبالغ بدون کارمزد اضافه، مستقیماً به ولت حساب‌پی یا حساب بانکی شما واریز می‌گردد.
                </p>
              </div>

              {/* Interactive Storefront Mockup Widget */}
              <div className="pt-2">
                <div className="p-4 sm:p-6 rounded-2xl bg-background/70 dark:bg-zinc-950/70 border border-border/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-inner">
                  {/* Product Preview */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-zinc-900 to-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/15">
                      <Zap className="w-8 h-8 fill-cyan-400 text-cyan-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground block">کارت هوشمند NFC آریا لینک (نسل 2026)</span>
                      <div className="flex items-center gap-2.5 mt-1 font-mono">
                        <span className="text-sm font-black text-cyan-400">1,200 AFN</span>
                        <span className="text-xs text-muted-foreground line-through">1,600</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">25% تخفیف</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING_FAST}
                      type="button"
                      className="w-full sm:w-auto h-12 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 relative overflow-hidden group/btn cursor-pointer"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      <ShoppingBag className="w-4 h-4 fill-current" />
                      <span>خرید آنی با حساب‌پی</span>
                    </motion.button>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>تسویه مستقیم و بدون کارمزد پلتفرم</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="pt-6 flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground relative z-10 border-t border-border/60 mt-6">
              <span className="px-3 py-1 rounded-xl bg-card/80 border border-border">0% کارمزد تراکنش</span>
              <span className="px-3 py-1 rounded-xl bg-card/80 border border-border">اتصال به حساب‌پی و صرافی</span>
              <span className="px-3 py-1 rounded-xl bg-card/80 border border-border">صدور خودکار فاکتور دیجیتال</span>
            </div>
          </motion.div>

          {/* ========================================================
              TILE 2 (TALL ACCENT - SPAN 4): Verified Identity & KYC
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-12 lg:col-span-4 group relative rounded-[2rem] p-7 sm:p-8 bg-card/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.18)] transition-all duration-500 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-6 relative z-10">
              <div className="w-13 h-13 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold shadow-md shadow-blue-500/10 border border-blue-500/25 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  احراز هویت و تیک آبی (KYC)
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  با آپلود تذکره الکترونیکی یا پاسپورت، نشان رسمی اصالت هویت را دریافت نمایید تا مشتریان و شرکای تجاری با اعتماد صددرصدی با شما ارتباط برقرار کنند.
                </p>
              </div>

              {/* KYC Visual Emblem */}
              <div className="p-4 rounded-2xl bg-background/70 dark:bg-zinc-950/70 border border-blue-500/30 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-bold text-xs font-mono">
                        PRO
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center border border-slate-950">
                      <CheckCircle2 className="w-3 h-3 fill-slate-950 text-cyan-400" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">پروفایل تاییدشده رسمی</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                      تطبیق تذکره و چهره موفق
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-300 font-mono font-bold text-[10px] border border-blue-500/30">
                  Level 3
                </span>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-[11px] text-muted-foreground relative z-10 border-t border-border/60 mt-6">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>جلوگیری از جعل نام و اعتباربخشی به هویت تجاری</span>
            </div>
          </motion.div>

          {/* ========================================================
              TILE 3 (SPAN 4): Real-time Analytics & Live Sparkline
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-12 lg:col-span-4 group relative rounded-[2rem] p-7 sm:p-8 bg-card/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_50px_rgba(16,185,129,0.18)] transition-all duration-500 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-5 relative z-10">
              <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10 border border-emerald-500/25 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  آمار زنده و تحلیل رفتار مخاطبان
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  تعداد دقیق بازدیدها، کلیک‌های تفکیک‌شده روی لینک‌ها و شهرت کارت خود را لحظه‌ای رصد کنید.
                </p>
              </div>

              {/* Live Metric Mini Card */}
              <div className="p-4 rounded-2xl bg-background/70 dark:bg-zinc-950/70 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">بازدیدهای این هفته:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +24% (1,420)
                  </span>
                </div>

                {/* Visual Sparkline Bars */}
                <div className="grid grid-cols-7 gap-1.5 h-10 items-end pt-1">
                  {[45, 65, 55, 80, 70, 95, 88].map((val, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${val}%` }}
                      className="rounded-md bg-gradient-to-t from-emerald-500/40 to-emerald-400 hover:from-emerald-400 hover:to-cyan-400 transition-colors"
                      title={`${val}%`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-[11px] text-muted-foreground relative z-10 border-t border-border/60 mt-6">
              <span>گزارش ترافیک آیفون و اندروید</span>
              <span className="font-mono text-cyan-400 font-bold">100% Realtime</span>
            </div>
          </motion.div>

          {/* ========================================================
              TILE 4 (SPAN 4): Dynamic Vector QR with Brand Logo
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-12 lg:col-span-4 group relative rounded-[2rem] p-7 sm:p-8 bg-card/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-amber-500/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.18)] transition-all duration-500 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-5 relative z-10">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold shadow-md shadow-amber-500/10 border border-amber-500/25 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  کد QR داینامیک با نشان تجاری
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  کد هوشمند با قابلیت چاپ روی کاتالوگ، استندهای رومیزی، بنر و محصولات با دانلود فرمت باکیفیت برداری SVG.
                </p>
              </div>

              {/* QR Preview Widget */}
              <div className="p-4 rounded-2xl bg-background/70 dark:bg-zinc-950/70 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
                  <div className="w-full h-full border-2 border-slate-950 rounded-sm grid grid-cols-3 gap-0.5 p-0.5">
                    <div className="bg-slate-950 rounded-xs" />
                    <div className="bg-slate-300" />
                    <div className="bg-slate-950 rounded-xs" />
                    <div className="bg-slate-300" />
                    <div className="bg-cyan-500 rounded-full" />
                    <div className="bg-slate-300" />
                    <div className="bg-slate-950 rounded-xs" />
                    <div className="bg-slate-300" />
                    <div className="bg-slate-950 rounded-xs" />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-foreground block">کد داینامیک با اسکن نامحدود</span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                    کیفیت چاپ 300 DPI
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2 text-[11px] text-muted-foreground relative z-10 border-t border-border/60 mt-6">
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>امکان تغییر لینک مقصد بدون نیاز به چاپ مجدد کد</span>
            </div>
          </motion.div>

          {/* ========================================================
              TILE 5 (SPAN 4): Instant vCard 3.0 & Direct Tap
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-12 lg:col-span-4 group relative rounded-[2rem] p-7 sm:p-8 bg-card/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-border/80 dark:border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_50px_rgba(168,85,247,0.18)] transition-all duration-500 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-5 relative z-10">
              <div className="w-13 h-13 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold shadow-md shadow-purple-500/10 border border-purple-500/25 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  ذخیره مستقیم در مخاطبان (vCard 3.0)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  مخاطبان با یک کلیک می‌توانند نام، شماره تیلیفون، ایمیل و وب‌سایت شما را مستقیماً در مخاطبان گوشی خود ذخیره نمایند.
                </p>
              </div>

              {/* Contact Card Mini Simulation */}
              <div className="p-4 rounded-2xl bg-background/70 dark:bg-zinc-950/70 border border-purple-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">ذخیره خودکار در کنتاکت‌ها</span>
                    <span className="text-[10px] text-muted-foreground font-mono">بدون نیاز به تایپ شماره</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-400 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  1-Tap Save
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2 text-[11px] text-muted-foreground relative z-10 border-t border-border/60 mt-6">
              <Check className="w-3.5 h-3.5 text-purple-400" />
              <span>سازگاری کامل با iOS Contacts و Android Google Contacts</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

export default BentoGridFeatures;
