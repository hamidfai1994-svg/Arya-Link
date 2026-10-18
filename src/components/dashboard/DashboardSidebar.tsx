'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Layers,
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Wallet,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  UserCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    title: 'لینک‌های شما',
    href: '/dashboard',
    icon: Layers,
  },
  {
    title: 'ویرایشگر کارت هوشمند',
    href: '/dashboard/editor',
    icon: LayoutDashboard,
    badge: 'سازنده',
  },
  {
    title: 'آمار و تحلیل',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'سفارشات محصولات',
    href: '/dashboard/orders',
    icon: ShoppingBag,
  },
  {
    title: 'تسویه حساب مالی',
    href: '/dashboard/payouts',
    icon: Wallet,
  },
  {
    title: 'احراز هویت (KYC)',
    href: '/dashboard/kyc',
    icon: ShieldCheck,
  },
  {
    title: 'پنل مدیریت کل (Admin)',
    href: '/admin/dashboard',
    icon: ShieldAlert,
    adminOnly: true,
    badge: 'مدیر',
  },
];

export function DashboardSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  return (
    <aside className="w-72 h-full flex flex-col bg-card/80 backdrop-blur-xl border-l border-border select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border/80 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black font-outfit text-base group-hover:scale-105 transition-transform">
            AL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-foreground tracking-tight text-base font-outfit">
                Arya Link
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">پنل مدیریت یکپارچه</p>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* User Mini Profile Card */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-muted/40 border border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold overflow-hidden shrink-0">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{session?.user?.name ? session.user.name.charAt(0) : 'U'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-foreground truncate block">
                {session?.user?.name || 'کاربر گرامی'}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate font-outfit">
              {session?.user?.email || ''}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>نقش: مدیر ارشد</span>
            </span>
            <Link
              href="/admin/dashboard"
              className="text-cyan-500 hover:text-cyan-400 font-medium text-[11px] flex items-center gap-0.5"
            >
              <span>ورود</span>
              <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          ابزارهای اصلی و تجاری
        </div>

        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/10 text-cyan-500 dark:text-cyan-400 font-bold border border-cyan-500/20 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive
                      ? 'text-cyan-500 dark:text-cyan-400'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-bold',
                    item.adminOnly
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/80 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>مشاهده صفحه اصلی سایت</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج از حساب</span>
        </button>
      </div>
    </aside>
  );
}
