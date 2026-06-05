'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <button
              onClick={reset}
              style={{ color: '#0ea5e9', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
