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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    title: 'نمای کلی پلتفرم (Overview)',
    subtitle: 'آمار زنده، سرور و وضعیت سیستم',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    badge: 'LIVE',
  },
  {
    title: 'مدیریت کاربران (Users)',
    subtitle: 'لیست کاربران، نقش‌ها و تایید هویت KYC',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'مدیریت سفارشات (Orders)',
    subtitle: 'سفارشات کارت فیزیکی و تغییر وضعیت چاپ',
    href: '/admin/orders',
    icon: ShoppingBag,
    badge: 'NFC',
  },
  {
    title: 'تراکنش‌ها و مالی (Finance)',
    subtitle: 'گردش حساب‌ها، درگاه‌های پرداخت و تسویه',
    href: '/admin/finance',
    icon: Wallet,
  },
  {
    title: 'تنظیمات پلتفرم (Platform Settings)',
    subtitle: 'تعرفه‌ها، درگاه‌های بانکی، امنیت و لجستیک',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role || '').toLowerCase();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'مدیر ارشد پلتفرم (Super Admin)';
      case 'financial_admin':
        return 'مدیر مالی (Finance Admin)';
      case 'content_editor':
        return 'مدیر محتوا (CMS Editor)';
      case 'admin':
      default:
        return 'مدیر سیستم (Admin)';
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
            showBadge={true}
            badgeText="ENTERPRISE"
            subtitle="پنل مدیریت ارشد سیستم"
            textClassName="text-white text-sm"
          />
        </Link>
        <ThemeToggle />
      </div>

      {/* Admin User Mini Card */}
      <div className="p-3.5 mx-3 my-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Admin"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{session?.user?.name?.charAt(0) || 'A'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white truncate block">
              {session?.user?.name || 'مدیر سیستم'}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold truncate block">
              {getRoleLabel(userRole)}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Navigation List (Strictly 4 Items) */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
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
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black font-outfit uppercase shrink-0 bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Redirect to Personal User Dashboard Button */}
      <div className="px-3 py-3 border-t border-slate-800/80">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center justify-between p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <User className="w-4 h-4 shrink-0 text-cyan-400" />
            <div className="text-right truncate">
              <span className="text-xs font-bold block">داشبورد کاربری شخصی</span>
              <span className="text-[10px] text-slate-400 block truncate">
                ویرایش کارت‌ها و لینک‌های بیو
              </span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* Admin Sign Out */}
      <div className="p-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/15 border border-rose-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از پنل مدیریت</span>
        </button>
      </div>
    </aside>
  );
}
export default AdminSidebar;
