'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Zap,
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
    // Check every 10 seconds so the minute flips accurately
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

export function HeroPhoneMockup() {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[370px] mx-auto select-none py-6">
      {/* Background Glow Effect behind Phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[520px] bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-purple-600/20 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* ========================================================
          FLOATING BADGES (SURROUNDING THE PHONE)
          Active floating & popup animations only on decorative cards
      ======================================================== */}

      {/* Floating Badge 1: NFC Instant Tap (Top-Right) */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        animate={{
          y: [0, -9, 0],
          rotate: [0, 1, 0],
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute -top-3 -right-2 sm:-right-8 z-30 flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-card/90 dark:bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 shadow-xl shadow-cyan-500/15"
      >
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/30">
          <Zap className="w-5 h-5 fill-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-foreground">لمس هوشمند NFC</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-500 text-[9px] font-bold">
              فوری
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block">
            بدون اسکن، فقط با یک لمس
          </span>
        </div>
      </motion.div>

      {/* Floating Badge 2: Verified KYC Badge (Middle-Left) */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        animate={{
          y: [0, 10, 0],
          rotate: [0, -1, 0],
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
          rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute top-1/3 -left-3 sm:-left-10 z-30 flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-card/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-500/40 shadow-xl shadow-blue-500/15"
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

      {/* Floating Badge 3: Online Store & HesabPay (Bottom-Left) */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 30 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1 },
        }}
        className="absolute -bottom-4 -left-2 sm:-left-8 z-30 flex items-center gap-2.5 p-3 rounded-2xl bg-card/90 dark:bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 shadow-xl shadow-emerald-500/15"
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
            دریافت آنی وجه با حساب‌پی
          </span>
        </div>
      </motion.div>

      {/* Floating Badge 4: Live Engagement Stats (Bottom-Right) */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
        }}
        className="hidden sm:flex absolute bottom-20 -right-6 z-30 items-center gap-2 px-3 py-2 rounded-2xl bg-card/90 dark:bg-slate-900/90 backdrop-blur-xl border border-border shadow-lg"
      >
        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-foreground font-outfit">
            +۲,۴۵۰ بازدید
          </span>
          <span className="text-[9px] text-emerald-500 block font-sans">
            نرخ تبدیل ۸۴٪
          </span>
        </div>
      </motion.div>

      {/* ========================================================
          MAIN PHONE CHASSIS (STATIC & FIXED - NO FLOATING MOTION)
      ======================================================== */}
      <div className="relative mx-auto w-[285px] sm:w-[315px]">
        {/* Hardware Side Buttons */}
        {/* Mute switch left */}
        <div className="absolute -left-[9px] top-20 w-[4px] h-6 bg-slate-700/80 rounded-l-md shadow-sm" />
        {/* Volume up left */}
        <div className="absolute -left-[9px] top-32 w-[4px] h-11 bg-slate-700/80 rounded-l-md shadow-sm" />
        {/* Volume down left */}
        <div className="absolute -left-[9px] top-48 w-[4px] h-11 bg-slate-700/80 rounded-l-md shadow-sm" />
        {/* Power button right */}
        <div className="absolute -right-[9px] top-36 w-[4px] h-16 bg-slate-700/80 rounded-r-md shadow-sm" />

        {/* iPhone Outer Bezel & Border */}
        <div className="relative rounded-[50px] p-[10px] bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 border-[3px] border-slate-600/50 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_50px_rgba(6,182,212,0.18)]">
          {/* Inner Phone Rim */}
          <div className="relative rounded-[42px] overflow-hidden bg-slate-950 border border-white/10">
            {/* Screen Glass Glare Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none z-20" />

            {/* Dynamic Island Notch & Status Bar */}
            <div className="relative z-30 pt-3 px-6 flex items-center justify-between text-white/80 text-[10px] font-mono">
              {/* Real-time Local Device Clock */}
              <DeviceClock />

              {/* Dynamic Island Pill */}
              <div className="relative w-24 h-5 bg-black rounded-full flex items-center justify-between px-2 shadow-inner border border-white/5">
                <div className="w-2 h-2 rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-cyan-400" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-white/90">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5 fill-white" />
              </div>
            </div>

            {/* Screen Content: AryaLink Card Live Preview */}
            <div className="relative z-10 px-4 pt-4 pb-6 space-y-3.5 text-white max-h-[560px] overflow-hidden">
              {/* Profile Card Header */}
              <div className="text-center relative">
                {/* Avatar with Glow Ring */}
                <div className="relative w-20 h-20 mx-auto mb-2.5">
                  <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shadow-lg shadow-cyan-500/30">
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
                    مشاور ارشد کسب‌وکار و فناوری هوش مصنوعی
                  </p>
                </div>

                {/* Bio text */}
                <p className="text-[10px] text-slate-300/90 leading-relaxed mt-2 px-1">
                  توسعه استارتاپ‌ها، راهکارهای تحول دیجیتال و رشد فروش در خاورمیانه
                </p>
              </div>

              {/* vCard Save Contact Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
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
                      رزرو جلسه مشاوره اختصاصی
                    </span>
                    <span className="text-[9px] text-cyan-300 block">
                      ۵۰۰ افغانی • پرداخت با حساب‌پی
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
      </div>
    </div>
  );
}

export default HeroPhoneMockup;
