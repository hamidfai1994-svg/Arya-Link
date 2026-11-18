'use client';

import React, { useEffect, useState } from 'react';

export function TwaThemeWrapper({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    const initTelegramSdk = async () => {
      try {
        const sdkModule = await import('@twa-dev/sdk');
        const WebApp = sdkModule.default;

        const applyTheme = () => {
          const scheme: 'dark' | 'light' =
            WebApp.colorScheme === 'light' ? 'light' : 'dark';
          setColorScheme(scheme);

          const tp = (WebApp.themeParams || {}) as Record<string, string | undefined>;
          const root = document.documentElement;

          root.classList.remove('dark', 'light');
          root.classList.add(scheme);

          const defaultBg = scheme === 'light' ? '#f8fafc' : '#090d16';
          const defaultSecondaryBg = scheme === 'light' ? '#ffffff' : '#111827';
          const defaultText = scheme === 'light' ? '#0f172a' : '#f8fafc';
          const defaultHint = scheme === 'light' ? '#64748b' : '#94a3b8';
          const defaultButton = '#0ea5e9';
          const defaultButtonText = '#ffffff';

          root.style.setProperty('--tg-theme-bg-color', tp.bg_color || defaultBg);
          root.style.setProperty(
            '--tg-theme-secondary-bg-color',
            tp.secondary_bg_color || defaultSecondaryBg
          );
          root.style.setProperty('--tg-theme-text-color', tp.text_color || defaultText);
          root.style.setProperty('--tg-theme-hint-color', tp.hint_color || defaultHint);
          root.style.setProperty('--tg-theme-button-color', tp.button_color || defaultButton);
          root.style.setProperty(
            '--tg-theme-button-text-color',
            tp.button_text_color || defaultButtonText
          );
          root.style.setProperty(
            '--tg-card-bg',
            scheme === 'light'
              ? tp.secondary_bg_color || 'rgba(255, 255, 255, 0.92)'
              : tp.secondary_bg_color || 'rgba(15, 23, 42, 0.72)'
          );
          root.style.setProperty(
            '--tg-card-border',
            scheme === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.09)'
          );
        };

        if (WebApp) {
          WebApp.ready();
          WebApp.expand();
          applyTheme();

          WebApp.onEvent('themeChanged', applyTheme);
          cleanupFn = () => {
            try {
              WebApp.offEvent('themeChanged', applyTheme);
            } catch {
              // ignore
            }
          };
        }
      } catch (err) {
        console.warn('Telegram WebApp SDK initialization note:', err);
      }
    };

    initTelegramSdk();

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, []);

  return (
    <div
      data-tg-scheme={colorScheme}
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: 'var(--tg-theme-bg-color, #090d16)',
        color: 'var(--tg-theme-text-color, #f8fafc)',
      }}
    >
      {children}
    </div>
  );
}
export default TwaThemeWrapper;
