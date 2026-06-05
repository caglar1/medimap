import { ALL_DEPARTMENTS } from './departments'
import { OSM_TO_DEPARTMENT, VALID_DEPARTMENTS, osmSpecialitiesToDepartments, getUnknownTerms } from './speciality-map'

const DEPARTMENTS_REFERENCE = Object.entries(ALL_DEPARTMENTS)
  .map(([code, info]) => `- ${code}: ${info.label} ${info.icon}`)
  .join('\n')

const SYSTEM_PROMPT = `You are a medical coding assistant. Map OSM healthcare speciality terms to Clinical Department Codes.

Use ONLY the department reference table below:

${DEPARTMENTS_REFERENCE}

Valid codes: ${Array.from(VALID_DEPARTMENTS).sort().join(', ')}

--- MAPPING RULES ---

1. NON-CLINICAL SERVICES → return []
   These are not disease-treatment departments. Return empty array.
   - hypnosis: [] — not a recognised clinical department
   - radiology: [] — diagnostic support service, no direct patient routing
   - anesthesiology: [] — operative support, no outpatient routing
   - pathology: [] — laboratory support, not patient-facing
   - forensic_medicine: [] — not patient-facing clinical care
   - optician: [] — retail dispensing only, not a clinical department
   - Augenoptiker: [] — German dispensing optician (retail), not OPT1
   - unknown / unclear / ambiguous terms: [] — ONLY for terms with no recognizable medical specialty.
     Do NOT return [] for known medical terms in any language; use your language knowledge to map them.

2. PREVENTIVE / NON-TREATMENT SERVICES → map to PV1
   Prevents disease but does NOT treat active conditions.
   - vaccination: ["PV1"]
   - vaccination_centre: ["PV1"]
   - travel_clinic: ["PV1"] — pre-travel prophylaxis, not active treatment
   - preventive_medicine: ["PV1"]

3. SUB-SPECIALTIES → map to the MOST SPECIFIC single department, NOT the parent
   NEVER inflate a narrow speciality to a broad parent (e.g. not "M" for everything).
   - speech_therapist: ["PT1"] — rehabilitation modality; do NOT use "6" (psychology) or "A" (ENT)
   - speech_therapy: ["PT1"] — same as speech_therapist
   - rheumatology: ["R1"] — autoimmune joint disease; do NOT use "M" (internal) or "4" (allergy)
   - nephrology: ["OG1"] — kidney disease; do NOT use "M"
   - dialysis: ["DLZ1"] — standalone dialysis center; do NOT use "OG1"
   - dialysis_center: ["DLZ1"] — same as dialysis
   - palliative_medicine: ["PA1"] — end-of-life care; do NOT use "M"
   - pain_management: ["PA1"] — chronic pain; do NOT use "M"
   - endocrinology: ["5"] — hormonal/metabolic; do NOT use "M"
   - diabetology: ["5"] — diabetes is endocrinology; do NOT use "M"
   - oncology: ["2"] — solid tumor cancer care; do NOT use "3" (hematology) or "M"
   - hematology: ["3"] — blood disorders (non-cancer + blood cancers); do NOT use "2" (oncology) or "M"
   - haematology: ["3"] — same as hematology
   - urology: ["G"] — urinary/male reproductive; do NOT use "M" or "GS1"
   - ophthalmology: ["9"] — eye disease treatment; do NOT use "OPT1" (optometry=vision correction only)
   - urgent_care: ["UC1"] — walk-in clinic, non-emergency acute care; do NOT use "N" (N=A&E/trauma only)
   - urgent care: ["UC1"] — same as urgent_care (space variant)
   - walk_in_clinic: ["UC1"] — same as urgent_care
   - walk-in: ["UC1"] — same as walk_in_clinic
   - chiropractic: ["CHR1"] — spinal manipulation; do NOT use "PT1" (physio), "S" (traditional), "F" (orthopedics)
   - chiropractor: ["CHR1"] — same as chiropractic
   - osteopathy: ["OST1"] — manual structural therapy; do NOT use "S", "PT1", or "CHR1"
   - osteopath: ["OST1"] — same as osteopathy
   - optometry: ["OPT1"] — vision testing/correction; do NOT use "9" (ophthalmology treats eye disease, not refraction)
   - optometrist: ["OPT1"] — same as optometry
   - psychiatry: ["6"] — mental health; do NOT use "M"
   - dermatology: ["E"] — skin disease; do NOT use "M"
   - fertility: ["IVF1"] — IVF/fertility clinic; do NOT use "J" or "G"
   - ivf: ["IVF1"] — same as fertility
   - For any X_surgery compound term: use ONLY the named specialty, NEVER add GS1
     e.g. cardiac_surgery→["B"], thoracic_surgery→["C"], neurosurgery→["8"], pediatric_surgery→["K"], surgical_oncology→["2"]
   - surgery: ["GS1"] — ONLY for unspecified/generic surgery
   - general_surgery: ["GS1"] — same as surgery

4. LEGITIMATE MULTI-DEPARTMENT → term genuinely spans two distinct departments
   Only use two codes when BOTH departments are independently relevant.
   - neuro_pediatrics: ["8", "K"] — neurological AND pediatric
   - venereology: ["E", "H"] — dermatology AND sexual health both relevant

5. LANGUAGE VARIANTS — apply the same logic regardless of language
   - Kinderheilkunde / pediatría / pédiatrie: ["K"]
   - Frauenheilkunde / ginecología / gynécologie: ["J"]
   - Zahnheilkunde / odontología / dentisterie: ["DA0"]
   - Neurologie / neurología / neurologie: ["8"]
   - Kardiologie / cardiología / cardiologie: ["B"]
   - Augenheilkunde / oftalmología / ophtalmologie: ["9"]
   - Logopädie / logopedia / logopédie: ["PT1"] — speech therapy = rehabilitation
   - Rheumatologie / reumatología / rhumatologie: ["R1"]
   - allgemeine Medizin / medicina general / médecine générale: ["M"]
   - Schlafmedizin / medicina del sueño / médecine du sommeil: ["7"]
   - Chiropraktik / quiropráctica / chiropraxie: ["CHR1"]
   - Osteopathie / osteopatía / ostéopathie: ["OST1"]
   - Optometrie / optometría / optométrie: ["OPT1"]
   - Hämatologie / hematología / hématologie: ["3"]
   - Fertilitätsklinik / Reproduktionsmedizin / clínica de fertilidad / clinique de fertilité: ["IVF1"]
   - Dialysezentrum / Dialysepraxis / centro de diálisis / centre de dialyse: ["DLZ1"]
   - Nephrologie / nefrología / néfrologie: ["OG1"]
   - Psychiatrie / psiquiatría / psychiatrie: ["6"]
   - Onkologie / oncología / oncologie: ["2"]
   - Urologie / urología / urologie: ["G"]
   - Dermatologie / dermatología / dermatologie: ["E"]
   - Endokrinologie / endocrinología / endocrinologie: ["5"]
   - Palliativmedizin / medicina paliativa / soins palliatifs: ["PA1"]
   - Ergotherapie / terapia ocupacional / ergothérapie: ["PT1"]
   - Suchtmedizin / medicina de adicciones / médecine des addictions: ["6"]

Return valid JSON only, no explanation.`

