import { NavLink, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { toggleSidebar, setSidebarOpen } from '../../features/ui/ui-slice'
import { workspaceNavigation } from '../../routes/navigation'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export function WorkspaceShell() {
  const dispatch = useAppDispatch()
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen)
  const appName = useAppSelector((state) => state.appConfig.appName)
  const environment = useAppSelector((state) => state.appConfig.environment)
  const firebaseReady = useAppSelector((state) => state.appConfig.firebaseReady)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <div
        className={`fixed inset-0 z-30 bg-slate-950/35 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => dispatch(setSidebarOpen(false))}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-slate-200 bg-white px-5 py-6 transition lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-slate-950">{appName}</p>
            <p className="text-sm text-slate-500">Foundation workspace</p>
          </div>
          <Button variant="ghost" className="lg:hidden" onClick={() => dispatch(setSidebarOpen(false))}>
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
          {workspaceNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-[28px] border border-slate-200 bg-white/85 px-4 py-4 backdrop-blur">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Workspace
            </p>
            <p className="text-sm text-slate-500">Responsive shell ready for later feature phases</p>
          </div>
          <Button variant="secondary" className="lg:hidden" onClick={() => dispatch(toggleSidebar())}>
            Menu
          </Button>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
