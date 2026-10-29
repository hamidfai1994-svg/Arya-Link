'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Wifi,
  CheckCircle2,
  Phone,
  CreditCard,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  Instagram,
  Send,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;
const SPRING_FAST = { type: 'spring', stiffness: 250, damping: 25, mass: 0.5 } as const;

// 10-Point Choreography Timeline (15 Seconds Total)
// Switch 1: at x=240 peak right (0.140 -> 0.160) BEFORE card starts returning towards phone
// The card approaching the phone to slide behind is 100% BackCard (zIndex: 0)
// Switch 2: at x=240 peak right (0.420 -> 0.440) BEFORE card starts moving inward
// The card moving to portrait position in front of phone is 100% FrontCard (zIndex: 10)
// Freeze: 0.490 -> 0.930 (~7 seconds locked hold)
const CHOREOGRAPHY_TIMES = [
  0.0,    // 0: Start (large front, phone 0% scale 1.0)
  0.140,  // 1: Card reaches peak right & tilts (x: 240, rotate: 20) - FrontCard is 100% ON
  0.160,  // 2: Switches to BackCard while paused at peak right BEFORE returning!
  0.250,  // 3: BackCard approaches & settles behind phone (x: -30, rotate: 0)
  0.330,  // 4: Profile loaded behind phone
  0.420,  // 5: BackCard emerges out to peak right (x: 240, rotate: 35)
  0.440,  // 6: Switches to FrontCard while paused at peak right BEFORE returning!
  0.490,  // 7: FrontCard rotates to 90deg, phone zooms to 1.05; bottom edges lock!
  0.930,  // 8: THE 7-SECOND FREEZE (0.490 -> 0.930 = 6.6s ~ 7s locked hold)
  1.0,    // 9: Smooth reset back to start
] as const;

// Explicit array of easings for each keyframe transition segment (9 segments for 10 times).
// Passing an array ensures WAAPI timeline runs with linear overall progression (no global 15s warp),
// guaranteeing that times[] are triggered at their exact, mathematically designated seconds!
const CHOREOGRAPHY_EASINGS = [
  'easeInOut', // 0 -> 1: move right & tilt
  'linear',    // 1 -> 2: instant switch at peak right
  'easeInOut', // 2 -> 3: move behind phone
  'easeInOut', // 3 -> 4: pause behind phone
  'easeInOut', // 4 -> 5: emerge to peak right
  'linear',    // 5 -> 6: instant switch at peak right
  'easeInOut', // 6 -> 7: rotate to 90 & lock with bottom edge
  'linear',    // 7 -> 8: 7-second locked freeze
  'easeInOut', // 8 -> 9: smooth reset to start
] as const;

const TOTAL_CYCLE_DURATION = 15; // 15 seconds

/**
 * Reusable Luxury NFC Physical Card Chassis (No Chip - Sleek Modern Brand Logo)
 * Guarantees 100% pixel-perfect identical visual identity between FrontCard & BackCard
 */
