'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  LocalizedFieldValue,
  MultilingualText,
  normalizeMultilingual,
} from '@/lib/i18n/multilingual';

export type FieldLangTab = 'da' | 'ps' | 'en';

export type MultilingualPlaceholder =
  | string
  | {
      da?: string;
      fa?: string;
      ps?: string;
      en?: string;
    };

export interface BaseMultilingualFieldProps {
  label?: string;
  hideLabel?: boolean;
  labelAction?: React.ReactNode;
  value: LocalizedFieldValue;
  onChange: (val: MultilingualText) => void;
  placeholder?: MultilingualPlaceholder;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  compact?: boolean;
  onFieldBlur?: (text: string, lang: FieldLangTab) => void;
}

const TABS: ReadonlyArray<{
  code: FieldLangTab;
  label: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}> = [
  { code: 'da', label: 'دری / فارسی', flag: '🇦🇫', dir: 'rtl' },
  { code: 'ps', label: 'پښتو', flag: '🇦🇫', dir: 'rtl' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
];

export function resolvePlaceholder(
  placeholder: MultilingualPlaceholder | undefined,
  lang: FieldLangTab
): string {
  if (!placeholder) {
    if (lang === 'da') return 'متن به زبان دری...';
    if (lang === 'ps') return 'په پښتو ژبه متن ولیکئ...';
    return 'Enter English text...';
  }
  if (typeof placeholder === 'string') return placeholder;
  if (lang === 'da') return placeholder.da || placeholder.fa || '';
  return placeholder[lang] || placeholder.da || placeholder.fa || '';
}

interface ShellProps {
  label?: string;
  hideLabel?: boolean;
  labelAction?: React.ReactNode;
  value: LocalizedFieldValue;
  onChange: (val: MultilingualText) => void;
  required?: boolean;
  className?: string;
  compact?: boolean;
  children: (ctx: {
    activeTab: FieldLangTab;
    dir: 'rtl' | 'ltr';
    currentValue: string;
    normalized: MultilingualText;
    isTranslating: boolean;
    handleTextChange: (nextText: string) => void;
    handleAutoTranslate: (forceTarget?: FieldLangTab) => Promise<void>;
  }) => React.ReactNode;
}

/**
 * Shared trilingual field wrapper handling language tabs, `{ da, fa, ps, en }`
 * state normalization, and Magic Wand AI auto-translation via `/api/translate`.
 */
export function MultilingualFieldShell({
  label,
  hideLabel = false,
  labelAction,
  value,
  onChange,
  required = false,
  className = '',
  compact = false,
  children,
}: ShellProps) {
  const [activeTab, setActiveTab] = useState<FieldLangTab>('da');
  const [isTranslating, setIsTranslating] = useState(false);

  const normalized = useMemo(() => normalizeMultilingual(value), [value]);

  const activeConfig = TABS.find((t) => t.code === activeTab) || TABS[0];

  const handleTextChange = (nextText: string) => {
    const next: MultilingualText = {
      ...normalized,
      [activeTab]: nextText,
    };
    if (activeTab === 'da') {
      next.fa = nextText;
    } else {
      next.fa = normalized.da || normalized.fa || '';
    }
    onChange(next);
  };

  const handleAutoTranslate = async (forceTarget?: FieldLangTab) => {
    // Pick best non-empty source text (prefer active tab if on it, else Dari, else any)
    let sourceLang: FieldLangTab = 'da';
    let sourceText = normalized.da || normalized.fa || '';

    if (forceTarget && forceTarget !== 'da' && sourceText.trim()) {
      sourceLang = 'da';
    } else if (!sourceText.trim()) {
      if (normalized.en?.trim()) {
        sourceLang = 'en';
        sourceText = normalized.en;
      } else if (normalized.ps?.trim()) {
        sourceLang = 'ps';
        sourceText = normalized.ps;
      }
    }

    if (!sourceText.trim()) {
      toast.error('لطفاً ابتدا متن دری (یا یکی از زبان‌ها) را وارد نمایید.');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang: forceTarget || 'all',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.message || 'خطا در ترجمه هوشمند متن.');
        return;
      }

      const next: MultilingualText = {
        da:
          forceTarget === 'da'
            ? data.da || data.fa || normalized.da
            : normalized.da || data.da || data.fa || '',
        fa:
          forceTarget === 'da'
            ? data.fa || data.da || normalized.da
            : normalized.da || data.fa || data.da || '',
        ps:
          forceTarget === 'ps'
            ? data.ps || normalized.ps
            : forceTarget
            ? normalized.ps
            : data.ps || normalized.ps || '',
        en:
          forceTarget === 'en'
            ? data.en || normalized.en
            : forceTarget
            ? normalized.en
            : data.en || normalized.en || '',
      };

      onChange(next);
      toast.success(
        forceTarget === 'ps'
          ? 'ترجمه پشتو با موفقیت انجام شد!'
          : forceTarget === 'en'
          ? 'ترجمه انگلیسی با موفقیت انجام شد!'
          : 'ترجمه هوشمند دری، پشتو و انگلیسی تکمیل شد!'
      );
    } catch {
      toast.error('ارتباط با سرور ترجمه برقرار نشد.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header Row: Label + Optional Action + Language Tabs + Magic Wand */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {!hideLabel && (label || labelAction) ? (
          <div className="flex items-center gap-2 min-w-0">
            {label && (
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>{label}</span>
                {required && <span className="text-rose-500">*</span>}
              </label>
            )}
            {labelAction}
          </div>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Trilingual Tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-muted/80 border border-border">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.code;
              const tabVal =
                tab.code === 'da'
                  ? normalized.da || normalized.fa || ''
                  : normalized[tab.code] || '';
              const hasValue = Boolean(tabVal.trim());

              return (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => setActiveTab(tab.code)}
                  className={`flex items-center gap-1.5 ${
                    compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-[11px]'
                  } rounded-lg font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-background text-foreground shadow-sm border border-border/60'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.flag}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      hasValue ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Primary Magic Wand Button */}
          <button
            type="button"
            onClick={() => handleAutoTranslate()}
            disabled={isTranslating}
            title="ترجمه خودکار همه زبان‌ها (چوب جادو)"
            className={`inline-flex items-center gap-1.5 ${
              compact ? 'px-2.5 py-1 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'
            } rounded-xl bg-gradient-to-r from-indigo-500/15 to-cyan-500/15 hover:from-indigo-500/25 hover:to-cyan-500/25 text-indigo-600 dark:text-cyan-300 border border-indigo-500/25 font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0`}
          >
            {isTranslating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">ترجمه جادویی</span>
          </button>
        </div>
      </div>

      {/* Input / Textarea Control + Tab-Specific Magic Wand Action */}
      {children({
        activeTab,
        dir: activeConfig.dir,
        currentValue:
          activeTab === 'da'
            ? normalized.da || normalized.fa || ''
            : normalized[activeTab] || '',
        normalized,
        isTranslating,
        handleTextChange,
        handleAutoTranslate,
      })}

      {/* Quick Inline Magic Wand helper bar when editing Pashto or English tab */}
      {activeTab !== 'da' && Boolean((normalized.da || normalized.fa || '').trim()) && (
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[10px] text-muted-foreground truncate max-w-[65%]">
            متن مبدا (دری): {normalized.da || normalized.fa}
          </span>
          <button
            type="button"
            onClick={() => handleAutoTranslate(activeTab)}
            disabled={isTranslating}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-cyan-400 hover:underline disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isTranslating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            <span>
              {activeTab === 'ps' ? 'تولید خودکار پشتو از دری' : 'تولید خودکار انگلیسی از دری'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
