'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { t } from '@/lib/i18n'
import type { Facility, Locale } from '@/lib/types'

const FacilityMap = dynamic(() => import('./FacilityMap'), { ssr: false })

interface Department {
  department: string
  label: string
  icon: string
  facilityCount: number
}

interface Props {
  departments: Department[]
  allFacilities: Facility[]
  lang: Locale
  cityLabel: string
  geoFacilities?: Facility[]
  geoCountry?: string
  labels: {
    healthSpecialties: string
    facilities: string
    showMore: string
    showLess: string
  }
}

function matchesDepartment(f: Facility, departmentCode: string): boolean {
  const depts = f.departments ?? []
  if (depts.includes('*')) return true
  return depts.includes(departmentCode)
}

const INITIAL_CHIPS = 5

export default function CitySpecialitiesFilter({ departments, allFacilities, lang, cityLabel, geoFacilities, geoCountry, labels }: Props) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const activeFacilities = useMemo(
    () =>
      selectedDept
        ? allFacilities.filter((f) => matchesDepartment(f, selectedDept))
        : allFacilities,
    [selectedDept, allFacilities]
  )

  const visibleDepartments = showAll ? departments : departments.slice(0, INITIAL_CHIPS)
  const hiddenCount = departments.length - INITIAL_CHIPS

  if (departments.length === 0) {
    return (
      <div className="mb-6">
        <FacilityMap initialFacilities={allFacilities} lang={lang} activeLabel={cityLabel} geoFacilities={geoFacilities} geoCountry={geoCountry} hideLegend />
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-col lg:flex-row lg:items-start gap-4">

      {/* Chips sidebar — sticky on desktop */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:w-[260px] lg:flex-shrink-0 lg:sticky lg:top-20 lg:self-start">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          {labels.healthSpecialties}
        </h2>

        <div className="flex flex-wrap gap-2">
          {/* All button */}
          <button
            onClick={() => setSelectedDept(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${
              selectedDept === null
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🏥 {t(lang, 'filter_all')}
          </button>

          {/* Department chips */}
          {visibleDepartments.map((dept) => (
            <button
              key={dept.department}
              onClick={() =>
                setSelectedDept((prev) => (prev === dept.department ? null : dept.department))
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${
                selectedDept === dept.department
                  ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300 ring-offset-1'
                  : 'bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <span>{dept.icon}</span>
              <span>{dept.label}</span>
              <span
                className={`text-xs ${
                  selectedDept === dept.department ? 'text-sky-100' : 'text-slate-400'
                }`}
              >
                ×{dept.facilityCount}
              </span>
            </button>
          ))}

          {/* Show more/less */}
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm text-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-colors min-h-[40px]"
            >
              {showAll ? labels.showLess : `+${hiddenCount} ${labels.showMore}`}
            </button>
          )}
        </div>

        {/* Active filter indicator */}
        {selectedDept && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-sky-600">
            <span>
              {activeFacilities.length} {labels.facilities} ·{' '}
              <strong>{departments.find((d) => d.department === selectedDept)?.label}</strong>
            </span>
            <button
              onClick={() => setSelectedDept(null)}
              className="ml-auto text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Facility map — takes remaining space */}
      <div className="lg:flex-1">
        <FacilityMap
          initialFacilities={allFacilities}
          activeFacilities={activeFacilities}
          activeLabel={cityLabel}
          geoFacilities={geoFacilities}
          geoCountry={geoCountry}
          lang={lang}
          hideLegend
        />
      </div>

    </div>
  )
}
