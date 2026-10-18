import { SupportedLanguage } from './types';

export interface MultilingualText {
  da: string;
  ps: string;
  en: string;
}

/**
 * Safely extracts localized string from either a multilingual object or a legacy string.
 */
export function getLocalizedText(
  value: string | MultilingualText | Partial<MultilingualText> | undefined | null,
  lang: SupportedLanguage = 'da',
  fallback: string = ''
): string {
  if (!value) return fallback;

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    // 1. Direct match for requested language
    if (value[lang] && typeof value[lang] === 'string' && value[lang]!.trim()) {
      return value[lang]!;
    }
    // 2. Fallbacks: da -> en -> ps
    if (value.da && value.da.trim()) return value.da;
    if (value.en && value.en.trim()) return value.en;
    if (value.ps && value.ps.trim()) return value.ps;
  }

  return fallback;
}

/**
 * Normalizes input into full MultilingualText object.
 */
export function normalizeMultilingual(
  input: string | Partial<MultilingualText> | undefined | null,
  defaultDa: string = ''
): MultilingualText {
  if (!input) {
    return { da: defaultDa, ps: '', en: '' };
  }

  if (typeof input === 'string') {
    return {
      da: input,
      ps: '',
      en: '',
    };
  }

  return {
    da: input.da || defaultDa || '',
    ps: input.ps || '',
    en: input.en || '',
  };
}
