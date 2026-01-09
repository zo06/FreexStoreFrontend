'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

const languages = [
  { code: 'en', flagCode: 'gb', name: 'English', nativeName: 'English' },
  { code: 'ar', flagCode: 'sa', name: 'Arabic', nativeName: 'العربية' },
  { code: 'de', flagCode: 'de', name: 'German', nativeName: 'Deutsch' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find(l => l.code === locale) || languages[0]

  const switchLanguage = (newLocale: string) => {
    try {
      // Get the current path without the locale prefix
      const segments = pathname.split('/').filter(Boolean)
      const knownLocales = ['en', 'ar', 'de']

      // Remove locale if present
      let pathWithoutLocale = segments
      if (segments[0] && knownLocales.includes(segments[0])) {
        pathWithoutLocale = segments.slice(1)
      }

      // Build the path
      const pathPart = pathWithoutLocale.length > 0
        ? '/' + pathWithoutLocale.join('/')
        : ''

      // Navigate using window.location to avoid Next.js router issues
      const newPath = `/${newLocale}${pathPart}`
      window.location.href = newPath
    } catch (error) {
      console.error('Error switching language:', error)
      // Ultimate fallback
      window.location.href = `/${newLocale}`
    } finally {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button - Just Flag */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.08] transition-all duration-300 overflow-hidden"
      >
        <img
          src={`https://flagcdn.com/w40/${currentLang.flagCode}.png`}
          alt={currentLang.name}
          className="w-6 h-4 object-cover rounded-sm shadow-sm"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Flag Menu */}
          <div className="absolute right-0 mt-2 z-50 animate-fade-in">
            <div className="relative bg-black/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[160px]">
              <div className="flex flex-col gap-1 p-2">
                {languages.map((lang) => {
                  const isSelected = locale === lang.code
                  return (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className={`relative w-full h-12 rounded-xl flex items-center gap-3 px-3 transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'bg-cyan-500/20 border border-cyan-500/50'
                          : 'hover:bg-white/[0.08] border border-transparent'
                      }`}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${lang.flagCode}.png`}
                        alt={lang.name}
                        className="w-8 h-6 object-cover rounded-sm shadow-sm"
                      />
                      <span className="text-sm text-white/90 font-medium">
                        {lang.nativeName}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
