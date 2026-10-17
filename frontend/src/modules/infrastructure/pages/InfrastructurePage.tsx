import { ButtonLink } from '../../../components/ui/ButtonLink'
import { Panel } from '../../../components/ui/Panel'
import { SectionHeading } from '../../../components/ui/SectionHeading'
import { StatusBadge } from '../../../components/ui/StatusBadge'

type ProjectTone = 'active' | 'planned'

type InfrastructureProject = {
  number: string
  title: string
  description: string
  status: string
  tone: ProjectTone
  to: string
  action: string
}

const projects: InfrastructureProject[] = [
  {
    number: '01',
    title: 'Migration Atlas',
    description:
      'Map country-level migration patterns, inspect connected flows, and extend observed movement into projected trends.',
    status: 'Foundation ready',
    tone: 'active',
    to: '/infrastructure/migration',
    action: 'Open atlas',
  },
  {
    number: '02',
    title: 'Urban growth',
    description:
      'Connect population movement with changing urban scale, density, and regional pressure.',
    status: 'Planned',
    tone: 'planned',
    to: '/about',
    action: 'Planned',
  },
  {
    number: '03',
    title: 'Transport networks',
    description:
      'Explore how movement, access, and infrastructure connect places across time.',
    status: 'Planned',
    tone: 'planned',
    to: '/about',
    action: 'Planned',
  },
  {
    number: '04',
    title: 'Housing and services',
    description:
      'Compare population pressure with housing, public services, and built capacity.',
    status: 'Planned',
    tone: 'planned',
    to: '/about',
    action: 'Planned',
  },
]

const lenses = [
  ['01', 'People', 'Who is moving, arriving, leaving, or concentrating?'],
  ['02', 'Pressure', 'Where does movement create new demand on places?'],
  ['03', 'Systems', 'How do cities and infrastructure respond over time?'],
]

