import type { ReactNode } from 'react'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function SectionHeader({
  actions,
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-bold text-slate-950">{title}</h1>
        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  )
}
