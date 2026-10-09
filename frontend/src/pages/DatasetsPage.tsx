import { Panel } from '../components/ui/Panel'
import { StatusBadge } from '../components/ui/StatusBadge'

const datasets = [
  ['Biodiversity', 'OBIS', 'Marine species occurrences', 'Foundation source', 'active'],
  ['Fish populations', 'DATRAS', 'Marine survey observations', 'Planned', 'planned'],
  ['Animal movement', 'Movebank', 'Tagged-animal movement data', 'Planned', 'planned'],
  ['Fishing activity', 'Global Fishing Watch', 'Vessel activity and fishing effort', 'Planned', 'planned'],
  ['Ocean conditions', 'OceanSITES', 'Fixed-site ocean observations', 'Planned', 'planned'],
]

export function DatasetsPage() {
  return (
    <div>
      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] py-20 sm:w-[calc(100%-48px)] sm:py-28">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
            Data catalogue
          </p>
          <StatusBadge>Registry view</StatusBadge>
        </div>

        <h1 className="mb-6 text-6xl leading-[0.92] text-sim-text sm:text-8xl">
          Dataset registry.
        </h1>

        <p className="max-w-2xl text-base text-sim-muted">
          A transparent catalogue of the public sources that will feed
          Simulativ’s first domain.
        </p>
      </section>

      <section className="mx-auto w-[calc(100%-32px)] max-w-[1180px] pb-28 sm:w-[calc(100%-48px)]">
        <Panel>
          <div className="mb-6 flex items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sim-cyan">
                Ocean systems / initial sources
              </p>
              <h2 className="text-3xl text-sim-text">Source map</h2>
            </div>
            <StatusBadge tone="planned">Pipeline not connected</StatusBadge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr>
                  {['Category', 'Source', 'Role in Simulativ', 'Status'].map(
                    (heading) => (
                      <th
                        className="border-y border-sim-border px-3 py-3 text-[10px] uppercase tracking-[0.12em] text-sim-faint first:pl-0 last:pr-0"
                        key={heading}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {datasets.map(
                  ([category, source, role, status, tone]) => (
                    <tr key={source}>
                      <td className="border-b border-sim-border px-3 py-4 text-xs text-sim-muted first:pl-0">
                        {category}
                      </td>
                      <td className="border-b border-sim-border px-3 py-4 text-xs font-bold text-sim-cyan">
                        {source}
                      </td>
                      <td className="border-b border-sim-border px-3 py-4 text-xs text-sim-muted">
                        {role}
                      </td>
                      <td className="border-b border-sim-border px-3 py-4 last:pr-0">
                        <StatusBadge tone={tone as 'active' | 'planned'}>
                          {status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </div>
  )
}