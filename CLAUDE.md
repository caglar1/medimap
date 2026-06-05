# Medimapia

Global sağlık haritası platformu. Her hastalık sayfasında 3 blok: hastalık bilgisi + anket istatistikleri + yakındaki sağlık tesisleri.

## Dev Server

```bash
npm run dev -- --port 3000
# http://localhost:3000/en
```

## Stack

- **Next.js 14** App Router + SSG — `src/app/`
- **Tailwind CSS** + **react-leaflet@4.2.1** + **react-leaflet-cluster** (marker clustering) — React 18 uyumlu
- **Stadia Maps** tile layer (`alidade_smooth`) — OSM üstünde
- **Supabase yok** — veri `data/*.json` dosyalarında
- Diller: **EN / DE / ES**

## Sayfa Yapısı

```
/[lang]                          → hastalık dizini (homepage)
/[lang]/disease/[slug]           → 3-blok hastalık sayfası
/[lang]/disease/[slug]/[city]    → şehir bazlı sayfa + Eurostat istatistikleri
/[lang]/cities                   → şehir explorer (harita + ülke accordion + arama)
/[lang]/cities/[city]            → şehir profili (Eurostat + ICD chapter grupları + harita)
```

`slug` dile göre farklılaşır — `disease.slug[lang]` ile erişilir (string değil).

## Global Şehir Seçimi (Kullanıcı Tercihi)

Kullanıcının seçtiği şehir `localStorage` (`medimapia_city` key) + React Context ile tüm sayfalarda korunur.

**Dosyalar:**

- `src/lib/city-context.tsx` — `CityProvider`, `useCity()` hook (`selectedCity`, `setSelectedCity`)
- `src/app/[lang]/layout.tsx` — tüm `[lang]` sayfalarını `CityProvider` ile sarar
- `src/components/CityBadge.tsx` — Header'daki şehir göstergesi (seçilmemişse "Select city", seçiliyse `🇩🇪 Berlin ×`)
- `src/components/DiseaseFacilitySection.tsx` — Hastalık sayfasında city-aware harita; şehir seçiliyse otomatik filtreler, seçilmemişse şehir chip'leri gösterir
- `src/components/SetCityButton.tsx` — `/cities/[city]` sayfasında "Set as my city" / "Berlin ✓" butonu

**Şehir nasıl seçilir:**

1. Header'daki "Select city" → `/cities` sayfasına gider
2. `/cities` accordion'unda şehre tıklanınca → seçer + profil sayfasına gider
3. `/cities/[city]` sayfasındaki `SetCityButton` ile
4. Hastalık sayfasındaki city chip'lerine tıklayarak

**Etki:**

- Header her sayfada seçili şehri gösterir
- Hastalık sayfasındaki `FacilityMap` otomatik o şehre filtreler + uçar
- `×` butonu veya `clear_city` ile temizlenir

---

## Şehir Navigasyon Sistemi

**`data/config/cities.json`** — source of truth (slug, lat/lon, country, region, eurostatGeo)

**Yeni lib fonksiyonları** (`src/lib/data.ts`):

- `getAllCitiesConfig()` — tüm şehir config
- `getCityConfig(slug)` — tek şehir
- `getFacilitiesByCity(cityName)` — şehirdeki tüm tesisler
- `getDiseasesForCity(citySlug)` — şehirde tesisi olan hastalıklar (normalizeChapter tabanlı exact match — aşağıya bak)
- `getIcdChaptersByCity(citySlug)` — ICD chapter grupları (facilityCount ile)

**Yeni bileşenler:**

- `src/components/CityExplorerMap.tsx` — Leaflet harita + marker clustering (ssr:false)
- `src/components/CitiesExplorer.tsx` — client: arama + bölge filtre + ülke accordion

**`normalizeChapter` — tek kaynak kural sistemi (`src/lib/data.ts:39`, exported):**
`facilities.json`'daki `icd_chapters` raw Overpass değerleridir (`'GA'`, `'CA2'`, `'DA0'`, `'QA1'`). `normalizeChapter` bunları chip key'lerine çevirir ve tüm sistem bu tek fonksiyonu kullanır:

