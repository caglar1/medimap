import { CityProvider } from '@/lib/city-context'
import { getAllCitiesConfig } from '@/lib/data'

export default function LangLayout({ children }: { children: React.ReactNode }) {
  const cities = getAllCitiesConfig()
  return <CityProvider cities={cities}>{children}</CityProvider>
}
