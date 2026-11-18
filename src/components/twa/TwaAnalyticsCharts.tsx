'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Smartphone } from 'lucide-react';

export interface TimelinePoint {
  day: string;
  views: number;
  clicks?: number;
  registrations?: number;
}

export interface DevicePoint {
  name: string;
  value: number;
  color: string;
}

interface TwaAnalyticsChartsProps {
  viewsTimeline: TimelinePoint[];
  deviceBreakdown: DevicePoint[];
  timelineTitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  secondaryKey?: 'clicks' | 'registrations';
}

export function TwaAnalyticsCharts({
  viewsTimeline,
  deviceBreakdown,
  timelineTitle = 'نمودار خطی بازدیدهای ۷ روز گذشته',
  primaryLabel = 'بازدید پروفایل',
  secondaryLabel = 'کلیک لینک‌ها',
  secondaryKey = 'clicks',
}: TwaAnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalDevices = deviceBreakdown.reduce((acc, item) => acc + (item.value || 0), 0) || 100;

  return (
    <div className="space-y-4">
      {/* 1. 7-Day Line / Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="p-4 rounded-2xl border space-y-3 shadow-xs"
        style={{
          backgroundColor: 'var(--tg-card-bg, rgba(15, 23, 42, 0.72))',
          borderColor: 'var(--tg-card-border, rgba(255, 255, 255, 0.09))',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3
              className="text-xs font-bold"
              style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}
            >
              {timelineTitle}
            </h3>
          </div>
          <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
            ۷ روز اخیر
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] px-1">
          <span className="flex items-center gap-1.5" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>{primaryLabel}</span>
          </span>
          <span className="flex items-center gap-1.5" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>{secondaryLabel}</span>
          </span>
        </div>

        <div className="w-full h-48 pt-1" dir="ltr">
          {mounted && viewsTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={viewsTimeline}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="twaViewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="twaSecondaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(6, 182, 212, 0.3)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f8fafc',
                    direction: 'rtl',
                    textAlign: 'right',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  name={primaryLabel}
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#twaViewsGradient)"
                  animationDuration={900}
                />
                <Area
                  type="monotone"
                  dataKey={secondaryKey}
                  name={secondaryLabel}
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#twaSecondaryGradient)"
                  animationDuration={1100}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs opacity-60">
              در حال آماده‌سازی گراف...
            </div>
          )}
        </div>
      </motion.div>

      {/* 2. Donut Pie Chart for Visitor Devices */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.08, ease: 'easeOut' }}
        className="p-4 rounded-2xl border space-y-3 shadow-xs"
        style={{
          backgroundColor: 'var(--tg-card-bg, rgba(15, 23, 42, 0.72))',
          borderColor: 'var(--tg-card-border, rgba(255, 255, 255, 0.09))',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3
              className="text-xs font-bold"
              style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}
            >
              تفکیک دستگاه‌های بازدیدکنندگان
            </h3>
          </div>
          <span className="text-[10px] font-sans" style={{ color: 'var(--tg-theme-hint-color, #94a3b8)' }}>
            دونات چارت زنده
          </span>
        </div>

        <div className="grid grid-cols-12 items-center gap-2">
          <div className="col-span-5 h-36" dir="ltr">
            {mounted && deviceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={54}
                    paddingAngle={4}
                    stroke="none"
                    animationDuration={900}
                  >
                    {deviceBreakdown.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'سهم']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      fontSize: '11px',
                      color: '#f8fafc',
                      direction: 'rtl',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="col-span-7 space-y-2.5">
            {deviceBreakdown.map((item, idx) => {
              const pct = Math.round(((item.value || 0) / totalDevices) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className="truncate font-semibold"
                        style={{ color: 'var(--tg-theme-text-color, #f8fafc)' }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span className="font-sans font-bold" style={{ color: item.color }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-700/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.1 * idx }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TwaAnalyticsCharts;
