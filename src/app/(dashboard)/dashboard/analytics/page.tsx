'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Eye,
  Users,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChartPoint {
  dayName: string;
  date: string;
  isoDate: string;
  views: number;
  clicks: number;
}

interface AnalyticsData {
  summary: {
    totalProfiles: number;
    totalViews: number;
    totalClicks: number;
    totalLeads: number;
    ctr: number;
  };
  chartData: ChartPoint[];
  topLinks: {
    id: string;
    title: string;
    url: string;
    clickCount: number;
    moduleType: string;
    profileAlias: string;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<'both' | 'views' | 'clicks'>('both');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const chartPoints = data?.chartData || [];

  // Calculate coordinates for SVG Line Chart
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingX = 40;
  const paddingY = 40;

  const maxVal = Math.max(
    ...chartPoints.map((p) => Math.max(p.views, p.clicks)),
    10
  );

  const getCoordinates = (val: number, index: number, total: number) => {
    const x = paddingX + (index / (total - 1 || 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
    return { x, y };
  };

  // Build curved path (Bezier smoothing)
  const buildSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cpX = (current.x + next.x) / 2;
      path += ` C ${cpX} ${current.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const viewPoints = chartPoints.map((p, idx) => getCoordinates(p.views, idx, chartPoints.length));
  const clickPoints = chartPoints.map((p, idx) => getCoordinates(p.clicks, idx, chartPoints.length));

  const viewsPath = buildSmoothPath(viewPoints);
  const clicksPath = buildSmoothPath(clickPoints);

  const viewsAreaPath =
    viewPoints.length > 0
      ? `${viewsPath} L ${viewPoints[viewPoints.length - 1].x} ${svgHeight - paddingY} L ${viewPoints[0].x} ${svgHeight - paddingY} Z`
      : '';

  const clicksAreaPath =
    clickPoints.length > 0
      ? `${clicksPath} L ${clickPoints[clickPoints.length - 1].x} ${svgHeight - paddingY} L ${clickPoints[0].x} ${svgHeight - paddingY} Z`
      : '';

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              آمار و تحلیل تعاملات
            </h1>
            <Badge variant="cyan" className="font-outfit text-xs">
              زنده و هوشمند
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            بررسی دقیق تعداد بازدیدهای کارت دیجیتال، نرخ کلیک روی ماژول‌ها و رفتار مخاطبان
          </p>
        </div>

        <Button
          onClick={fetchAnalytics}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-border bg-card self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی داده‌ها</span>
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Views */}
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold">مجموع بازدیدها</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
            {data?.summary.totalViews.toLocaleString('fa-IR') || 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500 font-bold">+۱۲٪</span> نسبت به هفته قبل
          </p>
        </Card>

        {/* Card 2: Clicks */}
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold">مجموع کلیک‌ها</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
            {data?.summary.totalClicks.toLocaleString('fa-IR') || 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500 font-bold">+۸٪</span> رشد کلیک ماژول‌ها
          </p>
        </Card>

        {/* Card 3: CTR */}
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold">نرخ تعامل (CTR)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
            {data?.summary.ctr || 0}٪
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            میانگین نرخ تبدیل مخاطبان به خریدار
          </p>
        </Card>

        {/* Card 4: Leads */}
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold">سرنخ‌ها (Leads)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
            {data?.summary.totalLeads.toLocaleString('fa-IR') || 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            اطلاعات تماس و پیام‌های دریافتی
          </p>
        </Card>
      </div>

      {/* Main Line Chart Section */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-500" />
              <span>نمودار خطی بازدیدها و کلیک‌ها (۷ روز اخیر)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              روند روزانه تعامل کاربران با کارت‌های دیجیتال و لینک‌های شما
            </p>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveMetric('both')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeMetric === 'both'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              همه معیارها
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('views')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeMetric === 'views'
                  ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
              <span>فقط بازدیدها</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('clicks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeMetric === 'clicks'
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              <span>فقط کلیک‌ها</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
            <span className="text-muted-foreground">بازدیدها (Views)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm shadow-blue-500/50" />
            <span className="text-muted-foreground">کلیک‌ها (Clicks)</span>
          </div>
        </div>

        {/* Line Chart Graphic */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto pb-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-64 sm:h-72 overflow-visible"
            >
              <defs>
                {/* Gradient for views area */}
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradient for clicks area */}
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingY + ratio * (svgHeight - paddingY * 2);
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="currentColor"
                      fillOpacity="0.4"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="sans-serif"
                    >
                      {Math.round(maxVal * (1 - ratio))}
                    </text>
                  </g>
                );
              })}

              {/* Area Under Views Line */}
              {(activeMetric === 'both' || activeMetric === 'views') && (
                <path d={viewsAreaPath} fill="url(#viewsGradient)" />
              )}

              {/* Area Under Clicks Line */}
              {(activeMetric === 'both' || activeMetric === 'clicks') && (
                <path d={clicksAreaPath} fill="url(#clicksGradient)" />
              )}

              {/* Views Smooth Curved Line */}
              {(activeMetric === 'both' || activeMetric === 'views') && (
                <path
                  d={viewsPath}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_4px_8px_rgba(6,182,212,0.4)]"
                />
              )}

              {/* Clicks Smooth Curved Line */}
              {(activeMetric === 'both' || activeMetric === 'clicks') && (
                <path
                  d={clicksPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_4px_8px_rgba(59,130,246,0.4)]"
                />
              )}

              {/* Data Points & Hover Targets */}
              {chartPoints.map((pt, idx) => {
                const vCoord = viewPoints[idx];
                const cCoord = clickPoints[idx];
                const isHovered = hoveredIndex === idx;

                return (
                  <g key={idx}>
                    {/* Hover Guide Line */}
                    {isHovered && (
                      <line
                        x1={vCoord.x}
                        y1={paddingY}
                        x2={vCoord.x}
                        y2={svgHeight - paddingY}
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        opacity="0.8"
                      />
                    )}

                    {/* View Point Circle */}
                    {(activeMetric === 'both' || activeMetric === 'views') && (
                      <circle
                        cx={vCoord.x}
                        cy={vCoord.y}
                        r={isHovered ? 6 : 4}
                        fill="#06b6d4"
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />
                    )}

                    {/* Click Point Circle */}
                    {(activeMetric === 'both' || activeMetric === 'clicks') && (
                      <circle
                        cx={cCoord.x}
                        cy={cCoord.y}
                        r={isHovered ? 6 : 4}
                        fill="#3b82f6"
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />
                    )}

                    {/* Invisible Wide Hit Area for Hover */}
                    <rect
                      x={vCoord.x - (svgWidth - paddingX * 2) / (chartPoints.length * 2)}
                      y={0}
                      width={(svgWidth - paddingX * 2) / chartPoints.length}
                      height={svgHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* X-Axis Day Label */}
                    <text
                      x={vCoord.x}
                      y={svgHeight - 12}
                      fill="currentColor"
                      fillOpacity={isHovered ? '1' : '0.6'}
                      fontSize="11"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="transition-all"
                    >
                      {pt.dayName}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredIndex !== null && chartPoints[hoveredIndex] && (
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-4 py-2.5 shadow-2xl pointer-events-none flex items-center gap-4 animate-in fade-in zoom-in-95 duration-150"
                dir="rtl"
              >
                <div className="text-right">
                  <span className="text-[11px] font-bold text-foreground block">
                    {chartPoints[hoveredIndex].dayName} ({chartPoints[hoveredIndex].date})
                  </span>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-cyan-500 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      {chartPoints[hoveredIndex].views} بازدید
                    </span>
                    <span className="text-blue-500 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {chartPoints[hoveredIndex].clicks} کلیک
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Top Performing Links Table */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm p-6">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-cyan-500" />
          <span>محبوب‌ترین لینک‌ها و ماژول‌ها</span>
        </h2>

        {data?.topLinks && data.topLinks.length > 0 ? (
          <div className="space-y-3">
            {data.topLinks.map((link, i) => (
              <div
                key={link.id || i}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-500 font-bold text-xs flex items-center justify-center font-outfit shrink-0">
                    #{i + 1}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {link.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-outfit truncate block" dir="ltr">
                      {link.url || '#'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="cyan" className="font-outfit text-xs font-bold">
                    {link.clickCount} کلیک
                  </Badge>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">
            هنوز کلیکی روی ماژول‌ها ثبت نشده است.
          </p>
        )}
      </Card>
    </div>
  );
}