export function InfrastructurePage() {
  return (
    <div className="page">
      <section className="mx-auto grid min-h-[calc(100vh-76px)] w-[calc(100%-32px)] max-w-[1180px] items-center gap-14 py-16 sm:w-[calc(100%-48px)] sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="eyebrow mb-0 text-sim-cyan">
              INFRASTRUCTURE / 01
            </p>

            <StatusBadge tone="active">Migration Atlas online</StatusBadge>
          </div>

          <h1 className="mb-7 max-w-3xl text-5xl leading-[0.92] text-sim-text sm:text-7xl lg:text-[6.3rem]">
            Infrastructure begins with movement.
          </h1>

          <p className="mb-8 max-w-2xl text-base leading-7 text-sim-muted sm:text-lg">
            Simulativ starts with migration: a way to see how people move
            between countries, how those movements change, and where pressure
            begins to accumulate.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/infrastructure/migration">
              Open migration atlas
            </ButtonLink>

            <ButtonLink to="/datasets" variant="secondary">
              Browse datasets
            </ButtonLink>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-sim-border">
            {[
              ['01', 'Movement', 'Country flows'],
              ['02', 'Time', 'Observed to projected'],
              ['03', 'Place', 'Urban pressure'],
            ].map(([number, label, detail]) => (
              <div
                className="border-r border-sim-border px-3 py-4 first:pl-0 last:border-r-0"
                key={number}
              >
                <span className="block text-[10px] font-bold tracking-[0.16em] text-sim-cyan">
                  {number}
                </span>
                <strong className="mt-2 block text-sm text-sim-text">
                  {label}
                </strong>
                <span className="mt-1 block text-[10px] leading-4 text-sim-faint">
                  {detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          aria-label="Abstract network showing movement between places"
          className="relative grid min-h-[390px] place-items-center overflow-hidden rounded-3xl border border-sim-border bg-[radial-gradient(circle_at_center,rgba(156,221,169,0.17),transparent_38%),linear-gradient(145deg,rgba(10,39,30,0.92),rgba(7,18,24,0.96))] shadow-[0_24px_80px_rgba(34,100,62,0.16)]"
          role="img"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(156,221,169,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(156,221,169,0.05)_1px,transparent_1px)] bg-[size:38px_38px]" />

          <svg
            aria-hidden="true"
            className="relative z-10 h-full w-full"
            viewBox="0 0 600 500"
          >
            <path
              d="M92 336 C165 250 186 164 286 183 S398 318 505 145"
              fill="none"
              stroke="rgba(180,243,200,0.75)"
              strokeDasharray="5 8"
              strokeWidth="2"
            />
            <path
              d="M108 148 C184 204 232 322 343 287 S445 198 505 145"
              fill="none"
              stroke="rgba(156,221,169,0.45)"
              strokeWidth="1.5"
            />
            <path
              d="M92 336 C203 370 259 393 343 287"
              fill="none"
              stroke="rgba(156,221,169,0.3)"
              strokeDasharray="3 7"
              strokeWidth="1.5"
            />

            <circle cx="92" cy="336" fill="#b4f3c8" r="7" />
            <circle cx="108" cy="148" fill="#9ce0b0" r="6" />
            <circle cx="286" cy="183" fill="#f5fff7" r="8" />
            <circle cx="343" cy="287" fill="#9ce0b0" r="6" />
            <circle cx="505" cy="145" fill="#b4f3c8" r="8" />

            <circle
              cx="286"
              cy="183"
              fill="none"
              r="28"
              stroke="rgba(180,243,200,0.24)"
            />
            <circle
              cx="505"
              cy="145"
              fill="none"
              r="42"
              stroke="rgba(180,243,200,0.16)"
            />
          </svg>

          <span className="absolute left-[12%] bottom-[24%] z-20 rounded-full border border-sim-border bg-sim-bg/80 px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-sim-muted backdrop-blur-md">
            origin
          </span>

          <span className="absolute left-[43%] top-[31%] z-20 rounded-full border border-emerald-300/40 bg-emerald-200/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-emerald-200 backdrop-blur-md">
            pressure
          </span>

          <span className="absolute right-[10%] top-[21%] z-20 rounded-full border border-sim-border bg-sim-bg/80 px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-sim-muted backdrop-blur-md">
            destination
          </span>

          <span className="absolute bottom-5 right-5 z-20 text-right text-[9px] uppercase tracking-[0.14em] text-sim-faint">
            movement / place / time
          </span>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] py-20 sm:w-[calc(100%-48px)] sm:py-24">
        <SectionHeading
          eyebrow="THE INFRASTRUCTURE LENS"
          title="Start with people. Follow the pressure."
          description="The infrastructure module connects population movement with the places, networks, and services that absorb its effects."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {lenses.map(([number, title, description]) => (
            <Panel key={number}>
              <span className="text-[10px] font-bold tracking-[0.16em] text-sim-cyan">
                {number}
              </span>

              <h2 className="mb-3 mt-12 text-2xl text-sim-text">
                {title}
              </h2>

              <p className="mb-0 text-sm leading-6 text-sim-muted">
                {description}
              </p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] pb-28 sm:w-[calc(100%-48px)]">
        <div className="mb-8">
          <p className="eyebrow">PROJECT MAP</p>
          <h2 className="max-w-2xl text-3xl leading-tight text-sim-text sm:text-5xl">
            One infrastructure domain, several connected questions.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <Panel
              className="flex min-h-[260px] flex-col transition-transform duration-200 hover:-translate-y-1"
              key={project.number}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold tracking-[0.16em] text-sim-cyan">
                  {project.number}
                </span>

                <StatusBadge tone={project.tone}>
                  {project.status}
                </StatusBadge>
              </div>

              <h3 className="mb-3 mt-10 text-xl text-sim-text">
                {project.title}
              </h3>

              <p className="mb-6 text-sm leading-6 text-sim-muted">
                {project.description}
              </p>

              <ButtonLink
                to={project.to}
                variant={project.tone === 'active' ? 'primary' : 'secondary'}
              >
                {project.action}
              </ButtonLink>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  )
}