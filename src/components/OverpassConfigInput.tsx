'use client'

import { useState, useRef } from 'react'
import { updateStateOverpassConfig } from '@/app/connectors/actions'

interface Props {
  stateName: string
  initialWikidata: string
  initialStateAdminLevel: number | null
  initialCityAdminLevel: number | null
}

export default function OverpassConfigInput({ stateName, initialWikidata, initialStateAdminLevel, initialCityAdminLevel }: Props) {
  const [wikidata, setWikidata] = useState(initialWikidata)
  const [stateAdmin, setStateAdmin] = useState(initialStateAdminLevel?.toString() ?? '')
  const [cityAdmin, setCityAdmin] = useState(initialCityAdminLevel?.toString() ?? '')
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function scheduleSave(nextWikidata: string, nextStateAdmin: string, nextCityAdmin: string) {
    setStatus('idle')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const sLevel = nextStateAdmin.trim() ? parseInt(nextStateAdmin, 10) : null
        const cLevel = nextCityAdmin.trim() ? parseInt(nextCityAdmin, 10) : null
        await updateStateOverpassConfig(stateName, nextWikidata, sLevel, cLevel)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 1500)
      } catch {
        setStatus('error')
      }
    }, 600)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={wikidata}
          onChange={(e) => { setWikidata(e.target.value); scheduleSave(e.target.value, stateAdmin, cityAdmin) }}
          placeholder="Q64"
          title="Wikidata ID"
          className={`w-20 text-xs font-mono border rounded px-2 py-1 focus:outline-none focus:ring-1 ${
            status === 'error' ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-emerald-300'
          }`}
        />
        <input
          type="number"
          value={stateAdmin}
          onChange={(e) => { setStateAdmin(e.target.value); scheduleSave(wikidata, e.target.value, cityAdmin) }}
          placeholder="4"
          min={1}
          max={12}
          title="State admin level"
          className={`w-10 text-xs font-mono border rounded px-2 py-1 text-center focus:outline-none focus:ring-1 ${
            status === 'error' ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-emerald-300'
          }`}
        />
        <span className="text-xs text-slate-400">/</span>
        <input
          type="number"
          value={cityAdmin}
          onChange={(e) => { setCityAdmin(e.target.value); scheduleSave(wikidata, stateAdmin, e.target.value) }}
          placeholder="6"
          min={1}
          max={12}
          title="City admin level (for auto-generating cities)"
          className={`w-10 text-xs font-mono border rounded px-2 py-1 text-center focus:outline-none focus:ring-1 ${
            status === 'error' ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-emerald-300'
          }`}
        />
        {status === 'saved' && <span className="text-xs text-emerald-500">✓</span>}
        {status === 'error' && <span className="text-xs text-red-500">!</span>}
      </div>
      <div className="flex gap-1.5 text-xs text-slate-400">
        <span className="w-20 truncate">wikidata</span>
        <span className="w-10 text-center">state</span>
        <span className="w-4" />
        <span className="w-10 text-center">city</span>
      </div>
    </div>
  )
}
