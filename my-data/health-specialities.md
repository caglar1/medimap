# Health Specialities ↔ ICD-11 Eşleştirme Tablosu

Şehir sayfasındaki chip'ler `ICD_CHAPTER_LABELS` (`src/lib/data.ts:8`) içinden gelir.
OSM tesislerindeki `healthcare:speciality` tag'leri `src/lib/speciality-map.ts` üzerinden ICD prefix'lerine çevrilir.

|         ICD-11 Prefix          | ICD-11 Bölüm Adı                                                | UI Etiketi (chip)                                | İkon | Eşleşen OSM Terimleri (örnek)                                                                                   |
| :----------------------------: | --------------------------------------------------------------- | ------------------------------------------------ | :--: | --------------------------------------------------------------------------------------------------------------- |
|             **1**              | Certain Infectious or Parasitic Diseases                        | Infectious Diseases                              |  🦠  | `infectious_diseases`, `microbiology`, `tropical_medicine`, `vaccination`                                       |
|             **2**              | Neoplasms — Oncology                                            | Oncology                                         |  🎗️  | `oncology`, `medical_oncology`, `radiation_oncology`, `surgical_oncology`                                       |
|             **3**              | Blood or Blood-forming Organs                                   | Blood & Hematology                               |  🩸  | `hematology`, `haematology`                                                                                     |
|             **4**              | Immune System                                                   | Immunology & Allergy                             |  🛡️  | `immunology`, `allergy`, `allergology`                                                                          |
|             **5**              | Endocrine, Nutritional or Metabolic                             | Endocrine & Metabolic                            |  ⚗️  | `endocrinology`, `diabetology`, `dietetics`, `nutrition`, `weight_loss`                                         |
|             **6**              | Mental, Behavioural or Neurodevelopmental                       | Mental Health                                    |  🧠  | `psychiatry`, `psychology`, `clinical_psychology`, `psychotherapy`, `child_psychiatry`                          |
|             **7**              | Sleep-Wake Disorders                                            | Sleep Medicine                                   |  😴  | `sleep_medicine`, `neurology`, `neuropsychology`                                                                |
|             **8**              | Nervous System — Neurology                                      | Neurology                                        |  🧠  | `neurology`, `neurosurgery`, `neuropsychology`                                                                  |
|             **9**              | Visual System — Ophthalmology                                   | Ophthalmology                                    |  👁️  | `ophthalmology`                                                                                                 |
|             **A**              | Diseases of the Ear or Mastoid Process                          | ENT                                              |  👂  | `otolaryngology`, `ent`, `audiology`, `ear_nose_throat`, `speech_therapist`                                     |
|             **B**              | Circulatory System — Cardiology                                 | Cardiology                                       |  ❤️  | `cardiology`, `cardiovascular_surgery`, `cardiac_surgery`, `angiology`                                          |
| **C** (CA2/CA4/CA6/CA7/CA8/CB) | Respiratory System — Pulmonology                                | Pulmonology                                      |  🫁  | `pulmonology`, `pneumology`, `thoracic_surgery`, `chest_diseases`, `respirology`                                |
|         **DA0**         | Oral Cavity — Chapter 13 (Digestive) alt-kodu (ICD-11 gerçek kod)| Dentistry                                        |  🦷  | `dentist`, `dentistry`, `orthodontics`, `implantology`, `stomatology`                                           |
|             **E**              | Diseases of the Skin — Dermatology                              | Dermatology                                      |  🩹  | `dermatology`, `venereology`, `dermatovenerology`, `plastic_surgery`                                            |
|             **F**              | Musculoskeletal System or Connective Tissue                     | Musculoskeletal                                  |  🦴  | `orthopedics`, `rheumatology`, `physiotherapy`, `sports_medicine`, `traumatology`                               |
|      **GA** → merge **J**      | Genitourinary — Gynecology (female genital conditions)          | Obstetrics & Gynecology                          |  🤰  | `gynecology`, `gynaecology`, `obstetrics_gynaecology`                                                           |
|  **GB / GC** → fallback **G**  | Genitourinary — Urology                                         | Urology                                          |  🫘  | `urology`                                                                                                       |
|             **H**              | Sexual Health                                                   | Sexual Health                                    |  ❤️‍🩹  | `sexual_health`, `sexual_medicine`, `venereology`, `dermatovenerology`                                          |
|             **J**              | Pregnancy, Childbirth or Puerperium                             | Obstetrics & Gynecology                          |  🤰  | `obstetrics`, `midwifery`, `maternity`                                                                          |
|             **K**              | Perinatal Period                                                | Neonatology & Pediatrics                         |  👶  | `pediatrics`, `paediatrics`, `neonatology`                                                                      |
|             **L**              | Developmental Anomalies                                         | Developmental Medicine                           |  🧬  | `pediatric_surgery`, `paediatric_surgery`, `plastic_surgery`                                                    |
|             **M**              | Symptoms, Signs or Clinical Findings                            | General Medicine                                 |  🏥  | `general`, `general_practitioner`, `family_medicine`, `internal_medicine`, `geriatrics`, `community`            |
|             **N**              | Injury, Poisoning or External Causes                            | Emergency & Trauma                               |  🚑  | `emergency_medicine`, `emergency`, `trauma`, `accident_emergency`, `traumatology`                               |
|             **P**              | External Causes of Morbidity                                    | Public Health                                    |  🌍  | `forensic_medicine`, `public_health`                                                                            |
|             **Q**              | Factors Influencing Health Status                               | Preventive Medicine                              |  🩺  | `vaccination`, `family_medicine`, `occupational_medicine`, `preventive_medicine`, `general_practitioner`        |
|            **QA1**             | Factors Influencing Health Status — Cosmetic/Aesthetic alt-kodu | Aesthetic & Cosmetic Surgery                     |  ✨  | `plastic_surgery`                                                                                               |
|             **R**              | Codes for Special Purposes                                      | Special Purposes                                 |  🔴  | `intensive_care`, `icu`, `critical_care`, `emergency_medicine`                                                  |
|             **S**              | Traditional Medicine                                            | Traditional Medicine                             |  🌿  | `acupuncture`, `homeopathy`, `naturopathy`, `traditional_chinese_medicine`, `ayurveda`, `reflexology`           |
|             **V**              | Functioning Assessment — Rehabilitation                         | _(chip label tanımlı değil — F altında görünür)_ |  —   | `rehabilitation`, `physiotherapy`, `occupational_therapy`, `physiatry`                                          |
| **OG1** _(custom)_             | Nephrology — Kidney Disease                                     | Nephrology                                       |  💧  | `nephrology`                                                                                                    |
| **DLZ1** _(custom)_            | Dialysis Centers — Standalone                                   | Dialysis Centers                                 |  🫧  | `dialysis`, `dialysis_center`                                                                                   |
| **IVF1** _(custom)_            | Fertility & IVF Centers                                         | Fertility & IVF Centers                          |  🐣  | `fertility`, `ivf`, `ivf_clinic`                                                                                |
| **UC1** _(custom)_             | Urgent Care Centers                                             | Urgent Care Centers                              |  ⚡  | `urgent_care`, `walk_in_clinic`, `walk_in`                                                                      |
| **CHR1** _(custom)_            | Chiropractic                                                    | Chiropractic                                     |  🤸  | `chiropractic`, `chiropractor`                                                                                  |
| **OST1** _(custom)_            | Osteopathy                                                      | Osteopathy                                       |  🖐️  | `osteopathy`, `osteopath`                                                                                       |
| **OPT1** _(custom)_            | Optometry & Vision Care                                         | Optometry & Vision Care                          |  👓  | `optometry`, `optometrist`                                                                                      |

