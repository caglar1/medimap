import path from 'path'
import fs from 'fs'
import type { CityConfig, StateConfig } from './types'

const BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data'

const CATEGORY_TO_CAUSE: Record<string, string> = {
  cardiovascular: 'I',
  metabolic: 'E10_E14',
  respiratory: 'J',
  mental_health: 'F',
  infectious: 'J',
}

export function getCauseCode(diseaseCategory: string): string | null {
  return CATEGORY_TO_CAUSE[diseaseCategory] ?? null
}

export type { CityConfig, StateConfig }

export function getCities(): CityConfig[] {
  const filePath = path.join(process.cwd(), 'data/config/cities.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function getStates(): StateConfig[] {
  const filePath = path.join(process.cwd(), 'data/config/states.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
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

interface EurostatCache {
  [city: string]: {
    data: CityHealthStats
    updatedAt: string
  }
}

function readEurostatCache(): EurostatCache {
  const filePath = path.join(process.cwd(), 'data/cache/eurostat.json')
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return {}
  }
}

function extractValue(data: Record<string, unknown>, geo: string): number | null {
  try {
    const dimension = data.dimension as Record<string, { category: { index: Record<string, number> } }>
    const value = data.value as Record<string, number>

    const geoIndex = dimension?.geo?.category?.index?.[geo]
    if (geoIndex === undefined) return null

    const entries = Object.entries(value)
    if (entries.length === 0) return null

    const size = data.size as number[]
    const id = data.id as string[]

    const timeIdx = id.indexOf('time')
    const geoIdx = id.indexOf('geo')

    if (timeIdx === -1 || geoIdx === -1) return null

    const timeSize = size[timeIdx]
    const geoSize = size[geoIdx]

    for (let t = 0; t < timeSize; t++) {
      const idx = geoIdx > timeIdx
        ? t * geoSize + geoIndex
        : geoIndex * timeSize + t

      if (value[String(idx)] !== undefined && value[String(idx)] !== null) {
        return value[String(idx)]
      }
    }

    return null
  } catch {
    return null
  }
}

export async function fetchEurostatIndicator(
  dataset: string,
  geo: string,
  filters: Record<string, string> = {}
): Promise<{ value: number | null; year: number | null }> {
  try {
    const params = new URLSearchParams({
      geo,
      format: 'JSON',
      lang: 'EN',
      ...filters,
    })

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(`${BASE}/${dataset}?${params.toString()}`, {
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!res.ok) return { value: null, year: null }

    const data = await res.json()

    const timeDim = (data.dimension as Record<string, { category: { index: Record<string, number> } }>)?.time?.category?.index
    const years = timeDim ? Object.keys(timeDim).sort().reverse() : []
    const latestYear = years[0] ? parseInt(years[0]) : null

    const value = extractValue(data, geo)

    return { value, year: latestYear }
  } catch {
    return { value: null, year: null }
  }
}

export async function fetchStatsForGeo(
  cityName: string,
  geo: string,
  regionLabel: string | null
): Promise<CityHealthStats> {
  const [lifeExpMale, lifeExpFemale, hospitalBeds, povertyRate, pop65] = await Promise.all([
    fetchEurostatIndicator('demo_r_mlifexp', geo, { sex: 'M', age: 'Y_LT1' }),
    fetchEurostatIndicator('demo_r_mlifexp', geo, { sex: 'F', age: 'Y_LT1' }),
    fetchEurostatIndicator('hlth_rs_bdsrg2', geo),
    fetchEurostatIndicator('tgs00103', geo),
    fetchEurostatIndicator('demo_r_pjangrp3', geo, { age: 'Y_GE65', sex: 'T' }),
  ])

  const causes = ['I', 'E10_E14', 'J', 'F']
  const causeResults = await Promise.all(
    causes.map((cause) =>
      fetchEurostatIndicator('hlth_cd_acdr2', geo, { icd10: cause, sex: 'T', unit: 'RT' })
    )
  )

  const causeOfDeathRates: Record<string, number | null> = {}
  causes.forEach((cause, i) => {
    causeOfDeathRates[cause] = causeResults[i].value
  })

  const representativeYear = lifeExpMale.year ?? lifeExpFemale.year ?? hospitalBeds.year ?? null

  const totalLE =
    lifeExpMale.value !== null && lifeExpFemale.value !== null
      ? Math.round(((lifeExpMale.value + lifeExpFemale.value) / 2) * 10) / 10
      : null

  return {
    city: cityName,
    year: representativeYear,
    lifeExpectancy: {
      total: totalLE,
      male: lifeExpMale.value,
      female: lifeExpFemale.value,
    },
    hospitalBedsPer100k: hospitalBeds.value,
    povertyRate: povertyRate.value,
    population65Plus: pop65.value,
    causeOfDeathRates,
    source: 'eurostat',
    eurostatGeo: geo,
    regionLabel,
  }
}

// Cache-first: önce JSON cache'e bakar, yoksa state üzerinden canlı çeker
export async function fetchCityHealthStats(city: string): Promise<CityHealthStats | null> {
  const cache = readEurostatCache()
  const cached = cache[city]
  if (cached?.data) return cached.data

  const states = getStates()
  const state = states.find((s) => s.name.toLowerCase() === city.toLowerCase())
  if (!state?.eurostatGeo) return null

  return fetchStatsForGeo(city, state.eurostatGeo, state.eurostatRegionLabel)
}
