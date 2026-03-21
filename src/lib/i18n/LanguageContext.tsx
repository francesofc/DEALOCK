"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, LANGUAGES } from "@/types/i18n";
import { getStoredLanguage } from "./index";

// Default language
export const DEFAULT_LANGUAGE: Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: typeof LANGUAGES;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredLanguage();
    setLanguageState(stored);
    setIsInitialized(true);
  }, []);

  // Persist to localStorage on change
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("mandateos-language", lang);
    }
  };

  // Prevent flash of wrong language during hydration
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default values for SSR instead of throwing
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      languages: LANGUAGES,
    };
  }
  return context;
}
