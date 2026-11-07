import Script from 'next/script';

export default function BotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--tg-theme-bg-color, #0f172a)',
        color: 'var(--tg-theme-text-color, #f8fafc)',
      }}
    >
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {children}
    </div>
  );
}

