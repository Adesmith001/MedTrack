import type { ReactNode } from 'react'

type NoticeTone = 'info' | 'success' | 'warning' | 'error'

interface NoticeProps {
  title?: string
  children: ReactNode
  tone?: NoticeTone
}

const toneStyles: Record<NoticeTone, string> = {
  info: 'border-sky-200 bg-sky-50/90 text-sky-800',
  success: 'border-emerald-200 bg-emerald-50/90 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50/90 text-amber-800',
  error: 'border-rose-200 bg-rose-50/90 text-rose-800',
}

export function Notice({ children, title, tone = 'info' }: NoticeProps) {
  return (
    <div className={`rounded-[24px] border px-4 py-3.5 ${toneStyles[tone]}`} role="status">
      {title ? <p className="text-sm font-semibold tracking-[-0.01em]">{title}</p> : null}
      <div className={`${title ? 'mt-1.5' : ''} text-sm leading-6`}>{children}</div>
    </div>
  )
}