---

## Özel Prefix Kuralları

Aşağıdaki üç prefix standart ICD-11 chapter sınırlarını aşar; hastalık tarafı ve tesis tarafında ayrı ayrı özel mantık uygulanır. ( lib/data.ts dosyasında function normalizeChapter kısmında tanımlılar)

---

### DA0 (Dentistry — gerçek ICD-11 alt-kodu)

**Tesis tarafı** (`src/lib/speciality-map.ts` → `src/lib/data.ts`)

```
OSM: dentist / dentistry / orthodontics / implantology / stomatology
  → speciality-map.ts: ['DA0']
  → facility.icd_chapters: ['DA0']
  → normalizeChapter('DA0') → ICD_CHAPTER_LABELS'ta var → chip: 🦷 Dentistry
```

**Hastalık tarafı** (`src/lib/data.ts` → `getIcdPrefix`)

```
icd11_code: 'DA0x'  (oral cavity / diş hastalıkları)
  → getIcdPrefix: code.startsWith('DA0') → 'DA0'
  → getDiseasesForCity: prefixes.has('DA0') → eşleşir ✓
```

**Neden gerekli:** ICD-11 Chapter 13 (`D` = Digestive) içinde `DA0x` diş/ağız, `DA1x+` ise gastroenteroloji için ayrılmıştır. Bu kural olmadan diş klinikleri **💊 Gastroenterology** chip'i altında görünürdü. (Daha önce `DENTAL` uydurma prefix'i kullanılıyordu, şimdi gerçek ICD-11 alt-kodu olan `DA0`'a geçildi — `QA1` ile aynı patern.)

