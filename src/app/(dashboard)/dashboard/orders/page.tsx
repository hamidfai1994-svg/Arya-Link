'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Package,
  Layers,
  Zap,
  RotateCw,
  Edit3,
  Lock,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Upload,
  AlertCircle,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Calendar,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PaginationBar } from '@/components/ui/pagination-bar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// =========================================================================
// 1. DATA MODELS & TIMELINE HELPER (Strictly English numbers, Formal Dari)
// =========================================================================

interface OrderCardSpecs {
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
  customArtworkFront?: string;
  customArtworkBack?: string;
}

interface UserOrder {
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
  orderStatus: 'completed' | 'processing' | 'printing' | 'shipped' | 'pending' | 'cancelled';
  paymentMethod: string;
  trackingNumber?: string;
  cardSpecs?: OrderCardSpecs;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

function getTimelineMilestones(orderStatus: string, trackingNumber?: string) {
  const isPending = orderStatus === 'pending' || orderStatus === 'processing';
  const isPrinting = orderStatus === 'printing';
  const isShipped = orderStatus === 'shipped';
  const isCompleted = orderStatus === 'completed';

  return [
    {
      step: 1,
      title: 'ثبت و بررسی اولیه سفارش (Under Review)',
      desc: 'بررسی مشخصات ظاهری کارت، آدرس ارسال و اعتبارسنجی پرداخت.',
      status: isPending ? 'current' : 'completed',
      dateText: 'تکمیل شده',
      badge: 'در حال بررسی',
    },
    {
      step: 2,
      title: 'کدگذاری چیپست NFC و چاپ فیزیکی (Printing & NFC Encoding)',
      desc: 'کدگذاری ماژول امن NTAG216، پوشش متالیک و چاپ صنعتی کارت.',
      status: isPrinting ? 'current' : isShipped || isCompleted ? 'completed' : 'upcoming',
      dateText: isPrinting ? 'در حال انجام' : isShipped || isCompleted ? 'تکمیل شده' : 'در انتظار',
      badge: 'در حال چاپ',
    },
    {
      step: 3,
      title: 'بسته‌بندی امن و تحویل به پست اکسپرس (Dispatched & Shipped)',
      desc: trackingNumber
        ? `بسته‌بندی در قاب لوکس و ارسال. کد رهگیری: ${trackingNumber}`
        : 'بسته‌بندی اختصاصی پلمپ‌شده و صدور بارنامه پست اکسپرس افغانستان.',
      status: isShipped ? 'current' : isCompleted ? 'completed' : 'upcoming',
      dateText: isShipped ? 'در مسیر تحویل' : isCompleted ? 'تکمیل شده' : 'در انتظار',
      badge: 'ارسال شده',
    },
    {
      step: 4,
      title: 'تحویل نهایی به مشتری (Delivered)',
      desc: 'تحویل بسته به شخص تحویل‌گیرنده در ولایت و آدرس مقصد.',
      status: isCompleted ? 'completed' : 'upcoming',
      dateText: isCompleted ? 'تحویل شد' : '2 الی 4 روز کاری',
      badge: 'تکمیل سفارش',
    },
  ];
}

// =========================================================================
// 2. MAIN USER DASHBOARD COMPONENT (MASTER-DETAIL PATTERN)
// =========================================================================

function OrdersDashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Orders list
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Master-Detail Navigation: selectedOrderId = null (Master View) | string (Detail View)
  const initialOrderId = searchParams.get('orderId');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrderId || null);

  // View Mode: 'grid' | 'compact' | 'detailed' (Default is compact as per requirements)
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'detailed'>('compact');

  // Real-time search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state (Strictly English numbers)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Detail View Inline Tab: 'timeline' | 'specs'
  const [detailTab, setDetailTab] = useState<'timeline' | 'specs'>('timeline');

  // 3D Card Simulation Flip state
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  // Edit Card Specs Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    companyName: '',
    logoUrl: '',
    finishAccent: 'gold',
    notes: '',
  });
  const [isUpdatingSpecs, setIsUpdatingSpecs] = useState<boolean>(false);

  // Filtered orders based on search query
  const filteredOrders = React.useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const orderNumberMatch = (order.orderNumber || '').toLowerCase().includes(query);
      const nameMatch =
        (order.customerName || '').toLowerCase().includes(query) ||
        (order.cardSpecs?.firstName || '').toLowerCase().includes(query) ||
        (order.cardSpecs?.lastName || '').toLowerCase().includes(query);
      const productMatch =
        (order.productTitle || '').toLowerCase().includes(query) ||
        (order.cardSpecs?.material || '').toLowerCase().includes(query) ||
        (order.cardSpecs?.templateName || '').toLowerCase().includes(query);

      const statusMap: Record<string, string[]> = {
        pending: ['pending', 'در حال بررسی', 'بررسی', 'پرداخت شده'],
        processing: ['processing', 'در حال پردازش', 'پردازش'],
        printing: ['printing', 'در حال چاپ', 'چاپ', 'کدگذاری'],
        shipped: ['shipped', 'ارسال شده', 'ارسال', 'پست'],
        completed: ['completed', 'تکمیل', 'تحویل', 'موفق'],
        cancelled: ['cancelled', 'لغو شده', 'لغو'],
      };
      const statusTerms = statusMap[order.orderStatus] || [order.orderStatus];
      const statusMatch = statusTerms.some((term) => term.toLowerCase().includes(query));

      return orderNumberMatch || nameMatch || productMatch || statusMatch;
    });
  }, [orders, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Fetch orders strictly belonging to authenticated user (Data Isolation & Real State Initialization)
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = fetchOrders;

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update selected order reference
  const selectedOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) || null;

  // Open Detail View for an order
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailTab('timeline');
    setCardSide('front');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Master View (List of Orders)
  const handleBackToMaster = () => {
    setSelectedOrderId(null);
    router.replace('/dashboard/orders');
  };

  // Open Edit Modal for Card Specs
  const handleOpenEditModal = () => {
    if (!selectedOrder) return;
    const isPending = selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'processing';
    if (!isPending) {
      toast.error('امکان ویرایش وجود ندارد؛ کارت شما وارد مرحله چاپ یا ارسال شده است.');
      return;
    }

    setEditFormData({
      firstName: selectedOrder.cardSpecs?.firstName || selectedOrder.customerName.split(' ')[0] || '',
      lastName: selectedOrder.cardSpecs?.lastName || selectedOrder.customerName.split(' ').slice(1).join(' ') || '',
      jobTitle: selectedOrder.cardSpecs?.jobTitle || '',
      companyName: selectedOrder.cardSpecs?.companyName || '',
      logoUrl: selectedOrder.cardSpecs?.logoUrl || '',
      finishAccent: selectedOrder.cardSpecs?.finishAccent || 'gold',
      notes: selectedOrder.notes || '',
    });
    setIsEditModalOpen(true);
  };

  // Save Card Specs
  const handleSaveCardSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdatingSpecs(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          cardSpecs: {
            firstName: editFormData.firstName,
            lastName: editFormData.lastName,
            jobTitle: editFormData.jobTitle,
            companyName: editFormData.companyName,
            logoUrl: editFormData.logoUrl,
            finishAccent: editFormData.finishAccent,
          },
          notes: editFormData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'خطا در به‌روزرسانی مشخصات کارت.');
      }

      toast.success('مشخصات کارت با موفقیت به‌روزرسانی شد.');
      setIsEditModalOpen(false);
      await loadOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsUpdatingSpecs(false);
    }
  };

  // Logo file upload in edit modal
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیش از 5 مگابایت باشد.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Check if current order is still editable (before printing)
  const isOrderEditable =
    selectedOrder &&
    (selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'processing');

  // Stats calculation
  const pendingCount = orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
  const printingCount = orders.filter((o) => o.orderStatus === 'printing').length;
  const shippedCount = orders.filter((o) => o.orderStatus === 'shipped' || o.orderStatus === 'completed').length;

  const renderStatusBadge = (orderStatus: string) => {
    const isPending = orderStatus === 'pending' || orderStatus === 'processing';
    const isPrinting = orderStatus === 'printing';
    const isShipped = orderStatus === 'shipped';

    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
          <Clock className="w-3 h-3 animate-spin" />
          <span>در حال بررسی</span>
        </span>
      );
    }
    if (isPrinting) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 animate-pulse shrink-0">
          <Zap className="w-3 h-3" />
          <span>در حال چاپ</span>
        </span>
      );
    }
    if (isShipped) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0">
          <Truck className="w-3 h-3" />
          <span>ارسال شده</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
        <CheckCircle2 className="w-3 h-3" />
        <span>تکمیل شده</span>
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* ===================================================================
          MASTER VIEW: LIST OF USER ORDERS (When selectedOrder is null)
          =================================================================== */}
      {!selectedOrder ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 text-xs font-semibold mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>سفارشات من</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                تاریخچه و وضعیت سفارشات کارت هوشمند NFC
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                فهرست تمامی کارت‌های فیزیکی سفارش داده‌شده شما و دسترسی به پیگیری خط تولید و مشخصات کارت.
              </p>
            </div>

            {orders.length > 0 && (
              <Link href="/order">
                <Button className="h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>سفارش کارت جدید</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </Button>
              </Link>
            )}
          </div>

          {/* Orders Loading Spinner */}
          {isLoading ? (
            <div className="min-h-[320px] flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">در حال بارگذاری اطلاعات سفارشات...</span>
            </div>
          ) : orders.length === 0 ? (
            /* ===============================================================
                EMPTY STATE UI (Strictly English numbers, Formal Dari)
                =============================================================== */
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/40 dark:bg-slate-900/40 backdrop-blur-2xl p-8 sm:p-14 lg:p-16 text-center shadow-xl">
              {/* Ambient Glowing Blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Large Faint NFC Card Icon Composition */}
              <div className="relative mx-auto mb-6 w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                {/* Concentric Rings */}
                <div className="absolute inset-0 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/15 animate-ping opacity-25" />
                <div className="absolute -inset-2 rounded-full border border-cyan-500/10 dark:border-cyan-500/20" />

                {/* Central Faint Translucent Icon Container */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent dark:from-cyan-500/20 dark:via-blue-500/10 border border-cyan-500/30 flex items-center justify-center shadow-2xl shadow-cyan-500/10 backdrop-blur-md group">
                  <div className="relative">
                    <CreditCard className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-500/60 dark:text-cyan-400/70 transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/40">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Formal Dari Message */}
              <div className="relative max-w-xl mx-auto space-y-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight">
                  شما تا کنون سفارشی ثبت نکرده‌اید.
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  در حال حاضر هیچ سفارش کارت فیزیکی هوشمند NFC در حساب کاربری شما ثبت نگردیده است. با ثبت سفارش، اطلاعات تماس و کارت ویزیت هوشمند شما با یک تماس به تیلیفون همراه دیگران منتقل می‌گردد.
                </p>
              </div>

              {/* Prominent Action Button */}
              <div className="relative pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/order">
                  <Button className="h-12 sm:h-13 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 group cursor-pointer">
                    <Sparkles className="w-4 h-4 text-slate-950 transition-transform group-hover:rotate-12" />
                    <span>درخواست کارت فیزیکی NFC</span>
                    <ChevronLeft className="w-4 h-4 text-slate-950 transition-transform group-hover:-translate-x-1" />
                  </Button>
                </Link>
              </div>

              {/* NFC Features Value Props */}
              <div className="relative mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-right">
                <div className="p-4 rounded-2xl bg-background/50 dark:bg-slate-950/40 border border-border/60 backdrop-blur-md space-y-1.5 transition-colors hover:border-cyan-500/30">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">چیپست هوشمند NTAG216</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    سرعت خوانش زیر 1 ثانیه با ماندگاری اطلاعات بیش از 10 سال بدون نیاز به باطری.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-background/50 dark:bg-slate-950/40 border border-border/60 backdrop-blur-md space-y-1.5 transition-colors hover:border-cyan-500/30">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">متریال‌های لوکس و مقاوم</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    امکان سفارش در قالب پی‌وی‌سی مات مخملی، فلز ضدزنگ یا چوب طبیعی ارگانیک.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-background/50 dark:bg-slate-950/40 border border-border/60 backdrop-blur-md space-y-1.5 transition-colors hover:border-cyan-500/30">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">بسته‌بندی و ارسال سریع</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    تحویل پلمپ‌شده با بارنامه رسمی و کد رهگیری پست اکسپرس در سراسر ولایات.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Metric Overview (Strictly English numbers) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground block">کل سفارشات من</span>
                  <span className="text-xl font-black text-foreground font-sans mt-1 block">
                    {orders.length}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[11px] font-semibold text-amber-500 block">در حال بررسی</span>
                  <span className="text-xl font-black text-amber-500 font-sans mt-1 block">
                    {pendingCount}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-[11px] font-semibold text-cyan-500 block">در حال چاپ و کدگذاری</span>
                  <span className="text-xl font-black text-cyan-500 font-sans mt-1 block">
                    {printingCount}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-[11px] font-semibold text-purple-500 block">ارسال شده / تکمیل</span>
                  <span className="text-xl font-black text-purple-500 font-sans mt-1 block">
                    {shippedCount}
                  </span>
                </div>
              </div>

              {/* Search & View Mode Switcher Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border shadow-sm">
                {/* Real-time Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو بر اساس شماره سفارش (مانند ORD-1024)، نام روی کارت، متریال یا وضعیت..."
                    className="h-10 pr-10 pl-9 rounded-xl bg-background/80 border-border text-xs focus-visible:ring-1 focus-visible:ring-cyan-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                      aria-label="پاکسازی جستجو"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* View Mode Switcher Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-3.5 rounded-xl border-border bg-background hover:bg-muted text-foreground flex items-center gap-2 self-end sm:self-auto shrink-0 shadow-sm"
                    >
                      {viewMode === 'compact' && <List className="w-4 h-4 text-cyan-500" />}
                      {viewMode === 'grid' && <LayoutGrid className="w-4 h-4 text-cyan-500" />}
                      {viewMode === 'detailed' && <Layers className="w-4 h-4 text-cyan-500" />}
                      <span className="text-xs font-semibold">
                        حالت نمایش:{' '}
                        <span className="font-bold text-cyan-500">
                          {viewMode === 'compact' && 'لیست فشرده'}
                          {viewMode === 'grid' && 'شبکه‌ای'}
                          {viewMode === 'detailed' && 'لیست تفصیلی'}
                        </span>
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl border border-border">
                    <DropdownMenuItem
                      onClick={() => setViewMode('compact')}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors',
                        viewMode === 'compact' ? 'bg-cyan-500/10 text-cyan-500 font-bold' : 'hover:bg-muted'
                      )}
                    >
                      <List className="w-4 h-4" />
                      <span>لیست فشرده (پیش‌فرض)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors',
                        viewMode === 'grid' ? 'bg-cyan-500/10 text-cyan-500 font-bold' : 'hover:bg-muted'
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>شبکه‌ای (Grid View)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setViewMode('detailed')}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs cursor-pointer transition-colors',
                        viewMode === 'detailed' ? 'bg-cyan-500/10 text-cyan-500 font-bold' : 'hover:bg-muted'
                      )}
                    >
                      <Layers className="w-4 h-4" />
                      <span>لیست تفصیلی (Detailed List)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* If no search results match */}
              {filteredOrders.length === 0 ? (
                <div className="bg-card/60 backdrop-blur-md border border-border rounded-3xl p-10 text-center max-w-lg mx-auto space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto border border-border">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">هیچ سفارشی مطابق با عبارت جستجو یافت نشد</h3>
                  <p className="text-xs text-muted-foreground">
                    موردی منطبق با عبارت «{searchQuery}» در بین سفارشات شما پیدا نشد.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="rounded-xl text-xs"
                  >
                    پاکسازی فیلتر جستجو
                  </Button>
                </div>
              ) : (
                <>
                  {/* 1. GRID / CARD VIEW */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleSelectOrder(order.id)}
                      className="p-5 rounded-3xl bg-card/60 backdrop-blur-md border border-border hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between group space-y-4"
                    >
                      {/* Top Row: Order Number & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans font-bold text-xs text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                          {order.orderNumber}
                        </span>
                        {renderStatusBadge(order.orderStatus)}
                      </div>

                      {/* Middle Content: Card Details & Holder */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-cyan-500 transition-colors line-clamp-1">
                          {order.cardSpecs?.templateName || order.productTitle}
                        </h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{order.cardSpecs?.material || 'کارت فیزیکی NFC'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            نام روی کارت:{' '}
                            {order.cardSpecs?.firstName
                              ? `${order.cardSpecs.firstName} ${order.cardSpecs?.lastName || ''}`.trim()
                              : order.customerName}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-sans flex items-center gap-2 pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Price & Detail Action */}
                      <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs">
                        <div className="font-sans font-bold text-foreground text-sm">
                          {order.totalPrice.toLocaleString('en-US')} AFN
                        </div>
                        <div className="flex items-center gap-1 text-cyan-500 font-bold text-xs group-hover:-translate-x-1 transition-transform">
                          <span>مشاهده جزئیات</span>
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. COMPACT LIST VIEW */}
              {viewMode === 'compact' && (
                <div className="space-y-2">
                  {paginatedOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleSelectOrder(order.id)}
                      className="p-3.5 sm:p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border hover:border-cyan-500/40 hover:bg-muted/40 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      {/* Left: Order Number + Recipient + Template */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-sans font-bold text-xs text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20 shrink-0">
                          {order.orderNumber}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate group-hover:text-cyan-500 transition-colors">
                              {order.cardSpecs?.firstName
                                ? `${order.cardSpecs.firstName} ${order.cardSpecs?.lastName || ''}`.trim()
                                : order.customerName}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate hidden md:inline">
                              ({order.cardSpecs?.templateName || order.productTitle})
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-sans flex items-center gap-2 mt-0.5">
                            <span>{order.cardSpecs?.material || 'کارت فیزیکی NFC'}</span>
                            <span>•</span>
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Badge + Price + Action Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        {renderStatusBadge(order.orderStatus)}

                        <span className="font-sans font-bold text-xs sm:text-sm text-foreground">
                          {order.totalPrice.toLocaleString('en-US')} AFN
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-lg text-xs text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1"
                        >
                          <span>جزئیات</span>
                          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. DETAILED LIST VIEW */}
              {viewMode === 'detailed' && (
                <div className="space-y-4">
                  {paginatedOrders.map((order) => {
                    const milestones = getTimelineMilestones(order.orderStatus, order.trackingNumber);
                    const currentMilestoneIndex = milestones.findIndex((m) => m.status === 'current');
                    const activeStep =
                      currentMilestoneIndex >= 0 ? currentMilestoneIndex + 1 : order.orderStatus === 'completed' ? 4 : 1;

                    return (
                      <div
                        key={order.id}
                        onClick={() => handleSelectOrder(order.id)}
                        className="p-5 sm:p-6 rounded-3xl bg-card/70 backdrop-blur-md border border-border hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer space-y-5 group"
                      >
                        {/* Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-bold text-xs text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                                  {order.orderNumber}
                                </span>
                                <span className="text-xs text-muted-foreground font-sans">
                                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-cyan-500 transition-colors mt-1">
                                {order.cardSpecs?.templateName || order.productTitle}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            {renderStatusBadge(order.orderStatus)}
                            <span className="font-sans font-black text-base text-foreground">
                              {order.totalPrice.toLocaleString('en-US')} AFN
                            </span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                            <span className="text-[10px] text-muted-foreground block">نام روی کارت:</span>
                            <span className="font-bold text-foreground block truncate mt-0.5">
                              {order.cardSpecs?.firstName
                                ? `${order.cardSpecs.firstName} ${order.cardSpecs?.lastName || ''}`.trim()
                                : order.customerName}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                            <span className="text-[10px] text-muted-foreground block">متریال و مدل:</span>
                            <span className="font-bold text-foreground block truncate mt-0.5">
                              {order.cardSpecs?.material || 'کارت فیزیکی NFC'}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                            <span className="text-[10px] text-muted-foreground block">روش پرداخت:</span>
                            <span className="font-bold text-foreground block truncate mt-0.5">
                              {order.paymentMethod === 'cod' ? 'پرداخت در محل (COD)' : 'پرداخت آنلاین'}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                            <span className="text-[10px] text-muted-foreground block">کد رهگیری پستی:</span>
                            <span className="font-sans font-bold text-foreground block truncate mt-0.5" dir="ltr">
                              {order.trackingNumber || 'در انتظار صدور'}
                            </span>
                          </div>
                        </div>

                        {/* Mini Timeline Progress Indicator */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-2">
                            <span>مرحله {activeStep} از 4 خط تولید:</span>
                            <span className="text-cyan-500 font-bold">{milestones[activeStep - 1]?.title || 'در حال انجام'}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {milestones.map((ms, idx) => (
                              <div key={idx} className="space-y-1">
                                <div
                                  className={cn(
                                    'h-1.5 rounded-full transition-all',
                                    ms.status === 'completed'
                                      ? 'bg-emerald-500'
                                      : ms.status === 'current'
                                      ? 'bg-cyan-500 animate-pulse'
                                      : 'bg-muted'
                                  )}
                                />
                                <span className="text-[9px] text-muted-foreground hidden sm:block truncate">
                                  {ms.badge}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-3">
                          <span className="text-xs text-cyan-500 font-bold flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                            <span>مشاهده کامل خط زمانی، آدرس تحویل و مشخصات کارت</span>
                            <ChevronLeft className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Bar */}
              <div className="pt-2">
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
                </>
              )}
            </>
          )}
        </motion.div>
      ) : (
        /* ===================================================================
            DETAIL VIEW: FOR SELECTED ORDER (Master-Detail Pattern)
            =================================================================== */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="space-y-6"
        >
          {/* Top Bar: Return to Orders List Button & Order Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToMaster}
                className="h-10 px-4 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted flex items-center gap-2 shadow-sm"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به لیست سفارشات</span>
              </Button>

              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-xs text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                  {selectedOrder.orderNumber}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  ({new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-sans font-bold text-sm text-foreground">
                {selectedOrder.totalPrice.toLocaleString()} AFN
              </span>

              {selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'processing' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال بررسی (Under Review)</span>
                </span>
              ) : selectedOrder.orderStatus === 'printing' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 animate-pulse">
                  <Zap className="w-3.5 h-3.5" />
                  <span>در حال چاپ و کدگذاری (Printing)</span>
                </span>
              ) : selectedOrder.orderStatus === 'shipped' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Truck className="w-3.5 h-3.5" />
                  <span>ارسال شده با پست اکسپرس (Shipped)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تکمیل و تحویل داده شده (Completed)</span>
                </span>
              )}
            </div>
          </div>

          {/* Detail View Inline Tabs: 1. خط زمانی پیگیری | 2. مشخصات کارت */}
          <div className="flex items-center gap-2 border-b border-border">
            <button
              type="button"
              onClick={() => setDetailTab('timeline')}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all',
                detailTab === 'timeline'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Truck className="w-4 h-4" />
              <span>خط زمانی پیگیری (Timeline & Delivery)</span>
            </button>

            <button
              type="button"
              onClick={() => setDetailTab('specs')}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all',
                detailTab === 'specs'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <CreditCard className="w-4 h-4" />
              <span>مشخصات کارت (Card Specs)</span>
              {isOrderEditable && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* ===================================================================
              INLINE TAB 1: TIMELINE & INVOICE
              =================================================================== */}
          {detailTab === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Timeline Progress & Milestones (8 cols) */}
              <div className="lg:col-span-8 bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Truck className="w-5 h-5 text-cyan-500" />
                    <span>مراحل تولید، چاپ و توزیع کارت هوشمند NFC</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    وضعیت این سفارش به شکل زنده با خط تولید شرکت و پست اکسپرس افغانستان همگام است.
                  </p>
                </div>

                {/* Milestone Steps */}
                <div className="space-y-6 relative">
                  {getTimelineMilestones(selectedOrder.orderStatus, selectedOrder.trackingNumber).map((item, idx) => {
                    const isDone = item.status === 'completed';
                    const isCurrent = item.status === 'current';

                    return (
                      <div key={item.step} className="flex items-start gap-4 relative">
                        {idx < 3 && (
                          <div
                            className={cn(
                              'absolute right-4 top-8 w-0.5 h-16 -translate-x-1/2',
                              isDone ? 'bg-cyan-500' : 'bg-border'
                            )}
                          />
                        )}

                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-all',
                            isDone
                              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                              : isCurrent
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-4 ring-amber-500/20 animate-pulse'
                              : 'bg-muted border border-border text-muted-foreground'
                          )}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                        </div>

                        <div className="flex-1 pb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h3
                              className={cn(
                                'text-sm font-bold',
                                isCurrent ? 'text-cyan-500 dark:text-cyan-400' : isDone ? 'text-foreground' : 'text-muted-foreground'
                              )}
                            >
                              {item.title}
                            </h3>
                            <span className="text-[11px] font-sans text-muted-foreground">
                              {item.dateText}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tracking Number Banner */}
                {selectedOrder.trackingNumber && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-5 h-5 text-purple-500 shrink-0" />
                      <div>
                        <span className="font-bold text-foreground block">کد رهگیری پست اکسپرس صادر شد</span>
                        <span className="text-muted-foreground">مرسوله در حال حمل توسط پست اکسپرس می‌باشد.</span>
                      </div>
                    </div>
                    <div className="font-sans font-bold text-purple-400 bg-black/40 px-3 py-1.5 rounded-xl border border-purple-500/30" dir="ltr">
                      {selectedOrder.trackingNumber}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Recipient Info & Invoice Summary (4 cols) */}
              <div className="lg:col-span-4 bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="border-b border-border/80 pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-cyan-500" />
                    <span>جزئیات تحویل و فاکتور</span>
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-[11px]">تحویل‌گیرنده:</span>
                      <span className="font-semibold text-foreground">{selectedOrder.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-[11px]">شماره مبایل:</span>
                      <span className="font-sans text-foreground" dir="ltr">{selectedOrder.customerPhone || 'نامشخص'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-[11px]">آدرس پستی:</span>
                      <span className="text-foreground leading-relaxed">{selectedOrder.notes || 'آدرس ثبت‌شده'}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Breakdown */}
                <div className="pt-3 border-t border-border/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>مبلغ کارت فیزیکی:</span>
                    <span className="font-sans">{selectedOrder.unitPrice.toLocaleString()} AFN</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>کدگذاری چیپست NFC:</span>
                    <span className="text-emerald-500 font-bold">رایگان (0 AFN)</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>هزینه ارسال پستی:</span>
                    <span className="font-sans">150 AFN</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-foreground border-t border-border/60 pt-2 text-sm">
                    <span>مجموع پرداخت‌شده:</span>
                    <span className="font-sans text-cyan-500">{selectedOrder.totalPrice.toLocaleString()} AFN</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setDetailTab('specs')}
                  className="w-full h-10 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>مشاهده مشخصات طراحی کارت</span>
                </Button>
              </div>
            </div>
          )}

          {/* ===================================================================
              INLINE TAB 2: CARD SPECS & EDIT
              =================================================================== */}
          {detailTab === 'specs' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive 3D Card Simulator (5 cols) */}
              <div className="lg:col-span-5 bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col items-center shadow-sm">
                <div className="w-full flex items-center justify-between pb-3 border-b border-border/80">
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground block">پیش‌نمایش کارت من</span>
                    <span className="text-[11px] text-cyan-500 font-sans">
                      {selectedOrder.cardSpecs?.templateName || selectedOrder.productTitle}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCardSide((prev) => (prev === 'front' ? 'back' : 'front'))}
                    className="rounded-xl border-border text-xs flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{cardSide === 'front' ? 'پشت کارت' : 'روی کارت'}</span>
                  </Button>
                </div>

                {/* 3D Realistic Card Preview Box */}
                <div className="w-full py-6 flex items-center justify-center min-h-[300px]">
                  <motion.div
                    animate={{ rotateY: cardSide === 'back' ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className={cn(
                      'rounded-2xl shadow-2xl relative border border-white/20 overflow-hidden transform-style-3d select-none',
                      selectedOrder.cardSpecs?.orientation === 'vertical' ? 'w-[210px] h-[330px]' : 'w-[330px] h-[210px]',
                      'bg-gradient-to-br from-zinc-950 via-slate-900 to-black text-white'
                    )}
                    style={{
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.15)',
                    }}
                  >
                    {/* Front Face */}
                    <div
                      className={cn(
                        'absolute inset-0 p-5 flex flex-col justify-between backface-hidden',
                        cardSide === 'back' ? 'pointer-events-none' : ''
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded-md bg-black/40 border border-white/20 flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        {selectedOrder.cardSpecs?.logoUrl ? (
                          <img
                            src={selectedOrder.cardSpecs.logoUrl}
                            alt=""
                            className="h-6 max-w-[70px] object-contain"
                          />
                        ) : (
                          <span className="font-sans text-[9px] font-bold text-white/60">
                            {selectedOrder.cardSpecs?.companyName || 'ARYA LINK'}
                          </span>
                        )}
                      </div>

                      <div className="w-8 h-6 rounded bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 shadow-sm border border-amber-300/60" />

                      <div className="text-right space-y-0.5">
                        <div className="text-sm font-black text-white truncate">
                          {selectedOrder.cardSpecs?.firstName || selectedOrder.cardSpecs?.lastName
                            ? `${selectedOrder.cardSpecs.firstName || ''} ${selectedOrder.cardSpecs.lastName || ''}`.trim()
                            : selectedOrder.customerName}
                        </div>
                        <div className="text-[10px] text-white/70 truncate">
                          {selectedOrder.cardSpecs?.jobTitle || 'مشخصات شغلی'}
                        </div>
                        <div className="text-[8px] font-sans text-cyan-400 pt-0.5" dir="ltr">
                          {selectedOrder.cardSpecs?.cardUrl || 'aryal.ink'}
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div
                      className={cn(
                        'absolute inset-0 p-4 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950',
                        cardSide === 'front' ? 'pointer-events-none' : ''
                      )}
                    >
                      <div className="w-full h-6 bg-zinc-900 border-y border-white/10 -mx-4 px-4 flex items-center justify-end">
                        <span className="font-sans text-[7px] text-white/30">NFC SECURE CHIP</span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="bg-white p-2 rounded-lg shrink-0">
                          <QRCodeSVG
                            value={selectedOrder.cardSpecs?.cardUrl || 'https://aryal.ink'}
                            size={64}
                            level="M"
                          />
                        </div>
                        <div className="text-right space-y-1 text-[9px] text-slate-300">
                          <div className="font-bold text-white">اسکن یا تماس با گوشی</div>
                          <p className="leading-tight text-[8px] text-slate-400">
                            نزدیک کردن گوشی برای باز شدن فوری پروفایل هوشمند شما
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-1 text-[7px] font-sans text-slate-500 flex justify-between">
                        <span>MADE WITH ARYA LINK</span>
                        <span>NTAG216</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Card Specifications Table & Edit Button (7 cols) */}
              <div className="lg:col-span-7 bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-500" />
                      <span>مشخصات فنی و چاپی کارت NFC</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      اطلاعات دقیق کارت فیزیکی که برای چاپ و برنامه‌ریزی چیپست تنظیم شده است.
                    </p>
                  </div>

                  {isOrderEditable ? (
                    <Button
                      type="button"
                      onClick={handleOpenEditModal}
                      className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ویرایش اطلاعات کارت</span>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-muted-foreground">
                      <Lock className="w-3.5 h-3.5" />
                      <span>اطلاعات قفل شده است (در صف چاپ)</span>
                    </div>
                  )}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground text-[11px] block">متریال و بدنه کارت:</span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {selectedOrder.cardSpecs?.material || 'پی‌وی‌سی مات مخملی'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground text-[11px] block">مدل و ماکاپ:</span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {selectedOrder.cardSpecs?.templateName || selectedOrder.productTitle}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground text-[11px] block">جهت چاپ:</span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {selectedOrder.cardSpecs?.orientation === 'vertical' ? 'عمودی (Vertical)' : 'افقی (Horizontal)'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground text-[11px] block">فینیش متالیک نوشته‌ها:</span>
                    <span className="font-bold text-cyan-500 mt-0.5 block">
                      {selectedOrder.cardSpecs?.finishAccent === 'gold'
                        ? 'طلای متالیک'
                        : selectedOrder.cardSpecs?.finishAccent === 'silver'
                        ? 'نقره‌ای صیقلی'
                        : selectedOrder.cardSpecs?.finishAccent === 'cyan'
                        ? 'سایان نئون'
                        : 'سفید مینیمال'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground text-[11px] block">نام درج‌شده:</span>
                    <span className="font-bold text-foreground mt-0.5 block">
                      {selectedOrder.cardSpecs?.firstName || selectedOrder.cardSpecs?.lastName
                        ? `${selectedOrder.cardSpecs.firstName || ''} ${selectedOrder.cardSpecs.lastName || ''}`.trim()
                        : selectedOrder.customerName}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground text-[11px] block">موقعیت شغلی:</span>
                    <span className="font-bold text-foreground mt-0.5 block truncate">
                      {selectedOrder.cardSpecs?.jobTitle || 'ثبت نشده'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground text-[11px] block">نام شرکت / سازمان:</span>
                    <span className="font-bold text-foreground mt-0.5 block truncate">
                      {selectedOrder.cardSpecs?.companyName || 'ثبت نشده'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground text-[11px] block">لینک متصل به چیپ و QR:</span>
                    <span className="font-sans text-cyan-500 mt-0.5 block truncate" dir="ltr">
                      {selectedOrder.cardSpecs?.cardUrl || 'aryal.ink'}
                    </span>
                  </div>
                </div>

                {isOrderEditable ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="font-bold block">سفارش شما در وضعیت «در حال بررسی» است</span>
                      <span>تا پیش از انتقال سفارش به صف چاپ، میتوانید مشخصات چاپی کارت خود را ویرایش فرمایید.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-3">
                    <Lock className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="font-bold block">کارت وارد فاز چاپ و کدگذاری گردیده است</span>
                      <span>به منظور حفظ سلامت فرآیند تولید صنعتی، اطلاعات چاپی این کارت قفل گردیده است.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ===================================================================
          EDIT CARD SPECS MODAL (Only when orderStatus is pending/processing)
          =================================================================== */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-500" />
              <span>ویرایش اطلاعات کارت فیزیکی</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              تغییرات شما به صورت آنی بر روی کارت و در دیتابیس ثبت سفارش ذخیره خواهد شد.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCardSpecs} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">نام (First Name)</label>
                <Input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">تخلص (Last Name)</label>
                <Input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">موقعیت شغلی یا سازمان</label>
              <Input
                type="text"
                value={editFormData.jobTitle}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">نام شرکت یا برند</label>
              <Input
                type="text"
                value={editFormData.companyName}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-muted-foreground block">
                تغییر یا آپلود لوگو (اختیاری)
              </label>
              <div className="flex items-center gap-3">
                {editFormData.logoUrl ? (
                  <div className="relative">
                    <img
                      src={editFormData.logoUrl}
                      alt="Logo"
                      className="w-12 h-12 object-contain rounded-xl border border-border p-1 bg-muted/40"
                    />
                    <button
                      type="button"
                      onClick={() => setEditFormData((prev) => ({ ...prev, logoUrl: '' }))}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : null}
                <label className="flex-1 cursor-pointer">
                  <div className="border border-dashed border-border rounded-xl p-2.5 text-center hover:border-cyan-500 transition-colors bg-muted/20">
                    <span className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-cyan-500" />
                      <span>انتخاب فایل لوگوی جدید (PNG / SVG)</span>
                    </span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Finish Accent */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-muted-foreground block">
                افکت متالیک نوشته‌ها
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'gold', label: 'طلایی' },
                  { id: 'silver', label: 'نقره‌ای' },
                  { id: 'cyan', label: 'سایان' },
                  { id: 'minimal', label: 'سفید' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setEditFormData((prev) => ({ ...prev, finishAccent: f.id }))}
                    className={cn(
                      'py-2 rounded-xl text-xs font-semibold border transition-all',
                      editFormData.finishAccent === f.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500 font-bold'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="h-10 px-4 rounded-xl text-xs"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingSpecs}
                className="h-10 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
              >
                {isUpdatingSpecs ? 'در حال ذخیره‌سازی...' : 'ذخیره و تأیید نهایی'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UserOrdersDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrdersDashboardInner />
    </Suspense>
  );
}
