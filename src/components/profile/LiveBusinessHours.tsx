'use client';

import React, { useState, useEffect } from 'react';
import { BusinessHourDay } from '@/types/profile.types';
import { Clock, Calendar, ChevronDown } from 'lucide-react';
import { gregorianToJalali } from '@/lib/jalali';

export interface LiveBusinessHoursProps {
  businessHours?: BusinessHourDay[];
  title?: string;
  profileLanguage?: string;
  isLight?: boolean;
  className?: string;
  style?: React.CSSProperties;
  animClass?: string;
}

export const formatDisplayDate = (d: Date, lang: string = 'dari'): string => {
  if (lang === 'en') {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `Today: ${y}/${m}/${day}`;
  }

  // Dari or Pashto: Solar Hijri (Jalali) date with English digits (0-9)
  const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const mStr = String(jm).padStart(2, '0');
  const dStr = String(jd).padStart(2, '0');
  const prefix = lang === 'pashto' ? 'نن:' : 'امروز:';
  return `${prefix} ${jy}/${mStr}/${dStr}`;
};

export const formatTime12Hour = (timeStr?: string, lang: string = 'dari'): string => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const mm = String(m).padStart(2, '0');

  if (lang === 'en') {
    const period = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    const hh = String(h12).padStart(2, '0');
    return `${hh}:${mm} ${period}`;
  }

  let period = 'صبح';
  if (h >= 12 && h < 18) {
    period = 'عصر';
  } else if (h >= 18 || h < 4) {
    period = 'شب';
  } else {
    period = 'صبح';
  }

  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  const hh = String(h12).padStart(2, '0');
  return `${hh}:${mm} ${period}`;
};

