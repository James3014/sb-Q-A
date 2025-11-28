import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`min-h-screen bg-zinc-900 text-white ${className}`}>
      {children}
    </main>
  )
}
