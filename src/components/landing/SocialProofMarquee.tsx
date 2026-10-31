'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
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

export function SocialProofMarquee() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // Repeated 3 times to ensure zero gap or jump in the loop
  const displayPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="relative py-12 border-y border-border/60 bg-muted/15 overflow-hidden select-none"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        {/* Title and Rating */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card/80 border border-border/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-foreground">مورد اعتماد صدها فرد و کسب‌وکار پیشرو</span>
          </div>

          <div className="hidden sm:inline-block text-border">•</div>

          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold text-foreground font-sans">4.9 / 5</span>
            <span className="text-[11px] text-muted-foreground font-sans">(بیش از 1,200 کاربر راضی)</span>
          </div>
        </div>
      </div>

      {/* Marquee Container with Edge Fade Masks & Drag/Swipe Support */}
      <div className="relative w-full overflow-hidden">
        {/* Left Edge Mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        
        {/* Right Edge Mask */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

        {/* Scrollable / Draggable Track */}
        <div className="overflow-x-auto custom-scrollbar cursor-grab active:cursor-grabbing pb-2">
          {/* Scrolling Rail: Pauses on Hover, Direction depends on RTL/LTR */}
          <div
            className={`flex w-max gap-4 sm:gap-6 py-2 hover:[animation-play-state:paused] ${
              isRtl ? 'animate-marquee' : 'animate-marquee-reverse'
            }`}
          >
            {displayPartners.map((partner, idx) => {
              const Icon = partner.icon;
              return (
                <div
                  key={`partner-${idx}`}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/60 dark:bg-zinc-900/50 border border-border/70 backdrop-blur-md shadow-xs transition-all duration-300 cursor-default shrink-0 group grayscale opacity-65 dark:opacity-45 hover:grayscale-0 hover:opacity-100 hover:border-cyan-500/40 hover:bg-card/95 hover:shadow-lg hover:shadow-cyan-500/10"
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
    </motion.section>
  );
}

export default SocialProofMarquee;
