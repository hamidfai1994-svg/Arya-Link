'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, ShieldCheck, Check, AlertCircle, ChevronsRight } from 'lucide-react';
import { SupportedLanguage } from '@/lib/i18n/types';

interface ImagePuzzleCaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
  resetSignal?: number;
  lang?: SupportedLanguage;
}

const captchaTexts = {
  da: {
    label: 'تایید هویت امنیتی (پازل تصویری)',
    slidePrompt: 'جهت تکمیل پازل، دکمه را بکشید',
    refresh: 'تصویر جدید',
    success: 'امنیت با موفقیت تایید گردید',
    error: 'پازل در جای دقیق قرار نگرفت. لطفاً دوباره تلاش نمایید.',
  },
  ps: {
    label: 'امنیتي تصدیق (انځوریز پازل)',
    slidePrompt: 'د پازل بشپړولو لپاره تڼۍ کش کړئ',
    refresh: 'نوی انځور',
    success: 'امنیت په بریالیتوب سره تایید شو',
    error: 'پازل په سم ځای کې ونه لګېد. مهرباني وکړئ بیا هڅه وکړئ.',
  },
  en: {
    label: 'Security Verification (Puzzle CAPTCHA)',
    slidePrompt: 'Drag slider to complete the puzzle',
    refresh: 'New Image',
    success: 'Verification successful',
    error: 'Puzzle did not align. Please try again.',
  },
};

// Curated aesthetic background themes for the visual puzzle
const PUZZLE_THEMES = [
  {
    id: 1,
    name: 'Cyber Cyan',
    bg: 'linear-gradient(135deg, #091e3a 0%, #003254 45%, #055e88 70%, #06b6d4 100%)',
    shapes: [
      { cx: 80, cy: 35, r: 28, fill: '#0ea5e9', opacity: 0.35 },
      { cx: 190, cy: 75, r: 42, fill: '#06b6d4', opacity: 0.25 },
      { cx: 270, cy: 30, r: 24, fill: '#38bdf8', opacity: 0.3 },
    ],
  },
  {
    id: 2,
    name: 'Cosmic Indigo',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #312e81 70%, #2563eb 100%)',
    shapes: [
      { cx: 70, cy: 65, r: 35, fill: '#6366f1', opacity: 0.35 },
      { cx: 180, cy: 25, r: 30, fill: '#38bdf8', opacity: 0.3 },
      { cx: 280, cy: 70, r: 38, fill: '#818cf8', opacity: 0.25 },
    ],
  },
  {
    id: 3,
    name: 'Deep Emerald',
    bg: 'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #047857 70%, #10b981 100%)',
    shapes: [
      { cx: 90, cy: 40, r: 32, fill: '#34d399', opacity: 0.3 },
      { cx: 210, cy: 65, r: 40, fill: '#059669', opacity: 0.35 },
      { cx: 290, cy: 30, r: 25, fill: '#6ee7b7', opacity: 0.25 },
    ],
  },
  {
    id: 4,
    name: 'Neon Horizon',
    bg: 'linear-gradient(135deg, #180828 0%, #3b0764 45%, #6b21a8 70%, #0284c7 100%)',
    shapes: [
      { cx: 75, cy: 70, r: 36, fill: '#c084fc', opacity: 0.3 },
      { cx: 170, cy: 35, r: 32, fill: '#38bdf8', opacity: 0.35 },
      { cx: 260, cy: 75, r: 40, fill: '#a855f7', opacity: 0.25 },
    ],
  },
];

