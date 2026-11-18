'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminCmsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/admin/system');
    }, 800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[65vh] p-4 select-none font-sans" dir="rtl">
      <Card className="max-w-lg w-full p-8 rounded-3xl bg-card border border-border shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shadow-inner">
          <SlidersHorizontal className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="cyan" className="text-[11px]">
              ادغام و یکپارچه‌سازی سیستم
            </Badge>
          </div>
          <h2 className="text-xl font-black text-foreground">
            انتقال به «مرکز کنترل یکپارچه سیستم»
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            بخش‌های پیشین مدیریت محتوا (CMS) و تنظیمات پلتفرم در یک مرکز کنترل واحد به آدرس{' '}
            <code className="text-cyan-500 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded-md" dir="ltr">
              /admin/system
            </code>{' '}
            ادغام گردیده‌اند. شما به صورت خودکار در حال انتقال هستید...
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/admin/system" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2">
              <span>ورود فوری به مرکز کنترل سیستم</span>
              <ArrowLeft className="w-4 h-4 mr-1" />
            </Button>
          </Link>
          <Link href="/admin/cms/blog" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-11 px-4 rounded-2xl border-border text-xs">
              <span>مدیریت مقالات بلاگ</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
