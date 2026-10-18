'use client';

import React, { useState, useEffect } from 'react';
import { RotateCw, ShieldCheck, AlertCircle } from 'lucide-react';

interface MathCaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export const MathCaptcha: React.FC<MathCaptchaProps> = ({ onVerify, className = '' }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setUserAnswer(val);
    setHasInteracted(true);

    const parsed = parseInt(val, 10);
    const correct = parsed === num1 + num2;
    setIsAnswerCorrect(correct);
    onVerify(correct);
  };

  return (
    <div className={`space-y-2 p-3 rounded-2xl bg-muted/40 border border-border/80 transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>کد امنیتی ضد ربات (کپچا)</span>
        </label>
        <button
          type="button"
          onClick={generateCaptcha}
          className="text-[11px] text-muted-foreground hover:text-cyan-500 flex items-center gap-1 transition-colors"
          title="تغییر سوال کپچا"
        >
          <RotateCw className="w-3 h-3" />
          <span>سوال جدید</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Visual Challenge Box */}
        <div
          className="select-none flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900/10 dark:bg-slate-900 border border-border font-outfit text-base font-extrabold tracking-widest text-cyan-600 dark:text-cyan-400 shadow-inner relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 40%)',
          }}
        >
          {/* Subtle noise lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none border-b border-t border-cyan-400 rotate-6 scale-110" />
          <span className="relative z-10">
            {num1} + {num2} = ؟
          </span>
        </div>

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            inputMode="numeric"
            value={userAnswer}
            onChange={handleChange}
            placeholder="حاصل جمع؟"
            maxLength={3}
            className={`w-full bg-background border rounded-xl px-3 py-2 text-sm text-center font-outfit text-foreground focus:outline-none transition-all ${
              hasInteracted
                ? isAnswerCorrect
                  ? 'border-emerald-500 ring-1 ring-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-rose-500 ring-1 ring-rose-500'
                : 'border-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
            }`}
          />
        </div>
      </div>

      {hasInteracted && !isAnswerCorrect && userAnswer.length > 0 && (
        <p className="text-[10px] text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>پاسخ اشتباه است. لطفاً حاصل جمع دو عدد را به درستی وارد کنید.</span>
        </p>
      )}

      {isAnswerCorrect && (
        <p className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>کد امنیتی با موفقیت تایید شد.</span>
        </p>
      )}
    </div>
  );
};

export default MathCaptcha;
