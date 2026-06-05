import { ALL_DEPARTMENTS } from './departments'

export const OSM_TO_DEPARTMENT: Record<string, string[]> = {
  // Chapter 1 — Infectious Diseases
  infectious_diseases: ['1'],
  microbiology: ['1'],
  tropical_medicine: ['1'],
  vaccination: ['PV1'],
  vaccination_centre: ['PV1'],

  // Chapter 2 — Oncology
  oncology: ['2'],
  medical_oncology: ['2'],
  radiation_oncology: ['2'],
  surgical_oncology: ['2'],

  // Chapter 3 — Hematology (grouped under Oncology)
  hematology: ['3'],
  haematology: ['3'],

  // Chapter 4 — Immunology / Allergy / Rheumatology
  immunology: ['4'],
  allergy: ['4'],
  allergology: ['4'],
  rheumatology: ['R1'],

  // Chapter 5 — Endocrinology / Metabolic
  endocrinology: ['5'],
  diabetology: ['5'],
  dietetics: ['DN1'],
  nutrition: ['DN1'],
  weight_loss: ['DN1'],

  // Chapter 6 — Psychiatry / Psychology
  psychiatry: ['6'],
  psychology: ['6'],
  clinical_psychology: ['6'],
  child_psychiatry: ['6'],
  psychotherapy: ['6'],
  psychotherapist: ['6'],
  behavior: ['6'],
  hypnosis: [],

  // Chapter 7+8 — Neurology
  neurology: ['8'],
  neurosurgery: ['8'],
  sleep_medicine: ['7'],
  neuropsychology: ['8'],

  // Chapter 9 — Ophthalmology
  ophthalmology: ['9'],
  optometry: ['OPT1'],
  optometrist: ['OPT1'],
  optician: [],

  // Chapter A + CA0 — ENT
  otolaryngology: ['A'],
  otorhinolaryngology: ['A'],
  ent: ['A'],
  audiology: ['A'],
  audiologist: ['A'],
  speech_therapist: ['PT1'],
  ear_nose_throat: ['A'],

  // Chapter B — Cardiology
  cardiology: ['B'],
  cardiovascular_surgery: ['B'],
  cardiac_surgery: ['B'],
  angiology: ['B'],

  // Chapter C — Pulmonology
  pulmonology: ['C'],
  pneumology: ['C'],
  thoracic_surgery: ['C'],
  chest_diseases: ['C'],
  respirology: ['C'],

  // Chapter D — Gastroenterology & Gen Surgery
  gastroenterology: ['D'],
  general_surgery: ['GS1'],
  hepatology: ['D'],
  proctology: ['D'],
  coloproctology: ['D'],

  // Chapter E — Dermatology
  dermatology: ['E'],
  venereology: ['E', 'H'],
  dermatovenerology: ['E', 'H'],
  dermatovenereology: ['E', 'H'],

  // Chapter F — Musculoskeletal / Orthopedics / Physiotherapy
  physiotherapist: ['PT1'],
  podiatry: ['F'],
  orthopedics: ['F'],
  orthopaedics: ['F'],
  orthopedic_surgery: ['F'],
  orthopaedic_surgery: ['F'],
  physical_therapy: ['PT1'],
  physiotherapy: ['PT1'],
  sports_medicine: ['F'],
  traumatology: ['F'],
  chiropractic: ['CHR1'],
  chiropractor: ['CHR1'],
  osteopathy: ['OST1'],
  osteopath: ['OST1'],
  plastic_surgery: ['QA1'],
  physiatry: ['PT1'],
  massage_therapy: ['PT1'],
  kinesitherapy: ['PT1'],

  // Chapter G — Genitourinary
  urology: ['G'],
  nephrology: ['OG1'],
  dialysis: ['DLZ1'],
  dialysis_center: ['DLZ1'],

  // Chapter GA — Gynecology / Chapter J — Obstetrics
  gynecology: ['J'],
  gynaecology: ['J'],
  obstetrics: ['J'],
  obstetrics_gynaecology: ['J'],
  obstetrics_gynecology: ['J'],
  midwifery: ['J'],
  maternity: ['J'],
  fertility: ['IVF1'],
  ivf: ['IVF1'],
  ivf_clinic: ['IVF1'],

  // Chapter K+L — Pediatrics / Neonatology
  pediatrics: ['K'],
  paediatrics: ['K'],
  neonatology: ['K'],
  pediatric_surgery: ['K'],
  paediatric_surgery: ['K'],

  // Chapter M+Q — General / Family / Internal medicine
  general: ['M'],
  general_practitioner: ['M'],
  family_medicine: ['M'],
  internal_medicine: ['M'],
  internal: ['M'],
  community: ['M'],
  geriatrics: ['M'],
  occupational_medicine: ['M'],
  preventive_medicine: ['M'],

  // Chapter N+R — Emergency / Trauma
  emergency_medicine: ['N'],
  emergency: ['N'],
  urgent: ['N'],
  urgent_care: ['UC1'],
  walk_in_clinic: ['UC1'],
  walk_in: ['UC1'],
  trauma: ['N'],
  accident_emergency: ['N'],

  // Chapter P — Forensic / Public Health (non patient-facing)
  forensic_medicine: [],
  public_health: [],

  // Chapter R — Intensive care
  intensive_care: ['N'],
  intensive: ['N'],
  icu: ['N'],
  critical_care: ['N'],

  // Chapter S — Traditional medicine
  traditional_medicine: ['S'],
  acupuncture: ['S'],
  complementary_medicine: ['S'],
  traditional_chinese_medicine: ['S'],
  naturopathy: ['S'],
  homeopathy: ['S'],
  ayurveda: ['S'],
  oriental_medicine: ['S'],
  reflexology: ['S'],
  alternative: ['S'],

  // Chapter V — Rehabilitation
  rehabilitation: ['PT1'],
  occupational_therapy: ['PT1'],
  occupational: ['PT1'],

  // Cross-cutting — supporting clinical services (empty/no direct routing)
  radiology: [],
  anesthesiology: [],
  anaesthesiology: [],
  pathology: [],
  laboratory: [],
  nuclear_medicine: [],
  // Patient-facing clinical services
  pain_management: ['PA1'],
  palliative_medicine: ['PA1'],
  palliative: ['PA1'],

  // Chapter H — Sexual Health
  sexual_health: ['H'],
  sexual_medicine: ['H'],

  // Dentist / Stomatology
  dentist: ['DA0'],
  dentistry: ['DA0'],
  orthodontics: ['DA0'],
  implantology: ['DA0'],
  stomatology: ['DA0'],
  endodontics: ['DA0'],
  dental_oral_maxillo_facial_surgery: ['DA0'],

  // Generic / Misc OSM tags found in real data
  surgery: ['GS1'],
  vascular_surgery: ['B'],
  abortion: ['J'],
  obstetric_ultrasonography: ['J'],
  cosmetic: ['MAE1'],
  cosmetic_skincare: ['MAE1'],
  aesthetics: ['MAE1'],
  herbalism: ['S'],
  mental_health: ['6'],
  addiction: ['6'],
  speech_therapy: ['PT1'],
  general_practice: ['M'],
  travel_clinic: ['PV1'],
}

export const VALID_DEPARTMENTS = new Set(Object.keys(ALL_DEPARTMENTS))

export function osmSpecialitiesToDepartments(terms: string[]): string[] {
  const depts = new Set<string>()
  for (const term of terms) {
    const mapped = OSM_TO_DEPARTMENT[term.toLowerCase()]
    if (mapped) {
      for (const d of mapped) {
        if (VALID_DEPARTMENTS.has(d)) depts.add(d)
      }
    }
  }
  return Array.from(depts).sort()
}

export function getUnknownTerms(terms: string[]): string[] {
  return terms.filter((t) => !(t.toLowerCase() in OSM_TO_DEPARTMENT))
}
