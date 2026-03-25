import type { ReactNode } from 'react'

type BadgeVariant = 'neutral' | 'success' | 'info' | 'warning'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'border border-slate-200 bg-slate-100 text-slate-700',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border border-sky-200 bg-sky-50 text-sky-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}