export interface SpecialityDebug {
  unknownTerms: string[]
  systemPrompt: string
  rawResponse: string
  resolved: Record<string, string[]>
}

async function callAnthropic(unknownTerms: string[]): Promise<{ result: Record<string, string[]>; rawResponse: string }> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const model = process.env.SPECIALITY_LLM_MODEL ?? 'claude-haiku-4-5-20251001'

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Map these speciality terms to Clinical Department Codes. Return a JSON object where keys are the input terms and values are arrays of department codes.\n\n${JSON.stringify(unknownTerms)}`,
    }],
  })

  const text = response.content.find((b) => b.type === 'text')?.text ?? '{}'
  return { result: parseAndValidateLlmResponse(text, unknownTerms), rawResponse: text }
}

async function callOpenAI(unknownTerms: string[]): Promise<{ result: Record<string, string[]>; rawResponse: string }> {
  const OpenAI = (await import('openai')).default
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  })
  const model = process.env.SPECIALITY_LLM_MODEL ?? 'gpt-4o-mini'

  let extraParams: Record<string, any> = {}
  if (process.env.SPECIALITY_LLM_EXTRA_PARAMS) {
    try {
      extraParams = JSON.parse(process.env.SPECIALITY_LLM_EXTRA_PARAMS)
    } catch {
      // Do not log errors to console in production
    }
  }

  const response = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Map these speciality terms to Clinical Department Codes. Return a JSON object where keys are the input terms and values are arrays of department codes.\n\n${JSON.stringify(unknownTerms)}`,
      },
    ],
    response_format: { type: 'json_object' },
    ...extraParams,
  } as any)

  const text = response.choices[0]?.message?.content ?? '{}'
  return { result: parseAndValidateLlmResponse(text, unknownTerms), rawResponse: text }
}


