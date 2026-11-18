export type SupportedLanguage = 'da' | 'ps' | 'en';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  da: {
    code: 'da',
    name: 'Dari / Persian',
    nativeName: 'دری',
    flag: '🇦🇫',
    dir: 'rtl',
  },
  ps: {
    code: 'ps',
    name: 'Pashto',
    nativeName: 'پښتو',
    flag: '🇦🇫',
    dir: 'rtl',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
  },
};

export function normalizeLangCode(lang?: string | null): SupportedLanguage {
  const lower = (lang || '').toLowerCase().trim();
  if (lower === 'ps' || lower === 'pashto') return 'ps';
  if (lower === 'en' || lower === 'english') return 'en';
  return 'da';
}
