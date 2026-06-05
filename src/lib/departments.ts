export interface DepartmentInfo {
  label: string
  icon: string
  slug: string
}

export const ALL_DEPARTMENTS: Record<string, DepartmentInfo> = {
  // --- Hastane: İlk Başvuru ve Acil ---
  'M':      { label: 'Internal Medicine',                 icon: '🩺', slug: 'internal-medicine' },
  'K':      { label: 'Pediatrics',                        icon: '👶', slug: 'pediatrics' },
  'GS1':    { label: 'General Surgery',                   icon: '🔪', slug: 'general-surgery' },
  'N':      { label: 'Emergency & Trauma',                icon: '🚑', slug: 'emergency-trauma' },

  // --- Hastane: Organ ve Sistem Odaklı ---
  'B':      { label: 'Cardiology',                        icon: '❤️', slug: 'cardiology' },
  'C':      { label: 'Pulmonology',                       icon: '🫁', slug: 'pulmonology' },
  'D':      { label: 'Gastroenterology',                  icon: '🫃', slug: 'gastroenterology' },
  '8':      { label: 'Neurology',                         icon: '🧠', slug: 'neurology' },
  '5':      { label: 'Endocrinology',                     icon: '⚗️', slug: 'endocrinology' },

  // --- Hastane: Duyu Organları ve Cilt ---
  'A':      { label: 'ENT (Ear, Nose, Throat)',           icon: '👂', slug: 'ent' },
  '9':      { label: 'Ophthalmology',                     icon: '👁️', slug: 'ophthalmology' },
  'E':      { label: 'Dermatology',                       icon: '🩹', slug: 'dermatology' },

  // --- Hastane: Kas-İskelet ---
  'F':      { label: 'Orthopedics & Traumatology',        icon: '🦴', slug: 'orthopedics' },

  // --- Hastane: Genitouriner ve Kadın Sağlığı ---
  'J':      { label: 'Obstetrics & Gynecology',           icon: '🤰', slug: 'obstetrics-gynecology' },
  'G':      { label: 'Urology',                           icon: '🫘', slug: 'urology' },
  'OG1':    { label: 'Nephrology',                        icon: '💧', slug: 'nephrology' },

  // --- Hastane: Sistemik ve İmmün Hastalıklar ---
  '1':      { label: 'Infectious Diseases',               icon: '🦠', slug: 'infectious-diseases' },
  '2':      { label: 'Oncology & Cancer Care',            icon: '🎗️', slug: 'oncology' },
  '3':      { label: 'Hematology & Blood Disorders',      icon: '🩸', slug: 'hematology' },
  '4':      { label: 'Allergy & Immunology',              icon: '🛡️', slug: 'allergy-immunology' },
  'R1':     { label: 'Rheumatology',                      icon: '🤝', slug: 'rheumatology' },

  // --- Hastane: Destek ve Özel Hizmetler ---
  'PV1':    { label: 'Preventive & Travel Medicine',      icon: '💉', slug: 'preventive-medicine' },
  'PA1':    { label: 'Palliative & Pain Management',      icon: '🕯️', slug: 'palliative-pain' },

  // --- Bağımsız Merkezler, Özel Klinikler ve Terapiler ---
  'IVF1':   { label: 'Fertility & IVF Centers',           icon: '🐣', slug: 'fertility-ivf' },
  'DLZ1':   { label: 'Dialysis Centers',                  icon: '🫧', slug: 'dialysis' },
  'UC1':    { label: 'Urgent Care Centers',               icon: '⚡', slug: 'urgent-care' },
  'CHR1':   { label: 'Chiropractic',                      icon: '🤸', slug: 'chiropractic' },
  'OST1':   { label: 'Osteopathy',                        icon: '🖐️', slug: 'osteopathy' },
  'OPT1':   { label: 'Optometry & Vision Care',           icon: '👓', slug: 'optometry' },
  '6':      { label: 'Psychology & Therapy',              icon: '🛋️', slug: 'psychology-therapy' },
  '7':      { label: 'Sleep & Snoring Centers',           icon: '😴', slug: 'sleep-medicine' },
  'H':      { label: 'Sexual Health & Wellness',          icon: '❤️🩹', slug: 'sexual-health' },
  'PT1':    { label: 'Physical Therapy & Rehab',          icon: '♿', slug: 'physical-therapy' },
  'DN1':    { label: 'Diet & Nutrition',                  icon: '🍏', slug: 'diet-nutrition' },

  // --- Estetik ve Plastik Cerrahi ---
  'QA1':    { label: 'Aesthetic & Reconstructive Surgery',icon: '🎭', slug: 'aesthetic-surgery' },
  'MAE1':   { label: 'Medical Aesthetics',                icon: '✨', slug: 'medical-aesthetics' },

  // --- Diş Hekimliği ---
  'DA0':    { label: 'Dentistry',                         icon: '🦷', slug: 'dentistry' },

  // --- Geleneksel ve Tamamlayıcı Tıp ---
  'S':      { label: 'Traditional & Functional Medicine', icon: '🌿', slug: 'traditional-medicine' },
}

export interface DepartmentSection {
  title: string
  titleKey: string
  codes: string[]
}

export const DEPARTMENT_SECTIONS: DepartmentSection[] = [
  { title: 'Hospital: Emergency & First Contact',       titleKey: 'dept_sec_hospital_emergency', codes: ['M', 'K', 'GS1', 'N'] },
  { title: 'Hospital: Organ & System Specialties',      titleKey: 'dept_sec_hospital_organ',     codes: ['B', 'C', 'D', '8', '5'] },
  { title: 'Hospital: Sensory Organs & Skin',           titleKey: 'dept_sec_hospital_sensory',   codes: ['A', '9', 'E'] },
  { title: 'Hospital: Musculoskeletal',                 titleKey: 'dept_sec_hospital_musculo',   codes: ['F'] },
  { title: 'Hospital: Genitourinary & Women\'s Health', titleKey: 'dept_sec_hospital_genito',    codes: ['J', 'G', 'OG1'] },
  { title: 'Hospital: Systemic & Immune Disorders',     titleKey: 'dept_sec_hospital_systemic',  codes: ['1', '2', '3', '4', 'R1'] },
  { title: 'Hospital: Support & Special Services',      titleKey: 'dept_sec_hospital_support',   codes: ['PV1', 'PA1'] },
  { title: 'Independent Centers & Therapies',           titleKey: 'dept_sec_independent',        codes: ['IVF1', 'DLZ1', 'UC1', 'CHR1', 'OST1', 'OPT1', '6', '7', 'H', 'PT1', 'DN1'] },
  { title: 'Aesthetic & Plastic Surgery',               titleKey: 'dept_sec_aesthetic',          codes: ['QA1', 'MAE1'] },
  { title: 'Dentistry',                                 titleKey: 'dept_sec_dentistry',          codes: ['DA0'] },
  { title: 'Traditional & Complementary Medicine',      titleKey: 'dept_sec_traditional',        codes: ['S'] },
]

export function getDepartmentByCode(code: string): DepartmentInfo | undefined {
  return ALL_DEPARTMENTS[code]
}

export function getDepartmentBySlug(slug: string): { code: string; info: DepartmentInfo } | undefined {
  const entry = Object.entries(ALL_DEPARTMENTS).find(([, info]) => info.slug === slug)
  if (!entry) return undefined
  return { code: entry[0], info: entry[1] }
}

export function getSectionForDepartment(code: string): string | undefined {
  return DEPARTMENT_SECTIONS.find((s) => s.codes.includes(code))?.titleKey
}
