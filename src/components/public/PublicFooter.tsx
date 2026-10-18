'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';

export function PublicFooter() {
  const { t, dir, language } = useLanguage();

  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-md pt-16 pb-12 select-none" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border/60">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg font-outfit shadow-md shadow-cyan-500/20">
                AL
              </div>
              <span className="font-extrabold text-foreground tracking-tight text-lg font-outfit">
                Arya Link
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              {t('footer.desc', 'پیشرفته‌ترین سامانه هویت دیجیتال، کارت ویزیت لمسی NFC و درگاه اختصاصی لینک‌بایو در افغانستان.')}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                <span>کابل، افغانستان</span>
              </span>
              <span className="flex items-center gap-1.5 font-outfit" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-cyan-500" />
                <span>+93 79 123 4567</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {language === 'en' ? 'Quick Links' : language === 'ps' ? 'ګړندي لینکونه' : 'دسترسی سریع'}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-cyan-500 transition-colors">
                  {t('nav.home', 'صفحه اصلی')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-cyan-500 transition-colors">
                  {t('nav.services', 'خدمات سازمانی')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-cyan-500 transition-colors">
                  {t('nav.blog', 'بلاگ و مقالات')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan-500 transition-colors">
                  {t('nav.about', 'درباره ما و دفاتر')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {language === 'en' ? 'Account & Platform' : language === 'ps' ? 'حساب او پلیټفارم' : 'حساب کاربری'}
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-cyan-500 transition-colors">
                  {t('nav.login', 'ورود به حساب')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-cyan-500 transition-colors">
                  {t('nav.register', 'ساخت کارت رایگان')}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-cyan-500 transition-colors">
                  {t('nav.pricing', 'تعرفه‌ها و اشتراک')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Arya Link Tech. {t('footer.rights', 'تمامی حقوق محفوظ است.')}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">سامانه آنلاین و فعال در سرورهای ابری</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default PublicFooter;
