import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
}
