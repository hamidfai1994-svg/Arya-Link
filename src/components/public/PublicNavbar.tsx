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

          {/* Tools Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'transition-colors py-1 relative hover:text-cyan-500 flex items-center gap-1.5 outline-none cursor-pointer',
                  isToolsActive ? 'text-cyan-500 font-bold' : ''
                )}
              >
                <Wrench className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t('nav.tools', 'امکانات جانبی')}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                {isToolsActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={dir === 'rtl' ? 'start' : 'end'}
              className="w-72 p-2 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-border shadow-xl z-50 animate-in fade-in-50 zoom-in-95"
            >
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/50 mb-1">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>{t('nav.tools_desc', 'جعبه ابزار دیجیتال و کاربردی')}</span>
              </div>
              {tools.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <DropdownMenuItem key={item.href} asChild className="p-0 focus:bg-transparent cursor-pointer">
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 group hover:bg-cyan-500/10 dark:hover:bg-cyan-500/15',
                        active ? 'bg-cyan-500/10 text-cyan-500' : 'text-foreground'
                      )}
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate group-hover:text-cyan-500 transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-500 font-mono font-bold">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

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
            <div className="py-2 border-y border-border/50 my-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Wrench className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t('nav.tools', 'امکانات جانبی (جعبه ابزار)')}</span>
              </span>
              <div className="grid grid-cols-1 gap-2 pl-2 pr-2">
                {tools.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-xl transition-colors',
                        active ? 'bg-cyan-500/10 text-cyan-500 font-bold' : 'text-foreground/80 hover:bg-muted'
                      )}
                    >
                      <Icon className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span className="text-xs">{item.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-500 ms-auto font-mono">
                        {item.badge}
                      </span>
                    </Link>
                  );
                })}
              </div>
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
