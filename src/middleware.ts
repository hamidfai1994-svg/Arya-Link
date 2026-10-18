import { withAuth } from 'next-auth/middleware';
import { NextResponse, NextRequest } from 'next/server';

// Southern & Eastern Afghan provinces/cities mapped to Pashto ('ps')
const PASHTO_REGIONS = [
  'kandahar', 'qandahar',
  'helmand', 'hilmand', 'lashkargah', 'lashkar gah',
  'nangarhar', 'jalalabad',
  'paktia', 'paktya', 'gardez', 'gardeiz',
  'paktika', 'sharana',
  'khost', 'matun',
  'zabul', 'qalat',
  'uruzgan', 'oruzgan', 'tarinkot',
  'kunar', 'konar', 'asadabad',
  'laghman', 'mehtarlam',
  'nimroz', 'zaranj',
  'farah',
  'ghazni',
  'logar', 'pul-e-alam',
  'wardak', 'maidan shar',
];

function detectGeoLanguage(req: NextRequest): 'da' | 'ps' | 'en' {
  // 1. Manual user choice saved in cookie takes highest priority
  const cookieLang = req.cookies.get('aryalink_lang')?.value;
  if (cookieLang === 'da' || cookieLang === 'ps' || cookieLang === 'en') {
    return cookieLang;
  }

  // 2. Read Geolocation headers
  const country = (
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-country-code') ||
    ''
  ).toUpperCase().trim();

  const city = (
    req.headers.get('x-vercel-ip-city') ||
    req.headers.get('x-vercel-ip-country-region') ||
    req.headers.get('cf-ipcity') ||
    ''
  ).toLowerCase().trim();

  // 3. Geolocation Rule Evaluation:
  if (country === 'AF') {
    const isPashtoRegion = PASHTO_REGIONS.some((region) => city.includes(region));
    if (isPashtoRegion) {
      return 'ps';
    }
    // Central, Western, Northern provinces (Kabul, Herat, Balkh, Mazar, Kunduz, Badakhshan...) -> Dari
    return 'da';
  }

  // Iran or Tajikistan -> Dari
  if (country === 'IR' || country === 'TJ') {
    return 'da';
  }

  // Rest of the world -> English
  if (country && country !== 'AF' && country !== 'IR' && country !== 'TJ') {
    return 'en';
  }

  // Default fallback for Afghanistan / regional users
  return 'da';
}

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const role = (req.nextauth.token?.role as string)?.toLowerCase();

    // 1. Super Admin / Admin Route Protection
    if (pathname.startsWith('/admin')) {
      const allowedRoles = ['admin', 'superadmin', 'financial_admin', 'content_editor'];
      if (!role || !allowedRoles.includes(role)) {
        const dashboardUrl = new URL('/dashboard?error=unauthorized_admin', req.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // 2. Geolocation Language Detection
    const detectedLang = detectGeoLanguage(req);

    const response = NextResponse.next();
    response.headers.set('x-aryalink-lang', detectedLang);

    // If cookie not present, set cookie to remember geo choice
    if (!req.cookies.get('aryalink_lang')) {
      response.cookies.set('aryalink_lang', detectedLang, {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
      });
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Public routes do not require login
        if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/admin')) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
