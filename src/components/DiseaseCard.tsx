import { t } from '@/lib/i18n'
import type { Disease, Locale } from '@/lib/types'

const categoryColors: Record<string, string> = {
  cardiovascular: 'bg-red-100 text-red-700',
  metabolic: 'bg-amber-100 text-amber-700',
  infectious: 'bg-purple-100 text-purple-700',
  respiratory: 'bg-sky-100 text-sky-700',
  mental_health: 'bg-emerald-100 text-emerald-700',
}

const severityColors: Record<string, string> = {
  mild: 'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  severe: 'bg-red-100 text-red-700',
  variable: 'bg-slate-100 text-slate-600',
}

export default function DiseaseCard({ disease, lang }: { disease: Disease; lang: Locale }) {
  const catKey = `cat_${disease.category}` as const
  const sevKey = `severity_${disease.severity}` as const

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColors[disease.category] ?? 'bg-slate-100 text-slate-600'}`}>
            {t(lang, catKey)}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${severityColors[disease.severity] ?? 'bg-slate-100 text-slate-600'}`}>
            {t(lang, sevKey)}
          </span>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-lg whitespace-nowrap">
          {t(lang, 'icd_code')} {disease.icd11_code}
        </span>
      </div>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight mb-1">
          {disease.name[lang]}
        </h1>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            ~{disease.prevalence_percent}% {t(lang, 'affected_worldwide')}
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-sky-400 to-emerald-500 h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(disease.prevalence_percent * 3, 100)}%` }}
        />
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {t(lang, 'block1_title')}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {disease.summary[lang]}
        </p>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {t(lang, 'symptoms_title')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {disease.symptoms[lang].map((symptom) => (
            <span
              key={symptom}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100"
            >
              {symptom}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold">{t(lang, 'source_label')}</span>{' '}
          <a
            href={disease.medlineplus_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-500 hover:text-sky-600 hover:underline"
          >
            {t(lang, 'source_medlineplus')}
          </a>
        </p>
        <p className="text-xs text-slate-400 mt-1">{t(lang, 'disclaimer')}</p>
      </div>
    </div>
  )
}
