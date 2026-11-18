import Script from 'next/script';
import { TwaThemeWrapper } from '@/components/twa/TwaThemeWrapper';

export default function BotLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <TwaThemeWrapper>{children}</TwaThemeWrapper>
    </>
  );
}
