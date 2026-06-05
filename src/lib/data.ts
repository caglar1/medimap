import fs from 'fs'
import path from 'path'
import type { CityConfig, StateConfig, Disease, Facility, Locale, Survey } from './types'
import { haversineKm } from './utils'
import { ALL_DEPARTMENTS } from './departments'

const surveysData: Survey[] = require('../../data/surveys.json')

let _diseasesCache: Disease[] | null = null
function readDiseases(): Disease[] {
  if (_diseasesCache) return _diseasesCache
  const dir = path.join(process.cwd(), 'data/diseases')
  _diseasesCache = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')))
  return _diseasesCache
}

function readCitiesConfig(): CityConfig[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/config/cities.json'), 'utf-8'))
}
function readStatesConfig(): StateConfig[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/config/states.json'), 'utf-8'))
}
function readFacilities(): Facility[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/facilities.json'), 'utf-8'))
}

export function getAllCitiesConfig(): CityConfig[] {
  return readCitiesConfig()
}

export function getCityConfig(slug: string): CityConfig | null {
  return readCitiesConfig().find((c) => c.slug === slug) ?? null
}

export function getAllStatesConfig(): StateConfig[] {
  return readStatesConfig()
}

export function getStateConfig(slug: string): StateConfig | null {
  return readStatesConfig().find((s) => s.slug === slug) ?? null
}

export function getFacilitiesByCity(citySlug: string): Facility[] {
  const city = getCityConfig(citySlug)
  if (!city) return []
  const radius = city.radiusKm ?? 20
  return readFacilities().filter(
    (f) => haversineKm(city.lat, city.lon, f.lat, f.lng) <= radius
  )
}

export function getDiseasesForCity(citySlug: string): Disease[] {
  const cityFacilities = getFacilitiesByCity(citySlug)
  return readDiseases().filter((d) => {
    if (!d.routing_departments) return false
    return d.routing_departments.some((rd) =>
      cityFacilities.some((f) => facilitySupportsDepartment(f, rd.department_code))
    )
  })
}

export function getDepartmentsByCity(citySlug: string): { department: string; label: string; icon: string; facilityCount: number }[] {
  const cityFacilities = getFacilitiesByCity(citySlug)
  const deptFacilities: Record<string, Set<string>> = {}

  for (const facility of cityFacilities) {
    if (facility.type === 'hospital' || facility.departments?.includes('*')) {
      for (const deptCode of Object.keys(ALL_DEPARTMENTS)) {
        if (!deptFacilities[deptCode]) deptFacilities[deptCode] = new Set()
        deptFacilities[deptCode].add(facility.id)
      }
    } else {
      for (const deptCode of facility.departments ?? []) {
        if (ALL_DEPARTMENTS[deptCode]) {
          if (!deptFacilities[deptCode]) deptFacilities[deptCode] = new Set()
          deptFacilities[deptCode].add(facility.id)
        }
      }
    }
  }

  return Object.entries(deptFacilities)
    .map(([dept, facilitySet]) => ({
      department: dept,
      label: ALL_DEPARTMENTS[dept].label,
      icon: ALL_DEPARTMENTS[dept].icon,
      facilityCount: facilitySet.size,
    }))
    .sort((a, b) => b.facilityCount - a.facilityCount)
}

export function getDiseases(): Disease[] {
  return readDiseases()
}

export function getDiseaseBySlug(slug: string, lang: Locale): Disease | undefined {
  return readDiseases().find((d) => d.slug[lang] === slug)
}

export function facilitySupportsDepartment(facility: Facility, deptCode: string): boolean {
  if (facility.departments?.includes('*')) {
    return Object.keys(ALL_DEPARTMENTS).includes(deptCode);
  }
  return facility.departments?.includes(deptCode) || false;
}

export interface TieredFacilities {
  tier1: Facility[]
  tier2: Facility[]
  tier3: Facility[]
}

