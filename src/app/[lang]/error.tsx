'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-3xl mb-3">⚠️</p>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Something went wrong</h1>
        <p className="text-sm text-slate-500 mb-4">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="text-sm font-medium text-sky-500 hover:text-sky-600 hover:underline transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
