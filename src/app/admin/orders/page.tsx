'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Zap,
  Edit,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  X,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Trash2,
  Copy,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminOrder {
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
  orderStatus:
    | 'pending_payment'
    | 'processing'
    | 'nfc_writing'
    | 'shipping'
    | 'delivered'
    | 'cancelled'
    | 'completed'
    | 'printing'
    | 'shipped'
    | 'pending';
  paymentMethod: string;
  trackingNumber?: string;
  trackingShortCode?: string;
  provisionedBy?: string;
  provisionedAt?: string;
  physicalCard?: {
    id: string;
    shortCode: string;
    scansCount: number;
    status: string;
    provisionedBy?: string;
    provisionedAt?: string;
  } | null;
  cardSpecs?: {
    material?: string;
    templateId?: string;
    templateName?: string;
    orientation?: 'horizontal' | 'vertical';
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    companyName?: string;
    logoUrl?: string;
    finishAccent?: string;
    cardUrl?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingCount: 0,
    printingCount: 0,
    shippedCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination state (Strictly English numbers)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [modalOrderStatus, setModalOrderStatus] = useState<string>('pending');
  const [modalTrackingNumber, setModalTrackingNumber] = useState<string>('');
  const [modalAdminNotes, setModalAdminNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);

  // Soft Delete Modal State
  const [orderToDelete, setOrderToDelete] = useState<AdminOrder | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    if (!deleteReason.trim()) {
      toast.error('ثبت دلیل حذف الزامی است.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderToDelete.id,
          reason: deleteReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setOrderToDelete(null);
        setDeleteReason('');
        fetchOrders();
      } else {
        toast.error(data.message || 'خطا در حذف سفارش.');
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch all orders across platform (Structure for receiving real data)
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders?all=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (data.stats) {
          setStats(data.stats);
        } else {
          const totalRevenue = data.orders
            .filter((o: any) => o.paymentStatus === 'paid')
            .reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
          setStats({
            totalOrders: data.orders.length,
            totalRevenue,
            pendingCount: data.orders.filter((o: any) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length,
            printingCount: data.orders.filter((o: any) => o.orderStatus === 'printing').length,
            shippedCount: data.orders.filter((o: any) => o.orderStatus === 'shipped' || o.orderStatus === 'completed').length,
          });
        }
      } else {
        setOrders([]);
        setStats({ totalOrders: 0, totalRevenue: 0, pendingCount: 0, printingCount: 0, shippedCount: 0 });
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      setOrders([]);
      setStats({ totalOrders: 0, totalRevenue: 0, pendingCount: 0, printingCount: 0, shippedCount: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminOrders = fetchOrders;

  useEffect(() => {
    fetchOrders();
  }, []);

  // Open modal for details & status change
  const handleOpenModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setModalOrderStatus(order.orderStatus);
    setModalTrackingNumber(order.trackingNumber || '');
    setModalAdminNotes(order.notes || '');
  };

  // Submit status update
  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          orderStatus: modalOrderStatus,
          trackingNumber: modalTrackingNumber,
          notes: modalAdminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'خطا در تغییر وضعیت سفارش.');
      }

      toast.success(`وضعیت سفارش ${selectedOrder.orderNumber} با موفقیت به‌روز شد.`);
      setSelectedOrder(null);
      await loadAdminOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'خطا در برقراری ارتباط.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick inline status transition
  const handleQuickStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success('وضعیت سفارش تغییر یافت.');
      await loadAdminOrders();
    } catch (err: any) {
      toast.error(err.message || 'خطا در تغییر وضعیت.');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(searchQuery)) ||
      (o.trackingShortCode && o.trackingShortCode.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending_payment') {
      return o.orderStatus === 'pending_payment' || o.orderStatus === 'pending';
    }
    if (statusFilter === 'processing') {
      return o.orderStatus === 'processing' || o.orderStatus === 'printing';
    }
    if (statusFilter === 'nfc_writing') {
      return o.orderStatus === 'nfc_writing';
    }
    if (statusFilter === 'shipping') {
      return o.orderStatus === 'shipping' || o.orderStatus === 'shipped';
    }
    if (statusFilter === 'delivered') {
      return o.orderStatus === 'delivered' || o.orderStatus === 'completed';
    }
    if (statusFilter === 'cancelled') {
      return o.orderStatus === 'cancelled';
    }
    return o.orderStatus === statusFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // NFC Provisioning action
  const handleConfirmProvision = async () => {
    if (!selectedOrder) return;
    setIsProvisioning(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          action: 'confirm_provision',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'خطا در تایید و فعال‌سازی رایت کارت.');
      }

      toast.success(data.message || 'رایت کارت NFC با موفقیت تایید شد و به وضعیت ارسال با پیک تغییر یافت.');
      setModalOrderStatus('shipping');
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: 'shipping',
              trackingShortCode: data.physicalCard?.shortCode || prev.trackingShortCode,
              physicalCard: data.physicalCard || prev.physicalCard,
            }
          : null
      );
      await loadAdminOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'خطای سرور در تایید رایت کارت.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const currentShortCode =
    selectedOrder?.trackingShortCode ||
    selectedOrder?.physicalCard?.shortCode ||
    (selectedOrder?.id ? selectedOrder.id.slice(-6).toUpperCase() : 'X9B2V1');

  const trackerUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/t/${currentShortCode}`
      : `https://aryal.ink/t/${currentShortCode}`;

  const handleCopyTrackerLink = () => {
    navigator.clipboard.writeText(trackerUrl);
    toast.success('لینک ردیاب نامرئی در حافظه کپی شد.', {
      description: trackerUrl,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-1 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-600 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            مدیریت کل سفارشات کارتهای هوشمند NFC
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مشاهده سفارشات مشتریان، نظارت بر خط تولید و تغییر وضعیت سفارشات به «در حال چاپ» و «ارسال شده».
          </p>
        </div>

        <Button
          variant="outline"
          onClick={loadAdminOrders}
          disabled={isLoading}
          className="h-10 px-4 rounded-xl border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-2"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          <span>به‌روزرسانی داده‌ها</span>
        </Button>
      </div>

      {/* Metric Cards (Strictly English numbers based dynamically on real orders) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">کل سفارشات</span>
          <span className="text-xl font-black text-white font-sans mt-1 block">
            {orders.length.toLocaleString('en-US')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-[11px] font-semibold text-amber-400 block">در انتظار پرداخت</span>
          <span className="text-xl font-black text-amber-400 font-sans mt-1 block">
            {orders
              .filter((o) => o.orderStatus === 'pending_payment' || o.orderStatus === 'pending')
              .length.toLocaleString('en-US')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[11px] font-semibold text-cyan-400 block">آماده‌سازی و چاپ</span>
          <span className="text-xl font-black text-cyan-400 font-sans mt-1 block">
            {orders
              .filter((o) => o.orderStatus === 'processing' || o.orderStatus === 'printing')
              .length.toLocaleString('en-US')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <span className="text-[11px] font-semibold text-blue-400 block">رایت کارت NFC</span>
          <span className="text-xl font-black text-blue-400 font-sans mt-1 block">
            {orders.filter((o) => o.orderStatus === 'nfc_writing').length.toLocaleString('en-US')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <span className="text-[11px] font-semibold text-purple-400 block">ارسال با پیک / پست</span>
          <span className="text-xl font-black text-purple-400 font-sans mt-1 block">
            {orders
              .filter((o) => o.orderStatus === 'shipping' || o.orderStatus === 'shipped')
              .length.toLocaleString('en-US')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-400 block">مجموع عواید فروش</span>
          <span className="text-xl font-black text-emerald-400 font-sans mt-1 block">
            {orders
              .filter((o) => o.paymentStatus === 'paid')
              .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
              .toLocaleString('en-US')}{' '}
            AFN
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو با شماره سفارش، نام یا کد ردیاب..."
            className="pr-9 pl-3 h-10 bg-slate-950/60 border-slate-800 text-xs rounded-xl text-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'همه سفارشات' },
            { id: 'pending_payment', label: 'در انتظار پرداخت' },
            { id: 'processing', label: 'آماده‌سازی و چاپ' },
            { id: 'nfc_writing', label: 'رایت کارت NFC' },
            { id: 'shipping', label: 'ارسال با پیک' },
            { id: 'delivered', label: 'تحویل شد' },
            { id: 'cancelled', label: 'لغو شده' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
                statusFilter === pill.id
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">شماره سفارش</th>
                <th className="p-4 font-semibold">مشتری</th>
                <th className="p-4 font-semibold">مدل و متریال کارت</th>
                <th className="p-4 font-semibold">مبلغ</th>
                <th className="p-4 font-semibold">وضعیت کنونی</th>
                <th className="p-4 font-semibold">کد رهگیری پست</th>
                <th className="p-4 font-semibold">تاریخ</th>
                <th className="p-4 font-semibold text-center">عملیات ادمین</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-7 h-7 opacity-70" />
                      </div>
                      <p className="text-sm font-bold text-white">
                        تا کنون هیچ سفارشی در سیستم ثبت نگردیده است.
                      </p>
                      <p className="text-xs text-slate-400 max-w-md">
                        کلیه سفارش‌های جدید کاربران برای کارت‌های فیزیکی هوشمند NFC بلافاصله پس از ثبت در این جدول قابل مدیریت خواهند بود.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 text-xs">
                    موردی مطابق با جستجوی شما یافت نشد.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-sans font-bold text-cyan-400">
                        {order.orderNumber}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]" dir="ltr">
                          {order.customerPhone || order.customerEmail}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {order.cardSpecs?.templateName || order.productTitle}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.cardSpecs?.material || 'NFC Smart Card'}
                        </div>
                      </td>

                      <td className="p-4 font-bold text-white">
                        {order.totalPrice.toLocaleString('en-US')} AFN
                      </td>

                      <td className="p-4">
                        {order.orderStatus === 'pending_payment' || order.orderStatus === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            <span>در انتظار پرداخت</span>
                          </span>
                        ) : order.orderStatus === 'processing' || order.orderStatus === 'printing' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Package className="w-3 h-3" />
                            <span>آماده‌سازی و چاپ</span>
                          </span>
                        ) : order.orderStatus === 'nfc_writing' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
                            <Zap className="w-3 h-3" />
                            <span>رایت کارت NFC</span>
                          </span>
                        ) : order.orderStatus === 'shipping' || order.orderStatus === 'shipped' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Truck className="w-3 h-3" />
                            <span>ارسال با پیک</span>
                          </span>
                        ) : order.orderStatus === 'delivered' || order.orderStatus === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تحویل شد</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <X className="w-3 h-3" />
                            <span>لغو شده</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-slate-400" dir="ltr">
                        {order.trackingNumber || order.trackingShortCode || '-'}
                      </td>

                      <td className="p-4 text-[11px] text-slate-400 font-sans">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(order)}
                            className="h-8 px-2.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>مدیریت</span>
                          </Button>

                          {/* Quick Transitions */}
                          {(order.orderStatus === 'pending_payment' || order.orderStatus === 'pending') && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.id, 'processing')}
                              title="تایید پرداخت و ارسال به خط چاپ"
                              className="px-2 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 whitespace-nowrap"
                            >
                              ارسال به چاپ
                            </button>
                          )}

                          {(order.orderStatus === 'processing' || order.orderStatus === 'printing') && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.id, 'nfc_writing')}
                              title="چاپ تکمیل شد، انتقال به رایت NFC"
                              className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 whitespace-nowrap"
                            >
                              رایت NFC
                            </button>
                          )}

                          {order.orderStatus === 'nfc_writing' && (
                            <button
                              type="button"
                              onClick={() => handleOpenModal(order)}
                              title="باز کردن مدیریت رایت چیپست"
                              className="px-2 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 whitespace-nowrap animate-pulse"
                            >
                              مدیریت رایت
                            </button>
                          )}

                          {(order.orderStatus === 'shipping' || order.orderStatus === 'shipped') && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.id, 'delivered')}
                              title="تایید نهایی تحویل به مشتری"
                              className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 whitespace-nowrap"
                            >
                              تحویل شد
                            </button>
                          )}

                          {/* Soft Delete Trigger */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setOrderToDelete(order);
                              setDeleteReason('');
                            }}
                            className="h-8 px-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 text-xs flex items-center gap-1"
                            title="حذف ایمن سفارش و انتقال به زباله‌دان"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="p-4 border-t border-slate-800">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              itemLabel="سفارش"
            />
          </div>
        )}
      </div>

      {/* Order Management & Status Controller Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-base font-bold text-white flex items-center justify-between">
              <span>مدیریت سفارش {selectedOrder?.orderNumber}</span>
              <span className="font-sans text-cyan-400 text-sm">
                {selectedOrder?.totalPrice.toLocaleString()} AFN
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              مشخصات کامل کارت و کنترل وضعیت سفارش در زنجیره تولید و توزیع.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <form onSubmit={handleUpdateOrderStatus} className="space-y-5 pt-3">
              {/* Specs Overview Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">خریدار:</span>
                    <span className="font-semibold text-white">{selectedOrder.customerName}</span>
                    <div className="text-[10px] font-sans text-slate-400" dir="ltr">{selectedOrder.customerPhone}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">مدل کارت:</span>
                    <span className="font-semibold text-cyan-400">
                      {selectedOrder.cardSpecs?.templateName || selectedOrder.productTitle}
                    </span>
                    <div className="text-[10px] text-slate-400">{selectedOrder.cardSpecs?.material}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[11px]">اطلاعات درج‌شده روی کارت:</span>
                    <span className="text-white">
                      {selectedOrder.cardSpecs?.firstName} {selectedOrder.cardSpecs?.lastName}
                    </span>
                    <div className="text-[10px] text-slate-400">{selectedOrder.cardSpecs?.jobTitle}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">آدرس لینک چیپ NFC:</span>
                    <a
                      href={selectedOrder.cardSpecs?.cardUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="font-sans text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                      dir="ltr"
                    >
                      <span>{selectedOrder.cardSpecs?.cardUrl || 'aryal.ink'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">آدرس پستی و توضیحات تحویل:</span>
                  <p className="text-slate-200 mt-0.5 leading-relaxed">{selectedOrder.notes}</p>
                </div>
              </div>

              {/* Status Selector Controller */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  تغییر وضعیت سفارش (فوراً در تایم‌لاین کاربر منعکس می‌شود):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'pending_payment', label: 'در انتظار پرداخت', color: 'border-amber-500 text-amber-400' },
                    { id: 'processing', label: 'آماده‌سازی و چاپ', color: 'border-cyan-500 text-cyan-400' },
                    { id: 'nfc_writing', label: 'رایت کارت NFC', color: 'border-blue-500 text-blue-400' },
                    { id: 'shipping', label: 'ارسال با پیک', color: 'border-purple-500 text-purple-400' },
                    { id: 'delivered', label: 'تحویل شد', color: 'border-emerald-500 text-emerald-400' },
                    { id: 'cancelled', label: 'لغو شده', color: 'border-rose-500 text-rose-400' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setModalOrderStatus(s.id)}
                      className={cn(
                        'py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center',
                        modalOrderStatus === s.id
                          ? `bg-slate-800 ${s.color} shadow-sm ring-1 ring-cyan-500/50`
                          : 'bg-black/30 border-slate-800 text-slate-400 hover:text-white'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NFC Writing & Provisioning Box (When in nfc_writing or order is in nfc_writing) */}
              {(modalOrderStatus === 'nfc_writing' || selectedOrder.orderStatus === 'nfc_writing') && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-blue-950/40 border border-cyan-500/40 shadow-xl shadow-cyan-500/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>مدیریت رایت چیپست هوشمند NFC</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-sans">
                            {currentShortCode}
                          </span>
                        </h4>
                        <p className="text-[11px] text-cyan-300/80 mt-0.5">
                          لینک ردیاب نامرئی اختصاصی جهت رایت روی چیپست سخت‌افزاری کارت
                        </p>
                      </div>
                    </div>

                    {selectedOrder.physicalCard?.scansCount !== undefined && (
                      <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30 self-start sm:self-auto">
                        اسکن فیزیکی: {selectedOrder.physicalCard.scansCount} بار
                      </span>
                    )}
                  </div>

                  {/* Big Tracking URL */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      آدرس ردیاب نامرئی (Unique Tracking Link):
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div
                        className="flex-1 bg-black/70 border border-cyan-500/40 rounded-xl px-4 py-3 text-center font-mono font-black text-cyan-400 text-base sm:text-lg tracking-wider select-all break-all"
                        dir="ltr"
                      >
                        {trackerUrl}
                      </div>
                      <Button
                        type="button"
                        onClick={handleCopyTrackerLink}
                        className="h-11 sm:h-12 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                        <span>کپی لینک برای رایت</span>
                      </Button>
                    </div>
                  </div>

                  {/* Green Confirm Provisioning Button */}
                  <div className="pt-1">
                    <Button
                      type="button"
                      disabled={isProvisioning}
                      onClick={handleConfirmProvision}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isProvisioning
                          ? 'در حال ثبت و فعال‌سازی...'
                          : 'تأیید رایت و فعال‌سازی (انتقال به ارسال با پیک)'}
                      </span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Tracking Number Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  کد رهگیری پست اکسپرس:
                </label>
                <Input
                  type="text"
                  value={modalTrackingNumber}
                  onChange={(e) => setModalTrackingNumber(e.target.value)}
                  placeholder="مثال: EXP-AF-98214"
                  dir="ltr"
                  className="h-10 bg-black/40 border-slate-800 text-xs font-sans text-white rounded-xl"
                />
              </div>

              {/* Admin Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  یادداشت و آدرس تحویل:
                </label>
                <Input
                  type="text"
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  className="h-10 bg-black/40 border-slate-800 text-xs text-white rounded-xl"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="h-10 px-4 rounded-xl text-xs border-slate-700 text-slate-300"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="h-10 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  {isUpdating ? 'در حال ثبت...' : 'ذخیره و اعمال در تایم‌لاین کاربر'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Mandatory Reason Soft Delete Modal */}
      <Dialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-slate-950 border-slate-800 text-white" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>حذف امن سفارش و انتقال به زباله‌دان</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              سفارش #{orderToDelete?.orderNumber} برای «{orderToDelete?.customerName}» به ارزش {orderToDelete?.totalPrice.toLocaleString('en-US')} AFN به زباله‌دان سیستم منتقل خواهد شد.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                طبق دستورالعمل‌های امنیتی، درج <strong>دلیل اجباری حذف</strong> برای ثبت در لاگ حسابرسی (Audit Log) پلتفرم الزامی می‌باشد.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                دلیل حذف سفارش <span className="text-rose-500">*</span>:
              </label>
              <Input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="مثال: لغو به درخواست مشتری، ثبت تکراری، یا عدم تایید هویت..."
                className="h-11 rounded-2xl bg-slate-900 border-slate-800 text-xs text-white placeholder:text-slate-500"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="h-10 px-4 rounded-xl text-xs border-slate-800 bg-slate-900 text-slate-300"
              >
                انصراف
              </Button>
              <Button
                type="button"
                disabled={isDeleting || !deleteReason.trim()}
                onClick={handleConfirmDelete}
                className="h-10 px-5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>تایید حذف و ثبت در لاگ امنیتی</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
