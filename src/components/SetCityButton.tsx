'use client'

import { useCity } from '@/lib/city-context'
import { countryFlag } from '@/lib/utils'
import type { CityConfig, Locale } from '@/lib/types'
import { t } from '@/lib/i18n'

export default function SetCityButton({ city, lang }: { city: CityConfig; lang: Locale }) {
  const { selectedCity, setSelectedCity } = useCity()
  const isSelected = selectedCity?.slug === city.slug

  if (isSelected) {
    return (
      <button
        onClick={() => setSelectedCity(null)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-sky-500/20 border border-sky-400/40 text-sky-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
      >
        <span className="text-base leading-none">{countryFlag(city.country)}</span>
        {city.name} ✓
        <span className="text-xs opacity-60 hover:opacity-100">· {t(lang, 'clear_city')}</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => setSelectedCity(city)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {t(lang, 'select_city')}
    </button>
  )
}
