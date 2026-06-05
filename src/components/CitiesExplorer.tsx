'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { CityConfig } from '@/lib/types'
import { countryFlag } from '@/lib/utils'
import { useCity } from '@/lib/city-context'

const CityExplorerMap = dynamic(() => import('./CityExplorerMap'), { ssr: false })

type Region = 'all' | 'europe' | 'americas' | 'oceania'

interface Props {
  cities: CityConfig[]
  lang: string
  labels: {
    searchPlaceholder: string
    regionAll: string
    regionEurope: string
    regionAmericas: string
    regionOceania: string
    noResults: string
  }
}

export default function CitiesExplorer({ cities, lang, labels }: Props) {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState<Region>('all')
  const [openCountries, setOpenCountries] = useState<Set<string>>(new Set())
  const { setSelectedCity } = useCity()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return cities.filter((c) => {
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.countryName.toLowerCase().includes(q)
      const matchesRegion = region === 'all' || c.region === region
      return matchesSearch && matchesRegion
    })
  }, [cities, search, region])

  // Auto-open accordion rows when searching
  const effectiveOpen = useMemo<Set<string>>(() => {
    if (search) return new Set(filtered.map((c) => c.countryName))
    return openCountries
  }, [search, filtered, openCountries])

  const byRegion = useMemo(() => {
    const group = (list: CityConfig[]) => {
      const map = new Map<string, CityConfig[]>()
      for (const c of list) {
        const arr = map.get(c.countryName) ?? []
        arr.push(c)
        map.set(c.countryName, arr)
      }
      return Array.from(map.entries())
    }
    return {
      europe: group(filtered.filter((c) => c.region === 'europe')),
      americas: group(filtered.filter((c) => c.region === 'americas')),
      oceania: group(filtered.filter((c) => c.region === 'oceania')),
    }
  }, [filtered])

  const toggleCountry = (country: string) => {
    if (search) return
    setOpenCountries((prev) => {
      const next = new Set(prev)
      if (next.has(country)) next.delete(country)
      else next.add(country)
      return next
    })
  }

  const regions: { key: Region; label: string }[] = [
    { key: 'all', label: labels.regionAll },
    { key: 'europe', label: `🌍 ${labels.regionEurope}` },
    { key: 'americas', label: `🌎 ${labels.regionAmericas}` },
    { key: 'oceania', label: `🌏 ${labels.regionOceania}` },
  ]

  const sections = [
    { key: 'europe', label: `🌍 ${labels.regionEurope}`, entries: byRegion.europe },
    { key: 'americas', label: `🌎 ${labels.regionAmericas}`, entries: byRegion.americas },
    { key: 'oceania', label: `🌏 ${labels.regionOceania}`, entries: byRegion.oceania },
  ]

  return (
    <div>
      {/* Search + region filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="search"
          placeholder={labels.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
        />
        <div className="flex flex-wrap gap-2">
          {regions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRegion(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px] ${
                region === key
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive map */}
      <div className="h-56 sm:h-72 md:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-8">
        <CityExplorerMap cities={filtered} lang={lang} />
      </div>

      {/* Country accordion by region */}
      {sections.map(({ key, label, entries }) =>
        entries.length > 0 ? (
          <div key={key} className="mb-8">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {label}
            </h2>
            <div className="space-y-2">
              {entries.map(([country, countryCities]) => {
                const isOpen = effectiveOpen.has(country)
                const flag = countryFlag(countryCities[0].country)
                return (
                  <div
                    key={country}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleCountry(country)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors min-h-[52px]"
                    >
                      <span className="font-medium text-slate-800 text-sm">
                        {flag} {country}
                        <span className="ml-2 text-slate-400 font-normal">
                          ({countryCities.length})
                        </span>
                      </span>
                      <span
                        className={`text-slate-400 text-xs transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 border-t border-slate-100">
                        {countryCities.map((city) => (
                          <a
                            key={city.slug}
                            href={`/${lang}/cities/${city.slug}`}
                            onClick={() => setSelectedCity(city)}
                            className="flex items-center px-4 py-3 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-sm font-medium transition-colors border border-transparent hover:border-sky-200 min-h-[44px]"
                          >
                            {city.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">{labels.noResults}</div>
      )}
    </div>
  )
}
