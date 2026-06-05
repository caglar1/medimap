import Link from 'next/link'
import LanguageSwitcher from './LanguageSwitcher'
import CityBadge from './CityBadge'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export default function Header({
  lang,
  diseaseSlugMap,
}: {
  lang: Locale
  diseaseSlugMap?: Record<Locale, string>
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${lang}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight group-hover:text-sky-400 transition-colors">
              medi<span className="text-sky-400">mapia</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`/${lang}`}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              {t(lang, 'nav_home')}
            </Link>
            <Link
              href={`/${lang}`}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              {t(lang, 'nav_diseases')}
            </Link>
            <Link
              href={`/${lang}/departments`}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              {t(lang, 'nav_departments')}
            </Link>
            <Link
              href={`/${lang}/cities`}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              {t(lang, 'nav_cities')}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <CityBadge lang={lang} />
            <LanguageSwitcher currentLang={lang} diseaseSlugMap={diseaseSlugMap} />
          </div>
        </div>
      </div>
    </header>
  )
}
