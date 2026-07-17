"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Locale = "en" | "th";

const DEFAULT_LOCALE: Locale = "th";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);
const SetLocaleContext = createContext<(locale: Locale) => void>(() => {});

const STORAGE_KEY = "locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "th" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <LocaleContext.Provider value={locale}>
      <SetLocaleContext.Provider value={setLocale}>{children}</SetLocaleContext.Provider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useSetLocale() {
  return useContext(SetLocaleContext);
}

/** t("English text", "ข้อความภาษาไทย") — returns whichever matches the active locale. */
export function useT() {
  const locale = useLocale();
  return useCallback((en: string, th: string) => (locale === "th" ? th : en), [locale]);
}
