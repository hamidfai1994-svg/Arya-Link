'use client';

import React, { useState, useEffect } from 'react';
import { motion, useTransform, useMotionValue, type MotionValue } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Link2,
  ShoppingBag,
  MessageCircle,
  Send,
  Instagram,
  Phone,
  Wifi,
  Battery,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;
const SPRING_FAST = { type: 'spring', stiffness: 250, damping: 25, mass: 0.5 } as const;

// Real-time device clock component using client local system time (HH:MM)
function DeviceClock() {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className="font-outfit font-bold tracking-tight text-white text-[11px]"
      suppressHydrationWarning
    >
      {time}
    </span>
  );
}

export interface HeroPhoneMockupProps {
  smoothX?: MotionValue<number>;
  smoothY?: MotionValue<number>;
}

export function HeroPhoneMockup({ smoothX, smoothY }: HeroPhoneMockupProps) {
  // Fallbacks if not provided
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const activeX = smoothX || fallbackX;
  const activeY = smoothY || fallbackY;

  // Parallax offsets (counter-movement to mouse for multi-layer 3D depth)
  const badge1X = useTransform(activeX, [-0.5, 0.5], [30, -30]);
  const badge1Y = useTransform(activeY, [-0.5, 0.5], [24, -24]);

  const badge2X = useTransform(activeX, [-0.5, 0.5], [-34, 34]);
  const badge2Y = useTransform(activeY, [-0.5, 0.5], [26, -26]);

  const badge3X = useTransform(activeX, [-0.5, 0.5], [-28, 28]);
  const badge3Y = useTransform(activeY, [-0.5, 0.5], [-22, 22]);

  const badge4X = useTransform(activeX, [-0.5, 0.5], [36, -36]);
  const badge4Y = useTransform(activeY, [-0.5, 0.5], [-28, 28]);

  // World-class 3D perspective tilt: phone turns directly toward mouse cursor
  const phoneRotateY = useTransform(activeX, [-0.5, 0.5], [-18, 18]);
  const phoneRotateX = useTransform(activeY, [-0.5, 0.5], [16, -16]);

  // Dynamic shadow displacement based on tilt
  const shadowX = useTransform(activeX, [-0.5, 0.5], [-25, 25]);
  const shadowY = useTransform(activeY, [-0.5, 0.5], [-20, 20]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE_SNAPPY }}
      className="relative w-full max-w-[340px] sm:max-w-[370px] mx-auto select-none py-6 [perspective:1400px]"
    >
      {/* Background Ambient Glow behind Phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[540px] bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-purple-600/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Dynamic 3D Floor Shadow under Phone */}
      <motion.div
        style={{ x: shadowX, y: shadowY }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[240px] h-8 bg-black/60 rounded-full blur-xl pointer-events-none -z-10"
      />

      {/* ========================================================
          FLOATING BADGES WITH ZERO-JUMP MATHEMATICAL FLOAT LOOPS
      ======================================================== */}

      {/* Floating Badge 1: Link-in-Bio & Mini-Website (Top-Right) */}
      <motion.div
        style={{ x: badge1X, y: badge1Y }}
        className="absolute -top-3 -right-2 sm:-right-8 z-30"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-card/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/40 shadow-xl shadow-cyan-500/15"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/30">
            <Link2 className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-foreground">یک لینک برای همه‌چیز</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] font-bold">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              مینی‌وب‌سایت اختصاصی + NFC
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Badge 2: Verified KYC Badge (Middle-Left) */}
      <motion.div
        style={{ x: badge2X, y: badge2Y }}
        className="absolute top-1/3 -left-3 sm:-left-10 z-30"
      >
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-card/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-blue-500/40 shadow-xl shadow-blue-500/15"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-foreground">تیک آبی رسمی</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
            </div>
            <span className="text-[10px] text-muted-foreground block">
              احراز هویت شده (KYC)
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Badge 3: Online Store & HesabPay (Bottom-Left) */}
      <motion.div
        style={{ x: badge3X, y: badge3Y }}
        className="absolute -bottom-4 -left-2 sm:-left-8 z-30"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-card/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/40 shadow-xl shadow-emerald-500/15"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                فروش مستقیم
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-muted-foreground block">
              دریافت وجه با حساب‌پی
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Badge 4: Live Engagement Stats (Bottom-Right) */}
      <motion.div
        style={{ x: badge4X, y: badge4Y }}
        className="hidden sm:flex absolute bottom-20 -right-6 z-30"
      >
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 5.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="items-center gap-2 px-3 py-2 rounded-2xl bg-card/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-border shadow-lg flex"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-foreground font-outfit">
              +2,450 Clicks
            </span>
            <span className="text-[9px] text-emerald-500 block font-outfit font-semibold">
              84% Conversion
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ========================================================
          HYPER-REALISTIC 3D SMARTPHONE CHASSIS
      ======================================================== */}
      <motion.div
        style={{
          rotateX: phoneRotateX,
          rotateY: phoneRotateY,
          transformStyle: 'preserve-3d',
        }}
        transition={SPRING_FAST}
        className="relative mx-auto w-[285px] sm:w-[315px] transition-transform duration-100 ease-out"
      >
        {/* Hardware Titanium Side Buttons with Specular Highlights */}
        <div className="absolute -left-[10px] top-20 w-[4px] h-6 bg-gradient-to-r from-slate-600 to-slate-800 rounded-l-md shadow-xs border-l border-white/20" />
        <div className="absolute -left-[10px] top-32 w-[4px] h-11 bg-gradient-to-r from-slate-600 to-slate-800 rounded-l-md shadow-xs border-l border-white/20" />
        <div className="absolute -left-[10px] top-48 w-[4px] h-11 bg-gradient-to-r from-slate-600 to-slate-800 rounded-l-md shadow-xs border-l border-white/20" />
        <div className="absolute -right-[10px] top-36 w-[4px] h-16 bg-gradient-to-l from-slate-600 to-slate-800 rounded-r-md shadow-xs border-r border-white/20" />

        {/* Outer Titanium Bezel & Chamfered Frame */}
        <div className="relative rounded-[50px] p-[10px] bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 border-[3px] border-slate-500/60 shadow-[0_35px_75px_-15px_rgba(0,0,0,0.85),0_0_50px_rgba(6,182,212,0.22),inset_0_1px_2px_rgba(255,255,255,0.3)]">
          
          {/* Inner OLED Display Rim */}
          <div className="relative rounded-[42px] overflow-hidden bg-slate-950 border border-white/10 shadow-inner">
            
            {/* Dynamic 45-degree Specular Glass Glare Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.09] pointer-events-none z-20" />

            {/* Micro Speaker Ear-piece Slit above Notch */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-900 rounded-full z-40 border border-white/10 shadow-xs" />

            {/* Status Bar & Dynamic Island */}
            <div className="relative z-30 pt-3.5 px-6 flex items-center justify-between text-white/80 text-[10px] font-mono">
              {/* Real-time Local Device Clock */}
              <DeviceClock />

              {/* Dynamic Island Pill with Camera Glare */}
              <div className="relative w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner border border-white/10">
                {/* Front Camera Lens with Blue Anti-reflective Glare */}
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center relative overflow-hidden">
                  <div className="w-1 h-1 rounded-full bg-cyan-400" />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400/40 rounded-full blur-[1px]" />
                </div>
                {/* FaceID Sensor */}
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-white/90">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5 fill-white" />
              </div>
            </div>

            {/* Screen Content: AryaLink Live Profile Preview */}
            <div className="relative z-10 px-4 pt-3 pb-6 space-y-3 text-white max-h-[560px] overflow-hidden">
              {/* Profile Card Header */}
              <div className="text-center relative">
                {/* Avatar with Glow Ring */}
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/35">
                    <img
                      src="https://i.postimg.cc/JzMj1drh/25555.jpg"
                      alt="فرهاد آریا"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {/* Verified Check on Avatar */}
                  <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center border-2 border-slate-950 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-white text-cyan-600" />
                  </div>
                </div>

                {/* Name & Headline */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-white tracking-tight">
                      فرهاد آریا
                    </h4>
                    <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] font-bold">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-300 font-medium">
                    مشاور ارشد کسب‌وکار و بنیان‌گذار استارتاپ
                  </p>
                </div>

                {/* Bio text */}
                <p className="text-[10px] text-slate-300/90 leading-relaxed mt-2 px-1">
                  یک لینک برای اتصال تمام پروژه‌ها، مشاوره آنلاین و خدمات تخصصی من
                </p>
              </div>

              {/* vCard Save Contact Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>ذخیره مستقیم مخاطب (vCard)</span>
              </motion.button>

              {/* Module 1: Direct WhatsApp Chat */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between shadow-sm cursor-pointer hover:bg-emerald-950/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[11px] text-white block">
                      گفتگوی مستقیم واتساپ
                    </span>
                    <span className="text-[9px] text-emerald-400 block">
                      پاسخگویی سریع کمتر از ۱۵ دقیقه
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 rotate-45" />
              </motion.div>

              {/* Module 2: Online Consultation Booking (HesabPay) */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-2.5 rounded-2xl bg-blue-950/40 border border-cyan-500/30 flex items-center justify-between shadow-sm cursor-pointer hover:bg-blue-950/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[11px] text-white block">
                      رزرو نوبت مشاوره اختصاصی
                    </span>
                    <span className="text-[9px] text-cyan-300 block font-outfit">
                      500 AFN • پرداخت با حساب‌پی
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-cyan-500 text-white font-bold text-[9px]">
                  رزرو
                </span>
              </motion.div>

              {/* Module 3: Social Links Bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors cursor-pointer">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span className="text-[9px] text-slate-300">اینستاگرام</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors cursor-pointer">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span className="text-[9px] text-slate-300">تلگرام</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors cursor-pointer">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-[9px] text-slate-300">کاتالوگ</span>
                </div>
              </div>

              {/* Footer inside Screen */}
              <div className="pt-1 text-center">
                <span className="text-[9px] text-slate-500 font-outfit">
                  Powered by <span className="font-bold text-cyan-400">Arya Link</span>
                </span>
              </div>
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="pb-2 pt-1 flex justify-center">
              <div className="w-28 h-1 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HeroPhoneMockup;
