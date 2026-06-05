export type Locale = 'en' | 'de' | 'es'

export interface StateConfig {
  name: string
  slug: string
  country: string
  countryName: string
  region: 'europe' | 'americas' | 'oceania'
  eurostatGeo: string | null
  eurostatRegionLabel: string | null
  wikidataId?: string
  stateAdminLevel?: number
  cityAdminLevel?: number
  parentSlug?: string | null
}

export interface CityConfig {
  name: string
  slug: string
  country: string
  countryName: string
  region: 'europe' | 'americas' | 'oceania'
  lat: number
  lon: number
  radiusKm: number
  stateSlug: string | null
  source: 'manual' | 'auto'
  coordsLocked: boolean
  osm_id: number | null
}

// Keyed by every Locale and required at the type level so existing consumers
// (e.g. `disease.name[lang].toLowerCase()`) stay sound under strict mode.
// A 4th language only needs adding to `Locale`; JSON content is read via fs
// (not statically validated), and missing translations are surfaced at runtime
// by `scripts/check-i18n.js` plus the `t()` fallback chain.
export type LocalizedString = Record<Locale, string>
export type LocalizedStringArray = Record<Locale, string[]>

export interface SurveyOption {
  key: string
  label: LocalizedString
  percent: number
}

export interface SurveyQuestion {
  id: string
  label: LocalizedString
  options: SurveyOption[]
}

export interface Survey {
  disease_id: string
  total_responses: number
  questions: SurveyQuestion[]
}

export interface DiseaseRoutingDepartment {
  department_code: string
  is_primary: boolean
  clinical_role: LocalizedString
}

export interface Disease {
  id: string
  slug: LocalizedString
  icd11_code: string
  medlineplus_url: string
  category: string
  severity: string
  prevalence_percent: number
  tags: string[]
  name: LocalizedString
  summary: LocalizedString
  symptoms: LocalizedStringArray
  routing_departments?: DiseaseRoutingDepartment[]
}

export interface CityHealthStats {
  city: string
  year: number | null
  lifeExpectancy: {
    total: number | null
    male: number | null
    female: number | null
  }
  hospitalBedsPer100k: number | null
  povertyRate: number | null
  population65Plus: number | null
  causeOfDeathRates: Record<string, number | null>
  source: 'eurostat'
  eurostatGeo: string
  regionLabel: string | null
}

export interface Facility {
  id: string
  osm_id: string | null
  claimed: boolean
  name: string
  type: 'hospital' | 'clinic' | 'pharmacy' | 'doctors' | 'health_centre'
  city: string
  country: string
  lat: number
  lng: number
  address: string
  phone?: string
  website?: string
  languages: string[]
  rating: number | null
  open_24h: boolean
  specialities?: string[]
  departments?: string[]
  emergency?: boolean
  amenity?: string
  healthcare?: string
  brand?: string
  email?: string
  operator?: string
  operator_type?: string
  operational_status?: string
  opening_hours?: string
  beds?: number
  staff_doctors?: number
  staff_nurses?: number
  equipment?: string[]
  dispensing?: boolean
  insurance?: string
  wheelchair?: 'yes' | 'no' | 'limited'
  check_date?: string
  source?: string
}
