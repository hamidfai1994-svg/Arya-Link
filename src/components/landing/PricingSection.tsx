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
import { getLocalizedText } from '@/lib/i18n/multilingual';
import { useSiteContent } from '@/context/SiteContentContext';
import { DEFAULT_PRICING_CONTENT, ISiteContentPricingPlan } from '@/models/SiteContent.model';

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
  const { dir, language, t } = useLanguage();
  const { pricing } = useSiteContent();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const pricingData = pricing || DEFAULT_PRICING_CONTENT;
  const activePlans: ISiteContentPricingPlan[] = (
    pricingData.plans && pricingData.plans.length > 0
      ? pricingData.plans
      : DEFAULT_PRICING_CONTENT.plans
  ).filter((p) => p.isActive !== false);

  return (
    <section id="pricing" dir={dir} className="py-20 sm:py-28 relative border-t border-border/80 bg-muted/15 overflow-hidden select-none font-sans">
      {/* Background Soft Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
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
              {getLocalizedText(pricingData.badge, language, t('pricing.badge', 'شفاف و اقتصادی'))}
            </Badge>
          </motion.div>

          <motion.h2
            variants={headerItemVariants}
            className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.2]"
          >
            {getLocalizedText(pricingData.title, language, t('pricing.title', 'پلن‌های قیمت‌گذاری متناسب با نیاز شما'))}
          </motion.h2>

          <motion.p
            variants={headerItemVariants}
            className="text-xs sm:text-sm text-muted-foreground leading-relaxed"
          >
            {getLocalizedText(pricingData.subtitle, language)}
          </motion.p>

          {/* Billing Cycle Switcher Toggle */}
          <motion.div variants={headerItemVariants} className="pt-2 flex items-center justify-center">
            <div className="p-1 rounded-2xl bg-card border border-border shadow-xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-muted text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {getLocalizedText(pricingData.monthlyLabel, language, t('pricing.monthly_billing', 'پرداخت ماهانه'))}
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{getLocalizedText(pricingData.annualLabel, language, t('pricing.yearly_billing', 'پرداخت سالانه'))}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/25 text-emerald-200 text-[10px] font-bold">
                  {getLocalizedText(pricingData.annualSaveBadge, language, '20% OFF')}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div
          className={`grid gap-8 items-stretch ${
            activePlans.length === 2
              ? 'grid-cols-1 lg:grid-cols-12'
              : activePlans.length >= 3
                ? 'grid-cols-1 lg:grid-cols-3'
                : 'grid-cols-1 max-w-xl mx-auto'
          }`}
        >
          {activePlans.map((plan, idx) => {
            const monthlyPrice = Number(plan.monthlyPrice) || 0;
            const annualPrice = Number(plan.annualPrice) || 0;
            const displayPrice = billingCycle === 'yearly' ? annualPrice : monthlyPrice;
            const currency = getLocalizedText(plan.currency, language, 'AFN');
            const periodLabel =
              billingCycle === 'yearly'
                ? getLocalizedText(plan.periodAnnualLabel, language, t('pricing.monthly', '/ ماهانه'))
                : getLocalizedText(plan.periodMonthlyLabel, language, t('pricing.monthly', '/ ماهانه'));
            const twoColSpan =
              activePlans.length === 2
                ? plan.isPopular
                  ? 'lg:col-span-7'
                  : 'lg:col-span-5'
                : '';

            if (plan.isPopular) {
              return (
                <motion.div
                  key={plan.id || idx}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: EASE_SNAPPY }}
                  className={`${twoColSpan} flex flex-col relative`}
                >
                  <div className="p-[2px] rounded-[30px] bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_50px_rgba(6,182,212,0.25)] h-full relative overflow-hidden flex flex-col">
                    <motion.div
                      animate={{ x: ['-120%', '240%'] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                      className="pointer-events-none absolute -inset-y-10 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 dark:via-cyan-300/15 to-transparent z-20"
                    />

                    <div className="rounded-[28px] bg-card/95 dark:bg-slate-950/95 backdrop-blur-2xl p-7 sm:p-8 flex flex-col justify-between h-full relative z-10 overflow-hidden">
                      {getLocalizedText(plan.badge, language) && (
                        <div className="flex justify-end mb-2">
                          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[11px] py-1 px-3 border-0 flex items-center gap-1.5 shadow-md shadow-cyan-500/25">
                            <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
                            <span>{getLocalizedText(plan.badge, language)}</span>
                          </Badge>
                        </div>
                      )}

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl sm:text-2xl font-black text-foreground">
                              {getLocalizedText(plan.name, language)}
                            </h3>
                            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {getLocalizedText(plan.tagline, language)}
                          </p>
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${plan.id}-${billingCycle}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25, ease: EASE_SNAPPY }}
                            className="space-y-1.5"
                          >
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <div className="flex items-baseline gap-1.5" dir="ltr">
                                <span className="text-4xl sm:text-5xl font-black text-cyan-500 dark:text-cyan-400 tracking-tight">
                                  {displayPrice.toLocaleString('en-US')}
                                </span>
                                <span className="text-xl font-bold text-cyan-600 dark:text-cyan-300">
                                  {currency}
                                </span>
                              </div>
                              <span className="text-xs text-foreground font-bold">{periodLabel}</span>
                            </div>

                            {billingCycle === 'yearly' && monthlyPrice > annualPrice ? (
                              <div className="text-xs text-emerald-500 font-bold flex items-center gap-1.5 flex-wrap">
                                <span>{t('pricing.billed_yearly', 'پرداخت سالانه')}</span>
                                <span dir="ltr" className="font-black">
                                  {(annualPrice * 12).toLocaleString('en-US')} {currency}
                                </span>
                                <span>({t('pricing.save_yearly', 'صرفه‌جویی سالانه')}:</span>
                                <span dir="ltr" className="font-black">
                                  {((monthlyPrice - annualPrice) * 12).toLocaleString('en-US')} {currency})
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground block">
                                {t('pricing.no_lockin', 'پرداخت ماهانه بدون قرارداد سالانه')}
                              </span>
                            )}
                          </motion.div>
                        </AnimatePresence>

                        <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
                          {(plan.features || []).map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2.5 text-foreground font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                              <span>{getLocalizedText(feature, language)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-8">
                        <Link href={plan.ctaLink || '/register'}>
                          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING_FAST}>
                            <Button
                              size="lg"
                              className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                            >
                              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                              <Sparkles className="w-4 h-4 fill-white" />
                              <span>{getLocalizedText(plan.ctaText, language)}</span>
                              <ArrowLeft className="w-4 h-4 ltr:rotate-180 group-hover:-translate-x-1.5 ltr:group-hover:translate-x-1.5 transition-transform" />
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={plan.id || idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: EASE_SNAPPY }}
                className={`${twoColSpan} flex flex-col`}
              >
                <Card className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-7 sm:p-8 flex flex-col justify-between shadow-sm hover:border-cyan-500/40 transition-colors duration-200 h-full">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-foreground">
                          {getLocalizedText(plan.name, language)}
                        </h3>
                        {getLocalizedText(plan.badge, language) && (
                          <Badge variant="outline" className="text-[10px]">
                            {getLocalizedText(plan.badge, language)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {getLocalizedText(plan.tagline, language)}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <div className="flex items-baseline gap-1.5" dir="ltr">
                          <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                            {displayPrice.toLocaleString('en-US')}
                          </span>
                          <span className="text-xl font-bold text-muted-foreground">
                            {currency}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-bold">{periodLabel}</span>
                      </div>
                      <span className="text-xs text-emerald-500 font-semibold block">
                        {displayPrice === 0
                          ? t('pricing.free_forever_note', 'کاملاً رایگان بدون تاریخ انقضا')
                          : billingCycle === 'yearly'
                            ? `${t('pricing.billed_yearly', 'پرداخت سالانه')}: ${(annualPrice * 12).toLocaleString('en-US')} ${currency}`
                            : t('pricing.no_lockin', 'پرداخت ماهانه بدون قرارداد سالانه')}
                      </span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
                      {(plan.features || []).map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2.5 text-foreground">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{getLocalizedText(feature, language)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link href={plan.ctaLink || '/register'}>
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING_FAST}>
                        <Button
                          variant="outline"
                          className="w-full h-14 rounded-2xl border-border bg-card/80 hover:bg-muted font-bold text-sm shadow-xs"
                        >
                          {getLocalizedText(plan.ctaText, language)}
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
