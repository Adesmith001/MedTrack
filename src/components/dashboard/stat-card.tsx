import { Card } from '../ui/card'

type StatCardTone = 'default' | 'teal' | 'amber' | 'rose' | 'sky'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  tone?: StatCardTone
}

const toneStyles: Record<StatCardTone, string> = {
  default: 'bg-white/85',
  teal: 'bg-teal-50/90',
  amber: 'bg-amber-50/90',
  rose: 'bg-rose-50/90',
  sky: 'bg-sky-50/90',
}

const accentStyles: Record<StatCardTone, string> = {
  default: 'bg-slate-900',
  teal: 'bg-teal-700',
  amber: 'bg-amber-600',
  rose: 'bg-rose-600',
  sky: 'bg-sky-600',
}

export function StatCard({ hint, label, tone = 'default', value }: StatCardProps) {
  return (
    <Card className={`${toneStyles[tone]} relative overflow-hidden`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${accentStyles[tone]}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </Card>
  )
}
