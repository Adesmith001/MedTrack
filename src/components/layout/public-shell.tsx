import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../ui/button'
import { publicNavigation } from '../../routes/navigation'

export function PublicShell() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="font-display text-2xl font-bold text-slate-950">
            MedTrack
          </NavLink>
          <nav className="hidden items-center gap-6 md:flex">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-slate-950' : 'text-slate-500'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden md:block">
            <Button variant="secondary">Phase 1</Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
