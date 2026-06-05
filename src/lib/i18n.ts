import type { Locale } from './types'

export const LOCALES: Locale[] = ['en', 'de', 'es']

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
}

const dicts: Record<string, Record<string, string>> = {
  en: require('../locales/en.json'),
  de: require('../locales/de.json'),
  es: require('../locales/es.json'),
}

export function t(locale: Locale, key: string): string {
  return dicts[locale]?.[key] ?? dicts['en']?.[key] ?? key
}
