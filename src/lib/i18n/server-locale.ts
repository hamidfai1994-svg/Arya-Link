import type { SupportedLanguage } from './types';

/**
 * Normalizes locale/language codes to SupportedLanguage ('da' | 'ps' | 'en').
 * Maps 'fa' / 'fa-AF' / 'fa-IR' / 'da-AF' to 'da'.
 */
export function normalizeServerLanguage(raw?: string | null): SupportedLanguage {
  if (!raw || typeof raw !== 'string') return 'da';
  const cleaned = raw.trim().toLowerCase();
  if (cleaned === 'en' || cleaned.startsWith('en-') || cleaned.startsWith('en_')) {
    return 'en';
  }
  if (cleaned === 'ps' || cleaned.startsWith('ps-') || cleaned.startsWith('ps_')) {
    return 'ps';
  }
  if (
    cleaned === 'da' ||
    cleaned === 'fa' ||
    cleaned.startsWith('fa-') ||
    cleaned.startsWith('fa_') ||
    cleaned.startsWith('da-') ||
    cleaned.startsWith('da_')
  ) {
    return 'da';
  }
  return 'da';
}

function extractCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const eqIndex = part.indexOf('=');
    if (eqIndex === -1) continue;
    const key = part.slice(0, eqIndex).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(eqIndex + 1).trim());
    }
  }
  return null;
}

/**
 * Resolves the active user language on the server from body override, query string,
 * custom header, `aryalink_lang` cookie, or `Accept-Language` header.
 */
export function getRequestLocale(
  req?: Request | null,
  bodyLocale?: string | null
): SupportedLanguage {
  if (bodyLocale) {
    return normalizeServerLanguage(bodyLocale);
  }

  if (!req) return 'da';

  try {
    const url = new URL(req.url);
    const queryLang = url.searchParams.get('locale') || url.searchParams.get('lang');
    if (queryLang) {
      return normalizeServerLanguage(queryLang);
    }
  } catch {
    // Ignore malformed relative URLs
  }

  // NextRequest cookies API if present
  const reqWithCookies = req as Request & {
    cookies?: { get?: (name: string) => { value?: string } | undefined };
  };
  const nextCookieVal = reqWithCookies.cookies?.get?.('aryalink_lang')?.value;
  if (nextCookieVal) {
    return normalizeServerLanguage(nextCookieVal);
  }

  const headerLang = req.headers.get('x-aryalink-lang');
  if (headerLang) {
    return normalizeServerLanguage(headerLang);
  }

  const cookieVal = extractCookieValue(req.headers.get('cookie'), 'aryalink_lang');
  if (cookieVal) {
    return normalizeServerLanguage(cookieVal);
  }

  const acceptLang = req.headers.get('accept-language');
  if (acceptLang) {
    const primary = acceptLang.split(',')[0]?.trim();
    if (primary) {
      const normalized = normalizeServerLanguage(primary);
      if (normalized === 'en' || normalized === 'ps' || normalized === 'da') {
        return normalized;
      }
    }
  }

  return 'da';
}
