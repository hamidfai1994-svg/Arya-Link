'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  Loader2,
  Globe,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';

export default function AboutPage() {
  const { language, dir } = useLanguage();
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cms/company', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.company) {
        setCompany(json.company);
      }
    } catch (err) {
      console.error('Error fetching company info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans select-none" dir={dir}>
      {/* Hero */}
      <section className="py-16 sm:py-24 border-b border-border bg-muted/20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <Badge variant="cyan" className="text-xs">
            داستان ما و تعهد به نوآوری
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            {getLocalizedText(company?.companyName, language, 'شرکت فناوری آریا لینک')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {getLocalizedText(company?.slogan, language, 'پیشگام در کارت‌های هوشمند NFC و هویت دیجیتال در افغانستان')}
          </p>
        </div>
      </section>

      {/* Stats Row */}
      {company?.stats && (
        <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {company.stats.map((s: any, idx: number) => (
              <Card key={idx} className="rounded-2xl border-border bg-card/90 backdrop-blur-xl p-5 text-center shadow-lg">
                <span className="text-2xl sm:text-3xl font-black font-sans text-cyan-500 block mb-1">
                  {s.value}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">{s.label}</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Story & Mission Section */}
      <main className="max-w-6xl mx-auto px-4 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs">
              داستان شکل‌گیری
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              چرا آریا لینک را ساختیم؟
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {getLocalizedText(company?.aboutStory, language)}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-cyan-500" />
                <span>ماموریت ما (Mission)</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getLocalizedText(company?.mission, language)}
              </p>
            </div>

            <div className="pt-4 border-t border-border/60">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>چشم‌انداز (Vision)</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getLocalizedText(company?.vision, language)}
              </p>
            </div>
          </div>
        </div>

        {/* Branches & Offices Section */}
        <div className="space-y-8 pt-8 border-t border-border">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <Badge variant="cyan" className="text-xs">
              پوشش سراسری
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              دفتر مرکزی و نمایندگی‌های فعال در افغانستان
            </h2>
            <p className="text-xs text-muted-foreground">
              تحویل فوری کارت‌های فیزیکی هوشمند و ارائه خدمات پشتیبانی حضوری
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {company?.branches?.map((branch: any) => (
              <Card key={branch.id} className="rounded-3xl border-border bg-card p-6 space-y-4 shadow-sm hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <Building2 className="w-4 h-4 text-cyan-500" />
                    <span>{branch.name}</span>
                  </div>
                  {branch.isMainBranch && (
                    <Badge variant="cyan" className="text-[10px]">
                      دفتر مرکزی
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{branch.address} ({branch.city})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-sans" dir="ltr">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>مدیر شعبه: <strong>{branch.manager}</strong></span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
