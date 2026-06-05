import Link from 'next/link'
import Header from '@/components/Header'
import { ALL_DEPARTMENTS, DEPARTMENT_SECTIONS } from '@/lib/departments'
import { LOCALES, t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

const SECTION_COLORS: Record<string, {
  border: string
  bg: string
  hoverBorder: string
  hoverBg: string
  bar: string
  badge: string
  badgeText: string
}> = {
  'Hospital: Emergency & First Contact':      { border: 'border-red-100',    bg: 'bg-white', hoverBorder: 'hover:border-red-300',    hoverBg: 'hover:bg-red-50',    bar: 'bg-red-500',    badge: 'bg-red-100',    badgeText: 'text-red-700' },
  'Hospital: Organ & System Specialties':     { border: 'border-sky-100',    bg: 'bg-white', hoverBorder: 'hover:border-sky-300',    hoverBg: 'hover:bg-sky-50',    bar: 'bg-sky-500',    badge: 'bg-sky-100',    badgeText: 'text-sky-700' },
  'Hospital: Sensory Organs & Skin':          { border: 'border-violet-100', bg: 'bg-white', hoverBorder: 'hover:border-violet-300', hoverBg: 'hover:bg-violet-50', bar: 'bg-violet-500', badge: 'bg-violet-100', badgeText: 'text-violet-700' },
  'Hospital: Musculoskeletal':                { border: 'border-amber-100',  bg: 'bg-white', hoverBorder: 'hover:border-amber-300',  hoverBg: 'hover:bg-amber-50',  bar: 'bg-amber-500',  badge: 'bg-amber-100',  badgeText: 'text-amber-700' },
  "Hospital: Genitourinary & Women's Health": { border: 'border-teal-100',   bg: 'bg-white', hoverBorder: 'hover:border-teal-300',   hoverBg: 'hover:bg-teal-50',   bar: 'bg-teal-500',   badge: 'bg-teal-100',   badgeText: 'text-teal-700' },
  'Hospital: Systemic & Immune Disorders':    { border: 'border-emerald-100',bg: 'bg-white', hoverBorder: 'hover:border-emerald-300',hoverBg: 'hover:bg-emerald-50',bar: 'bg-emerald-500',badge: 'bg-emerald-100',badgeText: 'text-emerald-700' },
  'Hospital: Support & Special Services':     { border: 'border-slate-200',  bg: 'bg-white', hoverBorder: 'hover:border-slate-400',  hoverBg: 'hover:bg-slate-50',  bar: 'bg-slate-500',  badge: 'bg-slate-100',  badgeText: 'text-slate-700' },
  'Independent Centers & Therapies':          { border: 'border-indigo-100', bg: 'bg-white', hoverBorder: 'hover:border-indigo-300', hoverBg: 'hover:bg-indigo-50', bar: 'bg-indigo-500', badge: 'bg-indigo-100', badgeText: 'text-indigo-700' },
  'Aesthetic & Plastic Surgery':              { border: 'border-pink-100',   bg: 'bg-white', hoverBorder: 'hover:border-pink-300',   hoverBg: 'hover:bg-pink-50',   bar: 'bg-pink-500',   badge: 'bg-pink-100',   badgeText: 'text-pink-700' },
  'Dentistry':                                { border: 'border-yellow-100', bg: 'bg-white', hoverBorder: 'hover:border-yellow-300', hoverBg: 'hover:bg-yellow-50', bar: 'bg-yellow-500', badge: 'bg-yellow-100', badgeText: 'text-yellow-700' },
  'Traditional & Complementary Medicine':     { border: 'border-green-100',  bg: 'bg-white', hoverBorder: 'hover:border-green-300',  hoverBg: 'hover:bg-green-50',  bar: 'bg-green-500',  badge: 'bg-green-100',  badgeText: 'text-green-700' },
  'Other':                                    { border: 'border-slate-200',  bg: 'bg-white', hoverBorder: 'hover:border-slate-400',  hoverBg: 'hover:bg-slate-50',  bar: 'bg-slate-400',  badge: 'bg-slate-100',  badgeText: 'text-slate-600' },
}

const DEFAULT_COLOR = SECTION_COLORS['Other']

export default function Departments2Page({ params }: { params: { lang: Locale } }) {
  const { lang } = params
  const totalDepts = Object.keys(ALL_DEPARTMENTS).length

  const assignedCodes = new Set(DEPARTMENT_SECTIONS.flatMap((s) => s.codes))
  const unassignedCodes = Object.keys(ALL_DEPARTMENTS).filter((c) => !assignedCodes.has(c))

  const sections = [
    ...DEPARTMENT_SECTIONS,
    ...(unassignedCodes.length > 0 ? [{ title: 'Other', codes: unassignedCodes }] : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 px-4 py-1.5 rounded-full border border-sky-500/30 text-sm font-medium mb-5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Medical Departments
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              Find the Right<br />
              <span className="text-sky-400">Medical Department</span>
            </h1>
            <p className="text-slate-400 text-base mb-8">
              Explore all clinical departments, independent centers, and specialty clinics.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold text-white">{totalDepts}</p>
                <p className="text-xs text-slate-400 mt-0.5">Departments</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-white">{DEPARTMENT_SECTIONS.length}</p>
                <p className="text-xs text-slate-400 mt-0.5">Categories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {sections.map((section) => {
          const colors = SECTION_COLORS[section.title] ?? DEFAULT_COLOR
          return (
            <div key={section.title}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-1 h-6 rounded-full ${colors.bar}`} />
                <h2 className="text-base font-bold text-slate-800">{section.title}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge} ${colors.badgeText}`}>
                  {section.codes.length}
                </span>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {section.codes.map((code) => {
                  const dept = ALL_DEPARTMENTS[code]
                  if (!dept) return null
                  return (
                    <Link
                      key={code}
                      href={`/${lang}/departments/${ALL_DEPARTMENTS[code]?.slug ?? code}`}
                      className={`flex flex-col items-center gap-2 ${colors.bg} rounded-2xl p-4 border-2 ${colors.border} ${colors.hoverBorder} ${colors.hoverBg} hover:shadow-md hover:-translate-y-1 transition-all text-center group`}
                    >
                      <span className="text-3xl leading-none">{dept.icon}</span>
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 leading-tight">
                        {dept.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
