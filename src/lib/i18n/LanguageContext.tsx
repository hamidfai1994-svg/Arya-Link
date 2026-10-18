'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LANGUAGES, LanguageMeta } from './types';
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
    if (match && (match[1] === 'da' || match[1] === 'ps' || match[1] === 'en')) {
      const saved = match[1] as SupportedLanguage;
      setLanguageState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = LANGUAGES[saved].dir;
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    // Persist in cookie for 1 year
    document.cookie = `aryalink_lang=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;
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
