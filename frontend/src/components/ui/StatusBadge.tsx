import type { ReactNode } from 'react'

type StatusBadgeProps = {
  children: ReactNode
  tone?: 'active' | 'planned' | 'neutral'
}

const tones = {
  active:
    'border-sim-cyan/30 bg-sim-cyan/10 text-sim-cyan',
  planned:
    'border-sim-amber/30 bg-sim-amber/10 text-sim-amber',
  neutral:
    'border-sim-border text-sim-muted',
} as const

export function StatusBadge({
  children,
  tone = 'neutral',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  )
}