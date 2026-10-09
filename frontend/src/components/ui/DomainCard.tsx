import { Link } from 'react-router-dom'
import type {
  DomainAccent,
  DomainDefinition,
} from '../../config/site'
import { StatusBadge } from './StatusBadge'

type DomainCardProps = {
  domain: DomainDefinition
  index: number
}

const accentClasses: Record<DomainAccent, string> = {
  cyan: 'before:bg-sim-cyan',
  blue: 'before:bg-sim-blue',
  amber: 'before:bg-sim-amber',
  violet: 'before:bg-sim-violet',
  green: 'before:bg-sim-green',
}

export function DomainCard({ domain, index }: DomainCardProps) {
  const number = index + 1 < 10 ? `0${index + 1}` : String(index + 1)
  const statusLabel =
    domain.status === 'foundation' ? 'Foundation' : 'Planned'
  const statusTone =
    domain.status === 'foundation' ? 'active' : 'planned'

  return (
    <Link
      to={domain.to}
      className={`relative flex min-h-[235px] flex-col overflow-hidden rounded border border-sim-border bg-sim-surface/80 p-6 transition hover:-translate-y-1 hover:border-sim-cyan ${accentClasses[domain.accent]} before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:content-['']`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold tracking-[0.16em] text-sim-cyan">
          {number}
        </span>

        <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
      </div>

      <h3 className="mb-2 mt-8 text-xl text-sim-text">
        {domain.name}
      </h3>

      <p className="text-sm leading-6 text-sim-muted">
        {domain.description}
      </p>

      <span className="mt-auto pt-7 text-[10px] font-bold uppercase tracking-[0.14em] text-sim-cyan">
        Open domain
      </span>
    </Link>
  )
}