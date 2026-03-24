import type { ReactNode } from 'react'
import { Button } from './button'

interface ModalProps {
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ children, description, isOpen, onClose, title }: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-950">{title}</h2>
            {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
