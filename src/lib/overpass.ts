export interface OsmBoundary {
  osm_id: number
  name: string
  lat: number
  lon: number
}

export interface OsmFacility {
  id: string
  name: string
  type: string
  lat: number
  lng: number
  city?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  open_24h: boolean
  opening_hours?: string
  specialities?: string[]
  departments?: string[]
  emergency?: boolean
  amenity?: string
  healthcare?: string
  brand?: string
  operator?: string
  operator_type?: string
  operational_status?: string
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

const AMENITY_VALUES = 'hospital|clinic|doctors|dentist|health_centre'
const HEALTHCARE_VALUES = 'doctor|clinic|hospital|dentist|centre|physiotherapist|psychotherapist|optometrist|dialysis|blood_bank|nutrition_counselling|rehabilitation|hospice|alternative|vaccination_centre|audiologist|speech_therapist'
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

async function runOverpassQuery(query: string, clientTimeoutMs = 35_000): Promise<OsmFacility[]> {
  const encodedQuery = encodeURIComponent(query)
  let lastError: Error = new Error('Overpass: all endpoints failed')
  let text = ''

  for (const endpoint of ENDPOINTS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), clientTimeoutMs)
    try {
      const res = await fetch(`${endpoint}?data=${encodedQuery}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'User-Agent': 'Medimapia/1.0', 'Accept': 'application/json' },
      })
      if (!res.ok) {
        const body = await res.text()
        lastError = new Error(`Overpass HTTP ${res.status} (${endpoint}): ${body.slice(0, 300)}`)
        continue
      }
      text = await res.text()
      if (!text.trim()) {
        lastError = new Error(`Overpass returned empty body (${endpoint})`)
        continue
      }
      break
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      lastError = new Error(`Overpass fetch error (${endpoint}): ${msg}`)
    } finally {
      clearTimeout(timer)
    }
  }

  if (!text) throw lastError
  if (!text.trimStart().startsWith('{')) {
    throw new Error(`Overpass returned non-JSON (${text.slice(0, 200)})`)
  }

  const data = JSON.parse(text)
  return parseOsmElements(data.elements as any[])
}

function parseOsmElements(elements: any[]): OsmFacility[] {
  const PRIORITY: Record<string, number> = { hospital: 0, clinic: 1, health_centre: 2, doctors: 3, dentist: 4 }
  const seen = new Set<string>()

  return elements
    .filter((el) => {
      if (!el.tags?.name) return false
      const key = `${el.tags.name}|${el.lat ?? el.center?.lat}|${el.lon ?? el.center?.lon}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => (PRIORITY[a.tags.amenity] ?? 9) - (PRIORITY[b.tags.amenity] ?? 9))
    .map((el) => {
      const rawSpeciality: string =
        el.tags['healthcare:speciality'] ?? el.tags['healthcare:specialty'] ?? ''
      const specialities = rawSpeciality
        ? rawSpeciality.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean)
        : undefined

      const addressParts = [el.tags['addr:street'], el.tags['addr:housenumber'], el.tags['addr:city']]
        .filter(Boolean).join(' ')
      const address = el.tags['addr:full'] ?? (addressParts || undefined)

      const bedsRaw = el.tags.beds ? parseInt(el.tags.beds, 10) : undefined
      const staffDoctors = el.tags['staff_count:doctors'] ? parseInt(el.tags['staff_count:doctors'], 10) : undefined
      const staffNurses = el.tags['staff_count:nurses'] ? parseInt(el.tags['staff_count:nurses'], 10) : undefined
      const equipment = el.tags['healthcare:equipment']
        ? el.tags['healthcare:equipment'].split(/[;,]/).map((s: string) => s.trim()).filter(Boolean)
        : undefined

      return {
        id: `osm-${el.id}`,
        name: el.tags.name,
        type: el.tags.healthcare ?? el.tags.amenity ?? 'clinic',
        amenity: el.tags.amenity ?? 'no',
        healthcare: el.tags.healthcare ?? el.tags.amenity ?? 'no',
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
        address,
        phone: el.tags.phone ?? el.tags['contact:phone'],
        email: el.tags.email ?? el.tags['contact:email'],
        website: el.tags.website ?? el.tags['contact:website'] ?? el.tags.url,
        open_24h: el.tags.opening_hours === '24/7',
        opening_hours: el.tags.opening_hours,
        specialities,
        emergency: el.tags.emergency === 'yes' ? true : undefined,
        brand: el.tags.brand,
        operator: el.tags.operator,
        operator_type: el.tags['operator:type'],
        operational_status: el.tags.operational_status,
        beds: Number.isNaN(bedsRaw) ? undefined : bedsRaw,
        staff_doctors: Number.isNaN(staffDoctors) ? undefined : staffDoctors,
        staff_nurses: Number.isNaN(staffNurses) ? undefined : staffNurses,
        equipment,
        dispensing: el.tags.dispensing === 'yes' ? true : undefined,
        insurance: el.tags['insurance:health'],
        wheelchair: el.tags.wheelchair as 'yes' | 'no' | 'limited' | undefined,
        check_date: el.tags.check_date,
        source: el.tags.source,
      }
    })
}

