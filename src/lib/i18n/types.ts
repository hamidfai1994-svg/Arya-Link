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
    name: 'Dari',
    nativeName: 'دری',
    flag: '🇦🇫',
    dir: 'rtl',
  },
  ps: {
    code: 'ps',
    name: 'Pashto',
    nativeName: 'پشتو',
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
