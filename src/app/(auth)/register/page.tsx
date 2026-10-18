'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { MathCaptcha } from '@/components/auth/MathCaptcha';
import { PhoneInput } from '@/components/ui/phone-input';
import { SiteLogo } from '@/components/SiteLogo';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Phone,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCaptchaValid) {
      toast.error('کد امنیتی تایید نشده است', {
        description: 'لطفاً پاسخ سوال ضد ربات را به درستی وارد نمایید.',
      });
      return;
    }

    if (!name.trim()) {
      toast.error('لطفاً نام و تخلص خود را وارد نمایید.');
      return;
    }

    if (!email.trim()) {
      toast.error('لطفاً ایمیل خود را وارد نمایید.');
      return;
    }

    if (password.length < 6) {
      toast.error('رمز عبور باید حداقل شامل ۶ کاراکتر باشد.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call Register API
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : '',
          password,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok || !registerData.success) {
        toast.error('خطا در ثبت‌نام', {
          description: registerData.message || 'مشکلی رخ داده است.',
        });
        setIsLoading(false);
        return;
      }

      toast.success('ثبت‌نام با موفقیت انجام شد!', {
        description: 'در حال ورود خودکار به حساب کاربری...',
      });

      // 2. Auto-login with Credentials
      const loginRes = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (loginRes?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error('خطای شبکه', {
        description: 'امکان اتصال به سرور وجود ندارد.',
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error('Google sign-up error:', err);
      toast.error('خطا در ثبت‌نام با گوگل');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background font-sans select-none" dir="rtl">
      {/* Background Glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 max-w-5xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center group-hover:border-cyan-500 transition-colors">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </div>
          <span>بازگشت به صفحه اصلی</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md z-10 my-12">
        <div className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Card Header Branding */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-3">
              <SiteLogo width={56} height={56} showText={false} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ساخت حساب <span className="text-cyan-500 dark:text-cyan-400">Arya Link</span>
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              کارت هوشمند و صفحه لینک اختصاصی خود را در کمتر از ۱ دقیقه بسازید
            </p>
          </div>

          {/* Google Sign-up Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-2xl border-border bg-background/50 hover:bg-muted text-foreground font-medium transition-all shadow-sm active:scale-[0.99] mb-5"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span className="text-xs font-semibold">ثبت‌نام سریع با حساب Google</span>
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[11px] text-muted-foreground uppercase tracking-wider shrink-0">
              یا پر کردن فرم
            </span>
            <div className="border-t border-border w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">نام و تخلص</label>
              <div className="relative">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: احمد نیازی"
                  required
                  className="h-11 rounded-2xl bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-cyan-500 pl-10 pr-3 text-sm font-sans"
                />
                <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">آدرس ایمیل</label>
              <div className="relative">
                <Input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-11 rounded-2xl bg-background/50 border-border text-foreground text-left placeholder:text-muted-foreground focus-visible:ring-cyan-500 pl-10 pr-3 font-outfit text-sm"
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Global Phone Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">
                شماره تماس (با انتخاب کشور)
              </label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="۷۹ ۱۲۳ ۴۵۶۷"
                defaultCountry="AF"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">رمز عبور (حداقل ۶ کاراکتر)</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-2xl bg-background/50 border-border text-foreground text-left placeholder:text-muted-foreground focus-visible:ring-cyan-500 pl-10 pr-10 font-outfit text-sm"
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">تکرار رمز عبور</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-2xl bg-background/50 border-border text-foreground text-left placeholder:text-muted-foreground focus-visible:ring-cyan-500 pl-10 pr-3 font-outfit text-sm"
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Security Captcha */}
            <MathCaptcha onVerify={setIsCaptchaValid} />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading || !isCaptchaValid}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.99] mt-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ایجاد حساب کاربری...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ساخت حساب کاربری و ورود</span>
                </>
              )}
            </Button>
          </form>

          {/* Footer Link to Login */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline mr-1"
              >
                ورود به حساب
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
