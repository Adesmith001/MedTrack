import { useDeferredValue, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Loader } from '../../components/ui/loader'
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by child, parent, or hospital ID"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 sm:max-w-md"
          />
          <p className="text-sm text-slate-500">
            {filteredChildren.length} child{filteredChildren.length === 1 ? '' : 'ren'} in view
          </p>
        </div>
      </Card>

      {status === 'loading' ? (
        <Card className="flex min-h-[220px] items-center justify-center">
          <Loader label="Loading children..." />
        </Card>
      ) : error ? (
        <Card>
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        </Card>
      ) : filteredChildren.length === 0 ? (
        <Card>
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No child records found</p>
            <p className="mt-2 text-sm text-slate-500">
              {searchTerm
                ? 'Try a different child name, parent name, or hospital ID.'
                : 'Registered children will appear here once they are added.'}
            </p>
          </div>
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