export function ImagePuzzleCaptcha({
  onVerify,
  className = '',
  resetSignal,
  lang = 'da',
}: ImagePuzzleCaptchaProps) {
  const t = captchaTexts[lang] || captchaTexts.da;
  const isRtl = lang !== 'en';

  // Random theme & random target slot X position
  const [themeIndex, setThemeIndex] = useState(0);
  const [targetX, setTargetX] = useState(140);
  const [sliderPos, setSliderPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasError, setHasError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Generate new random challenge
  const resetPuzzle = () => {
    setIsVerified(false);
    setHasError(false);
    setSliderPos(0);
    onVerify(false);
    setThemeIndex((prev) => (prev + 1) % PUZZLE_THEMES.length);

    // Set target hole somewhere between 35% and 80% of typical 300px width (approx 105px to 230px)
    const newTarget = Math.floor(Math.random() * 125) + 105;
    setTargetX(newTarget);
  };

  useEffect(() => {
    resetPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const maxSlide = 220; // Maximum slider drag distance in px
  const pieceX = (sliderPos / maxSlide) * (maxSlide + 10);

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isVerified) return;
    setIsDragging(true);
    setHasError(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isVerified) return;
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    let currentDelta = 0;

    // Calculate drag distance according to layout direction
    if (isRtl) {
      currentDelta = rect.right - e.clientX - 22;
    } else {
      currentDelta = e.clientX - rect.left - 22;
    }

    const clamped = Math.max(0, Math.min(maxSlide, currentDelta));
    setSliderPos(clamped);
  };

  const handlePointerUp = () => {
    if (!isDragging || isVerified) return;
    setIsDragging(false);

    // Calculate difference between piece position and target slot
    const diff = Math.abs(pieceX - targetX);
    const tolerance = 7.5; // pixel tolerance for human match

    if (diff <= tolerance) {
      // Verified successfully!
      setIsVerified(true);
      setHasError(false);
      onVerify(true);
    } else {
      // Missed: show error shake and reset
      setHasError(true);
      onVerify(false);
      setTimeout(() => {
        setSliderPos(0);
      }, 450);
    }
  };

  const currentTheme = PUZZLE_THEMES[themeIndex];

  return (
    <div
      ref={containerRef}
      className={`space-y-2 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-md select-none transition-all ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header Label and Refresh Button */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>{t.label}</span>
        </label>
        <button
          type="button"
          onClick={resetPuzzle}
          disabled={isVerified}
          className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 transition-colors group cursor-pointer disabled:opacity-40"
          title={t.refresh}
        >
          <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
          <span>{t.refresh}</span>
        </button>
      </div>

      {/* Visual Puzzle Stage Canvas */}
      <div
        className={`relative w-full h-[120px] rounded-xl overflow-hidden border shadow-inner transition-colors ${
          isVerified
            ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            : hasError
            ? 'border-rose-500/80 ring-1 ring-rose-500/30'
            : 'border-slate-300 dark:border-white/10'
        }`}
        style={{ background: currentTheme.bg }}
      >
        {/* Decorative Graphic Elements inside puzzle background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle background tech grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Glowing geometric circles */}
          {currentTheme.shapes.map((s, idx) => (
            <circle key={idx} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} opacity={s.opacity} />
          ))}

          {/* Subtle curved dynamic lines */}
          <path
            d="M 10 100 Q 120 20 220 80 T 360 40"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* TARGET HOLE (Cutout Slot) */}
        <div
          className="absolute top-[34px] w-10 h-10 rounded-lg border-2 border-dashed border-white/60 bg-black/40 shadow-inner z-10 pointer-events-none flex items-center justify-center transition-all"
          style={{
            [isRtl ? 'right' : 'left']: `${targetX}px`,
          }}
        >
          {/* Inner lock icon indicator */}
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        </div>

        {/* SLIDING PUZZLE PIECE */}
        <motion.div
          animate={hasError ? { x: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.35 }}
          className={`absolute top-[34px] w-10 h-10 rounded-lg shadow-xl z-20 flex items-center justify-center pointer-events-none ${
            isVerified
              ? 'bg-emerald-500/90 border-2 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'bg-cyan-500/80 border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-md'
          }`}
          style={{
            [isRtl ? 'right' : 'left']: `${pieceX}px`,
          }}
        >
          {isVerified ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-white/70 shadow-sm" />
          )}
        </motion.div>

        {/* Verified Overlay Badge */}
        {isVerified && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center z-30 transition-all">
            <div className="px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <Check className="w-3.5 h-3.5" />
              <span>{t.success}</span>
            </div>
          </div>
        )}
      </div>

      {/* SLIDER DRAG TRACK */}
      <div
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative h-11 w-full rounded-xl overflow-hidden flex items-center bg-slate-200/80 dark:bg-slate-950/80 border transition-colors ${
          isVerified
            ? 'border-emerald-500/50 bg-emerald-500/10'
            : hasError
            ? 'border-rose-500/50'
            : 'border-slate-300 dark:border-white/10'
        }`}
      >
        {/* Progress Fill behind slider handle */}
        <div
          className={`absolute top-0 bottom-0 transition-colors ${
            isVerified ? 'bg-emerald-500/25' : 'bg-cyan-500/20'
          }`}
          style={{
            [isRtl ? 'right' : 'left']: 0,
            width: `${sliderPos + 22}px`,
          }}
        />

        {/* Centered prompt text */}
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-slate-500 dark:text-slate-400 pointer-events-none select-none px-4 text-center">
          {isVerified ? t.success : t.slidePrompt}
        </span>

        {/* Draggable Slider Thumb */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          disabled={isVerified}
          className={`absolute top-1 bottom-1 w-11 rounded-lg flex items-center justify-center shadow-md touch-none cursor-grab active:cursor-grabbing transition-transform ${
            isVerified
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30 active:scale-95'
          }`}
          style={{
            [isRtl ? 'right' : 'left']: `${sliderPos + 4}px`,
          }}
          aria-label={t.slidePrompt}
        >
          {isVerified ? (
            <ShieldCheck className="w-5 h-5" />
          ) : (
            <ChevronsRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          )}
        </button>
      </div>

      {/* Error / Warning Alert */}
      {hasError && !isVerified && (
        <p className="text-[10px] text-rose-500 dark:text-rose-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{t.error}</span>
        </p>
      )}
    </div>
  );
}

export default ImagePuzzleCaptcha;
