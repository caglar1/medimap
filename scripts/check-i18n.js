#!/usr/bin/env node
// i18n coverage check — run via `npm run check-i18n`.
// Locales are derived from src/locales/*.json filenames (self-updating when a
// 4th language is added). Exits 1 if anything is missing so it can gate CI.
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const localesDir = path.join(root, 'src/locales')
const diseasesDir = path.join(root, 'data/diseases')

const LOCALES = fs.readdirSync(localesDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))

const problems = []

// --- Part 1: disease content files ---
// LocalizedString string fields and array fields per disease.
const stringFields = ['slug', 'name', 'summary']
const arrayFields = ['symptoms']

for (const file of fs.readdirSync(diseasesDir).filter((f) => f.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(path.join(diseasesDir, file), 'utf-8'))

  const checkLocalized = (obj, label, isArray) => {
    for (const loc of LOCALES) {
      const v = obj?.[loc]
      if (v === undefined || v === null) {
        problems.push(`${file}: missing "${loc}" in ${label}`)
      } else if (isArray) {
        if (!Array.isArray(v) || v.length === 0 || v.some((s) => !String(s).trim())) {
          problems.push(`${file}: empty/invalid "${loc}" in ${label}`)
        }
      } else if (!String(v).trim()) {
        problems.push(`${file}: empty "${loc}" in ${label}`)
      }
    }
  }

  stringFields.forEach((f) => checkLocalized(d[f], f, false))
  arrayFields.forEach((f) => checkLocalized(d[f], f, true))
  ;(d.routing_departments ?? []).forEach((rd, i) =>
    checkLocalized(rd.clinical_role, `routing_departments[${i}].clinical_role`, false)
  )
}

// --- Part 2: UI locale JSON parity against en.json ---
const enKeys = Object.keys(JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8')))
for (const loc of LOCALES.filter((l) => l !== 'en')) {
  const dict = JSON.parse(fs.readFileSync(path.join(localesDir, `${loc}.json`), 'utf-8'))
  for (const key of enKeys) {
    if (!(key in dict)) problems.push(`locales/${loc}.json: missing key "${key}"`)
    else if (!String(dict[key]).trim()) problems.push(`locales/${loc}.json: empty key "${key}"`)
  }
}

// --- Report ---
console.log(`Locales: ${LOCALES.join(', ')}`)
if (problems.length === 0) {
  console.log('✓ i18n check passed — no missing translations.')
  process.exit(0)
}
console.error(`✗ ${problems.length} i18n problem(s):`)
problems.forEach((p) => console.error('  - ' + p))
process.exit(1)
