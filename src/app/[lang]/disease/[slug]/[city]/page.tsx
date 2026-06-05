import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import DiseaseCard from '@/components/DiseaseCard'
import ClinicalRoutingCard from '@/components/ClinicalRoutingCard'
import SurveyBlock from '@/components/SurveyBlock'
import CityHealthStats from '@/components/CityHealthStats'
import Link from 'next/link'
import {
  getDiseaseBySlug,
  getDiseases,
  getFacilitiesByDiseaseAndCity,
  getSurveyByDisease,
  getUniqueCities,
  getCityBySlug,
  getCityConfig,
  getStateConfig,
  getTieredFacilitiesByDiseaseAndCity,
} from '@/lib/data'
import { LOCALES, t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { fetchCityHealthStats } from '@/lib/eurostat'
import { notFound } from 'next/navigation'

const FacilityMap = dynamic(() => import('@/components/FacilityMap'), { ssr: false })

export function generateStaticParams() {
  const diseases = getDiseases()
  const cities = getUniqueCities()

  return LOCALES.flatMap((lang) =>
    diseases.flatMap((disease) =>
      cities
        .filter((city) => getFacilitiesByDiseaseAndCity(disease.id, city.slug).length > 0)
        .map((city) => ({ lang, slug: disease.slug[lang], city: city.slug }))
    )
  )
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string; city: string }
}) {
  const disease = getDiseaseBySlug(params.slug, params.lang)
  const cityName = getCityBySlug(params.city)
  if (!disease || !cityName) return {}

  const title = `${disease.name[params.lang]} ${t(params.lang, 'in_city')} ${cityName} | Medimapia`
  return {
    title,
    description: `${t(params.lang, 'facilities_in')} ${cityName} — ${disease.summary[params.lang].slice(0, 130)}`,
    alternates: {
      canonical: `/${params.lang}/disease/${disease.slug[params.lang]}/${params.city}`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `/${l}/disease/${disease.slug[l]}/${params.city}`])
      ),
    },
  }
}

export default async function DiseaseByCity({
  params,
}: {
  params: { lang: Locale; slug: string; city: string }
}) {
  const { lang, slug, city: citySlug } = params
  const disease = getDiseaseBySlug(slug, lang)
  if (!disease) notFound()

  const cityName = getCityBySlug(citySlug)
  if (!cityName) notFound()

  const tiered = getTieredFacilitiesByDiseaseAndCity(disease.id, citySlug)
  const facilities = [
    ...tiered.tier1.map(f => ({ ...f, tier: 1 })),
    ...tiered.tier2.map(f => ({ ...f, tier: 2 })),
    ...tiered.tier3.map(f => ({ ...f, tier: 3 }))
  ]
  const survey = getSurveyByDisease(disease.id)

  const cityConfig = getCityConfig(citySlug)
  const stateForCity = cityConfig?.stateSlug ? getStateConfig(cityConfig.stateSlug) : null
  const cityStats = stateForCity ? await fetchCityHealthStats(stateForCity.name) : null

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} diseaseSlugMap={disease.slug} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href={`/${lang}`} className="hover:text-sky-500 transition-colors">
            {t(lang, 'nav_home')}
          </Link>
          <span>/</span>
          <Link
            href={`/${lang}/disease/${disease.slug[lang]}`}
            className="hover:text-sky-500 transition-colors"
          >
            {disease.name[lang]}
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{cityName}</span>
        </nav>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">
            {disease.name[lang]}{' '}
            <span className="text-slate-400 font-normal">{t(lang, 'in_city')}</span>{' '}
            {cityName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {facilities.length} {t(lang, 'facilities_in').toLowerCase()} {cityName}
          </p>
        </div>

        {/* Mobile jump link */}
        <a
          href="#map"
          className="lg:hidden inline-flex items-center gap-1.5 text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {t(lang, 'jump_to_map')}
        </a>

        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[57fr_43fr] gap-6">

          {/* Left: disease info + community stats + future stats placeholder */}
          <div className="flex flex-col gap-6">
            <DiseaseCard disease={disease} lang={lang} />
            <ClinicalRoutingCard disease={disease} lang={lang} />
            {survey && <SurveyBlock survey={survey} lang={lang} />}
            {/* TODO: disease statistics section */}
            <div id="disease-statistics" aria-hidden="true" />
          </div>

          {/* Right: map — sticky on desktop, anchor target on mobile */}
          <div id="map" className="lg:sticky lg:top-20 self-start scroll-mt-20">
            <FacilityMap initialFacilities={facilities} lang={lang} />
          </div>

        </div>

        {/* Eurostat city health profile — full width below grid */}
        {cityStats && (
          <div className="mt-6">
            <CityHealthStats stats={cityStats} disease={disease} lang={lang} />
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <Link
            href={`/${lang}/disease/${disease.slug[lang]}`}
            className="text-sm text-sky-500 hover:text-sky-600 hover:underline"
          >
            ← {t(lang, 'back_to_disease')}
          </Link>
          <p className="text-xs text-slate-400 text-center max-w-xl leading-relaxed">
            {t(lang, 'disclaimer')} |{' '}
            <a
              href={disease.medlineplus_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:underline"
            >
              {t(lang, 'source_medlineplus')}
            </a>{' '}
            | {t(lang, 'osm_attribution')}
          </p>
        </div>
      </div>
    </div>
  )
}
