'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  X,
  Flame,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;
const SPRING_FAST = { type: 'spring', stiffness: 250, damping: 25, mass: 0.5 } as const;

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

export function PricingSection() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <section id="pricing" className="py-20 sm:py-28 relative border-t border-border/80 bg-muted/15 overflow-hidden select-none">
      {/* Background Soft Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header (Staggered Children 0.15s Cascade) */}
        <motion.div
          variants={headerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="text-center max-w-2xl mx-auto space-y-4"
        >
          <motion.div variants={headerItemVariants} className="inline-block">
            <Badge variant="cyan" className="font-sans text-xs">
              شفاف و اقتصادی
            </Badge>
          </motion.div>

          <motion.h2
            variants={headerItemVariants}
            className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.2]"
          >
            پلن‌های قیمت‌گذاری متناسب با{' '}
            <span className="bg-gradient-to-l from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              نیاز شما
            </span>
          </motion.h2>

          <motion.p
            variants={headerItemVariants}
            className="text-xs sm:text-sm text-muted-foreground leading-relaxed"
          >
            از نسخه رایگان شروع کنید و هر زمان که نیاز داشتید به امکانات پیشرفته تجاری و نشان تیک آبی ارتقا دهید.
          </motion.p>

          {/* Billing Cycle Switcher Toggle */}
          <motion.div variants={headerItemVariants} className="pt-2 flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-card border border-border shadow-xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-muted text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                پرداخت ماهانه
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>پرداخت سالانه</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/25 text-emerald-300 font-outfit text-[10px] font-bold">
                  35% OFF
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ========================================================
              CARD 1: FREE TIER (Col 5)
          ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: EASE_SNAPPY }}
            className="lg:col-span-5 flex flex-col"
          >
            <Card className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:border-border transition-colors duration-200 h-full">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">پلن پایه (Free)</h3>
                    <Badge variant="outline" className="text-[10px] font-outfit">FREE</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    مناسب برای استفاده‌های شخصی و شروع فعالیت در شبکه‌های اجتماعی
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <div className="flex items-baseline gap-1.5 font-outfit" dir="ltr">
                      <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                        0
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-muted-foreground">
                        AFN
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-bold">/ برای همیشه</span>
                  </div>
                  <span className="text-xs text-emerald-500 font-semibold block">
                    کاملاً رایگان بدون تاریخ انقضا
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>لینک‌بایو اختصاصی (aryal.ink/username)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>ماژول‌های پایه شبکه‌های اجتماعی و تماس</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>پیش‌نمایش آنلاین در تمام تلفن‌های همراه</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                    <span>دارای نشان و برندینگ آریا لینک</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <X className="w-4 h-4 text-rose-500/70 shrink-0" />
                    <span className="line-through">فروشگاه آنلاین و درگاه حساب‌پی</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <X className="w-4 h-4 text-rose-500/70 shrink-0" />
                    <span className="line-through">اتصال دامنه اختصاصی</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <X className="w-4 h-4 text-rose-500/70 shrink-0" />
                    <span className="line-through">تیک آبی اصالت و احراز هویت</span>
                  </div>
                </div>
              </div>

              {/* Action Button with Tactile Scale */}
              <div className="pt-8">
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    transition={SPRING_FAST}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-border bg-card/80 hover:bg-muted font-bold text-sm shadow-xs"
                    >
                      شروع رایگان
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* ========================================================
              CARD 2: SHIMMER PRO TIER (Col 7 - HIGHLIGHTED)
          ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_SNAPPY }}
            className="lg:col-span-7 flex flex-col relative"
          >
            {/* Glowing Gradient Border Container */}
            <div className="p-[2px] rounded-[30px] bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_50px_rgba(6,182,212,0.25)] h-full relative overflow-hidden flex flex-col">
              
              {/* Shimmer Light Beam Effect across Card */}
              <motion.div
                animate={{
                  x: ['-120%', '240%'],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 1.2,
                }}
                className="pointer-events-none absolute -inset-y-10 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 dark:via-cyan-300/15 to-transparent z-20"
              />

              {/* Main Pro Card Content */}
              <div className="rounded-[28px] bg-card/95 dark:bg-slate-950/95 backdrop-blur-2xl p-7 sm:p-9 flex flex-col justify-between h-full relative z-10 overflow-hidden">
                
                {/* Highlight Badge */}
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[11px] py-1 px-3 border-0 flex items-center gap-1.5 shadow-md shadow-cyan-500/25">
                    <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
                    <span>پیشنهاد ویژه و پرفروش</span>
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 pr-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-foreground">
                        پلن حرفه‌ای (PRO)
                      </h3>
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                      برای مدیران، کسب‌وکارها، پزشکان، وکلا، فریلنسرها و شرکت‌های معتبر که می‌خواهند حداکثر اعتبار را ایجاد کنند.
                    </p>
                  </div>

                  {/* Price Section with AnimatePresence on Cycle Switch */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={billingCycle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: EASE_SNAPPY }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-baseline gap-2">
                        <div className="flex items-baseline gap-1.5 font-outfit" dir="ltr">
                          <span className="text-4xl sm:text-5xl font-black text-cyan-500 dark:text-cyan-400 tracking-tight">
                            {billingCycle === 'yearly' ? '380' : '590'}
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-300">
                            AFN
                          </span>
                        </div>
                        <span className="text-xs text-foreground font-bold">
                          / ماهانه
                        </span>
                      </div>
                      {billingCycle === 'yearly' ? (
                        <div className="text-xs text-emerald-500 font-bold flex items-center gap-1.5 flex-wrap">
                          <span>پرداخت سالانه</span>
                          <span dir="ltr" className="font-outfit font-black">4,560 AFN</span>
                          <span>(صرفه‌جویی سالانه</span>
                          <span dir="ltr" className="font-outfit font-black">2,520 AFN</span>
                          <span>)</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground block font-sans">
                          پرداخت ماهانه بدون قرارداد سالانه
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Pro Feature Checklist (Dual Column) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2.5 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>تیک آبی رسمی تایید هویت (KYC)</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>فروشگاه آنلاین با درگاه حساب‌پی</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>اتصال دامنه اختصاصی (yourname.af)</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>کارت فیزیکی لمسی NFC با لوگو</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>حذف کامل لوگو و برندینگ آریا لینک</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>کد QR وکتور با دانلود نامحدود</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>آمار و تحلیل پیشرفته بازدیدها</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>پشتیبانی VIP و اولویت‌دار 24/7</span>
                    </div>
                  </div>
                </div>

                {/* Call to Action Button with Tactile Hover Scale & Light Sweep */}
                <div className="pt-8">
                  <Link href="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      transition={SPRING_FAST}
                    >
                      <Button
                        size="lg"
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                      >
                        {/* Light sweep */}
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                        
                        <Sparkles className="w-4 h-4 fill-white" />
                        <span>خرید و فعال‌سازی اشتراک PRO</span>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default PricingSection;
