'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, ArrowRight, LayoutDashboard, ChevronRight } from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If we are on the profile builder page (/dashboard/editor), render editor with top bar
  if (pathname.startsWith('/dashboard/editor')) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-slate-950">
        {/* Editor Top Navigation Bar */}
        <header className="h-12 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-30" dir="rtl">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>بازگشت به داشبورد</span>
            </Link>
            <span className="text-slate-500 text-xs hidden sm:inline">/</span>
            <span className="text-xs text-slate-300 font-bold hidden sm:inline">
              ویرایشگر کارت هوشمند NFC و لینک بیو
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/analytics"
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              آمار
            </Link>
            <Link
              href="/dashboard/orders"
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              سفارشات
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Editor Body */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-background font-sans" dir="rtl">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        <DashboardSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
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

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-sm font-outfit shadow-md shadow-cyan-500/20">
              AL
            </div>
            <span className="font-extrabold text-foreground text-sm font-outfit">
              Arya Link
            </span>
          </div>

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
