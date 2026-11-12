'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
  User,
  Sparkles,
  ShoppingBag,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SiteLogo } from '@/components/SiteLogo';

export interface AdminNavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

// Core Super Admin Navigation Items
const adminNavItems: AdminNavItem[] = [
  {
    title: 'نمای کلی پلتفرم',
    subtitle: 'آمار زنده، سرور و وضعیت سیستم',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'مدیریت کاربران',
    subtitle: 'لیست کاربران، نقش‌ها و تایید هویت KYC',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'مدیریت سفارشات',
    subtitle: 'سفارشات کارت فیزیکی و تغییر وضعیت چاپ',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'تراکنش‌ها و مالی',
    subtitle: 'گردش حساب‌ها، درگاه‌های پرداخت و تسویه',
    href: '/admin/finance',
    icon: Wallet,
  },
  {
    title: 'درگاه‌ها و روش‌های پرداخت',
    subtitle: 'تنظیمات حساب‌پی، بانک‌ها، ولت‌ها و تتر',
    href: '/admin/finance/payment-methods',
    icon: CreditCard,
  },
  {
    title: 'تنظیمات پلتفرم',
    subtitle: 'تعرفه‌ها، درگاه‌های بانکی، امنیت و لجستیک',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'زباله‌دان سیستم',
    subtitle: 'لاگ امنیتی حسابرسی و رکوردهای حذف‌شده',
    href: '/admin/trash',
    icon: Trash2,
  },
];

export function AdminSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role || '').toLowerCase();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'مدیر ارشد پلتفرم';
      case 'financial_admin':
        return 'مدیر مالی';
      case 'content_editor':
        return 'مدیر محتوا';
      case 'admin':
      default:
        return 'مدیر سیستم';
    }
  };

  return (
    <aside className="w-72 h-full flex flex-col bg-slate-950 text-slate-100 border-l border-slate-800 select-none">
      {/* Admin Branding Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <SiteLogo
            width={38}
            height={38}
            showText={true}
            subtitle="پنل مدیریت ارشد سیستم"
            textClassName="text-white text-sm"
          />
        </Link>
      </div>

      {/* Admin Navigation List */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar mt-3">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          مدیریت ارشد پلتفرم
        </div>

        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-rose-500/25 to-amber-500/15 text-rose-400 font-bold border border-rose-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/70'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-white'
                  )}
                />
                <div className="text-right truncate">
                  <span className="block truncate">{item.title}</span>
                  <span
                    className={cn(
                      'text-[10px] block font-normal truncate opacity-70',
                      isActive ? 'text-rose-200' : 'text-slate-400'
                    )}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black font-sans uppercase shrink-0 bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions: Personal Dashboard & Sign Out in One Row */}
      <div className="p-3 border-t border-slate-800/80 flex items-center gap-2">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-400 text-xs font-bold transition-all truncate"
          title="بازگشت به داشبورد کاربری شخصی"
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">داشبورد من</span>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-bold transition-all truncate"
          title="خروج از پنل مدیریت"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">خروج</span>
        </button>
      </div>
    </aside>
  );
}
export default AdminSidebar;
