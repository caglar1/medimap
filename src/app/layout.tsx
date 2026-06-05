import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Medimapia – Global Health Map',
  description: 'Disease information, community insights, and nearby health facilities in 3 languages.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50`}>{children}</body>
    </html>
  )
}
