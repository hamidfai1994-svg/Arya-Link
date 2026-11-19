'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, ShieldCheck, ArrowRight, FileText, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteContentProvider, useSiteContent } from '@/context/SiteContentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import { DEFAULT_LEGAL_CONTENT } from '@/models/SiteContent.model';

function TermsPageInner() {
  const { language, dir, t } = useLanguage();
  const { legal } = useSiteContent();

  const data = legal || DEFAULT_LEGAL_CONTENT;
  const sections =
    data.termsSections && data.termsSections.length > 0
      ? data.termsSections
      : DEFAULT_LEGAL_CONTENT.termsSections;

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center space-y-4"
        >
          <Badge variant="cyan" className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs">
            <Scale className="w-3.5 h-3.5" />
            <span>{getLocalizedText(data.termsBadge, language)}</span>
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            {getLocalizedText(data.termsTitle, language)}
          </h1>

          <p className="text-xs font-semibold text-cyan-500">
            {getLocalizedText(data.termsUpdatedAt, language)}
          </p>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {getLocalizedText(data.termsIntro, language)}
          </p>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-5">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id || idx}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="p-6 sm:p-8 rounded-3xl bg-card/70 dark:bg-zinc-900/50 border border-border/80 backdrop-blur-xl shadow-sm space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                  {getLocalizedText(section.title, language)}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {getLocalizedText(section.content, language)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-start">
            <ShieldCheck className="w-6 h-6 text-cyan-500 shrink-0 hidden sm:block" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t('pages.legal.privacy_title', 'سیاست حفظ حریم خصوصی')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('pages.legal.contact_hint', 'در صورت داشتن سوال حقوقی یا تخنیکی، با ما در تماس باشید.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/privacy">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('nav.privacy', 'حریم خصوصی')}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="sm" className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {t('nav.contact', 'تماس با ما')}
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <SiteContentProvider>
      <TermsPageInner />
    </SiteContentProvider>
  );
}
