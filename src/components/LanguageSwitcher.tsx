'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LANGUAGES, SupportedLanguage } from '@/lib/i18n/types';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, currentMeta } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 px-2.5 rounded-xl border border-border/60 hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors ${className || ''}`}
          aria-label="تغییر زبان / Change Language"
        >
          <Globe className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-bold">{currentMeta.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 p-1 rounded-2xl border border-border shadow-xl">
        {(Object.keys(LANGUAGES) as SupportedLanguage[]).map((code) => {
          const item = LANGUAGES[code];
          const isSelected = language === code;

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              <span>{item.nativeName}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-500" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
