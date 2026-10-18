'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

interface BrandingContextValue {
  settings: ISiteSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<ISiteSettings>) => Promise<{ success: boolean; message?: string }>;
}

const BrandingContext = createContext<BrandingContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  isLoading: false,
  refreshSettings: async () => {},
  updateSettings: async () => ({ success: false }),
});

export function BrandingProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: ISiteSettings;
}) {
  const [settings, setSettings] = useState<ISiteSettings>(
    initialSettings || DEFAULT_SITE_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sync favicon with document <head> on change
  useEffect(() => {
    if (typeof document !== 'undefined' && settings.favicon) {
      let link: HTMLLinkElement | null =
        document.querySelector("link[rel*='icon']") ||
        document.querySelector("link[rel='shortcut icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings.favicon]);

  const refreshSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings/branding', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to refresh branding settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Partial<ISiteSettings>) => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/settings/branding', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings),
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          return { success: true, message: data.message };
        }
        return { success: false, message: data.message || 'خطا در ذخیره‌سازی' };
      } catch (err: any) {
        console.error('Failed to update branding settings:', err);
        return { success: false, message: 'خطای شبکه در ذخیره‌سازی تنظیمات برند' };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <BrandingContext.Provider
      value={{
        settings,
        isLoading,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  return context;
}

export default BrandingProvider;
