import type { Metadata } from 'next'
import MedlineClient from './MedlineClient'

export const metadata: Metadata = {
  title: 'MedlinePlus Data — Medimapia',
  description: 'NIH MedlinePlus Connect API üzerinden ICD-10 kodlarıyla hastalık özeti sorgulama',
}

export default function MedlineDataPage() {
  return <MedlineClient />
}
