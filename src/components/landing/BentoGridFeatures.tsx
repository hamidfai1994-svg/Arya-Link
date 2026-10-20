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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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

// Card Entrance Variant (Enters from bottom with snappy ease-out)
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_SNAPPY,
    },
  },
};

// Inner Child Container
const innerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.12,
    },
  },
};

// Inner Child Item Variant (Micro-animations: subtle scale & fade)
const innerItemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASE_SNAPPY,
    },
  },
};

export function BentoGridFeatures() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';

  return (
    <section id="features" className="py-20 sm:py-28 relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

        {/* ========================================================
            SECTION HEADER (STAGGERED CHILDREN 0.15s CASCADE)
        ======================================================== */}
        <motion.div
          variants={headerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <motion.div variants={headerItemVariants} className="inline-block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>امکانات نسل آینده (Bento Grid)</span>
            </div>
          </motion.div>

          <motion.h2
            variants={headerItemVariants}
            className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.2]"
          >
            همه چیز برای درخشش هویت حرفه‌ای شما در{' '}
            <span className="bg-gradient-to-l from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              یک پلتفرم یکپارچه
            </span>
          </motion.h2>

          <motion.p
            variants={headerItemVariants}
            className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            ساختار انعطاف‌پذیر آریا لینک به شما اجازه می‌دهد تا بدون نیاز به دانش برنامه‌نویسی، یک مرکز فرماندهی شخصی و تجاری لوکس برای خود بسازید.
          </motion.p>
        </motion.div>

        {/* ========================================================
            BENTO GRID CONTAINER (STAGGERED CHILDREN CARDS)
        ======================================================== */}
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
        >

          {/* ========================================================
              CARD 1 (LARGE FEATURED): Online Store & HesabPay (Col 7)
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-7 group relative rounded-3xl p-6 sm:p-8 bg-card/60 dark:bg-white/[0.035] backdrop-blur-xl border border-border/80 dark:border-white/10 hover:border-cyan-500/60 hover:shadow-[0_0_40px_rgba(6,182,212,0.18)] transition-[border-color,box-shadow,background-color] duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Shine Flare */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <motion.div
              variants={innerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-4 relative z-10"
            >
              <motion.div
                variants={innerItemVariants}
                className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform"
              >
                <ShoppingBag className="w-6 h-6" />
              </motion.div>

              <motion.div variants={innerItemVariants} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    فروشگاه آنلاین و پرداخت مستقیم
                  </h3>
                  <Badge variant="cyan" className="text-[10px]">حساب‌پی & حواله</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  محصولات فیزیکی یا خدمات مشاوره‌ای خود را مستقیماً در صفحه لینک‌بایو بفروشید. مبالغ بدون کارمزد اضافه، مستقیماً به ولت حساب‌پی یا حساب بانکی شما واریز می‌شود.
                </p>
              </motion.div>

              {/* Interactive Storefront Mockup Widget */}
              <motion.div variants={innerItemVariants} className="pt-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 dark:bg-zinc-950/60 border border-border/70 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                  {/* Product Preview */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-md">
                      <Zap className="w-6 h-6 fill-cyan-400 text-cyan-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">کارت پی وی سی NFC آریا لینک</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-black font-outfit text-cyan-500">1,200 AFN</span>
                        <span className="text-[10px] text-muted-foreground line-through font-outfit">1,600</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-500 text-[9px] font-bold font-outfit">25% OFF</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button with Ripple Light-Sweep */}
                  <div className="w-full sm:w-auto flex sm:flex-col items-center justify-end gap-1.5">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING_FAST}
                      type="button"
                      className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group/btn"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>خرید آنی با حساب‌پی</span>
                    </motion.button>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                      <Check className="w-3 h-3" />
                      <span>تاییدیه و فاکتور فوری پیامکی</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              variants={innerItemVariants}
              className="pt-6 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground relative z-10 border-t border-border/40 mt-6"
            >
              <span className="px-2.5 py-1 rounded-full bg-card/80 border border-border">بدون کارمزد درگاه</span>
              <span className="px-2.5 py-1 rounded-full bg-card/80 border border-border">تسویه خودکار بانکی</span>
              <span className="px-2.5 py-1 rounded-full bg-card/80 border border-border">مدیریت موجودی انبار</span>
            </motion.div>
          </motion.div>

          {/* ========================================================
              CARD 2: Verified Identity & Blue Checkmark (Col 5)
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-5 group relative rounded-3xl p-6 sm:p-8 bg-card/60 dark:bg-white/[0.035] backdrop-blur-xl border border-border/80 dark:border-white/10 hover:border-blue-500/60 hover:shadow-[0_0_40px_rgba(59,130,246,0.18)] transition-[border-color,box-shadow,background-color] duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Shine Flare */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <motion.div
              variants={innerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-4 relative z-10"
            >
              <motion.div
                variants={innerItemVariants}
                className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform"
              >
                <ShieldCheck className="w-6 h-6" />
              </motion.div>

              <motion.div variants={innerItemVariants} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    احراز هویت امن و تیک آبی (KYC)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  با آپلود تذکره الکترونیکی یا پاسپورت، نشان رسمی اصالت هویت را دریافت کنید تا مشتریان با اعتماد صددرصدی با شما ارتباط برقرار کنند.
                </p>
              </motion.div>

              {/* KYC Visual Widget */}
              <motion.div variants={innerItemVariants} className="pt-2">
                <div className="p-4 rounded-2xl bg-muted/40 dark:bg-zinc-950/60 border border-blue-500/25 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                          AL
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center border border-slate-950">
                        <CheckCircle2 className="w-3 h-3 fill-white text-cyan-600" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-foreground">پروفایل تایید شده رسمی</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                      </div>
                      <span className="text-[10px] text-emerald-500 font-semibold block">
                        تطبیق تذکره و چهره موفق
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-400 font-bold text-[10px] border border-blue-500/30">
                    سطح ۳ (حرفه‌ای)
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={innerItemVariants}
              className="pt-4 flex items-center gap-2 text-[11px] text-muted-foreground relative z-10 border-t border-border/40 mt-6"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>جلوگیری از جعل نام و برندسازی رسمی</span>
            </motion.div>
          </motion.div>

          {/* ========================================================
              CARD 3: Dynamic QR Code with Brand Logo (Col 4)
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-4 group relative rounded-3xl p-6 sm:p-7 bg-card/60 dark:bg-white/[0.035] backdrop-blur-xl border border-border/80 dark:border-white/10 hover:border-amber-500/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.18)] transition-[border-color,box-shadow,background-color] duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Shine Flare */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <motion.div
              variants={innerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-4 relative z-10"
            >
              <motion.div
                variants={innerItemVariants}
                className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform"
              >
                <QrCode className="w-6 h-6" />
              </motion.div>

              <motion.div variants={innerItemVariants} className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  کد QR داینامیک با لوگوی اختصاصی
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  کد QR اختصاصی با لوگوی شخصی شما که هرگز منقضی نمی‌شود و با تغییر اطلاعات، محتوای آن آپدیت می‌ماند.
                </p>
              </motion.div>

              {/* Visual Vector QR Code Widget */}
              <motion.div variants={innerItemVariants} className="pt-2 flex justify-center">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-border/80 shadow-md relative group/qr flex flex-col items-center">
                  <div className="w-28 h-28 relative flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                    <QrCode className="w-full h-full text-foreground/90" />
                    {/* Centered Brand Emblem */}
                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-[10px] font-bold text-muted-foreground font-outfit">aryal.ink/farhad</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={innerItemVariants}
              className="pt-4 flex items-center justify-between text-[11px] text-muted-foreground relative z-10 border-t border-border/40 mt-5"
            >
              <span>دانلود با کیفیت وکتور:</span>
              <div className="flex items-center gap-1.5 font-outfit font-bold text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-muted border border-border">SVG</span>
                <span className="px-2 py-0.5 rounded-md bg-muted border border-border">PNG HD</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ========================================================
              CARD 4: Smart Modules & Social Stacks (Col 4)
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-4 group relative rounded-3xl p-6 sm:p-7 bg-card/60 dark:bg-white/[0.035] backdrop-blur-xl border border-border/80 dark:border-white/10 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.18)] transition-[border-color,box-shadow,background-color] duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Shine Flare */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <motion.div
              variants={innerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-4 relative z-10"
            >
              <motion.div
                variants={innerItemVariants}
                className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform"
              >
                <Share2 className="w-6 h-6" />
              </motion.div>

              <motion.div variants={innerItemVariants} className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  ده‌ها ماژول و کانال ارتباطی
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  واتساپ فوری، اینستاگرام، تلگرام، کاتالوگ PDF دانلودی، نقشه مسیریابی و فرم جمع‌آوری لید در یک پنل.
                </p>
              </motion.div>

              {/* Interactive Module Chips Stack with English numbers */}
              <motion.div variants={innerItemVariants} className="space-y-2 pt-2">
                <div className="p-2.5 rounded-xl bg-muted/40 dark:bg-zinc-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-foreground">گفتگوی مستقیم واتساپ</span>
                  </div>
                  <span className="text-[10px] font-outfit text-emerald-400 font-bold">+540 Clicks</span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 dark:bg-zinc-950/60 border border-pink-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span className="font-bold text-foreground">پیج اینستاگرام کاری</span>
                  </div>
                  <span className="text-[10px] font-outfit text-pink-400 font-bold">+1,280 Clicks</span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 dark:bg-zinc-950/60 border border-sky-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-foreground">کانال رسمی تلگرام</span>
                  </div>
                  <span className="text-[10px] font-outfit text-sky-400 font-bold">+310 Clicks</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={innerItemVariants}
              className="pt-4 flex items-center gap-2 text-[11px] text-muted-foreground relative z-10 border-t border-border/40 mt-5"
            >
              <Check className="w-3.5 h-3.5 text-purple-400" />
              <span>قابلیت جابه‌جایی و Drag & Drop آسان</span>
            </motion.div>
          </motion.div>

          {/* ========================================================
              CARD 5: Real-Time Analytics & Growth Chart (Col 4)
          ======================================================== */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-4 group relative rounded-3xl p-6 sm:p-7 bg-card/60 dark:bg-white/[0.035] backdrop-blur-xl border border-border/80 dark:border-white/10 hover:border-rose-500/60 hover:shadow-[0_0_40px_rgba(244,63,94,0.18)] transition-[border-color,box-shadow,background-color] duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Shine Flare */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <motion.div
              variants={innerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              className="space-y-4 relative z-10"
            >
              <motion.div
                variants={innerItemVariants}
                className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform"
              >
                <BarChart3 className="w-6 h-6" />
              </motion.div>

              <motion.div variants={innerItemVariants} className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  آمار و تحلیل بلادرنگ (Analytics)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  رصد هوشمند بازدیدها، نرخ کلیک، نوع سیستم‌عامل مخاطبان و محبوب‌ترین لینک‌های صفحه با نمودارهای زنده.
                </p>
              </motion.div>

              {/* Real-time Graph Visual with English numbers */}
              <motion.div
                variants={innerItemVariants}
                className="p-3.5 rounded-2xl bg-muted/40 dark:bg-zinc-950/60 border border-border/70 dark:border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">بازدید ۷ روز اخیر</span>
                    <span className="text-base font-black font-outfit text-foreground">+4,850</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-outfit">+28%</span>
                  </div>
                </div>

                {/* Minimalist Bar Chart Representation */}
                <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
                  {[35, 50, 45, 68, 60, 85, 95].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        style={{ height: `${val}%` }}
                        className={`w-full rounded-md transition-all group-hover:brightness-125 ${i === 6
                            ? 'bg-gradient-to-t from-cyan-500 to-blue-500 shadow-sm shadow-cyan-500/30'
                            : 'bg-muted-foreground/20'
                          }`}
                      />
                      <span className="text-[8px] text-muted-foreground font-mono">
                        {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={innerItemVariants}
              className="pt-4 flex items-center justify-between text-[11px] text-muted-foreground relative z-10 border-t border-border/40 mt-5"
            >
              <span>نرخ تبدیل (CTR):</span>
              <span className="font-bold text-emerald-500 font-outfit text-xs">84.8%</span>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

export default BentoGridFeatures;
