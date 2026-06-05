#!/usr/bin/env node
// One-time migration: data/diseases.json → data/diseases/<slug.en>.json
const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '../data/diseases.json')
const dir = path.join(__dirname, '../data/diseases')

const diseases = JSON.parse(fs.readFileSync(src, 'utf-8'))

fs.mkdirSync(dir, { recursive: true })
for (const disease of diseases) {
  const filename = disease.slug.en + '.json'
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(disease, null, 2) + '\n')
}

console.log(`${diseases.length} diseases written to data/diseases/`)
