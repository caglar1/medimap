#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '../data/diseases')
const dest = path.join(__dirname, '../data/diseases-index.json')

const diseases = fs.readdirSync(srcDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(srcDir, f), 'utf-8')))

const index = diseases.map(({ id, slug, name, icd11_code, category, severity, prevalence_percent }) => ({
  id, slug, name, icd11_code, category, severity, prevalence_percent,
}))

fs.writeFileSync(dest, JSON.stringify(index, null, 2))
console.log(`diseases-index.json: ${index.length} diseases, ${Buffer.byteLength(JSON.stringify(index))} bytes`)
