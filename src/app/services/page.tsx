'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  CreditCard,
  Building2,
  ShoppingBag,
  Globe,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';

interface Service {
  _id: string;
  title: any;
  slug: string;
  summary: any;
  description: any;
  icon: string;
  features: string[];
  targetAudience: any;
  pricingInfo: string;
}

export default function ServicesPage() {
  const { language, dir } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cms/services', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setServices(json.services || []);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className="w-7 h-7 text-cyan-500" />;
      case 'Building2':
        return <Building2 className="w-7 h-7 text-blue-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-7 h-7 text-emerald-500" />;
      case 'Globe':
        return <Globe className="w-7 h-7 text-purple-500" />;
      default:
        return <Layers className="w-7 h-7 text-cyan-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans select-none" dir={dir}>


      {/* Hero */}
      <section className="py-16 sm:py-24 border-b border-border bg-muted/20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <Badge variant="cyan" className="text-xs">
            راهکارهای هوشمند تجاری و سازمانی
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            خدمات یکپارچه کارت هوشمند و هویت دیجیتال
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            از تولید کارت‌های فیزیکی لمسی NFC تا مدیریت پرسنل شرکت‌ها و راه‌اندازی درگاه پرداخت محلی افغانی
          </p>
        </div>
      </section>

      {/* Services List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <span className="text-xs text-muted-foreground">در حال بارگذاری لیست خدمات...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card
                key={service._id}
                className="rounded-3xl border-border bg-card p-8 flex flex-col justify-between shadow-sm hover:border-cyan-500/40 hover:shadow-xl transition-all group"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getServiceIcon(service.icon)}
                    </div>
                    <Badge variant="outline" className="text-xs font-bold font-sans text-cyan-500 border-cyan-500/30">
                      {service.pricingInfo}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                      {getLocalizedText(service.title, language)}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {getLocalizedText(service.description, language)}
                    </p>
                  </div>

                  {/* Features Checklist */}
                  {service.features && service.features.length > 0 && (
                    <div className="pt-2 space-y-2 border-t border-border/60">
                      {service.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[11px] text-muted-foreground pt-1">
                    <span>مخاطب هدف: </span>
                    <strong className="text-foreground">{getLocalizedText(service.targetAudience, language)}</strong>
                  </div>
                </div>

                <div className="pt-6 border-t border-border mt-6">
                  <Link href="/register">
                    <Button className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs h-11 shadow-md">
                      سفارش و شروع همکاری
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