- **Chip display:** `getIcdChaptersByCity` → normalize → chip sayacı
- **Hastalık eşleştirme:** `getDiseasesForCity` → her iki taraf normalize → exact match
- **Pin filtresi:** city page server'da tesisleri normalize eder → `CitySpecialitiesFilter`'da `includes` ile exact match

Mevcut özel kurallar: `GA→J`, `CA0→A`, `GB/GC→G fallback`, `CA2+/CB→C fallback`, `DA0`/`QA1` ICD_CHAPTER_LABELS'ta explicit (gerçek ICD-11 alt-kodları).
**`startsWith` kullanılmaz** — `DA0.startsWith('D')` ve `QA1.startsWith('Q')` yanlış eşleşmelere yol açar.

**Yeni özel durum ekleme — karar matrisi:**

| Senaryo                                 |                 data.ts                 |      speciality-map.ts       |
| --------------------------------------- | :-------------------------------------: | :--------------------------: |
| Chip merge (GA→J gibi)                  |          ✓ `normalizeChapter`           |              —               |
| Yeni chip label/ikon                    |         ✓ `ICD_CHAPTER_LABELS`          |              —               |
| Yeni disease ICD prefix (DA0, QA1 gibi) | ✓ `getIcdPrefix` + `ICD_CHAPTER_LABELS` | tesise yansıması istenirse ✓ |
| Yeni OSM speciality terimi              |                    —                    |    ✓ `OSM_TO_ICD_PREFIX`     |
| Mevcut OSM terim → farklı prefix        |                    —                    |              ✓               |

Chip/hastalık eşleştirme için **data.ts** yeterli, yeni OSM terimi yakalamak için **speciality-map.ts** şart. Detay: `my-data/health-specialities.md`

**Scalability:** `react-leaflet-cluster` marker clustering, ülke accordion (300+ şehir), ICD chapter grupları (500+ hastalık)

**Yeni şehir eklemek:** `cities.json`'a slug+lat+lon+region ekle → connector butonlarına bas → commit

---

## Veri Katmanı (`data/`)

| Dosya             | İçerik                                                                |
| ----------------- | --------------------------------------------------------------------- |
| `diseases.json`   | 5 hastalık — tüm dil içerikleri gömülü                                |
| `facilities.json` | 15 dummy tesis (Berlin, London, NYC, Barcelona) + gerçek koordinatlar |
| `surveys.json`    | Pre-aggregate anket istatistikleri (dummy)                            |

Tüm okuma fonksiyonları: `src/lib/data.ts`

## Önemli Lib Dosyaları

