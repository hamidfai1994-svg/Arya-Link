'use client';

import React from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import {
  BaseMultilingualFieldProps,
  MultilingualFieldShell,
  resolvePlaceholder,
} from './MultilingualFieldShell';

export interface MultilingualTextareaProps extends BaseMultilingualFieldProps {
  rows?: number;
}

/**
 * Multi-line trilingual textarea supporting Dari/Persian (`da`/`fa`),
 * Pashto (`ps`), and English (`en`) with integrated Magic Wand auto-translation.
 */
export function MultilingualTextarea({
  label,
  hideLabel,
  labelAction,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  className = '',
  inputClassName = '',
  compact = false,
  onFieldBlur,
}: MultilingualTextareaProps) {
  return (
    <MultilingualFieldShell
      label={label}
      hideLabel={hideLabel}
      labelAction={labelAction}
      value={value}
      onChange={onChange}
      required={required}
      className={className}
      compact={compact}
    >
      {({
        activeTab,
        dir,
        currentValue,
        isTranslating,
        handleTextChange,
        handleAutoTranslate,
      }) => (
        <div className="relative">
          <textarea
            dir={dir}
            rows={rows}
            value={currentValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={(e) => onFieldBlur?.(e.target.value, activeTab)}
            placeholder={resolvePlaceholder(placeholder, activeTab)}
            required={required && activeTab === 'da'}
            className={`w-full rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors p-3 resize-y ${
              dir === 'ltr' ? 'pr-10' : 'pl-10'
            } ${inputClassName}`}
          />

          <button
            type="button"
            onClick={() => handleAutoTranslate(activeTab === 'da' ? undefined : activeTab)}
            disabled={isTranslating}
            title={
              activeTab === 'da'
                ? 'ترجمه خودکار متن به پشتو و انگلیسی'
                : activeTab === 'ps'
                ? 'ترجمه خودکار از دری به پشتو'
                : 'ترجمه خودکار از دری به انگلیسی'
            }
            className={`absolute top-2.5 ${
              dir === 'ltr' ? 'right-2.5' : 'left-2.5'
            } p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/10 transition-colors disabled:opacity-50 cursor-pointer`}
          >
            {isTranslating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </MultilingualFieldShell>
  );
}

export default MultilingualTextarea;
