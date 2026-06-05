'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { t } from '@/lib/i18n'
import type { Locale, LocalizedString } from '@/lib/types'
import diseasesIndex from '../../data/diseases-index.json'

interface DiseaseItem {
  id: string
  slug: LocalizedString
  name: LocalizedString
  icd11_code: string
  category: string
  severity: string
  prevalence_percent: number
}

const DISEASES = diseasesIndex as DiseaseItem[]

interface Props {
  lang: Locale
  cityName: string
}

const categoryIcons: Record<string, string> = {
  cardiovascular: '❤️',
  metabolic: '🩺',
  infectious: '🦠',
  respiratory: '🫁',
  mental_health: '🧠',
}

const categoryDotColors: Record<string, string> = {
  cardiovascular: 'bg-red-400',
  metabolic: 'bg-amber-400',
  infectious: 'bg-purple-400',
  respiratory: 'bg-sky-400',
  mental_health: 'bg-emerald-400',
}

const categoryActiveChip: Record<string, string> = {
  cardiovascular: 'bg-red-500 text-white ring-2 ring-red-300 ring-offset-1',
  metabolic: 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-1',
  infectious: 'bg-purple-500 text-white ring-2 ring-purple-300 ring-offset-1',
  respiratory: 'bg-sky-500 text-white ring-2 ring-sky-300 ring-offset-1',
  mental_health: 'bg-emerald-500 text-white ring-2 ring-emerald-300 ring-offset-1',
}

const severityColors: Record<string, string> = {
  mild: 'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  severe: 'bg-red-100 text-red-700',
  variable: 'bg-slate-100 text-slate-600',
}

export default function CityDiseasesSection({ lang }: Props) {
  const diseases = DISEASES
  const [query, setQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [showCount, setShowCount] = useState(50)

  useEffect(() => {
    setShowCount(50)
  }, [query, selectedCat])

  const categories = useMemo(
    () => Array.from(new Set(diseases.map((d) => d.category))),
    [diseases]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return diseases.filter(
      (d) =>
        (!q || d.name[lang].toLowerCase().includes(q)) &&
        (!selectedCat || d.category === selectedCat)
    )
  }, [diseases, query, selectedCat, lang])

  const isIdle = query === '' && selectedCat === null
  const visible = filtered.slice(0, showCount)
  const remaining = filtered.length - showCount

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        {t(lang, 'city_diseases_section_title')}
      </h2>

      {/* Search bar */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(lang, 'city_diseases_search_placeholder')}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
            aria-label={t(lang, 'btn_clear')}
          >
            ×
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCat(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !selectedCat
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏥 {t(lang, 'filter_all')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat((prev) => (prev === cat ? null : cat))}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              selectedCat === cat
                ? (categoryActiveChip[cat] ?? 'bg-slate-500 text-white')
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {categoryIcons[cat]} {t(lang, `cat_${cat}`)}
          </button>
        ))}
      </div>

      {/* Results */}
      {isIdle ? (
        <div className="py-8 text-center">
          <p className="text-slate-400 text-sm">🔍 {t(lang, 'city_diseases_idle_prompt')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-slate-400 text-sm">{t(lang, 'city_diseases_no_results')}</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-2">
            {filtered.length} {filtered.length === 1 ? t(lang, 'disease_singular') : t(lang, 'disease_plural')}
          </p>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
            {visible.map((disease) => (
              <Link
                key={disease.id}
                href={`/${lang}/disease/${disease.slug[lang]}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 group transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${categoryDotColors[disease.category] ?? 'bg-slate-300'}`}
                />
                <span className="flex-1 text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">
                  {disease.name[lang]}
                </span>
                <span className="text-xs font-mono text-slate-400 shrink-0 hidden sm:block">
                  {disease.icd11_code}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${severityColors[disease.severity] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {t(lang, `severity_${disease.severity}`)}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>

          {remaining > 0 && (
            <button
              onClick={() => setShowCount((c) => c + 50)}
              className="w-full mt-3 py-2 text-xs text-sky-600 hover:text-sky-700 font-semibold transition-colors"
            >
              {t(lang, 'show_more_count').replace('{n}', String(Math.min(50, remaining)))}
            </button>
          )}
        </>
      )}
    </section>
  )
}
