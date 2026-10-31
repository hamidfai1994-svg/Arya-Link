'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ImagePuzzleCaptcha } from '@/components/auth/ImagePuzzleCaptcha';
import { PhoneInput } from '@/components/ui/phone-input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SiteLogo } from '@/components/SiteLogo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/types';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  X,
  KeyRound,
  Check,
  AlertOctagon,
  RotateCcw,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  callbackUrl?: string;
}

// -------------------------------------------------------------
// 3-Languages Dictionary (Dari, Pashto, English)
// Strict Afghan Dari literature, English numerals only (1, 2, 3...)
// -------------------------------------------------------------
const authDictionary = {
  da: {
    backToHome: 'بازگشت به صفحه اصلی',
    loginTab: 'ورود به اکانت',
    registerTab: 'ثبت نام / راجستر',
    loginTitle: 'ورود به Arya Link',
    loginSubtitle: 'یک لینک هوشمند برای تمام ارتباطات؛ مدیریت بیو لینک، کارت NFC و تحلیل بازدیدها',
    registerTitle: 'ساخت اکانت Arya Link',
    registerSubtitle: 'تمام لینک‌های خود را در یک پیوند هوشمند گردآوری نموده و بیو اختصاصی بسازید',
    googleLogin: 'ادامه با حساب Google',
    googleRegister: 'ثبت نام سریع با حساب Google',
    dividerLogin: 'یا ورود با ایمیل',
    dividerRegister: 'یا پر کردن فورم ثبت نام',
    emailLabel: 'آدرس ایمیل',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'رمز عبور',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'رمز را فراموش نموده‌اید؟',
    rememberMe: 'مرا به خاطر بسپار',
    nameLabel: 'نام و تخلص',
    namePlaceholder: 'مثال: احمد نیازی',
    phoneLabel: 'شماره تماس (اختیاری)',
    confirmPasswordLabel: 'تکرار رمز عبور',
    submitLogin: 'ورود به اکانت',
    submitRegister: 'ساخت اکانت و ورود',
    loadingLogin: 'در حال ورود به اکانت...',
    loadingRegister: 'در حال ساخت اکانت...',
    noAccountPrompt: 'هنوز اکانت اختصاصی ندارید؟',
    hasAccountPrompt: 'قبلاً در آریا لینک راجستر نموده‌اید؟',
    registerLink: 'ثبت نام / راجستر',
    loginLink: 'ورود به اکانت',
    // Rate Limit / Lockout UI
    lockoutTitle: 'اکانت موقتاً قفل شد',
    lockoutDescPart1: 'به دلیل 5 بار تلاش ناموفق، فرم ورود قفل گردید. لطفاً',
    lockoutDescPart2: 'دیگر دوباره تلاش نمایید.',
    // Welcome Panel (Sliding Glass)
    welcomeBackHeading: 'خوش برگشتید، کاربر گرامی!',
    welcomeBackDesc:
      'جهت مدیریت لینک هوشمند، ویرایش صفحه بیو و بررسی آمار دقیق کلیک‌ها و بازدیدها وارد اکانت خود شوید.',
    welcomeBackBtn: 'ثبت نام / راجستر در آریا لینک',
    welcomeHelloHeading: 'یک لینک برای تمام مسیرها!',
    welcomeHelloDesc:
      'به جای اشتراک ده‌ها لینک پراکنده، یک صفحه بیو لینک حرفه‌ای بسازید و با کارت ویزیت هوشمند NFC ارتباطات حضوری خود را متحول کنید.',
    welcomeHelloBtn: 'ورود به اکانت',
    footerCopyright: 'سامانه هوشمند آریا لینک © 2026',
    // 3-Step Password Recovery Modal
    recoveryStep1Title: 'بازیابی رمز عبور',
    recoveryStep1Subtitle: 'ایمیل اکانت خود را وارد نمایید تا کد تایید 6 رقمی برای شما ارسال گردد.',
    recoverySendCode: 'ارسال کد تایید',
    recoveryStep2Title: 'ورود کد تایید',
    recoveryStep2Subtitle: 'کد تایید 6 رقمی ارسال‌شده به ایمیل خود را وارد نمایید:',
    recoveryOtpLabel: 'کد تایید 6 رقمی (OTP)',
    recoveryOtpPlaceholder: '123456',
    recoveryVerifyCode: 'بررسی و تایید کد',
    recoveryResendCode: 'ارسال مجدد کد',
    recoveryStep3Title: 'تنظیم رمز جدید',
    recoveryStep3Subtitle: 'رمز عبور جدید خود را تعیین نمایید (حداقل 6 کاراکتر).',
    recoveryNewPassword: 'رمز عبور جدید',
    recoveryConfirmPassword: 'تکرار رمز عبور جدید',
    recoverySavePassword: 'تغییر و ذخیره رمز عبور',
    recoveryStepIndicator: 'مرحله {step} از 3',
    recoveryCancel: 'انصراف',
    recoveryLoading: 'در حال پردازش...',
    // Dynamic Toast Errors
    errorCaptcha: 'لطفاً پازل تصویری ضد ربات را تکمیل نمایید.',
    errorIncomplete: 'لطفاً ایمیل و رمز عبور خود را وارد نمایید.',
    errorInvalidCredentials: 'ایمیل یا رمز عبور اشتباه است.',
    errorIncorrectPassword: 'رمز عبور وارد شده نادرست است.',
    errorUserNotFound: 'اکانت کاربری با این ایمیل یافت نشد.',
    errorGoogleLinked: 'این اکانت با ورود گوگل ثبت شده است. لطفاً با حساب Google وارد شوید.',
    errorAccountInactive: 'اکانت کاربری شما غیرفعال گردیده است.',
    errorNetwork: 'خطای شبکه: امکان برقراری ارتباط با سرور وجود ندارد.',
    errorGoogleSignIn: 'خطا در ورود با گوگل. لطفاً دقایقی بعد تلاش نمایید.',
    errorNameRequired: 'لطفاً نام و تخلص خود را وارد نمایید.',
    errorEmailRequired: 'لطفاً آدرس ایمیل معتبر خود را وارد نمایید.',
    errorPasswordLength: 'رمز عبور باید حداقل 6 کاراکتر باشد.',
    errorPasswordMismatch: 'رمز عبور و تکرار آن یکسان نیستند.',
    toastCodeSent: 'کد تایید 6 رقمی به ایمیل شما ارسال شد.',
    toastCodeInvalid: 'کد تایید نامعتبر است. کد 6 رقمی را وارد نمایید.',
    toastCodeVerified: 'کد تایید تایید شد. اکنون رمز جدید را تعیین کنید.',
    toastPasswordResetSuccess: 'رمز عبور با موفقیت به‌روزرسانی شد. اکنون وارد شوید.',
    toastLoginSuccess: 'خوش آمدید!',
    toastLoginSuccessDesc: 'ورود موفقیت‌آمیز بود. در حال انتقال به داشبورد...',
    toastRegisterSuccess: 'ثبت نام با موفقیت انجام شد!',
    toastRegisterSuccessDesc: 'در حال ورود خودکار به اکانت کاربری...',
  },
  ps: {
    backToHome: 'اصلي مخ ته ستنېدل',
    loginTab: 'اکاونټ ته ننوتل',
    registerTab: 'نوم‌لیکنه / راجستر',
    loginTitle: 'آریا لینک ته ننوتل',
    loginSubtitle: 'د ټولو شبکو لپاره یو هوښیار لینک؛ د بیو پاڼې، NFC کارټ او لیدنو ارقامو مدیریت',
    registerTitle: 'په Arya Link کې اکاونټ جوړول',
    registerSubtitle: 'خپل ټول لینکونه په یوه هوښیار پیوند کې راټول او ځانګړې بیو پاڼه جوړه کړئ',
    googleLogin: 'د Google حساب له لارې دوام',
    googleRegister: 'د Google له لارې چټکه نوم‌لیکنه',
    dividerLogin: 'یا په برېښنالیک ننوتل',
    dividerRegister: 'یا د فورم ډکول',
    emailLabel: 'برېښنالیک پته',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'پټ نوم / رمز',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'رمز مو هېر شوی؟',
    rememberMe: 'ما په یاد ولره',
    nameLabel: 'نوم او تخلص',
    namePlaceholder: 'مثال: احمد نیازی',
    phoneLabel: 'د اړیکې شمېره (اختیاري)',
    confirmPasswordLabel: 'د رمز تکرار',
    submitLogin: 'اکاونټ ته ننوتل',
    submitRegister: 'اکاونټ جوړول او ننوتل',
    loadingLogin: 'اکاونټ ته د ننوتلو په حال کې...',
    loadingRegister: 'د اکاونټ جوړولو په حال کې...',
    noAccountPrompt: 'تر اوسه ځانګړی اکاونټ نلرئ؟',
    hasAccountPrompt: 'مخکې مو په آریا لینک کې راجستر کړی؟',
    registerLink: 'نوم‌لیکنه / راجستر',
    loginLink: 'اکاونټ ته ننوتل',
    // Rate Limit / Lockout UI
    lockoutTitle: 'اکاونټ په موقتي ډول قفل شو',
    lockoutDescPart1: 'د 5 پرله پسې ناسم هڅو له امله فورمه قفل شوه. مهرباني وکړئ',
    lockoutDescPart2: 'وروسته بیا هڅه وکړئ.',
    // Welcome Panel
    welcomeBackHeading: 'بېرته ښه راغلاست، ګرانه کاروونکی!',
    welcomeBackDesc:
      'د خپل هوښیار لینک د مدیریت، د بیو پروفایل سمون او د لیدنو ارقامو کتنې لپاره ننوځئ.',
    welcomeBackBtn: 'په آریا لینک کې نوم‌لیکنه / راجستر',
    welcomeHelloHeading: 'د ټولو لارو لپاره یو لینک!',
    welcomeHelloDesc:
      'د خپرو لینکونو پر ځای یوه مسلکي بیو پاڼه جوړه کړئ او د NFC کارټ له لارې خپلو اړیکو ته پراختیا ورکړئ.',
    welcomeHelloBtn: 'اکاونټ ته ننوتل',
    footerCopyright: 'د آریا لینک هوښیار سیسټم © 2026',
    // 3-Step Password Recovery Modal
    recoveryStep1Title: 'د رمز بیا موندنه',
    recoveryStep1Subtitle: 'خپل برېښنالیک ولیکئ ترڅو د 6 عددي تایید کوډ درواستول شي.',
    recoverySendCode: 'د تایید کوډ لېږل',
    recoveryStep2Title: 'د تایید کوډ لیکل',
    recoveryStep2Subtitle: 'خپل برېښنالیک ته لېږل شوی 6 عددي کوډ ولیکئ:',
    recoveryOtpLabel: 'د 6 عددي تایید کوډ (OTP)',
    recoveryOtpPlaceholder: '123456',
    recoveryVerifyCode: 'د کوډ تایید',
    recoveryResendCode: 'د کوډ بیا لېږل',
    recoveryStep3Title: 'نوی رمز ټاکل',
    recoveryStep3Subtitle: 'خپل نوی رمز وټاکئ (لږترلږه 6 توري).',
    recoveryNewPassword: 'نوی رمز',
    recoveryConfirmPassword: 'د نوي رمز تکرار',
    recoverySavePassword: 'د نوي رمز خوندي کول',
    recoveryStepIndicator: '{step} پړاو له 3 څخه',
    recoveryCancel: 'بندول',
    recoveryLoading: 'د پروسس په حال کې...',
    // Dynamic Toast Errors
    errorCaptcha: 'مهرباني وکړئ د ربات ضد امنیتي پازل بشپړ کړئ.',
    errorIncomplete: 'مهرباني وکړئ برېښنالیک او رمز داخل کړئ.',
    errorInvalidCredentials: 'برېښنالیک یا پټ نوم ناسم دی.',
    errorIncorrectPassword: 'داخل شوی رمز ناسم دی.',
    errorUserNotFound: 'په دې برېښنالیک کوم اکاونټ ونه موندل شو.',
    errorGoogleLinked: 'دا اکاونټ له ګوګل سره تړلی دی. مهرباني وکړئ د Google له لارې ننوځئ.',
    errorAccountInactive: 'ستاسو اکاونټ غیرفعال شوی دی.',
    errorNetwork: 'د شبکې تېروتنه: له سرور سره اړیکه نشي ټینګېدلی.',
    errorGoogleSignIn: 'له ګوګل سره د ننوتلو تېروتنه. مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.',
    errorNameRequired: 'مهرباني وکړئ خپل نوم او تخلص ولیکئ.',
    errorEmailRequired: 'مهرباني وکړئ خپله برېښنالیک پته ولیکئ.',
    errorPasswordLength: 'رمز باید لږترلږه 6 توري وي.',
    errorPasswordMismatch: 'رمز او د هغه تکرار سره ورته نه دي.',
    toastCodeSent: 'د تایید 6 عددي کوډ واستول شو.',
    toastCodeInvalid: 'د تایید کوډ ناسم دی. مهرباني وکړئ سم کوډ ولیکئ.',
    toastCodeVerified: 'کوډ تایید شو. اوس نوی رمز وټاکئ.',
    toastPasswordResetSuccess: 'رمز په بریالیتوب سره بدل شو. اوس ننوځئ.',
    toastLoginSuccess: 'ښه راغلاست!',
    toastLoginSuccessDesc: 'ننوتل بریالي وو. ډشبورډ ته د لېږد په حال کې...',
    toastRegisterSuccess: 'نوم‌لیکنه په بریالیتوب سره ترسره شوه!',
    toastRegisterSuccessDesc: 'په اوتومات ډول اکاونټ ته د ننوتلو په حال کې...',
  },
  en: {
    backToHome: 'Back to Home',
    loginTab: 'Sign In',
    registerTab: 'Sign Up / Register',
    loginTitle: 'Sign In to Arya Link',
    loginSubtitle: 'One smart link for all your channels; manage bio profile, NFC cards, and analytics',
    registerTitle: 'Create Arya Link Account',
    registerSubtitle: 'Consolidate all your links into one smart bio page in under 1 minute',
    googleLogin: 'Continue with Google',
    googleRegister: 'Quick Sign Up with Google',
    dividerLogin: 'or sign in with email',
    dividerRegister: 'or fill the registration form',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g. Ahmad Niazi',
    phoneLabel: 'Phone Number (optional)',
    confirmPasswordLabel: 'Confirm Password',
    submitLogin: 'Sign In',
    submitRegister: 'Create Account & Sign In',
    loadingLogin: 'Signing in to account...',
    loadingRegister: 'Creating account...',
    noAccountPrompt: "Don't have a dedicated account yet?",
    hasAccountPrompt: 'Already registered with Arya Link?',
    registerLink: 'Sign Up / Register',
    loginLink: 'Sign In',
    // Rate Limit / Lockout UI
    lockoutTitle: 'Account Temporarily Locked',
    lockoutDescPart1: 'Due to 5 consecutive failed attempts, login is locked. Please wait',
    lockoutDescPart2: 'before trying again.',
    // Welcome Panel
    welcomeBackHeading: 'Welcome Back, Valued User!',
    welcomeBackDesc:
      'Sign in to manage your smart link-in-bio, update profile modules, and analyze visitor clicks.',
    welcomeBackBtn: 'Sign Up / Register with Arya Link',
    welcomeHelloHeading: 'One Link for Everything!',
    welcomeHelloDesc:
      'Replace dozens of scattered links with a single high-converting bio page, complemented by custom NFC smart cards for in-person networking.',
    welcomeHelloBtn: 'Sign In to Account',
    footerCopyright: 'Arya Link Smart Platform © 2026',
    // 3-Step Password Recovery Modal
    recoveryStep1Title: 'Reset Password',
    recoveryStep1Subtitle: 'Enter your account email to receive a 6-digit verification code.',
    recoverySendCode: 'Send Verification Code',
    recoveryStep2Title: 'Enter Verification Code',
    recoveryStep2Subtitle: 'Enter the 6-digit code sent to your email:',
    recoveryOtpLabel: '6-digit Code (OTP)',
    recoveryOtpPlaceholder: '123456',
    recoveryVerifyCode: 'Verify Code',
    recoveryResendCode: 'Resend Code',
    recoveryStep3Title: 'Set New Password',
    recoveryStep3Subtitle: 'Create a new password for your account (at least 6 characters).',
    recoveryNewPassword: 'New Password',
    recoveryConfirmPassword: 'Confirm New Password',
    recoverySavePassword: 'Save New Password',
    recoveryStepIndicator: 'Step {step} of 3',
    recoveryCancel: 'Cancel',
    recoveryLoading: 'Processing...',
    // Dynamic Toast Errors
    errorCaptcha: 'Please complete the security puzzle verification.',
    errorIncomplete: 'Please enter your email and password.',
    errorInvalidCredentials: 'Invalid email or password.',
    errorIncorrectPassword: 'Incorrect password entered.',
    errorUserNotFound: 'No account found with this email address.',
    errorGoogleLinked: 'This account is linked with Google sign-in. Please continue with Google.',
    errorAccountInactive: 'Your account has been deactivated.',
    errorNetwork: 'Network error: Unable to connect to the server.',
    errorGoogleSignIn: 'Google Sign-In Error. Please try again in a few moments.',
    errorNameRequired: 'Please enter your full name.',
    errorEmailRequired: 'Please enter a valid email address.',
    errorPasswordLength: 'Password must be at least 6 characters.',
    errorPasswordMismatch: 'Password and confirmation do not match.',
    toastCodeSent: '6-digit verification code sent to your email.',
    toastCodeInvalid: 'Invalid code. Please enter the full 6-digit code.',
    toastCodeVerified: 'Code verified. You can now set a new password.',
    toastPasswordResetSuccess: 'Password has been reset successfully. Please sign in.',
    toastLoginSuccess: 'Welcome!',
    toastLoginSuccessDesc: 'Sign in successful. Redirecting to dashboard...',
    toastRegisterSuccess: 'Registration Successful!',
    toastRegisterSuccessDesc: 'Automatically signing in to your account...',
  },
};