export function getTieredFacilitiesByDisease(diseaseId: string): TieredFacilities {
  const disease = readDiseases().find((d) => d.id === diseaseId)
  if (!disease || !disease.routing_departments) {
    return { tier1: [], tier2: [], tier3: [] }
  }

  const allFacilities = readFacilities()
  const primaryDept = disease.routing_departments.find(d => d.is_primary)
  const secondaryDepts = disease.routing_departments.filter(d => !d.is_primary)

  const tier1: Facility[] = []
  const tier2: Facility[] = []
  const tier3: Facility[] = []

  for (const facility of allFacilities) {
    const hasPrimary = primaryDept ? facilitySupportsDepartment(facility, primaryDept.department_code) : false;
    const hasAnySecondary = secondaryDepts.some(sd => facilitySupportsDepartment(facility, sd.department_code));

    if (hasPrimary && hasAnySecondary) {
      tier1.push(facility)
    } else if (hasPrimary) {
      tier2.push(facility)
    } else if (hasAnySecondary) {
      tier3.push(facility)
    }
  }

  const sortFunc = (a: Facility, b: Facility) => {
    if (a.claimed && !b.claimed) return -1
    if (!a.claimed && b.claimed) return 1
    if ((a.rating ?? 0) !== (b.rating ?? 0)) {
      return (b.rating ?? 0) - (a.rating ?? 0)
    }
    return a.name.localeCompare(b.name)
  }

  return {
    tier1: tier1.sort(sortFunc),
    tier2: tier2.sort(sortFunc),
    tier3: tier3.sort(sortFunc)
  }
}

export function getTieredFacilitiesByDiseaseAndCity(
  diseaseId: string,
  citySlug: string
): TieredFacilities {
  const disease = readDiseases().find((d) => d.id === diseaseId)
  if (!disease || !disease.routing_departments) {
    return { tier1: [], tier2: [], tier3: [] }
  }

  const cityFacilities = getFacilitiesByCity(citySlug)
  const primaryDept = disease.routing_departments.find(d => d.is_primary)
  const secondaryDepts = disease.routing_departments.filter(d => !d.is_primary)

  const tier1: Facility[] = []
  const tier2: Facility[] = []
  const tier3: Facility[] = []

  for (const facility of cityFacilities) {
    const hasPrimary = primaryDept ? facilitySupportsDepartment(facility, primaryDept.department_code) : false;
    const hasAnySecondary = secondaryDepts.some(sd => facilitySupportsDepartment(facility, sd.department_code));

    if (hasPrimary && hasAnySecondary) {
      tier1.push(facility)
    } else if (hasPrimary) {
      tier2.push(facility)
    } else if (hasAnySecondary) {
      tier3.push(facility)
    }
  }

  const sortFunc = (a: Facility, b: Facility) => {
    if (a.claimed && !b.claimed) return -1
    if (!a.claimed && b.claimed) return 1
    if ((a.rating ?? 0) !== (b.rating ?? 0)) {
      return (b.rating ?? 0) - (a.rating ?? 0)
    }
    return a.name.localeCompare(b.name)
  }

  return {
    tier1: tier1.sort(sortFunc),
    tier2: tier2.sort(sortFunc),
    tier3: tier3.sort(sortFunc)
  }
}

export function getFacilitiesByDisease(diseaseId: string): (Facility & { tier: number })[] {
  const tiered = getTieredFacilitiesByDisease(diseaseId)
  return [
    ...tiered.tier1.map(f => ({ ...f, tier: 1 })),
    ...tiered.tier2.map(f => ({ ...f, tier: 2 })),
    ...tiered.tier3.map(f => ({ ...f, tier: 3 })),
  ]
}

export function getFacilitiesByDiseaseAndCity(diseaseId: string, citySlug: string): Facility[] {
  const tiered = getTieredFacilitiesByDiseaseAndCity(diseaseId, citySlug)
  return [...tiered.tier1, ...tiered.tier2, ...tiered.tier3]
}

export function getFacilitiesByCountry(country: string): Facility[] {
  return readFacilities().filter((f) => f.country === country)
}

export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

export function getUniqueCities(): { name: string; slug: string }[] {
  return readCitiesConfig().map((c) => ({ name: c.name, slug: c.slug }))
}

export function getCityBySlug(slug: string): string | undefined {
  return getUniqueCities().find((c) => c.slug === slug)?.name
}

export function getSurveyByDisease(diseaseId: string): Survey | undefined {
  return surveysData.find((s) => s.disease_id === diseaseId)
}
