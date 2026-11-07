/**
 * Comprehensive standard country dialing codes and metadata.
 * Strictly formatted with English digits and ISO-3166 codes.
 */

export interface CountryItem {
  code: string;        // ISO 3166-1 alpha-2 (e.g. AF, IR, US)
  name: string;        // Localized name (Persian & English)
  nameEn: string;      // English name
  nameFa: string;      // Persian / Dari name
  dialCode: string;    // International dialing code with leading '+' (e.g. +93)
  flag: string;        // Unicode flag emoji
}

export const ALL_COUNTRIES: CountryItem[] = [
  // 1. Afghanistan & Regional Neighbors (Top Priority)
  { code: 'AF', nameFa: 'افغانستان', nameEn: 'Afghanistan', name: 'افغانستان (Afghanistan)', dialCode: '+93', flag: '🇦🇫' },
  { code: 'IR', nameFa: 'ایران', nameEn: 'Iran', name: 'ایران (Iran)', dialCode: '+98', flag: '🇮🇷' },
  { code: 'TJ', nameFa: 'تاجیکستان', nameEn: 'Tajikistan', name: 'تاجیکستان (Tajikistan)', dialCode: '+992', flag: '🇹🇯' },
  { code: 'UZ', nameFa: 'ازبکستان', nameEn: 'Uzbekistan', name: 'ازبکستان (Uzbekistan)', dialCode: '+998', flag: '🇺🇿' },
  { code: 'TM', nameFa: 'ترکمنستان', nameEn: 'Turkmenistan', name: 'ترکمنستان (Turkmenistan)', dialCode: '+993', flag: '🇹🇲' },
  { code: 'PK', nameFa: 'پاکستان', nameEn: 'Pakistan', name: 'پاکستان (Pakistan)', dialCode: '+92', flag: '🇵🇰' },
  { code: 'TR', nameFa: 'ترکیه', nameEn: 'Turkey', name: 'ترکیه (Turkey)', dialCode: '+90', flag: '🇹🇷' },
  { code: 'AE', nameFa: 'امارات متحده عربی', nameEn: 'United Arab Emirates', name: 'امارات متحده عربی (UAE)', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', nameFa: 'عربستان سعودی', nameEn: 'Saudi Arabia', name: 'عربستان سعودی (Saudi Arabia)', dialCode: '+966', flag: '🇸🇦' },
  { code: 'QA', nameFa: 'قطر', nameEn: 'Qatar', name: 'قطر (Qatar)', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', nameFa: 'کویت', nameEn: 'Kuwait', name: 'کویت (Kuwait)', dialCode: '+965', flag: '🇰🇼' },
  { code: 'OM', nameFa: 'عمان', nameEn: 'Oman', name: 'عمان (Oman)', dialCode: '+968', flag: '🇴🇲' },
  { code: 'BH', nameFa: 'بحرین', nameEn: 'Bahrain', name: 'بحرین (Bahrain)', dialCode: '+973', flag: '🇧🇭' },
  { code: 'IQ', nameFa: 'عراق', nameEn: 'Iraq', name: 'عراق (Iraq)', dialCode: '+964', flag: '🇮🇶' },
  { code: 'AZ', nameFa: 'آذربایجان', nameEn: 'Azerbaijan', name: 'آذربایجان (Azerbaijan)', dialCode: '+994', flag: '🇦🇿' },
  { code: 'KZ', nameFa: 'قزاقستان', nameEn: 'Kazakhstan', name: 'قزاقستان (Kazakhstan)', dialCode: '+7', flag: '🇰🇿' },
  { code: 'KG', nameFa: 'قرقیزستان', nameEn: 'Kyrgyzstan', name: 'قرقیزستان (Kyrgyzstan)', dialCode: '+996', flag: '🇰🇬' },
  { code: 'RU', nameFa: 'روسیه', nameEn: 'Russia', name: 'روسیه (Russia)', dialCode: '+7', flag: '🇷🇺' },

  // 2. North & South America
  { code: 'US', nameFa: 'ایالات متحده آمریکا', nameEn: 'United States', name: 'ایالات متحده آمریکا (United States)', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', nameFa: 'کانادا', nameEn: 'Canada', name: 'کانادا (Canada)', dialCode: '+1', flag: '🇨🇦' },
  { code: 'MX', nameFa: 'مکزیک', nameEn: 'Mexico', name: 'مکزیک (Mexico)', dialCode: '+52', flag: '🇲🇽' },
  { code: 'BR', nameFa: 'برزیل', nameEn: 'Brazil', name: 'برزیل (Brazil)', dialCode: '+55', flag: '🇧🇷' },
  { code: 'AR', nameFa: 'آرژانتین', nameEn: 'Argentina', name: 'آرژانتین (Argentina)', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', nameFa: 'شیلی', nameEn: 'Chile', name: 'شیلی (Chile)', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', nameFa: 'کلمبیا', nameEn: 'Colombia', name: 'کلمبیا (Colombia)', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', nameFa: 'پرو', nameEn: 'Peru', name: 'پرو (Peru)', dialCode: '+51', flag: '🇵🇪' },
  { code: 'VE', nameFa: 'ونزوئلا', nameEn: 'Venezuela', name: 'ونزوئلا (Venezuela)', dialCode: '+58', flag: '🇻🇪' },

  // 3. Europe
  { code: 'GB', nameFa: 'بریتانیا (انگلستان)', nameEn: 'United Kingdom', name: 'بریتانیا (United Kingdom)', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', nameFa: 'آلمان', nameEn: 'Germany', name: 'آلمان (Germany)', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', nameFa: 'فرانسه', nameEn: 'France', name: 'فرانسه (France)', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', nameFa: 'ایتالیا', nameEn: 'Italy', name: 'ایتالیا (Italy)', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', nameFa: 'اسپانیا', nameEn: 'Spain', name: 'اسپانیا (Spain)', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', nameFa: 'هلند', nameEn: 'Netherlands', name: 'هلند (Netherlands)', dialCode: '+31', flag: '🇳🇱' },
  { code: 'SE', nameFa: 'سوئد', nameEn: 'Sweden', name: 'سوئد (Sweden)', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', nameFa: 'نروژ', nameEn: 'Norway', name: 'نروژ (Norway)', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', nameFa: 'دانمارک', nameEn: 'Denmark', name: 'دانمارک (Denmark)', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', nameFa: 'فنلاند', nameEn: 'Finland', name: 'فنلاند (Finland)', dialCode: '+358', flag: '🇫🇮' },
  { code: 'CH', nameFa: 'سوئیس', nameEn: 'Switzerland', name: 'سوئیس (Switzerland)', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', nameFa: 'اتریش', nameEn: 'Austria', name: 'اتریش (Austria)', dialCode: '+43', flag: '🇦🇹' },
  { code: 'BE', nameFa: 'بلژیک', nameEn: 'Belgium', name: 'بلژیک (Belgium)', dialCode: '+32', flag: '🇧🇪' },
  { code: 'PT', nameFa: 'پرتغال', nameEn: 'Portugal', name: 'پرتغال (Portugal)', dialCode: '+351', flag: '🇵🇹' },
  { code: 'GR', nameFa: 'یونان', nameEn: 'Greece', name: 'یونان (Greece)', dialCode: '+30', flag: '🇬🇷' },
  { code: 'PL', nameFa: 'لهستان', nameEn: 'Poland', name: 'لهستان (Poland)', dialCode: '+48', flag: '🇵🇱' },
  { code: 'IE', nameFa: 'ایرلند', nameEn: 'Ireland', name: 'ایرلند (Ireland)', dialCode: '+353', flag: '🇮🇪' },
  { code: 'CZ', nameFa: 'جمهوری چک', nameEn: 'Czech Republic', name: 'جمهوری چک (Czechia)', dialCode: '+420', flag: '🇨🇿' },
  { code: 'HU', nameFa: 'مجارستان', nameEn: 'Hungary', name: 'مجارستان (Hungary)', dialCode: '+36', flag: '🇭🇺' },
  { code: 'RO', nameFa: 'رومانی', nameEn: 'Romania', name: 'رومانی (Romania)', dialCode: '+40', flag: '🇷🇴' },
  { code: 'BG', nameFa: 'بلغارستان', nameEn: 'Bulgaria', name: 'بلغارستان (Bulgaria)', dialCode: '+359', flag: '🇧🇬' },
  { code: 'UA', nameFa: 'اوکراین', nameEn: 'Ukraine', name: 'اوکراین (Ukraine)', dialCode: '+380', flag: '🇺🇦' },
  { code: 'GE', nameFa: 'گرجستان', nameEn: 'Georgia', name: 'گرجستان (Georgia)', dialCode: '+995', flag: '🇬🇪' },
  { code: 'AM', nameFa: 'ارمنستان', nameEn: 'Armenia', name: 'ارمنستان (Armenia)', dialCode: '+374', flag: '🇦🇲' },
  { code: 'CY', nameFa: 'قبرس', nameEn: 'Cyprus', name: 'قبرس (Cyprus)', dialCode: '+357', flag: '🇨🇾' },

  // 4. Asia & Oceania
  { code: 'IN', nameFa: 'هندوستان', nameEn: 'India', name: 'هندوستان (India)', dialCode: '+91', flag: '🇮🇳' },
  { code: 'CN', nameFa: 'چین', nameEn: 'China', name: 'چین (China)', dialCode: '+86', flag: '🇨🇳' },
  { code: 'JP', nameFa: 'ژاپن', nameEn: 'Japan', name: 'ژاپن (Japan)', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', nameFa: 'کره جنوبی', nameEn: 'South Korea', name: 'کره جنوبی (South Korea)', dialCode: '+82', flag: '🇰🇷' },
  { code: 'SG', nameFa: 'سنگاپور', nameEn: 'Singapore', name: 'سنگاپور (Singapore)', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', nameFa: 'مالزی', nameEn: 'Malaysia', name: 'مالزی (Malaysia)', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ID', nameFa: 'اندونزی', nameEn: 'Indonesia', name: 'اندونزی (Indonesia)', dialCode: '+62', flag: '🇮🇩' },
  { code: 'TH', nameFa: 'تایلند', nameEn: 'Thailand', name: 'تایلند (Thailand)', dialCode: '+66', flag: '🇹🇭' },
  { code: 'VN', nameFa: 'ویتنام', nameEn: 'Vietnam', name: 'ویتنام (Vietnam)', dialCode: '+84', flag: '🇻🇳' },
  { code: 'PH', nameFa: 'فیلیپین', nameEn: 'Philippines', name: 'فیلیپین (Philippines)', dialCode: '+63', flag: '🇵🇭' },
  { code: 'BD', nameFa: 'بنگلادش', nameEn: 'Bangladesh', name: 'بنگلادش (Bangladesh)', dialCode: '+880', flag: '🇧🇩' },
  { code: 'LK', nameFa: 'سری‌لانکا', nameEn: 'Sri Lanka', name: 'سری‌لانکا (Sri Lanka)', dialCode: '+94', flag: '🇱🇰' },
  { code: 'AU', nameFa: 'استرالیا', nameEn: 'Australia', name: 'استرالیا (Australia)', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', nameFa: 'نیوزیلند', nameEn: 'New Zealand', name: 'نیوزیلند (New Zealand)', dialCode: '+64', flag: '🇳🇿' },

  // 5. Middle East & Africa
  { code: 'LB', nameFa: 'لبنان', nameEn: 'Lebanon', name: 'لبنان (Lebanon)', dialCode: '+961', flag: '🇱🇧' },
  { code: 'JO', nameFa: 'اردن', nameEn: 'Jordan', name: 'اردن (Jordan)', dialCode: '+962', flag: '🇯🇴' },
  { code: 'SY', nameFa: 'سوریه', nameEn: 'Syria', name: 'سوریه (Syria)', dialCode: '+963', flag: '🇸🇾' },
  { code: 'YE', nameFa: 'یمن', nameEn: 'Yemen', name: 'یمن (Yemen)', dialCode: '+967', flag: '🇾🇪' },
  { code: 'EG', nameFa: 'مصر', nameEn: 'Egypt', name: 'مصر (Egypt)', dialCode: '+20', flag: '🇪🇬' },
  { code: 'MA', nameFa: 'مراکش', nameEn: 'Morocco', name: 'مراکش (Morocco)', dialCode: '+212', flag: '🇲🇦' },
  { code: 'DZ', nameFa: 'الجزایر', nameEn: 'Algeria', name: 'الجزایر (Algeria)', dialCode: '+213', flag: '🇩🇿' },
  { code: 'TN', nameFa: 'تونس', nameEn: 'Tunisia', name: 'تونس (Tunisia)', dialCode: '+216', flag: '🇹🇳' },
  { code: 'LY', nameFa: 'لیبی', nameEn: 'Libya', name: 'لیبی (Libya)', dialCode: '+218', flag: '🇱🇾' },
  { code: 'SD', nameFa: 'سودان', nameEn: 'Sudan', name: 'سودان (Sudan)', dialCode: '+249', flag: '🇸🇩' },
  { code: 'ZA', nameFa: 'آفریقای جنوبی', nameEn: 'South Africa', name: 'آفریقای جنوبی (South Africa)', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', nameFa: 'نیجریه', nameEn: 'Nigeria', name: 'نیجریه (Nigeria)', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', nameFa: 'کنیا', nameEn: 'Kenya', name: 'کنیا (Kenya)', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', nameFa: 'غنا', nameEn: 'Ghana', name: 'غنا (Ghana)', dialCode: '+233', flag: '🇬🇭' },
];

/**
 * Combines a dialing code and raw input number into standard E.164 format.
 * Strips all non-digit characters and leading zeros.
 * Example: dialCode "+93", rawNumber "0799 123 456" -> "+93799123456"
 */
export function formatToE164(dialCode: string, rawNumber: string): string {
  if (!rawNumber) return '';
  const cleanDial = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  let cleanNum = rawNumber.replace(/[^0-9]/g, '');
  // Remove leading zeros from subscriber number
  cleanNum = cleanNum.replace(/^0+/, '');
  if (!cleanNum) return '';
  return `${cleanDial}${cleanNum}`;
}

/**
 * Parses an E.164 or international phone string into { country, subscriberNumber }.
 */
export function parsePhoneNumber(phone: string): { country: CountryItem; subscriberNumber: string } {
  const defaultCountry = ALL_COUNTRIES[0]; // Afghanistan (+93)
  if (!phone) {
    return { country: defaultCountry, subscriberNumber: '' };
  }

  const clean = phone.trim();
  const sorted = [...ALL_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const matched = sorted.find((c) => clean.startsWith(c.dialCode));

  if (matched) {
    let sub = clean.slice(matched.dialCode.length).trim();
    sub = sub.replace(/^0+/, '');
    return { country: matched, subscriberNumber: sub };
  }

  return { country: defaultCountry, subscriberNumber: clean.replace(/^0+/, '') };
}

export default ALL_COUNTRIES;

