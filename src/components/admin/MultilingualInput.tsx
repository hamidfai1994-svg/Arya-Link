'use client';

import React from 'react';
import {
  BaseMultilingualFieldProps,
  MultilingualFieldShell,
  resolvePlaceholder,
} from './MultilingualFieldShell';

export interface MultilingualInputProps extends BaseMultilingualFieldProps {}

/**
 * Single-line trilingual text input supporting Dari/Persian (`da`/`fa`),
 * Pashto (`ps`), and English (`en`) with per-field AI Refine/Suggest button.
 */
export function MultilingualInput({
  label,
  hideLabel,
  labelAction,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  inputClassName = '',
  compact = false,
  onFieldBlur,
}: MultilingualInputProps) {
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
        <div className="relative flex items-center">
          <input
            type="text"
            dir={dir}
            value={currentValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={(e) => onFieldBlur?.(e.target.value, activeTab)}
            placeholder={resolvePlaceholder(placeholder, activeTab)}
            required={required && activeTab === 'da'}
            className={`w-full rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-colors ${
              compact ? 'h-9 px-3 text-xs' : 'h-10 px-3.5'
            } ${inputClassName}`}
          />
        </div>
      )}
    </MultilingualFieldShell>
  );
}

export default MultilingualInput;
