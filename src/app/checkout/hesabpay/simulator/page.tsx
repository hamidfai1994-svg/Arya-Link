'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight, Smartphone, Building, RefreshCw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

function HesabPaySimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || '';
  const orderNumber = searchParams.get('orderNumber') || 'ORD-98214';
  const amount = searchParams.get('amount') || '3500';
  const customerName = searchParams.get('name') || 'مشتری آریا لینک';
  const customerPhone = searchParams.get('phone') || '+93 788 123 456';

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'direct'>('app');

  const formattedAmount = Number(amount || 0).toLocaleString();
  const transactionId = `HP-TX-${Date.now()}`;

  const handleApprovePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      router.push(
        `/api/checkout/hesabpay/callback?orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(
          orderNumber
        )}&status=SUCCESS&transactionId=${encodeURIComponent(transactionId)}`
      );
    }, 1200);
  };

  const handleCancelPayment = () => {
    router.push(
      `/api/checkout/hesabpay/callback?orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(
        orderNumber
      )}&status=CANCELLED`
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6" dir="rtl">
      {/* HesabPay Header */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/30">
            HP
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">حساب‌پی (HesabPay)</h1>
            <p className="text-[10px] text-emerald-400">درگاه پرداخت الکترونیک دارای مجوز د افغانستان بانک</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
          <Lock className="w-3 h-3" />
          <span>Sandbox Safe</span>
        </div>
      </header>

      {/* Main Payment Card */}
      <main className="max-w-md mx-auto w-full my-auto py-6">
        <div className="bg-slate-950 rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6">
          {/* Order Details Banner */}
          <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>طرف قرارداد / پذیرنده:</span>
              <span className="font-semibold text-white">آریا لینک (Aryalink)</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>شماره سفارش:</span>
              <span className="font-mono text-cyan-400 font-bold" dir="ltr">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>نام مشتری:</span>
              <span className="text-slate-200">{customerName}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-bold">مبلغ کل قابل پرداخت:</span>
              <span className="text-xl font-black text-emerald-400 font-sans">{formattedAmount} AFN</span>
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-white/5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('app')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'app'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>اسکن با اپلیکیشن</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'direct'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>پرداخت مستقیم</span>
            </button>
          </div>

          {/* QR Code Scan Tab */}
          {activeTab === 'app' ? (
            <div className="text-center space-y-3">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={`hesabpay://pay?merchant=ARYALINK&order=${orderNumber}&amount=${amount}`}
                  size={160}
                  level="H"
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                اپلیکیشن <strong className="text-white">حساب‌پی</strong> را باز کرده و کد فوق را با کمره اسکن فرمایید.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">شماره حساب یا موبایل در حساب‌پی:</label>
                <input
                  type="text"
                  defaultValue={customerPhone}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-left"
                  dir="ltr"
                />
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                پیامک حاوی کد تأیید (OTP) یا اعلان تأیید در اپلیکیشن برای شما ارسال خواهد شد.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <Button
              type="button"
              disabled={isProcessing}
              onClick={handleApprovePayment}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال تأیید تراکنش با بانک...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تأیید پرداخت و کسر وجه ({formattedAmount} AFN)</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancelPayment}
              className="w-full h-10 rounded-xl border-white/15 text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>انصراف و بازگشت به سبد خرید</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-[11px] text-slate-500 space-y-1 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>تراکنش امن با رمزنگاری 256 بیتی تحت نظارت بانک مرکزی افغانستان</span>
        </div>
        <p>© {new Date().getFullYear()} HesabPay Afghanistan. تمام حقوق محفوظ است.</p>
      </footer>
    </div>
  );
}

export default function HesabPaySimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
      }
    >
      <HesabPaySimulatorContent />
    </Suspense>
  );
}

