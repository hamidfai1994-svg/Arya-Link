'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ALL_COUNTRIES, CountryItem, formatToE164 } from '@/constants/countries';

export type CountryInfo = CountryItem;
export const COUNTRIES = ALL_COUNTRIES;

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: string;
  required?: boolean;
  id?: string;
}

export function PhoneInput({
  value = '',
  onChange,
  placeholder = '799 123 456',
  disabled = false,
  className,
  defaultCountry = 'AF',
  required = false,
  id,
}: PhoneInputProps) {
  // Parse dialCode with longest match first (e.g. +992 before +99)
  const initialCountry = React.useMemo(() => {
    if (value) {
      const sortedByDialLen = [...ALL_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
      const matched = sortedByDialLen.find((c) => value.startsWith(c.dialCode));
      if (matched) return matched;
    }
    const def = ALL_COUNTRIES.find((c) => c.code === defaultCountry);
    return def || ALL_COUNTRIES[0];
  }, [value, defaultCountry]);

  const [selectedCountry, setSelectedCountry] = React.useState<CountryItem>(initialCountry);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Sync internal state when external value changes
  React.useEffect(() => {
    if (!value) {
      setPhoneNumber('');
      return;
    }

    const sortedByDialLen = [...ALL_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    const matched = sortedByDialLen.find((c) => value.startsWith(c.dialCode));
    if (matched) {
      setSelectedCountry(matched);
      let rawNum = value.slice(matched.dialCode.length).trim();
      // Auto-strip leading 0 if present
      rawNum = rawNum.replace(/^0+/, '');
      setPhoneNumber(rawNum);
    } else {
      let raw = value.replace(/^[+0-9]+/, (m) => (m === value ? m : '')).trim();
      raw = raw.replace(/^0+/, '');
      setPhoneNumber(raw);
    }
  }, [value]);

  const handleCountrySelect = (country: CountryItem) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearchQuery('');
    const full = phoneNumber ? `${country.dialCode} ${phoneNumber.trim()}`.trim() : country.dialCode;
    onChange?.(full);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow English digits
    let raw = e.target.value.replace(/[^0-9]/g, '');
    // Auto-strip leading 0 (e.g. typing 0799... becomes 799...)
    if (raw.startsWith('0')) {
      raw = raw.replace(/^0+/, '');
    }
    setPhoneNumber(raw);
    const full = raw ? `${selectedCountry.dialCode} ${raw}`.trim() : '';
    onChange?.(full);
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredCountries = ALL_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameFa.includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
  );

  return (
    <div
      className={cn(
        'relative flex items-center rounded-2xl border border-border bg-background focus-within:ring-2 focus-within:ring-cyan-500 overflow-hidden transition-all',
        className
      )}
      dir="ltr"
    >
      {/* Country Select Dropdown Trigger (Left side in LTR) */}
      <DropdownMenu dir="rtl" open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-11 px-3 rounded-none border-r border-border hover:bg-muted text-foreground flex items-center gap-1.5 shrink-0 focus-visible:ring-0 active:scale-100 font-sans cursor-pointer"
            aria-label="انتخاب کد کشور"
          >
            <span className="text-base select-none">{selectedCountry.flag}</span>
            <span className="text-xs font-bold font-sans text-foreground">{selectedCountry.dialCode}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        {/* Countries Dropdown Content with Search */}
        <DropdownMenuContent
          align="start"
          className="w-80 p-2 rounded-2xl border border-border shadow-2xl max-h-80 overflow-y-auto z-50 bg-popover text-popover-foreground font-sans"
          style={{ fontFamily: 'var(--font-vazirmatn), var(--font-inter), sans-serif' }}
        >
          {/* Search Box */}
          <div className="relative mb-2 px-1">
            <Input
              type="text"
              placeholder="جستجوی نام کشور یا پیش‌شماره (مثلاً +93 یا افغان)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs rounded-xl pr-8 pl-2 bg-muted/50 text-right font-sans"
              dir="rtl"
              style={{ fontFamily: 'var(--font-vazirmatn), var(--font-inter), sans-serif' }}
              autoFocus
            />
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Countries List */}
          <div className="space-y-0.5">
            {filteredCountries.length === 0 ? (
              <div
                className="p-3 text-center text-xs text-muted-foreground font-sans"
                style={{ fontFamily: 'var(--font-vazirmatn), var(--font-inter), sans-serif' }}
              >
                کشوری با این مشخصات یافت نشد
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = selectedCountry.code === country.code;
                return (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer hover:bg-muted font-sans"
                    style={{ fontFamily: 'var(--font-vazirmatn), var(--font-inter), sans-serif' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="font-semibold text-foreground">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" dir="ltr">
                      <span className="font-sans text-xs font-bold text-muted-foreground">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Actual Phone Number Input (Right side, subscriber number without leading 0) */}
      <Input
        id={id}
        type="tel"
        dir="ltr"
        disabled={disabled}
        required={required}
        value={phoneNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="h-11 border-0 bg-transparent rounded-none px-3 font-sans text-sm text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/60 flex-1"
      />
    </div>
  );
}

export default PhoneInput;
