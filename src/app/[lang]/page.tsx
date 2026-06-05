import Link from 'next/link'
import Header from '@/components/Header'
import { getDiseases } from '@/lib/data'
import { t, LOCALES } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

const categoryIcons: Record<string, string> = {
  cardiovascular: '❤️',
  metabolic: '🩺',
  infectious: '🦠',
  respiratory: '🫁',
  mental_health: '🧠',
}

const categoryGradients: Record<string, string> = {
  cardiovascular: 'from-red-50 to-red-100 border-red-200 hover:border-red-300',
  metabolic: 'from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300',
  infectious: 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300',
  respiratory: 'from-sky-50 to-sky-100 border-sky-200 hover:border-sky-300',
  mental_health: 'from-emerald-50 to-emerald-100 border-emerald-200 hover:border-emerald-300',
}

export default function HomePage({ params }: { params: { lang: Locale } }) {
  const { lang } = params
  const diseases = getDiseases()
  const categories = Array.from(new Set(diseases.map((d) => d.category)))

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} />

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-sky-500/30">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            {t(lang, 'hero_badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            {t(lang, 'hero_title')}
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            {t(lang, 'hero_subtitle')}
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{diseases.length}</span>
              <span>{t(lang, 'hero_stat_diseases')}</span>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">3</span>
              <span>{t(lang, 'hero_stat_languages')}</span>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{t(lang, 'hero_stat_live')}</span>
              <span>{t(lang, 'hero_stat_osm')}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.map((cat) => {
          const catDiseases = diseases.filter((d) => d.category === cat)
          const catKey = `cat_${cat}` as Parameters<typeof t>[1]
          return (
            <div key={cat} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{categoryIcons[cat] ?? '🏥'}</span>
                <h2 className="text-xl font-bold text-slate-800">{t(lang, catKey)}</h2>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catDiseases.map((disease) => (
                  <Link
                    key={disease.id}
                    href={`/${lang}/disease/${disease.slug[lang]}`}
                    className={`group bg-gradient-to-br ${categoryGradients[cat] ?? 'from-slate-50 to-slate-100 border-slate-200'} border rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-slate-900 leading-tight">
                        {disease.name[lang]}
                      </h3>
                      <span className="text-xs font-mono bg-white/60 text-slate-500 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {disease.icd11_code}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {disease.summary[lang]}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        ~{disease.prevalence_percent}% worldwide
                      </span>
                      <span className="text-xs font-semibold text-sky-600 group-hover:text-sky-700 flex items-center gap-1">
                        {t(lang, 'view_disease')} →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-xs">
        <p>{t(lang, 'disclaimer')}</p>
        <p className="mt-2">{t(lang, 'osm_attribution')} · {t(lang, 'source_medlineplus')}</p>
      </footer>
    </div>
  )
}
