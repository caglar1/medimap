'use client'

import { useState } from 'react'
import { t } from '@/lib/i18n'
import type { Survey, Locale } from '@/lib/types'

const barColors = [
  'from-sky-400 to-sky-500',
  'from-emerald-400 to-emerald-500',
  'from-violet-400 to-violet-500',
  'from-amber-400 to-amber-500',
]

export default function SurveyBlock({ survey, lang }: { survey: Survey; lang: Locale }) {
  const [activeQ, setActiveQ] = useState(0)
  const question = survey.questions[activeQ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {t(lang, 'block2_title')}
        </h2>
        <p className="text-sm text-slate-500">
          <span className="text-2xl lg:text-3xl font-bold text-slate-900">
            {survey.total_responses.toLocaleString()}
          </span>{' '}
          {t(lang, 'responses_label')}
        </p>
      </div>

      {survey.questions.length > 1 && (
        <div className="flex gap-1.5">
          {survey.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setActiveQ(i)}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i === activeQ ? 'bg-sky-500' : 'bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-slate-700 leading-snug">
          {question.label[lang]}
        </p>

        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => (
            <div key={opt.key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-600 font-medium">{opt.label[lang]}</span>
                <span className="text-xs font-bold text-slate-700">{opt.percent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${barColors[i % barColors.length]} h-2.5 rounded-full transition-all duration-700`}
                  style={{ width: `${opt.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
        <button
          onClick={() => setActiveQ((p) => Math.max(0, p - 1))}
          disabled={activeQ === 0}
          className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {t(lang, 'btn_prev')}
        </button>
        <span className="text-xs text-slate-400">
          {activeQ + 1} / {survey.questions.length}
        </span>
        <button
          onClick={() => setActiveQ((p) => Math.min(survey.questions.length - 1, p + 1))}
          disabled={activeQ === survey.questions.length - 1}
          className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {t(lang, 'btn_next')}
        </button>
      </div>
    </div>
  )
}
