import { motion } from 'motion/react'

import { ButtonLink } from '../components/ui/ButtonLink'
import { DomainCard } from '../components/ui/DomainCard'
import { Panel } from '../components/ui/Panel'
import { SectionHeading } from '../components/ui/SectionHeading'
import { StatusBadge } from '../components/ui/StatusBadge'
import { domains } from '../config/site'

type Signal = {
  number: string
  title: string
  description: string
}

const signals: Signal[] = [
  {
    number: '01',
    title: 'Space',
    description: 'Place observations on a geographic frame.',
  },
  {
    number: '02',
    title: 'Time',
    description: 'Trace how conditions and events change.',
  },
  {
    number: '03',
    title: 'Evidence',
    description: 'Keep the source and transformation visible.',
  },
]

type BuildStatus = {
  label: string
  status: string
  tone: 'active' | 'planned'
}

const buildStatuses: BuildStatus[] = [
  {
    label: 'Application shell',
    status: 'Ready',
    tone: 'active',
  },
  {
    label: 'Dataset registry',
    status: 'Next',
    tone: 'planned',
  },
  {
    label: '3D globe',
    status: 'Planned',
    tone: 'planned',
  },
  {
    label: 'Python pipeline',
    status: 'Planned',
    tone: 'planned',
  },
]

export function HomePage() {
  return (
    <div>
      <section className="mx-auto grid min-h-[calc(100vh-76px)] w-[calc(100%-32px)] max-w-[1180px] items-center gap-12 py-16 sm:w-[calc(100%-48px)] lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
            Public data / systems / simulation
          </p>

          <h1 className="mb-7 max-w-3xl text-5xl leading-[0.94] text-sim-text sm:text-7xl lg:text-[6.5rem]">
            Explore how real-world systems change.
          </h1>

          <p className="mb-8 max-w-xl text-base text-sim-muted">
            Simulativ turns public data into clear, inspectable views of
            change across time and space.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/ocean">Open ocean systems</ButtonLink>

            <ButtonLink to="/datasets" variant="secondary">
              Browse the dataset registry
            </ButtonLink>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-sim-faint">
            <StatusBadge tone="active">Foundation online</StatusBadge>

            <span>Public data becomes a system you can inspect.</span>
          </div>
        </motion.div>

        <div className="grid min-h-[350px] place-items-center lg:min-h-[480px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-square w-full max-w-[470px] rounded-full border border-sim-cyan/25 bg-[radial-gradient(circle_at_center,rgba(107,227,223,0.14),transparent_34%)] shadow-[0_0_90px_rgba(24,132,143,0.15)]"
          >
            <div className="absolute left-[15%] top-[15%] aspect-square w-[70%] rounded-full border border-dashed border-sim-cyan/20" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: 'linear',
              }}
              className="absolute inset-0 m-auto aspect-square w-[85%] rounded-full border border-sim-cyan/10"
            >
              <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-sim-cyan shadow-[0_0_12px_rgba(107,227,223,0.8)]" />
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                repeat: Infinity,
                duration: 35,
                ease: 'linear',
              }}
              className="absolute inset-0 m-auto aspect-square w-[60%] rounded-full border border-sim-cyan/15"
            >
              <span className="absolute -left-1 top-1/2 size-2 -translate-y-1/2 rounded-full bg-sim-cyan/60 shadow-[0_0_8px_rgba(107,227,223,0.5)]" />
            </motion.div>

            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: 'easeInOut',
              }}
              className="absolute left-1/2 top-1/2 flex aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-full border border-sim-cyan/60 bg-sim-bg/85 shadow-[0_0_45px_rgba(107,227,223,0.12)] backdrop-blur-md"
            >
              <span className="text-[9px] uppercase tracking-[0.16em] text-sim-muted">
                Simulativ
              </span>

              <strong className="text-xl tracking-[0.08em] text-sim-cyan drop-shadow-[0_0_8px_rgba(107,227,223,0.4)]">
                Change
              </strong>

              <span className="text-[8px] uppercase tracking-[0.16em] text-sim-muted">
                time / space / evidence
              </span>
            </motion.div>

            <Label
              text="time"
              className="absolute left-1/2 top-[11%] -translate-x-1/2"
            />

            <Label
              text="space"
              className="absolute right-[-17px] top-1/2 -translate-y-1/2"
            />

            <Label
              text="evidence"
              className="absolute bottom-[11%] left-1/2 -translate-x-1/2"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] py-20 sm:w-[calc(100%-48px)] sm:py-24">
        <SectionHeading
          eyebrow="The platform map"
          title="One framework, many domains."
          description="The same platform will support different kinds of systems without hiding their differences."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain, index) => (
            <DomainCard
              domain={domain}
              index={index}
              key={domain.name}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-[calc(100%-32px)] max-w-[1180px] gap-4 pb-28 sm:w-[calc(100%-48px)] lg:grid-cols-[1.25fr_0.75fr]">
        <Panel>
          <div className="mb-6 flex items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
                What the platform holds
              </p>

              <h2 className="max-w-xl text-2xl leading-tight text-sim-text sm:text-4xl">
                From raw observations to understandable systems.
              </h2>
            </div>

            <StatusBadge>v0.1</StatusBadge>
          </div>

          <p className="mb-7 max-w-2xl text-sm text-sim-muted">
            Every future domain will use the same basic path: source data,
            transparent processing, a common spatial and temporal model, and
            an interface for exploration.
          </p>

          <div className="border-t border-sim-border">
            {signals.map((signal) => (
              <div
                className="grid grid-cols-[44px_1fr] gap-3 border-b border-sim-border py-4"
                key={signal.number}
              >
                <span className="text-[10px] font-bold text-sim-cyan">
                  {signal.number}
                </span>

                <div>
                  <h3 className="mb-1 text-base text-sim-text">
                    {signal.title}
                  </h3>

                  <p className="text-xs text-sim-muted">
                    {signal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="flex flex-col">
          <div className="mb-6 flex items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
                Build status
              </p>

              <h2 className="text-2xl text-sim-text">
                Foundation phase
              </h2>
            </div>

            <span className="text-xs font-bold tracking-[0.16em] text-sim-amber">
              01
            </span>
          </div>

          <div className="mb-7 border-t border-sim-border">
            {buildStatuses.map((item) => (
              <div
                className="flex items-center justify-between gap-4 border-b border-sim-border py-4 text-xs text-sim-muted"
                key={item.label}
              >
                <span>{item.label}</span>

                <StatusBadge tone={item.tone}>
                  {item.status}
                </StatusBadge>
              </div>
            ))}
          </div>

          <ButtonLink to="/about" variant="secondary">
            Read the principles
          </ButtonLink>
        </Panel>
      </section>
    </div>
  )
}

type LabelProps = {
  text: string
  className?: string
}

function Label({ text, className = '' }: LabelProps) {
  return (
    <motion.span
      whileHover={{
        scale: 1.1,
        backgroundColor: 'rgba(107, 227, 223, 0.15)',
      }}
      className={`cursor-pointer rounded border border-sim-border bg-sim-bg/80 px-3 py-1.5 text-[9px] uppercase tracking-[0.1em] text-sim-muted transition-colors hover:border-sim-cyan/50 hover:text-sim-cyan ${className}`}
    >
      {text}
    </motion.span>
  )
}