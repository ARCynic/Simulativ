import { Panel } from '../components/ui/Panel'
import { SectionHeading } from '../components/ui/SectionHeading'
import { StatusBadge } from '../components/ui/StatusBadge'

const layers = [
  ['Biodiversity', 'OBIS', 'Species occurrence records and observations.'],
  ['Fish populations', 'DATRAS', 'Survey data for marine fish populations.'],
  ['Animal movement', 'Movebank', 'Movement tracks from animal-borne tags.'],
  ['Fishing activity', 'Global Fishing Watch', 'Public vessel activity and fishing effort data.'],
  ['Ocean conditions', 'OceanSITES', 'Long-term observations from fixed ocean sites.'],
]

export function OceanPage() {
  return (
    <div>
      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] py-20 sm:w-[calc(100%-48px)] sm:py-28">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
            Domain / 01
          </p>
          <StatusBadge tone="planned">First domain in development</StatusBadge>
        </div>

        <h1 className="mb-6 max-w-4xl text-6xl leading-[0.92] text-sim-text sm:text-8xl">
          Ocean systems.
        </h1>

        <p className="max-w-2xl text-base text-sim-muted">
          A shared view for connecting marine biodiversity, populations,
          movement, human activity, and changing ocean conditions.
        </p>
      </section>

      <section className="mx-auto grid w-[calc(100%-32px)] max-w-[1180px] gap-4 pb-20 sm:w-[calc(100%-48px)] lg:grid-cols-[1.25fr_0.75fr]">
        <Panel>
          <div className="mb-6 flex items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
                Visualization layer
              </p>
              <h2 className="text-3xl text-sim-text">Spatial frame</h2>
            </div>
            <StatusBadge tone="planned">Coming later</StatusBadge>
          </div>

          <div className="relative grid min-h-[420px] place-items-center overflow-hidden rounded border border-sim-border bg-[radial-gradient(circle_at_center,rgba(107,227,223,0.11),transparent_42%),#08141d]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(107,227,223,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(107,227,223,0.06)_1px,transparent_1px)] bg-[length:38px_38px]" />

            <div className="placeholder-globe relative aspect-square w-[52%] max-w-[230px] rounded-full border border-sim-cyan/60 shadow-[0_0_42px_rgba(107,227,223,0.15)]">
              <span />
              <span />
              <span />
            </div>

            <div className="absolute bottom-4 right-4 text-right">
              <span className="block text-[9px] uppercase tracking-[0.14em] text-sim-faint">
                Geographic visualization
              </span>
              <strong className="text-xs uppercase tracking-[0.08em] text-sim-cyan">
                3D globe pending
              </strong>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="mb-6 flex items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
                Data layers
              </p>
              <h2 className="text-3xl text-sim-text">Planned sources</h2>
            </div>
            <span className="text-xs font-bold tracking-[0.16em] text-sim-amber">
              05
            </span>
          </div>

          <div className="border-t border-sim-border">
            {layers.map(([label, source, detail]) => (
              <div
                className="flex items-start justify-between gap-4 border-b border-sim-border py-4"
                key={source}
              >
                <div>
                  <h3 className="mb-1 text-sm text-sim-text">{label}</h3>
                  <p className="text-xs leading-5 text-sim-muted">{detail}</p>
                </div>
                <span className="text-right text-[10px] font-bold text-sim-cyan">
                  {source}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] pb-28 sm:w-[calc(100%-48px)]">
        <SectionHeading
          eyebrow="Implementation order"
          title="Build the frame before adding the weight."
          description="The first implementation will establish the shared data contracts and interaction model before connecting every source."
        />
      </section>
    </div>
  )
}