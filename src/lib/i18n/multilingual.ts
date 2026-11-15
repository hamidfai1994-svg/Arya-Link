import { SupportedLanguage, normalizeLangCode } from './types';

export interface MultilingualText {
  da: string;
  fa?: string;
  ps: string;
  en: string;
}

export type LocalizedFieldValue =
  | string
  | MultilingualText
  | Partial<MultilingualText>
  | undefined
  | null;

/**
 * Safely extracts localized string from either a multilingual object ({ fa, da, ps, en })
 * or a legacy plain string (smart fallback so old DB records never crash).
 */
export function getLocalizedText(
  value: LocalizedFieldValue,
  lang: SupportedLanguage | 'fa' | string = 'da',
  fallback: string = ''
): string {
  if (!value) return fallback;

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    const targetLang = normalizeLangCode(lang);

    if (targetLang === 'da') {
      if (typeof value.fa === 'string' && value.fa.trim()) return value.fa;
      if (typeof value.da === 'string' && value.da.trim()) return value.da;
      if (typeof value.ps === 'string' && value.ps.trim()) return value.ps;
      if (typeof value.en === 'string' && value.en.trim()) return value.en;
    } else if (targetLang === 'ps') {
      if (typeof value.ps === 'string' && value.ps.trim()) return value.ps;
      if (typeof value.fa === 'string' && value.fa.trim()) return value.fa;
      if (typeof value.da === 'string' && value.da.trim()) return value.da;
      if (typeof value.en === 'string' && value.en.trim()) return value.en;
    } else if (targetLang === 'en') {
      if (typeof value.en === 'string' && value.en.trim()) return value.en;
      if (typeof value.fa === 'string' && value.fa.trim()) return value.fa;
      if (typeof value.da === 'string' && value.da.trim()) return value.da;
      if (typeof value.ps === 'string' && value.ps.trim()) return value.ps;
    }
  }

  return fallback;
}

/**
 * Normalizes input (string or object) into a complete MultilingualText object with both da and fa synced.
 */
export function normalizeMultilingual(
  input: LocalizedFieldValue,
  defaultDa: string = ''
): MultilingualText {
  if (!input) {
    return { da: defaultDa, fa: defaultDa, ps: '', en: '' };
  }

  if (typeof input === 'string') {
    return {
      da: input,
      fa: input,
      ps: '',
      en: '',
    };
  }

  const primary = input.fa ?? input.da ?? defaultDa ?? '';
  return {
    da: primary,
    fa: primary,
    ps: input.ps || '',
    en: input.en || '',
  };
}

/**
 * Reads localized text for Profile fields ('displayName' | 'headline' | 'bio')
 * checking `profile.translations[field]` first, then falling back to `profile[field]`.
 */
export function getProfileLocalizedText(
  profile: any,
  field: 'displayName' | 'headline' | 'bio',
  lang: SupportedLanguage | 'fa' | string = 'da',
  fallback: string = ''
): string {
  if (!profile) return fallback;
  const targetLang = normalizeLangCode(lang);
  const translatedObj = profile?.translations?.[field];
  if (translatedObj && typeof translatedObj === 'object') {
    const directVal =
      targetLang === 'da'
        ? translatedObj.fa || translatedObj.da
        : translatedObj[targetLang];
    if (typeof directVal === 'string' && directVal.trim()) {
      return directVal;
    }
  }
  return getLocalizedText(profile[field], targetLang, fallback);
}

/**
 * Reads localized text for a ProfileLinkItem ('title' | 'description'),
 * checking `link.metadata.translations[field]` first, then falling back to `link.title` or `link.metadata.description`.
 */
export function getLinkLocalizedText(
  link: any,
  field: 'title' | 'description',
  lang: SupportedLanguage | 'fa' | string = 'da',
  fallback: string = ''
): string {
  if (!link) return fallback;
  const targetLang = normalizeLangCode(lang);
  const translatedObj = link?.metadata?.translations?.[field];
  if (translatedObj && typeof translatedObj === 'object') {
    const directVal =
      targetLang === 'da'
        ? translatedObj.fa || translatedObj.da
        : translatedObj[targetLang];
    if (typeof directVal === 'string' && directVal.trim()) {
      return directVal;
    }
  }
  const rawVal = field === 'title' ? link.title : link?.metadata?.description;
  return getLocalizedText(rawVal, targetLang, fallback);
}
