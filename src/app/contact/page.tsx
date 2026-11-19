'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteContentProvider, useSiteContent } from '@/context/SiteContentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getLocalizedText } from '@/lib/i18n/multilingual';
import { DEFAULT_CONTACT_US_CONTENT } from '@/models/SiteContent.model';
import { getContactMessageSchema } from '@/lib/validations/forms';
import { toast } from 'sonner';

function ContactPageInner() {
  const { language, dir, t } = useLanguage();
  const { contactUs } = useSiteContent();
  const info = contactUs || DEFAULT_CONTACT_US_CONTENT;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = getContactMessageSchema(language);
    const parsed = schema.safeParse({
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      messageText: message,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || t('validation.required'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-aryalink-lang': language,
        },
        body: JSON.stringify({
          name: parsed.data.senderName,
          email: parsed.data.senderEmail,
          phone: parsed.data.senderPhone,
          message: parsed.data.senderPhone
            ? parsed.data.messageText
            : parsed.data.messageText,
          locale: language,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || t('toast.message_sent'));
        setIsSent(true);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        toast.error(data.message || t('toast.message_error'));
      }
    } catch {
      toast.error(t('toast.network_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-2xl mx-auto space-y-4"
        >
          <Badge variant="cyan" className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{getLocalizedText(info.badge, language)}</span>
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            {getLocalizedText(info.title, language)}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {getLocalizedText(info.subtitle, language)}
          </p>
        </motion.div>

        {/* Grid: Contact Cards + Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Info Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-card/70 dark:bg-zinc-900/50 border border-border/80 backdrop-blur-xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold text-foreground">
                    {getLocalizedText(info.officeTitle, language)}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getLocalizedText(info.officeAddress, language)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-border/60">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-foreground">
                    {getLocalizedText(info.workingHoursLabel, language)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {getLocalizedText(info.workingHours, language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {info.supportPhone && (
                <a
                  href={`tel:${info.supportPhone.replace(/\s+/g, '')}`}
                  className="p-4 rounded-2xl bg-card/70 dark:bg-zinc-900/50 border border-border/80 hover:border-cyan-500/40 flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block">
                      {t('pages.contact.phone_title', 'نمبر تماس پشتیبانی')}
                    </span>
                    <span className="text-sm font-bold text-foreground font-mono" dir="ltr">
                      {info.supportPhone}
                    </span>
                  </div>
                </a>
              )}

              {info.supportEmail && (
                <a
                  href={`mailto:${info.supportEmail}`}
                  className="p-4 rounded-2xl bg-card/70 dark:bg-zinc-900/50 border border-border/80 hover:border-cyan-500/40 flex items-center gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-muted-foreground block">
                      {t('pages.contact.email_title', 'ایمیل رسمی')}
                    </span>
                    <span className="text-sm font-bold text-foreground font-mono truncate block" dir="ltr">
                      {info.supportEmail}
                    </span>
                  </div>
                </a>
              )}

              <div className="grid grid-cols-2 gap-3">
                {info.whatsappNumber && (
                  <a
                    href={`https://wa.me/${info.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {info.telegramHandle && (
                  <a
                    href={`https://t.me/${info.telegramHandle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/15 flex items-center justify-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-card/80 dark:bg-zinc-900/60 border border-border/80 backdrop-blur-xl shadow-xl">
            {isSent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-foreground">
                  {t('toast.message_sent', 'پیام شما با موفقیت ثبت و ارسال گردید.')}
                </h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {t('pages.contact.sent_desc', 'تیم پشتیبانی آریا لینک پیام شما را دریافت کرد و به زودی با شما تماس می‌گیرد.')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSent(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  {t('pages.contact.send_another', 'ارسال پیام جدید')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-foreground">
                    {t('pages.contact.form_title', 'ارسال پیام مستقیم به تیم پشتیبانی')}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.contact.form_sub', 'سوالات، پیشنهادها و درخواست‌های همکاری سازمانی خود را از طریق فورم ذیل برای ما بفرستید.')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {t('pages.contact.name_label', 'نام و تخلص')} *
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('pages.contact.name_placeholder', 'مثال: فرهاد رسولی')}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      {t('pages.contact.phone_label', 'نمبر تماس / واتساپ')}
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('pages.contact.phone_placeholder', '+93 799 000 000')}
                      dir="ltr"
                      className="h-11 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {t('pages.contact.email_label', 'آدرس ایمیل')}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('pages.contact.email_placeholder', 'you@domain.af')}
                    dir="ltr"
                    className="h-11 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {t('pages.contact.message_label', 'متن پیام یا درخواست')} *
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('pages.contact.message_placeholder', 'پیام خود را به صورت واضح بنویسید...')}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('common.sending', 'در حال ارسال...')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('pages.contact.submit_btn', 'ارسال پیام به آریا لینک')}</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <SiteContentProvider>
      <ContactPageInner />
    </SiteContentProvider>
  );
}
