import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:gap-7">{children}</div>
}
