import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-teal-800/90 bg-teal-800 text-white shadow-sm hover:bg-teal-900 focus-visible:ring-teal-500/30 disabled:border-teal-300 disabled:bg-teal-300',
  secondary:
    'border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400/20 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400',
  ghost:
    'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400/20 disabled:text-slate-400',
  danger:
    'border border-rose-200 bg-rose-50 text-rose-700 shadow-sm hover:bg-rose-100 focus-visible:ring-rose-500/20 disabled:border-rose-100 disabled:bg-rose-50 disabled:text-rose-300',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 rounded-2xl px-3.5 text-sm',
  md: 'min-h-11 rounded-2xl px-4 text-sm',
  lg: 'min-h-12 rounded-2xl px-5 text-sm',
}

export function Button({
  children,
  className = '',
  fullWidth = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
