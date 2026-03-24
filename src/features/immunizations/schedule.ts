import type { ChildProfile, ScheduleItem, VaccineScheduleTemplate } from '../../types/domain'
import { addDays, differenceInDays, toIsoDate } from '../../lib/date'

export const nationalScheduleTemplate: VaccineScheduleTemplate[] = [
  {
    vaccineCode: 'BCG',
    vaccineName: 'BCG',
    doseLabel: 'Birth',
    ageLabel: 'At birth',
    description: 'Protects against severe tuberculosis in early childhood.',
    offsetDays: 0,
    recommendedWindowDays: 7,
  },
  {
    vaccineCode: 'HepB',
    vaccineName: 'Hepatitis B',
    doseLabel: 'Birth',
    ageLabel: 'At birth',
    description: 'Birth-dose protection against hepatitis B transmission.',
    offsetDays: 0,
    recommendedWindowDays: 7,
  },
  {
    vaccineCode: 'OPV',
    vaccineName: 'Oral Polio Vaccine',
    doseLabel: 'Birth',
    ageLabel: 'At birth',
    description: 'Initial oral polio protection for newborns.',
    offsetDays: 0,
    recommendedWindowDays: 7,
  },
  {
    vaccineCode: 'Penta',
    vaccineName: 'Pentavalent',
    doseLabel: 'Dose 1',
    ageLabel: '6 weeks',
    description: 'Covers diphtheria, pertussis, tetanus, Hib, and hepatitis B.',
    offsetDays: 42,
    recommendedWindowDays: 14,
  },
  {
    vaccineCode: 'PCV',
    vaccineName: 'Pneumococcal',
    doseLabel: 'Dose 1',
    ageLabel: '6 weeks',
    description: 'Reduces severe pneumonia and invasive pneumococcal disease.',
    offsetDays: 42,
    recommendedWindowDays: 14,
  },
  {
    vaccineCode: 'OPV',
    vaccineName: 'Oral Polio Vaccine',
    doseLabel: 'Dose 1',
    ageLabel: '6 weeks',
    description: 'First follow-up oral polio dose.',
    offsetDays: 42,
    recommendedWindowDays: 14,
  },
  {
    vaccineCode: 'Penta',
    vaccineName: 'Pentavalent',
    doseLabel: 'Dose 2',
    ageLabel: '10 weeks',
    description: 'Second pentavalent dose for ongoing early immunity.',
    offsetDays: 70,
    recommendedWindowDays: 14,
  },
  {
    vaccineCode: 'PCV',
    vaccineName: 'Pneumococcal',
    doseLabel: 'Dose 2',
    ageLabel: '10 weeks',
    description: 'Second pneumococcal dose for stronger respiratory protection.',
    offsetDays: 70,
    recommendedWindowDays: 14,
  },
  {
    vaccineCode: 'Penta',
    vaccineName: 'Pentavalent',
    doseLabel: 'Dose 3',
    ageLabel: '14 weeks',
    description: 'Completes the primary pentavalent series.',
    offsetDays: 98,
    recommendedWindowDays: 14,
  },
  {
    vaccineCode: 'Measles',
    vaccineName: 'Measles',
    doseLabel: 'Dose 1',
    ageLabel: '9 months',
    description: 'First measles dose before the high-exposure toddler period.',
    offsetDays: 270,
    recommendedWindowDays: 21,
  },
]

function resolveStatus(dueDate: string, windowDays: number): ScheduleItem['status'] {
  const daysUntilDue = differenceInDays(dueDate, new Date())

  if (daysUntilDue < 0) {
    return 'overdue'
  }

  if (daysUntilDue <= windowDays) {
    return 'due'
  }

  return 'upcoming'
}

export function buildChildSchedule(child: ChildProfile): ScheduleItem[] {
  return nationalScheduleTemplate.map((template) => {
    const record = child.immunizations.find(
      (item) =>
        item.vaccineCode === template.vaccineCode && item.doseLabel === template.doseLabel,
    )
    const dueDate = toIsoDate(addDays(child.birthDate, template.offsetDays))

    if (record?.completedDate) {
      return {
        ...template,
        dueDate,
        status: 'completed',
        completedDate: record.completedDate,
        administeredBy: record.administeredBy,
        isCritical: false,
      }
    }

    const status = resolveStatus(dueDate, template.recommendedWindowDays)

    return {
      ...template,
      dueDate,
      status,
      isCritical: status === 'overdue' || differenceInDays(dueDate, new Date()) <= 7,
    }
  })
}

export function getNextPendingScheduleItem(child: ChildProfile): ScheduleItem | undefined {
  return buildChildSchedule(child).find((item) => item.status !== 'completed')
}

export function getCompletionRate(child: ChildProfile): number {
  const schedule = buildChildSchedule(child)
  const completedCount = schedule.filter((item) => item.status === 'completed').length
  return Math.round((completedCount / schedule.length) * 100)
}
