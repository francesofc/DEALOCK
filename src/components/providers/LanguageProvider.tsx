"use client";

import { LanguageProvider as I18nLanguageProvider } from "@/lib/i18n/LanguageContext";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <I18nLanguageProvider>{children}</I18nLanguageProvider>;
}
