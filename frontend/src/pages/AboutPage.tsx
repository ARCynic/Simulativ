import { Panel } from '../components/ui/Panel'
import { SectionHeading } from '../components/ui/SectionHeading'

const principles = [
  ['01', 'Source before spectacle', 'Visual clarity should make evidence easier to inspect, not replace it.'],
  ['02', 'Common frame, distinct systems', 'Different domains can share infrastructure while retaining their own logic.'],
  ['03', 'Change is the subject', 'Time, movement, interaction, and transition matter as much as static values.'],
  ['04', 'Transparent transformation', 'Processing steps should remain understandable from source to screen.'],
]

export function AboutPage() {
  return (
    <div>
      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] py-20 sm:w-[calc(100%-48px)] sm:py-28">
        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
          About the platform
        </p>

        <h1 className="mb-6 max-w-5xl text-6xl leading-[0.92] text-sim-text sm:text-8xl">
          Understand systems by watching them move.
        </h1>

        <p className="max-w-2xl text-base text-sim-muted">
          Simulativ is a public-data visualization and simulation platform
          for exploring how real-world systems change across time and space.
        </p>
      </section>

      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] py-20 sm:w-[calc(100%-48px)] sm:py-24">
        <SectionHeading
          eyebrow="Design principles"
          title="The platform has a point of view."
          description="These principles guide the architecture as the site expands from one domain into many."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {principles.map(([number, title, description]) => (
            <Panel className="min-h-[210px]" key={number}>
              <span className="mb-12 block text-xs font-bold tracking-[0.16em] text-sim-cyan">
                {number}
              </span>
              <h2 className="mb-3 text-2xl text-sim-text">{title}</h2>
              <p className="text-sm text-sim-muted">{description}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] pb-28 sm:w-[calc(100%-48px)]">
        <Panel>
          <div className="mb-7">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
              Initial architecture
            </p>
            <h2 className="text-3xl text-sim-text">
              Source, process, explore.
            </h2>
          </div>

          <div className="grid border-y border-sim-border sm:grid-cols-3">
            {[
              ['01', 'Public sources', 'External scientific and operational datasets.'],
              ['02', 'Python pipeline', 'Validation, transformation, and export.'],
              ['03', 'Web interface', 'Spatial, temporal, and comparative exploration.'],
            ].map(([number, title, description]) => (
              <div
                className="border-b border-sim-border py-5 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
                key={number}
              >
                <span className="mb-8 block text-xs font-bold text-sim-amber">
                  {number}
                </span>
                <strong className="mb-2 block text-base text-sim-text">
                  {title}
                </strong>
                <p className="text-xs text-sim-muted">{description}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  )
}