import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl font-bold text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
