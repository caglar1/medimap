'use client'

import { useState } from 'react'

const ZOOM = 12
const TILES = [
  { x: 2200, y: 1343 },
  { x: 2201, y: 1343 },
  { x: 2200, y: 1344 },
  { x: 2201, y: 1344 },
]

function MapSkeleton() {
  return (
    <div className="absolute inset-0 bg-slate-100 animate-pulse overflow-hidden">
      {/* Yatay yollar */}
      <div className="absolute top-[22%] left-0 right-0 h-[3px] bg-slate-300/70" />
      <div className="absolute top-[47%] left-0 right-0 h-[5px] bg-slate-300/80" />
      <div className="absolute top-[71%] left-0 right-0 h-[3px] bg-slate-300/70" />
      {/* Dikey yollar */}
      <div className="absolute left-[30%] top-0 bottom-0 w-[3px] bg-slate-300/70" />
      <div className="absolute left-[62%] top-0 bottom-0 w-[5px] bg-slate-300/80" />
      {/* Bloklar */}
      <div className="absolute top-[8%]  left-[5%]  w-[22%] h-[12%] rounded bg-slate-200/80" />
      <div className="absolute top-[8%]  left-[35%] w-[24%] h-[10%] rounded bg-slate-200/60" />
      <div className="absolute top-[8%]  left-[68%] w-[28%] h-[13%] rounded bg-slate-200/80" />
      <div className="absolute top-[55%] left-[5%]  w-[18%] h-[16%] rounded bg-slate-200/70" />
      <div className="absolute top-[55%] left-[35%] w-[20%] h-[14%] rounded bg-slate-200/60" />
      <div className="absolute top-[55%] left-[68%] w-[26%] h-[15%] rounded bg-slate-200/80" />
      {/* Su gövdesi izlenimi */}
      <div className="absolute top-[28%] left-[38%] w-[20%] h-[17%] rounded-xl bg-slate-200/50" />
    </div>
  )
}

export default function MapBlurBackground() {
  const [loadedCount, setLoadedCount] = useState(0)
  const allLoaded = loadedCount >= TILES.length

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 2×2 tile grid */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {TILES.map(({ x, y }) => (
          <img
            key={`${x}_${y}`}
            src={`/map-tiles/${ZOOM}_${x}_${y}.png`}
            alt=""
            className="w-full h-full object-cover"
            onLoad={() => setLoadedCount(c => c + 1)}
          />
        ))}
      </div>
      {/* Skeleton — tile'lar yüklenene kadar */}
      {!allLoaded && <MapSkeleton />}
    </div>
  )
}
