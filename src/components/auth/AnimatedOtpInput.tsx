'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type OTPStatus = 'typing' | 'error' | 'success';

export interface AnimatedOtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  status?: OTPStatus | 'idle' | 'merging';
  errorMessage?: string;
  disabled?: boolean;
  email?: string;
  onChangeEmail?: () => void;
  onErrorComplete?: () => void;
}

const translations = {
  da: {
    verifyTitle: 'تایید کد ورود',
    verifySubtitle: 'کد 6 رقمی ارسال‌شده به ایمیل را وارد نمایید.',
    digitAria: 'رقم',
    changeEmail: 'تغییر ایمیل',
  },
  pa: {
    verifyTitle: 'د ننوتلو کوډ تایید',
    verifySubtitle: 'خپل برېښنالیک ته استول شوی 6 عددي کوډ ولیکئ.',
    digitAria: 'شمېره',
    changeEmail: 'د برېښنالیک بدلون',
  },
  en: {
    verifyTitle: 'Verify Login Code',
    verifySubtitle: 'Enter the 6-digit code sent to your email.',
    digitAria: 'Digit',
    changeEmail: 'Change Email',
  },
};

const containerVariants = {
  typing: { x: 0 },
  error: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.45,
      ease: 'easeInOut',
    },
  },
  success: { x: 0 },
};

