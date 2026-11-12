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
    subtitle: 'اطلاعات هویتی، امنیت و اشتراک',
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
      <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group w-full"
          onClick={onCloseMobile}
        >
          <SiteLogo
            width={38}
            height={38}
            showText={true}
            showBadge={false}
            subtitle="داشبورد کاربری"
          />
        </Link>
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

      {/* Footer Actions: Admin Switcher & Sign Out in One Row */}
      <div className="p-3 border-t border-border flex items-center gap-2">
        {isSuperAdmin && (
          <Link
            href="/admin/dashboard"
            onClick={onCloseMobile}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all truncate"
            title="ورود به پنل مدیریت کل"
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="truncate">پنل مدیریت</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors truncate',
            isSuperAdmin ? 'flex-1 border border-border/60' : 'w-full'
          )}
          title="خروج از حساب کاربری"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">خروج</span>
        </button>
      </div>
    </aside>
  );
}
export default DashboardSidebar;
