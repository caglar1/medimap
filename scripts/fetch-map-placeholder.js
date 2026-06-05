const fs = require('fs')
const path = require('path')

const ZOOM = 12
const LAT = 52.52   // Berlin
const LNG = 13.405

function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom)
  const x = Math.floor((lng + 180) / 360 * n)
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n)
  return { x, y }
}

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'map-tiles')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const center = latLngToTile(LAT, LNG, ZOOM)
  const tiles = [
    { x: center.x,     y: center.y },
    { x: center.x + 1, y: center.y },
    { x: center.x,     y: center.y + 1 },
    { x: center.x + 1, y: center.y + 1 },
  ]

  for (const { x, y } of tiles) {
    const url = `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`
    const file = path.join(outDir, `${ZOOM}_${x}_${y}.png`)
    console.log(`Fetching ${url}`)
    const res = await fetch(url, { headers: { 'User-Agent': 'medimapia/1.0 (map placeholder generator)' } })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    const buf = await res.arrayBuffer()
    fs.writeFileSync(file, Buffer.from(buf))
    console.log(`  → ${path.relative(process.cwd(), file)}`)
  }

  // metadata: component hangi tile'ları kullanacağını bilsin
  const meta = { zoom: ZOOM, tiles: tiles.map(({ x, y }) => ({ x, y })) }
  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 2))
  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
