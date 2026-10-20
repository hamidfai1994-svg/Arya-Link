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

// 9-Point Choreography Timeline for Step 30
const CHOREOGRAPHY_TIMES = [0, 0.18, 0.20, 0.34, 0.52, 0.58, 0.68, 0.85, 1.0] as const;
const TOTAL_CYCLE_DURATION = 9; // seconds

/**
 * Reusable Luxury NFC Physical Card Chassis
 * Guarantees 100% pixel-perfect identical visual identity between FrontCard & BackCard
 */
function NfcCardChassis() {
  return (
    <div className="w-[280px] h-[176px] rounded-2xl p-5 bg-gradient-to-tr from-slate-950 via-zinc-900 to-neutral-800 border-2 border-amber-400/70 shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.3)] text-white flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle Brushed Metal Light Beam */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Top Bar with Metallic Gold Chip & NFC Waves */}
      <div className="flex items-center justify-between">
        {/* Metallic Golden Microchip with Circuit Lines */}
        <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border border-amber-200 shadow-md flex items-center justify-center relative overflow-hidden">
          <div className="w-full h-[1.5px] bg-amber-600/50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 border border-amber-600/40 rounded-xs" />
        </div>
        {/* NFC Waves Icon */}
        <div className="flex items-center gap-1.5 text-amber-300">
          <Wifi className="w-6 h-6 rotate-90" />
          <span className="text-xs font-outfit font-black tracking-widest uppercase">NFC</span>
        </div>
      </div>

      {/* Card Center: Arya Link Monogram */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-outfit font-black tracking-tight text-white">
          ARYA <span className="text-amber-400">LINK</span>
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
          PRO
        </span>
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
              LEFT COLUMN: THE MASTER ILLUSION & PERFECT CHOREOGRAPHY (PHASE 30)
              Two-Card Illusion (FrontCard z:10 & BackCard z:0)
              Phone Forced Pause & Exact Bottom-Edge Vertical Locking
          ======================================================== */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[520px]">
            <div className="relative w-full max-w-[520px] h-[560px] flex items-center justify-center overflow-visible">
              
              {/* Floor Ambient Glow & Realistic Ground Shadow */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[360px] h-9 bg-black/70 rounded-full blur-2xl pointer-events-none -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[520px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/15 rounded-full blur-[110px] pointer-events-none -z-10" />

              {/* ========================================================
                  1. BACK CARD (ALWAYS Z-INDEX: 0 - BEHIND PHONE)
                  Active during the rear slide, NFC notification & profile loading
              ======================================================== */}
              <motion.div
                style={{ zIndex: 0 }}
                animate={{
                  opacity: [0, 0, 1, 1, 1, 0, 0, 0, 0],
                  x: [0, 180, 180, 20, 20, 180, 170, 170, 0],
                  y: [0, 20, 20, -10, -10, 50, 105, 105, 0],
                  rotate: [0, 24, 24, 0, 0, 45, 90, 90, 0],
                  scale: [1.25, 0.8, 0.8, 0.8, 0.8, 0.9, 1.0, 1.0, 1.25],
                }}
                transition={{
                  duration: TOTAL_CYCLE_DURATION,
                  repeat: Infinity,
                  times: CHOREOGRAPHY_TIMES,
                  ease: 'easeInOut',
                }}
                className="absolute select-none pointer-events-none"
              >
                <NfcCardChassis />
              </motion.div>

              {/* ========================================================
                  2. MOBILE PHONE (ALWAYS Z-INDEX: 5 - BETWEEN CARDS)
                  Timeline:
                  - Zooms out to 0.85 & shifts to left (x: "-6%")
                  - THE FORCED PAUSE: Stays locked at scale: 0.85, x: "-6%" during profile load
                  - Zooms in to 1.0 & centers as card emerges
              ======================================================== */}
              <motion.div
                style={{ zIndex: 5 }}
                animate={{
                  scale: [1.0, 0.85, 0.85, 0.85, 0.85, 0.92, 1.0, 1.0, 1.0],
                  x: ['0%', '-6%', '-6%', '-6%', '-6%', '-2%', '0%', '0%', '0%'],
                }}
                transition={{
                  duration: TOTAL_CYCLE_DURATION,
                  repeat: Infinity,
                  times: CHOREOGRAPHY_TIMES,
                  ease: 'easeInOut',
                }}
                className="relative w-[250px] h-[490px] select-none flex flex-col items-center justify-center"
              >
                {/* Outer Titanium Bezel & Frame Shadow */}
                <div className="relative w-full h-full p-[7px] bg-[#1a1c22] rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.12),0_0_35px_rgba(6,182,212,0.15)] flex flex-col">
                  
                  {/* Inner OLED Screen Container */}
                  <div className="relative w-full h-full bg-[#0a0c10] rounded-[38px] overflow-hidden border border-white/5 flex flex-col justify-between">
                    
                    {/* Top Hardware Dynamic Island */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                    </div>

                    {/* Subtle Screen Glare Sheen Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-30" />

                    {/* ========================================================
                        SCREEN LAYER A: STANDBY / IDLE SCREEN
                        Active before NFC tap and during reset
                    ======================================================== */}
                    <motion.div
                      animate={{
                        opacity: [1, 1, 1, 0, 0, 0, 0, 0, 1],
                      }}
                      transition={{
                        duration: TOTAL_CYCLE_DURATION,
                        repeat: Infinity,
                        times: [0, 0.18, 0.24, 0.30, 0.52, 0.58, 0.68, 0.85, 1.0],
                        ease: 'easeInOut',
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
                        SCREEN LAYER B: SLIDE-DOWN NFC WEB-CLIP NOTIFICATION
                        Triggers during the Phone Pause
                    ======================================================== */}
                    <motion.div
                      animate={{
                        y: [-50, -50, -50, 0, 0, -50, -50, -50, -50],
                        opacity: [0, 0, 0, 1, 1, 0, 0, 0, 0],
                      }}
                      transition={{
                        duration: TOTAL_CYCLE_DURATION,
                        repeat: Infinity,
                        times: [0, 0.18, 0.24, 0.32, 0.44, 0.50, 0.68, 0.85, 1.0],
                        ease: 'easeInOut',
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
                        SCREEN LAYER C: FARHAD ARYA LIVE RICH PROFILE
                        Curved Organic Cover & Avatar seated on curve apex
                        Loads cleanly during Phone Pause & stays active for showcase
                    ======================================================== */}
                    <motion.div
                      animate={{
                        opacity: [0, 0, 0, 0, 1, 1, 1, 1, 0],
                      }}
                      transition={{
                        duration: TOTAL_CYCLE_DURATION,
                        repeat: Infinity,
                        times: [0, 0.18, 0.28, 0.36, 0.46, 0.58, 0.68, 0.85, 1.0],
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 flex flex-col z-20 overflow-y-auto no-scrollbar"
                    >
                      {/* Curved Organic Header Banner Cover Photo (Spec Requirement) */}
                      <div className="relative w-[120%] -ml-[10%] h-32 bg-gradient-to-br from-cyan-600 via-sky-500 to-blue-600 rounded-b-[50%] overflow-hidden shrink-0 shadow-inner">
                        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:10px_10px]" />
                        <div className="absolute top-2 right-6 text-[9px] font-mono font-bold text-white/80 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full">
                          aryalink.me/farhad
                        </div>
                      </div>

                      {/* Avatar Centered Directly on the Curve Boundary (Half on cover, half on background) */}
                      <div className="absolute top-[94px] left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
                        <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-sky-300 to-blue-500 shadow-xl">
                          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-base text-cyan-300 overflow-hidden">
                            FA
                          </div>
                          {/* Verified KYC Blue Checkmark */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-blue-500 rounded-full flex items-center justify-center text-white border-2 border-slate-900 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* User Identity Details & Bio (Spaced appropriately below avatar) */}
                      <div className="text-center mt-9 px-3 space-y-0.5">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs font-black text-white">
                            فرهاد آریا
                          </span>
                          <span className="text-[8px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                            PRO
                          </span>
                        </div>
                        <p className="text-[10px] text-cyan-300 font-medium">
                          بنیان‌گذار و طراح محصول
                        </p>
                        <p className="text-[9px] text-slate-400 max-w-[200px] mx-auto leading-tight line-clamp-1">
                          خلق تجربه‌های دیجیتال مدرن و اتصال هوشمند
                        </p>
                      </div>

                      {/* Action & Contact Section Inside Phone */}
                      <div className="p-2.5 space-y-2 mt-1">
                        {/* Primary Save Contact (vCard) CTA */}
                        <button className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white text-[10px] font-bold shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5">
                          <Phone className="w-3 h-3" />
                          <span>ذخیره در مخاطبین (vCard)</span>
                        </button>

                        {/* Interactive Booking Module (HesabPay) */}
                        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-right">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <CreditCard className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-white">
                                رزرو وقت مشاوره
                              </p>
                              <p className="text-[8px] text-slate-400">
                                پرداخت سریع با حساب‌پی
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-400">
                            ۵۰۰,۰۰۰ ت
                          </span>
                        </div>

                        {/* Social & Contact Mini Links */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-1.5 text-right">
                            <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <MessageCircle className="w-3 h-3" />
                            </div>
                            <span className="text-[8px] font-semibold text-slate-200 truncate">واتساپ</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-1.5 text-right">
                            <div className="w-5 h-5 rounded-md bg-pink-500/20 text-pink-400 flex items-center justify-center">
                              <Instagram className="w-3 h-3" />
                            </div>
                            <span className="text-[8px] font-semibold text-slate-200 truncate">اینستاگرام</span>
                          </div>
                        </div>

                        {/* Social Row Icons */}
                        <div className="flex items-center justify-center gap-2 pt-0.5 text-slate-400">
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center hover:text-white">
                            <Send className="w-2.5 h-2.5" />
                          </div>
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center hover:text-white">
                            <ShoppingBag className="w-2.5 h-2.5" />
                          </div>
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center hover:text-white">
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
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
                  Active at start, then takes over seamlessly in mid-air rotation
                  Locks into vertical portrait (rotate: 90) beside the phone
                  Crucial alignment: y: 105 aligns card bottom flush with phone bottom (245px)
              ======================================================== */}
              <motion.div
                style={{ zIndex: 10 }}
                animate={{
                  opacity: [1, 1, 0, 0, 0, 1, 1, 1, 1],
                  x: [0, 180, 180, 20, 20, 180, 170, 170, 0],
                  y: [0, 20, 20, -10, -10, 50, 105, 105, 0],
                  rotate: [0, 24, 24, 0, 0, 45, 90, 90, 0],
                  scale: [1.25, 0.8, 0.8, 0.8, 0.8, 0.9, 1.0, 1.0, 1.25],
                }}
                transition={{
                  duration: TOTAL_CYCLE_DURATION,
                  repeat: Infinity,
                  times: CHOREOGRAPHY_TIMES,
                  ease: 'easeInOut',
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
                سالانه میلیاردها کارت ویزیت کاغذی چاپ شده و بیش از ۸۸٪ آن‌ها در کمتر از یک هفته دور انداخته می‌شوند. با کارت هوشمند NFC آریا لینک، یک‌بار هزینه کنید و برای همیشه یک هویت مدرن و ماندگار داشته باشید.
              </p>
            </motion.div>

            {/* Benefit Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
              {[
                {
                  icon: Zap,
                  color: 'text-cyan-500 bg-cyan-500/15 border-cyan-500/30',
                  title: 'سازگار با آیفون و اندروید',
                  desc: 'پشتیبانی از ۱۰۰٪ آیفون‌ها و گوشی‌های اندرویدی مجهز به NFC بدون نیاز به تنظیم یا اپ خاص.',
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
