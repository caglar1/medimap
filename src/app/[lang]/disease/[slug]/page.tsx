import Header from '@/components/Header'
import DiseaseCard from '@/components/DiseaseCard'
import ClinicalRoutingCard from '@/components/ClinicalRoutingCard'
import SurveyBlock from '@/components/SurveyBlock'
import DiseaseFacilitySection from '@/components/DiseaseFacilitySection'
import DiseasePageLayout from '@/components/DiseasePageLayout'
import {
  getDiseaseBySlug,
  getDiseases,
  getFacilitiesByDisease,
  getFacilitiesByDiseaseAndCity,
  getSurveyByDisease,
  getAllCitiesConfig,
} from '@/lib/data'
import { LOCALES, t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { countryFlag } from '@/lib/utils'

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    getDiseases().map((d) => ({ lang, slug: d.slug[lang] }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string }
}) {
  const disease = getDiseaseBySlug(params.slug, params.lang)
  if (!disease) return {}
  return {
    title: `${disease.name[params.lang]} | Medimapia`,
    description: disease.summary[params.lang].slice(0, 160),
    alternates: {
      canonical: `/${params.lang}/disease/${disease.slug[params.lang]}`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `/${l}/disease/${disease.slug[l]}`])
      ),
    },
  }
}

export default function DiseasePage({
  params,
}: {
  params: { lang: Locale; slug: string }
}) {
  const { lang, slug } = params
  const disease = getDiseaseBySlug(slug, lang)
  if (!disease) notFound()

  const facilities = getFacilitiesByDisease(disease.id)
  const survey = getSurveyByDisease(disease.id)
  const citiesWithFacilities = getAllCitiesConfig()
    .map((city) => ({ ...city, facilityCount: getFacilitiesByDiseaseAndCity(disease.id, city.slug).length }))
    .filter((city) => city.facilityCount > 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} diseaseSlugMap={disease.slug} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href={`/${lang}`} className="hover:text-sky-500 transition-colors">
            {t(lang, 'nav_home')}
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{disease.name[lang]}</span>
        </nav>

        <DiseasePageLayout
          lang={lang}
          left={
            <>
              <DiseaseCard disease={disease} lang={lang} />
              <ClinicalRoutingCard disease={disease} lang={lang} />
              {survey && <SurveyBlock survey={survey} lang={lang} />}
              <div id="disease-statistics" aria-hidden="true" />
            </>
          }
          right={
            <DiseaseFacilitySection
              allFacilities={facilities}
              citiesWithFacilities={citiesWithFacilities}
              diseaseName={disease.name[lang]}
              lang={lang}
            />
          }
        />

        {/* Deep-link browse by city (static, for SEO + Eurostat stats) */}
        {citiesWithFacilities.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {t(lang, 'browse_cities')}
            </h2>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
              {citiesWithFacilities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${lang}/disease/${disease.slug[lang]}/${city.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600 transition-colors shadow-sm flex-shrink-0"
                >
                  <span className="text-base leading-none">{countryFlag(city.country)}</span>
                  <span>{city.name}</span>
                  <span className="text-xs text-slate-400">{city.countryName}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
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
