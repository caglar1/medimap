'use client'

import { useTransition, useState } from 'react'
import { updateEurostatState, updateOverpassState } from './actions'
import type { SpecialityDebug } from '@/lib/speciality-resolver'

interface Props {
  city: string
  type: 'eurostat' | 'overpass'
}

export default function UpdateButton({ city, type }: Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; msg: string; llmDebug?: SpecialityDebug } | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  function handleClick() {
    setResult(null)
    startTransition(async () => {
      try {
        const res = type === 'eurostat'
          ? await updateEurostatState(city)
          : await updateOverpassState(city)

        if (res.ok) {
          const detail = type === 'eurostat'
            ? 'Updated'
            : (() => {
                const r = res as { count?: number; added?: number; updated?: number; removed?: number; citiesAdded?: number; citiesUpdated?: number }
                const citiesPart = (r.citiesAdded || r.citiesUpdated)
                  ? ` · cities +${r.citiesAdded ?? 0}/${r.citiesUpdated ?? 0}`
                  : ''
                return `${r.count ?? 0} fetched · +${r.added ?? 0} added · ${r.updated ?? 0} updated · -${r.removed ?? 0} removed${citiesPart}`
              })()
          const llmDebug = (res as { llmDebug?: SpecialityDebug }).llmDebug
          setResult({ ok: true, msg: detail, llmDebug })
        } else {
          setResult({ ok: false, msg: (res as { error?: string }).error ?? 'Error' })
        }
      } catch (e) {
        setResult({ ok: false, msg: e instanceof Error ? e.message : 'Unexpected error' })
      }
    })
  }

  const debug = result?.llmDebug

  return (
    <>
      <div className="flex flex-col gap-1 w-36">
        <button
          onClick={handleClick}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start"
        >
          {isPending ? 'Updating…' : 'Update'}
        </button>

        {result && (
          <p className={`text-[11px] leading-snug break-words ${result.ok ? 'text-emerald-600' : 'text-red-500'}`}>
            {result.ok ? `✓ ${result.msg}` : `✗ ${result.msg}`}
          </p>
        )}

        {result?.ok && debug && (
          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => setShowDebug(true)}
              className="text-left text-[11px] text-sky-500 hover:text-sky-600 underline underline-offset-2"
            >
              LLM debug — {debug.unknownTerms.length} term{debug.unknownTerms.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      {showDebug && debug && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDebug(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="font-semibold text-slate-800">LLM Speciality Debug</h3>
                <p className="text-xs text-slate-400 mt-0.5">{city} · {debug.unknownTerms.length} unknown term{debug.unknownTerms.length !== 1 ? 's' : ''} sent to LLM</p>
              </div>
              <button
                onClick={() => setShowDebug(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex flex-col gap-5 p-5">

              {/* Unknown terms */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Unknown terms sent to LLM</p>
                <div className="flex flex-wrap gap-1.5">
                  {debug.unknownTerms.map((term) => (
                    <span key={term} className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-mono">
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resolved mapping table */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Resolved mapping</p>
                {Object.keys(debug.resolved).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No mappings returned</p>
                ) : (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wide">
                          <th className="text-left px-3 py-2 font-medium">Term</th>
                          <th className="text-left px-3 py-2 font-medium">ICD Prefix</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(debug.resolved).map(([term, prefixes]) => (
                          <tr key={term} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono text-slate-700">{term}</td>
                            <td className="px-3 py-2">
                              {prefixes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {prefixes.map((p) => (
                                    <span key={p} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-mono font-semibold">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-300 italic">unmapped</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Raw LLM response */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Raw LLM response
                  <span className="ml-2 normal-case font-normal text-slate-300">(before validation)</span>
                </p>
                {(() => {
                  const raw = debug.rawResponse
                  if (!raw) return <p className="text-xs text-slate-400 italic">LLM was not called (all terms resolved by static map)</p>
                  const jsonMatch = raw.match(/\{[\s\S]*\}/)
                  let parsed: Record<string, unknown> | null = null
                  try { parsed = JSON.parse(jsonMatch?.[0] ?? '') } catch { /* not json */ }
                  const isEmpty = parsed !== null && Object.keys(parsed).length === 0
                  return (
                    <>
                      {isEmpty && (
                        <p className="text-xs text-amber-600 mb-2">
                          LLM returned empty mapping — no prefixes assigned. Check if API key is set or terms are too ambiguous.
                        </p>
                      )}
                      <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono text-slate-600 whitespace-pre-wrap overflow-y-auto max-h-48">
                        {parsed ? JSON.stringify(parsed, null, 2) : raw}
                      </pre>
                    </>
                  )
                })()}
              </div>

              {/* System prompt */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">System prompt</p>
                <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono text-slate-600 whitespace-pre-wrap overflow-y-auto max-h-64">
                  {debug.systemPrompt}
                </pre>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
