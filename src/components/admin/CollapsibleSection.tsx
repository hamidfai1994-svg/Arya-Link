'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CollapsibleSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  badge?: string;
  defaultOpen?: boolean; // Defaults to false per requirements!
  isOpen?: boolean;
  onToggle?: () => void;
  onBatchTranslate?: () => Promise<void> | void;
  isTranslating?: boolean;
  batchTranslateLabel?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Universal Collapsible / Accordion Section for Admin & Dashboard.
 * Default state is strictly CLOSED until the user clicks the header to expand.
 */
export function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  badge,
  defaultOpen = false,
  isOpen: controlledOpen,
  onToggle: controlledOnToggle,
  onBatchTranslate,
  isTranslating = false,
  batchTranslateLabel = 'ترجمه خودکار کامل بخش',
  headerActions,
  children,
  className = '',
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (isControlled) {
      controlledOnToggle?.();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const handleBatchTranslateClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Do not toggle accordion when clicking translate!
    if (onBatchTranslate) {
      await onBatchTranslate();
    }
  };

  return (
    <div
      className={cn(
        'rounded-3xl border border-border bg-card transition-all duration-200 overflow-hidden shadow-sm',
        isOpen ? 'ring-1 ring-cyan-500/30 border-cyan-500/40 shadow-md' : 'hover:border-border/80',
        className
      )}
    >
      {/* Accordion Header */}
      <div
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={cn(
          'w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 text-right transition-colors cursor-pointer select-none',
          isOpen ? 'bg-muted/40 border-b border-border' : 'hover:bg-muted/20'
        )}
      >
        {/* Left/Right Identity: Icon + Titles */}
        <div className="flex items-center gap-3.5 min-w-0">
          {Icon && (
            <div
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors',
                isOpen
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'bg-muted text-cyan-500'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground truncate">{title}</span>
              {badge && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls: Batch Translate Button + Extra Actions + Expand Chevron */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onBatchTranslate && (
            <button
              type="button"
              onClick={handleBatchTranslateClick}
              disabled={isTranslating}
              title="ترجمه هوشمند و یکپارچه تمام فیلدهای این بخش به انگلیسی و پشتو"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-600 dark:text-cyan-300 border border-cyan-500/25 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isTranslating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              )}
              <span className="hidden sm:inline">{batchTranslateLabel}</span>
              <span className="sm:hidden">ترجمه خودکار</span>
            </button>
          )}

          {headerActions && (
            <div onClick={(e) => e.stopPropagation()}>{headerActions}</div>
          )}

          {/* Chevron Indicator */}
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground bg-muted/60 transition-transform duration-200',
              isOpen ? 'rotate-180 text-foreground bg-muted' : ''
            )}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Accordion Collapsible Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
