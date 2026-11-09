'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Barcode,
  QrCode,
  Mail,
  Wrench,
  History,
  Camera,
  Scan,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { SiteLogo } from '@/components/SiteLogo';

export function PublicNavbar() {
  const { t, dir, language } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const toolsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToolsMouseEnter = () => {
    if (toolsTimeoutRef.current) {
      clearTimeout(toolsTimeoutRef.current);
      toolsTimeoutRef.current = null;
    }
    setToolsDropdownOpen(true);
  };

  const handleToolsMouseLeave = () => {
    if (toolsTimeoutRef.current) {
      clearTimeout(toolsTimeoutRef.current);
    }
    toolsTimeoutRef.current = setTimeout(() => {
      setToolsDropdownOpen(false);
    }, 220);
  };

  // Close tools dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (toolsTimeoutRef.current) {
        clearTimeout(toolsTimeoutRef.current);
      }
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { title: t('nav.home', 'صفحه اصلی'), href: '/' },
    { title: t('nav.order', 'سفارش کارت'), href: '/order' },
    { title: t('nav.pricing', 'تعرفه‌ها'), href: '/#pricing' },
    { title: t('nav.services', 'خدمات'), href: '/services' },
    { title: t('nav.examples', 'نمونه‌های کارت'), href: '/#how-it-works' },
    { title: t('nav.blog', 'بلاگ'), href: '/blog' },
    { title: t('nav.about', 'درباره ما'), href: '/about' },
  ];

  const tools = [
    {
      title: t('nav.barcode', 'بارکد ساز جامع'),
      href: '/tools/barcode-maker',
      desc: language === 'en' ? 'Linear, 2D, EAN, GS1 & Postal codes' : language === 'ps' ? 'د 116 څخه زیاتو فارمټونو سره د بارکوډ جوړونکی' : 'تولید ده‌ها نوع بارکد میله‌ای، دوبعدی، پستی و بانکی',
      icon: Barcode,
      badge: 'PRO',
    },
    {
      title: t('nav.qr', 'کیوآر کد ساز پیشرفته'),
      href: '/tools/qr-maker',
      desc: language === 'en' ? 'Custom QR codes with logos & colors' : language === 'ps' ? 'د رنګونو او لوګو سره ښکلي او ځانګړي QR کوډونه' : 'طراحی کیوآر کدهای سفارشی با رنگ‌ها، گرادیانت و لوگو',
      icon: QrCode,
      badge: 'AI',
    },
    {
      title: t('nav.signature', 'سازنده امضای ایمیل'),
      href: '/tools/email-signature',
      desc: language === 'en' ? 'HTML signatures for Gmail & Outlook' : language === 'ps' ? 'د رسمي بریښنالیکونو لپاره مسلکي HTML لاسلیک' : 'تولید امضای رسمی سازمانی با قالب‌های استاندارد HTML',
      icon: Mail,
      badge: 'NEW',
    },
  ];

  const isToolsActive = pathname.startsWith('/tools');

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md shadow-sm transition-all duration-300" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Dynamic Site Logo */}
        <SiteLogo
          href="/"
          width={44}
          height={44}
          showText={true}
          showBadge={true}
          badgeText="PRO"
          subtitle={
            language === 'en'
              ? 'Smart NFC & Bio Link Platform'
              : language === 'ps'
              ? 'د سمارټ NFC او بایو لینک پلیټفارم'
              : 'کارت ویزیت هوشمند و لینک‌بایو'
          }
        />

        {/* Desktop Navigation Links (Center) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
          {navLinks.slice(0, 3).map((link) => {
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

          {/* Tools Dropdown Menu with Hover & Click */}
          <div
            ref={toolsDropdownRef}
            onMouseEnter={handleToolsMouseEnter}
            onMouseLeave={handleToolsMouseLeave}
            className="relative group/navtools"
          >
            <button
              type="button"
              onClick={() => setToolsDropdownOpen((prev) => !prev)}
              aria-expanded={toolsDropdownOpen}
              className={cn(
                'transition-colors py-1 relative hover:text-cyan-500 flex items-center gap-1.5 outline-none cursor-pointer text-xs font-semibold select-none',
                isToolsActive ? 'text-cyan-500 font-bold' : ''
              )}
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-500" />
              <span>{t('nav.tools', 'خدمات جانبی')}</span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 opacity-70 transition-transform duration-200',
                  toolsDropdownOpen ? 'rotate-180' : 'group-hover/navtools:rotate-180'
                )}
              />
              {isToolsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
              )}
            </button>

            {/* Dropdown Content Panel */}
            <div
              onMouseEnter={handleToolsMouseEnter}
              onMouseLeave={handleToolsMouseLeave}
              className={cn(
                'absolute top-full mt-2 w-80 p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-border/80 shadow-2xl z-50 transition-all duration-200 space-y-2',
                dir === 'rtl' ? 'right-0' : 'left-0',
                toolsDropdownOpen
                  ? 'opacity-100 visible pointer-events-auto scale-100 translate-y-0'
                  : 'opacity-0 invisible pointer-events-none scale-95 -translate-y-1 lg:group-hover/navtools:opacity-100 lg:group-hover/navtools:visible lg:group-hover/navtools:pointer-events-auto lg:group-hover/navtools:scale-100 lg:group-hover/navtools:translate-y-0'
              )}
            >
              {/* Header */}
              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/50 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-500" />
                  <span>جعبه ابزار دیجیتال و خدمات کاربردی</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 font-mono font-bold">
                  FREE
                </span>
              </div>

                {/* Item 1: کیوآر کد با Flyout Submenu */}
                <div className="relative group/qr">
                  <div className="p-2 rounded-xl hover:bg-cyan-500/10 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-cyan-500/20 text-foreground group-hover/qr:text-cyan-500">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                        <QrCode className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">کیوآر کد (QR Code)</span>
                        <span className="text-[10px] text-muted-foreground block truncate">ساخت و اسکن کدهای هوشمند</span>
                      </div>
                    </div>
                    {dir === 'rtl' ? (
                      <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover/qr:text-cyan-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/qr:text-cyan-500 shrink-0" />
                    )}
                  </div>

                  {/* Flyout Submenu for QR Code */}
                  <div
                    className="absolute top-0 rtl:right-full rtl:mr-1.5 ltr:left-full ltr:ml-1.5 w-52 p-2 rounded-2xl bg-white dark:bg-zinc-950 backdrop-blur-xl border border-border shadow-2xl z-50 opacity-0 pointer-events-none group-hover/qr:opacity-100 group-hover/qr:pointer-events-auto transition-all duration-150 space-y-1 before:absolute rtl:before:-right-3 ltr:before:-left-3 before:top-0 before:w-4 before:h-full"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-1">
                      گزینه‌های کیوآر کد
                    </div>
                    <Link
                      href="/tools/qr-maker"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="p-2 rounded-xl hover:bg-cyan-500/10 transition-colors flex items-center gap-2 text-foreground hover:text-cyan-500"
                    >
                      <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                        <QrCode className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">ساختن کیوآر کد</span>
                        <span className="text-[10px] text-muted-foreground block">طراحی با لوگو و اشکال</span>
                      </div>
                    </Link>
                    <Link
                      href="/tools/qr-maker?tab=scan"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="p-2 rounded-xl hover:bg-cyan-500/10 transition-colors flex items-center gap-2 text-foreground hover:text-cyan-500"
                    >
                      <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">اسکن کیوآر کد</span>
                        <span className="text-[10px] text-muted-foreground block">اسکن با دوربین / فایل</span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Item 2: بارکد ساز جامع با Flyout Submenu */}
                <div className="relative group/barcode">
                  <div className="p-2 rounded-xl hover:bg-emerald-500/10 transition-colors flex items-center justify-between cursor-pointer border border-transparent hover:border-emerald-500/20 text-foreground group-hover/barcode:text-emerald-500">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Barcode className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">بارکد ساز جامع (Barcode)</span>
                        <span className="text-[10px] text-muted-foreground block truncate">116 مدل استاندارد بین‌المللی</span>
                      </div>
                    </div>
                    {dir === 'rtl' ? (
                      <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover/barcode:text-emerald-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/barcode:text-emerald-500 shrink-0" />
                    )}
                  </div>

                  {/* Flyout Submenu for Barcode */}
                  <div
                    className="absolute top-0 rtl:right-full rtl:mr-1.5 ltr:left-full ltr:ml-1.5 w-52 p-2 rounded-2xl bg-white dark:bg-zinc-950 backdrop-blur-xl border border-border shadow-2xl z-50 opacity-0 pointer-events-none group-hover/barcode:opacity-100 group-hover/barcode:pointer-events-auto transition-all duration-150 space-y-1 before:absolute rtl:before:-right-3 ltr:before:-left-3 before:top-0 before:w-4 before:h-full"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-1">
                      گزینه‌های بارکد ساز
                    </div>
                    <Link
                      href="/tools/barcode-maker"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="p-2 rounded-xl hover:bg-emerald-500/10 transition-colors flex items-center gap-2 text-foreground hover:text-emerald-500"
                    >
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Barcode className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">ساختن بارکد</span>
                        <span className="text-[10px] text-muted-foreground block">116 مدل در 13 دسته</span>
                      </div>
                    </Link>
                    <Link
                      href="/tools/barcode-maker?tab=scan"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="p-2 rounded-xl hover:bg-emerald-500/10 transition-colors flex items-center gap-2 text-foreground hover:text-emerald-500"
                    >
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Scan className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">اسکن بارکد</span>
                        <span className="text-[10px] text-muted-foreground block">اسکن خطوط و کدهای 2D</span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Item 3: امضای ایمیل سازمانی */}
                <Link
                  href="/tools/email-signature"
                  onClick={() => setToolsDropdownOpen(false)}
                  className="p-2 rounded-xl hover:bg-amber-500/10 transition-colors flex items-center justify-between border border-transparent hover:border-amber-500/20 text-foreground hover:text-amber-500 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">امضای ایمیل رسمی</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-500 font-mono">
                          NEW
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        قالب‌های استاندارد HTML
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Item 4: تاریخچه ابزارهای من */}
                <div className="pt-1.5 border-t border-border/50">
                  <Link
                    href="/tools/history"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 transition-colors group/hist font-bold text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-cyan-500 group-hover/hist:rotate-12 transition-transform" />
                      <span>تاریخچه ابزارهای من (کدهای ذخیره‌شده)</span>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 rtl:block ltr:hidden group-hover/hist:-translate-x-0.5 transition-transform" />
                    <ArrowRight className="w-3.5 h-3.5 ltr:block rtl:hidden group-hover/hist:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
            </div>
          </div>

          {navLinks.slice(3).map((link) => {
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
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 max-w-[200px]"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{session.user?.name || t('nav.dashboard', 'داشبورد')}</span>
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
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-foreground/80 hover:text-cyan-500 py-1.5 transition-colors"
              >
                {link.title}
              </Link>
            ))}

            {/* Mobile Tools Section */}
            <div className="py-2.5 border-y border-border/50 my-1 space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Wrench className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t('nav.tools', 'امکانات جانبی (جعبه ابزار دیجیتال)')}</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/tools/qr-maker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 hover:bg-cyan-500/10 text-xs font-semibold text-foreground transition-colors"
                >
                  <QrCode className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>ساخت QR کد</span>
                </Link>
                <Link
                  href="/tools/qr-maker?tab=scan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 hover:bg-cyan-500/10 text-xs font-semibold text-foreground transition-colors"
                >
                  <Camera className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>اسکنر QR کد</span>
                </Link>
                <Link
                  href="/tools/barcode-maker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 hover:bg-emerald-500/10 text-xs font-semibold text-foreground transition-colors"
                >
                  <Barcode className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ساخت بارکد</span>
                </Link>
                <Link
                  href="/tools/barcode-maker?tab=scan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 hover:bg-emerald-500/10 text-xs font-semibold text-foreground transition-colors"
                >
                  <Scan className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>اسکنر بارکد</span>
                </Link>
              </div>

              <Link
                href="/tools/email-signature"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-amber-500/10 text-xs font-semibold text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>ساخت امضای ایمیل</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-500 font-mono">
                  NEW
                </span>
              </Link>

              <Link
                href="/tools/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-bold text-cyan-500 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>تاریخچه ابزارهای من</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-500 rtl:rotate-180" />
              </Link>
            </div>

            {navLinks.slice(3).map((link) => (
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
                  <User className="w-4 h-4" />
                  <span className="truncate">{session.user?.name || t('nav.dashboard', 'داشبورد کاربری')}</span>
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