---

### GA → J (Gynecology → Obstetrics & Gynecology)

**Tesis tarafı** (`src/lib/speciality-map.ts` → `src/lib/data.ts` → `src/components/CitySpecialitiesFilter.tsx`)

```
OSM: gynecology / gynaecology / obstetrics_gynaecology / fertility
  → speciality-map.ts: ['GA']
  → facility.icd_chapters: ['GA']
  → normalizeChapter('GA') → özel kural → 'J'
  → chip: 🤰 Obstetrics & Gynecology

  CitySpecialitiesFilter — matchesChapter:
  CHAPTER_ALIASES: { GA → J }
  J chip'ine tıklanınca GA tesisleri de filtreye girer ✓
```

**Hastalık tarafı** (`src/lib/data.ts` → `getIcdPrefix`)

```
icd11_code: 'GA0x'  (jinekolojik hastalıklar)
  → getIcdPrefix: code.startsWith('G') → code.slice(0,2) = 'GA'
  → getDiseasesForCity: prefixes.has('GA') → eşleşir ✓
```

**Neden gerekli:** ICD-11 Chapter G (Genitourinary) içinde `GA` kadın genital hastalıkları, `GB`/`GC` ise üroloji/nefrolojidir. `GA`'yı ayrı bir chip yapmak yerine obstetrics (`J`) ile birleştirmek daha anlamlı bir kullanıcı deneyimi sunar. `GB`/`GC` standart fallback ile `G` → **🫘 Urology & Nephrology** chip'ine düşer.

---

### CA0 → A (ENT — Upper Respiratory)

**Tesis tarafı** (`src/lib/speciality-map.ts` → `src/lib/data.ts` → `src/components/CitySpecialitiesFilter.tsx`)

```
OSM: otolaryngology / ent / audiology / ear_nose_throat / speech_therapist
  → speciality-map.ts: ['A', 'CA0']
  → facility.icd_chapters: ['A', 'CA0']
  → normalizeChapter('A')   → 'A' → chip: 👂 ENT ✓
  → normalizeChapter('CA0') → özel kural → 'A' → chip: 👂 ENT ✓ (bug fix)

  CitySpecialitiesFilter — matchesChapter:
  CHAPTER_ALIASES: { CA0 → A }
  A chip'ine tıklanınca CA0 tesisleri de filtreye girer ✓
```

**Hastalık tarafı** (`src/lib/data.ts` → `getIcdPrefix`)

```
icd11_code: 'CA0x'  (üst solunum yolu — burun, sinüs, gırtlak)
  → getIcdPrefix: code.startsWith('CA') → code.slice(0,3) = 'CA0'
  → getDiseasesForCity: prefixes.has('CA0') → eşleşir ✓
```

**Neden gerekli:** ICD-11 Chapter C (Respiratory) içinde `CA0` üst solunum yolu (ENT), `CA2+` ise alt solunum yolu (Pulmonology) için ayrılmıştır. Kural olmadan `CA0`'ın fallback'i `ch[0]` = `'C'` olur → ENT tesisleri **🫁 Pulmonology** chip'ine sayılırdı.

---

### QA1 (Aesthetic & Cosmetic Surgery)

**Tesis tarafı** (`src/lib/speciality-map.ts` → `src/lib/data.ts`)

```
OSM: plastic_surgery
  → speciality-map.ts: ['E', 'F', 'L', 'N', 'QA1']
  → facility.icd_chapters: [..., 'QA1']
  → normalizeChapter('QA1') → ICD_CHAPTER_LABELS'ta var → chip: ✨ Aesthetic & Cosmetic Surgery
```

**Hastalık tarafı** (`src/lib/data.ts` → `getIcdPrefix`)

```
icd11_code: 'QA1x'  (kozmetik/estetik amaçlı girişimler)
  → getIcdPrefix: code.startsWith('QA1') → 'QA1'
  → getDiseasesForCity: prefixes.has('QA1') → eşleşir ✓
```

**Neden gerekli:** ICD-11 Chapter Q (`Factors influencing health status`) içinde `QA1x` kozmetik amaçlı girişimlere ayrılmıştır. Standart fallback ile `Q[0]` = `'Q'` olur ve tesis **🩺 Preventive Medicine** chip'ine düşerdi — anlamsız.

