'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Building,
  Image as ImageIcon,
  Users,
  ShieldCheck,
  Building2,
  Wallet,
  CreditCard,
  BarChart3,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SiteLogo } from '@/components/SiteLogo';

interface NavGroup {
  groupTitle: string;
  items: {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    requiredRoles?: string[];
  }[];
}

const adminNavGroups: NavGroup[] = [
  {
    groupTitle: 'داشبورد مدیریتی',
    items: [
      {
        title: 'مرکز کنترل و آمار ERP',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupTitle: 'مدیریت محتوا (CMS)',
    items: [
      {
        title: 'پست‌های بلاگ و مقالات',
        href: '/admin/cms/blog',
        icon: FileText,
      },
      {
        title: 'خدمات شرکت',
        href: '/admin/cms/services',
        icon: Briefcase,
      },
      {
        title: 'درباره ما و نمایندگی‌ها',
        href: '/admin/cms/company',
        icon: Building,
      },
      {
        title: 'گالری رسانه و عکس',
        href: '/admin/cms/media',
        icon: ImageIcon,
      },
    ],
  },
  {
    groupTitle: 'کاربران و هویت (Identity)',
    items: [
      {
        title: 'لیست کاربران و نقش‌ها',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'تایید احراز هویت (KYC)',
        href: '/admin/kyc',
        icon: ShieldCheck,
        badge: 'تیک آبی',
      },
      {
        title: 'حساب‌های شرکتی',
        href: '/admin/companies',
        icon: Building2,
      },
    ],
  },
  {
    groupTitle: 'مدیریت مالی و فروش (Finance)',
    items: [
      {
        title: 'حسابداری و درآمدهای فروش',
        href: '/admin/finance',
        icon: Wallet,
      },
    ],
  },
  {
    groupTitle: 'گزارشات و آنالیتیکس',
    items: [
      {
        title: 'گزارشات رشد و بازدیدها',
        href: '/admin/reports',
        icon: BarChart3,
      },
    ],
  },
  {
    groupTitle: 'تنظیمات و هویت سامانه (Settings)',
    items: [
      {
        title: 'تنظیمات برند و هویت بصری',
        href: '/admin/settings/branding',
        icon: Palette,
        badge: 'مرحله ۲۴',
      },
    ],
  },
];

export function AdminSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = (session?.user?.role || '').toLowerCase();

  const getRoleBadgeLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'مدیر ارشد کل (Super Admin)';
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
        <Link href="/admin/dashboard" className="flex items-center gap-3 group" onClick={onCloseMobile}>
          <SiteLogo
            width={38}
            height={38}
            showText={true}
            showBadge={true}
            badgeText="ENTERPRISE"
            subtitle="پنل مستقل مدیریت کل"
            textClassName="text-white text-sm"
          />
        </Link>

        <ThemeToggle />
      </div>

      {/* Admin User Mini Card */}
      <div className="p-3.5 mx-3 my-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              session?.user?.name?.charAt(0) || 'A'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white truncate block">
              {session?.user?.name || 'مدیر سیستم'}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold truncate block">
              {getRoleBadgeLabel(userRole)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto custom-scrollbar pb-6">
        {adminNavGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {group.groupTitle}
            </div>

            {group.items.map((item) => {
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
                      ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/10 text-rose-400 font-bold border border-rose-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-white'
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Dedicated Admin Sign Out */}
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