const boxVariants = {
  typing: (custom: { index: number; isActive: boolean; hasValue: boolean }) => ({
    scale: 1,
    borderColor: custom.isActive
      ? '#06b6d4'
      : custom.hasValue
      ? 'rgba(6, 182, 212, 0.45)'
      : 'rgba(148, 163, 184, 0.25)',
    backgroundColor: custom.isActive
      ? 'rgba(6, 182, 212, 0.08)'
      : custom.hasValue
      ? 'rgba(6, 182, 212, 0.03)'
      : 'rgba(255, 255, 255, 0.04)',
    boxShadow: custom.isActive ? '0 0 0 3px rgba(6, 182, 212, 0.2)' : 'none',
    transition: { duration: 0.2 },
  }),
  error: (custom: { index: number }) => ({
    scale: [1, 1.06, 1],
    borderColor: ['rgba(239, 68, 68, 0.4)', '#ef4444', '#ef4444'],
    backgroundColor: [
      'rgba(239, 68, 68, 0.04)',
      'rgba(239, 68, 68, 0.16)',
      'rgba(239, 68, 68, 0.06)',
    ],
    boxShadow: [
      '0 0 0px rgba(239, 68, 68, 0)',
      '0 0 14px rgba(239, 68, 68, 0.6)',
      '0 0 4px rgba(239, 68, 68, 0.2)',
    ],
    transition: {
      delay: custom.index * 0.05,
      duration: 0.35,
      ease: 'easeInOut',
    },
  }),
  success: (custom: { index: number }) => ({
    scale: [1, 1.08, 1],
    borderColor: ['rgba(6, 182, 212, 0.5)', '#10b981', '#10b981'],
    backgroundColor: [
      'rgba(16, 185, 129, 0.05)',
      'rgba(16, 185, 129, 0.2)',
      'rgba(16, 185, 129, 0.1)',
    ],
    boxShadow: [
      '0 0 0px rgba(16, 185, 129, 0)',
      '0 0 18px rgba(16, 185, 129, 0.7)',
      '0 0 8px rgba(16, 185, 129, 0.3)',
    ],
    transition: {
      delay: custom.index * 0.08,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

interface OTPBoxProps {
  index: number;
  value: string;
  isActive: boolean;
  status: OTPStatus;
  boxSize: number;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onFocus: (index: number) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

const OTPBox: React.FC<OTPBoxProps> = ({
  index,
  value,
  isActive,
  status,
  boxSize,
  disabled = false,
  onChange,
  onKeyDown,
  onPaste,
  onFocus,
  inputRef,
}) => {
  const hasValue = value !== '';

  return (
    <motion.div
      className="relative rounded-2xl border transition-colors select-none flex items-center justify-center overflow-hidden"
      style={{
        width: `${boxSize}px`,
        height: `${boxSize}px`,
      }}
      variants={boxVariants}
      custom={{ index, isActive, hasValue }}
      animate={status}
      whileTap={status === 'typing' ? { scale: 0.96 } : {}}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={value}
        onChange={(e) => onChange(e, index)}
        onKeyDown={(e) => onKeyDown(e, index)}
        onPaste={onPaste}
        onFocus={() => onFocus(index)}
        className={`w-full h-full bg-transparent border-none outline-none text-center font-sans font-bold text-lg sm:text-xl transition-colors cursor-text caret-cyan-500 dark:caret-cyan-400 select-all z-10 ${
          status === 'success'
            ? 'text-emerald-500 dark:text-emerald-400'
            : status === 'error'
            ? 'text-rose-500 dark:text-rose-400'
            : 'text-slate-900 dark:text-white'
        }`}
        disabled={status !== 'typing' || disabled}
        autoComplete="one-time-code"
      />
    </motion.div>
  );
};

export const AnimatedOtpInput: React.FC<AnimatedOtpInputProps> = ({
  length = 6,
  onComplete,
  status = 'typing',
  errorMessage,
  disabled = false,
  email,
  onChangeEmail,
  onErrorComplete,
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.da;

  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [currentStatus, setCurrentStatus] = useState<OTPStatus>('typing');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmittedCodeRef = useRef<string>('');

  const isMobile = windowWidth <= 480;
  const boxSize = isMobile ? 42 : 48;
  const gapSize = isMobile ? 8 : 10;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync external status prop with internal currentStatus and manage error timers
  useEffect(() => {
    if (status === 'error') {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
      setCurrentStatus('error');

      // Auto-recover after ~650ms error animation (between 500ms and 800ms)
      errorTimerRef.current = setTimeout(() => {
        setOtp(Array(length).fill(''));
        setActiveIndex(0);
        setCurrentStatus('typing');
        lastSubmittedCodeRef.current = '';
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
        onErrorComplete?.();
        errorTimerRef.current = null;
      }, 650);
    } else if (status === 'success') {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
      setCurrentStatus('success');
    } else {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
      setCurrentStatus('typing');
    }

    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
    };
  }, [status, length, onErrorComplete]);

  // When all digits are entered, trigger onComplete exactly once per full code
  useEffect(() => {
    const isComplete = otp.every((d) => d !== '');
    const fullCode = otp.join('');
    if (isComplete && currentStatus === 'typing' && fullCode !== lastSubmittedCodeRef.current) {
      lastSubmittedCodeRef.current = fullCode;
      onComplete(fullCode);
    } else if (!isComplete) {
      lastSubmittedCodeRef.current = '';
    }
  }, [otp, currentStatus, onComplete]);

  // Handle typing of digits (strict English numerals)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // If currently in error state, immediately switch back to typing and clear error
    if (currentStatus === 'error' || status === 'error') {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
      setCurrentStatus('typing');
      onErrorComplete?.();
    }

    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const lastChar = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    if (index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (currentStatus === 'error' || status === 'error') {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
      setCurrentStatus('typing');
      onErrorComplete?.();
    }

    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index] !== '') {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    if (currentStatus === 'error' || status === 'error') {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
      setCurrentStatus('typing');
      onErrorComplete?.();
    }
    setActiveIndex(index);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (currentStatus === 'error' || status === 'error') {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }
      setCurrentStatus('typing');
      onErrorComplete?.();
    }

    const pasted = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    if (!pasted) return;

    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(pasted.length, length - 1);
    setActiveIndex(focusIndex);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Dynamic Animated Status Icon */}
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300"
        style={{
          backgroundColor:
            currentStatus === 'success'
              ? 'rgba(16, 185, 129, 0.15)'
              : currentStatus === 'error'
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(6, 182, 212, 0.15)',
          border: `1px solid ${
            currentStatus === 'success'
              ? 'rgba(16, 185, 129, 0.3)'
              : currentStatus === 'error'
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(6, 182, 212, 0.3)'
          }`,
        }}
        layout
      >
        <AnimatePresence mode="wait">
          {currentStatus === 'success' ? (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <Check className="w-7 h-7 text-emerald-400" strokeWidth={2.5} />
            </motion.div>
          ) : currentStatus === 'error' ? (
            <motion.div key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <AlertCircle className="w-7 h-7 text-rose-400" strokeWidth={2} />
            </motion.div>
          ) : (
            <motion.div key="shield" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Shield className="w-7 h-7 text-cyan-400" strokeWidth={1.75} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Title & Subtitle */}
      <motion.h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 text-center" layout>
        {t.verifyTitle}
      </motion.h3>
      <motion.div className="text-xs text-slate-500 dark:text-slate-400 mb-6 text-center max-w-xs leading-relaxed" layout>
        {email ? (
          <div className="flex flex-col items-center gap-1">
            <span>
              {t.verifySubtitle}{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200" dir="ltr">
                {email}
              </span>
            </span>
            {onChangeEmail && (
              <button
                type="button"
                onClick={onChangeEmail}
                disabled={currentStatus !== 'typing' || disabled}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium text-[11px] mt-0.5 cursor-pointer disabled:opacity-50"
              >
                {t.changeEmail}
              </button>
            )}
          </div>
        ) : (
          <span>{t.verifySubtitle}</span>
        )}
      </motion.div>

      {/* 6 OTP Boxes Container with Horizontal Shake Animation */}
      <motion.div
        className={`flex items-center justify-center gap-2 sm:gap-2.5 ${
          currentStatus !== 'typing' ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        dir="ltr"
        style={{ gap: `${gapSize}px` }}
        variants={containerVariants}
        animate={currentStatus}
      >
        {otp.map((digit, index) => (
          <OTPBox
            key={index}
            index={index}
            value={digit}
            isActive={activeIndex === index && currentStatus === 'typing'}
            status={currentStatus}
            boxSize={boxSize}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            inputRef={(el) => (inputRefs.current[index] = el)}
          />
        ))}
      </motion.div>

      {/* Error Message */}
      {currentStatus === 'error' && errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold text-rose-400 mt-3 text-center"
        >
          {errorMessage}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedOtpInput;
