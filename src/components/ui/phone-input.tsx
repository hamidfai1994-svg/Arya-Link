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
  // 1. Afghanistan & Regional Neighbors (Top Priority)
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

  // 2. North & South America
  { code: 'US', name: 'ایالات متحده آمریکا (United States)', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'کانادا (Canada)', dialCode: '+1', flag: '🇨🇦' },
  { code: 'BR', name: 'برزیل (Brazil)', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'مکزیک (Mexico)', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'آرژانتین (Argentina)', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'شیلی (Chile)', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'کلمبیا (Colombia)', dialCode: '+57', flag: '🇨🇴' },

  // 3. Europe
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
  { code: 'IE', name: 'ایرلند (Ireland)', dialCode: '+353', flag: '🇮🇪' },
  { code: 'CZ', name: 'جمهوری چک (Czechia)', dialCode: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'مجارستان (Hungary)', dialCode: '+36', flag: '🇭🇺' },
  { code: 'RO', name: 'رومانی (Romania)', dialCode: '+40', flag: '🇷🇴' },
  { code: 'BG', name: 'بلغارستان (Bulgaria)', dialCode: '+359', flag: '🇧🇬' },
  { code: 'UA', name: 'اوکراین (Ukraine)', dialCode: '+380', flag: '🇺🇦' },
  { code: 'RU', name: 'روسیه (Russia)', dialCode: '+7', flag: '🇷🇺' },
  { code: 'GE', name: 'گرجستان (Georgia)', dialCode: '+995', flag: '🇬🇪' },
  { code: 'AM', name: 'ارمنستان (Armenia)', dialCode: '+374', flag: '🇦🇲' },
  { code: 'CY', name: 'قبرس (Cyprus)', dialCode: '+357', flag: '🇨🇾' },

  // 4. Asia & Oceania
  { code: 'IN', name: 'هندوستان (India)', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'چین (China)', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'ژاپن (Japan)', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'کره جنوبی (South Korea)', dialCode: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'سنگاپور (Singapore)', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'مالزی (Malaysia)', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ID', name: 'اندونزی (Indonesia)', dialCode: '+62', flag: '🇮🇩' },
  { code: 'TH', name: 'تایلند (Thailand)', dialCode: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'ویتنام (Vietnam)', dialCode: '+84', flag: '🇻🇳' },
  { code: 'PH', name: 'فیلیپین (Philippines)', dialCode: '+63', flag: '🇵🇭' },
  { code: 'BD', name: 'بنگلادش (Bangladesh)', dialCode: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'سری‌لانکا (Sri Lanka)', dialCode: '+94', flag: '🇱🇰' },
  { code: 'AU', name: 'استرالیا (Australia)', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'نیوزیلند (New Zealand)', dialCode: '+64', flag: '🇳🇿' },

  // 5. Middle East & Africa
  { code: 'LB', name: 'لبنان (Lebanon)', dialCode: '+961', flag: '🇱🇧' },
  { code: 'JO', name: 'اردن (Jordan)', dialCode: '+962', flag: '🇯🇴' },
  { code: 'SY', name: 'سوریه (Syria)', dialCode: '+963', flag: '🇸🇾' },
  { code: 'YE', name: 'یمن (Yemen)', dialCode: '+967', flag: '🇾🇪' },
  { code: 'EG', name: 'مصر (Egypt)', dialCode: '+20', flag: '🇪🇬' },
  { code: 'MA', name: 'مراکش (Morocco)', dialCode: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'الجزایر (Algeria)', dialCode: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'تونس (Tunisia)', dialCode: '+216', flag: '🇹🇳' },
  { code: 'LY', name: 'لیبی (Libya)', dialCode: '+218', flag: '🇱🇾' },
  { code: 'SD', name: 'سودان (Sudan)', dialCode: '+249', flag: '🇸🇩' },
  { code: 'ZA', name: 'آفریقای جنوبی (South Africa)', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'نیجریه (Nigeria)', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'کنیا (Kenya)', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'غنا (Ghana)', dialCode: '+233', flag: '🇬🇭' },
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
  // Parse dialCode with longest match first (e.g. +992 before +99)
  const initialCountry = React.useMemo(() => {
    if (value) {
      const sortedByDialLen = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
      const matched = sortedByDialLen.find((c) => value.startsWith(c.dialCode));
      if (matched) return matched;
    }
    const def = COUNTRIES.find((c) => c.code === defaultCountry);
    return def || COUNTRIES[0];
  }, [value, defaultCountry]);

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

    const sortedByDialLen = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
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

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearchQuery('');
    const full = phoneNumber ? `${country.dialCode} ${phoneNumber.trim()}`.trim() : country.dialCode;
    onChange?.(full);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow English digits, spaces and hyphens
    let raw = e.target.value.replace(/[^0-9]/g, '');
    // Auto-strip leading 0 (e.g. typing 0799... becomes 799...)
    if (raw.startsWith('0')) {
      raw = raw.replace(/^0+/, '');
    }
    setPhoneNumber(raw);
    const full = raw ? `${selectedCountry.dialCode} ${raw}`.trim() : '';
    onChange?.(full);
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
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
            className="h-11 px-3 rounded-none border-r border-border hover:bg-muted text-foreground flex items-center gap-1.5 shrink-0 focus-visible:ring-0 active:scale-100 font-sans"
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
          className="w-72 p-2 rounded-2xl border border-border shadow-2xl max-h-80 overflow-y-auto z-50 bg-popover text-popover-foreground"
        >
          {/* Search Box */}
          <div className="relative mb-2 px-1">
            <Input
              type="text"
              placeholder="جستجوی نام کشور یا پیش‌شماره..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs rounded-xl pr-8 pl-2 bg-muted/50 text-right font-sans"
              dir="rtl"
              autoFocus
            />
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Countries List */}
          <div className="space-y-0.5">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground font-sans">
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
