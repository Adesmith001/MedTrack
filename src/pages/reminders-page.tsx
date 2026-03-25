import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Loader } from '../components/ui/loader'
import { TableShell } from '../components/ui/table-shell'
import { PageContainer } from '../components/layout/page-container'
import { SectionHeader } from '../components/layout/section-header'
import { fetchChildren } from '../features/children/children-slice'
import {
  clearImmunizationSchedulesFeedback,
  fetchImmunizationSchedules,
} from '../features/immunization-schedules/immunization-schedules-slice'
import {
  clearRemindersFeedback,
  fetchReminders,
  generateReminderQueue,
} from '../features/reminders/reminders-slice'
import { formatReminderTriggerType } from '../features/reminders/reminder-rules'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { formatDisplayDate } from '../lib/date'
import type { Reminder, ReminderStatus } from '../types/models'

type ReminderStatusFilter = ReminderStatus | 'all'

interface ReminderQueueItem {
  reminder: Reminder
  childName: string
  vaccineName: string
  dueDate: string | null
}

const reminderStatusOptions: ReminderStatusFilter[] = ['all', 'pending', 'sent', 'failed', 'cancelled']

const reminderStatusBadgeVariants: Record<ReminderStatus, 'info' | 'success' | 'warning' | 'neutral'> = {
  pending: 'info',
  sent: 'success',
  failed: 'warning',
  cancelled: 'neutral',
}

function formatCreatedAtLabel(reminder: Reminder): string {
  return reminder.createdAt ? reminder.createdAt.toDate().toLocaleString() : 'Syncing...'
}

