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
import { useLandingCms } from '@/context/LandingCmsContext';

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
  const { plans } = useLandingCms();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const freePlan = plans.find((p) => p.planId === 'free') || plans[0];
  const proPlan = plans.find((p) => p.planId === 'pro') || plans[1] || plans[0];

  return (
    <section id="pricing" className="py-20 sm:py-28 relative border-t border-border/80 bg-muted/15 overflow-hidden select-none font-sans">
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
            <Badge variant="cyan" className="text-xs font-semibold">
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
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/25 text-emerald-300 text-[10px] font-bold">
                  35% OFF
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ========================================================
              CARD 1: FREE TIER (Col 5) - DYNAMIC CMS DRIVEN
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
                    <h3 className="text-xl font-bold text-foreground">{freePlan.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{freePlan.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {freePlan.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <div className="flex items-baseline gap-1.5" dir="ltr">
                      <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                        {freePlan.priceMonthly.toLocaleString('en-US')}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-muted-foreground">
                        {freePlan.currency}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-bold">/ برای همیشه</span>
                  </div>
                  <span className="text-xs text-emerald-500 font-semibold block">
                    کاملاً رایگان بدون تاریخ انقضا
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
                  {freePlan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-foreground">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
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
                      {freePlan.ctaText}
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* ========================================================
              CARD 2: SHIMMER PRO TIER (Col 7 - HIGHLIGHTED & DYNAMIC)
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
                    <span>{proPlan.badge}</span>
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 pr-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-foreground">
                        {proPlan.name}
                      </h3>
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                      {proPlan.description}
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
                        <div className="flex items-baseline gap-1.5" dir="ltr">
                          <span className="text-4xl sm:text-5xl font-black text-cyan-500 dark:text-cyan-400 tracking-tight">
                            {billingCycle === 'yearly'
                              ? proPlan.priceYearlyMonthly.toLocaleString('en-US')
                              : proPlan.priceMonthly.toLocaleString('en-US')}
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-300">
                            {proPlan.currency}
                          </span>
                        </div>
                        <span className="text-xs text-foreground font-bold">
                          / ماهانه
                        </span>
                      </div>
                      {billingCycle === 'yearly' ? (
                        <div className="text-xs text-emerald-500 font-bold flex items-center gap-1.5 flex-wrap">
                          <span>پرداخت سالانه</span>
                          <span dir="ltr" className="font-black">
                            {(proPlan.priceYearlyMonthly * 12).toLocaleString('en-US')} {proPlan.currency}
                          </span>
                          <span>(صرفه‌جویی سالانه</span>
                          <span dir="ltr" className="font-black">
                            {((proPlan.priceMonthly - proPlan.priceYearlyMonthly) * 12).toLocaleString('en-US')} {proPlan.currency}
                          </span>
                          <span>)</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground block">
                          پرداخت ماهانه بدون قرارداد سالانه
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Pro Feature Checklist (Dual Column) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/60 text-xs">
                    {proPlan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2.5 text-foreground font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
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
                        <span>{proPlan.ctaText}</span>
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
