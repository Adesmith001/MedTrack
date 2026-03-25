import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`surface rounded-[30px] p-5 sm:p-6 lg:p-7 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
