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
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/55 px-5 py-5 backdrop-blur sm:flex-row sm:items-end sm:justify-between sm:px-6">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-[2rem]">
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
