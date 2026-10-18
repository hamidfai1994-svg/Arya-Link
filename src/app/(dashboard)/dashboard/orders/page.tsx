'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  ChevronDown,
  Loader2,
  RefreshCw,
  Eye,
  Plus,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  orderStatus: 'completed' | 'processing' | 'pending' | 'cancelled';
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedCount: 0,
    pendingCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setOrders(json.orders || []);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('خطا در بارگذاری سفارشات');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="text-[11px] flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>تکمیل شده</span>
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="warning" className="text-[11px] flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" />
            <span>در حال پردازش</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-[11px] flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3" />
            <span>در انتظار تایید</span>
          </Badge>
        );
      case 'cancelled':
      default:
        return (
          <Badge variant="destructive" className="text-[11px] flex items-center gap-1 font-semibold">
            <XCircle className="w-3 h-3" />
            <span>لغو شده</span>
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') {
      return (
        <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          پرداخت شده
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
        در انتظار واریز
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.productTitle.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              سفارشات محصولات و خدمات
            </h1>
            <Badge variant="cyan" className="font-outfit text-xs">
              فروشگاه هوشمند
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            مدیریت خریدهای ثبت شده توسط مشتریان از طریق ماژول «محصول و پرداخت آنلاین» در کارت شما
          </p>
        </div>

        <Button
          onClick={fetchOrders}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-border bg-card self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs">بروزرسانی لیست</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground block mb-2">
            مجموع درآمد فروش
          </span>
          <div className="text-2xl font-black font-outfit text-emerald-500 tracking-tight">
            {stats.totalRevenue.toLocaleString('fa-IR')}{' '}
            <span className="text-xs text-muted-foreground font-sans">افغانی</span>
          </div>
        </Card>

        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground block mb-2">
            کل سفارشات ثبت شده
          </span>
          <div className="text-2xl font-black font-outfit text-foreground tracking-tight">
            {stats.totalOrders.toLocaleString('fa-IR')}
          </div>
        </Card>

        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground block mb-2">
            سفارشات تکمیل شده
          </span>
          <div className="text-2xl font-black font-outfit text-cyan-500 tracking-tight">
            {stats.completedCount.toLocaleString('fa-IR')}
          </div>
        </Card>

        <Card className="rounded-3xl border-border bg-card/80 p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground block mb-2">
            در حال پردازش / انتظار
          </span>
          <div className="text-2xl font-black font-outfit text-amber-500 tracking-tight">
            {stats.pendingCount.toLocaleString('fa-IR')}
          </div>
        </Card>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Input
            type="text"
            placeholder="جستجوی شماره سفارش، مشتری، محصول..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-xl bg-card/60 border-border pr-9 text-xs"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'همه سفارشات' },
            { id: 'completed', label: 'تکمیل شده' },
            { id: 'processing', label: 'در حال پردازش' },
            { id: 'pending', label: 'در انتظار' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-background text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card className="rounded-3xl border-border bg-card/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <span className="text-xs">در حال بارگذاری لیست سفارشات...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-foreground">هیچ سفارشی یافت نشد</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              برای فروش محصول در کارت دیجیتال، از بخش ویرایشگر ماژول «پرداخت و سفارش مستقیم» را اضافه کنید.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-right font-bold text-xs">شماره سفارش</TableHead>
                  <TableHead className="text-right font-bold text-xs">مشتری</TableHead>
                  <TableHead className="text-right font-bold text-xs">محصول / سرویس</TableHead>
                  <TableHead className="text-right font-bold text-xs">مبلغ کل</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت پرداخت</TableHead>
                  <TableHead className="text-right font-bold text-xs">وضعیت سفارش</TableHead>
                  <TableHead className="text-right font-bold text-xs">تاریخ</TableHead>
                  <TableHead className="text-center font-bold text-xs">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <TableRow key={order.id} className="border-border hover:bg-muted/40 transition-colors">
                      {/* Order Number */}
                      <TableCell className="font-outfit font-bold text-xs text-cyan-500">
                        {order.orderNumber}
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <div className="text-xs font-bold text-foreground">{order.customerName}</div>
                        <div className="text-[11px] text-muted-foreground font-outfit" dir="ltr">
                          {order.customerEmail}
                        </div>
                      </TableCell>

                      {/* Product */}
                      <TableCell>
                        <div className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                          {order.productTitle}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          تعداد: {order.quantity} عدد
                        </div>
                      </TableCell>

                      {/* Total Price */}
                      <TableCell className="font-outfit font-black text-xs text-foreground">
                        {order.totalPrice.toLocaleString('fa-IR')}{' '}
                        <span className="text-[10px] text-muted-foreground font-sans">{order.currency}</span>
                      </TableCell>

                      {/* Payment Status */}
                      <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>

                      {/* Order Status */}
                      <TableCell>{getOrderStatusBadge(order.orderStatus)}</TableCell>

                      {/* Date */}
                      <TableCell className="text-xs text-muted-foreground">{dateStr}</TableCell>

                      {/* Action */}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 px-2.5 rounded-lg text-xs hover:bg-muted flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-500" />
                          <span>جزئیات</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-cyan-500" />
              <span>جزئیات سفارش {selectedOrder?.orderNumber}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              اطلاعات کامل خرید و تماس مشتری
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-3.5 py-2 text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 space-y-2 border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نام مشتری:</span>
                  <span className="font-bold text-foreground">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ایمیل:</span>
                  <span className="font-outfit text-foreground" dir="ltr">{selectedOrder.customerEmail}</span>
                </div>
                {selectedOrder.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تلفن تماس:</span>
                    <span className="font-outfit text-foreground" dir="ltr">{selectedOrder.customerPhone}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 space-y-2 border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">محصول / خدمت:</span>
                  <span className="font-bold text-foreground">{selectedOrder.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تعداد:</span>
                  <span className="font-bold text-foreground">{selectedOrder.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">قیمت واحد:</span>
                  <span className="font-bold text-foreground">{selectedOrder.unitPrice.toLocaleString('fa-IR')} {selectedOrder.currency}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-bold">
                  <span>مبلغ پرداختی کل:</span>
                  <span className="text-emerald-500 font-black font-outfit text-sm">
                    {selectedOrder.totalPrice.toLocaleString('fa-IR')} {selectedOrder.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-muted-foreground">درگاه پرداخت:</span>
                <span className="font-bold text-cyan-500">{selectedOrder.paymentMethod}</span>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] border border-cyan-500/20">
                  <span className="font-bold block mb-0.5">یادداشت سفارش:</span>
                  {selectedOrder.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
