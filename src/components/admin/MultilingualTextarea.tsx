'use client';

import React from 'react';
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
 * Pashto (`ps`), and English (`en`) with per-field AI Refine/Suggest button.
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
        handleTextChange,
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
            className={`w-full rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors p-3 resize-y ${inputClassName}`}
          />
        </div>
      )}
    </MultilingualFieldShell>
  );
}

export default MultilingualTextarea;