export async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
  const res = await fetch(url, { headers: { 'User-Agent': 'Medimapia/1.0' } })
  const data = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

export async function fetchFacilitiesNearby(
  lat: number,
  lng: number,
  radiusKm = 20
): Promise<OsmFacility[]> {
  const r = radiusKm * 1000
  const query = `
    [out:json][timeout:25];
    (
      nwr["amenity"~"^(${AMENITY_VALUES})$"](around:${r},${lat},${lng});
      nwr["healthcare"~"^(${HEALTHCARE_VALUES})$"](around:${r},${lat},${lng});
    );
    out center tags;
  `
  return runOverpassQuery(query, 35_000)
}

export async function fetchFacilitiesInArea(areaSelector: string): Promise<OsmFacility[]> {
  const query = `
    [out:json][timeout:60];
    ${areaSelector}->.searchArea;
    (
      nwr["amenity"~"^(${AMENITY_VALUES})$"](area.searchArea);
      nwr["healthcare"~"^(${HEALTHCARE_VALUES})$"](area.searchArea);
    );
    out center tags;
  `
  return runOverpassQuery(query, 70_000)
}

export async function fetchAdminBoundaries(wikidataId: string, adminLevel: number): Promise<OsmBoundary[]> {
  // Union: doğrudan wikidata+adminLevel sorgusu VE alan-içi sorgu.
  // Doğrudan sorgu Berlin gibi stateAdminLevel===cityAdminLevel durumunu çözer:
  // Overpass, kendi alanından türetilen relation'ı alan-içi sorguda döndürmez (self-reference).
  const query = `
    [out:json][timeout:60];
    (
      relation["wikidata"="${wikidataId}"]["admin_level"="${adminLevel}"];
      area["wikidata"="${wikidataId}"]->.searchArea;
      relation["admin_level"="${adminLevel}"](area.searchArea);
    );
    out center tags;
  `
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ]
  let lastError: Error = new Error('Overpass: all endpoints failed')

  for (const endpoint of endpoints) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 70_000)
    try {
      const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'User-Agent': 'Medimapia/1.0', 'Accept': 'application/json' },
      })
      clearTimeout(timer)
      if (!res.ok) continue
      const json = await res.json()
      return (json.elements ?? [])
        .filter((el: { type: string; center?: { lat: number; lon: number }; tags?: { name?: string } }) =>
          el.type === 'relation' && el.center && el.tags?.name
        )
        .map((el: { id: number; center: { lat: number; lon: number }; tags: { name: string } }) => ({
          osm_id: el.id,
          name: el.tags.name,
          lat: el.center.lat,
          lon: el.center.lon,
        }))
    } catch (e) {
      clearTimeout(timer)
      lastError = e as Error
    }
  }
  throw lastError
}
