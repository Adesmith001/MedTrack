import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardPanel } from '../components/dashboard/dashboard-panel'
import { StatCard } from '../components/dashboard/stat-card'
import { PageContainer } from '../components/layout/page-container'
import { SectionHeader } from '../components/layout/section-header'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Loader } from '../components/ui/loader'
import { TableShell } from '../components/ui/table-shell'
import {
  getActiveReportCount,
  loadReportingWorkspaceData,
  type CompletedReportItem,
  type ReminderHistoryItem,
  type ReportingWorkspaceData,
  type ScheduleReportItem,
} from '../features/reporting/reporting-data'
import {
  defaultReportingFilters,
  reportingViewLabels,
  type ReminderStatusFilter,
  type ReportingFilters,
  type ReportingView,
  type VaccineStatusFilter,
} from '../features/reporting/reporting-filters'
import { formatDisplayDate } from '../lib/date'
import type { ReminderStatus } from '../types/models'

interface ReportingResourceState {
  key: string
  data: ReportingWorkspaceData | null
  error: string | null
}

const initialState: ReportingResourceState = {
  key: '',
  data: null,
  error: null,
}

const reportViewOrder: ReportingView[] = ['dueSoon', 'overdue', 'completed', 'reminders']
const vaccineStatusOptions: VaccineStatusFilter[] = ['all', 'upcoming', 'due', 'completed', 'overdue']
const reminderStatusOptions: ReminderStatusFilter[] = ['all', 'pending', 'sent', 'failed', 'cancelled']
const summaryTones: Record<ReportingView, 'teal' | 'amber' | 'sky' | 'rose'> = {
  dueSoon: 'teal',
  overdue: 'rose',
  completed: 'sky',
  reminders: 'amber',
}
const emptyStateMessages: Record<ReportingView, string> = {
  dueSoon: 'No due-soon vaccine entries match the active filters.',
  overdue: 'No overdue immunizations match the active filters.',
  completed: 'No completed immunizations match the active filters.',
  reminders: 'No reminder delivery history matches the active filters.',
}
const reportDescriptions: Record<ReportingView, string> = {
  dueSoon: 'Vaccine schedule entries due within the next two weeks.',
  overdue: 'Non-completed vaccine schedules with due dates already behind us.',
  completed: 'Immunization records captured within the selected completion date range.',
  reminders: 'Reminder delivery activity across email and SMS channels.',
}

function getReminderStatusBadgeVariant(status: ReminderStatus): 'neutral' | 'info' | 'success' | 'warning' {
  if (status === 'sent') {
    return 'success'
  }

  if (status === 'pending') {
    return 'info'
  }

  if (status === 'failed') {
    return 'warning'
  }

  return 'neutral'
}

function formatReminderActivity(item: ReminderHistoryItem): string {
  if (item.reminder.sentAt) {
    return `Sent ${new Date(item.reminder.sentAt).toLocaleString()}`
  }

  if (item.reminder.lastAttemptAt) {
    return `Last attempt ${new Date(item.reminder.lastAttemptAt).toLocaleString()}`
  }

  return 'Queued'
}

function renderScheduleCards(items: ScheduleReportItem[]) {
  return items.map((item) => (
    <Card key={item.schedule.id}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-slate-950">{item.child.fullName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {item.child.parentName} • {item.child.hospitalId}
          </p>
        </div>
        <Badge variant={item.schedule.status === 'overdue' ? 'warning' : 'info'}>
          {item.schedule.status}
        </Badge>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-900">{item.schedule.vaccineName}</span> • due{' '}
          {formatDisplayDate(item.schedule.dueDate)}
        </p>
        <p>Recommended age: {item.schedule.recommendedAge}</p>
      </div>
      <div className="mt-4">
        <Link to={`/immunization-schedule?childId=${item.child.id}`}>
          <Button variant="secondary">Open schedule</Button>
        </Link>
      </div>
    </Card>
  ))
}

function renderCompletedCards(items: CompletedReportItem[]) {
  return items.map((item) => (
    <Card key={item.record.id}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-slate-950">{item.child.fullName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {item.child.parentName} • {item.child.hospitalId}
          </p>
        </div>
        <Badge variant="success">completed</Badge>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-900">{item.record.vaccineName}</span> • completed{' '}
          {formatDisplayDate(item.record.dateAdministered)}
        </p>
        <p>Recorded by staff ID: {item.record.staffId}</p>
      </div>
      <div className="mt-4">
        <Link to={`/children/${item.child.id}`}>
          <Button variant="secondary">Open child</Button>
        </Link>
      </div>
    </Card>
  ))
}

