'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Upload,
  Camera,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function UserKYCPage() {
  const [status, setStatus] = useState<string>('unverified');
  const [isVerified, setIsVerified] = useState(false);
  const [kycData, setKycData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [documentType, setDocumentType] = useState('tazkira');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/kyc', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setIsVerified(json.isVerified);
        setStatus(json.verificationStatus);
        setKycData(json.kycData || {});
      }
    } catch (err) {
      console.error('Error fetching KYC:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalId.trim() || !selfieUrl.trim() || !documentUrl.trim()) {
      toast.error('لطفاً تمامی موارد شامل شماره مدرک و هر دو تصویر را وارد نمایید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          nationalId,
          documentType,
          selfieUrl,
          documentUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error('خطا در ارسال مدارک', { description: json.message });
        setIsSubmitting(false);
        return;
      }

      toast.success('مدارک هویتی شما با موفقیت ثبت شد!', {
        description: 'کارشناسان ما به زودی مدارک شما را بررسی و تایید خواهند کرد.',
      });

      setStatus('pending');
      fetchKycStatus();
    } catch (err) {
      console.error('KYC submit error:', err);
      toast.error('خطای شبکه در ارسال مدارک.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateSelfieUpload = () => {
    // Generate realistic demo selfie URL for quick testing
    const sample = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
    setSelfieUrl(sample);
    toast.success('عکس سلفی ضمیمه شد.');
  };

  const handleSimulateDocUpload = () => {
    // Generate realistic demo ID doc URL for quick testing
    const sample = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80';
    setDocumentUrl(sample);
    toast.success('تصویر مدرک شناسایی ضمیمه شد.');
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="text-xs">در حال بارگذاری وضعیت احراز هویت...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-3xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            احراز هویت کاربران (KYC)
          </h1>
          {isVerified ? (
            <Badge variant="success" className="text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تایید شده با تیک آبی</span>
            </Badge>
          ) : status === 'pending' ? (
            <Badge variant="warning" className="text-xs flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>در انتظار تایید ادمین</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              تایید نشده
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          برای فعال‌سازی تیک آبی اصالت، فروش محصولات و برداشت درآمدهای مالی، اطلاعات هویتی خود را ثبت نمایید.
        </p>
      </div>

      {/* Case 1: Verified */}
      {isVerified && (
        <Card className="rounded-3xl border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">هویت شما تایید شده است</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              حساب کاربری و لینک‌های شما دارای تیک آبی رسمی اصالت هستند. تمامی امکانات شامل تسویه حساب مالی و فروشگاه فعال می‌باشند.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard/payouts">
              <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6">
                ورود به بخش تسویه حساب
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Case 2: Pending */}
      {!isVerified && status === 'pending' && (
        <Card className="rounded-3xl border-cyan-500/30 bg-cyan-500/5 p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-500 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">مدارک شما در صف بررسی است</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              مدارک هویتی و عکس سلفی شما با موفقیت دریافت شد و کارشناس احراز هویت در حال مطابقت اطلاعات است. نتیجه معمولاً ظرف 2 تا 4 ساعت اعلام می‌شود.
            </p>
          </div>
        </Card>
      )}

      {/* Case 3: Rejected */}
      {!isVerified && status === 'rejected' && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-3 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold block">درخواست قبلی شما رد شده است:</span>
            <span>{kycData?.rejectionReason || 'تصاویر ارسالی ناخوانا بودند. لطفاً مجدداً مدارک باکیفیت ارسال کنید.'}</span>
          </div>
        </div>
      )}

      {/* Case 4: Form to Submit */}
      {!isVerified && status !== 'pending' && (
        <Card className="rounded-3xl border-border bg-card/90 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmitKyc} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-500" />
                <span>1. اطلاعات هویتی و فردی</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    نام و نام خانوادگی کامل (مطابق مدرک) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="مثلاً: محمد امین عزیزی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    نوع مدرک شناسایی <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full h-11 rounded-xl bg-background border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="tazkira">تذکره الکترونیکی افغانستان</option>
                    <option value="passport">پاسپورت معتبر</option>
                    <option value="driving_license">گواهینامه رانندگی</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  شماره مدرک (تذکره یا پاسپورت) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: 1401-209-48291"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  required
                  className="h-11 rounded-xl font-sans text-xs text-left"
                />
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-500" />
                <span>2. تصاویر مدارک و عکس سلفی</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selfie Box */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground block">
                    عکس سلفی چهره (سلفی زنده) <span className="text-rose-500">*</span>
                  </label>
                  <div className="p-4 rounded-2xl border border-dashed border-border text-center space-y-3 bg-muted/20">
                    {selfieUrl ? (
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden mx-auto border border-cyan-500 shadow-md">
                        <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <Input
                        type="url"
                        dir="ltr"
                        placeholder="آدرس اینترنتی یا کلیک روی دکمه نمونه"
                        value={selfieUrl}
                        onChange={(e) => setSelfieUrl(e.target.value)}
                        className="h-9 rounded-xl text-[11px] font-sans text-left"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleSimulateSelfieUpload}
                        className="w-full rounded-xl text-[11px] font-semibold h-8"
                      >
                        + انتخاب نمونه سلفی
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ID Card Box */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground block">
                    تصویر مدرک هویتی (روی تذکره / پاسپورت) <span className="text-rose-500">*</span>
                  </label>
                  <div className="p-4 rounded-2xl border border-dashed border-border text-center space-y-3 bg-muted/20">
                    {documentUrl ? (
                      <div className="relative w-28 h-20 rounded-2xl overflow-hidden mx-auto border border-cyan-500 shadow-md">
                        <img src={documentUrl} alt="Document" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <Input
                        type="url"
                        dir="ltr"
                        placeholder="آدرس اینترنتی تصویر مدرک"
                        value={documentUrl}
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        className="h-9 rounded-xl text-[11px] font-sans text-left"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleSimulateDocUpload}
                        className="w-full rounded-xl text-[11px] font-semibold h-8"
                      >
                        + انتخاب نمونه تصویر مدرک
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 active:scale-98 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ارسال اطلاعات برای تایید...</span>
                </>
              ) : (
                <span>ارسال مدارک جهت بررسی و دریافت تیک آبی</span>
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
