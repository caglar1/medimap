'use client'

import { useState } from 'react'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

interface Props {
  left: React.ReactNode
  right: React.ReactNode
  lang: Locale
}

export default function DiseasePageLayout({ left, right, lang }: Props) {
  const [expanded, setExpanded] = useState(true)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="lg:hidden inline-flex items-center gap-1.5 text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors mb-4"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {expanded ? t(lang, 'map_hide') : t(lang, 'map_show')}
      </button>

      <div
        data-expanded={String(expanded)}
        className="grid grid-cols-1 gap-6
          lg:data-[expanded=true]:grid-cols-[57fr_43fr]
          lg:data-[expanded=false]:grid-cols-[1fr_44px]
          lg:transition-[grid-template-columns] lg:duration-300 lg:ease-in-out"
      >
        {/* Left column */}
        <div className="flex flex-col gap-6 min-w-0">
          {left}
        </div>

        {/* Right column */}
        <div id="map" className="scroll-mt-20 lg:sticky lg:top-20 self-start">
          <div className="flex flex-row items-stretch gap-2">

            {/* Vertical toggle handle — desktop only, always visible */}
            <button
              onClick={() => setExpanded(v => !v)}
              title={expanded ? t(lang, 'map_collapse') : t(lang, 'map_show')}
              className="hidden lg:flex flex-col items-center justify-center gap-3 w-9 flex-shrink-0 min-h-[280px]
                rounded-xl border border-slate-300 bg-slate-50 shadow
                text-slate-500 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-400
                transition-all duration-150 group"
            >
              {/* Arrow */}
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? '' : 'rotate-180'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>

              {/* Vertical label */}
              <span className="text-[11px] font-semibold [writing-mode:vertical-rl] rotate-180 tracking-widest uppercase leading-none">
                {t(lang, 'map_label')}
              </span>
            </button>

            {/* Map content — single instance for both mobile and desktop */}
            <div className={`flex-1 min-w-0 ${expanded ? '' : 'hidden'}`}>
              {right}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
