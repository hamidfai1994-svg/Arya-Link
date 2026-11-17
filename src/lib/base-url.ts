/**
 * Universal Base URL resolver with absolute priority for process.env.NEXT_PUBLIC_BASE_URL.
 * Solves the issue where default Vercel domains (*.vercel.app) leak into user copy links, QR codes, and mini-apps.
 *
 * Priority order:
 * 1. process.env.NEXT_PUBLIC_BASE_URL (Absolute Priority)
 * 2. process.env.NEXT_PUBLIC_SITE_URL
 * 3. process.env.NEXT_PUBLIC_APP_URL
 * 4. process.env.NEXTAUTH_URL (if not localhost)
 * 5. In-browser window.location.origin (only if not .vercel.app)
 * 6. Vercel fallback (https://${process.env.VERCEL_URL})
 * 7. Default production fallback ('https://aryal.ink')
 */
export function getBaseUrl(): string {
  // 1. Absolute Priority: NEXT_PUBLIC_BASE_URL
  const nextPublicBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (nextPublicBase) {
    return nextPublicBase.replace(/\/+$/, '');
  }

  // 2. Secondary explicit env vars
  const nextPublicSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (nextPublicSite) {
    return nextPublicSite.replace(/\/+$/, '');
  }

  const nextPublicApp = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (nextPublicApp) {
    return nextPublicApp.replace(/\/+$/, '');
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  if (
    nextAuthUrl &&
    !nextAuthUrl.includes('localhost') &&
    !nextAuthUrl.includes('127.0.0.1')
  ) {
    return nextAuthUrl.replace(/\/+$/, '');
  }

  // 3. Client-side browser origin (ignore .vercel.app so production domain stays clean)
  if (typeof window !== 'undefined' && window.location?.origin) {
    if (!window.location.origin.includes('.vercel.app')) {
      return window.location.origin.replace(/\/+$/, '');
    }
  }

  // 4. Server-side Vercel fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '');
  }

  // 5. Default fallback
  return 'https://aryal.ink';
}

/**
 * Returns clean hostname / domain without protocol or path (e.g. 'aryal.ink')
 */
export function getBaseDomain(): string {
  try {
    const raw = getBaseUrl();
    const url = new URL(raw);
    return url.host || 'aryal.ink';
  } catch {
    return 'aryal.ink';
  }
}
