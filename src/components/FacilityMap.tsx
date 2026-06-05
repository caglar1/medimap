'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { t } from '@/lib/i18n'
import { haversineKm } from '@/lib/utils'
import type { Facility, Locale } from '@/lib/types'

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const starIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
</svg>
`

const stethoscopeIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 11.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
</svg>
`

const plusIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="w-3 h-3">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
`

const hospitalIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-3.5 h-3.5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
</svg>
`

const createFacilityIcon = (tier?: number, isGeneral?: boolean) => {
  if (typeof window === 'undefined') return null

  let colorClass = 'text-sky-500'
  let ringClass = ''
  let innerIcon = stethoscopeIconSvg

  if (isGeneral) {
    colorClass = 'text-indigo-600'
    innerIcon = hospitalIconSvg
  } else if (tier === 1) {
    colorClass = 'text-emerald-500'
    ringClass = 'ring-2 ring-emerald-300 ring-offset-1 animate-pulse'
    innerIcon = starIconSvg
  } else if (tier === 2) {
    colorClass = 'text-sky-500'
    innerIcon = stethoscopeIconSvg
  } else if (tier === 3) {
    colorClass = 'text-slate-400'
    innerIcon = plusIconSvg
  }

  const html = `
    <div class="relative flex flex-col items-center select-none cursor-pointer transform transition-transform duration-200 hover:scale-110 hover:-translate-y-1">
      <div class="relative ${ringClass} rounded-full">
        <svg class="w-8 h-10 drop-shadow-md ${colorClass}" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        </svg>
        <div class="absolute top-[6px] left-[6px] w-5 h-5 flex items-center justify-center text-white">
          ${innerIcon}
        </div>
      </div>
    </div>
  `

  return L.divIcon({
    className: '',
    html,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}


type DisplayFacility = {
  id: string
  name: string
  type: string
  lat: number
  lng: number
  address?: string
  phone?: string
  website?: string
  open_24h: boolean
  rating?: number
  isGeneral: boolean
  tier?: number
}

function FacilityRow({
  f,
  lang,
  typeKey,
  dimmed,
}: {
  f: DisplayFacility
  lang: Locale
  typeKey: (type: string) => Parameters<typeof t>[1]
  dimmed?: boolean
}) {
  const borderClass = f.tier === 1
    ? 'border-l-emerald-500'
    : f.tier === 2
    ? 'border-l-sky-500'
    : f.tier === 3
    ? 'border-l-slate-400'
    : f.type === 'hospital'
    ? 'border-l-sky-400'
    : 'border-l-emerald-400';

  return (
    <div className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors border-l-4 ${dimmed ? 'opacity-70' : ''} ${borderClass}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${f.type === 'hospital' ? 'bg-sky-50' : 'bg-emerald-50'}`}>
        <svg className={`w-5 h-5 ${f.type === 'hospital' ? 'text-sky-500' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{f.name}</p>
          {f.rating && (
            <span className="text-xs text-amber-500 font-bold whitespace-nowrap">★ {f.rating}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {f.tier && !f.isGeneral && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
              f.tier === 1
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : f.tier === 2
                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {f.tier === 1 ? t(lang, 'tier_1_perfect') : f.tier === 2 ? t(lang, 'tier_2_core') : t(lang, 'tier_3_support')}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.type === 'hospital' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {t(lang, typeKey(f.type))}
          </span>
          {f.open_24h && (
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
              {t(lang, 'open_24h')}
            </span>
          )}
        </div>
        {f.address && (
          <p className="text-xs text-slate-400 mt-1 truncate">{f.address}</p>
        )}
        <div className="flex gap-3 mt-2">
          {f.phone && (
            <a href={`tel:${f.phone}`} className="text-xs text-sky-500 hover:text-sky-600 font-medium">
              {t(lang, 'call')}
            </a>
          )}
          {f.website && (
            <a href={f.website} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-500 hover:text-sky-600 font-medium">
              {t(lang, 'website')} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.2 })
  }, [lat, lng, map])
  return null
}

function toDisplay(f: Facility & { tier?: number }): DisplayFacility {
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    lat: f.lat,
    lng: f.lng,
    address: f.address,
    phone: f.phone,
    website: f.website,
    open_24h: f.open_24h,
    rating: f.rating ?? undefined,
    isGeneral: (f.departments ?? []).includes('*'),
    tier: f.tier,
  }
}

export default function FacilityMap({
  initialFacilities,
  lang,
  activeFacilities,
  activeLabel,
  geoFacilities,
  geoCountry,
  hideLegend = false,
}: {
  initialFacilities: (Facility & { tier?: number })[]
  lang: Locale
  activeFacilities?: (Facility & { tier?: number })[]
  activeLabel?: string
  geoFacilities?: (Facility & { tier?: number })[]
  geoCountry?: string
  hideLegend?: boolean
}) {
  const [facilities, setFacilities] = useState<DisplayFacility[]>(
    initialFacilities.map(toDisplay)
  )
  const [center, setCenter] = useState<[number, number]>([52.52, 13.405])
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [geoLabel, setGeoLabel] = useState<string | undefined>(undefined)
  const [showGeneral, setShowGeneral] = useState(false)
  const [showSupporting, setShowSupporting] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)

  useEffect(() => {
    if (initialFacilities.length > 0) {
      setCenter([initialFacilities[0].lat, initialFacilities[0].lng])
    }
  }, [initialFacilities])

  useEffect(() => {
    if (activeFacilities !== undefined) {
      setFacilities(activeFacilities.map(toDisplay))
      setGeoLabel(undefined)
      if (activeFacilities.length > 0) {
        setCenter([activeFacilities[0].lat, activeFacilities[0].lng])
      }
    }
  }, [activeFacilities])

  function handleGeolocate() {
    if (!navigator.geolocation) return
    setStatus('locating')
    setErrorMsg('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const pool = geoFacilities ?? initialFacilities
        const nearby = pool
          .map((f) => ({ f, d: haversineKm(lat, lng, f.lat, f.lng) }))
          .filter(({ d }) => d <= 5)
          .sort((a, b) => a.d - b.d)
          .map(({ f }) => f)
        if (nearby.length === 0) {
          setFacilities(pool.map(toDisplay))
          if (geoCountry) setErrorMsg(t(lang, 'geo_no_results').replace('{country}', geoCountry))
        } else {
          setFacilities(nearby.map(toDisplay))
          setGeoLabel(t(lang, 'radius_geo'))
        }
        setCenter([lat, lng])
        setStatus('idle')
      },
      () => {
        setErrorMsg(t(lang, 'osm_error'))
        setStatus('error')
      }
    )
  }

  const typeKey = (type: string) => `type_${type}` as Parameters<typeof t>[1]
  const label = geoLabel ?? activeLabel

  const generalFacilities = facilities.filter(f => f.isGeneral)
  const specificFacilities = facilities.filter(f => !f.isGeneral)
  const specificPrimary = specificFacilities.filter(f => f.tier !== 3)
  const specificSupporting = specificFacilities.filter(f => f.tier === 3)
  const hasSpecificPrimary = specificPrimary.length > 0

  useEffect(() => {
    setShowSupporting(!hasSpecificPrimary)
  }, [hasSpecificPrimary])

  const visibleOnMap = facilities.filter(f => {
    if (f.isGeneral && !showGeneral) return false
    if (f.tier === 3 && !showSupporting) return false
    return true
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-full">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t(lang, 'block3_title')}
          </h2>
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={status === 'locating'}
            title={t(lang, 'use_my_location')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors disabled:opacity-60"
          >
            {status === 'locating' ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        {label && (
          <p className="text-xs text-slate-400 mt-2">📍 {label}</p>
        )}

        {errorMsg && (
          <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-lg">
            {errorMsg}
          </p>
        )}
      </div>

      <div className="h-[300px] relative">
        <MapContainer
          center={center}
          zoom={3}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
          />
          <MapRecenter lat={center[0]} lng={center[1]} />
          {visibleOnMap.map((f) => {
            const customIcon = createFacilityIcon(f.tier, f.isGeneral);
            return (
              <Marker key={f.id} position={[f.lat, f.lng]} icon={customIcon || undefined}>
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-bold text-slate-800 text-sm mb-1">{f.name}</p>
                    <p className="text-xs text-slate-500 mb-2">{f.address}</p>
                    {f.open_24h && (
                      <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium mb-2">
                        {t(lang, 'open_24h')}
                      </span>
                    )}
                    {f.phone && (
                      <p className="text-xs text-slate-600">📞 {f.phone}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend */}
        {!hideLegend && (
          <div className="absolute top-3 right-3 z-[1001] pointer-events-auto">
            {legendOpen ? (
              <div className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-100/80 flex flex-col gap-1.5 w-[140px] text-[10px]">
                <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                  <span className="font-semibold text-slate-500 truncate" title={t(lang, 'tier_fit_legend')}>
                    {t(lang, 'tier_fit_legend')}
                  </span>
                  <button
                    onClick={() => setLegendOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                    title={t(lang, 'map_legend_collapse')}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white shadow-sm flex-shrink-0" />
                    <span className="text-slate-600 font-medium truncate">{t(lang, 'tier_1_perfect')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500 border border-white shadow-sm flex-shrink-0" />
                    <span className="text-slate-600 font-medium truncate">{t(lang, 'tier_2_core')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 border border-white shadow-sm flex-shrink-0" />
                    <span className="text-slate-600 font-medium truncate">{t(lang, 'tier_3_support')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 border border-white shadow-sm flex-shrink-0" />
                    <span className="text-slate-600 font-medium truncate">{t(lang, 'general_hospitals_toggle')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setLegendOpen(true)}
                className="bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all flex items-center justify-center"
                title={t(lang, 'map_legend_expand')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="absolute bottom-7 right-2 z-[1001] flex gap-1">
          {specificSupporting.length > 0 && (
            <button
              onClick={() => setShowSupporting(v => !v)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all select-none shadow-sm ${
                showSupporting
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
              }`}
            >
              🩺 {t(lang, 'supporting_clinics_toggle')}
            </button>
          )}
          {generalFacilities.length > 0 && (
            <button
              onClick={() => setShowGeneral(v => !v)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all select-none shadow-sm ${
                showGeneral
                  ? 'bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
              }`}
            >
              🏥 {t(lang, 'general_hospitals_toggle')}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-slate-50">
        {specificPrimary.slice(0, 15).map((f) => (
          <FacilityRow key={f.id} f={f} lang={lang} typeKey={typeKey} />
        ))}
        {specificSupporting.length > 0 && (
          <>
            <div className="mx-3 my-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-3 py-2.5 flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              <p className="text-xs text-emerald-800 leading-relaxed flex-1">{t(lang, 'supporting_clinics_info')}</p>
              <button
                onClick={() => setShowSupporting(v => !v)}
                className={`ml-1 flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all select-none shadow-sm ${
                  showSupporting
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                }`}
              >
                🩺 {t(lang, 'supporting_clinics_toggle')}
              </button>
            </div>
            {showSupporting && specificSupporting.slice(0, 15).map((f) => (
              <FacilityRow key={f.id} f={f} lang={lang} typeKey={typeKey} dimmed />
            ))}
          </>
        )}
        {generalFacilities.length > 0 && (
          <>
            <div className="mx-3 my-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-3 py-2.5 flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              <p className="text-xs text-amber-800 leading-relaxed flex-1">{t(lang, 'general_hospitals_info')}</p>
              <button
                onClick={() => setShowGeneral(v => !v)}
                className={`ml-1 flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all select-none shadow-sm ${
                  showGeneral
                    ? 'bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200'
                    : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                }`}
              >
                🏥 {t(lang, 'general_hospitals_toggle')}
              </button>
            </div>
            {showGeneral && generalFacilities.slice(0, 15).map((f) => (
              <FacilityRow key={f.id} f={f} lang={lang} typeKey={typeKey} dimmed />
            ))}
          </>
        )}
      </div>

      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
        <p className="text-xs text-slate-400">{t(lang, 'osm_attribution')}</p>
      </div>
    </div>
  )
}
