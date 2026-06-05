# Çoklu Dil Yönetimi — Medimapia i18n Referansı

## Mimari: İki Katman

### Katman 1 — UI String'leri (statik metinler)

- **Yer:** `src/locales/en.json`, `de.json`, `es.json`
- **Kullanım:** `t(lang, key)` helper → `src/lib/i18n.ts`
- **Fallback zinciri:** `dicts[locale][key]` → `dicts['en'][key]` → key kendisi
- **Örnek key'ler:** `nav_home`, `hero_title`, `dept_cardiology`, `btn_next`

### Katman 2 — İçerik Verisi (hastalık, anket)

- **Yer:** `data/diseases/*.json` (her hastalık ayrı dosya) + `data/surveys.json`
- Her çevrilebilir alan `LocalizedString = Record<Locale, string>` tipinde
- Diziler için `LocalizedStringArray = Record<Locale, string[]>`
- Örnek:
  ```json
  "name": { "en": "Hypertension", "de": "Bluthochdruck", "es": "Hipertensión arterial" }
  "slug": { "en": "hypertension", "de": "bluthochdruck", "es": "hipertension" }
  ```

---

## Kritik Dosyalar

| Dosya | Rol |
|---|---|
| `src/lib/types.ts` | `Locale` union tipi, `LocalizedString`, `LocalizedStringArray` |
| `src/lib/i18n.ts` | `LOCALES` dizisi, `LOCALE_LABELS`, `t()` helper |
| `src/locales/en\|de\|es.json` | UI string sözlükleri (~194 key) |
| `data/diseases/*.json` | Per-disease içerik (name, summary, symptoms, slug — tüm diller) |
| `data/surveys.json` | Anket soru/seçenek çevirileri |
| `data/diseases-index.json` | Hafif index (id, slug, name, category) — client component import eder |
| `scripts/generate-disease-index.js` | `predev`/`prebuild`'de otomatik çalışır, index'i `data/diseases/` dizininden üretir |
| `scripts/check-i18n.js` | Eksik çeviri tarayıcı — `npm run check-i18n` |

---

## URL Yönlendirme Mantığı

- Tüm sayfalar `src/app/[lang]/...` altında
- `generateStaticParams()` her sayfada `LOCALES.map(lang => ({ lang }))` döner → yeni dil eklenince rotalar otomatik üretilir
- Hastalık sayfaları slug'u dil bazında çözer:
  ```ts
  LOCALES.flatMap(lang => getDiseases().map(d => ({ lang, slug: d.slug[lang] })))
  ```
- `LanguageSwitcher` (`src/components/LanguageSwitcher.tsx`):
  - `diseaseSlugMap?: Record<Locale, string>` prop alır
  - Dil değiştirilince `pathname` içindeki mevcut slug'ı hedef dilin slug'ıyla değiştirir
  - Disease sayfalarında `disease.slug` direkt prop olarak geçilir

---

## `data.ts` Veri Okuma Akışı

```
npm run dev / build
  → prebuild hook: generate-disease-index.js
      → data/diseases/*.json'ı okur
      → data/diseases-index.json'ı yazar (client component için)
  → Next.js build
      → src/lib/data.ts :: readDiseases()
          → data/diseases/*.json'dan memoize'li okuma
          → Disease[] döner
      → getDiseases(), getDiseaseBySlug(), getDiseasesForCity() vb.
          → tümü readDiseases()'ı kullanır
```

---

## Yeni Dil Ekleme — Adım Adım

**Örnek: Fransızca (`fr`) ekleme**

### Adım 1 — `Locale` union'ına ekle

```ts
// src/lib/types.ts
export type Locale = 'en' | 'de' | 'es' | 'fr'
```

### Adım 2 — `i18n.ts`'e ekle

```ts
// src/lib/i18n.ts
export const LOCALES: Locale[] = ['en', 'de', 'es', 'fr']

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français',
}

const dicts = {
  en: require('../locales/en.json'),
  de: require('../locales/de.json'),
  es: require('../locales/es.json'),
  fr: require('../locales/fr.json'),   // ← ekle
}
```

### Adım 3 — `src/locales/fr.json` oluştur

`en.json`'daki tüm key'leri kopyala, değerleri Fransızcaya çevir.
Eksik key'ler `t()` fallback'i sayesinde İngilizce gösterir — build kırılmaz.
Kontrol: `npm run check-i18n`

### Adım 4 — Her `data/diseases/*.json` dosyasına `fr` alanları ekle

Eklenecek alanlar: `slug.fr`, `name.fr`, `summary.fr`, `symptoms.fr`,
her `routing_departments[].clinical_role.fr`

```json
"slug":    { "en": "hypertension", "de": "bluthochdruck", "es": "hipertension", "fr": "hypertension" },
"name":    { "en": "Hypertension", "de": "Bluthochdruck", "es": "Hipertensión arterial", "fr": "Hypertension artérielle" },
"symptoms": { "en": ["..."], "de": ["..."], "es": ["..."], "fr": ["..."] }
```

`data/surveys.json` içindeki `questions[].label` ve `options[].label` alanlarına da `fr` ekle.

### Adım 5 — Kontrol

```bash
npm run check-i18n     # tüm eksikleri listeler, exit 1 ile hata varsa durur
npm run dev
# /fr rotaları otomatik üretildi (generateStaticParams LOCALES'ı kullanır)
# /fr/disease/hypertension → Fransızca içerik
```

---

## `check-i18n` Script'inin Kapsamı

`npm run check-i18n` (`scripts/check-i18n.js`) şunları kontrol eder:

1. Her `data/diseases/*.json`'da `slug`, `name`, `summary` — tüm LOCALES mevcut ve dolu mu?
2. Her `data/diseases/*.json`'da `symptoms` dizisi — tüm LOCALES mevcut, boş değil mi?
3. Her `routing_departments[].clinical_role` — tüm LOCALES mevcut ve dolu mu?
4. `src/locales/de.json` ve `es.json`'da `en.json`'ın tüm key'leri var mı? Boş key var mı?
5. LOCALES listesi `src/locales/*.json` dosyalarından otomatik türetilir — yeni dil eklenince script kendiliğinden o dili de kapsar.

Hata varsa **exit code 1** döner (CI gate olarak kullanılabilir).

---

## Kaçınılması Gereken Hatalar

- **`LanguageSwitcher`'a `diseaseSlugMap` vermemek** → dil değiştirince 404 (hastalık sayfalarında her zaman `disease.slug` prop'u geç)
- **`surveys.json`'a yeni dil alanlarını eklemeyi unutmak** → survey bileşeni `undefined` döner, sayfa kırılır
- **`data/diseases-index.json`'ı elle düzenlemek** → `predev`/`prebuild`'de üzerine yazılır, değişiklik kaybolur
- **`src/locales/fr.json` olmadan `LOCALES`'a `'fr'` eklemek** → `require` hatası; önce dosyayı oluştur, sonra `LOCALES`'a ekle
