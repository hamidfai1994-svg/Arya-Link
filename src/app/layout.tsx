import type { Metadata } from 'next';
import { Vazirmatn, Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/types';
import { PublicShell } from '@/components/public/PublicShell';
import { BrandingProvider } from '@/lib/branding/BrandingContext';
import { getSiteSettings } from '@/lib/settings';
import { DEFAULT_SITE_SETTINGS } from '@/types/settings';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// Strict Typography: Persian/Dari/Pashto standard (Regular 400 & Bold 700)
const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

// Strict Typography: English Minimalist standard (Regular 400 & Bold 700)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const brandSettings = (await getSiteSettings()) || DEFAULT_SITE_SETTINGS;
  const faviconUrl = brandSettings.favicon || '/favicon.ico';
  const siteTitle = brandSettings.siteName || 'Arya Link';
  const description =
    brandSettings.siteDescription ||
    'پیشرفته‌ترین پلتفرم کارت ویزیت هوشمند NFC و مدیریت لینک در افغانستان';

  return {
    title: `${siteTitle} | پلتفرم کارت ویزیت دیجیتال NFC و لینک‌در‌بیو`,
    description,
    icons: {
      icon: [{ url: faviconUrl }],
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get('aryalink_lang')?.value;
  const initialLanguage: SupportedLanguage =
    langCookie === 'ps' || langCookie === 'en' ? langCookie : 'da';
  const initialDir = initialLanguage === 'en' ? 'ltr' : 'rtl';
  const brandSettings = (await getSiteSettings()) || DEFAULT_SITE_SETTINGS;

  return (
    <html
      lang={initialLanguage}
      dir={initialDir}
      className={`${vazirmatn.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={brandSettings?.favicon || '/favicon.ico'} />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-cyan-500 selection:text-white">
        <AuthProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <BrandingProvider initialSettings={brandSettings}>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <PublicShell>{children}</PublicShell>
                <Toaster position="top-center" richColors />
              </ThemeProvider>
            </BrandingProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