- `src/lib/types.ts` — `Disease`, `Facility`, `Survey`, `Locale` tipleri
- `src/lib/i18n.ts` — `t(lang, key)` helper, `LOCALES` sabiti
- `src/lib/overpass.ts` — Nominatim geocoding + Overpass API (sadece connector'da kullanılır; `fetchFacilitiesInArea` area-based sorgu, `fetchFacilitiesNearby` radius fallback)
- `src/lib/eurostat.ts` — Eurostat API: yaşam beklentisi, hastane yatağı, nüfus istatistikleri
- `src/lib/speciality-map.ts` — OSM `healthcare:speciality` → ICD-11 chapter prefix statik map
- `src/lib/speciality-resolver.ts` — Speciality → ICD chapter çözümleyici (statik map + LLM fallback)

## Kritik Konfigürasyon

`next.config.mjs`:

```js
transpilePackages: ["react-leaflet", "@react-leaflet/core"];
```

Bu olmadan react-leaflet (ESM) derlenmez.

`src/app/layout.tsx`:

```ts
import "leaflet/dist/leaflet.css";
```

Leaflet CSS buraya import edilmeli — istemci bileşen içinde değil.

## FacilityMap Harita Mantığı

1. Sayfa yüklenince → `facilities.json`'dan anında gösterim
2. Şehir seçilince (header/chip) → `facilities.json` üzerinde şehir merkezi etrafında **haversine 10km** filtresi → "Facilities within 10km of X center" bilgi yazısı
3. "Konumumu Kullan" → browser geolocation → `facilities.json` üzerinde **haversine 5km** filtresi → "Facilities within 5km of your location" bilgi yazısı
4. Arama kutusu yok — şehir seçimi header/chip üzerinden yapılır
5. Overpass bağımlılığı yok — FacilityMap sadece cache'i kullanır

`dynamic(() => import('@/components/FacilityMap'), { ssr: false })` ile import edilmeli.

**`src/lib/utils.ts`** — `haversineKm(lat1, lng1, lat2, lng2): number` helper (FacilityMap ve DiseaseFacilitySection kullanır)

## Connectors (`/connectors`)

Admin sayfası — dil yok, sadece İngilizce. Veri kaynaklarını görüntüler ve günceller.

**Şehir konfigürasyonu:** `data/config/cities.json` — NUTS2 kodu, Wikidata ID ve admin level burada tanımlanır.

**Cache dosyaları:**
| Dosya | İçerik |
|---|---|
| `data/cache/eurostat.json` | Şehir bazlı Eurostat istatistikleri (city → data + updatedAt) |
| `data/cache/overpass.json` | Şehir bazlı ham OSM tesis listesi (city → facilities + updatedAt) |

**Güncelleme akışı:**

1. `/connectors` → Update butonu → Server Action (`src/app/connectors/actions.ts`)
2. Eurostat: Canlı API → `eurostat.json` cache'e yazar
3. Overpass: wikidata+adminLevel → wikidata → adminLevel → Nominatim fallback → Overpass sorgu → `overpass.json` + `facilities.json` merge
4. `revalidatePath('/', 'layout')` ile tüm sayfalar yenilenir

**Speciality → ICD-11 chapter mapping (Overpass update sırasında):**

- OSM'den `healthcare:speciality` (`;` ile ayrılmış) ve `emergency` tag'leri çekilir
- `src/lib/speciality-map.ts` — bilinen İngilizce OSM terimlerini ICD-11 prefix'lerine çevirir (statik, I/O yok)
- Statik map'te bulunmayan terimler (Almanca, yazım varyantları vb.) LLM'e batch olarak gönderilir
- LLM system prompt'unda `icd-codes/icd_11_chapters_en.md` referans tablosu + geçerli prefix listesi bulunur → hallucination engellenir
- Provider `.env.local`'da seçilir: `SPECIALITY_LLM_PROVIDER=anthropic` (default) veya `openai`
- LLM şehir başına tek çağrı yapar (tüm unique bilinmeyen terimler batch)
- Sonuçlar `Facility.specialities` (raw OSM) + `Facility.icd_chapters` (prefix char dizisi) olarak saklanır
- `Facility.emergency: boolean` — OSM `emergency=yes` tag'inden gelir

**Env vars (`.env.local`):**

```
SPECIALITY_LLM_PROVIDER=anthropic   # veya: openai
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://...         # opsiyonel, openai-compatible endpoint
SPECIALITY_LLM_MODEL=...            # opsiyonel model override
```

**`facilities.json` merge kuralları:**

- `osm_id` + `claimed: false` → OSM verisiyle güncellenir, yeni Overpass'ta yoksa silinir
- `osm_id` + `claimed: true` → güncellenmez (manuel doğrulanmış)
- `osm_id: null` → hiç dokunulmaz (tamamen manuel tesis)

**Yeni şehir eklemek:**

1. `data/config/cities.json`'a ekle (`eurostatGeo` yoksa `null` bırak)
2. `/connectors`'da Eurostat + Overpass Update butonlarına bas
3. `git add data/ && git commit && git push`

## Yeni Hastalık Eklemek

1. `data/diseases.json`'a ekle (slug her dil için ayrı)
2. `data/surveys.json`'a anket soruları ekle
3. İlgili tesisleri `data/facilities.json`'da `diseases[]` dizisine ekle
