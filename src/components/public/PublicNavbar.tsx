'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  User,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

export function PublicNavbar() {
  const { t, dir, language } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { title: t('nav.home', 'صفحه اصلی'), href: '/' },
    { title: t('nav.pricing', 'تعرفه‌ها'), href: '/#pricing' },
    { title: t('nav.services', 'خدمات'), href: '/services' },
    { title: t('nav.examples', 'نمونه‌های کارت'), href: '/#how-it-works' },
    { title: t('nav.blog', 'بلاگ'), href: '/blog' },
    { title: t('nav.about', 'درباره ما'), href: '/about' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl transition-all" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg font-outfit shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            AL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-foreground tracking-tight text-lg font-outfit">
                Arya Link
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 font-sans">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {language === 'en'
                ? 'Smart NFC & Bio Link Platform'
                : language === 'ps'
                ? 'د سمارټ NFC او بایو لینک پلیټفارم'
                : 'کارت ویزیت هوشمند و لینک‌بایو'}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Center) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors py-1 relative hover:text-cyan-500',
                  active ? 'text-cyan-500 font-bold' : ''
                )}
              >
                {link.title}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth Actions, LanguageSwitcher & ThemeToggle (Side) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />

          {session ? (
            <Link href="/dashboard">
              <Button
                size="sm"
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('nav.dashboard', 'داشبورد')}</span>
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs font-bold text-foreground hover:bg-muted"
                >
                  {t('nav.login', 'ورود')}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                >
                  {t('nav.register', 'ثبت‌نام رایگان')}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-muted text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-card/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-foreground/80 hover:text-cyan-500 py-1.5 transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-2.5">
            {session ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-11 rounded-xl bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('nav.dashboard', 'داشبورد کاربری')}</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-11 rounded-xl text-xs font-bold">
                    {t('nav.login', 'ورود')}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs">
                    {t('nav.register', 'ثبت‌نام رایگان')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
export default PublicNavbar;
