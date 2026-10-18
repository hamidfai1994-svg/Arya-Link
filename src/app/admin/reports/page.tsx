'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  MapPin,
  Smartphone,
  Monitor,
  RefreshCw,
  Loader2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReportStats {
  totalUsers: number;
  totalProfiles: number;
  totalViews: number;
  totalClicks: number;
  totalLeads: number;
  averageCtr: string;
}

interface ProvinceItem {
  province: string;
  visitorsPercent: number;
}

interface DeviceItem {
  device: string;
  percent: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setProvinces(data.provinceDistribution || []);
        setDevices(data.deviceBreakdown || []);
      }
    } catch (err) {
      toast.error('خطا در دریافت گزارشات سیستم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              گزارشات رشد و آنالیتیکس پلتفرم (Platform Analytics)
            </h1>
            <Badge variant="cyan" className="font-outfit text-xs">
              Live BI
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            آمار ترافیک بازدیدها، کلیک‌ها، تعامل کارت‌های هوشمند NFC و پراکندگی جغرافیایی کاربران در ولایات افغانستان
          </p>
        </div>

        <Button
          onClick={fetchReports}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-border bg-card self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی گزارشات</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <span className="text-xs">در حال پردازش داده‌های آماری...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Views */}
            <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-semibold">کل بازدیدهای پروفایل</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
                {stats?.totalViews.toLocaleString('fa-IR')}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-500 mt-1 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+۲۸٪ رشد نسبت به ماه گذشته</span>
              </div>
            </Card>

            {/* Total Clicks */}
            <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-semibold">کل کلیک‌ها بر ماژول‌ها</span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
                {stats?.totalClicks.toLocaleString('fa-IR')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                نرخ تعامل میانگین: <span className="font-bold text-rose-500 font-outfit">{stats?.averageCtr}</span>
              </p>
            </Card>

            {/* Active Profiles */}
            <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-semibold">کارت‌ها و صفحات فعال</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-outfit text-foreground tracking-tight">
                {stats?.totalProfiles.toLocaleString('fa-IR')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">پروفایل‌های آنلاین دارای لینک بایو</p>
            </Card>

            {/* Leads Captured */}
            <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-semibold">سرنخ‌ها و فرم‌های دریافتی</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-outfit text-emerald-500 tracking-tight">
                {stats?.totalLeads.toLocaleString('fa-IR')}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">مخاطبین جذب‌شده توسط مشتریان</p>
            </Card>
          </div>

          {/* Regional & Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provincial Distribution */}
            <Card className="rounded-3xl border-border bg-card/90 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>توزیع بازدیدکنندگان بر اساس ولایات افغانستان</span>
                </h2>
                <Badge variant="outline" className="text-[10px]">
                  GeoIP Insights
                </Badge>
              </div>

              <div className="space-y-4">
                {provinces.map((p, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{p.province}</span>
                      <span className="font-outfit font-bold text-cyan-500">{p.visitorsPercent}٪</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${p.visitorsPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Device and Channel Breakdown */}
            <Card className="rounded-3xl border-border bg-card/90 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-500" />
                  <span>تفکیک بر اساس دستگاه ورودی (Device Breakdown)</span>
                </h2>
                <Badge variant="outline" className="text-[10px]">
                  Hardware
                </Badge>
              </div>

              <div className="space-y-6 pt-2">
                {devices.map((d, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-foreground shadow-sm">
                        {idx === 0 ? <Smartphone className="w-5 h-5 text-rose-500" /> : <Monitor className="w-5 h-5 text-cyan-500" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{d.device}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {idx === 0 ? 'تاچ NFC و اسکن QR کد روی کارت فیزیکی' : 'بازدید از طریق مرورگرهای دسکتاپ'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xl font-black font-outfit text-foreground tracking-tight">
                      {d.percent}٪
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
                  💡 <span className="font-bold">بینش تجاری:</span> بیش از ۷۸٪ ترافیک از طریق گوشی‌های هوشمند ناشی از لمس کارت NFC یا اسکن QR در جلسات کاری ثبت شده است.
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
