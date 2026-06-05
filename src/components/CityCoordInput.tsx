'use client'

import { useState, useRef } from 'react'
import { updateCityCoords } from '@/app/connectors/actions'

interface Props {
  citySlug: string
  initialLat: number
  initialLon: number
  locked: boolean
}

export default function CityCoordInput({ citySlug, initialLat, initialLon, locked }: Props) {
  const [lat, setLat] = useState(initialLat.toString())
  const [lon, setLon] = useState(initialLon.toString())
  const [isLocked, setIsLocked] = useState(locked)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function scheduleSave(nextLat: string, nextLon: string) {
    setStatus('idle')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const latNum = parseFloat(nextLat)
      const lonNum = parseFloat(nextLon)
      if (isNaN(latNum) || isNaN(lonNum)) return
      try {
        await updateCityCoords(citySlug, latNum, lonNum)
        setIsLocked(true)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 1500)
      } catch {
        setStatus('error')
      }
    }, 600)
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        step="0.0001"
        value={lat}
        onChange={(e) => { setLat(e.target.value); scheduleSave(e.target.value, lon) }}
        placeholder="lat"
        className={`w-20 text-xs font-mono border rounded px-2 py-1 focus:outline-none focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
          status === 'error' ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-amber-300'
        }`}
      />
      <input
        type="number"
        step="0.0001"
        value={lon}
        onChange={(e) => { setLon(e.target.value); scheduleSave(lat, e.target.value) }}
        placeholder="lon"
        className={`w-20 text-xs font-mono border rounded px-2 py-1 focus:outline-none focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
          status === 'error' ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-amber-300'
        }`}
      />
      {isLocked && <span className="text-xs text-amber-500" title="Coordinates locked — won't be overwritten by Overpass update">🔒</span>}
      {status === 'saved' && !isLocked && <span className="text-xs text-emerald-500">✓</span>}
      {status === 'error' && <span className="text-xs text-red-500">!</span>}
    </div>
  )
}
