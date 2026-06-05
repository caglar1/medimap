'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import type { CityConfig } from '@/lib/types'
import { countryFlag } from '@/lib/utils'
import { useCity } from '@/lib/city-context'

interface Props {
  cities: CityConfig[]
  lang: string
}

export default function CityExplorerMap({ cities, lang }: Props) {
  const { selectedCity } = useCity()
  const mapKey = `${cities.map((c) => c.slug).join('-')}-${selectedCity?.slug ?? 'none'}`

  return (
    <MapContainer
      bounds={[[25, -130], [72, 45]]}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MarkerClusterGroup chunkedLoading key={mapKey}>
        {cities.map((city) => (
          <CircleMarker
            key={city.slug}
            center={[city.lat, city.lon]}
            radius={12}
            pathOptions={{
              color: '#0369a1',
              fillColor: '#0ea5e9',
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ textAlign: 'center', padding: '4px', minWidth: '150px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                  {countryFlag(city.country)} {city.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                  {city.countryName}
                </div>
                <a
                  href={`/${lang}/cities/${city.slug}`}
                  style={{
                    display: 'block',
                    background: '#0ea5e9',
                    color: 'white',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Explore →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
