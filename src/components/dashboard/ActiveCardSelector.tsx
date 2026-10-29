'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActiveCard } from '@/context/ActiveCardContext';
import { useEditorStore } from '@/store/editor-store';
import {
  CreditCard,
  ChevronDown,
  Check,
  Plus,
  ExternalLink,
  Layers,
  Sparkles,
  Building2,
  User as UserIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActiveCardSelectorProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function ActiveCardSelector({ className, variant = 'full' }: ActiveCardSelectorProps) {
  const router = useRouter();
  const { activeCard, activeCardId, cardsList, selectCard, isLoadingCards } = useActiveCard();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardChange = async (cardId: string) => {
    setIsOpen(false);
    if (cardId === activeCardId) return;

    try {
      await selectCard(cardId);
      toast.success('کارت فعال با موفقیت تغییر یافت.');
    } catch (err) {
      toast.error('خطا در تغییر کارت فعال.');
    }
  };

  if (!activeCard && cardsList.length === 0) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Link href="/dashboard/editor">
          <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>ساخت اولین کارت</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('relative select-none', className)} ref={dropdownRef} dir="rtl">
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoadingCards}
        className={cn(
          'flex items-center justify-between gap-3 px-3 py-2 rounded-2xl border transition-all text-right',
          'bg-muted/40 hover:bg-muted/70 border-border/80 hover:border-cyan-500/40',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/20',
          variant === 'compact' ? 'w-auto' : 'w-full'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Card Icon / Avatar */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm shadow-cyan-500/20">
            {activeCard?.avatarUrl ? (
              <img src={activeCard.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <CreditCard className="w-4 h-4 text-white" />
            )}
          </div>

          <div className="min-w-0 text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground truncate max-w-[140px]">
                {activeCard?.displayName || 'کارت هوشمند'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold shrink-0">
                فعال
              </span>
            </div>
            <p className="text-[11px] font-inter font-medium text-muted-foreground/80 truncate max-w-[150px] tracking-tight" dir="ltr">
              aryal.ink/{activeCard?.alias || 'card'}
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform shrink-0',
            isOpen && 'rotate-180 text-cyan-500'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-2 z-50 space-y-1 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground block">
              انتخاب کارت فعال برای مدیریت و آمار:
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 py-1 custom-scrollbar">
            {cardsList.map((card) => {
              const isSelected = (activeCardId && card.id === activeCardId) || (!activeCardId && card.id === activeCard?.id);

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardChange(card.id)}
                  className={cn(
                    'p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all',
                    isSelected
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 font-bold'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center font-bold text-xs shrink-0">
                      {card.avatarUrl ? (
                        <img src={card.avatarUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : card.roleType === 'business' ? (
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <UserIcon className="w-3.5 h-3.5 text-cyan-500" />
                      )}
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="text-xs truncate">{card.displayName}</div>
                      <div className="text-[11px] font-inter font-medium text-muted-foreground/80 truncate tracking-tight" dir="ltr">
                        aryal.ink/{card.alias}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {card.roleType === 'business' ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        شرکتی
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        شخصی
                      </span>
                    )}

                    {isSelected && <Check className="w-4 h-4 text-cyan-500 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create New Card Action */}
          <div className="pt-1.5 border-t border-border/60">
            <Link
              href="/dashboard/editor"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 font-bold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ساخت کارت هوشمند جدید</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
