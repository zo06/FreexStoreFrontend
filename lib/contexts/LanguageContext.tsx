"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import enTranslations from '../locales/en.json'
import arTranslations from '../locales/ar.json'
import deTranslations from '../locales/de.json'

export type Language = 'en' | 'ar' | 'de'

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

interface LanguageProviderProps {
  children: ReactNode
  initialLang?: string
}

const translations = {
  en: enTranslations,
  ar: arTranslations,
  de: deTranslations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'freex_language'

const VALID_LANGS: Language[] = ['en', 'ar', 'de']

export function LanguageProvider({ children, initialLang }: LanguageProviderProps) {
  const resolvedInitial: Language =
    initialLang && VALID_LANGS.includes(initialLang as Language)
      ? (initialLang as Language)
      : 'en'

  const [language, setLanguageState] = useState<Language>(resolvedInitial)

  // Sync with localStorage on mount, but URL param takes precedence
  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
    // Only use stored value if no URL lang was provided
    if (!initialLang && stored && VALID_LANGS.includes(stored)) {
      setLanguageState(stored)
      document.documentElement.dir = stored === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = stored
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  // Translation function with dot notation support
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  const isRTL = language === 'ar'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
