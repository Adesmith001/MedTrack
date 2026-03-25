import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  Child,
  ImmunizationRecord,
  ImmunizationSchedule,
  Reminder,
  UserProfile,
} from '../../types/models'

const {
  childrenServiceMock,
  immunizationSchedulesServiceMock,
  immunizationRecordsServiceMock,
  remindersServiceMock,
  usersServiceMock,
} = vi.hoisted(() => ({
  childrenServiceMock: {
    list: vi.fn(),
    listByParentEmail: vi.fn(),
  },
  immunizationSchedulesServiceMock: {
    list: vi.fn(),
  },
  immunizationRecordsServiceMock: {
    list: vi.fn(),
  },
  remindersServiceMock: {
    list: vi.fn(),
  },
  usersServiceMock: {
    list: vi.fn(),
  },
}))

vi.mock('../../services/children-service', () => ({
  childrenService: childrenServiceMock,
}))

vi.mock('../../services/immunization-schedules-service', () => ({
  immunizationSchedulesService: immunizationSchedulesServiceMock,
}))

vi.mock('../../services/immunization-records-service', () => ({
  immunizationRecordsService: immunizationRecordsServiceMock,
}))

vi.mock('../../services/reminders-service', () => ({
  remindersService: remindersServiceMock,
}))

vi.mock('../../services/users-service', () => ({
  usersService: usersServiceMock,
}))

vi.mock('../../lib/date', async () => {
  const actual = await vi.importActual<typeof import('../../lib/date')>('../../lib/date')

  return {
    ...actual,
    getTodayIsoDate: () => '2025-01-01',
  }
})

import { loadAdminDashboardData, loadParentDashboardData } from './dashboard-data'

function createChild(overrides: Partial<Child> = {}): Child {
  return {
    id: 'child_1',
    fullName: 'Amina Bello',
    dateOfBirth: '2024-12-01',
    gender: 'female',
    parentName: 'Musa Bello',
    parentEmail: 'parent@example.com',
    parentPhone: '+2348012345678',
    address: '12 Clinic Street',
    hospitalId: 'HSP-001',
    notes: '',
    createdBy: 'staff_1',
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }
}

function createSchedule(overrides: Partial<ImmunizationSchedule> = {}): ImmunizationSchedule {
  return {
    id: 'schedule_1',
    childId: 'child_1',
    parentEmail: 'parent@example.com',
    vaccineName: 'Penta 1',
    recommendedAge: '6 weeks',
    dueDate: '2025-01-03',
    status: 'upcoming',
    notes: '',
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }
}

function createReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: 'reminder_1',
    childId: 'child_1',
    parentEmail: 'parent@example.com',
    scheduleId: 'schedule_1',
    channel: 'email',
    triggerType: '1-day-before',
    status: 'pending',
    recipient: 'parent@example.com',
    message: 'Reminder message',
    sentAt: null,
    lastAttemptAt: null,
    failureReason: null,
    deliveryProvider: null,
    deliveryId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }
}

function createRecord(overrides: Partial<ImmunizationRecord> = {}): ImmunizationRecord {
  return {
    id: 'record_1',
    childId: 'child_1',
    parentEmail: 'parent@example.com',
    scheduleId: 'schedule_1',
    vaccineName: 'Penta 1',
    dateAdministered: '2025-01-02',
    staffId: 'staff_1',
    notes: '',
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }
}

function createUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user_1',
    uid: 'user_1',
    fullName: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }
}

