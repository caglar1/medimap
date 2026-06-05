'use client'

import Link from 'next/link'
import { useCity } from '@/lib/city-context'
import { countryFlag } from '@/lib/utils'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export default function CityBadge({ lang }: { lang: Locale }) {
  const { selectedCity, setSelectedCity } = useCity()

  if (!selectedCity) {
    return (
      <Link
        href={`/${lang}/cities`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-600 text-slate-300 hover:border-sky-400 hover:text-sky-400 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {t(lang, 'select_city')}
      </Link>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-sky-500/20 border border-sky-500/40 text-sky-300">
      <span className="text-sm leading-none">{countryFlag(selectedCity.country)}</span>
      <Link
        href={`/${lang}/cities/${selectedCity.slug}`}
        className="hover:text-white transition-colors"
      >
        {selectedCity.name}
      </Link>
      <button
        onClick={() => setSelectedCity(null)}
        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-sky-400/30 text-sky-400 hover:text-white transition-colors ml-0.5"
        aria-label={t(lang, 'clear_city')}
      >
        ×
      </button>
    </div>
  )
}
