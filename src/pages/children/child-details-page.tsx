import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Loader } from '../../components/ui/loader'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import {
  clearChildrenFeedback,
  clearCurrentChild,
  fetchChildren,
  fetchChildById,
} from '../../features/children/children-slice'
import { canManageChildren, canViewChild } from '../../features/children/children-permissions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'

export function ChildDetailsPage() {
  const dispatch = useAppDispatch()
  const { childId = '' } = useParams()
  const { profile } = useAuth()
  const children = useAppSelector((state) => state.children.items)
  const current = useAppSelector((state) => state.children.current)
  const status = useAppSelector((state) => state.children.status)
  const error = useAppSelector((state) => state.children.error)

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

  if (status === 'loading' && !resolvedChild) {
    return (
      <PageContainer>
        <Card className="flex min-h-[240px] items-center justify-center">
          <Loader label="Loading child profile..." />
        </Card>
      </PageContainer>
    )
  }

  if (!resolvedChild) {
    return (
      <PageContainer>
        <Card>
          <p className="text-sm text-slate-600">
            {error ?? 'The requested child record could not be found.'}
          </p>
        </Card>
      </PageContainer>
    )
  }

  if (!canViewChild(profile, resolvedChild)) {
    return <Navigate replace to="/children" />
  }

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Children"
        title={resolvedChild.fullName}
        description="Review the stored profile information for this child record."
        actions={
          canManageChildren(profile) ? (
            <Link to={`/children/${resolvedChild.id}/edit`}>
              <Button>Edit child</Button>
            </Link>
          ) : undefined
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
    </PageContainer>
  )
}
