// Internationalization (i18n) for MandateOS
import { Language, TranslationDictionary, LANGUAGES } from '@/types/i18n'
import { en } from './translations/en'
import { fr } from './translations/fr'
import { pt } from './translations/pt'
import { es } from './translations/es'

const translations: Record<Language, TranslationDictionary> = {
  en,
  fr,
  pt,
  es,
}

// Default language
export const DEFAULT_LANGUAGE: Language = 'en'

// Get translation dictionary for a language
export function getTranslation(lang: Language): TranslationDictionary {
  return translations[lang] || translations[DEFAULT_LANGUAGE]
}

// Simple translation hook for components (synchronous version for now)
export function useTranslation(lang: Language = DEFAULT_LANGUAGE) {
  const t = getTranslation(lang)
  
  return {
    t,
    lang,
    languages: LANGUAGES,
    setLanguage: (newLang: Language) => {
      // This will be expanded when we add proper language state management
      if (typeof window !== 'undefined') {
        localStorage.setItem('mandateos-language', newLang)
      }
    },
  }
}

// Get language from storage or default
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  const stored = localStorage.getItem('mandateos-language') as Language
  return translations[stored] ? stored : DEFAULT_LANGUAGE
}

// Language names for UI
export function getLanguageName(code: Language): string {
  const lang = LANGUAGES.find(l => l.code === code)
  return lang?.name || code
}

export function getNativeLanguageName(code: Language): string {
  const lang = LANGUAGES.find(l => l.code === code)
  return lang?.nativeName || code
}
