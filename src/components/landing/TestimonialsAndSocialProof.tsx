'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  Quote,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLandingCms } from '@/context/LandingCmsContext';

export interface TestimonialItem {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  rating: number;
  reviewText: string;
  verifiedBadge: string;
  cardMaterialUsed: string;
  dateStr: string;
}

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;

function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 70,
    damping: 22,
    mass: 0.5,
    restDelta: 0.001,
  });

  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(target);
    } else {
      motionValue.set(0);
    }
  }, [isInView, motionValue, target]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setCurrent(latest);
    });
    return () => unsubscribe();
  }, [springValue]);

  const formatted =
    decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current).toLocaleString('en-US');

  return (
    <span ref={ref} className="font-sans">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function TestimonialsAndSocialProof() {
  const { testimonials } = useLandingCms();

  return (
    <section id="social-proof" className="py-20 sm:py-28 border-t border-border/80 relative overflow-hidden font-sans">
      {/* Ambient Lighting Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_SNAPPY }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-block">
            <Badge variant="cyan" className="text-xs flex items-center gap-1.5 mx-auto font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تجربه مشتریان واقعی</span>
            </Badge>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            نظرات رهبران تجاری و کاربران آریا لینک
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            ببینید چگونه مدیران، پزشکان، کارآفرینان و سازمان‌ها با کارت هوشمند آریا لینک کیفیت ارتباطات و نرخ تبدیل فروش خود را ارتقا داده‌اند.
          </p>
        </motion.div>

        {/* Dynamic Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE_SNAPPY, staggerChildren: 0.12 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="group p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden font-sans"
            >
              <Quote className="w-8 h-8 text-cyan-500/10 dark:text-cyan-400/10 absolute top-5 left-5 pointer-events-none" />

              <div className="space-y-4">
                {/* 5 Golden Stars & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star key={starIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 mr-1.5">
                      {t.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Material used tag */}
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-cyan-500" />
                    <span>{t.cardMaterialUsed}</span>
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
                  {t.reviewText}
                </p>
              </div>

              {/* User Profile Footer */}
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={t.avatarUrl}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-cyan-500/30"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900">
                      <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>

                  <div className="text-right truncate">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {t.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {t.title}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0 hidden sm:inline">
                  {t.verifiedBadge}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Dynamic Number Counter Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-600/10 border border-cyan-500/20 backdrop-blur-xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400" dir="ltr">
              <AnimatedCounter target={12400} suffix="+" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 block">
              کارت ویزیت هوشمند فعال
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400" dir="ltr">
              <AnimatedCounter target={34} />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 block">
              ولایت تحت پوشش ارسال پستی
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400" dir="ltr">
              <AnimatedCounter target={99.8} decimals={1} suffix="%" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 block">
              رضایت و تایید کیفیت مشتریان
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400" dir="ltr">
              <AnimatedCounter target={0.1} decimals={1} suffix="s" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 block">
              سرعت انتقال با چیپست NTAG216
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default TestimonialsAndSocialProof;
