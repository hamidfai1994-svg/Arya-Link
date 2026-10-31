'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Clock } from 'lucide-react';

interface LiveCountdownProps {
  targetDate?: string;
  title?: string;
  isLight?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const LiveCountdown: React.FC<LiveCountdownProps> = ({
  targetDate,
  title,
  isLight = false,
  className = '',
  style,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      if (!targetDate) {
        // Default fallback: 7 days from now
        setTimeLeft({
          days: 7,
          hours: 12,
          minutes: 30,
          seconds: 45,
          isEnded: false,
        });
        return;
      }

      const targetTime = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isEnded: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className={`w-full p-4 rounded-2xl border shadow-sm text-center space-y-3 font-sans transition-all ${className}`}
      style={style}
    >
      <div className="flex items-center justify-center gap-1.5 text-amber-500 text-xs font-bold">
        <Timer className="w-4 h-4 animate-pulse" />
        <span className="truncate">{title || 'شمارش معکوس رویداد'}</span>
      </div>

      {timeLeft.isEnded ? (
        <div className="py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold inline-block">
          مهلت این رویداد یا تخفیف به پایان رسیده است
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 font-sans" dir="ltr">
          {[
            { val: padZero(timeLeft.days), label: 'روز', enLabel: 'Days' },
            { val: padZero(timeLeft.hours), label: 'ساعت', enLabel: 'Hours' },
            { val: padZero(timeLeft.minutes), label: 'دقیقه', enLabel: 'Mins' },
            { val: padZero(timeLeft.seconds), label: 'ثانیه', enLabel: 'Secs' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl min-w-[50px] shadow-sm border ${
                isLight
                  ? 'bg-slate-100/90 border-slate-200 text-slate-800'
                  : 'bg-white/10 border-white/15 text-white'
              }`}
            >
              <span className="text-base font-bold font-sans tracking-wider">
                {item.val}
              </span>
              <span
                className={`text-[9px] font-sans mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-300'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default LiveCountdown;
