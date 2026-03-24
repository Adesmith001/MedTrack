import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface max-w-lg rounded-[32px] p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-slate-950">
          This MedTrack page is missing.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          The route may have changed while the workspace was being scaffolded.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  )
}
