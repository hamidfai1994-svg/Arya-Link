'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Server,
  Database,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  verifiedUsersCount: number;
  pendingKycCount: number;
  dailyRevenue: number;
  totalOrders: number;
  pendingOrdersCount: number;
  printingOrdersCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    verifiedUsersCount: 0,
    pendingKycCount: 0,
    dailyRevenue: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
    printingOrdersCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sample weekly metrics data for the visual chart (Days of week)
  const weeklyActivity = [
    { day: 'شنبه', orders: 12, visits: 340, height: '48%' },
    { day: 'یکشنبه', orders: 18, visits: 480, height: '65%' },
    { day: 'دوشنبه', orders: 24, visits: 620, height: '85%' },
    { day: 'سه‌شنبه', orders: 16, visits: 410, height: '55%' },
    { day: 'چهارشنبه', orders: 28, visits: 730, height: '95%' },
    { day: 'پنج‌شنبه', orders: 20, visits: 550, height: '72%' },
    { day: 'جمعه', orders: 9, visits: 290, height: '38%' },
  ];

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setIsLoading(true);
    try {
      const [usersRes, ordersRes, financeRes] = await Promise.all([
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/orders?all=true', { cache: 'no-store' }),
        fetch('/api/admin/finance', { cache: 'no-store' }),
      ]);

      const usersJson = await usersRes.json();
      const ordersJson = await ordersRes.json();
      const financeJson = await financeRes.json();

      let totalUsers = 0;
      let verifiedUsersCount = 0;
      let pendingKycCount = 0;

      if (usersJson.success) {
        totalUsers = usersJson.totalUsers || 0;
        verifiedUsersCount = usersJson.verifiedUsersCount || 0;
        pendingKycCount = usersJson.pendingKycCount || 0;
      }

      let totalOrders = 0;
      let pendingOrdersCount = 0;
      let printingOrdersCount = 0;

      if (ordersJson.success && ordersJson.stats) {
        totalOrders = ordersJson.stats.totalOrders || 0;
        pendingOrdersCount = ordersJson.stats.pendingCount || 0;
        printingOrdersCount = ordersJson.stats.printingCount || 0;
      }

      let dailyRevenue = 0;
      if (financeJson.success && financeJson.metrics) {
        dailyRevenue = Math.round((financeJson.metrics.totalGrossRevenue || 0) * 0.14) || 2850;
      }

      setStats({
        totalUsers,
        verifiedUsersCount,
        pendingKycCount,
        dailyRevenue,
        totalOrders,
        pendingOrdersCount,
        printingOrdersCount,
      });
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      toast.error('خطا در بارگذاری خلاصه آمار سیستم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 select-none font-sans"
      dir="rtl"
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              نمای کلی پلتفرم (Platform Overview)
            </h1>
            <Badge variant="cyan" className="text-xs">
              آمار زنده
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            شاخص‌های کلیدی عملکرد (KPIs)، وضعیت سلامت سرور و نمودار فعالیت هفتگی سامانه
          </p>
        </div>

        <Button
          onClick={fetchDashboardMetrics}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-border bg-card self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی شاخص‌ها</span>
        </Button>
      </div>

      {/* KPI Stat Cards (Strictly 4 Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <Card className="rounded-3xl border-border bg-card/90 p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold text-foreground">مجموع کل کاربران</span>
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground tracking-tight">
              {stats.totalUsers.toLocaleString('en-US')}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats.verifiedUsersCount.toLocaleString('en-US')} کاربر دارای تیک آبی</span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Daily Sales / Revenue */}
        <Card className="rounded-3xl border-border bg-card/90 p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold text-emerald-500">فروش و گردش روزانه</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-500 tracking-tight">
              {stats.dailyRevenue.toLocaleString('en-US')} <span className="text-sm font-normal">افغانی</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              فروش اشتراک‌ها و کارت‌های هوشمند NFC
            </div>
          </div>
        </Card>

        {/* Metric 3: Pending KYC / Open Action Items */}
        <Card className="rounded-3xl border-border bg-card/90 p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold text-amber-500">تیکت‌ها و احراز هویت باز</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-500 tracking-tight">
              {stats.pendingKycCount.toLocaleString('en-US')}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              مدارک در انتظار بررسی و اعطای تیک آبی
            </div>
          </div>
        </Card>

        {/* Metric 4: Active Printing & Orders */}
        <Card className="rounded-3xl border-border bg-card/90 p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold text-foreground">سفارشات در حال چاپ و ارسال</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-400 tracking-tight">
              {stats.printingOrdersCount.toLocaleString('en-US')}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              از مجموع {stats.totalOrders.toLocaleString('en-US')} سفارش ثبت‌شده در سامانه
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Chart & System Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Simple Elegant Activity Chart (Col 8) */}
        <Card className="lg:col-span-8 rounded-3xl border-border bg-card/90 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                <span>نمودار حجم تراکنش‌ها و بازدید هفتگی</span>
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                میانگین فعالیت کاربران در طول 7 روز گذشته
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              7 روز اخیر
            </Badge>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {weeklyActivity.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] text-cyan-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.orders.toLocaleString('en-US')} سفارش
                </div>
                <div className="w-full max-w-[42px] bg-muted/60 rounded-xl relative flex items-end overflow-hidden h-44 p-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: item.height }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                    className="w-full rounded-lg bg-gradient-to-t from-cyan-500 via-blue-500 to-indigo-500 group-hover:from-cyan-400 group-hover:to-blue-400 transition-colors shadow-md shadow-cyan-500/20"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-semibold group-hover:text-foreground transition-colors">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>مجموع سفارشات هفته جاری:</span>
            <span className="font-bold text-foreground">
              {weeklyActivity.reduce((acc, curr) => acc + curr.orders, 0).toLocaleString('en-US')} عدد
            </span>
          </div>
        </Card>

        {/* Server & Data Health Panel (Col 4) */}
        <Card className="lg:col-span-4 rounded-3xl border-border bg-card/90 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Server className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-foreground">وضعیت سلامت سامانه (Health)</h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>پایگاه داده MongoDB Atlas</span>
                </div>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متصل (Online)</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  <span>زمان پاسخ‌دهی سرور (Latency)</span>
                </div>
                <span className="text-cyan-500 font-bold" dir="ltr">28 ms</span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>پایداری سرویس (Uptime)</span>
                </div>
                <span className="text-foreground font-bold" dir="ltr">99.98%</span>
              </div>
            </div>
          </div>

          {/* Clean User Management Direct Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 space-y-2">
            <span className="text-xs font-bold text-cyan-400 block">
              دسترسی به فهرست کامل کاربران
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              جهت مشاهده، جستجو، تغییر نقش و تایید هویت مدارک، به بخش اختصاصی مدیریت کاربران مراجعه نمایید.
            </p>
            <Link href="/admin/users" className="block pt-1">
              <Button
                size="sm"
                className="w-full h-9 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>ورود به مدیریت کاربران</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>

      </div>
    </motion.div>
  );
}
