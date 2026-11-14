'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  UserCog,
  Mail,
  Phone,
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Save,
  RefreshCw,
  Camera,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Crown,
  Eye,
  EyeOff,
  X,
  Wallet,
  Store,
  QrCode,
  AlertCircle,
  Copy,
  Check,
  Upload,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface AccountData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  subscriptionPlan: string;
  isVerified: boolean;
  verificationStatus: string;
  createdAt: string;
}

export default function AccountSettingsPage() {
  const { data: session, update: updateSession } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email Change 2-Step OTP states
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Password states & visibility toggles
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tab State
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'finance'>(
    searchParams?.get('tab') === 'finance' ? 'finance' : 'profile'
  );

  // HesabPay Financial Settings states (Strictly Offline for Mini-site users)
  const [hesabPayConfig, setHesabPayConfig] = useState({
    accountNumber: '',
    accountName: '',
    qrCodeImage: '',
    instructions: '',
  });
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [isSavingFinancial, setIsSavingFinancial] = useState(false);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const fetchFinancialSettings = async () => {
    setIsLoadingFinancial(true);
    try {
      const res = await fetch('/api/user/financial-settings');
      const data = await res.json();
      if (data.success && data.settings?.hesabPay) {
        const hp = data.settings.hesabPay;
        setHesabPayConfig({
          accountNumber: hp.accountNumber || '',
          accountName: hp.accountName || '',
          qrCodeImage: hp.qrCodeImage || '',
          instructions: hp.instructions || '',
        });
      }
    } catch (err) {
      console.error('Error loading financial settings:', err);
    } finally {
      setIsLoadingFinancial(false);
    }
  };

  useEffect(() => {
    fetchFinancialSettings();
  }, []);

  const handleQrImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً صرفاً فایل تصویری (JPG یا PNG) انتخاب فرمایید.');
      return;
    }
    setIsUploadingQr(true);
    const convertToBase64 = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHesabPayConfig((prev) => ({ ...prev, qrCodeImage: reader.result as string }));
          toast.success('تصویر بارکد QR ذخیره شد. دکمه ذخیره را بزنید.');
        }
      };
      reader.readAsDataURL(file);
    };
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/receipt/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setHesabPayConfig((prev) => ({ ...prev, qrCodeImage: data.url }));
        toast.success('تصویر QR Code با موفقیت آپلود شد.');
      } else {
        convertToBase64();
      }
    } catch {
      convertToBase64();
    } finally {
      setIsUploadingQr(false);
      e.target.value = '';
    }
  };

  const handleSaveFinancial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFinancial(true);
    try {
      const res = await fetch('/api/user/financial-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hesabPay: hesabPayConfig }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'خطا در ذخیره‌سازی تنظیمات درگاه.');
      }
      toast.success('تنظیمات اختصاصی درگاه حساب‌پی با موفقیت ذخیره گردید و در مینی‌سایت شما فعال شد.');
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارتباط با سرور.');
    } finally {
      setIsSavingFinancial(false);
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  // Cooldown countdown for OTP resend
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldown]);

  const fetchAccountData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/account', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.user) {
        setAccountData(json.user);
        setName(json.user.name || '');
        setEmail(json.user.email || '');
        setPhone(json.user.phone || '');
        setAvatar(json.user.avatar || '');
      }
    } catch (err) {
      console.error('Error fetching account:', err);
      toast.error('خطا در دریافت مشخصات حساب کاربری.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP for email change
  const handleSendOtp = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      toast.error('لطفاً یک آدرس ایمیل معتبر وارد نمایید.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email_otp',
          newEmail: targetEmail,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'خطا در ارسال کد تایید به ایمیل جدید.');
      }

      setPendingEmail(targetEmail);
      setIsOtpModalOpen(true);
      setOtpCode('');
      setOtpCooldown(60);
      toast.success(json.message || `کد تایید 6 رقمی به ${targetEmail} ارسال گردید.`);

      if (json.demoOtp) {
        toast.info(`کد تایید آزمایشی: ${json.demoOtp}`, { duration: 8000 });
      }
    } catch (err: any) {
      toast.error(err.message || 'خطا در ارتباط با سرور.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP and complete email change
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('لطفاً کد تایید 6 رقمی را به صورت کامل درج نمایید.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_email_otp',
          newEmail: pendingEmail,
          otpCode: otpCode.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'کد تایید نادرست یا منقضی گردیده است.');
      }

      setAccountData(json.user);
      setEmail(json.user.email);
      setIsOtpModalOpen(false);
      setOtpCode('');
      await updateSession();
      toast.success('آدرس ایمیل حساب کاربری با موفقیت تغییر یافت و ذخیره شد.');
    } catch (err: any) {
      toast.error(err.message || 'خطا در تایید کد امنیتی.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('لطفاً نام کامل خود را درج نمایید.');
      return;
    }

    // Check if email was edited
    const currentRegisteredEmail = (accountData?.email || session?.user?.email || '').trim().toLowerCase();
    const enteredEmail = email.trim().toLowerCase();

    if (enteredEmail && enteredEmail !== currentRegisteredEmail) {
      await handleSendOtp(enteredEmail);
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          avatar: avatar.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'خطا در ذخیره‌سازی مشخصات.');
      }

      setAccountData(json.user);
      await updateSession();
      toast.success('مشخصات حساب کاربری با موفقیت به‌روزرسانی شد.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('گذرواژه جدید باید حداقل 6 نویسه (کاراکتر) باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('گذرواژه جدید و تکرار آن با یکدیگر مطابقت ندارند.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'خطا در تغییر گذرواژه.');
      }

      toast.success('گذرواژه حساب کاربری شما با موفقیت تغییر یافت.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'خطای شبکه در تغییر گذرواژه.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 select-none max-w-5xl mx-auto"
      dir="rtl"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/25 shrink-0">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                تنظیمات حساب کاربری
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              مدیریت اطلاعات هویتی شخصی، تغییر گذرواژه، درگاه پرداخت حساب‌پی و وضعیت اشتراک سراسری پلتفرم
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchAccountData();
            fetchFinancialSettings();
          }}
          disabled={isLoading || isLoadingFinancial}
          className="h-9 px-3 rounded-xl border-border bg-card flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${isLoading || isLoadingFinancial ? 'animate-spin' : ''}`} />
          <span>بروزرسانی اطلاعات</span>
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'profile'
              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
        >
          <User className="w-4 h-4" />
          <span>مشخصات فردی و امنیت</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'finance'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
        >
          <Wallet className="w-4 h-4" />
          <span>تنظیمات مالی و درگاه پرداخت (حساب‌پی)</span>
        </button>
      </div>

      {activeTab === 'finance' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 rounded-3xl bg-card/80 backdrop-blur-xl border border-border shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">درگاه و کیف پول اختصاصی حساب‌پی (HesabPay)</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      مشخصات حساب، بارکد QR اختصاصی و راهنمای واریز خود را درج نمایید تا مشتریان مینی‌سایت پس از واریز، رسید را برای شما ثبت کنند.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  واریز آفلاین + آپلود رسید
                </Badge>
              </div>

              <form onSubmit={handleSaveFinancial} className="space-y-5">
                {/* Strictly Offline Account Info */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-4">
                  <div className="flex items-center gap-2 text-foreground text-xs font-bold">
                    <Store className="w-4 h-4 text-cyan-500" />
                    <span>مشخصات حساب دریافت وجه در مینی‌سایت</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground block">
                        شماره حساب یا شماره مبایل متصل به حساب‌پی:
                      </label>
                      <Input
                        type="text"
                        value={hesabPayConfig.accountNumber}
                        onChange={(e) =>
                          setHesabPayConfig((prev) => ({ ...prev, accountNumber: e.target.value }))
                        }
                        placeholder="مثلاً: 0729736813"
                        className="h-10 rounded-xl text-xs font-mono text-left"
                        dir="ltr"
                        required
                      />
                      <p className="text-[10px] text-muted-foreground">
                        شماره ثبت‌شده در اپلیکیشن حساب‌پی شما جهت دریافت وجه
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground block">
                        نام صاحب حساب:
                      </label>
                      <Input
                        type="text"
                        value={hesabPayConfig.accountName}
                        onChange={(e) =>
                          setHesabPayConfig((prev) => ({ ...prev, accountName: e.target.value }))
                        }
                        placeholder="مثلاً: احمد ولی رسولی یا HAMID FASIHI"
                        className="h-10 rounded-xl text-xs"
                        required
                      />
                      <p className="text-[10px] text-muted-foreground">
                        برای نمایش به پرداخت‌کننده در پاپ‌آپ پرداخت مینی‌سایت
                      </p>
                    </div>
                  </div>

                  {/* Custom QR Code Upload */}
                  <div className="p-3.5 rounded-2xl bg-background/60 border border-border space-y-2.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-500" />
                      <span>آپلود تصویر QR Code اختصاصی حساب شما:</span>
                    </label>
                    {hesabPayConfig.qrCodeImage ? (
                      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={hesabPayConfig.qrCodeImage}
                            alt="QR Code اختصاصی"
                            className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-border shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                              تصویر QR Code بارگذاری شد
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              هنگام پرداخت در مینی‌سایت نمایش داده می‌شود
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHesabPayConfig((prev) => ({ ...prev, qrCodeImage: '' }))}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors shrink-0"
                          title="حذف تصویر"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full py-3 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingQr}
                          onChange={handleQrImageUpload}
                        />
                        {isUploadingQr ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>در حال آپلود تصویر QR Code...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>انتخاب و آپلود تصویر QR Code اختصاصی (JPG / PNG)</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>

                  {/* Deposit Instructions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      متن راهنمای واریز (دلخواه):
                    </label>
                    <textarea
                      rows={2}
                      value={hesabPayConfig.instructions}
                      onChange={(e) =>
                        setHesabPayConfig((prev) => ({ ...prev, instructions: e.target.value }))
                      }
                      placeholder="مثال: لطفاً مبلغ را به حساب یا QR بالا واریز نموده و عکس فیش رسید را در فرم زیر آپلود کنید."
                      className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSavingFinancial}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isSavingFinancial ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>ذخیره تنظیمات حساب‌پی</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Live QR Preview */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-5 rounded-3xl bg-gradient-to-b from-card to-muted/40 border border-border shadow-sm space-y-4 text-center">
              <span className="text-xs font-bold text-foreground block">
                پیش‌نمایش بارکد واریز مینی‌سایت
              </span>

              {hesabPayConfig.qrCodeImage || hesabPayConfig.accountNumber ? (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-white/20 inline-block mx-auto">
                    {hesabPayConfig.qrCodeImage ? (
                      <img
                        src={hesabPayConfig.qrCodeImage}
                        alt="QR Code"
                        className="w-32 h-32 object-contain rounded-lg"
                      />
                    ) : (
                      (() => {
                        const fPhone = (hesabPayConfig.accountNumber || '').trim().replace(/^0+/, '');
                        const fName = (hesabPayConfig.accountName || '').trim().toUpperCase() || 'ARYALINK';
                        const payload = `1:01*2:p*3:93.${fPhone}*4:general*5:${fName}*6:971*7:1307100`;
                        return <QRCodeSVG value={payload} size={130} level="M" />;
                      })()
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground px-2 leading-relaxed">
                    مشتریان مینی‌سایت با اسکن این بارکد مبلغ را واریز کرده و فیش رسید را برای شما ثبت می‌کنند.
                  </p>

                  <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-[11px] space-y-1 text-right">
                    {hesabPayConfig.accountNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">شماره حساب:</span>
                        <span className="font-mono font-bold text-foreground" dir="ltr">
                          {hesabPayConfig.accountNumber}
                        </span>
                      </div>
                    )}
                    {hesabPayConfig.accountName && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">نام حساب:</span>
                        <span className="text-foreground font-semibold">
                          {hesabPayConfig.accountName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground space-y-2">
                  <QrCode className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">پس از درج شماره حساب یا آپلود تصویر QR، پیش‌نمایش در اینجا ظاهر می‌شود.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main Forms (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Personal Info Form */}
            <Card className="p-6 rounded-3xl bg-card/80 backdrop-blur-xl border border-border shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-border pb-4">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">مشخصات عمومی و هویتی حساب</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    این اطلاعات به عنوان مشخصات اصلی مالک حساب کاربری در سرور ثبت می‌شود.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Avatar Uploader Preview */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-border">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{name.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-foreground block">آدرس تصویر نمایه (آواتار)</label>
                    <Input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="h-9 rounded-xl text-xs font-sans"
                      dir="ltr"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      لینک مستقیم عکس شخصی خود را درج نمایید تا در تمامی بخش‌های پنل نمایش یابد.
                    </p>
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">نام و تخلص کامل</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: احمد فیاض رسولی"
                      className="h-10 rounded-xl text-xs pr-10"
                      required
                    />
                    <User className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Email Field (Editable with 2-Step OTP Verification) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-500" />
                      <span>آدرس ایمیل ثبت‌نامی</span>
                    </label>
                    {email.trim().toLowerCase() !== (accountData?.email || '').toLowerCase() ? (
                      <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>تغییریافته (نیازمند تایید با کد OTP)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        ایمیل فعال حساب
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="h-10 rounded-xl text-xs pr-10 font-inter text-left"
                        dir="ltr"
                        required
                      />
                      <Mail className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {email.trim().toLowerCase() !== (accountData?.email || '').toLowerCase() && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSendOtp(email.trim().toLowerCase())}
                        disabled={isSendingOtp}
                        className="h-10 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
                      >
                        {isSendingOtp ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>ارسال کد تایید</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    برای تغییر آدرس ایمیل، کد تایید 6 رقمی به آدرس جدید ارسال و تایید دو مرحله‌ای انجام خواهد شد.
                  </p>
                </div>

                {/* Phone Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">شماره تماس اصلی</label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+93 799 123 456"
                      className="h-10 rounded-xl text-xs pr-10 font-sans"
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    className="h-10 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20"
                  >
                    {isSavingProfile ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>ذخیره مشخصات هویتی</span>
                  </Button>
                </div>
              </form>
            </Card>

            {/* Section 2: Password and Security Form */}
            <Card className="p-6 rounded-3xl bg-card/80 backdrop-blur-xl border border-border shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-border pb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">امنیت و تغییر گذرواژه ورود</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    جهت حفظ امنیت حساب خود، گذرواژه‌ای امن متشکل از حروف، اعداد و نشانه‌ها انتخاب نمایید.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">گذرواژه فعلی</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 rounded-xl text-xs pr-10 pl-10 font-sans text-left"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                      title={showCurrentPassword ? 'پنهان کردن گذرواژه' : 'نمایش گذرواژه'}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-cyan-500" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">گذرواژه جدید</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="حداقل 6 نویسه"
                        className="h-10 rounded-xl text-xs pr-10 pl-10 font-sans text-left"
                        dir="ltr"
                      />
                      <KeyRound className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                        title={showNewPassword ? 'پنهان کردن گذرواژه' : 'نمایش گذرواژه'}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4 text-cyan-500" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">تکرار گذرواژه جدید</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="تکرار همان گذرواژه"
                        className="h-10 rounded-xl text-xs pr-10 pl-10 font-sans text-left"
                        dir="ltr"
                      />
                      <KeyRound className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                        title={showConfirmPassword ? 'پنهان کردن گذرواژه' : 'نمایش گذرواژه'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-cyan-500" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSavingPassword || !newPassword}
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20"
                  >
                    {isSavingPassword ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>به‌روزرسانی گذرواژه</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Account Status & Plan Overview (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Membership Card */}
            <Card className="p-5 rounded-3xl bg-gradient-to-b from-card to-muted/40 border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">نوع اشتراک پلتفرم</span>
                <Badge variant="cyan" className="font-sans uppercase text-[10px] font-bold">
                  {accountData?.subscriptionPlan || 'PRO'}
                </Badge>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <Crown className="w-6 h-6 text-cyan-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    پلن حرفه‌ای نامحدود
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    دسترسی به تمامی ماژول‌ها، قالب‌های لوکس و وایت‌لیبل
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-border/80 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">نقش دسترسی:</span>
                  <span className="font-bold font-sans text-foreground uppercase">
                    {accountData?.role || session?.user?.role || 'user'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاریخ عضویت:</span>
                  <span className="font-sans text-foreground font-semibold">
                    {accountData?.createdAt
                      ? new Date(accountData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                      : '2026'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">احراز هویت:</span>
                  {accountData?.isVerified ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تایید شده رسمی</span>
                    </span>
                  ) : (
                    <Link
                      href="/dashboard/kyc"
                      className="text-cyan-500 hover:underline font-bold flex items-center gap-1"
                    >
                      <span>ارسال مدارک هویتی</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            {/* Direct Support Note */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs space-y-2">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                <span>پشتیبانی و حریم خصوصی</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                اطلاعات هویتی و کدهای امنیتی شما با پیشرفته‌ترین پروتکل‌های رمزگذاری استاندارد ذخیره و محافظت می‌گردند.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step OTP Modal for Email Change */}
      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-card/95 border-border backdrop-blur-2xl p-6 shadow-2xl" dir="rtl">
          <DialogHeader className="text-right space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/25 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              تایید دو مرحله‌ای تغییر آدرس ایمیل
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              کد تایید 6 رقمی امنیتی به آدرس ایمیل جدید{' '}
              <span className="font-bold text-cyan-500 font-inter inline-block" dir="ltr">
                {pendingEmail}
              </span>{' '}
              ارسال گردید. لطفاً جهت تکمیل فرآیند تغییر ایمیل، کد دریافتی را وارد فرمایید:
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block text-center">
                کد تایید ۶ رقمی
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full h-12 rounded-2xl border-2 border-border focus:border-cyan-500 bg-background text-center text-xl font-bold font-inter tracking-[0.4em] text-foreground focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-muted-foreground/30"
                dir="ltr"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              {otpCooldown > 0 ? (
                <span className="text-muted-foreground text-[11px] font-sans" dir="ltr">
                  Resend code in {otpCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp(pendingEmail)}
                  disabled={isSendingOtp}
                  className="text-cyan-500 hover:underline font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                  <span>ارسال مجدد کد تایید</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsOtpModalOpen(false);
                  setOtpCode('');
                }}
                className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
              >
                انصراف
              </button>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOtpModalOpen(false);
                  setOtpCode('');
                }}
                className="flex-1 h-11 rounded-xl text-xs font-bold border-border cursor-pointer"
              >
                انصراف
              </Button>

              <Button
                type="submit"
                disabled={isVerifyingOtp || otpCode.length !== 6}
                className="flex-1 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>تایید و ثبت نهایی ایمیل</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