function NfcCardChassis() {
  return (
    <div className="w-[280px] h-[176px] rounded-2xl p-5 bg-gradient-to-tr from-slate-950 via-zinc-900 to-neutral-800 border-2 border-amber-400/70 shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.3)] text-white flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle Brushed Metal Light Beam */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Top Bar with Minimalist Brand Monogram & NFC Waves (NO CHIP) */}
      <div className="flex items-center justify-between">
        {/* Minimalist Arya Link Brand Emblem */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400/25 via-amber-300/10 to-transparent border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] font-outfit font-black tracking-widest text-amber-300/90 uppercase">
            ARYA LINK
          </span>
        </div>

        {/* NFC Waves Icon */}
        <div className="flex items-center gap-1.5 text-amber-300">
          <Wifi className="w-6 h-6 rotate-90" />
          <span className="text-xs font-outfit font-black tracking-widest uppercase">NFC</span>
        </div>
      </div>

      {/* Card Center: Modern Clean Arya Link Monogram & Tag */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-outfit font-black tracking-tight text-white">
            ARYA <span className="text-amber-400">LINK</span>
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
            PRO
          </span>
        </div>
        <p className="text-[9px] text-slate-400 tracking-widest font-mono uppercase">
          Digital Identity Card
        </p>
      </div>

      {/* Bottom: Cardholder Name */}
      <div className="flex items-center justify-between text-xs text-slate-200 font-mono tracking-wider font-semibold">
        <span>FARHAD ARYA</span>
        <span className="text-amber-400 font-outfit font-black tracking-widest">SMART TAP</span>
      </div>
    </div>
  );
}

export function NfcShowcaseSection() {
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

  const benefitVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: custom * 0.1,
        ease: EASE_SNAPPY,
      },
    }),
  };

  // Trajectories: Card reaches peak right (x=240, rotate=20) and switches BEFORE returning
  // Then BackCard approaches the phone and settles behind at x=-30
  // Card emerges to peak right (x=240, rotate=35) and switches BEFORE moving inward
  const cardXTrajectory = [0, 240, 240, -30, -30, 240, 240, 170, 170, 0];
  const cardYTrajectory = [0, 20, 20, -10, -10, 35, 35, 110, 110, 0];
  const cardRotateTrajectory = [0, 20, 20, 0, 0, 35, 35, 90, 90, 0];
  const cardScaleTrajectory = [1.25, 0.85, 0.85, 0.85, 0.85, 0.90, 0.90, 1.05, 1.05, 1.25];

  return (
    <section className="py-20 sm:py-28 relative border-t border-border/80 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent overflow-hidden select-none">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

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
              <Zap className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500" />
              <span>فناوری ارتباط بدون تماس (NFC)</span>
            </div>
          </motion.div>

          <motion.h2
            variants={headerItemVariants}
            className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.2]"
          >
            فقط با یک تماس{' '}
            <span className="bg-gradient-to-l from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent font-outfit">
              (Tap)
            </span>
          </motion.h2>

          <motion.p
            variants={headerItemVariants}
            className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            کارت ویزیت لوکس خود را به پشت گوشی هر شخصی نزدیک کنید؛ در کسری از ثانیه و بدون نیاز به نصب هیچ برنامه‌ای، دنیای دیجیتال شما روی موبایل او می‌درخشد.
          </motion.p>
        </motion.div>

        {/* Showcase Grid: Left side realistic mockup, Right side benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ========================================================
              LEFT COLUMN: ORIGINAL PHASE 31 MOTION + INSTANT SWITCH IN CLEAR AIR
          ======================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[540px]">
            <div className="relative w-full max-w-[540px] h-[580px] flex items-center justify-center overflow-visible">

              {/* Floor Ambient Glow & Realistic Ground Shadow */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[360px] h-9 bg-black/70 rounded-full blur-2xl pointer-events-none -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[540px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/15 rounded-full blur-[110px] pointer-events-none -z-10" />

              {/* ========================================================
                  1. BACK CARD (ALWAYS Z-INDEX: 0 - BEHIND PHONE)
                  Takes over at x=240 (0.160) and approaches the phone as BackCard!
              ======================================================== */}
              <motion.div
                style={{ zIndex: 0 }}
                animate={{
                  opacity: [0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
                  x: cardXTrajectory,
                  y: cardYTrajectory,
                  rotate: cardRotateTrajectory,
                  scale: cardScaleTrajectory,
                }}
                transition={{
                  duration: TOTAL_CYCLE_DURATION,
                  repeat: Infinity,
                  times: CHOREOGRAPHY_TIMES,
                  ease: CHOREOGRAPHY_EASINGS,
                }}
                className="absolute select-none pointer-events-none"
              >
                <NfcCardChassis />
              </motion.div>

              {/* ========================================================
                  2. MOBILE PHONE (ALWAYS Z-INDEX: 5 - BETWEEN CARDS)
                  Timeline (Exact 10-step array with 7-second hold):
                  - x: ["0%", "-15%", "-15%", "-15%", "-15%", "-15%", "-15%", "0%", "0%", "0%"]
                  - scale: [1, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 1.05, 1.05, 1]
              ======================================================== */}
              <motion.div
                style={{ zIndex: 5 }}
                animate={{
                  x: ['0%', '-15%', '-15%', '-15%', '-15%', '-15%', '-15%', '0%', '0%', '0%'],
                  scale: [1, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 1.05, 1.05, 1],
                }}
                transition={{
                  duration: TOTAL_CYCLE_DURATION,
                  repeat: Infinity,
                  times: CHOREOGRAPHY_TIMES,
                  ease: CHOREOGRAPHY_EASINGS,
                }}
                className="relative w-[250px] h-[490px] select-none flex flex-col items-center justify-center"
              >
                {/* Outer Titanium Bezel & Frame Shadow */}
                <div className="relative w-full h-full p-[7px] bg-[#1a1c22] rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.12),0_0_35px_rgba(6,182,212,0.15)] flex flex-col">

                  {/* Inner OLED Screen Container (STRICT overflow-hidden, ZERO SCROLLBAR) */}
                  <div className="relative w-full h-full bg-[#0a0c10] rounded-[38px] overflow-hidden border border-white/5 flex flex-col justify-between">

                    {/* Top Hardware Dynamic Island (Exact Hero Replica - NO GREEN DOT) */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-inner border border-white/10">
                      {/* Front Camera Lens with Blue Anti-reflective Glare */}
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center relative overflow-hidden">
                        <div className="w-1 h-1 rounded-full bg-cyan-400" />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400/40 rounded-full blur-[1px]" />
                      </div>
                      {/* FaceID Sensor (Clean - No green dot) */}
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    </div>

                    {/* Subtle Screen Glare Sheen Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-30" />

                    {/* ========================================================
                        SCREEN LAYER A: STANDBY / IDLE RADAR SCREEN
                    ======================================================== */}
                    <motion.div
                      animate={{
                        opacity: [1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
                      }}
                      transition={{
                        duration: TOTAL_CYCLE_DURATION,
                        repeat: Infinity,
                        times: CHOREOGRAPHY_TIMES,
                        ease: CHOREOGRAPHY_EASINGS,
                      }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10"
                    >
                      {/* Top Status Bar (Time 09:41) */}
                      <div className="absolute top-3 inset-x-6 flex justify-between items-center text-[10px] text-white/50 font-mono">
                        <span>09:41</span>
                        <div className="flex items-center gap-1">
                          <Wifi className="w-2.5 h-2.5" />
                          <div className="w-3.5 h-2 border border-white/50 rounded-xs flex items-center p-0.5">
                            <div className="w-full h-full bg-white/70 rounded-xs" />
                          </div>
                        </div>
                      </div>

                      {/* Radar Contactless Waves Ring Effect */}
                      <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                        <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
                        <div className="absolute inset-2 rounded-full border border-sky-400/30 animate-pulse" />
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                          <Wifi className="w-7 h-7 rotate-90 text-cyan-400" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white tracking-wide">
                          آماده اتصال هوشمند
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          کارت NFC را نزدیک کنید...
                        </p>
                      </div>

                      {/* Small Bottom Status Badge */}
                      <div className="absolute bottom-6 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-300 font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span>NFC READY • STANDBY</span>
                      </div>
                    </motion.div>

                    {/* ========================================================
                        SCREEN LAYER B: SLIDE-DOWN NFC NOTIFICATION
                        Triggers when BackCard reaches behind the phone (at 0.25)
                    ======================================================== */}
                    <motion.div
                      animate={{
                        y: [-50, -50, -50, 0, 0, -50, -50, -50, -50, -50],
                        opacity: [0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
                      }}
                      transition={{
                        duration: TOTAL_CYCLE_DURATION,
                        repeat: Infinity,
                        times: CHOREOGRAPHY_TIMES,
                        ease: CHOREOGRAPHY_EASINGS,
                      }}
                      className="absolute top-8 left-2.5 right-2.5 z-40 pointer-events-none"
                    >
                      <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-400/50 rounded-2xl p-2 shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2 text-right">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white truncate">
                              آریا لینک (NFC Tap)
                            </span>
                            <span className="text-[8px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded-full border border-cyan-500/30">
                              اتصال برقرار شد
                            </span>
                          </div>
                          <p className="text-[8px] text-slate-300 truncate">
                            دریافت پروفایل هوشمند فرهاد آریا
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* ========================================================
                        SCREEN LAYER C: PIXEL-PERFECT HERO PROFILE REPLICA
                        Exact 1:1 match with Hero Section Phone Mockup
                        pt-11 brings avatar comfortably below Dynamic Island
                        Tight spacing, zero scrollbar, overflow-hidden
                    ======================================================== */}
                    <motion.div
                      animate={{
                        opacity: [0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
                      }}
                      transition={{
                        duration: TOTAL_CYCLE_DURATION,
                        repeat: Infinity,
                        times: CHOREOGRAPHY_TIMES,
                        ease: CHOREOGRAPHY_EASINGS,
                      }}
                      className="absolute inset-0 flex flex-col z-20 px-3.5 pt-11 pb-2.5 text-white overflow-hidden justify-between"
                    >
                      {/* Top Profile Header (Comfortably Below Camera Notch) */}
                      <div className="text-center relative">
                        {/* Avatar with Glow Ring (Hero 1:1) */}
                        <div className="relative w-16 h-16 mx-auto mb-1.5">
                          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/35">
                            <img
                              src="https://i.postimg.cc/JzMj1drh/25555.jpg"
                              alt="فرهاد آریا"
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          {/* Verified Check on Avatar (Hero 1:1) */}
                          <div className="absolute bottom-0 left-0 w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center border-2 border-slate-950 shadow-md">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-white text-cyan-600" />
                          </div>
                        </div>

                        {/* Name & Headline (Hero 1:1) */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <h4 className="font-extrabold text-xs text-white tracking-tight">
                              فرهاد آریا
                            </h4>
                            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[8px] font-bold">
                              PRO
                            </span>
                          </div>
                          <p className="text-[10px] text-cyan-300 font-medium">
                            مشاور ارشد کسب‌وکار و بنیان‌گذار استارتاپ
                          </p>
                        </div>

                        {/* Bio text (Hero 1:1) */}
                        <p className="text-[9px] text-slate-300/90 leading-relaxed mt-1 px-1 line-clamp-1">
                          یک لینک برای اتصال تمام پروژه‌ها، مشاوره آنلاین و خدمات تخصصی من
                        </p>
                      </div>

                      {/* vCard Save Contact Button (Hero 1:1) */}
                      <button
                        type="button"
                        className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-[10px] shadow-md shadow-cyan-500/25 flex items-center justify-center gap-1.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>ذخیره مستقیم مخاطب (vCard)</span>
                      </button>

                      {/* Module 1: Direct WhatsApp Chat (Hero 1:1) */}
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <MessageCircle className="w-3 h-3" />
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[10px] text-white block">
                              گفتگوی مستقیم واتساپ
                            </span>
                            <span className="text-[8px] text-emerald-400 block">
                              پاسخگویی سریع کمتر از 15 دقیقه
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-slate-400 rotate-45" />
                      </div>

                      {/* Module 2: Online Consultation Booking (HesabPay - Hero 1:1) */}
                      <div className="p-2 rounded-xl bg-blue-950/40 border border-cyan-500/30 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <ShoppingBag className="w-3 h-3" />
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[10px] text-white block">
                              رزرو نوبت مشاوره اختصاصی
                            </span>
                            <span className="text-[8px] text-cyan-300 block font-outfit">
                              500 AFN • پرداخت با حساب‌پی
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-white font-bold text-[8px]">
                          رزرو
                        </span>
                      </div>

                      {/* Module 3: Social Links Bar (Hero 1:1) */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-0.5">
                          <Instagram className="w-3.5 h-3.5 text-pink-400" />
                          <span className="text-[8px] text-slate-300">اینستاگرام</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-0.5">
                          <Send className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[8px] text-slate-300">تلگرام</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[8px] text-slate-300">کاتالوگ</span>
                        </div>
                      </div>

                      {/* Footer inside Screen (Hero 1:1) */}
                      <div className="pt-0.5 text-center">
                        <span className="text-[8px] text-slate-500 font-outfit">
                          Powered by <span className="font-bold text-cyan-400">Arya Link</span>
                        </span>
                      </div>
                    </motion.div>

                    {/* Bottom Home Indicator Bar */}
                    <div className="pt-0.5 pb-1 flex justify-center shrink-0 z-40">
                      <div className="w-14 h-1 rounded-full bg-white/30" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ========================================================
                  3. FRONT CARD (ALWAYS Z-INDEX: 10 - IN FRONT OF PHONE)
                  Solid opacity: 1 until reaching x=240, instant cut OFF at 0.160
                  Instant cut ON at 0.440 as soon as BackCard reaches x=240
                  Bottom-edge alignment: y: 110 at scale: 1.05 locks flush with phone bottom (257px)
                  7-Second Freeze: 0.490 -> 0.930 (~7s continuous hold)
              ======================================================== */}
              <motion.div
                style={{ zIndex: 10 }}
                animate={{
                  opacity: [1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
                  x: cardXTrajectory,
                  y: cardYTrajectory,
                  rotate: cardRotateTrajectory,
                  scale: cardScaleTrajectory,
                }}
                transition={{
                  duration: TOTAL_CYCLE_DURATION,
                  repeat: Infinity,
                  times: CHOREOGRAPHY_TIMES,
                  ease: CHOREOGRAPHY_EASINGS,
                }}
                className="absolute select-none pointer-events-none"
              >
                <NfcCardChassis />
              </motion.div>

            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: BENEFITS & WHY NFC (WITH STAGGER)
          ======================================================== */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-right">
            <motion.div
              initial={{ opacity: 0, x: 35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, ease: EASE_SNAPPY }}
              className="space-y-3"
            >
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                نسل بعدی ارتباطات تجاری در جیب شما
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                سالانه میلیاردها کارت ویزیت کاغذی چاپ شده و بیش از 88% آن‌ها در کمتر از یک هفته دور انداخته می‌شوند. با کارت هوشمند NFC آریا لینک، یک‌بار هزینه کنید و برای همیشه یک هویت مدرن و ماندگار داشته باشید.
              </p>
            </motion.div>

            {/* Benefit Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
              {[
                {
                  icon: Zap,
                  color: 'text-cyan-500 bg-cyan-500/15 border-cyan-500/30',
                  title: 'سازگار با آیفون و اندروید',
                  desc: 'پشتیبانی از 100% آیفون‌ها و گوشی‌های اندرویدی مجهز به NFC بدون نیاز به تنظیم یا اپ خاص.',
                },
                {
                  icon: Phone,
                  color: 'text-blue-500 bg-blue-500/15 border-blue-500/30',
                  title: 'ذخیره خودکار در مخاطبین',
                  desc: 'با فشردن دکمه vCard، شماره تماس، ایمیل و شبکه‌های شما مستقیماً در دفترچه تلفن مخاطب ثبت می‌شود.',
                },
                {
                  icon: CreditCard,
                  color: 'text-amber-500 bg-amber-500/15 border-amber-500/30',
                  title: 'متریال فلزی و چوبی لوکس',
                  desc: 'ارائه در جنس‌های فلز مشکی مات، طلایی، استیل ضدزنگ و PVC ضدآب با بالاترین کیفیت تراشه.',
                },
                {
                  icon: Sparkles,
                  color: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30',
                  title: 'ویرایش نامحدود و رایگان',
                  desc: 'تغییر شغل یا شماره تماس دادید؟ در پنل ویرایش کنید؛ کارت فیزیکی بدون نیاز به چاپ مجدد آپدیت می‌شود!',
                },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={idx}
                    custom={idx}
                    variants={benefitVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.2 }}
                    className="p-4 rounded-2xl bg-card/60 dark:bg-zinc-900/40 border border-border/80 backdrop-blur-md space-y-2 hover:border-cyan-500/40 transition-colors duration-200"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{card.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {card.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Action with Tactile Scale */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE_SNAPPY }}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
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
                    className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    <span>سفارش کارت هوشمند NFC</span>
                    <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <span className="text-xs text-muted-foreground">تحویل فوری در کابل و سراسر کشور</span>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default NfcShowcaseSection;
