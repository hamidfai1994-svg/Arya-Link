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
  ChevronDown,
  Barcode,
  QrCode,
  Mail,
  Wrench,
  History,
  Camera,
  Scan,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
      desc: language === 'en' ? 'Linear, 2D, EAN, GS1 & Postal codes' : language === 'ps' ? 'د ۲۲ څخه زیاتو فارمټونو سره د بارکوډ جوړونکی' : 'تولید ده‌ها نوع بارکد میله‌ای، دوبعدی، پستی و بانکی',
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

          {/* Tools Dropdown Menu with Hover */}
          <div
            onMouseEnter={() => setToolsDropdownOpen(true)}
            onMouseLeave={() => setToolsDropdownOpen(false)}
            className="relative"
          >
            <DropdownMenu open={toolsDropdownOpen} onOpenChange={setToolsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={() => setToolsDropdownOpen((prev) => !prev)}
                  className={cn(
                    'transition-colors py-1 relative hover:text-cyan-500 flex items-center gap-1.5 outline-none cursor-pointer',
                    isToolsActive ? 'text-cyan-500 font-bold' : ''
                  )}
                >
                  <Wrench className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{t('nav.tools', 'امکانات جانبی')}</span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 opacity-70 transition-transform duration-200',
                      toolsDropdownOpen ? 'rotate-180' : ''
                    )}
                  />
                  {isToolsActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={dir === 'rtl' ? 'start' : 'end'}
                className="w-80 p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-border shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 space-y-2.5"
              >
                {/* Header */}
                <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/50 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-500" />
                    <span>جعبه ابزار دیجیتال</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 font-mono font-bold">
                    PRO
                  </span>
                </div>

                {/* Group 1: کیو آر کد */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-cyan-500 px-2 flex items-center gap-1">
                    <QrCode className="w-3 h-3" />
                    <span>کیوآر کد (QR Code)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <Link
                      href="/tools/qr-maker"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="p-2 rounded-xl hover:bg-cyan-500/10 transition-colors flex items-center gap-2 group border border-transparent hover:border-cyan-500/20"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white flex items-center justify-center transition-colors">
                        <QrCode className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block text-foreground group-hover:text-cyan-500 truncate">
                          ساخت QR
                        </span>
                        <span className="text-[9px] text-muted-foreground block truncate">
                          طراحی با لوگو
                        </span>
                      </div>
                    </Link>
                    <Link
                      href="/tools/qr-maker?tab=scanner"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="p-2 rounded-xl hover:bg-cyan-500/10 transition-colors flex items-center gap-2 group border border-transparent hover:border-cyan-500/20"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white flex items-center justify-center transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block text-foreground group-hover:text-cyan-500 truncate">
                          اسکنر QR
                        </span>
                        <span className="text-[9px] text-muted-foreground block truncate">
                          اسکن با دوربین
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Group 2: بارکد */}
                <div className="space-y-1 pt-1 border-t border-border/40">
                  <span className="text-[10px] font-bold text-emerald-500 px-2 flex items-center gap-1">
                    <Barcode className="w-3 h-3" />
                    <span>بارکد ساز جامع (Barcode)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <Link
                      href="/tools/barcode-maker"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="p-2 rounded-xl hover:bg-emerald-500/10 transition-colors flex items-center gap-2 group border border-transparent hover:border-emerald-500/20"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors">
                        <Barcode className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block text-foreground group-hover:text-emerald-500 truncate">
                          ساخت بارکد
                        </span>
                        <span className="text-[9px] text-muted-foreground block truncate">
                          116 مدل استاندارد
                        </span>
                      </div>
                    </Link>
                    <Link
                      href="/tools/barcode-maker?tab=scanner"
                      onClick={() => setToolsDropdownOpen(false)}
                      className="p-2 rounded-xl hover:bg-emerald-500/10 transition-colors flex items-center gap-2 group border border-transparent hover:border-emerald-500/20"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors">
                        <Scan className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block text-foreground group-hover:text-emerald-500 truncate">
                          اسکنر بارکد
                        </span>
                        <span className="text-[9px] text-muted-foreground block truncate">
                          دوربین و تصویر
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Group 3: امضای ایمیل */}
                <div className="space-y-1 pt-1 border-t border-border/40">
                  <span className="text-[10px] font-bold text-amber-500 px-2 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>امضای ایمیل سازمانی</span>
                  </span>
                  <Link
                    href="/tools/email-signature"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="p-2 rounded-xl hover:bg-amber-500/10 transition-colors flex items-center gap-2.5 group border border-transparent hover:border-amber-500/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground group-hover:text-amber-500 truncate">
                          ساخت امضای رسمی ایمیل
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-500 font-mono">
                          NEW
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block truncate">
                        قالب‌های استاندارد HTML برای جیمیل و اوت‌لوک
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Footer: تاریخچه ابزارهای من */}
                <div className="pt-1.5 border-t border-border/60">
                  <Link
                    href="/tools/history"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">تاریخچه ابزارهای من</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-500 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  href="/tools/qr-maker?tab=scanner"
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
                  href="/tools/barcode-maker?tab=scanner"
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
