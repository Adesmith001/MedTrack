import type { ReactNode } from 'react'
import { Card } from '../ui/card'

interface DashboardPanelProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardPanel({
  actions,
  children,
  className = '',
  description,
  title,
}: DashboardPanelProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-xl font-bold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      <div className="pt-5">{children}</div>
    </Card>
  )
}
