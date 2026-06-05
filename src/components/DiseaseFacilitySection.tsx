'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCity } from '@/lib/city-context'
import { countryFlag, haversineKm } from '@/lib/utils'
import { t } from '@/lib/i18n'
import type { Facility, CityConfig, Locale } from '@/lib/types'
import CityPickerPanel from './CityPickerPanel'

const FacilityMap = dynamic(() => import('./FacilityMap'), { ssr: false })
const MapBlurBackground = dynamic(() => import('./MapBlurBackground'), { ssr: false })

interface Props {
  allFacilities: Facility[]
  citiesWithFacilities: (CityConfig & { facilityCount: number })[]
  diseaseName: string
  lang: Locale
}

export default function DiseaseFacilitySection({ allFacilities, citiesWithFacilities, diseaseName, lang }: Props) {
  const { selectedCity, setSelectedCity } = useCity()

  const displayFacilities = useMemo(() => {
    if (!selectedCity) return allFacilities
    return allFacilities
      .filter((f) => haversineKm(selectedCity.lat, selectedCity.lon, f.lat, f.lng) <= (selectedCity.radiusKm ?? 10))
      .sort((a, b) =>
        haversineKm(selectedCity.lat, selectedCity.lon, a.lat, a.lng) -
        haversineKm(selectedCity.lat, selectedCity.lon, b.lat, b.lng)
      )
  }, [selectedCity, allFacilities])

  const geoFacilities = useMemo(() =>
    selectedCity ? allFacilities.filter(f => f.country === selectedCity.country) : undefined,
    [selectedCity, allFacilities]
  )

  const geoCountry = selectedCity
    ? `${countryFlag(selectedCity.country)} ${selectedCity.countryName}`
    : undefined

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* City filter row */}
      {selectedCity ? (
        <div className="flex items-center gap-2 text-sm bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 min-h-[44px]">
          <span className="text-base leading-none">{countryFlag(selectedCity.country)}</span>
          <span className="font-medium text-sky-700">{selectedCity.name}</span>
          <span className="text-sky-500 text-xs">
            · {displayFacilities.length} {t(lang, 'city_facilities_count')} {selectedCity.name}
          </span>
          <button
            onClick={() => setSelectedCity(null)}
            className="ml-auto text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            ✕ {t(lang, 'clear_city')}
          </button>
        </div>
      ) : citiesWithFacilities.length > 0 ? (
        <div>
          <p className="text-xs text-slate-400 mb-2">{t(lang, 'narrow_by_city')}:</p>
          <CityPickerPanel
            cities={citiesWithFacilities}
            lang={lang}
            onSelect={setSelectedCity}
          />
        </div>
      ) : null}

      {selectedCity ? (
        <FacilityMap
          initialFacilities={allFacilities}
          activeFacilities={displayFacilities}
          activeLabel={t(lang, 'radius_city').replace('{city}', selectedCity.name).replace('{radius}', String(selectedCity.radiusKm ?? 10))}
          geoFacilities={geoFacilities}
          geoCountry={geoCountry}
          lang={lang}
        />
      ) : (
        /* Temsili harita — şehir seçilmemişken CTA */
        <div className="relative rounded-2xl overflow-hidden min-h-[420px] flex-1 shadow-sm border border-slate-100">
          {/* Gerçek harita, blur + non-interactive */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ filter: 'blur(2px)', transform: 'scale(1.04)' }}
          >
            <MapBlurBackground />
          </div>
          {/* Dim overlay */}
          <div className="absolute inset-0 bg-slate-900/30" />
          {/* CTA — ortalanmış frosted glass kart */}
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-md rounded-2xl px-8 py-6 shadow-xl max-w-[300px] text-center">
              <span className="text-4xl">🏥</span>
              <p className="font-bold text-slate-800 text-lg leading-snug">
                {t(lang, 'city_blur_cta').replace('{disease}', diseaseName)}
              </p>
              <Link
                href={`/${lang}/cities`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition-colors shadow-md w-full justify-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {t(lang, 'select_city')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
