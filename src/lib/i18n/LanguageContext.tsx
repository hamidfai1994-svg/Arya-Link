'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LANGUAGES, LanguageMeta, normalizeLangCode } from './types';
import { translations } from './translations';

interface LanguageContextType {
  language: SupportedLanguage;
  currentMeta: LanguageMeta;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'da',
  currentMeta: LANGUAGES.da,
  dir: 'rtl',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({
  children,
  initialLanguage = 'da',
}: {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);

  useEffect(() => {
    // Read from cookie if client has a preference
    const match = document.cookie.match(/(?:^|; )aryalink_lang=([^;]*)/);
    if (match && match[1]) {
      const saved = normalizeLangCode(match[1]);
      setLanguageState(saved);
      document.documentElement.lang = saved === 'da' ? 'fa' : saved;
      document.documentElement.dir = LANGUAGES[saved].dir;
    } else {
      document.documentElement.lang = initialLanguage === 'da' ? 'fa' : initialLanguage;
      document.documentElement.dir = LANGUAGES[initialLanguage]?.dir || 'rtl';
    }
  }, [initialLanguage]);

  const setLanguage = (lang: SupportedLanguage) => {
    const normalized = normalizeLangCode(lang);
    setLanguageState(normalized);
    // Persist in cookie for 1 year
    document.cookie = `aryalink_lang=${normalized}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    document.documentElement.lang = normalized === 'da' ? 'fa' : normalized;
    document.documentElement.dir = LANGUAGES[normalized].dir;
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language] || translations.da;
    if (dict[key]) return dict[key];
    // fallback to Dari or English
    if (translations.da[key]) return translations.da[key];
    if (translations.en[key]) return translations.en[key];
    return fallback || key;
  };

  const currentMeta = LANGUAGES[language] || LANGUAGES.da;
  const dir = currentMeta.dir;

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentMeta,
        dir,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
