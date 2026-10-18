import type { Metadata } from 'next';
import { Vazirmatn, Outfit, JetBrains_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/types';
import { PublicShell } from '@/components/public/PublicShell';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arya Link | پلتفرم کارت ویزیت دیجیتال NFC و لینک‌در‌بیو',
  description: 'پیشرفته‌ترین پلتفرم کارت ویزیت هوشمند NFC و مدیریت لینک در افغانستان',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get('aryalink_lang')?.value;
  const initialLanguage: SupportedLanguage =
    langCookie === 'ps' || langCookie === 'en' ? langCookie : 'da';
  const initialDir = initialLanguage === 'en' ? 'ltr' : 'rtl';

  return (
    <html
      lang={initialLanguage}
      dir={initialDir}
      className={`${vazirmatn.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-cyan-500 selection:text-white">
        <AuthProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <PublicShell>{children}</PublicShell>
              <Toaster position="top-center" richColors />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
