import Link from 'next/link'
import Header from '@/components/Header'
import { ALL_DEPARTMENTS, DEPARTMENT_SECTIONS } from '@/lib/departments'
import { LOCALES, t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: { lang: Locale } }) {
  const { lang } = params
  return {
    title: `${t(lang, 'nav_departments')} | Medimapia`,
  }
}

export default function DepartmentsPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params

  const assignedCodes = new Set(DEPARTMENT_SECTIONS.flatMap((s) => s.codes))
  const unassignedCodes = Object.keys(ALL_DEPARTMENTS).filter((c) => !assignedCodes.has(c))

  const sections = [
    ...DEPARTMENT_SECTIONS,
    ...(unassignedCodes.length > 0 ? [{ title: 'Other', titleKey: 'dept_sec_other', codes: unassignedCodes }] : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            {t(lang, 'nav_departments')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t(lang, 'dept_page_subtitle')
              .replace('{count}', String(Object.keys(ALL_DEPARTMENTS).length))
              .replace('{cats}', String(DEPARTMENT_SECTIONS.length))}
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {t(lang, section.titleKey)}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {section.codes.map((code) => {
                  const dept = ALL_DEPARTMENTS[code]
                  if (!dept) return null
                  return (
                    <Link
                      key={code}
                      href={`/${lang}/departments/${ALL_DEPARTMENTS[code]?.slug ?? code}`}
                      className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-slate-200 hover:border-sky-400 hover:shadow-sm transition-all group"
                    >
                      <span className="text-2xl leading-none">{dept.icon}</span>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-sky-600 leading-tight">
                        {t(lang, `dept_${dept.slug.replace(/-/g, '_')}`)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
