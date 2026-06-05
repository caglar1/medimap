'use client'

import { useRouter, usePathname } from 'next/navigation'
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n'
import type { Locale } from '@/lib/types'

type SlugMap = Record<Locale, string>

export default function LanguageSwitcher({
  currentLang,
  diseaseSlugMap,
}: {
  currentLang: Locale
  diseaseSlugMap?: SlugMap
}) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLang = e.target.value as Locale
    const segments = pathname.split('/')

    if (diseaseSlugMap) {
      const diseaseIndex = segments.indexOf('disease')
      if (diseaseIndex !== -1 && segments[diseaseIndex + 1]) {
        segments[diseaseIndex + 1] = diseaseSlugMap[newLang]
      }
    }

    segments[1] = newLang
    router.push(segments.join('/'))
  }

  return (
    <select
      value={currentLang}
      onChange={handleChange}
      className="bg-slate-800 text-white text-sm rounded-lg px-3 py-1.5 border border-slate-600 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer transition-colors"
    >
      {LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  )
}
