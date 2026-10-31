'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Globe, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface CountryInfo {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'AF', name: 'افغانستان (Afghanistan)', dialCode: '+93', flag: '🇦🇫' },
  { code: 'IR', name: 'ایران (Iran)', dialCode: '+98', flag: '🇮🇷' },
  { code: 'TJ', name: 'تاجیکستان (Tajikistan)', dialCode: '+992', flag: '🇹🇯' },
  { code: 'UZ', name: 'ازبکستان (Uzbekistan)', dialCode: '+998', flag: '🇺🇿' },
  { code: 'TM', name: 'ترکمنستان (Turkmenistan)', dialCode: '+993', flag: '🇹🇲' },
  { code: 'PK', name: 'پاکستان (Pakistan)', dialCode: '+92', flag: '🇵🇰' },
  { code: 'TR', name: 'ترکیه (Turkey)', dialCode: '+90', flag: '🇹🇷' },
  { code: 'AE', name: 'امارات متحده عربی (UAE)', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'عربستان سعودی (Saudi Arabia)', dialCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'قطر (Qatar)', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'کویت (Kuwait)', dialCode: '+965', flag: '🇰🇼' },
  { code: 'OM', name: 'عمان (Oman)', dialCode: '+968', flag: '🇴🇲' },
  { code: 'BH', name: 'بحرین (Bahrain)', dialCode: '+973', flag: '🇧🇭' },
  { code: 'IQ', name: 'عراق (Iraq)', dialCode: '+964', flag: '🇮🇶' },
  { code: 'AZ', name: 'آذربایجان (Azerbaijan)', dialCode: '+994', flag: '🇦🇿' },
  { code: 'KZ', name: 'قزاقستان (Kazakhstan)', dialCode: '+7', flag: '🇰🇿' },
  { code: 'KG', name: 'قرقیزستان (Kyrgyzstan)', dialCode: '+996', flag: '🇰🇬' },
  { code: 'US', name: 'ایالات متحده آمریکا (United States)', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'کانادا (Canada)', dialCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'انگلستان (United Kingdom)', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'آلمان (Germany)', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'فرانسه (France)', dialCode: '+33', flag: '🇫🇷' },
  { code: 'NL', name: 'هلند (Netherlands)', dialCode: '+31', flag: '🇳🇱' },
  { code: 'SE', name: 'سوئد (Sweden)', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'نروژ (Norway)', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'دانمارک (Denmark)', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'فنلاند (Finland)', dialCode: '+358', flag: '🇫🇮' },
  { code: 'CH', name: 'سوئیس (Switzerland)', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'اتریش (Austria)', dialCode: '+43', flag: '🇦🇹' },
  { code: 'BE', name: 'بلژیک (Belgium)', dialCode: '+32', flag: '🇧🇪' },
  { code: 'IT', name: 'ایتالیا (Italy)', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'اسپانیا (Spain)', dialCode: '+34', flag: '🇪🇸' },
  { code: 'PT', name: 'پرتغال (Portugal)', dialCode: '+351', flag: '🇵🇹' },
  { code: 'GR', name: 'یونان (Greece)', dialCode: '+30', flag: '🇬🇷' },
  { code: 'PL', name: 'لهستان (Poland)', dialCode: '+48', flag: '🇵🇱' },
  { code: 'AU', name: 'استرالیا (Australia)', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'نیوزیلند (New Zealand)', dialCode: '+64', flag: '🇳🇿' },
  { code: 'IN', name: 'هندوستان (India)', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'چین (China)', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'ژاپن (Japan)', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'کره جنوبی (South Korea)', dialCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'سنگاپور (Singapore)', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'مالزی (Malaysia)', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ID', name: 'اندونزی (Indonesia)', dialCode: '+62', flag: '🇮🇩' },
  { code: 'RU', name: 'روسیه (Russia)', dialCode: '+7', flag: '🇷🇺' },
  { code: 'BR', name: 'برزیل (Brazil)', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'مکزیک (Mexico)', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'آرژانتین (Argentina)', dialCode: '+54', flag: '🇦🇷' },
  { code: 'EG', name: 'مصر (Egypt)', dialCode: '+20', flag: '🇪🇬' },
  { code: 'ZA', name: 'آفریقای جنوبی (South Africa)', dialCode: '+27', flag: '🇿🇦' },
];

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
  // Parse existing dialCode or fallback to default AF (+93)
  const initialCountry = React.useMemo(() => {
    if (value) {
      const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (matched) return matched;
    }
    const def = COUNTRIES.find((c) => c.code === defaultCountry);
    return def || COUNTRIES[0];
  }, [defaultCountry]);

  const [selectedCountry, setSelectedCountry] = React.useState<CountryInfo>(initialCountry);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Sync internal state when external value changes
  React.useEffect(() => {
    if (!value) {
      setPhoneNumber('');
      return;
    }

    const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
    if (matched) {
      setSelectedCountry(matched);
      const rawNum = value.slice(matched.dialCode.length).trim();
      setPhoneNumber(rawNum);
    } else {
      setPhoneNumber(value.replace(/^[+0-9]+/, (m) => (m === value ? m : '')));
    }
  }, [value]);

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearchQuery('');
    const full = country.dialCode + (phoneNumber ? ` ${phoneNumber.trim()}` : '');
    onChange?.(full.trim());
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9\s-]/g, '');
    setPhoneNumber(raw);
    const full = `${selectedCountry.dialCode} ${raw}`.trim();
    onChange?.(full);
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn('relative flex items-center rounded-2xl border border-border bg-background focus-within:ring-2 focus-within:ring-cyan-500 overflow-hidden transition-all', className)} dir="ltr">
      {/* Country Select Dropdown Trigger */}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-11 px-3 rounded-none border-r border-border hover:bg-muted text-foreground flex items-center gap-1.5 shrink-0 focus-visible:ring-0 active:scale-100"
            aria-label="انتخاب کشور"
          >
            <span className="text-base select-none">{selectedCountry.flag}</span>
            <span className="text-xs font-bold font-sans text-foreground">{selectedCountry.dialCode}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        {/* Countries Dropdown Content with Search */}
        <DropdownMenuContent align="start" className="w-72 p-2 rounded-2xl border border-border shadow-2xl max-h-80 overflow-y-auto">
          {/* Search Box */}
          <div className="relative mb-2 px-1">
            <Input
              type="text"
              placeholder="جستجوی کشور یا پیش‌شماره..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs rounded-xl pr-8 pl-2 bg-muted/50 text-right"
              dir="rtl"
              autoFocus
            />
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Countries List */}
          <div className="space-y-0.5">
            {filteredCountries.map((country) => {
              const isSelected = selectedCountry.code === country.code;
              return (
                <DropdownMenuItem
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{country.flag}</span>
                    <span className="font-semibold text-foreground">{country.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-sans text-xs font-bold text-muted-foreground">{country.dialCode}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Actual Phone Number Input */}
      <Input
        id={id}
        type="tel"
        dir="ltr"
        disabled={disabled}
        required={required}
        value={phoneNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="h-11 border-0 bg-transparent rounded-none px-3 font-sans text-sm text-foreground focus-visible:ring-0 placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
export default PhoneInput;
