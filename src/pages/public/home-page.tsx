import { Link, Navigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../hooks/use-auth'
import { getDefaultRouteForRole } from '../../lib/auth/roles'

const roleHighlights = [
  {
    title: 'Parents',
    body: 'See what is due next, follow clinic timelines, and keep one clear record for each child.',
  },
  {
    title: 'Staff',
    body: 'Register children quickly, track upcoming doses, and maintain accurate vaccine records.',
  },
  {
    title: 'Admins',
    body: 'Monitor operations, understand schedule pressure, and keep delivery workflows visible.',
  },
]

const scheduleMoments = [
  { label: 'At birth', vaccine: 'BCG, Hepatitis B, OPV 0' },
  { label: '6 weeks', vaccine: 'Pentavalent 1, PCV 1, OPV 1, Rotavirus 1' },
  { label: '10 weeks', vaccine: 'Pentavalent 2, PCV 2, OPV 2, Rotavirus 2' },
  { label: '14 weeks', vaccine: 'Pentavalent 3, PCV 3, OPV 3, IPV' },
  { label: '9 months', vaccine: 'Measles, Yellow Fever' },
]

export function HomePage() {
  const { isAuthenticated, isInitialized, role } = useAuth()

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f7f1]">
        <p className="text-sm text-slate-500">Preparing MedTrack...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to={getDefaultRouteForRole(role)} />
  }

  return (
    <div className="min-h-screen bg-[#f3f7f1] text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.18),transparent_32%),linear-gradient(135deg,#f7fbf7_0%,#eef4ef_55%,#f8fbfc_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-size-[26px_26px] opacity-60" />
        <div className="relative mx-auto grid min-h-svh max-w-7xl gap-10 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.85fr)] lg:px-8 lg:py-10">
          <div className="flex min-h-full flex-col">
            <header className="flex items-center justify-between">
              <Link to="/" className="font-display text-3xl font-bold tracking-tight text-slate-950">
                MedTrack
              </Link>
              <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
                <a href="#workflow" className="transition hover:text-slate-950">
                  Workflow
                </a>
                <a href="#roles" className="transition hover:text-slate-950">
                  Roles
                </a>
                <a href="#cta" className="transition hover:text-slate-950">
                  Start
                </a>
              </nav>
            </header>

            <div className="flex flex-1 flex-col justify-center py-14 sm:py-18 lg:py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-700">
                Child immunization tracking
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[0.96] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                One calm timeline for every child, clinic, and follow-up.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                MedTrack helps families and healthcare teams stay aligned on vaccine schedules,
                due dates, and record updates without losing clarity between visits.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button className="px-6 py-3 text-base">Create account</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" className="px-6 py-3 text-base">
                    Sign in
                  </Button>
                </Link>
              </div>
              <div className="mt-10 grid max-w-2xl gap-5 border-t border-slate-200 pt-8 sm:grid-cols-3">
                <div>
                  <p className="text-3xl font-bold text-slate-950">3 roles</p>
                  <p className="mt-2 text-sm text-slate-500">Parent, staff, and admin access from one product surface.</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-950">6 collections</p>
                  <p className="mt-2 text-sm text-slate-500">Firebase-ready data design for schedules, reminders, and records.</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-950">1 timeline</p>
                  <p className="mt-2 text-sm text-slate-500">A consistent view of what is upcoming, due, completed, or overdue.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-[36px] border border-white/70 bg-white/78 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                    Live schedule view
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
                    Child immunization timeline
                  </h2>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Next due
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {scheduleMoments.map((moment, index) => (
                  <div
                    key={moment.label}
                    className={`rounded-3xl border px-4 py-4 transition ${
                      index === 1
                        ? 'border-amber-200 bg-amber-50'
                        : index < 1
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{moment.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{moment.vaccine}</p>
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                          index === 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : index === 1
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {index === 0 ? 'Completed' : index === 1 ? 'Due' : 'Upcoming'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] bg-slate-950 px-5 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
                  Operational note
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Schedule generation is driven from date of birth and configurable vaccine definitions, so every new child profile starts with a consistent care plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
              Workflow
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-slate-950">
              Registration, scheduling, and follow-up stay in one deterministic flow.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="border-t border-slate-300 pt-4">
              <p className="text-sm font-semibold text-slate-900">Register child</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Staff or admins create the child profile with guardian and hospital details.
              </p>
            </div>
            <div className="border-t border-slate-300 pt-4">
              <p className="text-sm font-semibold text-slate-900">Generate schedule</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Vaccine definitions turn the date of birth into a clean immunization timeline.
              </p>
            </div>
            <div className="border-t border-slate-300 pt-4">
              <p className="text-sm font-semibold text-slate-900">Track next action</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Teams and parents can immediately see what is due next and what has become overdue.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="border-y border-slate-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
            Role pathways
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {roleHighlights.map((role) => (
              <div key={role.title} className="border-t border-slate-300 pt-5">
                <h3 className="font-display text-2xl font-bold text-slate-950">{role.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{role.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="rounded-[40px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#113b46_100%)] px-6 py-10 text-white sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
            Start MedTrack
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Give every child record a schedule from day one.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            Sign in for existing access, or create a role-based account to begin registration and schedule tracking.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button
                variant="secondary"
                className="border-white/80 bg-white px-6 py-3 text-base text-slate-950 hover:border-white hover:bg-slate-100"
              >
                Create account
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="ghost"
                className="border border-white/20 px-6 py-3 text-base text-white hover:bg-white/10"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
