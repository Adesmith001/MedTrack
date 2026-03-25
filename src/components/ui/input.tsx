import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Input({ className = '', error, hint, id, label, ...props }: InputProps) {
  const describedBy = [
    hint ? `${id ?? props.name}-hint` : null,
    error ? `${id ?? props.name}-error` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 ${
          error ? 'border-rose-400' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {hint ? (
        <span id={`${id ?? props.name}-hint`} className="block text-xs text-slate-500">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id ?? props.name}-error`} className="block text-xs text-rose-600">
          {error}
        </span>
      ) : null}
    </label>
  )
}
