'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Layers,
  Sliders,
  BarChart3,
  CreditCard,
  Truck,
  LogOut,
  ExternalLink,
  ShieldAlert,
  ChevronLeft,
  Sparkles,
  Settings,
  ShoppingBag,
  UserCog,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SiteLogo } from '@/components/SiteLogo';

export interface UserNavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'cyan' | 'default' | 'outline' | 'secondary';
}

// User Dashboard Navigation Items (Master View - Strictly 3 Items)
const userNavItems: UserNavItem[] = [
  {
    title: 'داشبورد و لینک‌های من',
    subtitle: 'لیست لینک‌ها و آمار مجموع بازدیدها',
    href: '/dashboard',
    icon: Layers,
  },
  {
    title: 'سفارشات من',
    subtitle: 'پیگیری کارت‌های فیزیکی هوشمند NFC',
    href: '/dashboard/orders',
    icon: ShoppingBag,
    badge: 'NFC',
    badgeVariant: 'cyan',
  },
  {
    title: 'تنظیمات حساب کاربری',
    subtitle: 'اطلاعات هویتی، امنیت و اشتراک PRO',
    href: '/dashboard/account',
    icon: UserCog,
  },
];

export function DashboardSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role || '').toLowerCase();
  const isSuperAdmin = userRole === 'superadmin' || userRole === 'admin';

  return (
    <aside className="w-72 h-full flex flex-col bg-card/80 dark:bg-slate-950/90 backdrop-blur-xl border-l border-border select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-border/80 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <SiteLogo
            width={40}
            height={40}
            showText={true}
            showBadge={true}
            badgeText="PRO"
            subtitle="داشبورد کاربری"
          />
        </Link>
        <ThemeToggle />
      </div>

      {/* Main User Navigation List (Strictly 4 Items) */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          مدیریت کارت و پروفایل
        </div>

        {userNavItems.map((item) => {
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
                  ? 'bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-cyan-500'
                  )}
                />
                <div className="text-right truncate">
                  <span className="block truncate">{item.title}</span>
                  <span
                    className={cn(
                      'text-[10px] block font-normal truncate opacity-80',
                      isActive ? 'text-white/80' : 'text-muted-foreground'
                    )}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-lg font-bold shrink-0',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Super Admin Switcher (Isolated from User Tabs) */}
      {isSuperAdmin && (
        <div className="px-3 py-2 border-t border-border/60">
          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
              <div className="text-right">
                <span className="text-xs font-bold block">پنل مدیریت کل (Admin)</span>
                <span className="text-[10px] opacity-80 block">نظارت بر سرور و کاربران</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      )}

      {/* Sign Out Footer */}
      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>خروج از حساب کاربری</span>
        </button>
      </div>
    </aside>
  );
}
export default DashboardSidebar;
