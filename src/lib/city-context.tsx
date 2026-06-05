'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { CityConfig } from './types'

interface CityContextValue {
  selectedCity: CityConfig | null
  setSelectedCity: (city: CityConfig | null) => void
}

const CityContext = createContext<CityContextValue>({
  selectedCity: null,
  setSelectedCity: () => {},
})

const STORAGE_KEY = 'medimapia_city'

export function CityProvider({
  children,
  cities,
}: {
  children: React.ReactNode
  cities: CityConfig[]
}) {
  const [selectedCity, setSelectedCityState] = useState<CityConfig | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const found = cities.find((c) => c.slug === stored)
      if (found) setSelectedCityState(found)
    }
  }, [cities])

  const setSelectedCity = (city: CityConfig | null) => {
    setSelectedCityState(city)
    if (city) localStorage.setItem(STORAGE_KEY, city.slug)
    else localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  )
}

export const useCity = () => useContext(CityContext)
