import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ButtonLinkProps = {
  to: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

const variants = {
  primary:
    'border-sim-cyan bg-sim-cyan text-sim-bg hover:bg-[#91eeea]',
  secondary:
    'border-sim-border-strong bg-sim-surface/40 text-sim-text hover:border-sim-cyan hover:bg-sim-cyan/10',
} as const

export function ButtonLink({
  to,
  children,
  variant = 'primary',
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center justify-center rounded border px-4 text-xs font-bold tracking-wide transition hover:-translate-y-0.5 ${variants[variant]}`}
    >
      {children}
    </Link>
  )
}