describe('dashboard-data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads parent dashboard data from current service responses with parent-scoped filters', async () => {
    const child = createChild()
    const schedule = createSchedule()
    const reminder = createReminder()

    childrenServiceMock.listByParentEmail.mockResolvedValue([child])
    immunizationSchedulesServiceMock.list.mockResolvedValue([schedule])
    remindersServiceMock.list.mockResolvedValue([reminder])

    const result = await loadParentDashboardData('Parent@Example.com')

    expect(childrenServiceMock.listByParentEmail).toHaveBeenCalledWith('parent@example.com')
    expect(immunizationSchedulesServiceMock.list).toHaveBeenCalledWith({
      filters: [
        { field: 'parentEmail', operator: '==', value: 'parent@example.com' },
        { field: 'childId', operator: 'in', value: ['child_1'] },
      ],
    })
    expect(remindersServiceMock.list).toHaveBeenCalledWith({
      filters: [
        { field: 'parentEmail', operator: '==', value: 'parent@example.com' },
        { field: 'childId', operator: 'in', value: ['child_1'] },
      ],
    })
    expect(result.children).toEqual([child])
    expect(result.totalScheduleCount).toBe(1)
    expect(result.dueSoonCount).toBe(1)
    expect(result.upcomingReminders).toHaveLength(1)
  })

  it('recomputes parent dashboard data on every call instead of serving cached or dummy data', async () => {
    const child = createChild()

    childrenServiceMock.listByParentEmail.mockResolvedValue([child])
    immunizationSchedulesServiceMock.list
      .mockResolvedValueOnce([createSchedule()])
      .mockResolvedValueOnce([])
    remindersServiceMock.list
      .mockResolvedValueOnce([createReminder()])
      .mockResolvedValueOnce([])

    const firstResult = await loadParentDashboardData('parent@example.com')
    const secondResult = await loadParentDashboardData('parent@example.com')

    expect(firstResult.totalScheduleCount).toBe(1)
    expect(firstResult.upcomingReminders).toHaveLength(1)
    expect(secondResult.totalScheduleCount).toBe(0)
    expect(secondResult.upcomingReminders).toEqual([])
    expect(immunizationSchedulesServiceMock.list).toHaveBeenCalledTimes(2)
    expect(remindersServiceMock.list).toHaveBeenCalledTimes(2)
  })

  it('builds admin dashboard metrics from fresh service data and reflects real-time changes between calls', async () => {
    usersServiceMock.list
      .mockResolvedValueOnce([createUser()])
      .mockResolvedValueOnce([])
    childrenServiceMock.list
      .mockResolvedValueOnce([createChild()])
      .mockResolvedValueOnce([])
    immunizationSchedulesServiceMock.list
      .mockResolvedValueOnce([createSchedule({ status: 'due' }), createSchedule({ id: 'schedule_2', status: 'overdue', dueDate: '2024-12-20' })])
      .mockResolvedValueOnce([])
    remindersServiceMock.list
      .mockResolvedValueOnce([createReminder({ status: 'pending' }), createReminder({ id: 'reminder_2', status: 'failed' })])
      .mockResolvedValueOnce([])
    immunizationRecordsServiceMock.list
      .mockResolvedValueOnce([createRecord()])
      .mockResolvedValueOnce([])

    const firstResult = await loadAdminDashboardData()
    const secondResult = await loadAdminDashboardData()

    expect(firstResult.totalUsers).toBe(1)
    expect(firstResult.totalChildren).toBe(1)
    expect(firstResult.totalDueVaccines).toBe(1)
    expect(firstResult.totalOverdueVaccines).toBe(1)
    expect(firstResult.reminderStats.pending).toBe(1)
    expect(firstResult.reminderStats.failed).toBe(1)
    expect(firstResult.recentActivity.length).toBeGreaterThan(0)

    expect(secondResult.totalUsers).toBe(0)
    expect(secondResult.totalChildren).toBe(0)
    expect(secondResult.totalDueVaccines).toBe(0)
    expect(secondResult.totalOverdueVaccines).toBe(0)
    expect(secondResult.reminderStats.pending).toBe(0)
    expect(secondResult.recentActivity).toEqual([])
    expect(usersServiceMock.list).toHaveBeenCalledTimes(2)
    expect(childrenServiceMock.list).toHaveBeenCalledTimes(2)
    expect(immunizationSchedulesServiceMock.list).toHaveBeenCalledTimes(2)
    expect(remindersServiceMock.list).toHaveBeenCalledTimes(2)
    expect(immunizationRecordsServiceMock.list).toHaveBeenCalledTimes(2)
  })
})
