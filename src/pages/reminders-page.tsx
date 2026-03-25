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
  sendReminderEmails,
} from '../features/reminders/reminders-slice'
import { formatReminderTriggerType } from '../features/reminders/reminder-rules'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { formatDisplayDate } from '../lib/date'
import type { Reminder, ReminderStatus } from '../types/models'

type ReminderStatusFilter = ReminderStatus | 'all'
type ReminderActionState = `send:${string}` | 'send-batch' | 'generate' | null

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

function formatAttemptAtLabel(value: string | null): string {
  return value ? new Date(value).toLocaleString() : 'Not attempted yet'
}

function canSendEmailNow(reminder: Reminder): boolean {
  return reminder.channel === 'email' && (reminder.status === 'pending' || reminder.status === 'failed')
}

function getReminderMetaLines(reminder: Reminder): string[] {
  const lines: string[] = []

  if (reminder.deliveryProvider) {
    lines.push(`Provider: ${reminder.deliveryProvider}`)
  }

  if (reminder.deliveryId) {
    lines.push(`Delivery ID: ${reminder.deliveryId}`)
  }

  if (reminder.failureReason) {
    lines.push(`Failure: ${reminder.failureReason}`)
  }

  lines.push(`Last attempt: ${formatAttemptAtLabel(reminder.lastAttemptAt)}`)

  if (reminder.sentAt) {
    lines.push(`Sent at: ${new Date(reminder.sentAt).toLocaleString()}`)
  }

  return lines
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
  const [deliverySummary, setDeliverySummary] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<ReminderActionState>(null)
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
      pendingEmail: reminders.filter(
        (reminder) => reminder.channel === 'email' && reminder.status === 'pending',
      ).length,
    }),
    [reminders],
  )

  async function refreshReminderQueue() {
    await dispatch(
      fetchReminders({
        sort: [{ field: 'createdAt', direction: 'desc' }],
      }),
    )
  }

  async function handleGenerateQueue() {
    setGenerationSummary(null)
    setDeliverySummary(null)
    setActiveAction('generate')
    dispatch(clearRemindersFeedback())

    const result = await dispatch(generateReminderQueue())

    if (generateReminderQueue.fulfilled.match(result)) {
      const { createdCount, duplicateCount, eligibleCount, referenceDate } = result.payload

      setGenerationSummary(
        `Created ${createdCount} pending reminder${createdCount === 1 ? '' : 's'} for ${referenceDate}. Skipped ${duplicateCount} duplicate queue slot${duplicateCount === 1 ? '' : 's'} out of ${eligibleCount} eligible queue slot${eligibleCount === 1 ? '' : 's'}.`,
      )
      await refreshReminderQueue()
    }

    setActiveAction(null)
  }

  async function handleSendEmails(reminderId?: string) {
    setGenerationSummary(null)
    setDeliverySummary(null)
    setActiveAction(reminderId ? `send:${reminderId}` : 'send-batch')
    dispatch(clearRemindersFeedback())

    const result = await dispatch(sendReminderEmails(reminderId ? { reminderId } : undefined))

    if (sendReminderEmails.fulfilled.match(result)) {
      const { attemptedCount, failedCount, results, sentCount, skippedCount } = result.payload.summary
      const failureMessages = results
        .filter((item) => item.status === 'failed' && item.reason)
        .map((item) => item.reason as string)

      setDeliverySummary(
        `Processed ${attemptedCount} email reminder${attemptedCount === 1 ? '' : 's'}. Sent ${sentCount}, failed ${failedCount}, skipped ${skippedCount}.${failureMessages.length > 0 ? ` Latest failure: ${failureMessages[0]}` : ''}`,
      )
      await refreshReminderQueue()
    }

    setActiveAction(null)
  }

  const rows = filteredQueue.map((item) => ({
    id: item.reminder.id,
    cells: [
      item.childName,
      item.vaccineName,
      item.dueDate ? formatDisplayDate(item.dueDate) : 'Unknown',
      formatReminderTriggerType(item.reminder.triggerType),
      item.reminder.channel.toUpperCase(),
      (
        <div key={`${item.reminder.id}-recipient`} className="space-y-1">
          <p className="text-slate-900">{item.reminder.recipient}</p>
          {item.reminder.failureReason ? (
            <p className="text-xs text-rose-600">{item.reminder.failureReason}</p>
          ) : null}
        </div>
      ),
      (
        <div key={`${item.reminder.id}-status`} className="space-y-2">
          <Badge variant={reminderStatusBadgeVariants[item.reminder.status]}>
            {item.reminder.status}
          </Badge>
          <div className="space-y-1 text-xs text-slate-500">
            {getReminderMetaLines(item.reminder).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      ),
      formatCreatedAtLabel(item.reminder),
      canSendEmailNow(item.reminder) ? (
        <Button
          key={`${item.reminder.id}-action`}
          variant="secondary"
          onClick={() => handleSendEmails(item.reminder.id)}
          disabled={remindersStatus === 'loading'}
        >
          {activeAction === `send:${item.reminder.id}`
            ? 'Sending...'
            : item.reminder.status === 'failed'
              ? 'Retry email'
              : 'Send now'}
        </Button>
      ) : (
        <span key={`${item.reminder.id}-action`} className="text-xs text-slate-500">
          {item.reminder.channel === 'sms' ? 'SMS delivery pending a later phase' : 'No action available'}
        </span>
      ),
    ],
  }))

  const isInitialLoading =
    reminders.length === 0 &&
    (childrenStatus === 'loading' || schedulesStatus === 'loading' || remindersStatus === 'loading')
  const combinedError = remindersError ?? schedulesError ?? childrenError

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Operations"
        title="Reminder queue"
        description="Generate reminder entries, send pending email reminders through Cloud Functions, and review delivery outcomes for staff and admin workflows."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleGenerateQueue} disabled={remindersStatus === 'loading'}>
              {activeAction === 'generate' ? 'Generating queue...' : 'Generate pending reminders'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSendEmails()}
              disabled={remindersStatus === 'loading' || queueCounts.pendingEmail === 0}
            >
              {activeAction === 'send-batch'
                ? 'Sending emails...'
                : `Send pending emails (${queueCounts.pendingEmail})`}
            </Button>
          </div>
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

      {deliverySummary ? (
        <Card>
          <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">{deliverySummary}</p>
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
                { key: 'action', label: 'Action' },
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
                    <dt className="font-medium text-slate-500">Delivery details</dt>
                    <dd className="mt-1 space-y-1 text-slate-900">
                      {getReminderMetaLines(item.reminder).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-slate-500">Queued at</dt>
                    <dd className="mt-1 text-slate-900">{formatCreatedAtLabel(item.reminder)}</dd>
                  </div>
                </dl>

                {canSendEmailNow(item.reminder) ? (
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => handleSendEmails(item.reminder.id)}
                      disabled={remindersStatus === 'loading'}
                    >
                      {activeAction === `send:${item.reminder.id}`
                        ? 'Sending...'
                        : item.reminder.status === 'failed'
                          ? 'Retry email'
                          : 'Send now'}
                    </Button>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  )
}
