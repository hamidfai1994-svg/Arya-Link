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
    { code: 'da', label: 'دری', flag: '', dir: 'rtl' },
    { code: 'ps', label: 'پښتو', flag: '', dir: 'rtl' },
    { code: 'en', label: 'English', flag: '', dir: 'ltr' },
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

/**
 * Reusable single-field button to refine or suggest text with AI.
 */
export function AiFieldRefineButton({
  currentText,
  fieldLabel,
  lang = 'da',
  onApply,
  compact = false,
}: {
  currentText: string;
  fieldLabel: string;
  lang?: 'da' | 'ps' | 'en';
  onApply: (refined: string) => void;
  compact?: boolean;
}) {
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    const trimmed = (currentText || '').trim();
    setIsRefining(true);
    const toastId = toast.loading(
      trimmed ? 'در حال اصلاح نگارش با هوش مصنوعی...' : 'در حال تولید متن پیشنهادی با هوش مصنوعی...'
    );

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refine_field',
          currentText: trimmed,
          fieldLabel,
          lang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.data) {
        toast.error(data?.message || 'خطا در ارتباط با دستیار هوش مصنوعی.', { id: toastId });
        return;
      }

      onApply(data.data);
      toast.success(
        trimmed ? 'متن با هوش مصنوعی ویرایش و اصلاح شد!' : 'متن پیشنهادی هوش مصنوعی درج گردید!',
        { id: toastId }
      );
    } catch {
      toast.error('ارتباط با سرور هوش مصنوعی برقرار نشد.', { id: toastId });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefine}
      disabled={isRefining}
      title={currentText?.trim() ? 'اصلاح نگارش با هوش مصنوعی' : 'پیشنهاد متن جذاب با هوش مصنوعی'}
      className={`inline-flex items-center gap-1.5 ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
        } rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/25 font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0`}
    >
      {isRefining ? (
        <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
      ) : (
        <Sparkles className="w-3 h-3 text-purple-500" />
      )}
      <span>اصلاح با هوش مصنوعی</span>
    </button>
  );
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
 * state normalization, and integrated "اصلاح با هوش مصنوعی" button for each field.
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
  const [isRefining, setIsRefining] = useState(false);

  const normalized = useMemo(() => normalizeMultilingual(value), [value]);
  const activeConfig = TABS.find((t) => t.code === activeTab) || TABS[0];

  const currentValue =
    activeTab === 'da'
      ? normalized.da || normalized.fa || ''
      : normalized[activeTab] || '';

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

  const handleRefineField = async () => {
    const trimmed = (currentValue || '').trim();
    setIsRefining(true);
    const toastId = toast.loading(
      trimmed ? 'در حال اصلاح نگارش با هوش مصنوعی...' : 'در حال تولید متن پیشنهادی با هوش مصنوعی...'
    );

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refine_field',
          currentText: trimmed,
          fieldLabel: label || 'متن',
          lang: activeTab,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.data) {
        toast.error(data?.message || 'خطا در ارتباط با دستیار هوش مصنوعی.', { id: toastId });
        return;
      }

      handleTextChange(data.data);
      toast.success(
        trimmed ? 'متن با هوش مصنوعی بازنویسی و اصلاح شد!' : 'متن پیشنهادی هوش مصنوعی درج گردید!',
        { id: toastId }
      );
    } catch {
      toast.error('ارتباط با سرور هوش مصنوعی برقرار نشد.', { id: toastId });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header Row: Label + AI Refine Button + Language Tabs */}
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

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Refine / Suggestion Button for this field */}
          <button
            type="button"
            onClick={handleRefineField}
            disabled={isRefining}
            title={
              currentValue.trim()
                ? 'اصلاح و بازنویسی با هوش مصنوعی'
                : 'پیشنهاد متن جذاب با هوش مصنوعی'
            }
            className={`inline-flex items-center gap-1.5 ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-[11px]'
              } rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/25 font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0`}
          >
            {isRefining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            )}
            <span className="hidden sm:inline">اصلاح با هوش مصنوعی</span>
            <span className="sm:hidden">اصلاح AI</span>
          </button>

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
                  className={`flex items-center gap-1.5 ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-[11px]'
                    } rounded-lg font-bold transition-all cursor-pointer ${isActive
                      ? 'bg-background text-foreground shadow-sm border border-border/60'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <span>{tab.flag}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${hasValue ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                      }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input / Textarea Control */}
      {children({
        activeTab,
        dir: activeConfig.dir,
        currentValue,
        normalized,
        isTranslating: isRefining,
        handleTextChange,
        handleAutoTranslate: async () => { },
      })}
    </div>
  );
}
