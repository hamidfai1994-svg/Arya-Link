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
  Layers,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SiteLogo } from '@/components/SiteLogo';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface AdminNavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export function AdminSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, dir } = useLanguage();

  const coreNavItems: AdminNavItem[] = [
    {
      title: t('admin.sidebar.overview', 'نمای کلی پلتفرم'),
      subtitle: t('admin.sidebar.overviewSub', 'آمار زنده، سرور و وضعیت سیستم'),
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('admin.sidebar.users', 'مدیریت کاربران'),
      subtitle: t('admin.sidebar.usersSub', 'لیست کاربران، نقش‌ها و تایید هویت KYC'),
      href: '/admin/users',
      icon: Users,
    },
    {
      title: t('admin.sidebar.companies', 'مدیریت سازمان‌ها (B2B)'),
      subtitle: t('admin.sidebar.companiesSub', 'ثبت شرکت‌ها، تخصیص مدیر سازمان و لایسنس تیمی'),
      href: '/admin/companies',
      icon: Building2,
    },
    {
      title: t('admin.sidebar.orders', 'مدیریت سفارشات'),
      subtitle: t('admin.sidebar.ordersSub', 'سفارشات کارت فیزیکی و تغییر وضعیت چاپ'),
      href: '/admin/orders',
      icon: ShoppingBag,
    },
    {
      title: t('admin.sidebar.settings', 'تنظیمات پلتفرم'),
      subtitle: t('admin.sidebar.settingsSub', 'تعرفه‌ها، درگاه‌های بانکی، امنیت و لجستیک'),
      href: '/admin/settings',
      icon: Settings,
    },
    {
      title: t('admin.sidebar.trash', 'زباله‌دان سیستم'),
      subtitle: t('admin.sidebar.trashSub', 'لاگ امنیتی حسابرسی و رکوردهای حذف‌شده'),
      href: '/admin/trash',
      icon: Trash2,
    },
  ];

  const financeNavItems: AdminNavItem[] = [
    {
      title: t('admin.sidebar.modules', 'مدیریت دسترسی ماژول‌ها'),
      subtitle: t('admin.sidebar.modulesSub', 'تعیین ماژول‌های رایگان و حرفه‌ای (Pro)'),
      href: '/admin/modules',
      icon: Layers,
    },
    {
      title: t('admin.sidebar.finance', 'تراکنش‌ها و مالی'),
      subtitle: t('admin.sidebar.financeSub', 'گردش حساب‌ها، درگاه‌های پرداخت و تسویه'),
      href: '/admin/finance',
      icon: Wallet,
    },
    {
      title: t('admin.sidebar.paymentMethods', 'درگاه‌ها و روش‌های پرداخت'),
      subtitle: t('admin.sidebar.paymentMethodsSub', 'تنظیمات حساب‌پی، بانک‌ها، ولت‌ها و تتر'),
      href: '/admin/finance/payment-methods',
      icon: CreditCard,
    },
  ];

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
    <aside className="w-72 h-full flex flex-col bg-slate-950 text-slate-100 border-e border-slate-800 select-none" dir={dir}>
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
            subtitle={t('admin.sidebar.subtitle', 'پنل مدیریت ارشد سیستم')}
            textClassName="text-white text-sm"
          />
        </Link>
      </div>

      {/* Admin Navigation List */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar mt-3">
        {[
          {
            id: 'core',
            label: t('admin.sidebar.coreGroup', 'مدیریت ارشد پلتفرم'),
            labelClass: 'text-slate-400',
            items: coreNavItems,
            divider: false,
          },
          {
            id: 'finance',
            label: t('admin.sidebar.financeGroup', 'مالی و درآمدزایی'),
            labelClass: 'text-amber-400/90',
            items: financeNavItems,
            divider: true,
          },
        ].map((group) => (
          <div
            key={group.id}
            className={cn('space-y-1.5', group.divider && 'pt-2 border-t border-slate-800/70')}
          >
            <div className={cn('px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider', group.labelClass)}>
              {group.label}
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
                    <div className="text-start truncate">
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
          </div>
        ))}
      </nav>

      {/* Footer Actions: Personal Dashboard & Sign Out in One Row */}
      <div className="p-3 border-t border-slate-800/80 flex items-center gap-2">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-400 text-xs font-bold transition-all truncate"
          title={t('admin.sidebar.backToUser', 'بازگشت به داشبورد کاربری شخصی')}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('admin.sidebar.backToUser', 'داشبورد من')}</span>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-bold transition-all truncate"
          title={t('admin.sidebar.logout', 'خروج از پنل مدیریت')}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('admin.sidebar.logout', 'خروج')}</span>
        </button>
      </div>
    </aside>
  );
}
export default AdminSidebar;
