'use client'

import { useState } from 'react'

interface Props {
  count: number
  typeBreakdown: string
  names: string[]
  total: number
}

export default function FacilityCacheDetails({ count, typeBreakdown, names, total }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-slate-700 font-medium text-xs">{count}</span>
        <button
          onClick={() => setOpen(true)}
          className="text-[11px] text-slate-400 hover:text-sky-500 underline underline-offset-2 transition-colors"
        >
          details
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="font-semibold text-slate-800">Cached Facilities</h3>
                <p className="text-xs text-slate-400 mt-0.5">{total} facilities total</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">By type</p>
                <p className="text-xs text-slate-600 font-mono">{typeBreakdown}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Facilities ({names.length} shown{total > names.length ? ` of ${total}` : ''})
                </p>
                <ul className="space-y-1">
                  {names.map((name, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
