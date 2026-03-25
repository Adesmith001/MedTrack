import {
  DUE_SOON_WINDOW_DAYS,
  computeDueDate,
  determineScheduleStatus,
  generateScheduleEntriesForChild,
  getNextDueVaccine,
  getOverdueVaccines,
  hydrateScheduleStatuses,
} from './schedule-engine'
import type { ImmunizationSchedule } from '../../types/models'

describe('schedule-engine', () => {
  it('computes due dates from date of birth and offset days', () => {
    expect(computeDueDate('2025-01-01', 42)).toBe('2025-02-12')
  })

  it('classifies schedule statuses consistently', () => {
    expect(determineScheduleStatus('2025-01-05', undefined, '2025-01-01')).toBe('due')
    expect(determineScheduleStatus('2025-01-20', undefined, '2025-01-01')).toBe('upcoming')
    expect(determineScheduleStatus('2024-12-31', undefined, '2025-01-01')).toBe('overdue')
    expect(determineScheduleStatus('2024-12-31', 'completed', '2025-01-01')).toBe('completed')
    expect(DUE_SOON_WINDOW_DAYS).toBe(7)
  })

  it('generates schedule entries for a child from vaccine definitions', () => {
    const schedules = generateScheduleEntriesForChild(
      {
        id: 'child_1',
        dateOfBirth: '2025-01-01',
      },
      [
      {
          code: 'bcg',
          vaccineName: 'BCG',
          recommendedAge: 'At birth',
          offsetDays: 0,
          notes: 'First dose',
        },
        {
          code: 'opv-1',
          vaccineName: 'OPV 1',
          recommendedAge: '6 weeks',
          offsetDays: 42,
        },
      ],
      '2025-01-01',
    )

    expect(schedules).toEqual([
      {
        childId: 'child_1',
        vaccineName: 'BCG',
        recommendedAge: 'At birth',
        dueDate: '2025-01-01',
        status: 'due',
        notes: 'First dose',
      },
      {
        childId: 'child_1',
        vaccineName: 'OPV 1',
        recommendedAge: '6 weeks',
        dueDate: '2025-02-12',
        status: 'upcoming',
        notes: '',
      },
    ])
  })

  it('hydrates statuses and finds the next due and overdue schedules', () => {
    const schedules: ImmunizationSchedule[] = [
      {
        id: 'one',
        childId: 'child_1',
        vaccineName: 'BCG',
        recommendedAge: 'At birth',
        dueDate: '2025-01-01',
        status: 'upcoming',
        notes: '',
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'two',
        childId: 'child_1',
        vaccineName: 'Penta 1',
        recommendedAge: '6 weeks',
        dueDate: '2025-01-08',
        status: 'upcoming',
        notes: '',
        createdAt: null,
        updatedAt: null,
      },
      {
        id: 'three',
        childId: 'child_1',
        vaccineName: 'Measles',
        recommendedAge: '9 months',
        dueDate: '2025-09-01',
        status: 'completed',
        notes: '',
        createdAt: null,
        updatedAt: null,
      },
    ]

    const hydrated = hydrateScheduleStatuses(schedules, '2025-01-05')

    expect(hydrated.map((item) => item.status)).toEqual(['overdue', 'due', 'completed'])
    expect(getNextDueVaccine(schedules, '2025-01-05')?.id).toBe('one')
    expect(getOverdueVaccines(schedules, '2025-01-05').map((item) => item.id)).toEqual(['one'])
  })
})
