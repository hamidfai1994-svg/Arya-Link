'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Lock,
  DollarSign,
  Truck,
  Save,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Building,
  Key,
  Globe,
  Bell,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Platform General
  const [platformName, setPlatformName] = useState('آریا لینک (Arya Link)');
  const [supportEmail, setSupportEmail] = useState('support@aryalink.af');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Payment Gateways
  const [hesabPayMerchant, setHesabPayMerchant] = useState('HESAB-AF-89412');
  const [hesabPayLive, setHesabPayLive] = useState(true);
  const [aziziBankActive, setAziziBankActive] = useState(true);

  // Pricing
  const [proMonthlyPrice, setProMonthlyPrice] = useState(450);
  const [enterpriseMonthlyPrice, setEnterpriseMonthlyPrice] = useState(1800);

  // Security
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(5);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(10);
  const [captchaEnabled, setCaptchaEnabled] = useState(true);

  // NFC Logistics
  const [pvcPrice, setPvcPrice] = useState(1500);
  const [metalPrice, setMetalPrice] = useState(3500);
  const [woodPrice, setWoodPrice] = useState(2400);
  const [shippingFee, setShippingFee] = useState(200);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to save platform settings
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('تنظیمات کلان پلتفرم با موفقیت به‌روزرسانی شد.');
    } catch (err) {
      toast.error('خطا در ذخیره تنظیمات پلتفرم.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 select-none"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                تنظیمات کلان پلتفرم (Platform Settings)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                پیکربندی سراسری درگاه‌های بانکی، تعرفه‌ها، امنیت و لجستیک کارت‌های فیزیکی
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20 flex items-center gap-2 self-start sm:self-auto"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>در حال ذخیره...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>ذخیره تنظیمات سیستم</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: General Platform Config */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-extrabold text-white">
              تنظیمات عمومی سامانه (General System)
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">نام پلتفرم</label>
              <Input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="h-11 rounded-2xl bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">ایمیل پشتیبانی رسمی</label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="h-11 rounded-2xl bg-slate-950 border-slate-800 text-xs text-white font-outfit"
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">
                  حالت تعمیرات و نگهداری (Maintenance Mode)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  دسترسی عمومی کاربران غیر از مدیران ارشد به سایت موقتاً مسدود می‌شود.
                </span>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
          </div>
        </div>

        {/* Section 2: Afghan Payment Gateways */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white">
              درگاه‌های پرداخت افغانستان (Payment Gateways)
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">شناسه پذیرنده HesabPay</label>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>فعال (Live)</span>
                </div>
              </div>
              <Input
                type="text"
                value={hesabPayMerchant}
                onChange={(e) => setHesabPayMerchant(e.target.value)}
                className="h-11 rounded-2xl bg-slate-950 border-slate-800 text-xs text-white font-outfit"
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">
                  پذیرش انتقال بانکی (عزیزی بانک و کابل بانک)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  امکان واریز مستقیم به شماره حساب بانکی و آپلود فیش واریز
                </span>
              </div>
              <Switch checked={aziziBankActive} onCheckedChange={setAziziBankActive} />
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center justify-between">
              <span>واحد پول پایه سیستم:</span>
              <span className="font-outfit font-black text-sm">افغانی (AFN)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Subscription Pricing */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">
              تعرفه‌ها و پلن‌های پلتفرم (Subscription Plans)
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">پلن حرفه‌ای (Pro Monthly)</span>
                <span className="text-[10px] text-slate-400">امکانات کامل بیولینک و سئو</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={proMonthlyPrice}
                  onChange={(e) => setProMonthlyPrice(Number(e.target.value))}
                  className="w-24 h-10 rounded-xl bg-slate-900 border-slate-700 text-xs text-white font-outfit font-bold text-center"
                />
                <span className="text-xs text-slate-400">AFN / ماه</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">پلن شرکتی (Enterprise Monthly)</span>
                <span className="text-[10px] text-slate-400">مدیریت تیم و دامنه‌های نامحدود</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={enterpriseMonthlyPrice}
                  onChange={(e) => setEnterpriseMonthlyPrice(Number(e.target.value))}
                  className="w-24 h-10 rounded-xl bg-slate-900 border-slate-700 text-xs text-white font-outfit font-bold text-center"
                />
                <span className="text-xs text-slate-400">AFN / ماه</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Physical NFC Card Production */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Truck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-extrabold text-white">
              تعرفه‌های تولید کارت هوشمند فیزیکی (NFC Logistics)
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">PVC مات لوکس:</span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={pvcPrice}
                  onChange={(e) => setPvcPrice(Number(e.target.value))}
                  className="h-9 rounded-xl bg-slate-900 border-slate-700 text-xs text-white font-outfit font-bold"
                />
                <span className="text-[10px] text-slate-400 font-sans">AFN</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">استیل فلزی:</span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={metalPrice}
                  onChange={(e) => setMetalPrice(Number(e.target.value))}
                  className="h-9 rounded-xl bg-slate-900 border-slate-700 text-xs text-white font-outfit font-bold"
                />
                <span className="text-[10px] text-slate-400 font-sans">AFN</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">چوب طبیعی ارگانیک:</span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={woodPrice}
                  onChange={(e) => setWoodPrice(Number(e.target.value))}
                  className="h-9 rounded-xl bg-slate-900 border-slate-700 text-xs text-white font-outfit font-bold"
                />
                <span className="text-[10px] text-slate-400 font-sans">AFN</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block">ارسال پستی استاندارد:</span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="h-9 rounded-xl bg-slate-900 border-slate-700 text-xs text-white font-outfit font-bold"
                />
                <span className="text-[10px] text-slate-400 font-sans">AFN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Security & Rate Limits */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-extrabold text-white">
              امنیت ورود و محدودسازی نرخ درخواست (Security & Rate Limits)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-300 block">
                حداکثر تلاش‌های ناموفق لاگین
              </span>
              <span className="text-[11px] text-slate-500 block">
                تعداد تلاش قبل از قفل شدن موقت فرم
              </span>
              <div className="flex items-center gap-2 pt-2">
                <Input
                  type="number"
                  value={maxFailedAttempts}
                  onChange={(e) => setMaxFailedAttempts(Number(e.target.value))}
                  className="w-24 h-10 rounded-xl bg-slate-900 border-slate-700 text-xs text-white font-outfit font-bold text-center"
                />
                <span className="text-xs text-slate-400">مرتبه تلاش</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-slate-300 block">
                مدت زمان قفل امنیتی (Lockout)
              </span>
              <span className="text-[11px] text-slate-500 block">
                تایمر معکوس برای باز شدن مجدد لاگین
              </span>
              <div className="flex items-center gap-2 pt-2">
                <Input
                  type="number"
                  value={lockoutDurationMinutes}
                  onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))}
                  className="w-24 h-10 rounded-xl bg-slate-900 border-slate-700 text-xs text-white font-outfit font-bold text-center"
                />
                <span className="text-xs text-slate-400">دقیقه</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">
                  کپچای تصویری پازلی (Image Puzzle CAPTCHA)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  اجبار به حل پازل اسلایدر در هنگام لاگین و ثبت‌نام
                </span>
              </div>
              <div className="pt-3 flex justify-end">
                <Switch checked={captchaEnabled} onCheckedChange={setCaptchaEnabled} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
