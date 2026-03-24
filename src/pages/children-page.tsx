import { useDeferredValue } from 'react'
import { PageHeader } from '../components/layout/page-header'
import { StatusBadge } from '../components/ui/status-badge'
import { selectChild, setSearchTerm } from '../features/children/children-slice'
import { getCompletionRate, getNextPendingScheduleItem } from '../features/immunizations/schedule'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { calculateAgeLabel, formatDate, formatRelativeDay } from '../lib/date'

export function ChildrenPage() {
  const dispatch = useAppDispatch()
  const activeRole = useAppSelector((state) => state.auth.activeRole)
  const currentUser = useAppSelector((state) => state.auth.profiles[state.auth.activeRole])
  const children = useAppSelector((state) => state.children.items)
  const searchTerm = useAppSelector((state) => state.children.searchTerm)
  const selectedChildId = useAppSelector((state) => state.children.selectedChildId)
  const deferredSearch = useDeferredValue(searchTerm)

  const visibleChildren =
    activeRole === 'parent'
      ? children.filter((child) => child.parentId === currentUser.id)
      : children

  const filteredChildren = visibleChildren.filter((child) => {
    const haystack = `${child.fullName} ${child.guardianName} ${child.facilityName}`.toLowerCase()
    return haystack.includes(deferredSearch.trim().toLowerCase())
  })

  const selectedChild =
    filteredChildren.find((child) => child.id === selectedChildId) ?? filteredChildren[0] ?? null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Child records"
        title="Registration and profile management"
        description="Search profiles, review guardian details, and inspect each child record before new doses are logged."
        actions={
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => dispatch(setSearchTerm(event.target.value))}
            placeholder="Search child, guardian, or facility"
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 sm:w-80"
          />
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <article className="surface rounded-[32px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Active profiles
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
                {filteredChildren.length} children visible
              </h2>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              {activeRole === 'parent' ? 'Personal records only' : 'Facility-wide view'}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredChildren.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No child profile matches the current search.
              </div>
            ) : (
              filteredChildren.map((child) => {
                const nextItem = getNextPendingScheduleItem(child)

                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => dispatch(selectChild(child.id))}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      child.id === selectedChild?.id
                        ? 'border-slate-900 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white/70 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{child.fullName}</p>
                        <p className={`mt-1 text-sm ${child.id === selectedChild?.id ? 'text-slate-300' : 'text-slate-500'}`}>
                          {calculateAgeLabel(child.birthDate)} old | {child.guardianName}
                        </p>
                      </div>
                      {nextItem ? <StatusBadge status={nextItem.status} /> : null}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className={child.id === selectedChild?.id ? 'text-slate-300' : 'text-slate-500'}>
                        Next visit {formatRelativeDay(child.nextAppointment)}
                      </span>
                      <span className="font-semibold">{getCompletionRate(child)}%</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </article>

        <article className="surface rounded-[32px] p-6">
          {selectedChild ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Selected child
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">
                    {selectedChild.fullName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Born {formatDate(selectedChild.birthDate)} | {calculateAgeLabel(selectedChild.birthDate)}
                  </p>
                </div>
                <div className="rounded-3xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
                  {getCompletionRate(selectedChild)}% schedule completion
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="surface-quiet rounded-3xl p-5">
                  <p className="text-sm font-semibold text-slate-500">Guardian</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedChild.guardianName}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{selectedChild.phone}</p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{selectedChild.address}</p>
                </div>
                <div className="surface-quiet rounded-3xl p-5">
                  <p className="text-sm font-semibold text-slate-500">Care facility</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedChild.facilityName}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Next appointment {formatDate(selectedChild.nextAppointment)}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Record updated {formatRelativeDay(selectedChild.lastUpdated)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-950">Recorded vaccine doses</h3>
                  <p className="text-sm text-slate-500">{selectedChild.immunizations.length} entries</p>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedChild.immunizations.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-3xl border border-slate-200 bg-white/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {record.vaccineName} {record.doseLabel}
                          </p>
                          <p className="text-sm text-slate-500">
                            Administered by {record.administeredBy ?? 'Unknown staff'}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-slate-600">
                          {record.completedDate ? formatDate(record.completedDate) : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              Select a child profile to inspect guardian details and vaccine history.
            </div>
          )}
        </article>
      </section>
    </div>
  )
}
