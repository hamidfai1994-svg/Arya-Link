'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Smartphone,
  Store,
  Building,
  Coins,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';

export interface RevenueGatewayItem {
  id: string;
  label: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  mode?: string;
}

interface RevenueByGatewayChartProps {
  data: RevenueGatewayItem[];
  totalRevenue?: number;
  title?: string;
  subtitle?: string;
}

export const RevenueByGatewayChart: React.FC<RevenueByGatewayChartProps> = ({
  data = [],
  totalRevenue,
  title = 'درآمد به تفکیک درگاه پرداخت',
  subtitle = 'تفکیک دقیق مبالغ دریافتی بر اساس درگاه‌های آنلاین (API) و روش‌های واریز دستی/صراف',
}) => {
  const calculatedTotal =
    typeof totalRevenue === 'number'
      ? totalRevenue
      : data.reduce((sum, item) => sum + (item.amount || 0), 0);

  const getIcon = (id: string) => {
    if (id.includes('hesabpay_api')) return Smartphone;
    if (id.includes('hesabpay_manual')) return Store;
    if (id.includes('bank')) return Building;
    if (id.includes('crypto')) return Coins;
    if (id.includes('hawala')) return Store;
    return CreditCard;
  };

  const hasData = data.length > 0 && calculatedTotal > 0;

  return (
    <Card className="p-6 rounded-3xl bg-card/80 backdrop-blur-xl border border-border shadow-sm space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/25 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground">{title}</h3>
              <Badge variant="cyan" className="text-[10px] font-sans">
                Real-Time
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted-foreground">مجموع کل:</span>
          <span className="font-sans font-extrabold text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20" dir="ltr">
            {calculatedTotal.toLocaleString('en-US')} AFN
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="py-10 text-center space-y-2">
          <CreditCard className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">هنوز تراکنش موفقی در این بازه زمانی ثبت نشده است</p>
          <p className="text-[11px] text-muted-foreground/80 max-w-sm mx-auto">
            به محض ثبت اولین تراکنش یا سفارش کارت، سهم هر درگاه (مستقیم آنلاین یا صراف) به صورت آماری در این بخش نمایش داده خواهد شد.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Proportional Stacked Multi-Color Segment Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted/60 p-0.5 gap-0.5 shadow-inner">
              {data.map((item) => {
                if (item.percentage <= 0) return null;
                return (
                  <div
                    key={item.id}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full first:rounded-r-full last:rounded-l-full transition-all duration-500 hover:brightness-110"
                    title={`${item.label}: ${item.percentage}% (${item.amount.toLocaleString('en-US')} AFN)`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>سهم درگاه‌ها از کل درآمد</span>
              <span>100٪ حجم ورودی</span>
            </div>
          </div>

          {/* Cards Grid for Each Gateway */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((item) => {
              const Icon = getIcon(item.id);
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 hover:border-border transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}1a`, color: item.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-foreground truncate block">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-lg font-bold font-sans shrink-0"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {item.count} تراکنش
                    </span>
                    <span className="font-sans font-bold text-foreground" dir="ltr">
                      {item.amount.toLocaleString('en-US')} AFN
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
export default RevenueByGatewayChart;

