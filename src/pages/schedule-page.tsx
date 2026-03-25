import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Loader } from '../components/ui/loader'
import { Modal } from '../components/ui/modal'
import { StatusBadge } from '../components/ui/status-badge'
import { PageContainer } from '../components/layout/page-container'
import { SectionHeader } from '../components/layout/section-header'
import { fetchChildren } from '../features/children/children-slice'
import { canManageChildren, getVisibleChildren } from '../features/children/children-permissions'
import {
  clearImmunizationSchedulesFeedback,
  fetchImmunizationSchedules,
} from '../features/immunization-schedules/immunization-schedules-slice'
import {
  defaultImmunizationCompletionValues,
  validateImmunizationCompletionForm,
  type ImmunizationCompletionFormValues,
} from '../features/immunization-records/immunization-record-workflow'
import {
  clearImmunizationRecordsFeedback,
  completeImmunizationSchedule,
} from '../features/immunization-records/immunization-records-slice'
import {
  getNextDueVaccine,
  getOverdueVaccines,
} from '../features/immunization-schedules/schedule-engine'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { useAuth } from '../hooks/use-auth'
import { formatDisplayDate, getTodayIsoDate } from '../lib/date'
import type { ImmunizationSchedule } from '../types/models'

export function SchedulePage() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profile, user } = useAuth()
  const children = useAppSelector((state) => state.children.items)
  const childrenStatus = useAppSelector((state) => state.children.status)
  const schedules = useAppSelector((state) => state.immunizationSchedules.items)
  const schedulesStatus = useAppSelector((state) => state.immunizationSchedules.status)
  const schedulesError = useAppSelector((state) => state.immunizationSchedules.error)
  const recordsStatus = useAppSelector((state) => state.immunizationRecords.status)
  const recordsError = useAppSelector((state) => state.immunizationRecords.error)
  const [selectedSchedule, setSelectedSchedule] = useState<ImmunizationSchedule | null>(null)
  const [completionValues, setCompletionValues] = useState<ImmunizationCompletionFormValues>({
    ...defaultImmunizationCompletionValues,
    dateAdministered: getTodayIsoDate(),
  })

  useEffect(() => {
    if (!profile) {
      return
    }

    if (profile.role === 'parent') {
      void dispatch(
        fetchChildren({
          filters: [{ field: 'parentEmail', operator: '==', value: profile.email.toLowerCase() }],
        }),
      )
      return
    }

    void dispatch(fetchChildren())
  }, [dispatch, profile])

  const visibleChildren = useMemo(
    () =>
      [...getVisibleChildren(profile, children)].sort((left, right) =>
        left.fullName.localeCompare(right.fullName),
      ),
    [children, profile],
  )

  const selectedChildIdFromQuery = searchParams.get('childId')
  const selectedChild =
    visibleChildren.find((child) => child.id === selectedChildIdFromQuery) ?? visibleChildren[0] ?? null

  useEffect(() => {
    if (!selectedChild) {
      return
    }

    if (selectedChild.id !== selectedChildIdFromQuery) {
      setSearchParams({ childId: selectedChild.id }, { replace: true })
    }
  }, [selectedChild, selectedChildIdFromQuery, setSearchParams])

  useEffect(() => {
    dispatch(clearImmunizationSchedulesFeedback())

    if (!selectedChild) {
      return
    }

    void dispatch(
      fetchImmunizationSchedules({
        filters: [{ field: 'childId', operator: '==', value: selectedChild.id }],
      }),
    )
  }, [dispatch, selectedChild])

  const nextDue = selectedChild ? getNextDueVaccine(schedules) : null
  const overdueVaccines = getOverdueVaccines(schedules)
  const canCompleteVaccines = canManageChildren(profile)
  const completionErrors = validateImmunizationCompletionForm(completionValues)

  function openCompletionModal(schedule: ImmunizationSchedule) {
    setSelectedSchedule(schedule)
    setCompletionValues({
      dateAdministered: getTodayIsoDate(),
      notes: '',
    })
    dispatch(clearImmunizationRecordsFeedback())
  }

  function closeCompletionModal() {
    setSelectedSchedule(null)
    dispatch(clearImmunizationRecordsFeedback())
  }

  async function handleCompletionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedChild || !selectedSchedule || !user || Object.keys(completionErrors).length > 0) {
      return
    }

    const result = await dispatch(
      completeImmunizationSchedule({
        childId: selectedChild.id,
        schedule: selectedSchedule,
        dateAdministered: completionValues.dateAdministered,
        notes: completionValues.notes.trim(),
        staffId: user.uid,
      }),
    )

    if (completeImmunizationSchedule.fulfilled.match(result)) {
      closeCompletionModal()
    }
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Schedules"
        title="Immunization schedule engine"
        description="Generated vaccine timelines are calculated from each child’s date of birth and the configured vaccine definitions."
      />

      {visibleChildren.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {visibleChildren.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => setSearchParams({ childId: child.id })}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                child.id === selectedChild?.id
                  ? 'bg-slate-950 text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {child.fullName}
            </button>
          ))}
        </div>
      ) : null}

      {childrenStatus === 'loading' ? (
        <Card className="flex min-h-[240px] items-center justify-center">
          <Loader label="Loading children..." />
        </Card>
      ) : !selectedChild ? (
        <Card>
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No schedule available yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Register a child first to generate immunization schedule entries.
            </p>
            {profile?.role !== 'parent' ? (
              <div className="mt-5">
                <Link to="/children/new">
                  <Button>Add child</Button>
                </Link>
              </div>
            ) : null}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Next vaccine due
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-950">
                {nextDue ? nextDue.vaccineName : 'All recorded as completed'}
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                {nextDue
                  ? `${selectedChild.fullName} is due for ${nextDue.vaccineName} on ${formatDisplayDate(nextDue.dueDate)}.`
                  : 'No upcoming or overdue vaccines were found for the selected child.'}
              </p>
              {nextDue ? (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <StatusBadge status={nextDue.status} />
                  <span className="text-sm font-medium text-slate-500">
                    Recommended age: {nextDue.recommendedAge}
                  </span>
                </div>
              ) : null}
            </Card>

            <Card>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Schedule summary
              </p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Total entries
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-slate-950">{schedules.length}</dd>
                </div>
                <div className="rounded-2xl bg-amber-50 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Due soon
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-slate-950">
                    {schedules.filter((schedule) => schedule.status === 'due').length}
                  </dd>
                </div>
                <div className="rounded-2xl bg-rose-50 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
                    Overdue
                  </dt>
                  <dd className="mt-2 text-2xl font-bold text-slate-950">{overdueVaccines.length}</dd>
                </div>
              </dl>
            </Card>
          </div>

          {schedulesStatus === 'loading' ? (
            <Card className="flex min-h-[240px] items-center justify-center">
              <Loader label="Loading immunization schedule..." />
            </Card>
          ) : schedulesError ? (
            <Card>
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {schedulesError}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-slate-950">{schedule.vaccineName}</h3>
                        <StatusBadge status={schedule.status} />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        Recommended at {schedule.recommendedAge}. Due on {formatDisplayDate(schedule.dueDate)}.
                      </p>
                      {schedule.notes ? (
                        <p className="mt-3 text-sm text-slate-500">{schedule.notes}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">{selectedChild.fullName}</p>
                        <p className="mt-1">DOB: {formatDisplayDate(selectedChild.dateOfBirth)}</p>
                      </div>
                      {canCompleteVaccines && schedule.status !== 'completed' ? (
                        <Button onClick={() => openCompletionModal(schedule)}>Mark as completed</Button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        title="Mark vaccine as completed"
        description={
          selectedSchedule
            ? `Create a record for ${selectedSchedule.vaccineName} and update the linked schedule entry.`
            : undefined
        }
        isOpen={Boolean(selectedSchedule)}
        onClose={closeCompletionModal}
      >
        {selectedSchedule ? (
          <form className="space-y-4" onSubmit={(event) => void handleCompletionSubmit(event)} noValidate>
            {recordsError ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                {recordsError}
              </div>
            ) : null}
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{selectedSchedule.vaccineName}</p>
              <p className="mt-1">Recommended age: {selectedSchedule.recommendedAge}</p>
              <p className="mt-1">Scheduled due date: {formatDisplayDate(selectedSchedule.dueDate)}</p>
            </div>
            <Input
              id="date-administered"
              name="dateAdministered"
              type="date"
              label="Date administered"
              value={completionValues.dateAdministered}
              onChange={(event) =>
                setCompletionValues((current) => ({
                  ...current,
                  dateAdministered: event.target.value,
                }))
              }
              error={completionErrors.dateAdministered}
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea
                id="completion-notes"
                name="notes"
                rows={4}
                value={completionValues.notes}
                onChange={(event) =>
                  setCompletionValues((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
                placeholder="Optional administration notes"
              />
            </label>
            <div className="flex justify-end">
              <Button type="submit" disabled={recordsStatus === 'loading'}>
                {recordsStatus === 'loading' ? 'Saving completion...' : 'Save completion'}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </PageContainer>
  )
}
