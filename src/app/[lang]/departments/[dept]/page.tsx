import Link from 'next/link'
import Header from '@/components/Header'
import { ALL_DEPARTMENTS, getDepartmentBySlug, getSectionForDepartment } from '@/lib/departments'
import { getDiseases } from '@/lib/data'
import { LOCALES, t } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    Object.values(ALL_DEPARTMENTS).map((info) => ({ lang, dept: info.slug }))
  )
}

export async function generateMetadata({ params }: { params: { lang: Locale; dept: string } }) {
  const found = getDepartmentBySlug(params.dept)
  if (!found) return {}
  return {
    title: `${found.info.label} | Medimapia`,
    alternates: {
      canonical: `/${params.lang}/departments/${params.dept}`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `/${l}/departments/${params.dept}`])
      ),
    },
  }
}

export default function DepartmentPage({ params }: { params: { lang: Locale; dept: string } }) {
  const { lang } = params
  const found = getDepartmentBySlug(params.dept)
  if (!found) notFound()

  const { code, info: dept } = found
  const section = getSectionForDepartment(code)
  const allDiseases = getDiseases()

  const primaryDiseases = allDiseases.filter((d) =>
    d.routing_departments?.some((rd) => rd.department_code === code && rd.is_primary)
  )
  const supportingDiseases = allDiseases.filter((d) =>
    d.routing_departments?.some((rd) => rd.department_code === code && !rd.is_primary)
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-2">
          <Link
            href={`/${lang}/departments`}
            className="text-sm text-slate-500 hover:text-sky-600 transition-colors"
          >
            ← {t(lang, 'nav_departments')}
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl leading-none">{dept.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t(lang, `dept_${dept.slug.replace(/-/g, '_')}`)}</h1>
              {section && (
                <p className="text-sm text-slate-500 mt-0.5">{t(lang, section)}</p>
              )}
            </div>
          </div>
        </div>

        {primaryDiseases.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {t(lang, 'dept_primary_for')}
            </h2>
            <div className="grid gap-2">
              {primaryDiseases.map((disease) => {
                const role = disease.routing_departments?.find(
                  (rd) => rd.department_code === code && rd.is_primary
                )?.clinical_role[lang]
                return (
                  <Link
                    key={disease.id}
                    href={`/${lang}/disease/${disease.slug[lang]}`}
                    className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-slate-200 hover:border-sky-400 hover:shadow-sm transition-all group"
                  >
                    <span className="font-medium text-slate-800 group-hover:text-sky-600">
                      {disease.name[lang]}
                    </span>
                    {role && (
                      <span className="text-xs text-slate-400 ml-4 shrink-0">{role}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {supportingDiseases.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {t(lang, 'dept_supporting_for')}
            </h2>
            <div className="grid gap-2">
              {supportingDiseases.map((disease) => {
                const role = disease.routing_departments?.find(
                  (rd) => rd.department_code === code && !rd.is_primary
                )?.clinical_role[lang]
                return (
                  <Link
                    key={disease.id}
                    href={`/${lang}/disease/${disease.slug[lang]}`}
                    className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-slate-200 hover:border-slate-300 transition-all group"
                  >
                    <span className="text-slate-600 group-hover:text-slate-800">
                      {disease.name[lang]}
                    </span>
                    {role && (
                      <span className="text-xs text-slate-400 ml-4 shrink-0">{role}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {primaryDiseases.length === 0 && supportingDiseases.length === 0 && (
          <p className="text-slate-400 text-sm">{t(lang, 'dept_no_diseases')}</p>
        )}
      </div>
    </div>
  )
}
