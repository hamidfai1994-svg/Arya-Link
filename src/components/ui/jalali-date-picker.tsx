'use client';

import React, { useState, useEffect } from 'react';
import {
  JALALI_MONTHS_DARI,
  getCurrentJalaliDate,
  gregorianToJalali,
  jalaliToDate,
} from '@/lib/jalali';
import { Calendar, Clock } from 'lucide-react';

interface JalaliDatePickerProps {
  value?: string; // ISO date string
  onChange: (isoString: string) => void;
  label?: string;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  label = 'تاریخ پایان (تقویم شمسی / جلالی)',
}) => {
  const currentJalali = getCurrentJalaliDate();

  // Parse initial state from value or default to current date + 7 days
  const getInitialState = () => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        return {
          year: jy,
          month: jm,
          day: jd,
          hour: d.getHours(),
          minute: d.getMinutes(),
        };
      }
    }
    // Default: 7 days in the future
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const [jy, jm, jd] = gregorianToJalali(
      future.getFullYear(),
      future.getMonth() + 1,
      future.getDate()
    );
    return {
      year: jy,
      month: jm,
      day: jd,
      hour: 23,
      minute: 59,
    };
  };

  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        setState({
          year: jy,
          month: jm,
          day: jd,
          hour: d.getHours(),
          minute: d.getMinutes(),
        });
      }
    }
  }, [value]);

  const updateDate = (field: 'year' | 'month' | 'day' | 'hour' | 'minute', val: number) => {
    const updated = { ...state, [field]: val };
    setState(updated);
    const dateObj = jalaliToDate(
      updated.year,
      updated.month,
      updated.day,
      updated.hour,
      updated.minute
    );
    onChange(dateObj.toISOString());
  };

  const years = Array.from({ length: 6 }, (_, i) => currentJalali.year + i);
  const daysInMonth = state.month <= 6 ? 31 : state.month <= 11 ? 30 : 29;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-2 text-right">
      {label && (
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-500" />
          <span>{label}</span>
        </label>
      )}

      <div className="p-3 bg-muted/40 border border-border rounded-2xl space-y-3">
        {/* Date Row: Year, Month, Day */}
        <div className="grid grid-cols-3 gap-2">
          {/* Day */}
          <div>
            <span className="block text-[10px] text-muted-foreground mb-1">روز</span>
            <select
              value={state.day}
              onChange={(e) => updateDate('day', parseInt(e.target.value, 10))}
              className="w-full bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-outfit"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <span className="block text-[10px] text-muted-foreground mb-1">ماه</span>
            <select
              value={state.month}
              onChange={(e) => updateDate('month', parseInt(e.target.value, 10))}
              className="w-full bg-card border border-border rounded-xl px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-sans"
            >
              {JALALI_MONTHS_DARI.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <span className="block text-[10px] text-muted-foreground mb-1">سال</span>
            <select
              value={state.year}
              onChange={(e) => updateDate('year', parseInt(e.target.value, 10))}
              className="w-full bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-outfit"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Row: Hour & Minute */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>ساعت پایان:</span>
          </div>

          <div className="flex items-center gap-2" dir="ltr">
            <select
              value={state.hour}
              onChange={(e) => updateDate('hour', parseInt(e.target.value, 10))}
              className="bg-card border border-border rounded-lg px-2 py-1 text-xs text-foreground font-outfit focus:outline-none focus:border-cyan-500"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="text-muted-foreground font-bold">:</span>
            <select
              value={state.minute}
              onChange={(e) => updateDate('minute', parseInt(e.target.value, 10))}
              className="bg-card border border-border rounded-lg px-2 py-1 text-xs text-foreground font-outfit focus:outline-none focus:border-cyan-500"
            >
              {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Display */}
        <div className="text-[11px] text-cyan-600 dark:text-cyan-400 text-center font-medium bg-cyan-500/10 rounded-xl py-1 border border-cyan-500/20">
          تاریخ انقضا: {state.year}/{String(state.month).padStart(2, '0')}/{String(state.day).padStart(2, '0')} - ساعت {String(state.hour).padStart(2, '0')}:{String(state.minute).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};