export const LiveBusinessHours: React.FC<LiveBusinessHoursProps> = ({
  businessHours,
  title,
  profileLanguage = 'dari',
  isLight,
  className = '',
  style,
  animClass = '',
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const defaultWeek: BusinessHourDay[] = [
    { dayIndex: 0, dayName: 'شنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayIndex: 1, dayName: 'یکشنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayIndex: 2, dayName: 'دوشنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayIndex: 3, dayName: 'سه‌شنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayIndex: 4, dayName: 'چهارشنبه', isOpen: true, openTime: '08:00', closeTime: '17:00' },
    { dayIndex: 5, dayName: 'پنجشنبه', isOpen: true, openTime: '08:00', closeTime: '13:00' },
    { dayIndex: 6, dayName: 'جمعه', isOpen: false, openTime: '08:00', closeTime: '17:00' },
  ];

  const week: BusinessHourDay[] =
    Array.isArray(businessHours) && businessHours.length === 7 ? businessHours : defaultWeek;

  // JS getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Afghan/Persian: 0 = شنبه, 1 = یکشنبه, 2 = دوشنبه, 3 = سه‌شنبه, 4 = چهارشنبه, 5 = پنجشنبه, 6 = جمعه
  const jsDay = now.getDay();
  const currentDayIndex = (jsDay + 1) % 7;

  const currentSecondsOfDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const timeToSeconds = (tStr?: string) => {
    if (!tStr) return 0;
    const parts = tStr.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 3600 + m * 60;
  };

  const todaySchedule = week.find((d) => d.dayIndex === currentDayIndex) || defaultWeek[currentDayIndex];
  const openSec = timeToSeconds(todaySchedule.openTime);
  const closeSec = timeToSeconds(todaySchedule.closeTime);

  const getNextOpenDayInfo = () => {
    for (let offset = 1; offset <= 7; offset++) {
      const idx = (currentDayIndex + offset) % 7;
      const d = week.find((item) => item.dayIndex === idx);
      if (d && d.isOpen) {
        return {
          dayName: offset === 1 ? 'فردا' : d.dayName,
          openTime: d.openTime || '08:00',
        };
      }
    }
    return { dayName: 'فردا', openTime: '08:00' };
  };

  const isCurrentlyOpen = todaySchedule.isOpen && currentSecondsOfDay >= openSec && currentSecondsOfDay < closeSec;
  const isAfterHoursToday = todaySchedule.isOpen && currentSecondsOfDay >= closeSec;
  const isClosedFullDay = !todaySchedule.isOpen;
  const isBeforeOpenToday = todaySchedule.isOpen && currentSecondsOfDay < openSec;

  const nextOpenInfo = getNextOpenDayInfo();

  let countdownText = '';
  if (isCurrentlyOpen) {
    const diffSec = Math.max(0, closeSec - currentSecondsOfDay);
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;
    const hh = String(hrs).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    countdownText = `${hh}:${mm}:${ss} تا زمان تعطیلی`;
  }

  return (
    <div
      className={`w-full p-3.5 border shadow-sm space-y-3 text-right transition-all select-none ${isLight ? 'bg-white border-slate-200' : 'backdrop-blur-md'
        } ${className} ${animClass}`}
      style={style}
    >
      {/* Top Header: Title & Dynamic Real-time Status Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {title || 'ساعات کاری'}
            </span>
            <span className={`text-[10px] text-muted-foreground block font-sans ${profileLanguage === 'en' ? 'text-left' : 'text-right'}`}>
              {formatDisplayDate(now, profileLanguage)}
            </span>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        {isCurrentlyOpen && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>اکنون باز است</span>
          </div>
        )}

        {isAfterHoursToday && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>اکنون بسته است</span>
          </div>
        )}

        {isClosedFullDay && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-bold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>امروز تعطیل است</span>
          </div>
        )}

        {isBeforeOpenToday && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[11px] font-bold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>شروع کار: {formatTime12Hour(todaySchedule.openTime, profileLanguage)}</span>
          </div>
        )}
      </div>

      {/* Main Status Display Area */}
      {isCurrentlyOpen && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1.5">
          <div className="text-base font-bold font-mono tracking-wider text-emerald-400 drop-shadow-sm flex items-center justify-center gap-1.5" dir="ltr">
            <span>{countdownText}</span>
          </div>
          <p className="text-xs font-medium text-emerald-300 dark:text-emerald-300">
            {profileLanguage === 'en'
              ? `We look forward to seeing you from ${formatTime12Hour(todaySchedule.openTime, 'en')} to ${formatTime12Hour(todaySchedule.closeTime, 'en')}.`
              : `ما از ساعت ${formatTime12Hour(todaySchedule.openTime, profileLanguage)} تا ${formatTime12Hour(todaySchedule.closeTime, profileLanguage)} منتظر شما هستیم.`}
          </p>
        </div>
      )}

      {isAfterHoursToday && (
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-center space-y-1">
          <p className="text-xs font-bold text-foreground">
            {profileLanguage === 'en'
              ? 'Our business hours have ended for today.'
              : 'ساعت کاری‌مان امروز تمام شده است.'}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {profileLanguage === 'en'
              ? `We will be back tomorrow at ${formatTime12Hour(nextOpenInfo.openTime, 'en')}, but if you have an urgent inquiry, please leave a message or call us.`
              : `ما ${nextOpenInfo.dayName} ساعت ${formatTime12Hour(nextOpenInfo.openTime, profileLanguage)} منتظر شما هستیم، اما اگر کار فوری دارید لطفاً برای ما پیام بگذارید یا تماس بگیرید.`}
          </p>
        </div>
      )}

      {isClosedFullDay && (
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-center space-y-1">
          <p className="text-xs font-bold text-foreground">
            {profileLanguage === 'en'
              ? `We are closed today (${todaySchedule.dayName}).`
              : `امروز ${todaySchedule.dayName} تعطیل هستیم.`}
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {profileLanguage === 'en'
              ? `We will be back ${nextOpenInfo.dayName === 'فردا' ? 'tomorrow' : `on ${nextOpenInfo.dayName}`} at ${formatTime12Hour(nextOpenInfo.openTime, 'en')}, but if you have an urgent inquiry, please leave a message or call us.`
              : `ما ${nextOpenInfo.dayName} ساعت ${formatTime12Hour(nextOpenInfo.openTime, profileLanguage)} منتظر شما هستیم، اما اگر کار فوری دارید لطفاً برای ما پیام بگذارید یا تماس بگیرید.`}
          </p>
        </div>
      )}

      {isBeforeOpenToday && (
        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center space-y-1">
          <p className="text-xs font-bold text-foreground">
            {profileLanguage === 'en'
              ? `We start today at ${formatTime12Hour(todaySchedule.openTime, 'en')}.`
              : `ما امروز ساعت ${formatTime12Hour(todaySchedule.openTime, profileLanguage)} شروع به کار می‌کنیم.`}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {profileLanguage === 'en'
              ? `We look forward to seeing you from ${formatTime12Hour(todaySchedule.openTime, 'en')} to ${formatTime12Hour(todaySchedule.closeTime, 'en')}.`
              : `ما از ساعت ${formatTime12Hour(todaySchedule.openTime, profileLanguage)} تا ${formatTime12Hour(todaySchedule.closeTime, profileLanguage)} منتظر شما هستیم.`}
          </p>
        </div>
      )}

      {/* Accordion Toggle for Weekly Schedule Table */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="w-full pt-1 flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium border-t border-border/30 cursor-pointer"
      >
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>مشاهده برنامه کامل هفتگی</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-cyan-400' : ''
            }`}
        />
      </button>

      {/* Collapsible Weekly Schedule List */}
      {isExpanded && (
        <div className="space-y-1.5 pt-1 border-t border-border/30 animate-in fade-in slide-in-from-top-1 duration-200">
          {week.map((d) => {
            const isToday = d.dayIndex === currentDayIndex;
            return (
              <div
                key={d.dayIndex}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${isToday
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold'
                    : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span>{d.dayName}</span>
                  {isToday && (
                    <span className="text-[9px] bg-cyan-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-md">
                      امروز
                    </span>
                  )}
                </div>

                <div className="font-sans text-[11px]" dir="ltr">
                  {d.isOpen ? (
                    <span className={isToday ? 'text-cyan-400 font-bold' : 'text-foreground'}>
                      {formatTime12Hour(d.openTime, profileLanguage)} - {formatTime12Hour(d.closeTime, profileLanguage)}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-medium">تعطیل</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveBusinessHours;
