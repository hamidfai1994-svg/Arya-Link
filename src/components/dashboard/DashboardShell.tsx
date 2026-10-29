'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, X, CreditCard, Sparkles, UserCheck } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SiteLogo } from '@/components/SiteLogo';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Isolated Detail View environment (/dashboard/editor/[cardId]) renders its own dedicated sidebar & layout
  if (pathname.startsWith('/dashboard/editor')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex bg-background font-sans" dir="rtl">
      {/* Desktop Persistent Master Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        <DashboardSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Sticky Header (Clean, without card selector dropdown) */}
        <header className="hidden lg:flex h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-bold text-foreground">
              داشبورد مدیریت یکپارچه آریا لینک
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/order"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>سفارش کارت فیزیکی NFC</span>
            </Link>

            {session?.user && (
              <Link
                href="/dashboard/account"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span className="truncate max-w-[140px]">
                  {session.user.name || session.user.email}
                </span>
              </Link>
            )}

            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Sticky Top Header */}
        <header className="lg:hidden h-16 border-b border-border bg-card/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors"
            aria-label="باز کردن منو"
          >
            <Menu className="w-5 h-5" />
          </button>

          <SiteLogo
            href="/dashboard"
            width={32}
            height={32}
            showText={true}
            textClassName="text-sm"
          />

          <ThemeToggle />
        </header>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex" dir="rtl">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-right duration-200">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute left-3 top-4 p-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground z-20"
                aria-label="بستن منو"
              >
                <X className="w-4 h-4" />
              </button>
              <DashboardSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
