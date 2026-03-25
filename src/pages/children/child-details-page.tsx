import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { Loader } from '../../components/ui/loader'
import { Notice } from '../../components/ui/notice'
import { StatusBadge } from '../../components/ui/status-badge'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import {
  clearChildrenFeedback,
  clearCurrentChild,
  fetchChildren,
  fetchChildById,
} from '../../features/children/children-slice'
import { canManageChildren, canViewChild } from '../../features/children/children-permissions'
import {
  clearCurrentImmunizationRecord,
  clearImmunizationRecordsFeedback,
  fetchImmunizationRecords,
} from '../../features/immunization-records/immunization-records-slice'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'
import { formatDisplayDate } from '../../lib/date'

export function ChildDetailsPage() {
  const dispatch = useAppDispatch()
  const { childId = '' } = useParams()
  const { profile } = useAuth()
  const children = useAppSelector((state) => state.children.items)
  const current = useAppSelector((state) => state.children.current)
  const status = useAppSelector((state) => state.children.status)
  const error = useAppSelector((state) => state.children.error)
  const records = useAppSelector((state) => state.immunizationRecords.items)
  const recordsStatus = useAppSelector((state) => state.immunizationRecords.status)
  const recordsError = useAppSelector((state) => state.immunizationRecords.error)

  useEffect(() => {
    dispatch(clearChildrenFeedback())
    dispatch(clearCurrentChild())

    if (profile?.role === 'parent') {
      void dispatch(
        fetchChildren({
          filters: [{ field: 'parentEmail', operator: '==', value: profile.email.toLowerCase() }],
        }),
      )
    } else {
      void dispatch(fetchChildById(childId))
    }

    return () => {
      dispatch(clearCurrentChild())
    }
  }, [childId, dispatch, profile])

  const resolvedChild =
    current?.id === childId ? current : children.find((child) => child.id === childId) ?? null

  useEffect(() => {
    dispatch(clearImmunizationRecordsFeedback())
    dispatch(clearCurrentImmunizationRecord())

    if (!resolvedChild || !canViewChild(profile, resolvedChild)) {
      return
    }

    void dispatch(
      fetchImmunizationRecords({
        filters:
          profile?.role === 'parent'
            ? [
                { field: 'parentEmail', operator: '==', value: profile.email.toLowerCase() },
                { field: 'childId', operator: '==', value: resolvedChild.id },
              ]
            : [{ field: 'childId', operator: '==', value: resolvedChild.id }],
      }),
    )
  }, [dispatch, profile, resolvedChild])

  if (status === 'loading' && !resolvedChild) {
    return (
      <PageContainer>
        <Card className="flex min-h-60 items-center justify-center">
          <Loader label="Loading child profile..." />
        </Card>
      </PageContainer>
    )
  }

  if (!resolvedChild) {
    return (
      <PageContainer>
        <Card>
          <EmptyState
            title="Child record not found"
            description={error ?? 'The requested child record could not be found.'}
          />
        </Card>
      </PageContainer>
    )
  }

  if (!canViewChild(profile, resolvedChild)) {
    return <Navigate replace to="/children" />
  }

  const childRecords = [...records]
    .filter((record) => record.childId === resolvedChild.id)
    .sort((left, right) => right.dateAdministered.localeCompare(left.dateAdministered))

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Children"
        title={resolvedChild.fullName}
        description="Review the stored profile information for this child record."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link to={`/immunization-schedule?childId=${resolvedChild.id}`}>
              <Button variant="secondary">View schedule</Button>
            </Link>
            {canManageChildren(profile) ? (
              <Link to={`/children/${resolvedChild.id}/edit`}>
                <Button>Edit child</Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card>
          <h2 className="font-display text-2xl font-bold text-slate-950">Child information</h2>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Full name</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Date of birth</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Gender</dt>
              <dd className="mt-2 text-sm capitalize text-slate-900">{resolvedChild.gender}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Hospital ID</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.hospitalId}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Address</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.address}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Notes</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.notes || 'No notes added.'}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-bold text-slate-950">Guardian information</h2>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Parent or guardian</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.parentName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Phone number</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.parentPhone}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Email address</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.parentEmail}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Created by</dt>
              <dd className="mt-2 text-sm text-slate-900">{resolvedChild.createdBy}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-950">Immunization history</h2>
            <p className="mt-2 text-sm text-slate-600">
              Completed vaccine records are listed here for guardians and care teams to review.
            </p>
          </div>
          <Link to={`/immunization-schedule?childId=${resolvedChild.id}`}>
            <Button variant="secondary">Open schedule</Button>
          </Link>
        </div>

        {recordsStatus === 'loading' ? (
          <div className="mt-6 flex min-h-40 items-center justify-center">
            <Loader label="Loading immunization history..." />
          </div>
      ) : recordsError ? (
        <div className="mt-6">
          <Notice tone="error" title="Unable to load immunization history">
            {recordsError}
          </Notice>
        </div>
      ) : childRecords.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No completed vaccines yet"
            description="Completed immunization records will appear here once staff update the schedule."
          />
        </div>
      ) : (
          <div className="mt-6 space-y-4">
            {childRecords.map((record) => (
              <div key={record.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">{record.vaccineName}</h3>
                      <StatusBadge status="completed" />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      Administered on {formatDisplayDate(record.dateAdministered)}
                    </p>
                    {record.notes ? (
                      <p className="mt-3 text-sm text-slate-500">{record.notes}</p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Staff ID</p>
                    <p className="mt-1">{record.staffId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