// Map backend error messages to active language
function resolveLocalizedAuthError(rawError: string | undefined, lang: SupportedLanguage): string {
  const dict = authDictionary[lang] || authDictionary.da;
  if (!rawError) return dict.errorInvalidCredentials;

  const low = rawError.toLowerCase();
  if (low.includes('رمز عبور') || low.includes('password') || low.includes('نادرست') || low.includes('اشتباه')) {
    return dict.errorIncorrectPassword;
  }
  if (low.includes('یافت نشد') || low.includes('not found') || low.includes('پیدا نشد')) {
    return dict.errorUserNotFound;
  }
  if (low.includes('گوگل') || low.includes('google')) {
    return dict.errorGoogleLinked;
  }
  if (low.includes('غیرفعال') || low.includes('inactive') || low.includes('disabled')) {
    return dict.errorAccountInactive;
  }
  if (low.includes('ایمیل و رمز') || low.includes('required') || low.includes('ناقص')) {
    return dict.errorIncomplete;
  }
  return rawError;
}

// Format seconds into MM:SS (Strict English Digits)
function formatLockoutTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;
  return `${mm}:${ss}`;
}

export function AuthPage({
  initialMode = 'login',
  callbackUrl: propCallbackUrl,
}: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl =
    propCallbackUrl || searchParams.get('callbackUrl') || '/dashboard';

  // Global Language Sync from LanguageContext (Independent of profile/vCard language)
  const { language, dir } = useLanguage();
  const activeLang: SupportedLanguage =
    language === 'ps' || language === 'en' ? language : 'da';
  const t = authDictionary[activeLang] || authDictionary.da;
  const isRtl = dir === 'rtl';

  // Mode state (Login vs Register)
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginCaptchaValid, setIsLoginCaptchaValid] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Rate Limiting & Lockout States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegisterCaptchaValid, setIsRegisterCaptchaValid] = useState(false);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 3-Step Password Recovery Dialog States
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Captcha Reset Signal
  const [captchaSignal, setCaptchaSignal] = useState(0);

  // Sync mode when initialMode prop changes
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  // Load Remembered Email and Existing Lockout from localStorage on Mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check existing lockout
    const savedUntil = localStorage.getItem('aryalink_auth_lockout_until');
    if (savedUntil) {
      const untilMs = parseInt(savedUntil, 10);
      const diffSec = Math.ceil((untilMs - Date.now()) / 1000);
      if (diffSec > 0) {
        setIsLockedOut(true);
        setLockoutSecondsLeft(diffSec);
      } else {
        localStorage.removeItem('aryalink_auth_lockout_until');
        localStorage.removeItem('aryalink_auth_failed_attempts');
      }
    } else {
      const savedAttempts = localStorage.getItem('aryalink_auth_failed_attempts');
      if (savedAttempts) {
        setFailedAttempts(parseInt(savedAttempts, 10));
      }
    }

    // Check remembered email
    const savedEmail = localStorage.getItem('aryalink_remember_email');
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Countdown timer for Lockout
  useEffect(() => {
    if (!isLockedOut || lockoutSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setLockoutSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsLockedOut(false);
          setFailedAttempts(0);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('aryalink_auth_lockout_until');
            localStorage.removeItem('aryalink_auth_failed_attempts');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLockedOut, lockoutSecondsLeft]);

  // Countdown timer for OTP Resend Cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Mode switcher handler
  const handleToggleMode = (mode: 'login' | 'register') => {
    const nextIsLogin = mode === 'login';
    setIsLogin(nextIsLogin);
    setCaptchaSignal((prev) => prev + 1);
    setIsLoginCaptchaValid(false);
    setIsRegisterCaptchaValid(false);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const targetPath = nextIsLogin ? '/login' : '/register';
      if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, '', `${targetPath}${url.search}`);
      }
    }
  };

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    if (isLockedOut) return;
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast.error(t.errorGoogleSignIn);
      setIsGoogleLoading(false);
    }
  };

  // Login Submit Handler with Rate Limiting
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      toast.error(t.lockoutTitle, {
        description: `${t.lockoutDescPart1} ${formatLockoutTime(lockoutSecondsLeft)} ${t.lockoutDescPart2}`,
      });
      return;
    }

    if (!isLoginCaptchaValid) {
      toast.error(t.errorCaptcha);
      return;
    }

    if (!loginEmail.trim() || !loginPassword) {
      toast.error(t.errorIncomplete);
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email: loginEmail.trim(),
        password: loginPassword,
        redirect: false,
        callbackUrl,
      });

      if (!res?.ok || res?.error) {
        // Track failed attempt
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (typeof window !== 'undefined') {
          localStorage.setItem('aryalink_auth_failed_attempts', String(nextAttempts));
        }

        // Trigger 10-minute lockout on 5 failed attempts or 429
        if (nextAttempts >= 5 || res?.status === 429) {
          const lockDuration = 600; // 10 minutes (600 seconds)
          setIsLockedOut(true);
          setLockoutSecondsLeft(lockDuration);
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'aryalink_auth_lockout_until',
              String(Date.now() + lockDuration * 1000)
            );
          }
          toast.error(t.lockoutTitle, {
            description: `${t.lockoutDescPart1} 10:00 ${t.lockoutDescPart2}`,
          });
          setIsLoading(false);
          return;
        }

        const localizedMsg = resolveLocalizedAuthError(res?.error, activeLang);
        toast.error(localizedMsg, {
          description: `تلاش ناموفق (${nextAttempts} از 5)`,
        });
        setIsLoading(false);
        setCaptchaSignal((prev) => prev + 1);
        setIsLoginCaptchaValid(false);
        return;
      }

      // Success: Clear failed attempts and lockouts
      setFailedAttempts(0);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aryalink_auth_lockout_until');
        localStorage.removeItem('aryalink_auth_failed_attempts');
        if (rememberMe) {
          localStorage.setItem('aryalink_remember_email', loginEmail.trim());
        } else {
          localStorage.removeItem('aryalink_remember_email');
        }
      }

      toast.success(t.toastLoginSuccess, {
        description: t.toastLoginSuccessDesc,
      });

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(t.errorNetwork);
      setIsLoading(false);
    }
  };

  // Register Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRegisterCaptchaValid) {
      toast.error(t.errorCaptcha);
      return;
    }

    if (!registerName.trim()) {
      toast.error(t.errorNameRequired);
      return;
    }

    if (!registerEmail.trim()) {
      toast.error(t.errorEmailRequired);
      return;
    }

    if (registerPassword.length < 6) {
      toast.error(t.errorPasswordLength);
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error(t.errorPasswordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          phone: registerPhone ? registerPhone.trim() : '',
          password: registerPassword,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok || !registerData.success) {
        const localizedMsg = resolveLocalizedAuthError(registerData.message, activeLang);
        toast.error(localizedMsg);
        setIsLoading(false);
        setCaptchaSignal((prev) => prev + 1);
        setIsRegisterCaptchaValid(false);
        return;
      }

      toast.success(t.toastRegisterSuccess, {
        description: t.toastRegisterSuccessDesc,
      });

      const loginRes = await signIn('credentials', {
        email: registerEmail.trim(),
        password: registerPassword,
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
      toast.error(t.errorNetwork);
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------------
  // 3-Step Password Recovery Handlers
  // -----------------------------------------------------------
  const handleRecoveryStep1SendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      toast.error(t.errorEmailRequired);
      return;
    }

    setIsRecoveryLoading(true);
    // Simulate sending 6-digit OTP code to email
    setTimeout(() => {
      setIsRecoveryLoading(false);
      setRecoveryStep(2);
      setResendCooldown(60); // 60s cooldown for resend
      toast.success(t.toastCodeSent);
    }, 1000);
  };

  const handleRecoveryStep2VerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryOtp || recoveryOtp.trim().length !== 6) {
      toast.error(t.toastCodeInvalid);
      return;
    }

    setIsRecoveryLoading(true);
    setTimeout(() => {
      setIsRecoveryLoading(false);
      setRecoveryStep(3);
      toast.success(t.toastCodeVerified);
    }, 800);
  };

  const handleRecoveryStep3SavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryNewPassword.length < 6) {
      toast.error(t.errorPasswordLength);
      return;
    }

    if (recoveryNewPassword !== recoveryConfirmPassword) {
      toast.error(t.errorPasswordMismatch);
      return;
    }

    setIsRecoveryLoading(true);
    setTimeout(() => {
      setIsRecoveryLoading(false);
      setIsRecoveryOpen(false);
      setRecoveryStep(1);
      setRecoveryEmail('');
      setRecoveryOtp('');
      setRecoveryNewPassword('');
      setRecoveryConfirmPassword('');
      toast.success(t.toastPasswordResetSuccess);
    }, 1100);
  };

  // Sliding glass panel X calculation based on direction
  const panelX = isRtl ? (isLogin ? '0%' : '100%') : (isLogin ? '100%' : '0%');

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 select-none selection:bg-cyan-500/30 selection:text-cyan-600 dark:selection:text-cyan-200 transition-colors duration-300"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Lighting Effects (Light/Dark aware) */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-100/50 dark:bg-indigo-950/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Top Header Bar: Clean Return Link & Theme Toggle */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-30 max-w-5xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:text-cyan-500 transition-all shadow-sm">
            {isRtl ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
          </div>
          <span className="hidden sm:inline font-medium">{t.backToHome}</span>
        </Link>

        {/* Global Theme Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Master Interactive Card */}
      <div className="w-full max-w-4xl z-20 my-16 sm:my-14">
        {/* Mobile Mode Switcher (Visible only on < md) */}
        <div className="md:hidden flex items-center justify-center mb-4">
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 p-1 rounded-2xl flex items-center gap-1 w-full max-w-xs shadow-lg backdrop-blur-xl">
            <button
              type="button"
              onClick={() => handleToggleMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isLogin
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.loginTab}
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.registerTab}
            </button>
          </div>
        </div>

        {/* Dual-Panel Card Container with Light/Dark Support */}
        <div className="relative w-full rounded-3xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl dark:shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col md:flex-row min-h-[640px] transition-colors">
          {/* ======================================================== */}
          {/* COLUMN 1: Login Form                                     */}
          {/* ======================================================== */}
          <div
            className={`w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center transition-opacity duration-300 ${
              !isLogin ? 'hidden md:flex md:pointer-events-none md:opacity-0' : 'flex opacity-100'
            }`}
          >
            {/* Header Branding using Official SiteLogo */}
            <div className="text-center space-y-2 mb-4">
              <div className="flex justify-center mb-1">
                <SiteLogo width={56} height={56} showText={false} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-1">
                {t.loginTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                {t.loginSubtitle}
              </p>
            </div>

            {/* Rate Limit & Lockout Warning Alert (When 5 failed attempts or 429) */}
            {isLockedOut && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-2.5 text-xs leading-relaxed shadow-sm"
              >
                <AlertOctagon className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">{t.lockoutTitle}</span>
                  <span>
                    {t.lockoutDescPart1}{' '}
                    <span className="font-sans font-bold text-rose-700 dark:text-rose-300 underline mx-1">
                      {formatLockoutTime(lockoutSecondsLeft)}
                    </span>{' '}
                    {t.lockoutDescPart2}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading || isLockedOut}
              className={`w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-[0.99] mb-4 group cursor-pointer ${
                isLockedOut ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''
              }`}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
              ) : (
                <svg
                  className="w-4 h-4 shrink-0 group-hover:scale-105 transition-transform"
                  viewBox="0 0 24 24"
                >
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
              <span>{t.googleLogin}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider shrink-0 select-none">
                {t.dividerLogin}
              </span>
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    disabled={isLockedOut}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                    className={`w-full h-11 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-left placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-3 font-sans text-sm transition-all ${
                      isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    dir="ltr"
                    disabled={isLockedOut}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    required
                    className={`w-full h-11 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-left placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-10 font-sans text-sm transition-all ${
                      isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    disabled={isLockedOut}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Forgot Password Link */}
              <div className="flex items-center justify-between pt-0.5">
                {/* Custom Remember Me Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div
                    onClick={() => !isLockedOut && setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                      rememberMe
                        ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-400 text-white shadow-sm shadow-cyan-500/30'
                        : 'border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-slate-900/60 group-hover:border-cyan-500/60'
                    } ${isLockedOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    onClick={() => !isLockedOut && setRememberMe(!rememberMe)}
                    className="text-xs text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                  >
                    {t.rememberMe}
                  </span>
                </label>

                {/* Forgot Password Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryStep(1);
                    setIsRecoveryOpen(true);
                  }}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 hover:underline transition-colors cursor-pointer"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {/* Upgraded Image / Puzzle Slider CAPTCHA */}
              <ImagePuzzleCaptcha
                onVerify={setIsLoginCaptchaValid}
                resetSignal={captchaSignal}
                lang={activeLang}
                className={`mt-2 ${isLockedOut ? 'opacity-50 pointer-events-none' : ''}`}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading || !isLoginCaptchaValid || isLockedOut}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.99] mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loadingLogin}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.submitLogin}</span>
                  </>
                )}
              </button>
            </form>

            {/* Mobile switch link */}
            <div className="mt-5 text-center md:hidden">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.noAccountPrompt}{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('register')}
                  className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline mx-1 cursor-pointer"
                >
                  {t.registerLink}
                </button>
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMN 2: Register Form                                  */}
          {/* ======================================================== */}
          <div
            className={`w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center transition-opacity duration-300 ${
              isLogin ? 'hidden md:flex md:pointer-events-none md:opacity-0' : 'flex opacity-100'
            }`}
          >
            {/* Header Branding using Official SiteLogo */}
            <div className="text-center space-y-1.5 mb-4">
              <div className="flex justify-center mb-1">
                <SiteLogo width={56} height={56} showText={false} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-1">
                {t.registerTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                {t.registerSubtitle}
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-[0.99] mb-3.5 group cursor-pointer"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
              ) : (
                <svg
                  className="w-4 h-4 shrink-0 group-hover:scale-105 transition-transform"
                  viewBox="0 0 24 24"
                >
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
              <span>{t.googleRegister}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-3">
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider shrink-0 select-none">
                {t.dividerRegister}
              </span>
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    required
                    className="w-full h-10 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-3 text-sm transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                    className="w-full h-10 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-left placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-3 font-sans text-sm transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Phone with Country selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  {t.phoneLabel}
                </label>
                <PhoneInput
                  value={registerPhone}
                  onChange={setRegisterPhone}
                  placeholder="79 123 4567"
                  defaultCountry="AF"
                  className="bg-slate-100/70 dark:bg-slate-950/60 border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white h-10 rounded-xl"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      required
                      minLength={6}
                      className="w-full h-10 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-left placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-3 font-sans text-sm transition-all"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      required
                      minLength={6}
                      className="w-full h-10 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-left placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-9 font-sans text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Upgraded Image / Puzzle Slider CAPTCHA */}
              <ImagePuzzleCaptcha
                onVerify={setIsRegisterCaptchaValid}
                resetSignal={captchaSignal}
                lang={activeLang}
                className="mt-1"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading || !isRegisterCaptchaValid}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.99] mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.loadingRegister}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.submitRegister}</span>
                  </>
                )}
              </button>
            </form>

            {/* Mobile switch link */}
            <div className="mt-4 text-center md:hidden">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.hasAccountPrompt}{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('login')}
                  className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline mx-1 cursor-pointer"
                >
                  {t.loginLink}
                </button>
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SLIDING GLASS PANEL (DESKTOP ONLY)                       */}
          {/* Light / Dark Mode adaptive, Clean minimal surface        */}
          {/* ======================================================== */}
          <motion.div
            initial={false}
            animate={{
              x: panelX,
            }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 26,
            }}
            className="absolute top-0 bottom-0 left-0 w-1/2 z-20 hidden md:flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-cyan-50/90 via-slate-100/95 to-blue-50/90 dark:from-cyan-950/85 dark:via-slate-900/95 dark:to-blue-950/85 backdrop-blur-2xl border-l border-r border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-colors"
          >
            {/* Ambient Radial Highlights */}
            <div className="absolute top-1/4 -right-10 w-48 h-48 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -left-10 w-48 h-48 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Content Crossfade: Link-in-Bio first pivot */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key={`welcome-back-${activeLang}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 relative z-10 max-w-sm"
                >
                  <div className="space-y-3">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                      <span className="bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-400 bg-clip-text text-transparent">
                        {t.welcomeBackHeading}
                      </span>
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t.welcomeBackDesc}
                    </p>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {t.noAccountPrompt}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleToggleMode('register')}
                      className="px-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-cyan-400/40 text-slate-800 dark:text-cyan-300 hover:text-cyan-600 dark:hover:text-white font-bold text-xs tracking-wide shadow-md shadow-slate-200 dark:shadow-cyan-500/10 hover:border-cyan-500 active:scale-95 transition-all cursor-pointer"
                    >
                      {t.welcomeBackBtn}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`welcome-hello-${activeLang}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 relative z-10 max-w-sm"
                >
                  <div className="space-y-3">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                      <span className="bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-400 bg-clip-text text-transparent">
                        {t.welcomeHelloHeading}
                      </span>
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t.welcomeHelloDesc}
                    </p>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {t.hasAccountPrompt}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleToggleMode('login')}
                      className="px-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-cyan-400/40 text-slate-800 dark:text-cyan-300 hover:text-cyan-600 dark:hover:text-white font-bold text-xs tracking-wide shadow-md shadow-slate-200 dark:shadow-cyan-500/10 hover:border-cyan-500 active:scale-95 transition-all cursor-pointer"
                    >
                      {t.welcomeHelloBtn}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Tagline with English Year Number */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wider">
                {t.footerCopyright}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3-STEP PASSWORD RECOVERY MODAL DIALOG                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isRecoveryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecoveryOpen(false)}
              className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Card with 3 Steps & Light/Dark support */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl z-10 overflow-hidden text-slate-900 dark:text-white"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Top Controls: Back Step button & Close X button */}
              <div className="flex items-center justify-between mb-2">
                {recoveryStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setRecoveryStep((prev) => (prev > 1 ? (prev - 1 as 1 | 2) : 1))}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                    <span>بازگشت</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3-Step Progress Indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      recoveryStep === stepNum
                        ? 'w-8 bg-gradient-to-r from-cyan-500 to-blue-600'
                        : recoveryStep > stepNum
                        ? 'w-4 bg-emerald-500'
                        : 'w-4 bg-slate-200 dark:bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* STEP 1: Enter Email */}
              {recoveryStep === 1 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                    <KeyRound className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
                      {t.recoveryStepIndicator.replace('{step}', '1')}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {t.recoveryStep1Title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t.recoveryStep1Subtitle}
                    </p>
                  </div>

                  <form onSubmit={handleRecoveryStep1SendCode} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                        {t.emailLabel}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          dir="ltr"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder={t.emailPlaceholder}
                          required
                          className="w-full h-11 rounded-xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-left placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-3 font-sans text-sm"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isRecoveryLoading}
                        className="flex-1 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isRecoveryLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t.recoveryLoading}</span>
                          </>
                        ) : (
                          <span>{t.recoverySendCode}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRecoveryOpen(false)}
                        className="h-11 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                      >
                        {t.recoveryCancel}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 2: Enter 6-digit OTP Code */}
              {recoveryStep === 2 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
                      {t.recoveryStepIndicator.replace('{step}', '2')}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {t.recoveryStep2Title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t.recoveryStep2Subtitle}{' '}
                      <span className="font-sans font-semibold text-cyan-600 dark:text-cyan-400">
                        {recoveryEmail}
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleRecoveryStep2VerifyOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                        {t.recoveryOtpLabel}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        dir="ltr"
                        value={recoveryOtp}
                        onChange={(e) => setRecoveryOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder={t.recoveryOtpPlaceholder}
                        required
                        className="w-full h-12 rounded-xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-center tracking-[0.4em] font-sans text-xl font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Resend Cooldown Timer */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                      <button
                        type="button"
                        disabled={resendCooldown > 0}
                        onClick={() => {
                          setResendCooldown(60);
                          toast.success(t.toastCodeSent);
                        }}
                        className="text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{t.recoveryResendCode}</span>
                      </button>
                      {resendCooldown > 0 && (
                        <span className="font-sans text-[11px] text-slate-400">
                          {resendCooldown}s
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isRecoveryLoading || recoveryOtp.length !== 6}
                        className="flex-1 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isRecoveryLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t.recoveryLoading}</span>
                          </>
                        ) : (
                          <span>{t.recoveryVerifyCode}</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: Enter New Password */}
              {recoveryStep === 3 && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                      {t.recoveryStepIndicator.replace('{step}', '3')}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {t.recoveryStep3Title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t.recoveryStep3Subtitle}
                    </p>
                  </div>

                  <form onSubmit={handleRecoveryStep3SavePassword} className="space-y-3.5">
                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                        {t.recoveryNewPassword}
                      </label>
                      <div className="relative">
                        <input
                          type={showRecoveryPassword ? 'text' : 'password'}
                          dir="ltr"
                          value={recoveryNewPassword}
                          onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="w-full h-11 rounded-xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-left placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-10 font-sans text-sm"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showRecoveryPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                        {t.recoveryConfirmPassword}
                      </label>
                      <div className="relative">
                        <input
                          type={showRecoveryPassword ? 'text' : 'password'}
                          dir="ltr"
                          value={recoveryConfirmPassword}
                          onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="w-full h-11 rounded-xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white text-left placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-10 pr-3 font-sans text-sm"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isRecoveryLoading}
                        className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isRecoveryLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t.recoveryLoading}</span>
                          </>
                        ) : (
                          <span>{t.recoverySavePassword}</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AuthPage;
