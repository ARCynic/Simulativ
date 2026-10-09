import type { ReactNode } from 'react'

type PanelProps = {
  children: ReactNode
  className?: string
}

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <section
      className={`relative min-w-0 overflow-hidden rounded border border-sim-border bg-sim-surface/80 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.24)]] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-sim-cyan before:to-transparent before:content-[''] ${className}`}
    >
      {children}
    </section>
  )
}