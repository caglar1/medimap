'use server'

import path from 'path'
import fs from 'fs'
import { revalidatePath } from 'next/cache'
import { fetchStatsForGeo, getStates, getCities, type CityHealthStats, type StateConfig } from '@/lib/eurostat'
import { geocodeCity, fetchFacilitiesNearby, fetchFacilitiesInArea, fetchAdminBoundaries, type OsmFacility, type OsmBoundary } from '@/lib/overpass'
import { resolveSpecialities, applyResolved, type SpecialityDebug } from '@/lib/speciality-resolver'
import { osmSpecialitiesToDepartments } from '@/lib/speciality-map'
import type { Facility, CityConfig } from '@/lib/types'

interface EurostatCache {
  [state: string]: { data: CityHealthStats; updatedAt: string }
}

interface OverpassCache {
  [state: string]: { facilities: OsmFacility[]; updatedAt: string }
}

function cachePath(file: string) {
  return path.join(process.cwd(), 'data/cache', file)
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function mergeFacilities(
  existing: Facility[],
  osmFacilities: OsmFacility[],
  stateName: string,
  country: string
): { facilities: Facility[]; added: number; updated: number; removed: number } {
  const osmIds = new Set(osmFacilities.map((f) => f.id))
  let added = 0
  let updated = 0
  let removed = 0

  // claimed:false + osm_id olanları sil (artık OSM'de yok)
  // state adıyla eşleştirme: facility.city'ye bakmıyoruz artık, osm_id ile takip ediyoruz
  const stateOsmIds = new Set(
    existing.filter((f) => f.osm_id && !f.claimed).map((f) => f.osm_id as string)
  )
  const filtered = existing.filter((f) => {
    if (f.osm_id && !f.claimed && stateOsmIds.has(f.osm_id) && !osmIds.has(f.osm_id)) {
      // Sadece bu state'in önceki Overpass çekiminden gelenleri sil
      // (overpass cache'teki osm_id'lerle kesişim kontrolü)
      const prevCacheFile = cachePath('overpass.json')
      const prevCache = readJson<OverpassCache>(prevCacheFile, {})
      const prevStateIds = new Set((prevCache[stateName]?.facilities ?? []).map((f) => f.id))
      if (prevStateIds.has(f.osm_id)) {
        removed++
        return false
      }
    }
    return true
  })

  const result = [...filtered]

  for (const osm of osmFacilities) {
    const idx = result.findIndex((f) => f.osm_id === osm.id)

    if (idx !== -1) {
      if (!result[idx].claimed) {
        result[idx] = {
          ...result[idx],
          name: osm.name,
          type: osm.type as Facility['type'],
          lat: osm.lat,
          lng: osm.lng,
          address: osm.address ?? result[idx].address,
          phone: osm.phone ?? result[idx].phone,
          email: osm.email ?? result[idx].email,
          website: osm.website ?? result[idx].website,
          open_24h: osm.open_24h,
          opening_hours: osm.opening_hours ?? result[idx].opening_hours,
          specialities: osm.specialities ?? result[idx].specialities,
          departments: osm.departments ?? result[idx].departments,
          emergency: osm.emergency ?? result[idx].emergency,
          amenity: osm.amenity ?? result[idx].amenity,
          healthcare: osm.healthcare ?? result[idx].healthcare,
          brand: osm.brand ?? result[idx].brand,
          operator: osm.operator ?? result[idx].operator,
          operator_type: osm.operator_type ?? result[idx].operator_type,
          operational_status: osm.operational_status ?? result[idx].operational_status,
          beds: osm.beds ?? result[idx].beds,
          staff_doctors: osm.staff_doctors ?? result[idx].staff_doctors,
          staff_nurses: osm.staff_nurses ?? result[idx].staff_nurses,
          equipment: osm.equipment ?? result[idx].equipment,
          dispensing: osm.dispensing ?? result[idx].dispensing,
          insurance: osm.insurance ?? result[idx].insurance,
          wheelchair: osm.wheelchair ?? result[idx].wheelchair,
          check_date: osm.check_date ?? result[idx].check_date,
          source: osm.source ?? result[idx].source,
        }
        updated++
      }
    } else {
      result.push({
        id: osm.id,
        osm_id: osm.id,
        claimed: false,
        name: osm.name,
        type: osm.type as Facility['type'],
        city: osm.city ?? stateName,
        country,
        lat: osm.lat,
        lng: osm.lng,
        address: osm.address ?? '',
        phone: osm.phone,
        email: osm.email,
        website: osm.website,
        languages: [],
        rating: null,
        open_24h: osm.open_24h,
        opening_hours: osm.opening_hours,
        specialities: osm.specialities,
        departments: osm.departments,
        emergency: osm.emergency,
        amenity: osm.amenity,
        healthcare: osm.healthcare,
        brand: osm.brand,
        operator: osm.operator,
        operator_type: osm.operator_type,
        operational_status: osm.operational_status,
        beds: osm.beds,
        staff_doctors: osm.staff_doctors,
        staff_nurses: osm.staff_nurses,
        equipment: osm.equipment,
        dispensing: osm.dispensing,
        insurance: osm.insurance,
        wheelchair: osm.wheelchair,
        check_date: osm.check_date,
        source: osm.source,
      })
      added++
    }
  }

  return { facilities: result, added, updated, removed }
}

function mergeCities(existing: CityConfig[], boundaries: OsmBoundary[], state: StateConfig): { cities: CityConfig[]; added: number; updated: number } {
  let added = 0
  let updated = 0
  const result = [...existing]

  for (const b of boundaries) {
    const slug = slugify(b.name)
    const idx = result.findIndex((c) => c.osm_id === b.osm_id || c.slug === slug)

    if (idx !== -1) {
      const city = result[idx]
      const shouldUpdateCoords = !city.coordsLocked && city.source === 'auto'
      const needsOsmId = city.osm_id === null
      if (shouldUpdateCoords || needsOsmId) {
        result[idx] = {
          ...city,
          ...(shouldUpdateCoords ? { lat: b.lat, lon: b.lon } : {}),
          osm_id: b.osm_id,
        }
        if (shouldUpdateCoords) updated++
      }
    } else {
      result.push({
        name: b.name,
        slug,
        country: state.country,
        countryName: state.countryName,
        region: state.region,
        lat: b.lat,
        lon: b.lon,
        radiusKm: 15,
        stateSlug: state.slug,
        source: 'auto',
        coordsLocked: false,
        osm_id: b.osm_id,
      })
      added++
    }
  }

  return { cities: result, added, updated }
}

// ── State Overpass Config ────────────────────────────────────────────────────

export async function updateStateOverpassConfig(
  stateName: string,
  wikidataId: string,
  stateAdminLevel: number | null,
  cityAdminLevel: number | null
): Promise<void> {
  const filePath = path.join(process.cwd(), 'data/config/states.json')
  const states: StateConfig[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const idx = states.findIndex((s) => s.name === stateName)
  if (idx === -1) return
  const updated = { ...states[idx] }
  if (wikidataId.trim()) {
    updated.wikidataId = wikidataId.trim()
  } else {
    delete updated.wikidataId
  }
  updated.stateAdminLevel = stateAdminLevel !== null && !isNaN(stateAdminLevel) ? stateAdminLevel : undefined
  updated.cityAdminLevel = cityAdminLevel !== null && !isNaN(cityAdminLevel) ? cityAdminLevel : undefined
  states[idx] = updated
  fs.writeFileSync(filePath, JSON.stringify(states, null, 2), 'utf-8')
}

// ── City Coords ──────────────────────────────────────────────────────────────

export async function updateCityCoords(citySlug: string, lat: number, lon: number): Promise<void> {
  const filePath = path.join(process.cwd(), 'data/config/cities.json')
  const cities: CityConfig[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const idx = cities.findIndex((c) => c.slug === citySlug)
  if (idx === -1) return
  cities[idx] = { ...cities[idx], lat, lon, coordsLocked: true }
  fs.writeFileSync(filePath, JSON.stringify(cities, null, 2), 'utf-8')
}

export async function updateCityRadius(citySlug: string, radiusKm: number): Promise<void> {
  const filePath = path.join(process.cwd(), 'data/config/cities.json')
  const cities: CityConfig[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const idx = cities.findIndex((c) => c.slug === citySlug)
  if (idx === -1) return
  cities[idx] = { ...cities[idx], radiusKm }
  fs.writeFileSync(filePath, JSON.stringify(cities, null, 2), 'utf-8')
}

// ── Eurostat ─────────────────────────────────────────────────────────────────

export async function updateEurostatState(
  stateName: string
): Promise<{ ok: boolean; data?: CityHealthStats; error?: string }> {
  try {
    const states = getStates()
    const config = states.find((s) => s.name === stateName)

    if (!config) return { ok: false, error: `State "${stateName}" not found in config` }
    if (!config.eurostatGeo) return { ok: false, error: `No Eurostat geo code for "${stateName}"` }

    const data = await fetchStatsForGeo(stateName, config.eurostatGeo, config.eurostatRegionLabel)

    const file = cachePath('eurostat.json')
    const cache = readJson<EurostatCache>(file, {})
    cache[stateName] = { data, updatedAt: new Date().toISOString() }
    writeJson(file, cache)

    revalidatePath('/', 'layout')

    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

// ── Overpass ──────────────────────────────────────────────────────────────────

export async function updateOverpassState(
  stateName: string
): Promise<{ ok: boolean; count?: number; added?: number; updated?: number; removed?: number; citiesAdded?: number; citiesUpdated?: number; llmDebug?: SpecialityDebug; error?: string }> {
  try {
    const states = getStates()
    const config = states.find((s) => s.name === stateName)
    const country = config?.country ?? ''

    // Tesis çekme (stateAdminLevel ile)
    let osmFacilities: OsmFacility[]
    if (config?.wikidataId && config.stateAdminLevel) {
      osmFacilities = await fetchFacilitiesInArea(
        `area["wikidata"="${config.wikidataId}"]["admin_level"="${config.stateAdminLevel}"]`
      )
    } else if (config?.wikidataId) {
      osmFacilities = await fetchFacilitiesInArea(`area["wikidata"="${config.wikidataId}"]`)
    } else if (config?.stateAdminLevel) {
      osmFacilities = await fetchFacilitiesInArea(
        `area["name"="${stateName}"]["admin_level"="${config.stateAdminLevel}"]`
      )
    } else {
      const coords = await geocodeCity(stateName)
      if (!coords) return { ok: false, error: `Could not geocode "${stateName}"` }
      osmFacilities = await fetchFacilitiesNearby(coords.lat, coords.lng, 20)
    }

    // Speciality → Department mapping
    let llmDebug: SpecialityDebug | undefined
    const allTerms = Array.from(new Set(osmFacilities.flatMap((f) => f.specialities ?? [])))
    if (allTerms.length) {
      const { mapping, debug } = await resolveSpecialities(allTerms)
      llmDebug = debug
      for (const f of osmFacilities) {
        if (f.specialities?.length) {
          f.departments = applyResolved(f.specialities, mapping)
        }
      }
    }

    // healthcare= fallback
    const HEALTHCARE_FALLBACK = new Set([
      'dentist', 'physiotherapist', 'optometrist', 'alternative', 'psychotherapist',
      'vaccination_centre', 'audiologist', 'dialysis', 'speech_therapist',
    ])
    for (const f of osmFacilities) {
      if (!f.departments?.length && f.healthcare && HEALTHCARE_FALLBACK.has(f.healthcare)) {
        const fromTag = osmSpecialitiesToDepartments([f.healthcare])
        if (fromTag.length) {
          f.departments = fromTag
          if (!f.specialities?.length) f.specialities = [f.healthcare]
        }
      }
    }

    // Hospital wildcard
    for (const f of osmFacilities) {
      if (f.type === 'hospital' && (!f.specialities || f.specialities.length === 0)) {
        f.specialities = ['any']
        f.departments = ['*']
      }
    }

    // Overpass cache
    const cacheFile = cachePath('overpass.json')
    const cache = readJson<OverpassCache>(cacheFile, {})
    cache[stateName] = { facilities: osmFacilities, updatedAt: new Date().toISOString() }
    writeJson(cacheFile, cache)

    // Facilities merge
    const facilitiesFile = path.join(process.cwd(), 'data/facilities.json')
    const existingFacilities = readJson<Facility[]>(facilitiesFile, [])
    const { facilities, added, updated, removed } = mergeFacilities(existingFacilities, osmFacilities, stateName, country)
    writeJson(facilitiesFile, facilities)

    // Auto-generate cities from cityAdminLevel boundaries
    let citiesAdded = 0
    let citiesUpdated = 0
    if (config?.wikidataId && config.cityAdminLevel) {
      const boundaries = await fetchAdminBoundaries(config.wikidataId, config.cityAdminLevel)
      if (boundaries.length > 0) {
        const citiesFile = path.join(process.cwd(), 'data/config/cities.json')
        const existingCities = readJson<CityConfig[]>(citiesFile, [])
        const { cities: mergedCities, added: cA, updated: cU } = mergeCities(existingCities, boundaries, config)
        citiesAdded = cA
        citiesUpdated = cU
        writeJson(citiesFile, mergedCities)
      }
    }

    revalidatePath('/', 'layout')

    return { ok: true, count: osmFacilities.length, added, updated, removed, citiesAdded, citiesUpdated, llmDebug }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

// ── Eski getCities bazlı aksiyonlar (geriye dönük uyumluluk) ─────────────────

export async function updateCityOverpassConfig(
  cityName: string,
  wikidataId: string,
  adminLevel: number | null
): Promise<void> {
  // Artık cities.json'da wikidataId/adminLevel yok — state üzerinden yönetilir
  // Bu fonksiyon geriye dönük uyumluluk için korunuyor
  void cityName; void wikidataId; void adminLevel
}

// getCities re-export for page.tsx backward compat
export { getCities }
