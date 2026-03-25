interface LoaderProps {
  label?: string
}

export function Loader({ label = 'Loading' }: LoaderProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      <span>{label}</span>
    </div>
  )
}