---

## Diğer Notlar

**CA0 → A özel kuralı için aşağıdaki bölüme bakın.**

**V (Rehabilitation):**
`ICD_CHAPTER_LABELS`'ta kayıt yok; rehabilitasyon tesisler `F` (Musculoskeletal) chip'i altında görünür.

**Cross-cutting terimler:**
`radiology`, `anesthesiology`, `pathology`, `laboratory` hiçbir ICD prefix'e bağlı değil (`[]`). Bu tesisler chapter filtrelerinde görünmez, "All" modunda haritada yer alır.

---

## normalizeChapter — Tek Kaynak Kural Sistemi

`src/lib/data.ts:39` — `export function normalizeChapter(ch: string): string | null`

`facilities.json`'daki `icd_chapters` değerleri Overpass'tan **raw** gelir (`'GA'`, `'CA2'`, `'DA0'`, `'QA1'`). `normalizeChapter` bu ham değerleri chip key'lerine çevirir. Tüm sistem bu tek fonksiyonu kullanır:

| Kullanım yeri | Nasıl kullanır |
|---|---|
| **Chip display** — `getIcdChaptersByCity` | Tesis icd_chapters → normalize → chip'e sayar |
| **Hastalık eşleştirme** — `getDiseasesForCity` | Tesis + hastalık prefix → normalize → exact match |
| **Pin filtresi** — city page → `CitySpecialitiesFilter` | Tesisler server'da normalize edilir, client'ta `includes` |

**Neden startsWith değil — exact match:**
`startsWith` tabanlı hiyerarşik eşleştirme `DA0` ve `QA1` gibi özel prefix'lerin `'D'` ve `'Q'` ile yanlış eşleşmesine yol açıyordu. Normalizasyon her iki tarafı aynı chip key'ine getirdiğinden exact match yeterli ve güvenli.

**Mevcut kurallar:**

| Ham prefix | normalizeChapter sonucu | Neden |
|---|---|---|
| `GA` | `J` | Jinekoloji → Obstetrics & Gynecology chip |
| `CA0` | `A` | Üst solunum → ENT chip (Pulmonology'e düşmemesi için) |
| `GB`, `GC` | `G` | Üroloji/Nefroloji — fallback (ch[0]) |
| `CA2`, `CA4`, `CA6`, `CA7`, `CA8`, `CB` | `C` | Alt solunum — fallback (ch[0]) |
| `DA0` | `DA0` | Diş — ICD-11 gerçek alt-kodu, ICD_CHAPTER_LABELS'ta explicit |
| `QA1` | `QA1` | ICD_CHAPTER_LABELS'ta explicit — değişmez |

---

### Yeni Özel Durum Eklemek — Karar Matrisi

Edge case türüne göre hangi dosyaların değiştirileceği:

| Senaryo | data.ts | speciality-map.ts |
|---|:---:|:---:|
| Chip merge kuralı (GA→J gibi) | ✓ `normalizeChapter` | — |
| Yeni chip label/ikon | ✓ `ICD_CHAPTER_LABELS` | — |
| Yeni disease ICD prefix (DA0, QA1 gibi) | ✓ `getIcdPrefix` + `ICD_CHAPTER_LABELS` | tesise de yansıması istenirse ✓ |
| Yeni OSM speciality terimi | — | ✓ `OSM_TO_ICD_PREFIX` |
| Mevcut OSM terim → farklı prefix | — | ✓ |

**Genel kural:** Chip ve hastalık eşleştirme mantığı için **data.ts** yeterli. Tesis veri kaynağına yeni OSM terimi eklemek için **speciality-map.ts** şart.

---

### Eklenebilecek Yerler (data.ts)

```ts
// 1. ICD_CHAPTER_LABELS — yeni chip için label
'XYZ': { label: 'Yeni Bölüm', icon: '🔵' },

// 2. normalizeChapter — chip merge / raw → chip key dönüşümü
if (ch === 'XYZ') return 'B'   // veya başka chip key'e yönlendir

// 3. getIcdPrefix — yeni disease ICD prefix yakalama
if (code.startsWith('XYZ')) return 'XYZ'
```

### Eklenebilecek Yerler (speciality-map.ts)

```ts
// OSM_TO_ICD_PREFIX — OSM terimi → raw ICD prefix
yeni_osm_terim: ['XYZ'],

// VALID_PREFIXES set'ine yeni prefix ekle
'XYZ',
```

Bu değişiklikler otomatik olarak **chip display**, **hastalık eşleştirme** ve **pin filtresi**'ne yansır.
