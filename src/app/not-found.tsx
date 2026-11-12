import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Home, CreditCard } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-500/20"
      dir="rtl"
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-center">
          <SiteLogo />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
            خطای ۴۰۴ - صفحه یافت نشد
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white pt-2">
            کارت یا صفحه مورد نظر پیدا نشد
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            لینک یا چیپست هوشمند NFC اسکن‌شده به هیچ پروفایل یا کارت ویزیت معتبری در سیستم متصل نیست یا هنوز توسط کاربر فعال نشده است.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Home className="w-4 h-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
          <Link
            href="/order"
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700/60 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>سفارش کارت هوشمند اختصاصی</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

