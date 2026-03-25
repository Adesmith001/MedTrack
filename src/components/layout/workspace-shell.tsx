import { NavLink, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { toggleSidebar, setSidebarOpen } from '../../features/ui/ui-slice'
import { workspaceNavigation } from '../../routes/navigation'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/use-auth'
import { logoutUser } from '../../features/auth/auth-slice'

export function WorkspaceShell() {
  const dispatch = useAppDispatch()
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen)
  const appName = useAppSelector((state) => state.appConfig.appName)
  const environment = useAppSelector((state) => state.appConfig.environment)
  const firebaseReady = useAppSelector((state) => state.appConfig.firebaseReady)
  const { isLoading, profile } = useAuth()
  const visibleNavigation = workspaceNavigation.filter(
    (item) => !item.roles || (profile ? item.roles.includes(profile.role) : false),
  )

  async function handleLogout() {
    await dispatch(logoutUser())
    dispatch(setSidebarOpen(false))
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.08),transparent_28%),linear-gradient(180deg,#f6faf7_0%,#edf4ee_48%,#f7faf8_100%)] lg:grid lg:grid-cols-[292px_minmax(0,1fr)]">
      <div
        className={`fixed inset-0 z-30 bg-slate-950/35 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => dispatch(setSidebarOpen(false))}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[292px] border-r border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(245,249,246,0.96)_100%)] px-5 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur lg:static lg:translate-x-0 lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-slate-950">{appName}</p>
            <p className="text-sm text-slate-500">
              {profile ? `${profile.fullName} | ${profile.role}` : 'Secure workspace'}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => dispatch(setSidebarOpen(false))}>
            Close
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="neutral">{environment}</Badge>
          <Badge variant={firebaseReady ? 'success' : 'warning'}>
            {firebaseReady ? 'Firebase ready' : 'Env pending'}
          </Badge>
        </div>

        <nav className="mt-8 space-y-2">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-semibold tracking-[-0.01em] transition ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]'
                    : 'text-slate-600 hover:bg-white hover:text-slate-950'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8">
          <Button fullWidth variant="secondary" onClick={() => void handleLogout()} disabled={isLoading}>
            {isLoading ? 'Signing out...' : 'Logout'}
          </Button>
        </div>
      </aside>

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-[28px] border border-slate-200/80 bg-white/78 px-4 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700">
              Workspace
            </p>
            <p className="text-sm text-slate-500">
              {profile ? `Authenticated as ${profile.role}` : 'Authenticated workspace'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => dispatch(toggleSidebar())}>
              Menu
            </Button>
            <Button variant="ghost" size="sm" className="hidden lg:inline-flex" onClick={() => void handleLogout()} disabled={isLoading}>
              {isLoading ? 'Signing out...' : 'Logout'}
            </Button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
