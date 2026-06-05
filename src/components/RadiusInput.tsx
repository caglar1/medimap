'use client'

import { useState, useRef } from 'react'
import { updateCityRadius } from '@/app/connectors/actions'

interface Props {
  citySlug: string
  initialValue: number
}

export default function RadiusInput({ citySlug, initialValue }: Props) {
  const [value, setValue] = useState(initialValue)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = parseInt(e.target.value, 10)
    if (isNaN(next) || next < 1 || next > 200) return
    setValue(next)
    setStatus('idle')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        await updateCityRadius(citySlug, next)
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
        min={1}
        max={200}
        value={value}
        onChange={handleChange}
        className={`w-16 text-xs font-mono border rounded px-2 py-1 text-center focus:outline-none focus:ring-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
          status === 'error'
            ? 'border-red-400 focus:ring-red-300'
            : 'border-slate-300 focus:ring-emerald-300'
        }`}
      />
      <span className="text-xs text-slate-400">km</span>
      {status === 'saved' && <span className="text-xs text-emerald-500">✓</span>}
      {status === 'error' && <span className="text-xs text-red-500">!</span>}
    </div>
  )
}
