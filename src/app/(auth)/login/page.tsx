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
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!email.trim() || !password) {
      toast.error('لطفاً ایمیل و رمز عبور خود را وارد کنید.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (!res?.ok || res?.error) {
        toast.error('خطا در ورود به حساب', {
          description: res?.error || 'ایمیل یا رمز عبور اشتباه است.',
        });
        setIsLoading(false);
        return;
      }

      toast.success('خوش آمدید!', {
        description: 'ورود موفقیت‌آمیز بود. در حال انتقال به داشبورد...',
      });

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error('خطای شبکه', {
        description: 'امکان برقراری ارتباط با سرور وجود ندارد.',
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error('خطا در ورود با گوگل');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background font-sans select-none" dir="rtl">
      {/* Dynamic Background Glows */}
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

      {/* Login Card */}
      <div className="w-full max-w-md z-10 my-12">
        <div className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Card Header Branding */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30 text-white font-extrabold text-xl font-outfit mb-3">
              AL
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ورود به <span className="text-cyan-500 dark:text-cyan-400">Arya Link</span>
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              مدیریت کارت هوشمند، پروفایل بیو و تحلیل بازدیدها
            </p>
          </div>

          {/* Google Sign-in Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
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
            <span className="text-xs font-semibold">ادامه با حساب Google</span>
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[11px] text-muted-foreground uppercase tracking-wider shrink-0">
              یا ورود با ایمیل
            </span>
            <div className="border-t border-border w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">رمز عبور</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  رمز را فراموش کردید؟
                </Link>
              </div>
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

            {/* Security Captcha */}
            <MathCaptcha onVerify={setIsCaptchaValid} />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading || !isCaptchaValid}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.99] mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال بررسی اطلاعات...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ورود به حساب کاربری</span>
                </>
              )}
            </Button>
          </form>

          {/* Footer Link to Register */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              حساب کاربری ندارید؟{' '}
              <Link
                href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline mr-1"
              >
                ثبت‌نام رایگان
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