function renderReminderCards(items: ReminderHistoryItem[]) {
  return items.map((item) => (
    <Card key={item.reminder.id}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-slate-950">{item.child.fullName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {item.schedule?.vaccineName ?? 'Unknown vaccine'} • {item.child.hospitalId}
          </p>
        </div>
        <Badge variant={getReminderStatusBadgeVariant(item.reminder.status)}>{item.reminder.status}</Badge>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <p>{item.reminder.channel.toUpperCase()} • {item.reminder.recipient}</p>
        <p>{item.schedule ? `Due ${formatDisplayDate(item.schedule.dueDate)}` : 'Due date unavailable'}</p>
        <p>{formatReminderActivity(item)}</p>
        {item.reminder.failureReason ? <p className="text-rose-600">{item.reminder.failureReason}</p> : null}
      </div>
      <div className="mt-4">
        <Link to="/reminders">
          <Button variant="secondary">Open queue</Button>
        </Link>
      </div>
    </Card>
  ))
}

export function ReportsPage() {
  const [activeView, setActiveView] = useState<ReportingView>('dueSoon')
  const [filters, setFilters] = useState<ReportingFilters>(defaultReportingFilters)
  const deferredSearchTerm = useDeferredValue(filters.searchTerm)
  const [resource, setResource] = useState<ReportingResourceState>(initialState)
  const queryFilters = useMemo(
    () => ({
      ...filters,
      searchTerm: deferredSearchTerm,
    }),
    [deferredSearchTerm, filters],
  )
  const requestKey = useMemo(
    () => JSON.stringify(queryFilters),
    [queryFilters],
  )

  useEffect(() => {
    let isActive = true

    void loadReportingWorkspaceData(queryFilters)
      .then((data) => {
        if (!isActive) {
          return
        }

        startTransition(() => {
          setResource({
            key: requestKey,
            data,
            error: null,
          })
        })
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return
        }

        setResource({
          key: requestKey,
          data: null,
          error: error instanceof Error ? error.message : 'Failed to load reports.',
        })
      })

    return () => {
      isActive = false
    }
  }, [queryFilters, requestKey])

  const isLoading = resource.key !== requestKey || (!resource.data && !resource.error)
  const data = resource.data
  const activeCount = data ? getActiveReportCount(activeView, data.summary) : 0

  const desktopTable = useMemo(() => {
    if (!data) {
      return null
    }

    if (activeView === 'dueSoon' || activeView === 'overdue') {
      const rows = data.dataset[activeView].map((item) => ({
        id: item.schedule.id,
        cells: [
          <Link key="child" to={`/children/${item.child.id}`} className="font-semibold text-slate-900 underline">
            {item.child.fullName}
          </Link>,
          item.child.parentName,
          item.child.hospitalId,
          item.schedule.vaccineName,
          formatDisplayDate(item.schedule.dueDate),
          item.schedule.status,
        ],
      }))

      return {
        columns: [
          { key: 'child', label: 'Child' },
          { key: 'parent', label: 'Parent' },
          { key: 'hospitalId', label: 'Hospital ID' },
          { key: 'vaccine', label: 'Vaccine' },
          { key: 'dueDate', label: 'Due date' },
          { key: 'status', label: 'Status' },
        ],
        rows,
      }
    }

    if (activeView === 'completed') {
      const rows = data.dataset.completed.map((item) => ({
        id: item.record.id,
        cells: [
          <Link key="child" to={`/children/${item.child.id}`} className="font-semibold text-slate-900 underline">
            {item.child.fullName}
          </Link>,
          item.child.parentName,
          item.child.hospitalId,
          item.record.vaccineName,
          formatDisplayDate(item.record.dateAdministered),
          item.record.staffId,
        ],
      }))

      return {
        columns: [
          { key: 'child', label: 'Child' },
          { key: 'parent', label: 'Parent' },
          { key: 'hospitalId', label: 'Hospital ID' },
          { key: 'vaccine', label: 'Vaccine' },
          { key: 'completedOn', label: 'Completed on' },
          { key: 'staff', label: 'Staff ID' },
        ],
        rows,
      }
    }

    const rows = data.dataset.reminders.map((item) => ({
      id: item.reminder.id,
      cells: [
        <Link key="child" to={`/children/${item.child.id}`} className="font-semibold text-slate-900 underline">
          {item.child.fullName}
        </Link>,
        item.schedule?.vaccineName ?? 'Unknown vaccine',
        item.schedule ? formatDisplayDate(item.schedule.dueDate) : 'Unknown',
        item.reminder.channel.toUpperCase(),
        <Badge key="status" variant={getReminderStatusBadgeVariant(item.reminder.status)}>
          {item.reminder.status}
        </Badge>,
        item.reminder.deliveryProvider ?? 'Pending',
        item.reminder.failureReason ?? formatReminderActivity(item),
      ],
    }))

    return {
      columns: [
        { key: 'child', label: 'Child' },
        { key: 'vaccine', label: 'Vaccine' },
        { key: 'dueDate', label: 'Due date' },
        { key: 'channel', label: 'Channel' },
        { key: 'status', label: 'Status' },
        { key: 'provider', label: 'Provider' },
        { key: 'detail', label: 'Detail' },
      ],
      rows,
    }
  }, [activeView, data])

  function updateFilters(patch: Partial<ReportingFilters>) {
    setFilters((current) => ({
      ...current,
      ...patch,
    }))
  }

  function resetFilters() {
    setFilters(defaultReportingFilters)
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Reports"
        title="Search, filtering, and reporting"
        description="Search child records, refine operational filters, and switch between due-soon, overdue, completed, and reminder delivery views."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/children">
              <Button variant="secondary">Open children</Button>
            </Link>
            <Link to="/reminders">
              <Button variant="ghost">Open reminders</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportViewOrder.map((view) => (
          <StatCard
            key={view}
            label={reportingViewLabels[view]}
            value={data ? data.summary[view] : '...'}
            hint={view === activeView ? 'Currently selected report view.' : 'Available in the report tray below.'}
            tone={summaryTones[view]}
          />
        ))}
      </div>

      <DashboardPanel
        title="Controls"
        description="Use one search term across child name, parent name, and hospital ID. Date and status filters adapt to the current report."
        actions={
          <Button variant="secondary" onClick={resetFilters}>
            Reset filters
          </Button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(520px,1fr)]">
          <Input
            label="Search"
            type="search"
            value={filters.searchTerm}
            onChange={(event) => updateFilters({ searchTerm: event.target.value })}
            placeholder="Search by child, parent, or hospital ID"
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {reportViewOrder.map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`rounded-[24px] border px-4 py-4 text-left transition ${
                  activeView === view
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-semibold">{reportingViewLabels[view]}</p>
                <p className={`mt-2 text-xs ${activeView === view ? 'text-slate-200' : 'text-slate-500'}`}>
                  {reportDescriptions[view]}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(activeView === 'dueSoon' || activeView === 'overdue') && (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Vaccine status</span>
                <select
                  value={filters.vaccineStatus}
                  onChange={(event) => updateFilters({ vaccineStatus: event.target.value as VaccineStatusFilter })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600"
                >
                  {vaccineStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All statuses' : status}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Due date from"
                type="date"
                value={filters.dueDateFrom}
                onChange={(event) => updateFilters({ dueDateFrom: event.target.value })}
              />
              <Input
                label="Due date to"
                type="date"
                value={filters.dueDateTo}
                onChange={(event) => updateFilters({ dueDateTo: event.target.value })}
              />
            </>
          )}

          {activeView === 'completed' && (
            <>
              <Input
                label="Completed from"
                type="date"
                value={filters.completionDateFrom}
                onChange={(event) => updateFilters({ completionDateFrom: event.target.value })}
              />
              <Input
                label="Completed to"
                type="date"
                value={filters.completionDateTo}
                onChange={(event) => updateFilters({ completionDateTo: event.target.value })}
              />
            </>
          )}

          {activeView === 'reminders' && (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Reminder status</span>
                <select
                  value={filters.reminderStatus}
                  onChange={(event) => updateFilters({ reminderStatus: event.target.value as ReminderStatusFilter })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600"
                >
                  {reminderStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All statuses' : status}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Due date from"
                type="date"
                value={filters.dueDateFrom}
                onChange={(event) => updateFilters({ dueDateFrom: event.target.value })}
              />
              <Input
                label="Due date to"
                type="date"
                value={filters.dueDateTo}
                onChange={(event) => updateFilters({ dueDateTo: event.target.value })}
              />
            </>
          )}
        </div>
      </DashboardPanel>

      <DashboardPanel
        title={reportingViewLabels[activeView]}
        description={`${reportDescriptions[activeView]} ${activeCount} result${activeCount === 1 ? '' : 's'} in view.`}
      >
        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader label="Loading reports..." />
          </div>
        ) : resource.error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{resource.error}</p>
        ) : !data ? null : activeCount === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 px-5 py-12 text-center">
            <p className="text-lg font-semibold text-slate-950">No records found</p>
            <p className="mt-2 text-sm text-slate-500">{emptyStateMessages[activeView]}</p>
          </div>
        ) : (
          <>
            <div className="hidden xl:block">
              <TableShell
                columns={desktopTable?.columns ?? []}
                rows={desktopTable?.rows ?? []}
                emptyMessage={emptyStateMessages[activeView]}
              />
            </div>

            <div className="grid gap-4 xl:hidden">
              {(activeView === 'dueSoon' || activeView === 'overdue') && renderScheduleCards(data.dataset[activeView])}
              {activeView === 'completed' && renderCompletedCards(data.dataset.completed)}
              {activeView === 'reminders' && renderReminderCards(data.dataset.reminders)}
            </div>
          </>
        )}
      </DashboardPanel>
    </PageContainer>
  )
}
