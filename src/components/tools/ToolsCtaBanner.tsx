'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function ToolsCtaBanner() {
  const { dir, language } = useLanguage();
  const isRtl = dir === 'rtl';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-16 sm:my-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 p-8 sm:p-12 shadow-2xl shadow-cyan-500/10 text-white">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-start">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'en'
                  ? 'Smart NFC & Unified Bio Link'
                  : language === 'ps'
                    ? 'د سمارټ NFC او بایو لینک یوځای والی'
                    : 'کارت ویزیت هوشمند NFC و لینک‌بایو'}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
              {language === 'en' ? (
                <>
                  Instead of disconnected codes, unify all your channels into one{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Smart Digital Business Card
                  </span>
                </>
              ) : language === 'ps' ? (
                <>
                  د تیت او پرک کوډونو پر ځای، خپلې ټولې اړیکې په یوه{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    ډیجیټل سمارټ ویزټ کارټ
                  </span>{' '}
                  کې یوځای کړئ
                </>
              ) : (
                <>
                  به جای ساخت کدهای پراکنده، تمام راه‌های ارتباطی خود را در یک{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    کارت ویزیت دیجیتال
                  </span>{' '}
                  یکپارچه کنید
                </>
              )}
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {language === 'en'
                ? 'Create a custom digital profile with clickable contacts, social channels, payment gateways, live analytics, and NFC tap technology in seconds.'
                : language === 'ps'
                  ? 'په څو ثانیو کې د اړیکو تڼیو، ټولنیزو شبکو، تادیاتي دروازو او لمسي NFC سره خپل ځانګړی پروفایل وړیا جوړ کړئ.'
                  : 'در چند دقیقه کارت ویزیت هوشمند خود را بسازید و با لمس NFC، کیوآر کد اختصاصی و یک لینک یکپارچه با مشتریان در ارتباط باشید.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {language === 'en' ? '100% Free Signup' : language === 'ps' ? '100% وړیا نوم‌لیکنه' : '100% ثبت‌نام رایگان'}
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                {language === 'en' ? 'No App Required' : language === 'ps' ? 'اپلیکیشن ته اړتیا نشته' : 'بدون نیاز به نصب اپلیکیشن'}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-3 border border-white/20"
              >
                <span>
                  {language === 'en'
                    ? 'Create Free Card'
                    : language === 'ps'
                      ? 'وړیا کارټ جوړ کړئ'
                      : 'ساخت رایگان کارت'}
                </span>
                {isRtl ? (
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ToolsCtaBanner;
