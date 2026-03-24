interface MetricTileProps {
  label: string
  value: string
  hint: string
  tone?: 'neutral' | 'success' | 'warning'
}

const toneStyles: Record<NonNullable<MetricTileProps['tone']>, string> = {
  neutral: 'from-white to-slate-50',
  success: 'from-emerald-50 to-white',
  warning: 'from-amber-50 to-white',
}

export function MetricTile({
  label,
  value,
  hint,
  tone = 'neutral',
}: MetricTileProps) {
  return (
    <article
      className={`rounded-3xl border border-slate-200 bg-gradient-to-br p-5 shadow-sm ${toneStyles[tone]}`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  )
}
