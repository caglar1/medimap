import path from 'path'
import fs from 'fs'
import { getStates, getCities, type CityHealthStats, type StateConfig } from '@/lib/eurostat'
import { getDiseases, getSurveyByDisease } from '@/lib/data'
import type { OsmFacility } from '@/lib/overpass'
import type { CityConfig } from '@/lib/types'
import UpdateButton from './UpdateButton'
import RadiusInput from '@/components/RadiusInput'
import OverpassConfigInput from '@/components/OverpassConfigInput'
import CityCoordInput from '@/components/CityCoordInput'
import FacilityCacheDetails from '@/components/FacilityCacheDetails'
import { countryFlag } from '@/lib/utils'

interface EurostatCache {
  [state: string]: { data: CityHealthStats; updatedAt: string }
}
interface OverpassCache {
  [state: string]: { facilities: OsmFacility[]; updatedAt: string }
}

function readCache<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/cache', file), 'utf-8'))
  } catch {
    return fallback
  }
}

function fmt(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function countByType(facilities: OsmFacility[]) {
  const counts: Record<string, number> = {}
  for (const f of facilities) {
    counts[f.type] = (counts[f.type] ?? 0) + 1
  }
  return Object.entries(counts).map(([t, n]) => `${n} ${t}`).join(', ')
}

function groupByCountry<T extends { countryName: string; country: string }>(items: T[]): [string, T[]][] {
  const map: Record<string, T[]> = {}
  for (const item of items) {
    if (!map[item.countryName]) map[item.countryName] = []
    map[item.countryName].push(item)
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
}

type StateNode = StateConfig & { children: StateConfig[] }

function buildStateTree(states: StateConfig[]): StateNode[] {
  const childrenMap = new Map<string, StateConfig[]>()
  const roots: StateConfig[] = []
  for (const s of states) {
    if (s.parentSlug) {
      const arr = childrenMap.get(s.parentSlug) ?? []
      arr.push(s)
      childrenMap.set(s.parentSlug, arr)
    } else {
      roots.push(s)
    }
  }
  return roots.map((s) => ({ ...s, children: childrenMap.get(s.slug) ?? [] }))
}

export default function ConnectorsPage() {
  const states: StateConfig[] = getStates()
  const cities: CityConfig[] = getCities()
  const eurostatCache = readCache<EurostatCache>('eurostat.json', {})
  const overpassCache = readCache<OverpassCache>('overpass.json', {})
  const diseases = getDiseases()

  const eurostatStates = states.filter((s) => s.eurostatGeo)
  const eurostatByCountry = groupByCountry(eurostatStates)
  const overpassTree = buildStateTree(states)
  const overpassByCountry = groupByCountry(overpassTree)
  const citiesByCountry = groupByCountry(cities)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 h-16 flex items-center px-6">
        <span className="text-white font-semibold text-lg tracking-tight">
          medimapia <span className="text-slate-400 font-normal text-sm ml-2">/ connectors</span>
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Connectors</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Which data comes from which source. Click <strong>Update</strong> to fetch fresh data and write it to the local cache JSON.
          </p>
        </div>

        {/* ── Eurostat ── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="border-l-4 border-blue-500 pl-3 text-base font-semibold text-slate-800">
              Eurostat API
            </span>
            <span className="text-xs font-mono bg-blue-100 text-blue-700 rounded px-2 py-0.5">REST API</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mb-1">
            https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Datasets: <span className="font-mono">demo_r_mlifexp · hlth_rs_bdsrg2 · tgs00103 · demo_r_pjangrp3 · hlth_cd_acdr2</span>
          </p>

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            {eurostatByCountry.map(([countryName, countryStates], idx) => (
              <details key={countryName} open className={idx > 0 ? 'border-t border-slate-200' : ''}>
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition-colors list-none">
                  <span className="text-base">{countryFlag(countryStates[0].country)}</span>
                  <span className="font-medium text-slate-700 text-sm">{countryName}</span>
                  <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5 ml-1">{countryStates.length}</span>
                </summary>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-y border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-2 font-medium">State / Region</th>
                      <th className="text-left px-4 py-2 font-medium">NUTS2</th>
                      <th className="text-left px-4 py-2 font-medium">Last Updated</th>
                      <th className="text-left px-4 py-2 font-medium">Cached Data</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {countryStates.map((state) => {
                      const entry = eurostatCache[state.name]
                      const stats = entry?.data
                      return (
                        <tr key={state.name} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {state.name}
                            {state.eurostatRegionLabel && (
                              <span className="ml-1 text-xs text-slate-400">({state.eurostatRegionLabel})</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500 text-xs">{state.eurostatGeo}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{fmt(entry?.updatedAt)}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {stats ? (
                              <ul className="space-y-0.5">
                                <li>Life expectancy: <strong>{stats.lifeExpectancy.male?.toFixed(1)}y M / {stats.lifeExpectancy.female?.toFixed(1)}y F</strong></li>
                                <li>Hospital beds: <strong>{stats.hospitalBedsPer100k?.toFixed(0)}/100k</strong></li>
                                <li>Poverty rate: <strong>{stats.povertyRate?.toFixed(1)}%</strong></li>
                                <li>Population 65+: <strong>{stats.population65Plus?.toFixed(1)}%</strong></li>
                                {stats.year && <li className="text-slate-400">Year: {stats.year}</li>}
                              </ul>
                            ) : (
                              <span className="text-slate-300 italic">No cache — click Update</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <UpdateButton city={state.name} type="eurostat" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </details>
            ))}
          </div>
        </section>

        {/* ── Overpass ── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="border-l-4 border-emerald-500 pl-3 text-base font-semibold text-slate-800">
              Overpass API <span className="text-slate-400 text-sm font-normal">(OpenStreetMap Facilities)</span>
            </span>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-700 rounded px-2 py-0.5">REST API</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mb-1">
            https://overpass-api.de/api/interpreter
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Query strategy: <span className="font-mono">wikidata+stateAdminLevel → wikidata → stateAdminLevel → around:radius (fallback)</span>
            <span className="ml-2">· Auto-generates cities from <span className="font-mono">cityAdminLevel</span> boundaries on Update.</span>
          </p>

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            {overpassByCountry.map(([countryName, countryNodes], idx) => {
              const leafNodes = countryNodes.filter((n) => n.children.length === 0)
              const parentNodes = countryNodes.filter((n) => n.children.length > 0)
              const totalCount = countryNodes.reduce((sum, n) => sum + 1 + n.children.length, 0)

              const stateTableHead = (
                <thead>
                  <tr className="bg-white border-y border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-4 py-2 font-medium">State / Region</th>
                    <th className="text-left px-4 py-2 font-medium">
                      <span className="block">Wikidata · State L · City L</span>
                      <span className="block font-normal normal-case text-slate-400">admin levels</span>
                    </th>
                    <th className="text-left px-4 py-2 font-medium">Last Updated</th>
                    <th className="text-left px-4 py-2 font-medium">Cached Facilities</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
              )

              const renderStateRows = (stateList: StateConfig[]) =>
                stateList.map((state) => {
                  const entry = overpassCache[state.name]
                  const facilities = entry?.facilities ?? []
                  return (
                    <tr key={state.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{state.name}</td>
                      <td className="px-4 py-3">
                        <OverpassConfigInput
                          stateName={state.name}
                          initialWikidata={state.wikidataId ?? ''}
                          initialStateAdminLevel={state.stateAdminLevel ?? null}
                          initialCityAdminLevel={state.cityAdminLevel ?? null}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{fmt(entry?.updatedAt)}</td>
                      <td className="px-4 py-3">
                        {facilities.length > 0 ? (
                          <FacilityCacheDetails
                            count={facilities.length}
                            typeBreakdown={countByType(facilities)}
                            names={facilities.slice(0, 50).map((f) => f.name)}
                            total={facilities.length}
                          />
                        ) : (
                          <span className="text-slate-300 italic text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <UpdateButton city={state.name} type="overpass" />
                      </td>
                    </tr>
                  )
                })

              return (
                <details key={countryName} open className={idx > 0 ? 'border-t border-slate-200' : ''}>
                  <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition-colors list-none">
                    <span className="text-base">{countryFlag(countryNodes[0].country)}</span>
                    <span className="font-medium text-slate-700 text-sm">{countryName}</span>
                    <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5 ml-1">{totalCount}</span>
                  </summary>

                  {/* Leaf states (no sub-regions) */}
                  {leafNodes.length > 0 && (
                    <table className="w-full text-sm">
                      {stateTableHead}
                      <tbody className="divide-y divide-slate-100">
                        {renderStateRows(leafNodes)}
                      </tbody>
                    </table>
                  )}

                  {/* Parent states (e.g. England) — sub-accordion, no Update button */}
                  {parentNodes.map((node) => (
                    <details key={node.slug} className="border-t border-slate-100">
                      <summary className="flex items-center gap-2 px-5 py-2.5 cursor-pointer select-none bg-slate-50/70 hover:bg-slate-100 transition-colors list-none">
                        <span className="text-sm font-medium text-slate-700">{node.name}</span>
                        <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5 ml-1">{node.children.length} regions</span>
                        <span className="ml-auto text-slate-400 text-xs">▾</span>
                      </summary>
                      <table className="w-full text-sm">
                        {stateTableHead}
                        <tbody className="divide-y divide-slate-100">
                          {renderStateRows(node.children)}
                        </tbody>
                      </table>
                    </details>
                  ))}
                </details>
              )
            })}
          </div>
        </section>

        {/* ── Nominatim ── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="border-l-4 border-emerald-400 pl-3 text-base font-semibold text-slate-800">
              Nominatim <span className="text-slate-400 text-sm font-normal">(OpenStreetMap Geocoding)</span>
            </span>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-700 rounded px-2 py-0.5">REST API</span>
            <span className="text-xs bg-slate-100 text-slate-500 rounded px-2 py-0.5">Fallback only · no cache</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mb-1">https://nominatim.openstreetmap.org/search</p>
          <p className="text-xs text-slate-400">
            Used only as fallback when neither wikidataId nor stateAdminLevel is set. Converts state name to coordinates for radius-based Overpass query.
          </p>
        </section>

        {/* ── Cities ── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="border-l-4 border-amber-500 pl-3 text-base font-semibold text-slate-800">
              Cities
            </span>
            <span className="text-xs font-mono bg-amber-100 text-amber-700 rounded px-2 py-0.5">Config</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mb-1">data/config/cities.json</p>
          <p className="text-xs text-slate-400 mb-4">
            Frontend city list. Auto-generated from Overpass state updates (<span className="font-mono">cityAdminLevel</span>).
            Editing lat/lon locks the coordinates — they won&apos;t be overwritten by future Overpass updates.
          </p>

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            {citiesByCountry.map(([countryName, countryCities], idx) => (
              <details key={countryName} open className={idx > 0 ? 'border-t border-slate-200' : ''}>
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition-colors list-none">
                  <span className="text-base">{countryFlag(countryCities[0].country)}</span>
                  <span className="font-medium text-slate-700 text-sm">{countryName}</span>
                  <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5 ml-1">{countryCities.length}</span>
                </summary>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-y border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-2 font-medium">City</th>
                      <th className="text-left px-4 py-2 font-medium">State</th>
                      <th className="text-left px-4 py-2 font-medium">Region</th>
                      <th className="text-left px-4 py-2 font-medium">Lat / Lon</th>
                      <th className="text-left px-4 py-2 font-medium">Radius</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {countryCities.map((city) => (
                      <tr key={city.slug} className={`hover:bg-slate-50 transition-colors ${city.source === 'auto' ? 'text-slate-400' : ''}`}>
                        <td className="px-4 py-3 font-medium">
                          <span className={city.source === 'auto' ? 'text-slate-500' : 'text-slate-800'}>
                            {city.name}
                          </span>
                          {city.coordsLocked && (
                            <span className="ml-1 text-amber-500" title="Coordinates locked">🔒</span>
                          )}
                          {city.source === 'auto' && (
                            <span className="ml-1.5 text-xs bg-slate-100 text-slate-400 rounded px-1.5 py-0.5">auto</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {city.stateSlug ?? <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{city.region}</td>
                        <td className="px-4 py-3">
                          <CityCoordInput
                            citySlug={city.slug}
                            initialLat={city.lat}
                            initialLon={city.lon}
                            locked={city.coordsLocked}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <RadiusInput citySlug={city.slug} initialValue={city.radiusKm ?? 15} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            To add a city manually: edit <span className="font-mono">data/config/cities.json</span>.
            To auto-populate from a region: set <span className="font-mono">cityAdminLevel</span> in Overpass config and click Update.
          </p>
        </section>

        {/* ── Static JSON Files ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="border-l-4 border-slate-400 pl-3 text-base font-semibold text-slate-800">
              Static JSON Files
            </span>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 rounded px-2 py-0.5">Static JSON</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-mono text-xs text-slate-500 mb-2">data/diseases/*.json</p>
              <p className="text-xs text-slate-400 mb-3">Disease metadata, symptoms, multilingual content. Manually maintained.</p>
              <ul className="space-y-1">
                {diseases.map((d) => (
                  <li key={d.id} className="text-xs text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block shrink-0" />
                    <span className="font-medium">{d.name.en}</span>
                    <span className="text-slate-400 font-mono">{d.icd11_code}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-mono text-xs text-slate-500 mb-2">data/surveys.json</p>
              <p className="text-xs text-slate-400 mb-3">Pre-aggregated community survey statistics. Manually maintained.</p>
              <ul className="space-y-1">
                {diseases.map((d) => {
                  const survey = getSurveyByDisease(d.id)
                  return (
                    <li key={d.id} className="text-xs text-slate-700 flex items-center justify-between">
                      <span>{d.name.en}</span>
                      <span className="text-slate-400 tabular-nums">
                        {survey ? survey.total_responses.toLocaleString() : '—'} resp.
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-mono text-xs text-slate-500 mb-2">data/facilities.json</p>
              <p className="text-xs text-slate-400 mb-3">Merged OSM + manual facilities. Updated via Overpass connector.</p>
              <ul className="space-y-1">
                {states.map((state) => (
                  <li key={state.name} className="text-xs text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block shrink-0" />
                    <span className="font-medium">{state.name}</span>
                    <span className="text-slate-400">{state.country}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── State Config ── */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="border-l-4 border-purple-400 pl-3 text-base font-semibold text-slate-800">
              State Configuration
            </span>
            <span className="text-xs font-mono bg-purple-100 text-purple-700 rounded px-2 py-0.5">Config</span>
          </div>
          <p className="text-xs text-slate-400 font-mono mb-3">data/config/states.json</p>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            {groupByCountry(states).map(([countryName, countryStates], idx) => (
              <details key={countryName} open className={idx > 0 ? 'border-t border-slate-200' : ''}>
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition-colors list-none">
                  <span className="text-base">{countryFlag(countryStates[0].country)}</span>
                  <span className="font-medium text-slate-700 text-sm">{countryName}</span>
                  <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5 ml-1">{countryStates.length}</span>
                </summary>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-y border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="text-left px-4 py-2 font-medium">State</th>
                      <th className="text-left px-4 py-2 font-medium">Eurostat NUTS2</th>
                      <th className="text-left px-4 py-2 font-medium">Wikidata ID</th>
                      <th className="text-left px-4 py-2 font-medium">State L</th>
                      <th className="text-left px-4 py-2 font-medium">City L</th>
                      <th className="text-left px-4 py-2 font-medium">Region Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {countryStates.map((state) => (
                      <tr key={state.name} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-800">{state.name}</td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">
                          {state.eurostatGeo ?? <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">
                          {state.wikidataId
                            ? <a href={`https://www.wikidata.org/wiki/${state.wikidataId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{state.wikidataId}</a>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">
                          {state.stateAdminLevel ?? <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">
                          {state.cityAdminLevel ?? <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 text-xs">
                          {state.eurostatRegionLabel ?? <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            To add a state: edit <span className="font-mono">data/config/states.json</span>, then click Update on Eurostat and Overpass sections.
          </p>
        </section>

      </div>
    </div>
  )
}