function parseAndValidateLlmResponse(
  text: string,
  expectedTerms: string[]
): Record<string, string[]> {
  let raw: unknown
  try {
    const match = text.match(/\{[\s\S]*\}/)
    raw = JSON.parse(match ? match[0] : text)
  } catch {
    return Object.fromEntries(expectedTerms.map((t) => [t, []]))
  }

  // case-insensitive key lookup — LLM sometimes returns keys with different casing
  const rawObj = raw as Record<string, unknown>
  const lowercaseMap: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rawObj)) {
    lowercaseMap[k.toLowerCase()] = v
  }

  const result: Record<string, string[]> = {}
  for (const term of expectedTerms) {
    const val = rawObj[term] ?? lowercaseMap[term.toLowerCase()]
    if (Array.isArray(val)) {
      result[term] = val.filter((p): p is string => typeof p === 'string' && VALID_DEPARTMENTS.has(p))
    } else if (typeof val === 'string' && VALID_DEPARTMENTS.has(val)) {
      result[term] = [val]
    } else {
      result[term] = []
    }
  }
  return result
}

export async function resolveSpecialities(
  terms: string[]
): Promise<{ mapping: Record<string, string[]>; debug?: SpecialityDebug }> {
  if (!terms.length) return { mapping: {} }

  const mapping: Record<string, string[]> = {}
  for (const term of terms) {
    const mapped = OSM_TO_DEPARTMENT[term.toLowerCase()]
    if (mapped !== undefined) {
      mapping[term] = mapped.filter((p) => VALID_DEPARTMENTS.has(p))
    }
  }

  const unknowns = getUnknownTerms(terms)
  if (!unknowns.length) return { mapping }

  const provider = process.env.SPECIALITY_LLM_PROVIDER ?? 'anthropic'
  let llmResult: Record<string, string[]> = {}
  let rawResponse = ''

  try {
    const res = provider === 'openai'
      ? await callOpenAI(unknowns)
      : await callAnthropic(unknowns)
    llmResult = res.result
    rawResponse = res.rawResponse
  } catch (err) {
    for (const t of unknowns) llmResult[t] = []
    rawResponse = String(err)
  }

  const combined = { ...mapping, ...llmResult }

  return {
    mapping: combined,
    debug: {
      unknownTerms: unknowns,
      systemPrompt: SYSTEM_PROMPT,
      rawResponse,
      resolved: llmResult,
    },
  }
}

export function applyResolved(
  terms: string[],
  resolved: Record<string, string[]>
): string[] {
  const depts = new Set<string>()
  for (const term of terms) {
    for (const d of resolved[term] ?? osmSpecialitiesToDepartments([term])) {
      depts.add(d)
    }
  }
  return Array.from(depts).sort()
}
