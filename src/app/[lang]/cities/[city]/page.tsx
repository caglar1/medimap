import Header from '@/components/Header'
import CityHealthStats from '@/components/CityHealthStats'
import CitySpecialitiesFilter from '@/components/CitySpecialitiesFilter'
import SetCityButton from '@/components/SetCityButton'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const CityDiseasesSection = dynamic(
  () => import('@/components/CityDiseasesSection'),
  { ssr: false }
)
import {
  getAllCitiesConfig,
  getCityConfig,
  getStateConfig,
  getFacilitiesByCity,
  getFacilitiesByCountry,
  getDepartmentsByCity,
} from '@/lib/data'
import { fetchCityHealthStats } from '@/lib/eurostat'
import { LOCALES, t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { countryFlag } from '@/lib/utils'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    getAllCitiesConfig().map((city) => ({ lang, city: city.slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; city: string }
}) {
  const cityConfig = getCityConfig(params.city)
  if (!cityConfig) return {}
  return {
    title: `${cityConfig.name} ${t(params.lang, 'city_profile_subtitle')} | Medimapia`,
    description: `${t(params.lang, 'cities_health_specialties')} — ${cityConfig.name}, ${cityConfig.countryName}`,
    alternates: {
      canonical: `/${params.lang}/cities/${params.city}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}/cities/${params.city}`])),
    },
  }
}

export default async function CityProfilePage({
  params,
}: {
  params: { lang: Locale; city: string }
}) {
  const { lang, city: citySlug } = params
  const cityConfig = getCityConfig(citySlug)
  if (!cityConfig) notFound()

  const facilities = getFacilitiesByCity(citySlug)
  const departments = getDepartmentsByCity(citySlug)
  const stateConfig = cityConfig.stateSlug ? getStateConfig(cityConfig.stateSlug) : null
  const cityStats = stateConfig ? await fetchCityHealthStats(stateConfig.name) : null

  const flag = countryFlag(cityConfig.country)
  const geoFacilities = getFacilitiesByCountry(cityConfig.country)
  const geoCountry = `${flag} ${cityConfig.countryName}`

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href={`/${lang}`} className="hover:text-sky-500 transition-colors">
            {t(lang, 'nav_home')}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/cities`} className="hover:text-sky-500 transition-colors">
            {t(lang, 'nav_cities')}
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{cityConfig.name}</span>
        </nav>

        {/* City hero card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="h-1.5 bg-gradient-to-r from-sky-400 to-emerald-500" />
          <div className="p-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl">{flag}</span>
                <h1 className="text-3xl font-bold text-slate-900">{cityConfig.name}</h1>
              </div>
              <p className="text-sm text-slate-500">
                {cityConfig.countryName}
                {facilities.length > 0 && (
                  <> · <span className="font-medium text-slate-700">{facilities.length}</span> {t(lang, 'cities_facilities')} indexed</>
                )}
              </p>
            </div>
            <div className="shrink-0 pt-1">
              <SetCityButton city={cityConfig} lang={lang} />
            </div>
          </div>
        </div>

        {/* Speciality chips (sticky sidebar) + Facility map */}
        <CitySpecialitiesFilter
          departments={departments}
          allFacilities={facilities}
          lang={lang}
          cityLabel={t(lang, 'radius_city').replace('{city}', cityConfig.name).replace('{radius}', String(cityConfig.radiusKm ?? 15))}
          geoFacilities={geoFacilities}
          geoCountry={geoCountry}
          labels={{
            healthSpecialties: t(lang, 'cities_health_specialties'),
            facilities: t(lang, 'cities_facilities'),
            showMore: t(lang, 'cities_show_more'),
            showLess: t(lang, 'cities_show_less'),
          }}
        />

        {/* Health stats + Disease discovery — side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-6">
          {cityStats && (
            <div className="lg:w-[45%] lg:flex-shrink-0">
              <CityHealthStats stats={cityStats} lang={lang} />
            </div>
          )}
          <div className="flex-1">
            <CityDiseasesSection lang={lang} cityName={cityConfig.name} />
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <Link
            href={`/${lang}/cities`}
            className="text-sm text-sky-500 hover:text-sky-600 hover:underline"
          >
            ← {t(lang, 'nav_cities')}
          </Link>
        </div>
      </div>
    </div>
  )
}
