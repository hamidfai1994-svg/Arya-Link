'use client';

import React, { useState } from 'react';
import { Menu, X, ShieldAlert, Bell, Search, User } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const role = (session?.user?.role || 'admin').toLowerCase();

  return (
    <div className="min-h-screen w-full flex bg-slate-950 font-sans text-slate-100 select-none" dir="rtl">
      {/* Desktop Persistent Admin Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        <AdminSidebar />
      </div>

      {/* Main Administrative Workplace */}
      <div className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
        {/* Top Admin Enterprise Navbar */}
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-muted text-foreground border border-border"
              aria-label="باز کردن منو"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-foreground text-sm tracking-tight hidden sm:inline">
                سامانه جامع مدیریت سازمانی آریا لینک
              </span>
              <Badge className="bg-rose-500/15 text-rose-500 border border-rose-500/30 text-[10px] font-mono">
                {role.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden md:inline font-outfit">
              زمان سرور: {new Date().toLocaleTimeString('fa-IR')}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex" dir="rtl">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-right duration-200">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute left-3 top-4 p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white z-20"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
              <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
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
export default AdminShell;
