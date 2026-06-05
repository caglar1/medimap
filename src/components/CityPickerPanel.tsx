'use client'

import { useState, useMemo } from 'react'
import { countryFlag } from '@/lib/utils'
import { t } from '@/lib/i18n'
import type { CityConfig, Locale } from '@/lib/types'

type CityWithCount = CityConfig & { facilityCount: number }
type Region = 'europe' | 'americas' | 'oceania'

const REGIONS: { key: Region; emoji: string; i18nKey: string }[] = [
  { key: 'europe',   emoji: '🌍', i18nKey: 'cities_region_europe'   },
  { key: 'americas', emoji: '🌎', i18nKey: 'cities_region_americas' },
  { key: 'oceania',  emoji: '🌏', i18nKey: 'cities_region_oceania'  },
]

interface Props {
  cities: CityWithCount[]
  lang: Locale
  onSelect: (city: CityConfig) => void
}

export default function CityPickerPanel({ cities, lang, onSelect }: Props) {
  const [search, setSearch]                 = useState('')
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region)
    setSelectedCountry(null)
  }

  // Search mode: filter across all cities, group by country
  const searchResults = useMemo(() => {
    if (!search) return null
    const q = search.toLowerCase()
    const filtered = cities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.countryName.toLowerCase().includes(q)
    )
    const map = new Map<string, CityWithCount[]>()
    for (const c of filtered) {
      const arr = map.get(c.countryName) ?? []
      arr.push(c)
      map.set(c.countryName, arr)
    }
    return Array.from(map.entries())
  }, [cities, search])

  // Level 2: countries for the selected region
  const countriesInRegion = useMemo(() => {
    if (!selectedRegion) return []
    const map = new Map<string, { country: string; countryName: string; cities: CityWithCount[] }>()
    for (const c of cities.filter((c) => c.region === selectedRegion)) {
      const entry = map.get(c.countryName) ?? { country: c.country, countryName: c.countryName, cities: [] }
      entry.cities.push(c)
      map.set(c.countryName, entry)
    }
    return Array.from(map.values())
  }, [cities, selectedRegion])

  // Level 3: cities for the selected country
  const citiesInCountry = useMemo(
    () => (selectedCountry ? cities.filter((c) => c.countryName === selectedCountry) : []),
    [cities, selectedCountry]
  )

  const activeRegion = REGIONS.find((r) => r.key === selectedRegion)
  const isSearching  = search.length > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Search input */}
      <div className="p-3 border-b border-slate-100">
        <input
          type="search"
          placeholder={t(lang, 'cities_search_placeholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
        />
      </div>

      <div className="max-h-[380px] overflow-y-auto">
        {isSearching ? (
          /* ── Search results ───────────────────────────────────────── */
          searchResults!.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-400">
              {t(lang, 'cities_no_results')}
            </p>
          ) : (
            <div className="p-3 space-y-3">
              {searchResults!.map(([countryName, countryCities]) => (
                <div key={countryName}>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 px-1">
                    {countryFlag(countryCities[0].country)} {countryName}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {countryCities.map((city) => (
                      <CityButton key={city.slug} city={city} onSelect={onSelect} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )

        ) : !selectedRegion ? (
          /* ── Level 1: Region chips ────────────────────────────────── */
          <div className="p-3 flex flex-wrap gap-2">
            {REGIONS.map(({ key, emoji, i18nKey }) => {
              const count = cities.filter((c) => c.region === key).length
              if (count === 0) return null
              return (
                <button
                  key={key}
                  onClick={() => handleRegionSelect(key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 text-slate-600 text-xs font-medium transition-colors min-h-[44px]"
                >
                  <span>{emoji}</span>
                  <span>{t(lang, i18nKey)}</span>
                </button>
              )
            })}
          </div>

        ) : !selectedCountry ? (
          /* ── Level 2: Country chips ───────────────────────────────── */
          <div className="p-3">
            <BackButton
              label={`${activeRegion!.emoji} ${t(lang, activeRegion!.i18nKey)}`}
              onClick={() => setSelectedRegion(null)}
            />
            <div className="space-y-1 mt-3">
              {countriesInRegion.map(({ country, countryName, cities: cc }) => (
                <button
                  key={countryName}
                  onClick={() => setSelectedCountry(countryName)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-sm font-medium transition-colors min-h-[44px] text-left"
                >
                  <span className="text-base">{countryFlag(country)}</span>
                  <span className="flex-1">{countryName}</span>
                  <span className="text-xs text-slate-400">{cc.length} {t(lang, 'cities_count_suffix')}</span>
                  <span className="text-slate-300 text-xs">›</span>
                </button>
              ))}
            </div>
          </div>

        ) : (
          /* ── Level 3: City grid ───────────────────────────────────── */
          <div className="p-3">
            <BackButton
              label={`${countryFlag(citiesInCountry[0]?.country ?? '')} ${selectedCountry}`}
              onClick={() => setSelectedCountry(null)}
            />
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {citiesInCountry.map((city) => (
                <CityButton key={city.slug} city={city} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700 font-medium transition-colors"
    >
      ← {label}
    </button>
  )
}

function CityButton({ city, onSelect }: { city: CityWithCount; onSelect: (c: CityConfig) => void }) {
  return (
    <button
      onClick={() => onSelect(city)}
      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-sm font-medium transition-colors text-left min-h-[40px]"
    >
      <span className="truncate">{city.name}</span>
      <span className="ml-1.5 text-xs text-slate-400 flex-shrink-0">×{city.facilityCount}</span>
    </button>
  )
}
