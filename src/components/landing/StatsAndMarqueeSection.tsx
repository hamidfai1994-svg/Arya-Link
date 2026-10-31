'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Sparkles,
  Building2,
  Cpu,
  Coins,
  Compass,
  Coffee,
  Laptop,
  Palette,
  HeartPulse,
  Layers,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;
const SPRING_FAST = { type: 'spring', stiffness: 250, damping: 25, mass: 0.5 } as const;

// Soft Counter component
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
    <span ref={ref} className="font-sans font-black tracking-tight text-foreground">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// 5 Expanded, Compact & Centered Stats Cards (Stage 28.2)
const STATS_ITEMS = [
  {
    title: 'کاربران فعال',
    value: 1200,
    prefix: '+',
    sub: 'کسب‌وکارها و فریلنسرها',
  },
  {
    title: 'لینک‌های ساخته شده',
    value: 5400,
    prefix: '+',
    sub: 'صفحات و پروفایل‌های آنلاین',
  },
  {
    title: 'کلیک‌های موفق',
    value: 185,
    prefix: '+',
    suffix: 'K',
    sub: 'ورودی از شبکه‌های اجتماعی',
  },
  {
    title: 'تپ‌های NFC',
    value: 42,
    prefix: '+',
    suffix: 'K',
    sub: 'ارتباط آنی بدون تماس',
  },
  {
    title: 'آواتارها و مینی‌سایت‌ها',
    value: 3100,
    prefix: '+',
    sub: 'طراحی‌های شخصی‌سازی‌شده',
  },
];

const PARTNERS = [
  {
    name: 'شرکت فناوری افغان‌تک',
    sub: 'توسعه نرم‌افزار و هوش مصنوعی',
    icon: Cpu,
    color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
  },
  {
    name: 'بازرگانی بین‌المللی آریان',
    sub: 'صادرات و واردات کالا',
    icon: Building2,
    color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  },
  {
    name: 'برند زعفران هرات',
    sub: 'تولید و بسته‌بندی صادراتی',
    icon: Sparkles,
    color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  },
  {
    name: 'هولدینگ صرافی امید',
    sub: 'خدمات مالی و حوالجات ارزی',
    icon: Coins,
    color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  },
  {
    name: 'استودیو معماری نوین',
    sub: 'طراحی سازه و دکوراسیون لوکس',
    icon: Compass,
    color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
  },
  {
    name: 'کافه رستوران‌های ارگ',
    sub: 'پذیرایی و تشریفات وی‌آی‌پی',
    icon: Coffee,
    color: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
  },
  {
    name: 'فروشگاه دیجیتال نوید',
    sub: 'تجهیزات هوشمند و الکترونیک',
    icon: Laptop,
    color: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
  },
  {
    name: 'آکادمی دیزاین و هنر',
    sub: 'آموزش‌های تخصصی UI/UX',
    icon: Palette,
    color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
  },
  {
    name: 'کلینیک تخصصی مهر',
    sub: 'خدمات سلامت و پوست',
    icon: HeartPulse,
    color: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
  },
  {
    name: 'شرکت مهندسی الماس',
    sub: 'پروژه‌های عمرانی مدرن',
    icon: Layers,
    color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
  },
];

export function StatsAndMarqueeSection() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // Exact 2x duplication for 100% seamless mathematical loop without gaps
  const doubledPartners = [...PARTNERS, ...PARTNERS];

  // Staggered container for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.04,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: EASE_SNAPPY,
      },
    },
  };

  return (
    <section className="relative py-12 sm:py-16 border-y border-border/60 bg-muted/15 overflow-hidden select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-28 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ========================================================
            1. 5 COMPACT CENTERED STATS CARDS (EXPANDED TO 5 COLS)
        ======================================================== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {STATS_ITEMS.map((item, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={SPRING_FAST}
              className="rounded-2xl p-3.5 sm:p-4 bg-card/60 dark:bg-white/[0.035] backdrop-blur-xl border border-border/80 dark:border-white/10 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-colors text-center flex flex-col justify-center space-y-1"
            >
              <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground block truncate">
                {item.title}
              </span>
              <div className="text-2xl sm:text-3xl font-black py-0.5">
                <AnimatedCounter
                  target={item.value}
                  prefix={item.prefix}
                  suffix={item.suffix}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/80 leading-tight block truncate font-sans">
                {item.sub}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ========================================================
            2. TRUST BADGE & RATING HEADER
        ======================================================== */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.05 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-muted-foreground">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SNAPPY } },
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/80 border border-border/80 shadow-xs"
            >
              <span className="font-bold text-foreground">مورد اعتماد صدها فرد و کسب‌وکار پیشرو</span>
            </motion.div>

            <div className="hidden sm:inline-block text-border">•</div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SNAPPY } },
              }}
              className="flex items-center gap-1.5 text-xs"
            >
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-foreground font-sans">4.9 / 5</span>
              <span className="text-[11px] text-muted-foreground font-sans">(بیش از 1,200 کاربر راضی)</span>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* ========================================================
          3. SEAMLESS INFINITE MARQUEE (NO SCROLLBAR, ZERO GAP)
      ======================================================== */}
      <div className="relative w-full overflow-hidden mt-8">
        {/* Left Edge Mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        
        {/* Right Edge Mask */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

        {/* Container with overflow-hidden and hidden scrollbars */}
        <div dir="ltr" className="w-full overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div
            className="flex w-max gap-4 sm:gap-6 py-2 animate-marquee hover:[animation-play-state:paused]"
          >
            {doubledPartners.map((partner, idx) => {
              const Icon = partner.icon;
              return (
                <div
                  key={`partner-${idx}`}
                  dir={dir}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/60 dark:bg-zinc-900/50 border border-border/70 backdrop-blur-md shadow-xs transition-all duration-300 cursor-default shrink-0 group grayscale opacity-60 dark:opacity-40 hover:grayscale-0 hover:opacity-100 hover:border-cyan-500/40 hover:bg-card/95 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${partner.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                        {partner.name}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
                    </div>
                    <span className="text-[10px] text-muted-foreground block">{partner.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsAndMarqueeSection;
