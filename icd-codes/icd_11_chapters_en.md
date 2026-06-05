# ICD-11 Starting Character and Speciality Class Reference Table

This table shows which main medical speciality area (Main Chapter) an ICD-11 code belongs to by looking at its first character (number or letter). It can be used as a reference in database queries (e.g., `LIKE` filters) to determine the main categories of healthcare facilities or medical specialities.

## 1. Classes Starting with Numbers (Chapters 1 - 9)

| Starting Character | Chapter No | Covered Class / Medical Category | Specialities | Example Code | 
| :---: | :---: | :--- | :--- | :--- | 
| **1** | Chapter 01 | Certain Infectious or Parasitic Diseases | Infectious Diseases, Clinical Microbiology | `1A00` (Cholera) | 
| **2** | Chapter 02 | Neoplasms (Cancers and Tumors - Oncology) | Medical Oncology, Radiation Oncology, Surgical Oncology | `2B50` (Bone Sarcoma) | 
| **3** | Chapter 03 | Diseases of the Blood or Blood-forming Organs | Hematology, Pediatric Hematology | `3A00` (Anemia) | 
| **4** | Chapter 04 | Diseases of the Immune System (Immunology) | Immunology and Allergy | `4A00` (Immunodeficiency) | 
| **5** | Chapter 05 | Endocrine, Nutritional or Metabolic Diseases | Endocrinology and Metabolism, Internal Medicine, Dietetics | `5A10` (Type 1 Diabetes) | 
| **6** | Chapter 06 | Mental, Behavioural or Neurodevelopmental Disorders | Psychiatry, Child and Adolescent Psychiatry, Clinical Psychology | `6A70` (Depression) | 
| **7** | Chapter 07 | Sleep-Wake Disorders | Neurology, Pulmonology, Psychiatry (Sleep Medicine) | `7A00` (Insomnia) | 
| **8** | Chapter 08 | Diseases of the Nervous System (Neurology) | Neurology, Neurosurgery | `8A00` (Epilepsy) | 
| **9** | Chapter 09 | Diseases of the Visual System (Ophthalmology) | Ophthalmology | `9A00` (Cataract) | 

## 2. Classes Starting with Letters (Chapters 10 - 26)

*(Info: To prevent confusion, the letters "I" and "O" are deliberately not used in the ICD-11 system.)*

| Starting Character | Chapter No | Covered Class / Medical Category | Specialities | Example Code | 
| :---: | :---: | :--- | :--- | :--- | 
| **A** | Chapter 10 | Diseases of the Ear or Mastoid Process | Ear Nose Throat (ENT / Otolaryngology), Audiology | `AA00` (Hearing Loss) | 
| **B** | Chapter 11 | Diseases of the Circulatory System (Cardiology) | Cardiology, Cardiovascular Surgery | `BA00` (Hypertension) | 
| **C** | Chapter 12 | Diseases of the Respiratory System (Pulmonology) | Pulmonology (Chest Diseases), Thoracic Surgery | `CA23` (Asthma) | 
| **D** | Chapter 13 | Diseases of the Digestive System (Gastroenterology) | Gastroenterology, General Surgery | `DA00` (Stomach Ulcer) | 
| **E** | Chapter 14 | Diseases of the Skin (Dermatology) | Dermatology | `EA00` (Acne) | 
| **F** | Chapter 15 | Diseases of the Musculoskeletal System or Connective Tissue | Orthopedics and Traumatology, Rheumatology, Physical Therapy | `FA00` (Rheumatoid Arthritis) | 
| **G** | Chapter 16 | Diseases of the Genitourinary System | Urology, Nephrology, Obstetrics and Gynecology | `GA00` (Kidney Failure) | 
| **H** | Chapter 17 | Conditions related to Sexual Health | Urology, Psychiatry, Obstetrics and Gynecology | `HA00` (Erectile Dysfunction) | 
| **J** | Chapter 18 | Pregnancy, Childbirth or the Puerperium | Obstetrics and Gynecology, Perinatology | `JA00` (Ectopic Pregnancy) | 
| **K** | Chapter 19 | Conditions originating in the Perinatal Period | Neonatology (NICU), Pediatrics | `KA00` (Premature Birth) | 
| **L** | Chapter 20 | Developmental Anomalies (Birth Defects) | Pediatric Surgery, Medical Genetics, Pediatrics | `LA00` (Cleft Lip) | 
| **M** | Chapter 21 | Symptoms, Signs or Clinical Findings | Internal Medicine, Family Medicine, Emergency Medicine | `MA00` (Abdominal Pain) | 
| **N** | Chapter 22 | Injury, Poisoning or Consequences of External Causes | Emergency Medicine, Orthopedics and Traumatology, General Surgery | `NC32` (Arm Fracture) | 
| **P** | Chapter 23 | External Causes of Morbidity or Mortality | Forensic Medicine, Emergency Medicine, Public Health | `PB00` (Traffic Accident) | 
| **Q** | Chapter 24 | Factors influencing Health Status (Check-ups, vaccines) | Family Medicine, Internal Medicine (Check-up units), Occupational Medicine | `QA00` (Routine Examination) | 
| **R** | Chapter 25 | Codes for Special Purposes (Emergencies / Pandemic) | Infectious Diseases, Intensive Care, Emergency Medicine | `RA01` (COVID-19) | 
| **S** | Chapter 26 | Traditional Medicine Conditions | Traditional and Complementary Medicine, Acupuncture | `SA00` (Spleen Qi Deficiency) | 

## 3. Supplementary Chapters (Independent Letters)

*These codes are not standalone disease diagnoses; they are used to add details, context, or functioning status to other root codes.*

* **Class V:** Supplementary Section for Functioning Assessment (Evaluates rehabilitation needs and disability levels in daily life. E.g.: `VW1` - Mobility impairment).
  * **Relevant Specialities:** Physical Therapy and Rehabilitation (PTR), Occupational Therapy, Special Education, Speech and Language Therapy.

* **Class X:** Extension Codes (Modular pieces indicating laterality like right/left, severity, or acute/chronic stages. E.g.: `XK9K` - Right side).
  * *(Note: X codes do not directly represent a speciality but are universal markers used across all medical specialities.)*