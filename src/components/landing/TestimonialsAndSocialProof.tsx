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

// =========================================================================
// 1. DATA ARCHITECTURE (Mock Data Ready for Future CMS Integration)
// =========================================================================

export interface TestimonialItem {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  rating: number; // 5.0
  reviewText: string;
  verifiedBadge: string;
  cardMaterialUsed: string;
  dateStr: string;
}

// High-Profile Afghan Customer Testimonials
export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'انجینیر احمد فیاض',
    title: 'مدیر ارشد فناوری و هم‌بنیان‌گذار TechKabul',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewText: '«کارت فلزی مشکی آریا لینک ارتباطات تجاری شرکت ما را متحول کرد. در کنفرانس‌های بین‌المللی کابل و دبی، فقط با نزدیک کردن کارت به مبایل مشتریان، کاتالوگ و راه‌های ارتباطی ما در کسری از ثانیه ذخیره می‌شود. بی‌نظیر و باوقار است!»',
    verifiedBadge: 'مشتری سازمانی تاییدشده',
    cardMaterialUsed: 'فلز مشکی تیتانیوم',
    dateStr: '2026-10-14',
  },
  {
    id: 'test-2',
    name: 'دکتر سمیرا رحیمی',
    title: 'جراح و متخصص دندان‌پزشکی | کلینیک تخصصی رحیمی',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewText: '«بزرگ‌ترین مزیت آریا لینک برای من، حذف کامل کارت‌های کاغذی قدیمی و امکان رزرو نوبت آنلاین مریضان بود. مراجعین کلینیک با یک لمس ساده به شماره واتساپ، آدرس دقیق روی نقشه و کانال آموزشی وصل می‌شوند.»',
    verifiedBadge: 'پروفایل تیک آبی رسمی',
    cardMaterialUsed: 'PVC مات مخملی',
    dateStr: '2026-09-28',
  },
  {
    id: 'test-3',
    name: 'محمد عثمان کریمی',
    title: 'رئیس هیئت‌مدیره گروه بازرگانی آریا افغان',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewText: '«استفاده از کارت استیل طلایی آریا لینک در جلسات اتاق تجارت و قراردادهای کلان، اعتبار و پرستیژ متفاوتی به برند ما بخشیده است. پشتیبانی فنی و تحویل سریع پستی در کابل فوق‌العاده منظم و باکیفیت بود.»',
    verifiedBadge: 'کاربر پلن شرکتی (Enterprise)',
    cardMaterialUsed: 'استیل طلایی آینه‌ای',
    dateStr: '2026-10-02',
  },
  {
    id: 'test-4',
    name: 'فاطمه علیزاده',
    title: 'مشاور برندینگ و مدیر آژانس بازاریابی افق',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewText: '«داشبورد تحلیلی و آمار لحظه‌ای کلیک‌ها روی لینک‌ها بی‌نهایت کاربردی است. ما برای بیش از 30 پرسونل شرکت کارت چوبی سفارش دادیم و بازخورد مشتریان به رویکرد ارگانیک و مدرن ما شگفت‌انگیز بود.»',
    verifiedBadge: 'مشتری تاییدشده',
    cardMaterialUsed: 'چوب طبیعی گردو',
    dateStr: '2026-08-19',
  },
  {
    id: 'test-5',
    name: 'حسیب‌الله نوری',
    title: 'مدیر توسعه بازار | خدمات لجستیک و ترانسپورت پامیر',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewText: '«سرعت اسکن چیپست NFC فوق‌العاده بالاست. دیگر نیازی به چاپ مجدد هزاران کارت ویزیت در هر تغییر شماره تماس یا ایمیل نیست؛ از پنل به راحتی همه چیز در لحظه به‌روزرسانی می‌شود.»',
    verifiedBadge: 'مشتری سازمانی',
    cardMaterialUsed: 'فلز مشکی تیتانیوم',
    dateStr: '2026-09-12',
  },
  {
    id: 'test-6',
    name: 'رویا صدیقی',
    title: 'طراح ارشد هویت بصری و فریلنسر بین‌المللی',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewText: '«کیفیت ساخت و روکش مات کارت پی‌وی‌سی فراتر از انتظارم بود. جلوه مینیمال و شیک آن همراه با لینک نمونه کارهایم در بیو، حس یک هویت دیزاین سطح جهانی را به مشتریان منتقل می‌کند.»',
    verifiedBadge: 'پروفایل هنری تاییدشده',
    cardMaterialUsed: 'PVC مات مخملی',
    dateStr: '2026-10-18',
  },
];

const EASE_SNAPPY = [0, 0.7, 0.2, 1] as const;

// =========================================================================
// 2. SMOOTH PHYSICS NUMBER COUNTER COMPONENT
// =========================================================================

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
    <span ref={ref} className="font-outfit">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// =========================================================================
// 3. MAIN COMPONENT: TESTIMONIALS & ANIMATED SOCIAL PROOF
// =========================================================================

export function TestimonialsAndSocialProof() {
  return (
    <section id="social-proof" className="py-20 sm:py-28 border-t border-border/80 relative overflow-hidden">
      {/* Ambient Lighting Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ========================================================= */}
        {/* TESTIMONIALS SECTION HEADER */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_SNAPPY }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-block">
            <Badge variant="cyan" className="font-sans text-xs flex items-center gap-1.5 mx-auto">
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

        {/* ========================================================= */}
        {/* TESTIMONIALS GRID (Glassmorphism Cards) */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE_SNAPPY, staggerChildren: 0.12 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="group p-6 sm:p-7 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle top corner quote icon */}
              <Quote className="w-8 h-8 text-cyan-500/10 dark:text-cyan-400/10 absolute top-5 left-5 pointer-events-none" />

              <div className="space-y-4">
                {/* 5 Golden Stars & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star key={starIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-black font-outfit text-slate-800 dark:text-slate-200 mr-1.5">
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
                <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
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

        {/* ========================================================= */}
        {/* ANIMATED PHYSICS NUMBER COUNTER BANNER */}
        {/* ========================================================= */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-600/10 border border-cyan-500/20 backdrop-blur-xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black font-outfit text-cyan-600 dark:text-cyan-400">
              <AnimatedCounter target={12400} suffix="+" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 block">
              کارت ویزیت هوشمند فعال
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-outfit text-cyan-600 dark:text-cyan-400">
              <AnimatedCounter target={34} />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 block">
              ولایت تحت پوشش ارسال پستی
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-outfit text-cyan-600 dark:text-cyan-400">
              <AnimatedCounter target={99.8} decimals={1} suffix="%" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-1 block">
              رضایت و تایید کیفیت مشتریان
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-outfit text-cyan-600 dark:text-cyan-400">
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
