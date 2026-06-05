import Header from '@/components/Header'
import CitiesExplorer from '@/components/CitiesExplorer'
import { getAllCitiesConfig } from '@/lib/data'
import { LOCALES, t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: { lang: Locale } }) {
  const { lang } = params
  return {
    title: `${t(lang, 'cities_explore_title')} | Medimapia`,
    description: t(lang, 'cities_explore_subtitle'),
  }
}

export default function CitiesPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params
  const cities = getAllCitiesConfig()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t(lang, 'cities_explore_title')}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t(lang, 'cities_explore_subtitle')} —{' '}
            <span className="font-medium text-slate-700">{cities.length}</span> cities
          </p>
        </div>

        <CitiesExplorer
          cities={cities}
          lang={lang}
          labels={{
            searchPlaceholder: t(lang, 'cities_search_placeholder'),
            regionAll: t(lang, 'cities_region_all'),
            regionEurope: t(lang, 'cities_region_europe'),
            regionAmericas: t(lang, 'cities_region_americas'),
            regionOceania: t(lang, 'cities_region_oceania'),
            noResults: t(lang, 'cities_no_results'),
          }}
        />
      </div>
    </div>
  )
}
