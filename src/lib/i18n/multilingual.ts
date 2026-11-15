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
 * Safely extracts a plain localized string from any dynamic value:
 * - plain strings (legacy DB records)
 * - numbers / booleans
 * - arrays (first resolvable element)
 * - multilingual objects ({ fa, da, ps, en, ... })
 * Never returns an object or crashes on missing keys.
 */
export function getLocalizedText(
  value: any,
  locale: SupportedLanguage | 'fa' | string = 'da',
  fallback: string = '',
  depth: number = 0
): string {
  if (value === null || value === undefined) return fallback;
  if (depth > 4) return fallback;

  if (typeof value === 'string') {
    return value.trim() ? value : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = getLocalizedText(item, locale, '', depth + 1);
      if (resolved.trim()) return resolved;
    }
    return fallback;
  }

  if (typeof value === 'object') {
    const rawLocale = String(locale || 'da').trim().toLowerCase();
    const targetLang = normalizeLangCode(rawLocale);

    const candidateKeys: string[] = [];
    if (rawLocale === 'fa' || rawLocale === 'da' || rawLocale === 'dari' || targetLang === 'da') {
      candidateKeys.push('fa', 'da', 'ps', 'en');
    } else if (rawLocale === 'ps' || rawLocale === 'pashto' || targetLang === 'ps') {
      candidateKeys.push('ps', 'fa', 'da', 'en');
    } else if (rawLocale === 'en' || targetLang === 'en') {
      candidateKeys.push('en', 'fa', 'da', 'ps');
    } else {
      candidateKeys.push(rawLocale, targetLang, 'fa', 'da', 'ps', 'en');
    }

    for (const key of candidateKeys) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const candidate = value[key];
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate;
        }
        if (typeof candidate === 'number' || typeof candidate === 'boolean') {
          return String(candidate);
        }
        if (candidate && typeof candidate === 'object') {
          const nested = getLocalizedText(candidate, locale, '', depth + 1);
          if (nested.trim()) return nested;
        }
      }
    }

    // Fallback to the first available non-empty string key in the object
    for (const val of Object.values(value)) {
      if (typeof val === 'string' && val.trim()) {
        return val;
      }
      if (typeof val === 'number' || typeof val === 'boolean') {
        return String(val);
      }
      if (val && typeof val === 'object') {
        const nested = getLocalizedText(val, locale, '', depth + 1);
        if (nested.trim()) return nested;
      }
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

  if (typeof input === 'object') {
    const rawPrimary = input.fa ?? input.da ?? defaultDa ?? '';
    const primary = typeof rawPrimary === 'string' ? rawPrimary : getLocalizedText(rawPrimary, 'da', defaultDa);
    return {
      da: primary,
      fa: primary,
      ps: typeof input.ps === 'string' ? input.ps : getLocalizedText(input.ps, 'ps', ''),
      en: typeof input.en === 'string' ? input.en : getLocalizedText(input.en, 'en', ''),
    };
  }

  const strFallback = String(input);
  return { da: strFallback, fa: strFallback, ps: '', en: '' };
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
    const directVal = getLocalizedText(translatedObj, targetLang, '');
    if (directVal.trim()) {
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
    const directVal = getLocalizedText(translatedObj, targetLang, '');
    if (directVal.trim()) {
      return directVal;
    }
  }
  const rawVal = field === 'title' ? link.title : link?.metadata?.description;
  return getLocalizedText(rawVal, targetLang, fallback);
}
