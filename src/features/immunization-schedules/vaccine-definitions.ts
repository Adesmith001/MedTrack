export interface VaccineDefinition {
  code: string
  vaccineName: string
  recommendedAge: string
  offsetDays: number
  notes?: string
}

export const vaccineDefinitions: VaccineDefinition[] = [
  {
    code: 'bcg',
    vaccineName: 'BCG',
    recommendedAge: 'At birth',
    offsetDays: 0,
    notes: 'Tuberculosis protection in early infancy.',
  },
  {
    code: 'hep-b-birth',
    vaccineName: 'Hepatitis B',
    recommendedAge: 'At birth',
    offsetDays: 0,
    notes: 'Birth dose recommended as early as possible.',
  },
  {
    code: 'opv-0',
    vaccineName: 'Oral Polio Vaccine 0',
    recommendedAge: 'At birth',
    offsetDays: 0,
    notes: 'Initial oral polio dose.',
  },
  {
    code: 'penta-1',
    vaccineName: 'Pentavalent 1',
    recommendedAge: '6 weeks',
    offsetDays: 42,
    notes: 'Protects against diphtheria, pertussis, tetanus, hepatitis B, and Hib.',
  },
  {
    code: 'pcv-1',
    vaccineName: 'Pneumococcal 1',
    recommendedAge: '6 weeks',
    offsetDays: 42,
    notes: 'Protects against invasive pneumococcal disease.',
  },
  {
    code: 'opv-1',
    vaccineName: 'Oral Polio Vaccine 1',
    recommendedAge: '6 weeks',
    offsetDays: 42,
  },
  {
    code: 'rota-1',
    vaccineName: 'Rotavirus 1',
    recommendedAge: '6 weeks',
    offsetDays: 42,
    notes: 'Reduces severe diarrheal disease risk.',
  },
  {
    code: 'penta-2',
    vaccineName: 'Pentavalent 2',
    recommendedAge: '10 weeks',
    offsetDays: 70,
  },
  {
    code: 'pcv-2',
    vaccineName: 'Pneumococcal 2',
    recommendedAge: '10 weeks',
    offsetDays: 70,
  },
  {
    code: 'opv-2',
    vaccineName: 'Oral Polio Vaccine 2',
    recommendedAge: '10 weeks',
    offsetDays: 70,
  },
  {
    code: 'rota-2',
    vaccineName: 'Rotavirus 2',
    recommendedAge: '10 weeks',
    offsetDays: 70,
  },
  {
    code: 'penta-3',
    vaccineName: 'Pentavalent 3',
    recommendedAge: '14 weeks',
    offsetDays: 98,
  },
  {
    code: 'pcv-3',
    vaccineName: 'Pneumococcal 3',
    recommendedAge: '14 weeks',
    offsetDays: 98,
  },
  {
    code: 'opv-3',
    vaccineName: 'Oral Polio Vaccine 3',
    recommendedAge: '14 weeks',
    offsetDays: 98,
  },
  {
    code: 'ipv',
    vaccineName: 'Inactivated Polio Vaccine',
    recommendedAge: '14 weeks',
    offsetDays: 98,
  },
  {
    code: 'measles',
    vaccineName: 'Measles',
    recommendedAge: '9 months',
    offsetDays: 270,
  },
  {
    code: 'yellow-fever',
    vaccineName: 'Yellow Fever',
    recommendedAge: '9 months',
    offsetDays: 270,
  },
]
