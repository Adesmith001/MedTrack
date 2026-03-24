import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { setActiveRole } from '../../features/auth/auth-slice'
import { hasFirebaseConfig } from '../../lib/firebase'
import type { UserRole } from '../../types/domain'

interface NavigationItem {
  to: string
  label: string
  shortLabel: string
  roles: UserRole[]
}

const navigation: NavigationItem[] = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Dash', roles: ['parent', 'staff', 'admin'] },
  { to: '/children', label: 'Children', shortLabel: 'Kids', roles: ['parent', 'staff', 'admin'] },
  { to: '/schedule', label: 'Schedule', shortLabel: 'Plan', roles: ['parent', 'staff', 'admin'] },
  { to: '/reminders', label: 'Reminders', shortLabel: 'Alerts', roles: ['parent', 'staff', 'admin'] },
  { to: '/reports', label: 'Reports', shortLabel: 'Stats', roles: ['staff', 'admin'] },
]

const roleCopy: Record<UserRole, string> = {
  parent: 'Parent view',
  staff: 'Clinic staff view',
  admin: 'Admin view',
}

export function AppShell() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const activeRole = useAppSelector((state) => state.auth.activeRole)
  const currentUser = useAppSelector((state) => state.auth.profiles[state.auth.activeRole])
  const availableNavigation = navigation.filter((item) => item.roles.includes(activeRole))

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="grid-shell hidden border-r border-slate-200 px-6 py-8 lg:flex lg:flex-col">
          <div className="surface rounded-[32px] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
              MedTrack
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold text-slate-950">
              Immunization operations for every role.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Monitor child records, vaccine schedules, and reminder delivery from one calm workspace.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {availableNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-white hover:text-slate-950'
                  }`
                }
              >
                <span>{item.label}</span>
                <span className="text-xs uppercase tracking-[0.24em]">
                  {item.shortLabel}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-[28px] border border-slate-200 bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Session
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{currentUser.name}</p>
            <p className="text-sm text-slate-500">{roleCopy[activeRole]}</p>
            <div className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {hasFirebaseConfig ? 'Firebase connected' : 'Demo data mode'}
            </div>
          </div>
        </aside>

        <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <header className="surface sticky top-4 z-20 rounded-[28px] px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-sm font-bold uppercase tracking-[0.24em] text-white">
                  MT
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-slate-950">MedTrack</p>
                  <p className="text-sm text-slate-500">
                    {currentUser.facilityName} | {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex rounded-full bg-slate-100 p-1">
                  {(['parent', 'staff', 'admin'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => dispatch(setActiveRole(role))}
                      className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                        role === activeRole
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                  {location.pathname === '/reports' && activeRole === 'parent'
                    ? 'Reports are limited in parent mode.'
                    : hasFirebaseConfig
                      ? 'Firebase modular SDK ready'
                      : 'Set VITE_FIREBASE_* to connect backend services'}
                </div>
              </div>
            </div>
          </header>

          <main className="pt-6">
            <Outlet />
          </main>
        </div>
      </div>

      <nav className="surface fixed inset-x-4 bottom-4 z-30 rounded-[28px] p-2 lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {availableNavigation.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-2xl px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] ${
                  isActive ? 'bg-slate-950 text-white' : 'text-slate-500'
                }`
              }
            >
              {item.shortLabel}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
