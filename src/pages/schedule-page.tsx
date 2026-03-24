import { PageHeader } from '../components/layout/page-header'
import { MetricTile } from '../components/ui/metric-tile'
import { StatusBadge } from '../components/ui/status-badge'
import { selectChild } from '../features/children/children-slice'
import { buildChildSchedule, getCompletionRate } from '../features/immunizations/schedule'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { formatDate } from '../lib/date'

export function SchedulePage() {
  const dispatch = useAppDispatch()
  const activeRole = useAppSelector((state) => state.auth.activeRole)
  const currentUser = useAppSelector((state) => state.auth.profiles[state.auth.activeRole])
  const children = useAppSelector((state) => state.children.items)
  const selectedChildId = useAppSelector((state) => state.children.selectedChildId)

  const visibleChildren =
    activeRole === 'parent'
      ? children.filter((child) => child.parentId === currentUser.id)
      : children

  const selectedChild =
    visibleChildren.find((child) => child.id === selectedChildId) ?? visibleChildren[0] ?? null

  const schedule = selectedChild ? buildChildSchedule(selectedChild) : []
  const dueCount = schedule.filter((item) => item.status === 'due').length
  const overdueCount = schedule.filter((item) => item.status === 'overdue').length

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Immunization plan"
        title="Schedule generation and vaccine timeline"
        description="This timeline is generated from a reusable immunization template and reconciled with recorded doses for each child profile."
      />

      <section className="surface rounded-[32px] p-6">
        <div className="flex flex-wrap gap-3">
          {visibleChildren.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => dispatch(selectChild(child.id))}
              className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                child.id === selectedChild?.id
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {child.fullName}
            </button>
          ))}
        </div>

        {selectedChild ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricTile
                label="Completion"
                value={`${getCompletionRate(selectedChild)}%`}
                hint="Share of template doses already logged"
                tone="success"
              />
              <MetricTile
                label="Due soon"
                value={`${dueCount}`}
                hint="Doses within the recommended window"
                tone="warning"
              />
              <MetricTile
                label="Overdue"
                value={`${overdueCount}`}
                hint="Follow-up visits that need escalation"
                tone={overdueCount > 0 ? 'warning' : 'neutral'}
              />
            </div>

            <div className="mt-6 space-y-4">
              {schedule.map((item) => (
                <div
                  key={`${item.vaccineCode}-${item.doseLabel}`}
                  className="grid gap-4 rounded-3xl border border-slate-200 bg-white/70 p-5 lg:grid-cols-[160px_minmax(0,1fr)_auto]"
                >
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {item.ageLabel}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{formatDate(item.dueDate)}</p>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-950">
                        {item.vaccineName} {item.doseLabel}
                      </h2>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                    {item.completedDate ? (
                      <p className="mt-3 text-sm font-medium text-slate-600">
                        Completed on {formatDate(item.completedDate)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                    <p className="text-sm font-semibold text-slate-700">{item.vaccineCode}</p>
                    <p className={`text-sm ${item.isCritical ? 'text-rose-600' : 'text-slate-500'}`}>
                      {item.isCritical ? 'Escalate reminder' : 'Routine follow-up'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
            No child is available in the current role view.
          </div>
        )}
      </section>
    </div>
  )
}
