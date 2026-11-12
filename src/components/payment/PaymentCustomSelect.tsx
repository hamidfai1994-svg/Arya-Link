'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentLogoBadge } from './PaymentLogos';

export interface PaymentSelectOption {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  type?: 'wallet' | 'bank' | 'crypto' | 'hawala' | 'cod' | 'installment' | 'provider';
  logoId?: string;
  customLogoUrl?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  locked?: boolean;
}

interface PaymentCustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: PaymentSelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  onLockedClick?: (option: PaymentSelectOption) => void;
}

export const PaymentCustomSelect: React.FC<PaymentCustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'انتخاب نمایید...',
  className,
  buttonClassName,
  menuClassName,
  disabled = false,
  onLockedClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value) || options[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (option: PaymentSelectOption) => {
    if (option.locked) {
      if (onLockedClick) onLockedClick(option);
      return;
    }
    if (option.disabled) return;
    onChange(option.id);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full text-right', className)} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'w-full h-11 sm:h-12 px-3 sm:px-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-white flex items-center justify-between gap-2.5 transition-all outline-none focus:border-emerald-500 shadow-md cursor-pointer select-none',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'border-emerald-500 ring-2 ring-emerald-500/20',
          buttonClassName
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          {selectedOption ? (
            <>
              {selectedOption.icon ? (
                selectedOption.icon
              ) : (
                <PaymentLogoBadge
                  id={selectedOption.logoId || selectedOption.id}
                  type={selectedOption.type}
                  customLogoUrl={selectedOption.customLogoUrl}
                  size={24}
                  className="shrink-0"
                />
              )}
              <div className="min-w-0 text-right truncate">
                <span className="text-xs sm:text-sm font-bold text-white block truncate">
                  {selectedOption.title}
                </span>
                {selectedOption.subtitle && (
                  <span className="text-[10px] text-slate-400 block truncate leading-tight">
                    {selectedOption.subtitle}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption?.badge && (
            <span
              className={cn(
                'text-[9px] px-2 py-0.5 rounded-full font-medium',
                selectedOption.badgeColor || 'bg-white/10 text-slate-300'
              )}
            >
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180 text-emerald-400')}
          />
        </div>
      </button>

      {/* Dropdown Menu - 100% Solid Background, No Transparency, High Z-Index */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-[calc(100%+6px)] right-0 w-full z-[150] rounded-2xl bg-slate-950 border border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-1.5 max-h-64 overflow-y-auto overflow-x-hidden space-y-1 animate-in fade-in-0 zoom-in-95 duration-150',
            menuClassName
          )}
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            const isLocked = option.locked;

            return (
              <div
                key={option.id}
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all text-right select-none',
                  isLocked
                    ? 'opacity-50 bg-slate-900/60 cursor-not-allowed hover:bg-slate-900/80'
                    : isSelected
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-white font-semibold cursor-pointer'
                    : 'hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                  {option.icon ? (
                    option.icon
                  ) : (
                    <PaymentLogoBadge
                      id={option.logoId || option.id}
                      type={option.type}
                      customLogoUrl={option.customLogoUrl}
                      size={24}
                      className="shrink-0"
                    />
                  )}
                  <div className="min-w-0 text-right truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs sm:text-sm font-bold truncate">{option.title}</span>
                      {isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    {option.subtitle && (
                      <span className="text-[10px] text-slate-400 block truncate leading-tight">
                        {option.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {option.badge && (
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded font-medium',
                        option.badgeColor || 'bg-white/10 text-slate-300'
                      )}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

