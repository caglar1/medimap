'use client'

import { t } from '@/lib/i18n'
import type { Disease, Locale } from '@/lib/types'
import { getDepartmentByCode } from '@/lib/departments'
import { useState } from 'react'

export default function ClinicalRoutingCard({ disease, lang }: { disease: Disease; lang: Locale }) {
  const [showLegend, setShowLegend] = useState(false)

  if (!disease.routing_departments || disease.routing_departments.length === 0) {
    return null
  }

  const primaryDept = disease.routing_departments.find((d) => d.is_primary)
  const secondaryDepts = disease.routing_departments.filter((d) => !d.is_primary)

  // Resolve primary department details
  const primaryDeptInfo = primaryDept ? getDepartmentByCode(primaryDept.department_code) : null
  const primaryLabel = primaryDeptInfo?.label ?? primaryDept?.department_code ?? ''
  const primaryIcon = primaryDeptInfo?.icon ?? '🩺'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/10 to-emerald-50/5 p-6 shadow-md transition-all duration-300 hover:shadow-lg">
      {/* Decorative top indicator */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-emerald-400" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 shadow-inner">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight leading-none mb-1">
              {t(lang, 'clinical_pathway')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {t(lang, 'clinical_pathway_subtitle')}
            </p>
          </div>
        </div>

        {/* Legend Button */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-100 text-slate-500 hover:border-sky-200 hover:text-sky-600 hover:bg-sky-50/30 transition-all duration-200 shadow-sm"
        >
          <span>{t(lang, 'tier_fit_legend')}</span>
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${showLegend ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Tier Legend Drawer */}
      {showLegend && (
        <div className="mb-6 rounded-xl border border-sky-100 bg-white/80 p-4 backdrop-blur-sm shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
            <span className="text-sky-500">🛡️</span> {t(lang, 'tier_fit_legend')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-emerald-50/50 border border-emerald-100/50 p-2.5">
              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold mb-1">
                {t(lang, 'tier_1_perfect')}
              </span>
              <p className="text-slate-500 font-medium leading-normal">{t(lang, 'tier_1_perfect_desc')}</p>
            </div>
            <div className="rounded-lg bg-sky-50/50 border border-sky-100/50 p-2.5">
              <span className="inline-block px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold mb-1">
                {t(lang, 'tier_2_core')}
              </span>
              <p className="text-slate-500 font-medium leading-normal">{t(lang, 'tier_2_core_desc')}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-2.5">
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold mb-1">
                {t(lang, 'tier_3_support')}
              </span>
              <p className="text-slate-500 font-medium leading-normal">{t(lang, 'tier_3_support_desc')}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 text-center italic">
            💡 {t(lang, 'general_hospital_note')}
          </p>
        </div>
      )}

      {/* Pathways Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Primary Department */}
        {primaryDept && (
          <div className="flex flex-col gap-3.5 rounded-xl border border-sky-100/60 bg-sky-50/20 p-4 transition-all duration-200 hover:bg-sky-50/40">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none" role="img" aria-label={primaryLabel}>
                  {primaryIcon}
                </span>
                <div>
                  <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest block leading-none mb-1">
                    {t(lang, 'primary_contact')}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{primaryLabel}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-white shadow-sm uppercase tracking-wide">
                {t(lang, 'tier_badge_core')}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 italic leading-normal">
              {t(lang, 'primary_contact_desc')}
            </p>

            <div className="pt-2.5 border-t border-sky-100/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t(lang, 'clinical_role_label')}
              </span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {primaryDept.clinical_role[lang]}
              </p>
            </div>
          </div>
        )}

        {/* Co-Consulting / Secondary Departments */}
        {secondaryDepts.length > 0 && (
          <div className="flex flex-col gap-3.5 rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-sky-100 hover:shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block leading-none mb-1">
                  {t(lang, 'co_consulting')}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {secondaryDepts.length} {secondaryDepts.length === 1 ? t(lang, 'speciality_singular') : t(lang, 'speciality_plural')}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm uppercase tracking-wide">
                {t(lang, 'tier_badge_supporting')}
              </span>
            </div>

            <p className="text-xs text-slate-400 italic leading-normal">
              {t(lang, 'co_consulting_desc')}
            </p>

            {/* List of secondary departments */}
            <div className="flex flex-col gap-3.5 pt-2.5 border-t border-slate-100">
              {secondaryDepts.map((sd) => {
                const info = getDepartmentByCode(sd.department_code)
                const label = info?.label ?? sd.department_code
                const icon = info?.icon ?? '🩺'
                return (
                  <div key={sd.department_code} className="flex flex-col gap-1.5 last:mb-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg leading-none" role="img" aria-label={label}>
                        {icon}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{label}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed pl-6">
                      {sd.clinical_role[lang]}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
