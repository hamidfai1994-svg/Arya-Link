'use client';

import React, { useState, useEffect } from 'react';
import { RotateCw, ShieldCheck, AlertCircle } from 'lucide-react';

export type AuthLang = 'prs' | 'ps' | 'en';

interface MathCaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
  resetSignal?: number;
  lang?: AuthLang;
}

const captchaDict: Record<
  AuthLang,
  {
    label: string;
    refresh: string;
    placeholder: string;
    error: string;
    success: string;
  }
> = {
  prs: {
    label: 'کد امنیتی ضد ربات (کپچا)',
    refresh: 'سوال جدید',
    placeholder: 'حاصل جمع؟',
    error: 'پاسخ اشتباه است. حاصل‌جمع دو عدد را به درستی وارد نمایید.',
    success: 'کد امنیتی با موفقیت تایید شد.',
  },
  ps: {
    label: 'د ربات ضد امنیتي کوډ (کپچا)',
    refresh: 'نوې پوښتنه',
    placeholder: 'د جمع ځواب؟',
    error: 'ځواب غلط دی. د دوو عددونو مجموعه ولیکئ.',
    success: 'امنیتي کوډ په بریالیتوب تایید شو.',
  },
  en: {
    label: 'Anti-Bot Security Code (CAPTCHA)',
    refresh: 'New Question',
    placeholder: 'Sum?',
    error: 'Incorrect answer. Please enter the sum of the two numbers.',
    success: 'Security code verified successfully.',
  },
};

export const MathCaptcha: React.FC<MathCaptchaProps> = ({
  onVerify,
  className = '',
  resetSignal,
  lang = 'prs',
}) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const t = captchaDict[lang] || captchaDict.prs;
  const isRtl = lang !== 'en';

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1; // 1 - 9
    const n2 = Math.floor(Math.random() * 9) + 1; // 1 - 9
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setIsAnswerCorrect(false);
    setHasInteracted(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow English digits
    const val = e.target.value.replace(/[^0-9]/g, '');
    setUserAnswer(val);
    setHasInteracted(true);

    const parsed = parseInt(val, 10);
    const correct = parsed === num1 + num2;
    setIsAnswerCorrect(correct);
    onVerify(correct);
  };

  return (
    <div
      className={`space-y-2 p-3 rounded-2xl bg-white/[0.03] dark:bg-slate-900/60 border border-white/10 dark:border-white/10 backdrop-blur-md transition-all ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300 dark:text-slate-200 flex items-center gap-1.5 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.label}</span>
        </label>
        <button
          type="button"
          onClick={generateCaptcha}
          className="text-[11px] text-cyan-400/80 hover:text-cyan-300 flex items-center gap-1 transition-colors select-none group"
          title={t.refresh}
        >
          <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
          <span>{t.refresh}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Visual Challenge Box - Clean, English Digits */}
        <div
          className="select-none flex items-center justify-center px-4 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 font-outfit text-base font-extrabold tracking-widest text-cyan-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.2) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)',
          }}
        >
          <span className="relative z-10 font-mono tracking-wider">
            {num1} + {num2} = ?
          </span>
        </div>

        {/* Input Field - English Digits */}
        <div className="flex-1 relative">
          <input
            type="text"
            inputMode="numeric"
            value={userAnswer}
            onChange={handleChange}
            placeholder={t.placeholder}
            maxLength={3}
            dir="ltr"
            className={`w-full bg-slate-950/60 border rounded-xl px-3 py-2 text-sm text-center font-outfit font-bold text-white placeholder:text-slate-500 focus:outline-none transition-all ${
              hasInteracted
                ? isAnswerCorrect
                  ? 'border-emerald-500 ring-1 ring-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'border-rose-500 ring-1 ring-rose-500 text-rose-400'
                : 'border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
            }`}
          />
        </div>
      </div>

      {hasInteracted && !isAnswerCorrect && userAnswer.length > 0 && (
        <p className="text-[10px] text-rose-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{t.error}</span>
        </p>
      )}

      {isAnswerCorrect && (
        <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1">
          <ShieldCheck className="w-3 h-3 shrink-0 text-emerald-400" />
          <span>{t.success}</span>
        </p>
      )}
    </div>
  );
};

export default MathCaptcha;
