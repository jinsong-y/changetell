import React, { createContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, isLocale, type Locale } from './types';
import { translate, type TranslationKey } from './translations';

const STORAGE_KEY = 'change-tell-locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

const readInitialLocale = (initialLocale?: Locale): Locale => {
  if (initialLocale) return initialLocale;
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_LOCALE;
  if (!isLocale(saved)) {
    throw new Error(`Unsupported saved locale: ${saved}`);
  }
  return saved;
};

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => readInitialLocale(initialLocale));

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key, values) => translate(locale, key, values),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
