import { useDeferredValue, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { EmptyState } from '../../components/ui/empty-state'
import { Input } from '../../components/ui/input'
import { Loader } from '../../components/ui/loader'
import { Notice } from '../../components/ui/notice'
import { TableShell } from '../../components/ui/table-shell'
import { PageContainer } from '../../components/layout/page-container'
import { SectionHeader } from '../../components/layout/section-header'
import { fetchChildren } from '../../features/children/children-slice'
import { getVisibleChildren, canManageChildren } from '../../features/children/children-permissions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useAuth } from '../../hooks/use-auth'

export function ChildrenListPage() {
  const dispatch = useAppDispatch()
  const { profile } = useAuth()
  const children = useAppSelector((state) => state.children.items)
  const status = useAppSelector((state) => state.children.status)
  const error = useAppSelector((state) => state.children.error)
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearch = useDeferredValue(searchTerm)

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

  const visibleChildren = [...getVisibleChildren(profile, children)].sort((left, right) =>
    left.fullName.localeCompare(right.fullName),
  )
  const normalizedSearch = deferredSearch.trim().toLowerCase()
  const filteredChildren = visibleChildren.filter((child) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      child.fullName.toLowerCase().includes(normalizedSearch) ||
      child.parentName.toLowerCase().includes(normalizedSearch) ||
      child.hospitalId.toLowerCase().includes(normalizedSearch)
    )
  })

  const rows = filteredChildren.map((child) => ({
    id: child.id,
    cells: [
      <Link key="name" to={`/children/${child.id}`} className="font-semibold text-slate-900 underline">
        {child.fullName}
      </Link>,
      child.parentName,
      child.hospitalId,
      child.dateOfBirth,
      canManageChildren(profile) ? (
        <Link key="edit" to={`/children/${child.id}/edit`} className="font-medium text-teal-700 underline">
          Edit
        </Link>
      ) : (
        <Link key="view" to={`/children/${child.id}`} className="font-medium text-teal-700 underline">
          View
        </Link>
      ),
    ],
  }))

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Children"
        title="Child profiles"
        description="Search and review registered children by child name, parent name, or hospital ID."
        actions={
          canManageChildren(profile) ? (
            <Link to="/children/new">
              <Button>Add child</Button>
            </Link>
          ) : undefined
        }
      />

      <Card>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Input
            type="search"
            label="Search child records"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by child, parent, or hospital ID"
            hint="Search works across child name, parent name, and hospital card number."
            containerClassName="max-w-2xl"
          />
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
            {filteredChildren.length} child{filteredChildren.length === 1 ? '' : 'ren'} in view
          </div>
        </div>
      </Card>

      {status === 'loading' ? (
        <Card className="flex min-h-[220px] items-center justify-center">
          <Loader label="Loading children..." />
        </Card>
      ) : error ? (
        <Notice tone="error" title="Unable to load children">
          {error}
        </Notice>
      ) : filteredChildren.length === 0 ? (
        <Card>
          <EmptyState
            title="No child records found"
            description={
              searchTerm
                ? 'Try a different child name, parent name, or hospital ID.'
                : 'Registered children will appear here once they are added.'
            }
          />
        </Card>
      ) : (
        <>
          <div className="hidden lg:block">
            <TableShell
              columns={[
                { key: 'name', label: 'Child' },
                { key: 'parent', label: 'Parent' },
                { key: 'hospitalId', label: 'Hospital ID' },
                { key: 'dob', label: 'Date of Birth' },
                { key: 'action', label: 'Action' },
              ]}
              rows={rows}
              emptyMessage="No child records found."
            />
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredChildren.map((child) => (
              <Card key={child.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link to={`/children/${child.id}`} className="text-lg font-semibold text-slate-950 underline">
                      {child.fullName}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{child.parentName}</p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {child.hospitalId}
                  </p>
                </div>
                <p className="mt-4 text-sm text-slate-600">Date of birth: {child.dateOfBirth}</p>
                <div className="mt-4">
                  <Link to={canManageChildren(profile) ? `/children/${child.id}/edit` : `/children/${child.id}`}>
                    <Button variant="secondary">
                      {canManageChildren(profile) ? 'Edit record' : 'View details'}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  )
}
