'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Shield, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface AnimatedOtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  status?: 'idle' | 'merging' | 'success' | 'error';
  errorMessage?: string;
  disabled?: boolean;
  email?: string;
  onChangeEmail?: () => void;
}

const translations = {
  da: {
    verifyTitle: 'تایید کد ورود',
    verifySubtitle: 'کد ۶ رقمی ارسال‌شده به ایمیل را وارد نمایید.',
    verifiedSuccess: 'کد با موفقیت تایید گردید',
    digitAria: 'رقم',
    changeEmail: 'تغییر ایمیل',
  },
  pa: {
    verifyTitle: 'د ننوتلو کوډ تایید',
    verifySubtitle: 'خپل برېښنالیک ته استول شوی ۶ عددي کوډ ولیکئ.',
    verifiedSuccess: 'کوډ په بریا سره تایید شو',
    digitAria: 'شمېره',
    changeEmail: 'د برېښنالیک بدلون',
  },
  en: {
    verifyTitle: 'Verify Login Code',
    verifySubtitle: 'Enter the 6-digit code sent to your email.',
    verifiedSuccess: 'Verified Successfully',
    digitAria: 'Digit',
    changeEmail: 'Change Email',
  },
};

interface OTPBoxProps {
  index: number;
  value: string;
  isActive: boolean;
  status: 'idle' | 'merging' | 'success' | 'error';
  stepSize: number;
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
  stepSize,
  onChange,
  onKeyDown,
  onPaste,
  onFocus,
  inputRef,
}) => {
  const controls = useAnimation();
  const prevValue = useRef(value);

  // Micro-interactions for typing
  useEffect(() => {
    if (status === 'idle' && value !== prevValue.current) {
      if (value !== '') {
        controls.start({
          x: [0, -2, 3, -2, 2, 0],
          scale: [1, 1.05, 1],
          transition: { duration: 0.15, ease: 'easeOut' },
        });
      } else if (value === '' && prevValue.current !== '') {
        controls.start({
          x: [0, 2, -2, 0],
          transition: { duration: 0.12, ease: 'easeOut' },
        });
      }
      prevValue.current = value;
    }
  }, [value, controls, status]);

  // Premium Slow-Motion Merge Animation towards center (center index is 2.5 for 6 boxes)
  useEffect(() => {
    if (status === 'merging') {
      const xOffset = (2.5 - index) * stepSize;
      controls.start({
        x: xOffset,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
        scale: 0.95,
        transition: {
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1],
        },
      });
    } else if (status === 'error') {
      controls.start({
        x: [0, -6, 6, -4, 4, 0],
        borderColor: '#ef4444',
        boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)',
        transition: { duration: 0.35 },
      });
    } else if (status === 'idle') {
      controls.start({
        x: 0,
        backgroundColor: isActive ? 'rgba(6, 182, 212, 0.08)' : '',
        borderColor: isActive ? '#06b6d4' : '',
        boxShadow: isActive ? '0 0 0 3px rgba(6, 182, 212, 0.2)' : 'none',
        scale: 1,
        transition: { duration: 0.25 },
      });
    }
  }, [status, index, controls, stepSize, isActive]);

  return (
    <motion.div
      className="relative rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 transition-colors select-none"
      animate={controls}
      whileTap={status === 'idle' ? { scale: 0.96 } : {}}
      style={{
        width: 'var(--box-size, 48px)',
        height: 'var(--box-size, 48px)',
        zIndex: status === 'merging' ? 10 - Math.abs(2.5 - index) : 1,
      }}
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
        className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent cursor-text z-2"
        disabled={status === 'merging' || status === 'success'}
        autoComplete="one-time-code"
      />

      <AnimatePresence>
        {value && status === 'idle' && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl font-bold font-sans text-slate-900 dark:text-white pointer-events-none z-1"
            initial={{ opacity: 0, scale: 0.75, y: 3 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const AnimatedOtpInput: React.FC<AnimatedOtpInputProps> = ({
  length = 6,
  onComplete,
  status = 'idle',
  errorMessage,
  disabled = false,
  email,
  onChangeEmail,
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.da;

  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isMobile = windowWidth <= 480;
  const boxSize = isMobile ? 42 : 48;
  const gapSize = isMobile ? 8 : 10;
  const stepSize = boxSize + gapSize;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When all digits are entered, trigger onComplete
  useEffect(() => {
    const isComplete = otp.every((d) => d !== '');
    if (isComplete && status === 'idle') {
      const fullCode = otp.join('');
      onComplete(fullCode);
    }
  }, [otp, status, onComplete]);

  // Clean English numeric digits
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
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
    <div className="w-full flex flex-col items-center select-none" style={{ '--box-size': `${boxSize}px` } as React.CSSProperties}>
      {/* Dynamic Animated Status Icon */}
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300"
        style={{
          backgroundColor:
            status === 'success'
              ? 'rgba(16, 185, 129, 0.15)'
              : status === 'error'
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(6, 182, 212, 0.15)',
          border: `1px solid ${
            status === 'success'
              ? 'rgba(16, 185, 129, 0.3)'
              : status === 'error'
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(6, 182, 212, 0.3)'
          }`,
        }}
        layout
      >
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <Check className="w-7 h-7 text-emerald-400" strokeWidth={2.5} />
            </motion.div>
          ) : status === 'error' ? (
            <motion.div key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <AlertCircle className="w-7 h-7 text-rose-400" strokeWidth={2} />
            </motion.div>
          ) : status === 'merging' ? (
            <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
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
                disabled={status === 'merging' || status === 'success'}
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

      {/* Boxes Container with Grid Stacking for Merge Animation */}
      <div className="relative flex justify-center items-center w-full min-h-[52px]">
        <div
          className="grid place-items-center w-full"
          style={{ height: `${boxSize}px` }}
        >
          {/* Default Boxes: strict LTR direction */}
          <AnimatePresence>
            {status !== 'success' && (
              <motion.div
                key="boxes"
                className="flex items-center justify-center gap-2 sm:gap-2.5"
                dir="ltr"
                style={{ gap: `${gapSize}px` }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              >
                {otp.map((digit, index) => (
                  <OTPBox
                    key={index}
                    index={index}
                    value={digit}
                    isActive={activeIndex === index}
                    status={status}
                    stepSize={stepSize}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={(i) => setActiveIndex(i)}
                    inputRef={(el) => (inputRefs.current[index] = el)}
                  />
                ))}
              </motion.div>
            )}

            {/* Merged Capsule on Success */}
            {status === 'success' && (
              <motion.div
                key="merged"
                className="flex items-center justify-center bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/30 overflow-hidden"
                style={{ height: `${boxSize}px` }}
                initial={{ width: `${boxSize}px`, borderRadius: '16px' }}
                animate={{ width: '100%', maxWidth: '320px', borderRadius: '24px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="flex items-center justify-center gap-2 px-4 font-bold text-xs sm:text-sm whitespace-nowrap"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', bounce: 0.4 }}
                >
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  <span>{t.verifiedSuccess}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Message */}
      {status === 'error' && errorMessage && (
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
