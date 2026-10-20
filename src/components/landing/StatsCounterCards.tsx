'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Link2, Users, MousePointerClick, Activity } from 'lucide-react';

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  sub: string;
  colorClass: string;
  borderHover: string;
  delay: number;
}

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
    stiffness: 45,
    damping: 18,
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
    <span ref={ref} className="font-outfit font-black tracking-tight text-foreground">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

const STATS_DATA: StatItemProps[] = [
  {
    icon: Link2,
    value: 15400,
    prefix: '+',
    label: 'لینک و مینی‌وب‌سایت فعال',
    sub: 'ساخته شده توسط افراد و تیم‌ها',
    colorClass: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    borderHover: 'hover:border-cyan-500/60 hover:shadow-cyan-500/15',
    delay: 0,
  },
  {
    icon: Users,
    value: 2850,
    prefix: '+',
    label: 'کسب‌وکار و حرفه‌ای پیشرو',
    sub: 'در کابل، هرات، مزار و خارج از کشور',
    colorClass: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    borderHover: 'hover:border-blue-500/60 hover:shadow-blue-500/15',
    delay: 0.1,
  },
  {
    icon: MousePointerClick,
    value: 950000,
    prefix: '+',
    label: 'کلیک و بازدید ماهانه',
    sub: 'از اینستاگرام، تیک‌تاک و کارت‌ها',
    colorClass: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    borderHover: 'hover:border-purple-500/60 hover:shadow-purple-500/15',
    delay: 0.2,
  },
  {
    icon: Activity,
    value: 99.9,
    suffix: '%',
    decimals: 1,
    label: 'پایداری و آپ‌تایم شبکه',
    sub: 'زیرساخت ابری پرسرعت و امن',
    colorClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    borderHover: 'hover:border-emerald-500/60 hover:shadow-emerald-500/15',
    delay: 0.3,
  },
];

export function StatsCounterCards() {
  return (
    <section className="relative py-10 sm:py-14 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS_DATA.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: item.delay,
                  ease: [0, 0.7, 0.2, 1],
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative rounded-3xl p-5 sm:p-6 bg-card/60 dark:bg-white/[0.035] backdrop-blur-xl border border-border/80 dark:border-white/10 ${item.borderHover} hover:shadow-xl transition-all duration-300 flex flex-col justify-between`}
              >
                {/* Top Subtle Sheen */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${item.colorClass} group-hover:scale-110 transition-transform shadow-xs`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-1 text-right">
                  <div className="text-2xl sm:text-3xl lg:text-4xl">
                    <AnimatedCounter
                      target={item.value}
                      prefix={item.prefix}
                      suffix={item.suffix}
                      decimals={item.decimals}
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground pt-1">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.sub}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default StatsCounterCards;
