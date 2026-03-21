"use client";

import { useContext } from "react";
import { LanguageContext, DEFAULT_LANGUAGE } from "./LanguageContext";
import { getTranslation, getLanguageName, getNativeLanguageName, LANGUAGES } from "./index";

export function useTranslation() {
  // Gracefully handle case where context isn't available (SSR)
  const context = useContext(LanguageContext);
  
  const language = context?.language ?? DEFAULT_LANGUAGE;
  const setLanguage = context?.setLanguage ?? (() => {});
  const t = getTranslation(language);

  return {
    t,
    language,
    setLanguage,
    languages: LANGUAGES,
    getLanguageName: (code: typeof language) => getLanguageName(code),
    getNativeLanguageName: (code: typeof language) => getNativeLanguageName(code),
  };
}
