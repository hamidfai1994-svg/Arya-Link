'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  Zap,
  Globe2,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroPhoneMockup } from './HeroPhoneMockup';
import { AuroraBackground } from './AuroraBackground';

export function HeroSection() {
  // Mouse position normalized (-0.5 to 0.5) for parallax tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for buttery smooth parallax response
  const smoothX = useSpring(mouseX, { stiffness: 90, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 90, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;
  const SPRING_FAST = { type: 'spring', stiffness: 250, damping: 25, mass: 0.5 } as const;

  // Staggered entrance variants for texts and buttons with Snappy Ease-Out
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.05,
      },
    },
  };

  const itemSlideRight = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: EASE_SNAPPY,
      },
    },
  };

  const itemSlideBottom = {
    hidden: { opacity: 0, y: 35 },
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
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 overflow-hidden select-none"
    >
      {/* 1. Aurora & Grid Animated Background */}
      <AuroraBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ========================================================
              RIGHT COLUMN: HERO TEXTS & ACTIONS (RTL)
              With Directional Slide & Repeat Viewport Trigger
          ======================================================== */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="lg:col-span-7 space-y-7 text-center lg:text-right"
          >
            {/* Top Badge: Link-in-Bio & Mini-website focus */}
            <motion.div variants={itemSlideRight} className="inline-block">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm font-semibold shadow-inner shadow-cyan-500/10 backdrop-blur-md">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <span>یک لینک برای همه چیز • مینی‌وب‌سایت و بیولینک هوشمند</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                  نسل جدید
                </span>
              </div>
            </motion.div>

            {/* Catchy Main Headline: "یک لینک برای اتصال همه چیز" */}
            <motion.h1
              variants={itemSlideRight}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.18] text-foreground"
            >
              یک لینک هوشمند برای{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent text-glow-cyan drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]">
                  اتصال همه‌چیز
                </span>
              </span>{' '}
              به دنیای شما
            </motion.h1>

            {/* Subtitle: High-converting Bio Link Strategy */}
            <motion.p
              variants={itemSlideRight}
              className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal"
            >
              در شبکه‌های اجتماعی فقط جا برای یک لینک دارید! با آریا لینک، تمام راه‌های ارتباطی، کاتالوگ محصولات، فروشگاه آنلاین و شبکه‌های خود را به یک مینی‌وب‌سایت لوکس تبدیل کنید — با امکان مکمل اتصال به کارت فیزیکی NFC.
            </motion.p>

            {/* CTA Buttons with Tactile Hover Scale & Light Sweep */}
            <motion.div
              variants={itemSlideBottom}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING_FAST}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-cyan-500/35 active:scale-95 transition-all flex items-center justify-center gap-2.5 relative overflow-hidden group"
                  >
                    {/* Animated Light Sweep Sheen */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>رایگان لینک خود را بسازید</span>
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
                  </Button>
                </motion.div>
              </Link>

              <a href="#features" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING_FAST}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-14 px-6 rounded-2xl border-border/80 bg-card/60 backdrop-blur-xl text-foreground hover:bg-muted font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:border-cyan-500/40"
                  >
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>مشاهده دمو و امکانات</span>
                  </Button>
                </motion.div>
              </a>
            </motion.div>

            {/* Trust Indicators Row */}
            <motion.div
              variants={itemSlideRight}
              className="pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>۱۰۰٪ رایگان بدون نیاز به برنامه‌نویسی</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>دامنه و لینک اختصاصی aryal.ink</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
                <span>پشتیبانی مکمل از کارت لمسی NFC</span>
              </div>
            </motion.div>

          </motion.div>

          {/* ========================================================
              LEFT COLUMN: 3D REALISTIC PHONE MOCKUP WITH PARALLAX
          ======================================================== */}
          <div className="lg:col-span-5 flex justify-center relative">
            <HeroPhoneMockup smoothX={smoothX} smoothY={smoothY} />
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
