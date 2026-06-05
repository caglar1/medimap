import { getCauseCode } from '@/lib/eurostat'
import type { CityHealthStats, Disease, Locale } from '@/lib/types'

// ICD-10 cause kodu → kullanıcıya gösterilen etiket
const CAUSE_LABELS: Record<string, Record<Locale, string>> = {
  I: {
    en: 'Cardiovascular disease mortality rate',
    de: 'Sterberate Herz-Kreislauf-Erkrankungen',
    es: 'Tasa de mortalidad cardiovascular',
  },
  E10_E14: {
    en: 'Diabetes-related mortality rate',
    de: 'Diabetesbedingte Sterberate',
    es: 'Tasa de mortalidad por diabetes',
  },
  J: {
    en: 'Respiratory disease mortality rate',
    de: 'Sterberate Atemwegserkrankungen',
    es: 'Tasa de mortalidad respiratoria',
  },
  F: {
    en: 'Mental health-related mortality rate',
    de: 'Sterberate psychische Erkrankungen',
    es: 'Tasa de mortalidad salud mental',
  },
}

const UNIT_LABELS: Record<Locale, string> = {
  en: 'per 100k',
  de: 'pro 100k',
  es: 'por 100k',
}

interface StatCardProps {
  icon: string
  label: string
  value: string | null
  sub?: string
  highlight?: boolean
}

function StatCard({ icon, label, value, sub, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1.5 ${
        highlight
          ? 'bg-sky-50 border-sky-200'
          : 'bg-white border-slate-100'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">
          {label}
        </span>
      </div>
      {value !== null ? (
        <p className={`text-2xl font-bold leading-none ${highlight ? 'text-sky-700' : 'text-slate-800'}`}>
          {value}
        </p>
      ) : (
        <p className="text-sm text-slate-400 italic">N/A</p>
      )}
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

const i18n: Record<Locale, Record<string, string>> = {
  en: {
    healthProfile: 'Health Profile',
    lifeExpectancy: 'Life expectancy',
    male: 'Male',
    female: 'Female',
    hospitalBeds: 'Hospital beds / 100k',
    povertyRate: 'At-risk-of-poverty',
    population65: 'Population 65+',
    causeOfDeathRate: 'Cause-of-death rate (standardized)',
    source: 'Source: Eurostat',
    year: 'Year',
    nuts2: 'NUTS2',
    categoryNote: 'Rate reflects entire disease category, not individual condition.',
    dataYear: 'Data year',
    regionNote: 'Data covers the wider region, not the city alone.',
  },
  de: {
    healthProfile: 'Gesundheitsprofil',
    lifeExpectancy: 'Lebenserwartung',
    male: 'Männlich',
    female: 'Weiblich',
    hospitalBeds: 'Krankenhausbetten / 100k',
    povertyRate: 'Armutsgefährdungsquote',
    population65: 'Bevölkerung 65+',
    causeOfDeathRate: 'Todesursachenrate (standardisiert)',
    source: 'Quelle: Eurostat',
    year: 'Jahr',
    nuts2: 'NUTS2',
    categoryNote: 'Rate bezieht sich auf die gesamte Krankheitskategorie, nicht auf einzelne Erkrankungen.',
    dataYear: 'Datenjahr',
    regionNote: 'Daten beziehen sich auf die gesamte Region, nicht nur die Stadt.',
  },
  es: {
    healthProfile: 'Perfil de Salud',
    lifeExpectancy: 'Esperanza de vida',
    male: 'Masculino',
    female: 'Femenino',
    hospitalBeds: 'Camas hospitalarias / 100k',
    povertyRate: 'Riesgo de pobreza',
    population65: 'Población 65+',
    causeOfDeathRate: 'Tasa de mortalidad por causa (estandarizada)',
    source: 'Fuente: Eurostat',
    year: 'Año',
    nuts2: 'NUTS2',
    categoryNote: 'La tasa refleja la categoría de enfermedad completa, no la condición individual.',
    dataYear: 'Año de datos',
    regionNote: 'Los datos cubren la región más amplia, no solo la ciudad.',
  },
}

export default function CityHealthStats({
  stats,
  disease,
  lang,
}: {
  stats: CityHealthStats
  disease?: Disease
  lang: Locale
}) {
  const tx = (key: string) => i18n[lang]?.[key] ?? i18n.en[key] ?? key

  const causeCode = disease ? getCauseCode(disease.category) : null
  const highlightedRate = causeCode ? stats.causeOfDeathRates[causeCode] : null
  const highlightLabel = causeCode ? CAUSE_LABELS[causeCode]?.[lang] : null
  const unit = UNIT_LABELS[lang]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
      {/* Başlık */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            {stats.city} {tx('healthProfile')}
          </h2>
          {stats.year && (
            <p className="text-xs text-slate-400">
              {tx('dataYear')}: {stats.year} · {tx('nuts2')}: {stats.eurostatGeo}
              {stats.regionLabel && (
                <span className="ml-1">({stats.regionLabel})</span>
              )}
            </p>
          )}
        </div>
        <a
          href={`https://ec.europa.eu/eurostat/databrowser/explore/all/health`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-500 hover:text-sky-600 hover:underline whitespace-nowrap"
        >
          {tx('source')} ↗
        </a>
      </div>

      {/* Bölge uyarısı — şehir birebir NUTS2 değilse göster */}
      {stats.regionLabel && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <span className="text-amber-500 mt-0.5 shrink-0">⚠️</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            {tx('regionNote')}{' '}
            <span className="font-semibold">{stats.regionLabel}</span> ({stats.eurostatGeo})
          </p>
        </div>
      )}

      {/* Hastalığa özel ölüm hızı - öne çıkan kart */}
      {highlightLabel && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <span className="text-xs font-semibold text-sky-600 uppercase tracking-wide leading-tight">
              {highlightLabel}
            </span>
          </div>
          {highlightedRate !== null ? (
            <p className="text-2xl font-bold text-sky-700 leading-none">
              {highlightedRate.toFixed(1)}{' '}
              <span className="text-sm font-normal text-sky-500">{unit}</span>
            </p>
          ) : (
            <p className="text-sm text-sky-400 italic">N/A</p>
          )}
          <p className="text-xs text-sky-500">{tx('categoryNote')}</p>
        </div>
      )}

      {/* 2×2 ızgara kartlar */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="❤️"
          label={tx('lifeExpectancy')}
          value={
            stats.lifeExpectancy.total !== null
              ? `${stats.lifeExpectancy.total} yrs`
              : null
          }
          sub={
            stats.lifeExpectancy.male !== null && stats.lifeExpectancy.female !== null
              ? `${tx('male')}: ${stats.lifeExpectancy.male} · ${tx('female')}: ${stats.lifeExpectancy.female}`
              : undefined
          }
        />
        <StatCard
          icon="🏥"
          label={tx('hospitalBeds')}
          value={
            stats.hospitalBedsPer100k !== null
              ? `${stats.hospitalBedsPer100k.toFixed(0)}`
              : null
          }
          sub={stats.hospitalBedsPer100k !== null ? unit : undefined}
        />
        <StatCard
          icon="📉"
          label={tx('povertyRate')}
          value={
            stats.povertyRate !== null ? `${stats.povertyRate.toFixed(1)}%` : null
          }
        />
        <StatCard
          icon="👴"
          label={tx('population65')}
          value={
            stats.population65Plus !== null
              ? `${stats.population65Plus.toFixed(1)}%`
              : null
          }
        />
      </div>
    </div>
  )
}
