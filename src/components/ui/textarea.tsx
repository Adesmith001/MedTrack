import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  containerClassName?: string
}

export function Textarea({
  className = '',
  containerClassName = '',
  error,
  hint,
  id,
  label,
  ...props
}: TextareaProps) {
  const describedBy = [
    hint ? `${id ?? props.name}-hint` : null,
    error ? `${id ?? props.name}-error` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={`block space-y-2 ${containerClassName}`}>
      {label ? <span className="text-sm font-semibold tracking-[-0.01em] text-slate-800">{label}</span> : null}
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-500/10 ${
          error
            ? 'border-rose-300 bg-rose-50/30'
            : 'border-slate-200 hover:border-slate-300'
        } ${className}`}
        {...props}
      />
      {hint ? (
        <span id={`${id ?? props.name}-hint`} className="block text-xs leading-5 text-slate-500">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id ?? props.name}-error`} className="block text-xs font-medium leading-5 text-rose-600">
          {error}
        </span>
      ) : null}
    </label>
  )
}