export function RemindersPage() {
  const dispatch = useAppDispatch()
  const children = useAppSelector((state) => state.children.items)
  const childrenStatus = useAppSelector((state) => state.children.status)
  const childrenError = useAppSelector((state) => state.children.error)
  const schedules = useAppSelector((state) => state.immunizationSchedules.items)
  const schedulesStatus = useAppSelector((state) => state.immunizationSchedules.status)
  const schedulesError = useAppSelector((state) => state.immunizationSchedules.error)
  const reminders = useAppSelector((state) => state.reminders.items)
  const remindersStatus = useAppSelector((state) => state.reminders.status)
  const remindersError = useAppSelector((state) => state.reminders.error)
  const [statusFilter, setStatusFilter] = useState<ReminderStatusFilter>('all')
  const [childFilter, setChildFilter] = useState('')
  const [vaccineFilter, setVaccineFilter] = useState('')
  const [dueDateFilter, setDueDateFilter] = useState('')
  const [generationSummary, setGenerationSummary] = useState<string | null>(null)
  const deferredChildFilter = useDeferredValue(childFilter)
  const deferredVaccineFilter = useDeferredValue(vaccineFilter)

  useEffect(() => {
    dispatch(clearRemindersFeedback())
    dispatch(clearImmunizationSchedulesFeedback())

    void dispatch(fetchChildren())
    void dispatch(fetchImmunizationSchedules())
    void dispatch(
      fetchReminders({
        sort: [{ field: 'createdAt', direction: 'desc' }],
      }),
    )
  }, [dispatch])

  const childMap = useMemo(
    () => new Map(children.map((child) => [child.id, child])),
    [children],
  )
  const scheduleMap = useMemo(
    () => new Map(schedules.map((schedule) => [schedule.id, schedule])),
    [schedules],
  )

  const queueItems = useMemo<ReminderQueueItem[]>(
    () =>
      reminders.map((reminder) => {
        const child = childMap.get(reminder.childId)
        const schedule = scheduleMap.get(reminder.scheduleId)

        return {
          reminder,
          childName: child?.fullName ?? 'Unknown child',
          vaccineName: schedule?.vaccineName ?? 'Unknown vaccine',
          dueDate: schedule?.dueDate ?? null,
        }
      }),
    [childMap, reminders, scheduleMap],
  )

  const normalizedChildFilter = deferredChildFilter.trim().toLowerCase()
  const normalizedVaccineFilter = deferredVaccineFilter.trim().toLowerCase()
  const filteredQueue = useMemo(
    () =>
      queueItems
        .filter((item) => {
          if (statusFilter !== 'all' && item.reminder.status !== statusFilter) {
            return false
          }

          if (normalizedChildFilter && !item.childName.toLowerCase().includes(normalizedChildFilter)) {
            return false
          }

          if (
            normalizedVaccineFilter &&
            !item.vaccineName.toLowerCase().includes(normalizedVaccineFilter)
          ) {
            return false
          }

          if (dueDateFilter && item.dueDate !== dueDateFilter) {
            return false
          }

          return true
        })
        .sort((left, right) => {
          const leftDueDate = left.dueDate ?? '9999-12-31'
          const rightDueDate = right.dueDate ?? '9999-12-31'

          if (leftDueDate !== rightDueDate) {
            return leftDueDate.localeCompare(rightDueDate)
          }

          return right.reminder.id.localeCompare(left.reminder.id)
        }),
    [dueDateFilter, normalizedChildFilter, normalizedVaccineFilter, queueItems, statusFilter],
  )

  const queueCounts = useMemo(
    () => ({
      total: reminders.length,
      pending: reminders.filter((reminder) => reminder.status === 'pending').length,
      sent: reminders.filter((reminder) => reminder.status === 'sent').length,
      failed: reminders.filter((reminder) => reminder.status === 'failed').length,
    }),
    [reminders],
  )

  const rows = filteredQueue.map((item) => ({
    id: item.reminder.id,
    cells: [
      item.childName,
      item.vaccineName,
      item.dueDate ? formatDisplayDate(item.dueDate) : 'Unknown',
      formatReminderTriggerType(item.reminder.triggerType),
      item.reminder.channel.toUpperCase(),
      item.reminder.recipient,
      (
        <Badge key={`${item.reminder.id}-status`} variant={reminderStatusBadgeVariants[item.reminder.status]}>
          {item.reminder.status}
        </Badge>
      ),
      formatCreatedAtLabel(item.reminder),
    ],
  }))

  const isInitialLoading =
    reminders.length === 0 &&
    (childrenStatus === 'loading' || schedulesStatus === 'loading' || remindersStatus === 'loading')
  const combinedError = remindersError ?? schedulesError ?? childrenError

  async function handleGenerateQueue() {
    setGenerationSummary(null)
    dispatch(clearRemindersFeedback())

    const result = await dispatch(generateReminderQueue())

    if (generateReminderQueue.fulfilled.match(result)) {
      const { createdCount, duplicateCount, eligibleCount, referenceDate } = result.payload

      setGenerationSummary(
        `Created ${createdCount} pending reminder${createdCount === 1 ? '' : 's'} for ${referenceDate}. Skipped ${duplicateCount} duplicate queue slot${duplicateCount === 1 ? '' : 's'} out of ${eligibleCount} eligible queue slot${eligibleCount === 1 ? '' : 's'}.`,
      )
    }
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Operations"
        title="Reminder queue"
        description="Generate and review pending reminder entries before email and SMS delivery is added in a later phase."
        actions={
          <Button onClick={handleGenerateQueue} disabled={remindersStatus === 'loading'}>
            {remindersStatus === 'loading' ? 'Generating queue...' : 'Generate pending reminders'}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-slate-500">Total reminders</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{queueCounts.total}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Pending</p>
          <p className="mt-3 text-3xl font-bold text-sky-700">{queueCounts.pending}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Sent</p>
          <p className="mt-3 text-3xl font-bold text-emerald-700">{queueCounts.sent}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Failed</p>
          <p className="mt-3 text-3xl font-bold text-amber-700">{queueCounts.failed}</p>
        </Card>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Child"
            value={childFilter}
            onChange={(event) => setChildFilter(event.target.value)}
            placeholder="Filter by child name"
          />
          <Input
            label="Vaccine"
            value={vaccineFilter}
            onChange={(event) => setVaccineFilter(event.target.value)}
            placeholder="Filter by vaccine"
          />
          <Input
            label="Due date"
            type="date"
            value={dueDateFilter}
            onChange={(event) => setDueDateFilter(event.target.value)}
          />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ReminderStatusFilter)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600"
            >
              {reminderStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All statuses' : status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {generationSummary ? (
        <Card>
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{generationSummary}</p>
        </Card>
      ) : null}

      {combinedError ? (
        <Card>
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{combinedError}</p>
        </Card>
      ) : null}

      {isInitialLoading ? (
        <Card className="flex min-h-[240px] items-center justify-center">
          <Loader label="Loading reminder queue..." />
        </Card>
      ) : filteredQueue.length === 0 ? (
        <Card>
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No reminders in this queue view</p>
            <p className="mt-2 text-sm text-slate-500">
              {reminders.length === 0
                ? 'Generate pending reminders to create the first queue entries for eligible vaccine schedules.'
                : 'Adjust the active filters to inspect a different slice of the queue.'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="hidden xl:block">
            <TableShell
              columns={[
                { key: 'child', label: 'Child' },
                { key: 'vaccine', label: 'Vaccine' },
                { key: 'dueDate', label: 'Due date' },
                { key: 'trigger', label: 'Trigger' },
                { key: 'channel', label: 'Channel' },
                { key: 'recipient', label: 'Recipient' },
                { key: 'status', label: 'Status' },
                { key: 'createdAt', label: 'Queued at' },
              ]}
              rows={rows}
              emptyMessage="No reminder entries match the current filters."
            />
          </div>

          <div className="grid gap-4 xl:hidden">
            {filteredQueue.map((item) => (
              <Card key={item.reminder.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{item.childName}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.vaccineName}</p>
                  </div>
                  <Badge variant={reminderStatusBadgeVariants[item.reminder.status]}>
                    {item.reminder.status}
                  </Badge>
                </div>

                <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-500">Due date</dt>
                    <dd className="mt-1 text-slate-900">
                      {item.dueDate ? formatDisplayDate(item.dueDate) : 'Unknown'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Trigger</dt>
                    <dd className="mt-1 text-slate-900">
                      {formatReminderTriggerType(item.reminder.triggerType)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Channel</dt>
                    <dd className="mt-1 text-slate-900">{item.reminder.channel.toUpperCase()}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Recipient</dt>
                    <dd className="mt-1 break-all text-slate-900">{item.reminder.recipient}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-slate-500">Message</dt>
                    <dd className="mt-1 text-slate-900">{item.reminder.message}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-slate-500">Queued at</dt>
                    <dd className="mt-1 text-slate-900">{formatCreatedAtLabel(item.reminder)}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  )
}
